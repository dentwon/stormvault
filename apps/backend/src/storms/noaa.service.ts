import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { StormsService } from './storms.service';
import { firstValueFrom } from 'rxjs';
import * as zlib from 'zlib';
import * as csv from 'csv-parser';
import * as stream from 'stream';

@Injectable()
export class NoaaService {
  private readonly logger = new Logger(NoaaService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly stormsService: StormsService,
  ) {}

  /**
   * Fetch storm events from NOAA bulk data
   * 
   * NOAA Storm Events Database is available as free CSV files:
   * https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/
   */
  async fetchStormEvents(options: {
    year?: number;
    state?: string;
    eventType?: string;
    limit?: number;
  } = {}) {
    try {
      const {
        year = new Date().getFullYear(),
        state,
        eventType,
        limit = 1000,
      } = options;

      this.logger.log(`Fetching storm data from NOAA for year ${year}`);

      // Download the CSV file for the specified year
      const csvData = await this.downloadYearlyStormData(year);
      
      // Parse the CSV data
      const stormEvents = await this.parseStormEvents(csvData, state, eventType, limit);
      
      this.logger.log(`Parsed ${stormEvents.length} storm events from NOAA data for year ${year}`);
      return stormEvents;
    } catch (error) {
      this.logger.error('Failed to fetch storm data from NOAA', error.stack);
      throw error;
    }
  }

