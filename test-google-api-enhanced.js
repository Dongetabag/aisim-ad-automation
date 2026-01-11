// Enhanced Google API Test with Continuous Monitoring
const axios = require('axios');

// SECURITY WARNING: Never hardcode API keys in source files!
// Use environment variables instead: process.env.GOOGLE_API_KEY
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'YOUR_API_KEY_HERE';

async function testGoogleAPI() {
  console.log('🧪 Testing Google API Integration...\n');

  let placesWorking = false;
  let youtubeWorking = false;

  try {
    // Test 1: Google Places API
    console.log('1. Testing Google Places API...');
    try {
      const placesResponse = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
        params: {
          query: 'restaurants in New York',
          key: GOOGLE_API_KEY,
          type: 'establishment'
        }
      });

      if (placesResponse.data.status === 'OK') {
        console.log('✅ Google Places API working');
        console.log(`   Found ${placesResponse.data.results.length} results`);
        console.log(`   First result: ${placesResponse.data.results[0]?.name}`);
        placesWorking = true;
      } else {
        console.log('❌ Google Places API error:', placesResponse.data.error_message);
        if (placesResponse.data.error_message.includes('legacy API')) {
          console.log('   💡 Enable the new Places API at: https://console.cloud.google.com/apis/library/places-backend.googleapis.com');
        }
      }
    } catch (error) {
      console.log('❌ Google Places API error:', error.response?.data?.error_message || error.message);
    }

    // Test 2: YouTube API
    console.log('\n2. Testing YouTube API...');
    try {
      const youtubeResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: 'marketing advertising',
          key: GOOGLE_API_KEY,
          maxResults: 3,
          type: 'video'
        }
      });

      if (youtubeResponse.data.items) {
        console.log('✅ YouTube API working');
        console.log(`   Found ${youtubeResponse.data.items.length} videos`);
        console.log(`   First video: ${youtubeResponse.data.items[0]?.snippet.title}`);
        youtubeWorking = true;
      } else {
        console.log('❌ YouTube API error');
      }
    } catch (error) {
      console.log('❌ YouTube API error:', error.response?.data?.error?.message || error.message);
    }

    // Summary
    console.log('\n📊 API Status Summary:');
    console.log('━'.repeat(40));
    console.log(`Google Places API: ${placesWorking ? '✅ WORKING' : '❌ NOT WORKING'}`);
    console.log(`YouTube Data API:  ${youtubeWorking ? '✅ WORKING' : '❌ NOT WORKING'}`);
    console.log('━'.repeat(40));

    if (placesWorking && youtubeWorking) {
      console.log('\n🎉 All APIs are working! Your AISim system is ready to use.');
      console.log('\n🚀 Next steps:');
      console.log('   1. Start the system: ./startup.sh');
      console.log('   2. Access frontend: http://localhost:3001');
      console.log('   3. Test lead generation with Google Places');
      console.log('   4. Test ad inspiration with YouTube');
    } else {
      console.log('\n⚠️  Some APIs are not working yet.');
      console.log('\n🔧 To fix:');
      console.log('   1. Go to: https://console.cloud.google.com/apis/library');
      console.log('   2. Enable "Places API (New)"');
      console.log('   3. Enable "YouTube Data API v3"');
      console.log('   4. Wait 2-3 minutes for changes to propagate');
      console.log('   5. Run this test again: node test-google-api-enhanced.js');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the test
testGoogleAPI();



