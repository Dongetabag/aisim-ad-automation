import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  Target, 
  BarChart3, 
  Users,
  CheckCircle,
  Star
} from 'lucide-react';
import { cn } from '@/utils/brandHelpers';

export default function HomePage() {
  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Generation',
      description: 'Generate high-converting popup ads in under 2 minutes using advanced AI'
    },
    {
      icon: Target,
      title: 'Smart Targeting',
      description: 'Advanced targeting options to reach your ideal customers at the right moment'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Track performance with detailed analytics and conversion metrics'
    },
    {
      icon: Shield,
      title: 'Brand Compliant',
      description: 'All ads follow AISim brand standards for professional appearance'
    }
  ];

  const packages = [
    {
      name: 'Basic Package',
      price: 497,
      description: 'Perfect for small businesses',
      features: [
        '1 Custom Popup Ad',
        'AI-Generated Copy & Design',
        'Basic Targeting',
        'Download Package',
        '30-Day Analytics'
      ],
      popular: false
    },
    {
      name: 'Pro Package',
      price: 997,
      description: 'Best for growing businesses',
      features: [
        '3 Custom Popup Ads',
        'AI-Generated Copy & Design',
        'Advanced Targeting',
        'Automated Deployment',
        'A/B Testing',
        '90-Day Analytics',
        'Priority Support'
      ],
      popular: true
    },
    {
      name: 'Enterprise Package',
      price: 2970,
      description: 'For large organizations',
      features: [
        'Unlimited Custom Popup Ads',
        'AI-Generated Copy & Design',
        'Enterprise Targeting',
        'Multi-Site Deployment',
        'A/B Testing',
        'Real-Time Analytics',
        'Dedicated Account Manager',
        'Custom Integration'
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      company: 'TechStart Inc.',
      content: 'AISim increased our conversion rate by 300% in just one week!',
      rating: 5
    },
    {
      name: 'Mike Chen',
      company: 'E-commerce Plus',
      content: 'The AI-generated ads are incredibly professional and effective.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      company: 'Digital Marketing Co.',
      content: 'Best investment we\'ve made for our client campaigns.',
      rating: 5
    }
  ];

  return (
    <>
      <Head>
        <title>AISim - AI-Powered Marketing Excellence</title>
        <meta name="description" content="Generate high-converting popup ads in minutes with AI. Professional, brand-compliant, and optimized for maximum conversions." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-primary-900/20" />
          <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-5xl lg:text-7xl font-bold text-gradient mb-6"
              >
                AI-Powered
                <br />
                Marketing Excellence
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl lg:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto"
              >
                Generate high-converting popup ads in under 2 minutes using advanced AI. 
                Professional, brand-compliant, and optimized for maximum conversions.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Link href="/create-ad">
                  <button className="aisim-button text-lg px-8 py-4 flex items-center space-x-2">
                    <span>Create Your Ad Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                
                <button className="bg-surface border border-border text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-all flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>View Demo</span>
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-12 flex items-center justify-center space-x-8 text-sm text-gray-400"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>95% Success Rate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>2-Minute Generation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Brand Compliant</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Why Choose AISim?
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Our AI-powered platform combines cutting-edge technology with proven marketing strategies
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="aisim-card text-center"
                >
                  <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Packages Section */}
        <section className="py-20 bg-surface/50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Choose Your Package
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Select the perfect package for your business needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packages.map((pkg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={cn(
                    'aisim-card relative',
                    pkg.popular && 'ring-2 ring-primary-500'
                  )}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {pkg.name}
                    </h3>
                    <p className="text-gray-400 mb-4">
                      {pkg.description}
                    </p>
                    <div className="text-4xl font-bold text-primary-400">
                      ${pkg.price}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/create-ad">
                    <button className={cn(
                      'w-full py-3 rounded-lg font-semibold transition-all',
                      pkg.popular 
                        ? 'aisim-button' 
                        : 'bg-surface border border-border text-white hover:bg-gray-800'
                    )}>
                      Get Started
                    </button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                What Our Customers Say
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Join thousands of satisfied customers who've transformed their marketing
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="aisim-card"
                >
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-gray-300 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  
                  <div>
                    <div className="font-semibold text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {testimonial.company}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-900/20 to-primary-800/20">
          <div className="max-w-4xl mx-auto text-center px-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-6"
            >
              Ready to Transform Your Marketing?
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-400 mb-8"
            >
              Join 10,000+ businesses using AISim to create high-converting ads
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link href="/create-ad">
                <button className="aisim-button text-lg px-8 py-4 flex items-center space-x-2 mx-auto">
                  <span>Start Creating Ads</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-border">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient mb-4">
                AISim
              </div>
              <p className="text-gray-400 mb-6">
                AI-Powered Marketing Excellence
              </p>
              <div className="flex justify-center space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}



