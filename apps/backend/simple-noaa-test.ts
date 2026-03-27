import { NoaaService } from './src/storms/noaa.service';

async function testNoaaService() {
  // Create a simple instance of the NOAA service
  // Note: This won't work fully since it needs dependencies
  console.log('Testing NOAA service...');
  
  // For now, let's just test the mock response
  const noaaService = new NoaaService(null, null, null);
  
  try {
    console.log('Calling mock NOAA response...');
    // This will fail because we're not properly instantiating the service
    // But let's see what happens
    // const result = await noaaService.syncStormEvents();
    // console.log('Sync result:', result);
    console.log('Mock test completed');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testNoaaService();