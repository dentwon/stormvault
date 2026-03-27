import axios from 'axios';
import * as zlib from 'zlib';
import * as csv from 'csv-parser';
import * as stream from 'stream';

async function testNoaaDirect() {
  console.log('Testing direct NOAA data fetch...');
  
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
    
    console.log('Parsing CSV data...');
    
    // Parse just the first few lines to test
    const lines = csvData.split('\n').slice(0, 10); // Just header + first few rows
    const sampleCsv = lines.join('\n');
    
    // Parse the CSV data
    const results: any[] = [];
    let count = 0;
    
    const parser = csv({
      separator: ',',
    });
    
    const readable = new stream.Readable();
    readable.push(sampleCsv);
    readable.push(null);
    
    await new Promise<void>((resolve, reject) => {
      readable
        .pipe(parser)
        .on('data', (data) => {
          if (count < 5) { // Only show first 5 records
            console.log(`Event: ${data.EVENT_TYPE} in ${data.STATE}, ${data.CZ_NAME}`);
            console.log(`  Date: ${data.BEGIN_DATE_TIME || data.BEGIN_DATE}`);
            console.log(`  Magnitude: ${data.MAGNITUDE}`);
            console.log('');
            count++;
          }
          results.push(data);
        })
        .on('end', () => {
          console.log(`Parsed ${results.length} records from NOAA data`);
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });
    
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Error fetching NOAA data:', error.message);
    console.error(error.stack);
  }
}

testNoaaDirect();