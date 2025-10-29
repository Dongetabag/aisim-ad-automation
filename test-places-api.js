// Test Places API (New) specifically
const axios = require('axios');

const GOOGLE_API_KEY = 'AIzaSyAUdihaqNym1hM9XqP4M-zi5WacdCGoBpU';

async function testPlacesAPI() {
  console.log('🧪 Testing Places API (New) specifically...\n');

  try {
    // Test 1: Try the new Places API endpoint
    console.log('1. Testing Places API (New) endpoint...');
    try {
      const response = await axios.post('https://places.googleapis.com/v1/places:searchText', {
        textQuery: 'restaurants in New York',
        maxResultCount: 5
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.userRatingCount'
        }
      });

      console.log('✅ Places API (New) working!');
      console.log(`   Found ${response.data.places?.length || 0} places`);
      if (response.data.places?.[0]) {
        console.log(`   First place: ${response.data.places[0].displayName?.text || 'Unknown'}`);
      }
    } catch (error) {
      console.log('❌ Places API (New) error:', error.response?.data?.error?.message || error.message);
      
      // Test 2: Try the legacy Places API as fallback
      console.log('\n2. Testing legacy Places API as fallback...');
      try {
        const legacyResponse = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
          params: {
            query: 'restaurants in New York',
            key: GOOGLE_API_KEY,
            type: 'establishment'
          }
        });

        if (legacyResponse.data.status === 'OK') {
          console.log('✅ Legacy Places API working!');
          console.log(`   Found ${legacyResponse.data.results.length} results`);
          console.log(`   First result: ${legacyResponse.data.results[0]?.name}`);
        } else {
          console.log('❌ Legacy Places API error:', legacyResponse.data.error_message);
        }
      } catch (legacyError) {
        console.log('❌ Legacy Places API error:', legacyError.response?.data?.error_message || legacyError.message);
      }
    }

    // Test 3: Check API key permissions
    console.log('\n3. Checking API key permissions...');
    try {
      const quotaResponse = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
        params: {
          location: '40.7128,-74.0060', // NYC coordinates
          radius: 1000,
          type: 'restaurant',
          key: GOOGLE_API_KEY
        }
      });

      if (quotaResponse.data.status === 'OK') {
        console.log('✅ API key has Places permissions!');
        console.log(`   Found ${quotaResponse.data.results.length} nearby restaurants`);
      } else {
        console.log('❌ API key Places permission error:', quotaResponse.data.error_message);
      }
    } catch (quotaError) {
      console.log('❌ API key permission error:', quotaError.response?.data?.error_message || quotaError.message);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the test
testPlacesAPI();
