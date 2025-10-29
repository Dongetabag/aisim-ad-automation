import { pool } from '../config/database.config';

interface AnalyticsEvent {
  id: string;
  adId: string;
  eventType: 'impression' | 'click' | 'close' | 'conversion';
  timestamp: Date;
  url: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

interface AdPerformance {
  adId: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number; // Click-through rate
  conversionRate: number;
  timeOnPage?: number;
  bounceRate?: number;
}

export class AnalyticsService {
  /**
   * Track analytics event
   */
  async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...event
    };

    try {
      await pool.query(`
        INSERT INTO analytics_events (id, ad_id, event_type, timestamp, url, referrer, user_agent, ip_address, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        analyticsEvent.id,
        analyticsEvent.adId,
        analyticsEvent.eventType,
        analyticsEvent.timestamp,
        analyticsEvent.url,
        analyticsEvent.referrer,
        analyticsEvent.userAgent,
        analyticsEvent.ipAddress,
        JSON.stringify(analyticsEvent.metadata || {})
      ]);
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }

  /**
   * Get ad performance metrics
   */
  async getAdPerformance(adId: string, startDate?: Date, endDate?: Date): Promise<AdPerformance> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const end = endDate || new Date();

    try {
      const result = await pool.query(`
        SELECT 
          ad_id,
          COUNT(CASE WHEN event_type = 'impression' THEN 1 END) as impressions,
          COUNT(CASE WHEN event_type = 'click' THEN 1 END) as clicks,
          COUNT(CASE WHEN event_type = 'conversion' THEN 1 END) as conversions,
          AVG(CASE WHEN event_type = 'click' THEN 1.0 ELSE 0.0 END) / 
          NULLIF(COUNT(CASE WHEN event_type = 'impression' THEN 1 END), 0) * 100 as ctr,
          AVG(CASE WHEN event_type = 'conversion' THEN 1.0 ELSE 0.0 END) / 
          NULLIF(COUNT(CASE WHEN event_type = 'click' THEN 1 END), 0) * 100 as conversion_rate
        FROM analytics_events 
        WHERE ad_id = $1 
          AND timestamp >= $2 
          AND timestamp <= $3
        GROUP BY ad_id
      `, [adId, start, end]);

      const row = result.rows[0];
      
      return {
        adId: adId,
        impressions: parseInt(row?.impressions || '0'),
        clicks: parseInt(row?.clicks || '0'),
        conversions: parseInt(row?.conversions || '0'),
        ctr: parseFloat(row?.ctr || '0'),
        conversionRate: parseFloat(row?.conversion_rate || '0')
      };
    } catch (error) {
      console.error('Failed to get ad performance:', error);
      return {
        adId: adId,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
        conversionRate: 0
      };
    }
  }

  /**
   * Get dashboard analytics
   */
  async getDashboardAnalytics(): Promise<{
    totalAds: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    averageCTR: number;
    averageConversionRate: number;
    topPerformingAds: Array<{adId: string, ctr: number, conversions: number}>;
  }> {
    try {
      // Get overall metrics
      const metricsResult = await pool.query(`
        SELECT 
          COUNT(DISTINCT ad_id) as total_ads,
          COUNT(CASE WHEN event_type = 'impression' THEN 1 END) as total_impressions,
          COUNT(CASE WHEN event_type = 'click' THEN 1 END) as total_clicks,
          COUNT(CASE WHEN event_type = 'conversion' THEN 1 END) as total_conversions,
          AVG(CASE WHEN event_type = 'click' THEN 1.0 ELSE 0.0 END) / 
          NULLIF(COUNT(CASE WHEN event_type = 'impression' THEN 1 END), 0) * 100 as avg_ctr,
          AVG(CASE WHEN event_type = 'conversion' THEN 1.0 ELSE 0.0 END) / 
          NULLIF(COUNT(CASE WHEN event_type = 'click' THEN 1 END), 0) * 100 as avg_conversion_rate
        FROM analytics_events 
        WHERE timestamp >= NOW() - INTERVAL '30 days'
      `);

      // Get top performing ads
      const topAdsResult = await pool.query(`
        SELECT 
          ad_id,
          COUNT(CASE WHEN event_type = 'click' THEN 1 END)::float / 
          NULLIF(COUNT(CASE WHEN event_type = 'impression' THEN 1 END), 0) * 100 as ctr,
          COUNT(CASE WHEN event_type = 'conversion' THEN 1 END) as conversions
        FROM analytics_events 
        WHERE timestamp >= NOW() - INTERVAL '30 days'
        GROUP BY ad_id
        HAVING COUNT(CASE WHEN event_type = 'impression' THEN 1 END) > 0
        ORDER BY ctr DESC
        LIMIT 10
      `);

      const metrics = metricsResult.rows[0];
      
      return {
        totalAds: parseInt(metrics?.total_ads || '0'),
        totalImpressions: parseInt(metrics?.total_impressions || '0'),
        totalClicks: parseInt(metrics?.total_clicks || '0'),
        totalConversions: parseInt(metrics?.total_conversions || '0'),
        averageCTR: parseFloat(metrics?.avg_ctr || '0'),
        averageConversionRate: parseFloat(metrics?.avg_conversion_rate || '0'),
        topPerformingAds: topAdsResult.rows.map((row: any) => ({
          adId: row.ad_id,
          ctr: parseFloat(row.ctr || '0'),
          conversions: parseInt(row.conversions || '0')
        }))
      };
    } catch (error) {
      console.error('Failed to get dashboard analytics:', error);
      return {
        totalAds: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        averageCTR: 0,
        averageConversionRate: 0,
        topPerformingAds: []
      };
    }
  }

  /**
   * Get real-time analytics
   */
  async getRealTimeAnalytics(): Promise<{
    activeAds: number;
    impressionsLastHour: number;
    clicksLastHour: number;
    conversionsLastHour: number;
  }> {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(DISTINCT ad_id) as active_ads,
          COUNT(CASE WHEN event_type = 'impression' AND timestamp >= NOW() - INTERVAL '1 hour' THEN 1 END) as impressions_last_hour,
          COUNT(CASE WHEN event_type = 'click' AND timestamp >= NOW() - INTERVAL '1 hour' THEN 1 END) as clicks_last_hour,
          COUNT(CASE WHEN event_type = 'conversion' AND timestamp >= NOW() - INTERVAL '1 hour' THEN 1 END) as conversions_last_hour
        FROM analytics_events 
        WHERE timestamp >= NOW() - INTERVAL '24 hours'
      `);

      const row = result.rows[0];
      
      return {
        activeAds: parseInt(row?.active_ads || '0'),
        impressionsLastHour: parseInt(row?.impressions_last_hour || '0'),
        clicksLastHour: parseInt(row?.clicks_last_hour || '0'),
        conversionsLastHour: parseInt(row?.conversions_last_hour || '0')
      };
    } catch (error) {
      console.error('Failed to get real-time analytics:', error);
      return {
        activeAds: 0,
        impressionsLastHour: 0,
        clicksLastHour: 0,
        conversionsLastHour: 0
      };
    }
  }
}
