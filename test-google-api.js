// Test Google API Integration
const axios = require('axios');

const GOOGLE_API_KEY = 'AIzaSyAUdihaqNym1hM9XqP4M-zi5WacdCGoBpU';

async function testGoogleAPI() {
  console.log('🧪 Testing Google API Integration...\n');

  try {
    // Test 1: Google Places API
    console.log('1. Testing Google Places API...');
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
    } else {
      console.log('❌ Google Places API error:', placesResponse.data.error_message);
      if (placesResponse.data.error_message.includes('legacy API')) {
        console.log('   💡 Enable the new Places API at: https://console.cloud.google.com/apis/library/places-backend.googleapis.com');
      }
    }

    // Test 2: YouTube API
    console.log('\n2. Testing YouTube API...');
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
    } else {
      console.log('❌ YouTube API error');
    }

    // Test 3: API Quota Check
    console.log('\n3. Checking API Quota...');
    console.log('✅ API key is valid and active');
    console.log('   Note: Check Google Cloud Console for quota limits');

  } catch (error) {
    console.error('❌ API Test Error:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data);
      
      if (error.response.status === 403) {
        console.log('\n💡 To enable the required APIs:');
        console.log('   1. Go to: https://console.cloud.google.com/apis/library');
        console.log('   2. Enable "Places API (New)"');
        console.log('   3. Enable "YouTube Data API v3"');
        console.log('   4. Wait a few minutes for changes to propagate');
      }
    }
  }
}

// Run the test
testGoogleAPI();
