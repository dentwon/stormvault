import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NoaaService } from './noaa.service';

@Injectable()
export class StormsProcessor {
  private readonly logger = new Logger(StormsProcessor.name);

  constructor(private readonly noaaService: NoaaService) {}

  /**
   * Run every 6 hours to sync latest storm data from NOAA
   * In production, this should run more frequently during storm season
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async handleNoaaSync() {
    if (process.env.ENABLE_STORM_SYNC !== 'true') {
      this.logger.debug('Storm sync disabled by environment variable');
      return;
    }

    this.logger.log('Starting scheduled NOAA storm data sync...');
    
    try {
      const result = await this.noaaService.syncStormEvents();
      this.logger.log(`NOAA storm data sync completed: ${result.synced} events synced`);
    } catch (error) {
      this.logger.error('Failed to sync NOAA storm data', error.stack);
    }
  }

  /**
   * Run daily to sync comprehensive storm data
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleDailySync() {
    if (process.env.ENABLE_STORM_SYNC !== 'true') {
      this.logger.debug('Storm sync disabled by environment variable');
      return;
    }

    this.logger.log('Starting daily NOAA storm data sync...');
    
    try {
      // Fetch more comprehensive data for the past 90 days
      const result = await this.noaaService.syncStormEvents();
      this.logger.log(`Daily NOAA storm data sync completed: ${result.synced} events synced`);
    } catch (error) {
      this.logger.error('Failed to sync daily NOAA storm data', error.stack);
    }
  }
}