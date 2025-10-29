import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export const STRIPE_CONFIG = {
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
  currency: 'usd',
  successUrl: `${process.env.FRONTEND_URL}/success`,
  cancelUrl: `${process.env.FRONTEND_URL}/cancel`
} as const;



