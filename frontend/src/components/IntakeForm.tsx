'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn, validateEmail, validateUrl } from '@/utils/brandHelpers';
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

interface IntakeFormProps {
  onFormSubmit: (data: IntakeFormData) => void;
  isLoading?: boolean;
}

export default function IntakeForm({ onFormSubmit, isLoading = false }: IntakeFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger
  } = useForm<IntakeFormData>({
    defaultValues: {
      includeImages: true,
      displayTrigger: 'time-delay',
      displayFrequency: 'once',
      adGoal: 'leads'
    }
  });

  const onSubmit = async (data: IntakeFormData) => {
    try {
      await onFormSubmit(data);
      toast.success('Form submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit form. Please try again.');
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFieldsForStep = (step: number): (keyof IntakeFormData)[] => {
    switch (step) {
      case 1:
        return ['businessName', 'businessWebsite', 'industry'];
      case 2:
        return ['adGoal', 'targetAudience', 'keyMessage'];
      case 3:
        return ['displayTrigger', 'displayFrequency', 'callToAction', 'ctaLink'];
      case 4:
        return ['preferredColors', 'includeImages'];
      default:
        return [];
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
              i + 1 <= currentStep
                ? 'bg-primary-500 text-white'
                : 'bg-surface border border-border text-gray-400'
            )}
          >
            {i + 1 < currentStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div
              className={cn(
                'w-12 h-0.5 mx-2',
                i + 1 < currentStep ? 'bg-primary-500' : 'bg-border'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="aisim-card"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">
            Create Your AI-Powered Ad
          </h1>
          <p className="text-gray-400">
            Tell us about your business and we'll generate a high-converting popup ad
          </p>
        </div>

        <StepIndicator />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Business Information */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold mb-4">Business Information</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Business Name *
                </label>
                <input
                  {...register('businessName', { required: 'Business name is required' })}
                  className="aisim-input"
                  placeholder="Your Company Name"
                />
                {errors.businessName && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.businessName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Website URL *
                </label>
                <input
                  {...register('businessWebsite', {
                    required: 'Website URL is required',
                    validate: (value) => validateUrl(value) || 'Please enter a valid URL'
                  })}
                  className="aisim-input"
                  placeholder="https://yourcompany.com"
                />
                {errors.businessWebsite && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.businessWebsite.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Industry *
                </label>
                <select {...register('industry', { required: 'Industry is required' })} className="aisim-select">
                  <option value="">Select your industry</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="education">Education</option>
                  <option value="real-estate">Real Estate</option>
                  <option value="consulting">Consulting</option>
                  <option value="other">Other</option>
                </select>
                {errors.industry && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.industry.message}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Ad Objectives */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold mb-4">Ad Objectives</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ad Goal *
                </label>
                <select {...register('adGoal', { required: 'Ad goal is required' })} className="aisim-select">
                  <option value="awareness">Brand Awareness</option>
                  <option value="leads">Lead Generation</option>
                  <option value="sales">Direct Sales</option>
                  <option value="traffic">Website Traffic</option>
                </select>
                {errors.adGoal && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.adGoal.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Target Audience *
                </label>
                <textarea
                  {...register('targetAudience', { required: 'Target audience is required' })}
                  className="aisim-textarea h-20"
                  placeholder="Describe your ideal customer (e.g., 'Tech-savvy professionals aged 25-40')"
                />
                {errors.targetAudience && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.targetAudience.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Key Message *
                </label>
                <textarea
                  {...register('keyMessage', { required: 'Key message is required' })}
                  className="aisim-textarea h-20"
                  placeholder="What's your main value proposition? (e.g., 'Save 50% on your monthly bills')"
                />
                {errors.keyMessage && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.keyMessage.message}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Technical Settings */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold mb-4">Display Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Display Trigger *
                  </label>
                  <select {...register('displayTrigger', { required: 'Display trigger is required' })} className="aisim-select">
                    <option value="immediate">Immediate</option>
                    <option value="time-delay">Time Delay (2-3 seconds)</option>
                    <option value="scroll">On Scroll (50%)</option>
                    <option value="exit-intent">Exit Intent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Display Frequency *
                  </label>
                  <select {...register('displayFrequency', { required: 'Display frequency is required' })} className="aisim-select">
                    <option value="once">Once per visitor</option>
                    <option value="daily">Once per day</option>
                    <option value="session">Once per session</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Call-to-Action Text *
                </label>
                <input
                  {...register('callToAction', { required: 'Call-to-action is required' })}
                  className="aisim-input"
                  placeholder="Get Started Now"
                />
                {errors.callToAction && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.callToAction.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  CTA Link *
                </label>
                <input
                  {...register('ctaLink', {
                    required: 'CTA link is required',
                    validate: (value) => validateUrl(value) || 'Please enter a valid URL'
                  })}
                  className="aisim-input"
                  placeholder="https://yourcompany.com/signup"
                />
                {errors.ctaLink && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.ctaLink.message}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 4: Visual Preferences */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold mb-4">Visual Preferences</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Preferred Colors (optional)
                </label>
                <input
                  {...register('preferredColors')}
                  className="aisim-input"
                  placeholder="e.g., #10b981, #34d399"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Enter hex color codes separated by commas
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  {...register('includeImages')}
                  type="checkbox"
                  className="w-4 h-4 text-primary-500 bg-surface border-border rounded focus:ring-primary-500"
                />
                <label className="text-sm font-medium">
                  Include images in the ad
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Brand Logo URL (optional)
                </label>
                <input
                  {...register('brandLogo', {
                    validate: (value) => !value || validateUrl(value) || 'Please enter a valid URL'
                  })}
                  className="aisim-input"
                  placeholder="https://yourcompany.com/logo.png"
                />
                {errors.brandLogo && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.brandLogo.message}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={cn(
                'px-6 py-2 rounded-lg font-medium transition-all',
                currentStep === 1
                  ? 'bg-surface text-gray-500 cursor-not-allowed'
                  : 'bg-surface border border-border text-white hover:bg-gray-800'
              )}
            >
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="aisim-button"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="aisim-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Ad...
                  </>
                ) : (
                  'Generate Ad'
                )}
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}



