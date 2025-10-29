import { Request, Response } from 'express';
import { AdCreationService } from '../services/adCreation.service';
import { AdDeliveryService } from '../services/adDelivery.service';
import { AnalyticsService } from '../services/analytics.service';

export class AdController {
  private adCreationService: AdCreationService;
  private adDeliveryService: AdDeliveryService;
  private analyticsService: AnalyticsService;

  constructor() {
    this.adCreationService = new AdCreationService();
    this.adDeliveryService = new AdDeliveryService();
    this.analyticsService = new AnalyticsService();
  }

  /**
   * Get ad by ID
   */
  async getAd(req: Request, res: Response): Promise<void> {
    try {
      const { adId } = req.params;

      const { pool } = await import('../config/database.config');
      
      const result = await pool.query(`
        SELECT * FROM ads WHERE id = $1
      `, [adId]);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Ad not found'
        });
        return;
      }

      const ad = result.rows[0];

      res.json({
        success: true,
        data: {
          id: ad.id,
          html: ad.html,
          css: ad.css,
          javascript: ad.javascript,
          preview: ad.preview,
          metadata: ad.metadata,
          createdAt: ad.created_at
        }
      });
    } catch (error) {
      console.error('Get ad error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get ad'
      });
    }
  }

  /**
   * Get ad performance
   */
  async getAdPerformance(req: Request, res: Response): Promise<void> {
    try {
      const { adId } = req.params;
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const performance = await this.analyticsService.getAdPerformance(adId, start, end);

      res.json({
        success: true,
        data: performance
      });
    } catch (error) {
      console.error('Get ad performance error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get ad performance'
      });
    }
  }

  /**
   * Deploy ad
   */
  async deployAd(req: Request, res: Response): Promise<void> {
    try {
      const { adId } = req.params;
      const { website, method } = req.body;

      if (!website || !method) {
        res.status(400).json({
          success: false,
          error: 'Website and method are required'
        });
        return;
      }

      // Get ad from database
      const { pool } = await import('../config/database.config');
      
      const result = await pool.query(`
        SELECT * FROM ads WHERE id = $1
      `, [adId]);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Ad not found'
        });
        return;
      }

      const ad = result.rows[0];
      const generatedAd = {
        id: ad.id,
        html: ad.html,
        css: ad.css,
        javascript: ad.javascript,
        preview: ad.preview,
        metadata: ad.metadata
      };

      // Deploy ad
      const deployment = await this.adDeliveryService.deployAd(
        generatedAd,
        website,
        method as 'injection' | 'iframe' | 'script'
      );

      res.json({
        success: true,
        data: deployment
      });
    } catch (error) {
      console.error('Deploy ad error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to deploy ad'
      });
    }
  }

  /**
   * Track ad event
   */
  async trackEvent(req: Request, res: Response): Promise<void> {
    try {
      const { adId, eventType } = req.params;
      const { url, referrer, userAgent, metadata } = req.body;

      await this.analyticsService.trackEvent({
        adId,
        eventType: eventType as 'impression' | 'click' | 'close' | 'conversion',
        url: url || req.get('referer') || 'unknown',
        referrer: referrer || req.get('referer'),
        userAgent: userAgent || req.get('user-agent'),
        ipAddress: req.ip,
        metadata
      });

      res.json({
        success: true,
        message: 'Event tracked successfully'
      });
    } catch (error) {
      console.error('Track event error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to track event'
      });
    }
  }

  /**
   * Get dashboard analytics
   */
  async getDashboardAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await this.analyticsService.getDashboardAnalytics();

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Get dashboard analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get dashboard analytics'
      });
    }
  }

  /**
   * Get real-time analytics
   */
  async getRealTimeAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await this.analyticsService.getRealTimeAnalytics();

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Get real-time analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get real-time analytics'
      });
    }
  }

  /**
   * List all ads
   */
  async listAds(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const { pool } = await import('../config/database.config');
      
      const result = await pool.query(`
        SELECT id, payment_intent_id, preview, metadata, created_at
        FROM ads
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `, [Number(limit), offset]);

      const countResult = await pool.query(`
        SELECT COUNT(*) as total FROM ads
      `);

      res.json({
        success: true,
        data: {
          ads: result.rows,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: parseInt(countResult.rows[0].total),
            pages: Math.ceil(parseInt(countResult.rows[0].total) / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('List ads error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list ads'
      });
    }
  }
}



