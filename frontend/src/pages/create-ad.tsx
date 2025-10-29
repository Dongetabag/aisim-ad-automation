import React, { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle } from 'lucide-react';
import IntakeForm from '@/components/IntakeForm';
import AdPreview from '@/components/AdPreview';
import PaymentGateway from '@/components/PaymentGateway';
import { cn } from '@/utils/brandHelpers';
import toast from 'react-hot-toast';

interface IntakeFormData {
  businessName: string;
  businessWebsite: string;
  industry: string;
  adGoal: 'awareness' | 'leads' | 'sales' | 'traffic';
  targetAudience: string;
  keyMessage: string;
  preferredColors?: string[];
  includeImages: boolean;
  brandLogo?: string;
  displayTrigger: 'immediate' | 'time-delay' | 'scroll' | 'exit-intent';
  displayFrequency: 'once' | 'daily' | 'session';
  targetPages?: string[];
  callToAction: string;
  ctaLink: string;
}

interface AdData {
  id: string;
  html: string;
  css: string;
  javascript: string;
  preview: string;
  metadata: {
    createdAt: Date;
    package: string;
    brandCompliant: boolean;
    estimatedCTR: number;
  };
}

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  deliveryMethod: 'self-service' | 'automated';
}

export default function CreateAdPage() {
  const [currentStep, setCurrentStep] = useState<'form' | 'preview' | 'payment' | 'success'>('form');
  const [formData, setFormData] = useState<IntakeFormData | null>(null);
  const [adData, setAdData] = useState<AdData | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);

  React.useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const response = await fetch('/api/intake/packages');
      const data = await response.json();
      
      if (data.success) {
        setPackages(data.data);
      }
    } catch (error) {
      console.error('Failed to load packages:', error);
    }
  };

  const handleFormSubmit = async (data: IntakeFormData) => {
    try {
      setIsLoading(true);
      setFormData(data);

      // Submit form to backend
      const response = await fetch('/api/intake/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setAdData(result.data.adPreview);
        setPackages(result.data.packages);
        setCurrentStep('preview');
        toast.success('Ad generated successfully!');
      } else {
        throw new Error(result.error || 'Failed to generate ad');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to generate ad. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
    setCurrentStep('payment');
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Generate final ad after payment
      const response = await fetch('/api/intake/generate-ad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          formData,
          packageId: selectedPackage?.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setAdData(result.data);
        setCurrentStep('success');
        toast.success('Payment successful! Your ad is ready.');
      } else {
        throw new Error(result.error || 'Failed to generate final ad');
      }
    } catch (error) {
      console.error('Payment success error:', error);
      toast.error('Payment successful, but failed to generate final ad. Please contact support.');
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
  };

  const handleDownload = async () => {
    if (!adData) return;

    try {
      const response = await fetch(`/api/payment/download/${adData.id}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aisim-ad-${adData.id}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Ad package downloaded!');
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download ad package');
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[
        { key: 'form', label: 'Form', icon: '📝' },
        { key: 'preview', label: 'Preview', icon: '👁️' },
        { key: 'payment', label: 'Payment', icon: '💳' },
        { key: 'success', label: 'Success', icon: '✅' }
      ].map((step, index) => (
        <div key={step.key} className="flex items-center">
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
              currentStep === step.key
                ? 'bg-primary-500 text-white'
                : ['form', 'preview', 'payment', 'success'].indexOf(currentStep) > index
                ? 'bg-green-500 text-white'
                : 'bg-surface border border-border text-gray-400'
            )}
          >
            {['form', 'preview', 'payment', 'success'].indexOf(currentStep) > index ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <span>{step.icon}</span>
            )}
          </div>
          {index < 3 && (
            <div
              className={cn(
                'w-12 h-0.5 mx-2',
                ['form', 'preview', 'payment', 'success'].indexOf(currentStep) > index
                  ? 'bg-green-500'
                  : 'bg-border'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <Head>
        <title>Create Ad - AISim</title>
        <meta name="description" content="Create your AI-powered popup ad in minutes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-background py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gradient mb-4">
              Create Your AI-Powered Ad
            </h1>
            <p className="text-xl text-gray-400">
              Fill out the form below and we'll generate a high-converting popup ad for you
            </p>
          </motion.div>

          <StepIndicator />

          {/* Loading Overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-surface rounded-lg p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
                <p className="text-white">Generating your ad...</p>
              </div>
            </div>
          )}

          {/* Step Content */}
          {currentStep === 'form' && (
            <IntakeForm
              onFormSubmit={handleFormSubmit}
              isLoading={isLoading}
            />
          )}

          {currentStep === 'preview' && adData && (
            <div className="space-y-8">
              <AdPreview
                adData={adData}
                onDownload={handleDownload}
              />

              {/* Package Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="aisim-card"
              >
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  Choose Your Package
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="bg-surface border border-border rounded-lg p-6 hover:border-primary-500/50 transition-all cursor-pointer"
                      onClick={() => handlePackageSelect(pkg)}
                    >
                      <div className="text-center mb-4">
                        <h4 className="text-xl font-semibold text-white mb-2">
                          {pkg.name}
                        </h4>
                        <p className="text-gray-400 mb-4">
                          {pkg.description}
                        </p>
                        <div className="text-3xl font-bold text-primary-400">
                          ${pkg.price / 100}
                        </div>
                      </div>

                      <ul className="space-y-2 mb-6">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm text-gray-300">
                            <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <button className="w-full aisim-button">
                        Select Package
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {currentStep === 'payment' && selectedPackage && formData && (
            <PaymentGateway
              selectedPackage={selectedPackage}
              customerEmail="customer@example.com" // This would come from form data
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          )}

          {currentStep === 'success' && adData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Congratulations! Your Ad is Ready
                </h2>
                <p className="text-xl text-gray-400 mb-8">
                  Your AI-generated popup ad has been created and is ready for deployment.
                </p>
              </div>

              <AdPreview
                adData={adData}
                onDownload={handleDownload}
              />

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleDownload}
                  className="aisim-button"
                >
                  Download Ad Package
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-surface border border-border text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all"
                >
                  View Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}



