/**
 * Test Google Maps API key access from server-side
 * Run with: npx tsx scripts/test-google-maps-key.ts
 */

async function testGoogleMapsKey() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GOOGLE_PLACES_API_KEY not found in environment');
    return;
  }
  
  console.log('🔑 API Key found:', apiKey.substring(0, 10) + '...');
  console.log();
  
  // Test address for Martville, NY
  const lat = 43.2873;
  const lng = -76.3655;
  
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=400x400&location=${lat},${lng}&key=${apiKey}`;
  
  console.log('📸 Testing Street View Static API...');
  console.log('URL:', streetViewUrl);
  console.log();
  
  try {
    const response = await fetch(streetViewUrl);
    
    console.log('Status:', response.status, response.statusText);
    console.log('Content-Type:', response.headers.get('content-type'));
    console.log();
    
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      console.log('✅ SUCCESS! Image fetched:', buffer.byteLength, 'bytes');
      console.log();
      console.log('✨ Your API key works perfectly from server-side!');
    } else {
      const text = await response.text();
      console.error('❌ FAILED:', response.status);
      console.error();
      console.error('Response body:', text.substring(0, 500));
      console.error();
      
      if (response.status === 403) {
        console.error('🔧 How to fix:');
        console.error('1. Go to: https://console.cloud.google.com/apis/credentials');
        console.error('2. Find your API key');
        console.error('3. Click on it to edit');
        console.error('4. Under "Application restrictions":');
        console.error('   - Select "None" (for development)');
        console.error('   - OR select "IP addresses" and add: 0.0.0.0/0 (allow all)');
        console.error('5. Under "API restrictions":');
        console.error('   - Ensure "Maps Static API" is enabled');
        console.error('   - Ensure "Street View Static API" is enabled');
        console.error('6. Save and wait 1-2 minutes');
        console.error();
      } else if (response.status === 400) {
        console.error('🔧 Bad Request - Check if APIs are enabled:');
        console.error('1. Go to: https://console.cloud.google.com/apis/library');
        console.error('2. Search for "Street View Static API"');
        console.error('3. Click and ensure it says "API Enabled"');
        console.error('4. Also enable "Maps Static API"');
      }
    }
  } catch (error: any) {
    console.error('❌ Network error:', error.message);
  }
}

testGoogleMapsKey();
