import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * FEMA Open Data Service
 *
 * Provides access to:
 * - National Risk Index (NRI) - hazard risk scores by census tract
 * - Disaster Declarations - active disaster areas
 *
 * All free, no API key required.
 */
@Injectable()
export class FemaService {
  private readonly logger = new Logger(FemaService.name);
  private readonly OPENFEMA_BASE = 'https://www.fema.gov/api/open/v2';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Get active disaster declarations for a state
   * Useful for identifying areas where insurance claims are more likely to succeed
   */
  async getActiveDisasters(state: string): Promise<Array<{
    disasterNumber: number;
    declarationTitle: string;
    declarationType: string;
    declarationDate: string;
    incidentType: string;
    designatedArea: string;
    closeoutDate: string | null;
  }>> {
    try {
      // Filter for open disasters in the given state
      const url = `${this.OPENFEMA_BASE}/DisasterDeclarationsSummaries?$filter=state eq '${state}' and closeoutDate eq null&$orderby=declarationDate desc&$top=50`;

      const response = await firstValueFrom(
        this.httpService.get(url, { timeout: 30000 })
      );

      const declarations = response.data?.DisasterDeclarationsSummaries || [];

      return declarations.map((d: any) => ({
        disasterNumber: d.disasterNumber,
        declarationTitle: d.declarationTitle,
        declarationType: d.declarationType,
        declarationDate: d.declarationDate,
        incidentType: d.incidentType,
        designatedArea: d.designatedArea,
        closeoutDate: d.closeoutDate,
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch FEMA disasters for ${state}: ${error.message}`);
      return [];
    }
  }

  /**
   * Get disaster declarations for a specific county
   */
  async getCountyDisasters(state: string, county: string): Promise<Array<{
    disasterNumber: number;
    declarationTitle: string;
    incidentType: string;
    declarationDate: string;
  }>> {
    try {
      const url = `${this.OPENFEMA_BASE}/DisasterDeclarationsSummaries?$filter=state eq '${state}' and designatedArea eq '${county} (County)'&$orderby=declarationDate desc&$top=20`;

      const response = await firstValueFrom(
        this.httpService.get(url, { timeout: 30000 })
      );

      const declarations = response.data?.DisasterDeclarationsSummaries || [];

      return declarations.map((d: any) => ({
        disasterNumber: d.disasterNumber,
        declarationTitle: d.declarationTitle,
        incidentType: d.incidentType,
        declarationDate: d.declarationDate,
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch FEMA disasters for ${county}, ${state}: ${error.message}`);
      return [];
    }
  }

  /**
   * Check if an area has active disaster declarations (useful for insurance claim timing)
   */
  async hasActiveDisaster(state: string, county?: string): Promise<boolean> {
    const disasters = county
      ? await this.getCountyDisasters(state, county)
      : await this.getActiveDisasters(state);

    // Check if any recent disasters (last 2 years) exist
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    return disasters.some(d => new Date(d.declarationDate) >= twoYearsAgo);
  }

  /**
   * Get FEMA NFIP (flood insurance) policy data summary for a state
   * Useful for understanding insurance penetration in an area
   */
  async getFloodPolicySummary(state: string): Promise<{
    totalPolicies: number;
    totalCoverage: number;
  } | null> {
    try {
      const url = `${this.OPENFEMA_BASE}/FimaNfipPolicies?$filter=propertyState eq '${state}'&$select=totalInsurancePremiumOfThePolicy,totalBuildingInsuranceCoverage&$top=1&$inlinecount=allpages`;

      const response = await firstValueFrom(
        this.httpService.get(url, { timeout: 30000 })
      );

      return {
        totalPolicies: response.data?.metadata?.count || 0,
        totalCoverage: 0, // Would need aggregation
      };
    } catch (error) {
      this.logger.warn(`Failed to fetch FEMA flood policy data for ${state}: ${error.message}`);
      return null;
    }
  }
}
