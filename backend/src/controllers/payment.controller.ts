import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { AdCreationService } from '../services/adCreation.service';
import { AdDeliveryService } from '../services/adDelivery.service';

export class PaymentController {
  private paymentService: PaymentService;
  private adCreationService: AdCreationService;
  private adDeliveryService: AdDeliveryService;

  constructor() {
    this.paymentService = new PaymentService();
    this.adCreationService = new AdCreationService();
    this.adDeliveryService = new AdDeliveryService();
  }

  /**
   * Handle Stripe webhook
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.get('stripe-signature');
      if (!signature) {
        res.status(400).json({ error: 'Missing stripe-signature header' });
        return;
      }

      await this.paymentService.handleWebhook(req.body, signature);

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ error: 'Webhook processing failed' });
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { paymentIntentId } = req.params;

      // Get payment intent from Stripe
      const paymentIntent = await this.paymentService.stripe.paymentIntents.retrieve(paymentIntentId);

      res.json({
        success: true,
        data: {
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          metadata: paymentIntent.metadata
        }
      });
    } catch (error) {
      console.error('Get payment status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get payment status'
      });
    }
  }

  /**
   * Create customer
   */
  async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { email, name } = req.body;

      if (!email || !name) {
        res.status(400).json({
          success: false,
          error: 'Email and name are required'
        });
        return;
      }

      const customer = await this.paymentService.createCustomer(email, name);

      res.json({
        success: true,
        data: {
          customerId: customer.id,
          email: customer.email,
          name: customer.name
        }
      });
    } catch (error) {
      console.error('Create customer error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create customer'
      });
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { customerId, priceId } = req.body;

      if (!customerId || !priceId) {
        res.status(400).json({
          success: false,
          error: 'Customer ID and price ID are required'
        });
        return;
      }

      const subscription = await this.paymentService.createSubscription(customerId, priceId);

      res.json({
        success: true,
        data: {
          subscriptionId: subscription.id,
          status: subscription.status,
          clientSecret: typeof subscription.latest_invoice === 'object' && subscription.latest_invoice && 'payment_intent' in subscription.latest_invoice 
            ? (subscription.latest_invoice as any).payment_intent?.client_secret 
            : undefined
        }
      });
    } catch (error) {
      console.error('Create subscription error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create subscription'
      });
    }
  }

  /**
   * Get customer's orders
   */
  async getCustomerOrders(req: Request, res: Response): Promise<void> {
    try {
      const { customerEmail } = req.params;

      const { pool } = await import('../config/database.config');
      
      const result = await pool.query(`
        SELECT o.*, a.html, a.css, a.javascript, a.preview
        FROM orders o
        LEFT JOIN ads a ON o.stripe_payment_intent_id = a.payment_intent_id
        WHERE o.customer_email = $1
        ORDER BY o.created_at DESC
      `, [customerEmail]);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get customer orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get customer orders'
      });
    }
  }

  /**
   * Download ad package
   */
  async downloadAdPackage(req: Request, res: Response): Promise<void> {
    try {
      const { adId } = req.params;

      const { pool } = await import('../config/database.config');
      
      const result = await pool.query(`
        SELECT html, css, javascript, metadata
        FROM ads
        WHERE id = $1
      `, [adId]);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Ad not found'
        });
        return;
      }

      const ad = result.rows[0];
      
      // Generate downloadable package
      const packageContent = this.generateDownloadPackage(ad);

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="aisim-ad-${adId}.zip"`);
      res.send(packageContent);
    } catch (error) {
      console.error('Download ad package error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to download ad package'
      });
    }
  }

  private generateDownloadPackage(ad: any): string {
    // Generate ZIP file with ad files
    // This would use a library like archiver to create a ZIP file
    return `
<!DOCTYPE html>
<html>
<head>
    <title>AISim Ad Package</title>
    <style>${ad.css}</style>
</head>
<body>
    ${ad.html}
    <script>${ad.javascript}</script>
</body>
</html>
    `;
  }
}
