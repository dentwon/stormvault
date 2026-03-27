import { NestFactory } from '@nestjs/core';
import { StormsModule } from './src/storms/storms.module';
import { NoaaService } from './src/storms/noaa.service';
import { INestApplicationContext } from '@nestjs/common';

async function testNoaaSync() {
  // Create a standalone NestJS application with just the storms module
  const app: INestApplicationContext = await NestFactory.createApplicationContext(StormsModule);
  
  // Get the NOAA service
  const noaaService = app.get(NoaaService);
  
  try {
    console.log('Testing NOAA storm data sync...');
    const result = await noaaService.syncStormEvents();
    console.log('Sync result:', result);
  } catch (error) {
    console.error('Error syncing storm data:', error);
  } finally {
    await app.close();
  }
}

testNoaaSync();