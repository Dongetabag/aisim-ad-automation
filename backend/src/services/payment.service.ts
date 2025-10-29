import Stripe from 'stripe';
import { stripe } from '../config/stripe.config';

interface AdPackage {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  features: string[];
  deliveryMethod: 'self-service' | 'automated';
}

export class PaymentService {
  public stripe: Stripe;

  constructor() {
    this.stripe = stripe;
  }

  /**
   * Define ad packages
   */
  readonly PACKAGES: AdPackage[] = [
    {
      id: 'pkg_basic',
      name: 'Basic Ad Package',
      description: 'Single popup ad with basic targeting',
      price: 49700, // $497
      features: [
        '1 Custom Popup Ad',
        'AI-Generated Copy & Design',
        'Basic Targeting',
        'Download Package',
        '30-Day Analytics'
      ],
      deliveryMethod: 'self-service'
    },
    {
      id: 'pkg_pro',
      name: 'Pro Ad Package',
      description: 'Multiple ads with automated deployment',
      price: 99700, // $997
      features: [
        '3 Custom Popup Ads',
        'AI-Generated Copy & Design',
        'Advanced Targeting',
        'Automated Deployment to Your Site',
        'A/B Testing',
        '90-Day Analytics',
        'Priority Support'
      ],
      deliveryMethod: 'automated'
    },
    {
      id: 'pkg_enterprise',
      name: 'Enterprise Ad Package',
      description: 'Unlimited ads with full automation',
      price: 297000, // $2,970
      features: [
        'Unlimited Custom Popup Ads',
        'AI-Generated Copy & Design',
        'Enterprise Targeting',
        'Automated Multi-Site Deployment',
        'A/B Testing',
        'Real-Time Analytics Dashboard',
        'Dedicated Account Manager',
        'Custom Integration'
      ],
      deliveryMethod: 'automated'
    }
  ];

  /**
   * Create payment intent for ad package
   */
  async createPaymentIntent(
    packageId: string,
    customerEmail: string,
    metadata: Record<string, any>
  ): Promise<Stripe.PaymentIntent> {
    const selectedPackage = this.PACKAGES.find(p => p.id === packageId);
    if (!selectedPackage) throw new Error('Invalid package ID');

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: selectedPackage.price,
      currency: 'usd',
      receipt_email: customerEmail,
      metadata: {
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    return paymentIntent;
  }

  /**
   * Create Stripe customer
   */
  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    return await this.stripe.customers.create({
      email,
      name,
      metadata: {
        source: 'aisim-ad-automation'
      }
    });
  }

  /**
   * Create subscription for recurring ad services
   */
  async createSubscription(
    customerId: string,
    priceId: string
  ): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    });
  }

  /**
   * Handle webhook events
   */
  async handleWebhook(
    payload: string | Buffer,
    signature: string
  ): Promise<void> {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      throw new Error(`Webhook signature verification failed`);
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    // Trigger ad creation workflow
    console.log('Payment succeeded:', paymentIntent.id);
    
    // Save customer and order to database
    await this.saveCustomerOrder(paymentIntent);
    
    // Trigger ad creation process
    await this.triggerAdCreation(paymentIntent);
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    // Handle failed payment
    console.log('Payment failed:', paymentIntent.id);
    
    // Log failure and potentially retry
    await this.logPaymentFailure(paymentIntent);
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    // Set up recurring ad generation
    console.log('Subscription created:', subscription.id);
    
    // Set up recurring ad generation schedule
    await this.setupRecurringAds(subscription);
  }

  private async saveCustomerOrder(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const { pool } = await import('../config/database.config');
    
    try {
      await pool.query(`
        INSERT INTO orders (id, customer_email, package_id, amount, status, stripe_payment_intent_id, metadata, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          updated_at = NOW()
      `, [
        `order_${Date.now()}`,
        paymentIntent.receipt_email,
        paymentIntent.metadata.packageId,
        paymentIntent.amount,
        'paid',
        paymentIntent.id,
        JSON.stringify(paymentIntent.metadata),
        new Date()
      ]);
    } catch (error) {
      console.error('Failed to save customer order:', error);
    }
  }

  private async triggerAdCreation(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    // This would trigger the ad creation service
    console.log('Triggering ad creation for payment:', paymentIntent.id);
    
    // In a real implementation, this would:
    // 1. Get the customer's intake form data
    // 2. Call the AdCreationService
    // 3. Generate the ad package
    // 4. Send delivery notification
  }

  private async logPaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const { pool } = await import('../config/database.config');
    
    try {
      await pool.query(`
        INSERT INTO payment_failures (stripe_payment_intent_id, amount, currency, failure_reason, created_at)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        paymentIntent.id,
        paymentIntent.amount,
        paymentIntent.currency,
        'Payment failed',
        new Date()
      ]);
    } catch (error) {
      console.error('Failed to log payment failure:', error);
    }
  }

  private async setupRecurringAds(subscription: Stripe.Subscription): Promise<void> {
    // Set up recurring ad generation based on subscription
    console.log('Setting up recurring ads for subscription:', subscription.id);
    
    // This would integrate with a job scheduler to create ads periodically
  }
}
