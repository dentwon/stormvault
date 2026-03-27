import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

/**
 * Canvassing List Generator
 *
 * THE killer feature: After a storm, generate an optimized
 * door-knocking list sorted by lead score and proximity.
 * This is what roofers will pay $49/mo for.
 */
@Injectable()
export class CanvassingService {
  private readonly logger = new Logger(CanvassingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate a canvassing list for a storm event
   *
   * Returns an ordered list of addresses optimized for door-knocking:
   * - Sorted by score (highest first) then by proximity
   * - Includes property details, roof age, estimated job value
   * - Ready for mobile display or print
   */
  async generateList(params: {
    orgId: string;
    stormId?: string;
    lat?: number;
    lon?: number;
    radiusKm?: number;
    limit?: number;
    minScore?: number;
    status?: string;
  }): Promise<{
    list: CanvassingItem[];
    meta: {
      total: number;
      stormInfo: any;
      generatedAt: string;
    };
  }> {
    const { orgId, stormId, lat, lon, radiusKm = 15, limit = 50, minScore = 0, status } = params;

    let centerLat = lat;
    let centerLon = lon;
    let stormInfo: any = null;

    // If stormId provided, use storm coordinates as center
    if (stormId) {
      const storm = await this.prisma.stormEvent.findUnique({ where: { id: stormId } });
      if (storm) {
        const geom = storm.geom as { lat?: number; lon?: number } | null;
        centerLat = geom?.lat;
        centerLon = geom?.lon;
        stormInfo = {
          id: storm.id,
          type: storm.type,
          severity: storm.severity,
          date: storm.date,
          city: storm.city,
          county: storm.county,
        };
      }
    }

    if (!centerLat || !centerLon) {
      return { list: [], meta: { total: 0, stormInfo, generatedAt: new Date().toISOString() } };
    }

    // Find leads in the area with their properties and enrichment data
    const latDelta = radiusKm / 111;
    const lonDelta = radiusKm / 85;

    const whereClause: any = {
      orgId,
      score: { gte: minScore },
      property: {
        lat: { gte: centerLat - latDelta, lte: centerLat + latDelta },
        lon: { gte: centerLon - lonDelta, lte: centerLon + lonDelta },
      },
    };

    if (status) {
      whereClause.status = status;
    }

    const leads = await this.prisma.lead.findMany({
      where: whereClause,
      include: {
        property: {
          include: {
            enrichment: true,
            propertyStorms: {
              where: stormId ? { stormEventId: stormId } : {},
              include: { stormEvent: true },
              take: 3,
            },
          },
        },
        assignee: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: [
        { score: 'desc' },
        { priority: 'desc' },
      ],
      take: limit,
    });

    // Build canvassing items with computed fields
    const items: CanvassingItem[] = leads
      .filter(lead => lead.property?.lat && lead.property?.lon)
      .map((lead, index) => {
        const property = lead.property!;
        const enrichment = property.enrichment;
        const distance = this.haversineDistance(
          centerLat!, centerLon!,
          property.lat!, property.lon!,
        );

        // Estimate roof age
        let roofAge: number | null = property.roofAge;
        if (!roofAge && property.yearBuilt) {
          roofAge = new Date().getFullYear() - property.yearBuilt;
        }

        return {
          order: index + 1,
          leadId: lead.id,
          score: lead.score,
          priority: lead.priority,
          status: lead.status,

          // Contact info
          firstName: lead.firstName,
          lastName: lead.lastName,
          phone: lead.phone,
          email: lead.email,

          // Property info
          address: property.address,
          city: property.city,
          state: property.state,
          zip: property.zip,
          lat: property.lat,
          lon: property.lon,

          // Roof & value
          yearBuilt: property.yearBuilt,
          roofAge,
          roofMaterial: property.roofMaterial,
          estimatedRoofSqft: enrichment?.estimatedRoofSqft || null,
          estimatedJobValue: enrichment?.estimatedJobValue || null,

          // Area context
          medianHomeValue: enrichment?.medianHomeValue || null,
          homeownershipRate: enrichment?.homeownershipRate || null,
          ownerName: enrichment?.ownerName || null,

          // Storm context
          distanceFromStormKm: Math.round(distance / 100) / 10, // round to 0.1km
          stormSeverity: lead.property?.propertyStorms?.[0]?.stormEvent?.severity || null,

          // Assignment
          assignee: lead.assignee
            ? `${lead.assignee.firstName || ''} ${lead.assignee.lastName || ''}`.trim()
            : null,

          notes: lead.notes,
        };
      });

    // Sort by: score desc, then distance asc (nearest first for same score)
    items.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.distanceFromStormKm - b.distanceFromStormKm;
    });

    // Re-number after sort
    items.forEach((item, i) => { item.order = i + 1; });

    return {
      list: items,
      meta: {
        total: items.length,
        stormInfo,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Haversine distance in meters
   */
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}

export interface CanvassingItem {
  order: number;
  leadId: string;
  score: number;
  priority: string;
  status: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number | null;
  lon: number | null;
  yearBuilt: number | null;
  roofAge: number | null;
  roofMaterial: string | null;
  estimatedRoofSqft: number | null;
  estimatedJobValue: number | null;
  medianHomeValue: number | null;
  homeownershipRate: number | null;
  ownerName: string | null;
  distanceFromStormKm: number;
  stormSeverity: string | null;
  assignee: string | null;
  notes: string | null;
}
