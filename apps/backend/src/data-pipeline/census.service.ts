import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * US Census Bureau API Service
 *
 * Provides access to:
 * - ACS 5-Year estimates (demographics, income, home values)
 * - Census Geocoder (address → lat/lon + FIPS codes)
 *
 * All free, API key recommended but not required for low volume.
 */
@Injectable()
export class CensusService {
  private readonly logger = new Logger(CensusService.name);
  private readonly ACS_BASE = 'https://api.census.gov/data/2023/acs/acs5';
  private readonly GEOCODER_BASE = 'https://geocoding.geo.census.gov/geocoder';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Geocode a single address to lat/lon + census geography
   */
  async geocodeAddress(address: string, city: string, state: string, zip?: string): Promise<{
    lat: number;
    lon: number;
    censusTract: string | null;
    censusBlockGroup: string | null;
    countyFips: string | null;
    stateFips: string | null;
    matchedAddress: string | null;
  } | null> {
    try {
      const params = new URLSearchParams({
        street: address,
        city,
        state,
        benchmark: 'Public_AR_Current',
        vintage: 'Current_Current',
        format: 'json',
      });
      if (zip) params.set('zip', zip);

      const url = `${this.GEOCODER_BASE}/geographies/address?${params}`;
      const response = await firstValueFrom(
        this.httpService.get(url, { timeout: 15000 })
      );

      const result = response.data?.result;
      if (!result?.addressMatches?.length) {
        return null;
      }

      const match = result.addressMatches[0];
      const geographies = match.geographies;
      const tract = geographies?.['Census Tracts']?.[0];
      const blockGroup = geographies?.['Census Block Groups']?.[0];

      return {
        lat: parseFloat(match.coordinates.y),
        lon: parseFloat(match.coordinates.x),
        censusTract: tract?.TRACT || null,
        censusBlockGroup: blockGroup?.BLKGRP || null,
        countyFips: tract?.COUNTY || null,
        stateFips: tract?.STATE || null,
        matchedAddress: match.matchedAddress || null,
      };
    } catch (error) {
      this.logger.warn(`Geocode failed for ${address}, ${city}, ${state}: ${error.message}`);
      return null;
    }
  }

  /**
   * Fetch ACS demographic data for a census tract
   *
   * Key variables:
   * B19013_001E - Median household income
   * B25077_001E - Median home value
   * B25003_001E - Total housing units (tenure)
   * B25003_002E - Owner-occupied units
   * B01002_001E - Median age
   * B25035_001E - Median year structure built
   * B25024_001E - Total units in structure
   */
  async getTractDemographics(stateFips: string, countyFips: string, tract: string): Promise<{
    medianHouseholdIncome: number | null;
    medianHomeValue: number | null;
    homeownershipRate: number | null;
    medianAge: number | null;
    medianYearBuilt: number | null;
    totalHousingUnits: number | null;
  } | null> {
    try {
      const variables = [
        'B19013_001E', // median income
        'B25077_001E', // median home value
        'B25003_001E', // total tenure units
        'B25003_002E', // owner-occupied
        'B01002_001E', // median age
        'B25035_001E', // median year built
      ].join(',');

      const url = `${this.ACS_BASE}?get=${variables}&for=tract:${tract}&in=state:${stateFips}+county:${countyFips}`;

      const response = await firstValueFrom(
        this.httpService.get(url, { timeout: 15000 })
      );

      const data = response.data;
      if (!data || data.length < 2) return null;

      // First row is headers, second row is data
      const headers = data[0] as string[];
      const values = data[1] as string[];

      const getValue = (varName: string): number | null => {
        const idx = headers.indexOf(varName);
        if (idx === -1) return null;
        const val = parseFloat(values[idx]);
        return isNaN(val) || val < 0 ? null : val;
      };

      const totalUnits = getValue('B25003_001E');
      const ownerOccupied = getValue('B25003_002E');
      const homeownershipRate = totalUnits && ownerOccupied
        ? Math.round((ownerOccupied / totalUnits) * 100) / 100
        : null;

      return {
        medianHouseholdIncome: getValue('B19013_001E'),
        medianHomeValue: getValue('B25077_001E'),
        homeownershipRate,
        medianAge: getValue('B01002_001E'),
        medianYearBuilt: getValue('B25035_001E'),
        totalHousingUnits: totalUnits ? Math.round(totalUnits) : null,
      };
    } catch (error) {
      this.logger.warn(`ACS fetch failed for tract ${tract}: ${error.message}`);
      return null;
    }
  }

  /**
   * Batch geocode addresses (Census supports up to 10,000 per batch)
   * Returns array of results matching input order
   */
  async batchGeocode(addresses: Array<{
    id: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  }>): Promise<Array<{
    id: string;
    lat: number | null;
    lon: number | null;
    censusTract: string | null;
    matched: boolean;
  }>> {
    if (addresses.length === 0) return [];

    // Census batch geocoder uses CSV format
    const csvLines = addresses.map((a, i) =>
      `${a.id},${a.address},${a.city},${a.state},${a.zip}`
    );
    const csvContent = csvLines.join('\n');

    try {
      const formData = new URLSearchParams();
      formData.append('benchmark', 'Public_AR_Current');
      formData.append('vintage', 'Current_Current');

      const url = `${this.GEOCODER_BASE}/geographies/addressbatch`;

      // For batch, we need multipart form upload
      // The Census API expects a file upload, which is complex with axios
      // Fall back to individual geocoding for now
      this.logger.log(`Batch geocoding ${addresses.length} addresses individually`);

      const results = [];
      for (const addr of addresses) {
        const result = await this.geocodeAddress(addr.address, addr.city, addr.state, addr.zip);
        results.push({
          id: addr.id,
          lat: result?.lat || null,
          lon: result?.lon || null,
          censusTract: result?.censusTract || null,
          matched: !!result,
        });
        // Rate limit: ~1 req/sec to be respectful
        await new Promise(r => setTimeout(r, 1000));
      }

      return results;
    } catch (error) {
      this.logger.error(`Batch geocode failed: ${error.message}`);
      return addresses.map(a => ({
        id: a.id,
        lat: null,
        lon: null,
        censusTract: null,
        matched: false,
      }));
    }
  }
}
