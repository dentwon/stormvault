import axios from 'axios';
import * as zlib from 'zlib';

async function testNoaaSimple() {
  console.log('Testing simple NOAA data fetch...');
  
  try {
    const year = 2025;
    const url = `https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/StormEvents_details-ftp_v1.0_d${year}_c20260323.csv.gz`;
    
    console.log(`Downloading NOAA storm data from: ${url}`);
    
    // Download the file
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    console.log('Download completed, decompressing...');
    
    // Decompress the gzipped data
    const decompressed = zlib.gunzipSync(response.data);
    const csvData = decompressed.toString('utf8');
    
    console.log('First 1000 characters of CSV data:');
    console.log(csvData.substring(0, 1000));
    
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Error fetching NOAA data:', error.message);
  }
}

testNoaaSimple();