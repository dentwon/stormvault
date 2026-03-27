import { PrismaClient } from '@prisma/client';
import { StormEvent } from '@prisma/client';

async function testDirectSync() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing direct storm data insertion...');
    
    // Sample storm events (similar to our mock data)
    const stormEvents = [
      {
        eventId: 'DIRECT001',
        eventType: 'Hail',
        beginDate: '2026-03-20',
        endDate: '2026-03-20',
        state: 'TX',
        county: 'Dallas',
        city: 'Dallas',
        latitude: 32.7767,
        longitude: -96.7970,
        magnitude: 1.5,
        eventNarrative: 'Large hail reported in downtown Dallas area.',
      },
      {
        eventId: 'DIRECT002',
        eventType: 'Thunderstorm Wind',
        beginDate: '2026-03-18',
        endDate: '2026-03-18',
        state: 'TX',
        county: 'Collin',
        city: 'McKinney',
        latitude: 33.1972,
        longitude: -96.6398,
        magnitude: 0.8,
        eventNarrative: 'Wind gusts caused minor property damage.',
      }
    ];
    
    // Insert the storm events directly into the database
    for (const event of stormEvents) {
      try {
        // Check if this storm already exists
        const existing = await prisma.stormEvent.findFirst({
          where: {
            sourceId: event.eventId,
            source: 'DIRECT_TEST',
          },
        });
        
        if (existing) {
          console.log(`Storm event ${event.eventId} already exists, skipping...`);
          continue;
        }
        
        // Create the storm event
        // Map event types to StormType enum values
        let stormType: any;
        switch (event.eventType.toLowerCase()) {
          case 'hail':
            stormType = 'HAIL';
            break;
          case 'tornado':
            stormType = 'TORNADO';
            break;
          case 'thunderstorm wind':
          case 'wind':
          case 'high wind':
            stormType = 'WIND';
            break;
          case 'flood':
          case 'flash flood':
          case 'coastal flood':
          case 'lakeshore flood':
          case 'storm surge/tide':
            stormType = 'FLOOD';
            break;
          default:
            stormType = 'OTHER';
        }

        const storm = await prisma.stormEvent.create({
          data: {
            type: stormType,
            severity: event.magnitude >= 2.0 ? 'EXTREME' : 
                     event.magnitude >= 1.0 ? 'SEVERE' : 
                     event.magnitude >= 0.5 ? 'MODERATE' : 'LIGHT',
            date: new Date(event.beginDate),
            endDate: event.endDate ? new Date(event.endDate) : null,
            city: event.city,
            county: event.county,
            state: event.state,
            description: event.eventNarrative,
            source: 'DIRECT_TEST',
            sourceId: event.eventId,
            geom: event.latitude && event.longitude ? 
                  { lat: event.latitude, lon: event.longitude } : undefined,
          },
        });
        
        console.log(`Created storm event: ${storm.id}`);
      } catch (error) {
        console.error(`Failed to create storm event ${event.eventId}:`, error.message);
      }
    }
    
    // Verify the data was inserted
    const count = await prisma.stormEvent.count();
    console.log(`Total storm events in database: ${count}`);
    
    // Get the latest storm events
    const latestStorms = await prisma.stormEvent.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
    
    console.log('Latest storm events:');
    latestStorms.forEach(storm => {
      console.log(`- ${storm.type} in ${storm.city}, ${storm.state} on ${storm.date}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDirectSync();