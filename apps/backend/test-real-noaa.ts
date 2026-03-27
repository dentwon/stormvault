import { NestFactory } from '@nestjs/core';
import { StormsModule } from './src/storms/storms.module';
import { NoaaService } from './src/storms/noaa.service';
import { INestApplicationContext } from '@nestjs/common';

async function testRealNoaa() {
  console.log('Testing real NOAA data fetch...');
  
  try {
    // Import the module dynamically
    const module = await NestFactory.createApplicationContext(StormsModule);
    const noaaService = module.get(NoaaService);
    
    console.log('Fetching recent storm data...');
    const stormEvents = await noaaService.fetchStormEvents({
      year: 2025, // Most recent complete year
      limit: 5, // Just a few for testing
    });
    
    console.log(`Successfully fetched ${stormEvents.length} storm events:`);
    stormEvents.forEach(event => {
      console.log(`- ${event.eventType} in ${event.city}, ${event.state} on ${event.beginDate}`);
    });
    
    await module.close();
  } catch (error) {
    console.error('Error fetching NOAA data:', error.message);
    console.error(error.stack);
  }
}

testRealNoaa();