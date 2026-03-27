// Simple test to verify the mock NOAA response works
function mockNoaaResponse() {
  // Return sample storm events for testing
  return [
    {
      eventId: 'TEST001',
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
      eventId: 'TEST002',
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
    },
    {
      eventId: 'TEST003',
      eventType: 'Tornado',
      beginDate: '2026-03-15',
      endDate: '2026-03-15',
      state: 'OK',
      county: 'Oklahoma',
      city: 'Oklahoma City',
      latitude: 35.4676,
      longitude: -97.5164,
      magnitude: 2.5,
      eventNarrative: 'EF2 tornado touched down in suburban area.',
    },
  ];
}

console.log('Testing mock NOAA response...');
const mockData = mockNoaaResponse();
console.log('Mock data:', JSON.stringify(mockData, null, 2));
console.log('Test completed successfully!');