import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

/**
 * Lead Scoring Service
 *
 * Scores leads 0-100 based on how likely they are to convert
 * AND how profitable the job would be for the roofer.
 *
 * Factors (weighted):
 * - Roof age (30%): older roof = more likely needs replacement
 * - Storm severity (20%): worse storm = more likely insurance covers it
 * - Property value (20%): higher value = bigger job ticket
 * - Proximity to storm (15%): closer = more damage likely
 * - Homeownership rate (10%): renters don't hire roofers
 * - Storm recency (5%): more recent = more urgency
 */
@Injectable()
export class LeadScoringService {
  private readonly logger = new Logger(LeadScoringService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Score a single lead
   */
  async scoreLead(leadId: string): Promise<number> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        property: {
          include: {
            propertyStorms: {
              include: { stormEvent: true },
              orderBy: { stormEvent: { date: 'desc' } },
              take: 5,
            },
            enrichment: true,
          },
        },
      },
    });

    if (!lead) return 0;

    let score = 0;

    // 1. Roof Age Score (30 points max)
    score += this.scoreRoofAge(lead.property);

    // 2. Storm Severity Score (20 points max)
    score += this.scoreStormSeverity(lead.property?.propertyStorms || []);

    // 3. Property Value Score (20 points max)
    score += this.scorePropertyValue(lead.property?.enrichment);

    // 4. Proximity to Storm (15 points max)
    score += this.scoreProximity(lead.property?.propertyStorms || []);

    // 5. Homeownership Rate (10 points max)
    score += this.scoreHomeownership(lead.property?.enrichment);

    // 6. Storm Recency (5 points max)
    score += this.scoreRecency(lead.property?.propertyStorms || []);

    // Clamp to 0-100
    score = Math.max(0, Math.min(100, Math.round(score)));

    // Update the lead's score
    await this.prisma.lead.update({
      where: { id: leadId },
      data: { score },
    });

    return score;
  }

  /**
   * Re-score all leads for an organization
   */
  async scoreAllLeads(orgId: string): Promise<{ scored: number; avgScore: number }> {
    const leads = await this.prisma.lead.findMany({
      where: { orgId, status: { not: 'LOST' } },
      select: { id: true },
    });

    let totalScore = 0;
    let scored = 0;

    for (const lead of leads) {
      try {
        const score = await this.scoreLead(lead.id);
        totalScore += score;
        scored++;
      } catch (error) {
        this.logger.warn(`Failed to score lead ${lead.id}: ${error.message}`);
      }
    }

    const avgScore = scored > 0 ? Math.round(totalScore / scored) : 0;
    this.logger.log(`Scored ${scored} leads for org ${orgId}, avg score: ${avgScore}`);

    return { scored, avgScore };
  }

  // --- Scoring Functions ---

  private scoreRoofAge(property: any): number {
    if (!property) return 5; // default if no property data

    // Get roof age from property data
    let roofAge: number | null = property.roofAge;
    if (!roofAge && property.roofYear) {
      roofAge = new Date().getFullYear() - property.roofYear;
    }
    if (!roofAge && property.yearBuilt) {
      // Assume roof is original if no replacement data
      roofAge = new Date().getFullYear() - property.yearBuilt;
    }

    if (!roofAge) return 10; // unknown = moderate score

    // Older roofs score higher (more likely to need replacement)
    if (roofAge >= 25) return 30;
    if (roofAge >= 20) return 25;
    if (roofAge >= 15) return 20;
    if (roofAge >= 10) return 12;
    if (roofAge >= 5) return 5;
    return 2; // nearly new roof
  }

  private scoreStormSeverity(propertyStorms: any[]): number {
    if (!propertyStorms?.length) return 0;

    // Use the most severe recent storm
    const severities = propertyStorms.map(ps => ps.stormEvent?.severity).filter(Boolean);
    if (severities.length === 0) return 0;

    const severityScores: Record<string, number> = {
      EXTREME: 20,
      SEVERE: 16,
      MODERATE: 10,
      LIGHT: 4,
    };

    const maxSeverity = Math.max(...severities.map((s: string) => severityScores[s] || 0));
    return maxSeverity;
  }

  private scorePropertyValue(enrichment: any): number {
    if (!enrichment) return 10; // default moderate

    // Use median home value in the area as proxy
    const homeValue = enrichment.medianHomeValue || enrichment.assessedValue;
    if (!homeValue) return 10;

    // Higher value = bigger job = more score
    if (homeValue >= 400000) return 20;
    if (homeValue >= 300000) return 17;
    if (homeValue >= 200000) return 14;
    if (homeValue >= 150000) return 11;
    if (homeValue >= 100000) return 8;
    return 5;
  }

  private scoreProximity(propertyStorms: any[]): number {
    if (!propertyStorms?.length) return 0;

    // Use closest storm distance
    const distances = propertyStorms
      .map(ps => ps.distanceMeters)
      .filter((d: any) => d !== null && d !== undefined);

    if (distances.length === 0) return 8; // has storms linked but no distance data

    const minDistance = Math.min(...distances);

    // Convert meters to km
    const distKm = minDistance / 1000;

    if (distKm < 1) return 15;
    if (distKm < 5) return 12;
    if (distKm < 15) return 9;
    if (distKm < 30) return 6;
    return 3;
  }

  private scoreHomeownership(enrichment: any): number {
    if (!enrichment?.homeownershipRate) return 5; // default

    const rate = enrichment.homeownershipRate;

    // Higher homeownership = more potential customers
    if (rate >= 0.8) return 10;
    if (rate >= 0.65) return 8;
    if (rate >= 0.5) return 6;
    if (rate >= 0.35) return 4;
    return 2;
  }

  private scoreRecency(propertyStorms: any[]): number {
    if (!propertyStorms?.length) return 0;

    // Most recent storm date
    const dates = propertyStorms
      .map(ps => ps.stormEvent?.date)
      .filter(Boolean)
      .map((d: string) => new Date(d));

    if (dates.length === 0) return 0;

    const mostRecent = new Date(Math.max(...dates.map(d => d.getTime())));
    const daysSince = Math.floor((Date.now() - mostRecent.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSince <= 7) return 5;
    if (daysSince <= 30) return 4;
    if (daysSince <= 90) return 3;
    if (daysSince <= 180) return 2;
    return 1;
  }
}
