import axios from 'axios';

interface GoogleMapsResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
  rating?: number;
  user_ratings_total?: number;
}

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  viewCount: string;
  duration: string;
  publishedAt: string;
}

export class GoogleServicesService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY || '';
  }

  /**
   * Search for businesses using Google Places API
   */
  async searchBusinesses(query: string, location?: string): Promise<GoogleMapsResult[]> {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
        params: {
          query: query,
          key: this.apiKey,
          type: 'establishment',
          ...(location && { location: location, radius: 50000 })
        }
      });

      return response.data.results.map((result: any) => ({
        place_id: result.place_id,
        formatted_address: result.formatted_address,
        geometry: result.geometry,
        name: result.name,
        rating: result.rating,
        user_ratings_total: result.user_ratings_total
      }));
    } catch (error) {
      console.error('Google Places API error:', error);
      return [];
    }
  }

  /**
   * Get detailed business information
   */
  async getBusinessDetails(placeId: string): Promise<any> {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
        params: {
          place_id: placeId,
          key: this.apiKey,
          fields: 'name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours,reviews'
        }
      });

      return response.data.result;
    } catch (error) {
      console.error('Google Places Details API error:', error);
      return null;
    }
  }

  /**
   * Search for relevant YouTube videos for ad inspiration
   */
  async searchYouTubeVideos(query: string, maxResults: number = 5): Promise<YouTubeVideo[]> {
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: query,
          key: this.apiKey,
          maxResults: maxResults,
          type: 'video',
          order: 'relevance'
        }
      });

      return response.data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        viewCount: '0', // Would need additional API call for view count
        duration: '0', // Would need additional API call for duration
        publishedAt: item.snippet.publishedAt
      }));
    } catch (error) {
      console.error('YouTube API error:', error);
      return [];
    }
  }

  /**
   * Get YouTube video statistics
   */
  async getYouTubeVideoStats(videoId: string): Promise<any> {
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'statistics,contentDetails',
          id: videoId,
          key: this.apiKey
        }
      });

      return response.data.items[0];
    } catch (error) {
      console.error('YouTube Stats API error:', error);
      return null;
    }
  }

  /**
   * Enhanced lead generation using Google Places
   */
  async generateLeadsFromGoogle(industry: string, location: string, radius: number = 50000): Promise<any[]> {
    try {
      const businesses = await this.searchBusinesses(`${industry} companies`, location);
      const detailedLeads = [];

      for (const business of businesses.slice(0, 10)) { // Limit to 10 for API quota
        const details = await this.getBusinessDetails(business.place_id);
        
        if (details) {
          detailedLeads.push({
            id: `google_${business.place_id}`,
            companyName: business.name,
            address: business.formatted_address,
            phone: details.formatted_phone_number,
            website: details.website,
            rating: business.rating,
            reviewCount: business.user_ratings_total,
            industry: industry,
            source: 'google-places',
            location: {
              lat: business.geometry.location.lat,
              lng: business.geometry.location.lng
            },
            metadata: {
              placeId: business.place_id,
              openingHours: details.opening_hours,
              reviews: details.reviews?.slice(0, 3) // Top 3 reviews
            }
          });
        }

        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return detailedLeads;
    } catch (error) {
      console.error('Google lead generation error:', error);
      return [];
    }
  }

  /**
   * Get video content for ad inspiration
   */
  async getAdInspiration(industry: string, keywords: string[]): Promise<any[]> {
    try {
      const searchQuery = `${industry} ${keywords.join(' ')} marketing advertising`;
      const videos = await this.searchYouTubeVideos(searchQuery, 5);
      
      const enrichedVideos = await Promise.all(
        videos.map(async (video) => {
          const stats = await this.getYouTubeVideoStats(video.id);
          return {
            ...video,
            viewCount: stats?.statistics?.viewCount || '0',
            duration: stats?.contentDetails?.duration || '0',
            likeCount: stats?.statistics?.likeCount || '0',
            commentCount: stats?.statistics?.commentCount || '0'
          };
        })
      );

      return enrichedVideos;
    } catch (error) {
      console.error('Ad inspiration error:', error);
      return [];
    }
  }

  /**
   * Validate API key and check quotas
   */
  async validateApiKey(): Promise<{ valid: boolean; quota: any }> {
    try {
      // Test with a simple Places API call
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
        params: {
          query: 'test',
          key: this.apiKey
        }
      });

      return {
        valid: response.status === 200,
        quota: {
          status: response.data.status,
          error_message: response.data.error_message
        }
      };
    } catch (error) {
      return {
        valid: false,
        quota: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}
