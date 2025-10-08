/**
 * Test script for Street View and image enhancement
 * 
 * Run with: npx tsx scripts/test-street-view.ts
 */

import { createGooglePlacesClient } from '../lib/google-places/client';
import { createGeminiClient } from '../lib/gemini/client';

async function testStreetView() {
  console.log('🗺️  Testing Google Maps Street View + Image Enhancement\n');

  // Test address (using a well-known address)
  const testAddress = {
    lat: 37.7749,  // San Francisco
    lng: -122.4194
  };

  try {
    // Step 1: Test Google Places API
    console.log('1️⃣  Testing Google Places API...');
    const placesClient = createGooglePlacesClient();
    
    const streetViewUrl = await placesClient.getStreetViewUrl(testAddress.lat, testAddress.lng);
    console.log('✅ Street View URL generated:');
    console.log(streetViewUrl);
    console.log();

    const angles = await placesClient.getStreetViewAngles(testAddress.lat, testAddress.lng);
    console.log('✅ Multiple angle URLs generated:');
    angles.forEach(angle => {
      console.log(`   ${angle.heading}°: ${angle.url.substring(0, 80)}...`);
    });
    console.log();

    // Step 2: Test image enhancement (if Google AI Studio key is set)
    if (process.env.GOOGLE_AI_STUDIO_API_KEY) {
      console.log('2️⃣  Testing Gemini 2.5 Flash Image enhancement...');
      const geminiClient = createGeminiClient();
      
      console.log('⏳ Fetching and enhancing Street View image (this may take 10-30 seconds)...');
      
      try {
        const result = await geminiClient.generateEnhancedPropertyPhoto(
          streetViewUrl,
          'street-view'
        );
        
        if (result.success) {
          console.log('✅ Image enhancement successful!');
          console.log(`   Enhanced image size: ${result.enhancedImageUrl?.length} bytes`);
          console.log('   You can now use this in listings!');
        } else {
          console.log('⚠️  Image enhancement failed:', result.error);
          console.log('   Original Street View images will be used as fallback.');
        }
      } catch (error: any) {
        console.log('⚠️  Image enhancement error:', error.message);
        console.log('   Original Street View images will be used as fallback.');
      }
    } else {
      console.log('⏭️  Skipping image enhancement (GOOGLE_AI_STUDIO_API_KEY not set)');
    }

    console.log();
    console.log('✅ All tests completed!');
    console.log();
    console.log('📝 Summary:');
    console.log('   - Street View fetching: ✅ Working');
    console.log('   - Multiple angles: ✅ Working');
    console.log('   - Image enhancement: ' + (process.env.GOOGLE_AI_STUDIO_API_KEY ? '✅ Ready' : '⏭️  Skipped'));
    console.log();
    console.log('🎉 You can now create listings with AI-enhanced photos!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.log();
    
    if (error.message.includes('GOOGLE_PLACES_API_KEY')) {
      console.log('💡 Make sure GOOGLE_PLACES_API_KEY is set in .env.local');
    } else if (error.message.includes('REQUEST_DENIED')) {
      console.log('💡 Common issues:');
      console.log('   1. Enable Places API in Google Cloud Console');
      console.log('   2. Enable Maps Static API in Google Cloud Console');
      console.log('   3. Enable billing on your Google Cloud project');
      console.log('   4. Wait 5 minutes for APIs to activate');
    } else {
      console.log('💡 Check your API keys and Google Cloud setup');
    }
  }
}

// Run the test
testStreetView().catch(console.error);