  /**
   * Download yearly storm data from NOAA
   */
  private async downloadYearlyStormData(year: number): Promise<string> {
    const url = `https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/StormEvents_details-ftp_v1.0_d${year}_c20260323.csv.gz`;
    
    this.logger.log(`Downloading NOAA storm data from: ${url}`);
    
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { responseType: 'arraybuffer' })
      );
      
      // Decompress the gzipped data
      const decompressed = zlib.gunzipSync(response.data);
      return decompressed.toString('utf8');
    } catch (error) {
      this.logger.error(`Failed to download NOAA data for year ${year}`, error.stack);
      throw error;
    }
  }

  /**
   * Parse storm events from CSV data
   */
  private async parseStormEvents(csvData: string, stateFilter?: string, eventTypeFilter?: string, limit?: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const parser = csv({
        separator: ',',
        skipLines: 1, // Skip header row
      });
      
      const readable = new stream.Readable();
      readable.push(csvData);
      readable.push(null);
      
      readable
        .pipe(parser)
        .on('data', (data) => {
          // Apply filters if specified
          if (stateFilter && data.STATE !== stateFilter) {
            return;
          }
          
          if (eventTypeFilter && data.EVENT_TYPE !== eventTypeFilter) {
            return;
          }
          
          // Only add if we haven't reached the limit
          if (!limit || results.length < limit) {
            results.push({
              eventId: data.EVENT_ID,
              eventType: data.EVENT_TYPE,
              beginDate: data.BEGIN_DATE_TIME ? data.BEGIN_DATE_TIME.split(' ')[0] : data.BEGIN_DATE,
              endDate: data.END_DATE_TIME ? data.END_DATE_TIME.split(' ')[0] : data.END_DATE,
              state: data.STATE,
              county: data.COUNTY_NAME,
              city: data.CZ_NAME,
              latitude: data.BEGIN_LAT ? parseFloat(data.BEGIN_LAT) : null,
              longitude: data.BEGIN_LON ? parseFloat(data.BEGIN_LON) : null,
              magnitude: data.MAGNITUDE ? parseFloat(data.MAGNITUDE) : 0,
              eventNarrative: data.EVENT_NARRATIVE || '',
              source: 'NOAA',
              sourceId: data.EVENT_ID,
            });
          }
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  /**
   * Sync storm events from NOAA to our database
   */
  async syncStormEvents() {
    try {
      this.logger.log('Starting NOAA storm data sync...');
      
      // Fetch recent storm events (use 2025 as the most recent complete year)
      const currentYear = 2025;
      const previousYear = 2024;
      
      let syncedCount = 0;
      let totalCount = 0;
      
      try {
        // Sync data for current year
        this.logger.log(`Fetching storm data for year: ${currentYear}`);
        const currentYearEvents = await this.fetchStormEvents({
          year: currentYear,
          limit: 500, // Limit to avoid overwhelming the system
        });
        
        totalCount += currentYearEvents.length;
        this.logger.log(`Processing ${currentYearEvents.length} storm events from ${currentYear}`);
        
        for (const event of currentYearEvents) {
          try {
            await this.stormsService.syncFromNOAA({
              type: this.mapEventType(event.eventType),
              severity: this.mapSeverity(event.magnitude),
              date: new Date(event.beginDate),
              city: event.city,
              county: event.county,
              state: event.state,
              description: event.eventNarrative,
              source: 'NOAA',
              sourceId: event.eventId,
              lat: event.latitude,
              lon: event.longitude,
            });
            syncedCount++;
          } catch (error) {
            this.logger.warn(`Failed to sync storm event ${event.eventId}: ${error.message}`);
          }
        }
      } catch (yearError) {
        this.logger.warn(`Failed to fetch data for ${currentYear}: ${yearError.message}`);
      }
      
      try {
        // Sync data for previous year (if needed)
        // Only sync a limited number from the previous year to avoid duplicates
        this.logger.log(`Fetching storm data for previous year: ${previousYear}`);
        const previousYearEvents = await this.fetchStormEvents({
          year: previousYear,
          limit: 100, // Limit to avoid overwhelming the system
        });
        
        totalCount += previousYearEvents.length;
        this.logger.log(`Processing ${previousYearEvents.length} storm events from ${previousYear}`);
        
        for (const event of previousYearEvents) {
          try {
            await this.stormsService.syncFromNOAA({
              type: this.mapEventType(event.eventType),
              severity: this.mapSeverity(event.magnitude),
              date: new Date(event.beginDate),
              city: event.city,
              county: event.county,
              state: event.state,
              description: event.eventNarrative,
              source: 'NOAA',
              sourceId: event.eventId,
              lat: event.latitude,
              lon: event.longitude,
            });
            syncedCount++;
          } catch (error) {
            this.logger.warn(`Failed to sync storm event ${event.eventId}: ${error.message}`);
          }
        }
      } catch (yearError) {
        this.logger.warn(`Failed to fetch data for ${previousYear}: ${yearError.message}`);
      }

      this.logger.log(`Successfully synced ${syncedCount} storm events from NOAA (${totalCount} total processed)`);
      return { synced: syncedCount, total: totalCount };
    } catch (error) {
      this.logger.error('Failed to sync storm events from NOAA', error.stack);
      throw error;
    }
  }

  /**
   * Map NOAA event types to our internal types
   */
  private mapEventType(noaaType: string): string {
    const typeMap: Record<string, string> = {
      'Thunderstorm Wind': 'WIND',
      'Hail': 'HAIL',
      'Tornado': 'TORNADO',
      'Flash Flood': 'FLOOD',
      'Flood': 'FLOOD',
      'Lightning': 'OTHER',
      'High Wind': 'WIND',
      'Winter Weather': 'OTHER',
      'Heavy Rain': 'FLOOD',
      'Astronomical Low Tide': 'OTHER',
      'Avalanche': 'OTHER',
      'Blizzard': 'OTHER',
      'Coastal Flood': 'FLOOD',
      'Cold/Wind Chill': 'OTHER',
      'Debris Flow': 'OTHER',
      'Dense Fog': 'OTHER',
      'Dense Smoke': 'OTHER',
      'Drought': 'OTHER',
      'Dust Devil': 'OTHER',
      'Dust Storm': 'WIND',
      'Excessive Heat': 'OTHER',
      'Extreme Cold/Wind Chill': 'OTHER',
      'Fire': 'OTHER',
      'Freezing Fog': 'OTHER',
      'Funnel Cloud': 'OTHER',
      'Heat': 'OTHER',
      'Heavy Snow': 'OTHER',
      'Ice Storm': 'OTHER',
      'Lakeshore Flood': 'FLOOD',
      'Marine Cold/Wind Chill': 'OTHER',
      'Marine Dense Fog': 'OTHER',
      'Marine Dense Smoke': 'OTHER',
      'Marine Extreme Cold/Wind Chill': 'OTHER',
      'Marine Extreme Heat': 'OTHER',
      'Marine Freeze': 'OTHER',
      'Marine Frost/Freeze': 'OTHER',
      'Marine Hail': 'HAIL',
      'Marine Heavy Fog': 'OTHER',
      'Marine High Surf': 'OTHER',
      'Marine High Wind': 'WIND',
      'Marine Hurricane/Typhoon': 'HURRICANE',
      'Marine Ice': 'OTHER',
      'Marine Lightning': 'OTHER',
      'Marine Rip Current': 'OTHER',
      'Marine Seiche': 'OTHER',
      'Marine Snow': 'OTHER',
      'Marine Strong Wind': 'WIND',
      'Marine Thunderstorm Wind': 'WIND',
      'Marine Tropical Depression': 'OTHER',
      'Marine Tropical Storm': 'OTHER',
      'Rip Current': 'OTHER',
      'Seiche': 'OTHER',
      'Sleet': 'OTHER',
      'Storm Surge/Tide': 'FLOOD',
      'Strong Wind': 'WIND',
      'Summary': 'OTHER',
      'Tropical Depression': 'OTHER',
      'Tropical Storm': 'OTHER',
      'Waterspout': 'OTHER',
    };

    return typeMap[noaaType] || 'OTHER';
  }

  /**
   * Map magnitude/severity to our internal severity levels
   */
  private mapSeverity(magnitude: number): string {
    if (magnitude >= 2.0) return 'EXTREME';
    if (magnitude >= 1.0) return 'SEVERE';
    if (magnitude >= 0.5) return 'MODERATE';
    return 'LIGHT';
  }
}