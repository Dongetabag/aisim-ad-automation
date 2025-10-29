'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { CreditCard, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn, formatPrice } from '@/utils/brandHelpers';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  deliveryMethod: 'self-service' | 'automated';
}

interface PaymentGatewayProps {
  selectedPackage: Package;
  customerEmail: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
}

function CheckoutForm({ 
  selectedPackage, 
  customerEmail, 
  onPaymentSuccess, 
  onPaymentError 
}: PaymentGatewayProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);

  useEffect(() => {
    // Create payment intent when component mounts
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/intake/payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          customerEmail: customerEmail,
          formData: {} // Add form data if needed
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setPaymentIntent(data.data);
      } else {
        onPaymentError(data.error || 'Failed to create payment intent');
      }
    } catch (error) {
      onPaymentError('Network error. Please try again.');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        onPaymentError(error.message || 'Payment failed');
      } else {
        onPaymentSuccess(paymentIntent.paymentIntentId);
        toast.success('Payment successful!');
      }
    } catch (error) {
      onPaymentError('Payment processing failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!paymentIntent) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        <span className="ml-2 text-gray-400">Setting up payment...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-surface border border-border rounded-lg p-4">
        <PaymentElement 
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className={cn(
          'w-full aisim-button flex items-center justify-center space-x-2',
          (!stripe || isLoading) && 'opacity-50 cursor-not-allowed'
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            <span>Pay {formatPrice(selectedPackage.price)}</span>
          </>
        )}
      </button>
    </form>
  );
}

export default function PaymentGateway({ 
  selectedPackage, 
  customerEmail, 
  onPaymentSuccess, 
  onPaymentError 
}: PaymentGatewayProps) {
  const [step, setStep] = useState<'package' | 'payment' | 'success'>('package');

  const handlePackageSelect = () => {
    setStep('payment');
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    setStep('success');
    onPaymentSuccess(paymentIntentId);
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
    onPaymentError(error);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="aisim-card"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gradient mb-2">
            Complete Your Purchase
          </h2>
          <p className="text-gray-400">
            Secure payment powered by Stripe
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
              step === 'package' ? 'bg-primary-500 text-white' : 'bg-surface border border-border text-gray-400'
            )}>
              1
            </div>
            <div className="w-12 h-0.5 bg-border" />
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
              step === 'payment' ? 'bg-primary-500 text-white' : 'bg-surface border border-border text-gray-400'
            )}>
              2
            </div>
            <div className="w-12 h-0.5 bg-border" />
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
              step === 'success' ? 'bg-primary-500 text-white' : 'bg-surface border border-border text-gray-400'
            )}>
              3
            </div>
          </div>
        </div>

        {/* Package Selection */}
        {step === 'package' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-surface border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {selectedPackage.name}
                  </h3>
                  <p className="text-gray-400 mb-4">
                    {selectedPackage.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary-400">
                    {formatPrice(selectedPackage.price)}
                  </div>
                  <div className="text-sm text-gray-400">One-time payment</div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {selectedPackage.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
                <Shield className="w-4 h-4" />
                <span>Secure payment • 30-day money-back guarantee</span>
              </div>

              <button
                onClick={handlePackageSelect}
                className="w-full aisim-button"
              >
                Continue to Payment
              </button>
            </div>
          </motion.div>
        )}

        {/* Payment Form */}
        {step === 'payment' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Elements 
              stripe={stripePromise}
              options={{
                clientSecret: undefined,
                appearance: {
                  theme: 'night',
                  variables: {
                    colorPrimary: '#10b981',
                    colorBackground: '#1a1a1a',
                    colorText: '#ffffff',
                    colorDanger: '#ef4444',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '8px',
                  },
                },
              }}
            >
              <CheckoutForm
                selectedPackage={selectedPackage}
                customerEmail={customerEmail}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </Elements>
          </motion.div>
        )}

        {/* Success */}
        {step === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-6"
          >
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Payment Successful!
              </h3>
              <p className="text-gray-400">
                Your ad is being generated. You'll receive an email with your download link shortly.
              </p>
            </div>

            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Order Confirmed</span>
              </div>
              <div className="text-sm text-green-300 mt-1">
                Package: {selectedPackage.name} • {formatPrice(selectedPackage.price)}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
