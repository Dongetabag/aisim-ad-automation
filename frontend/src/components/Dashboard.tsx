'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Eye, 
  MousePointer, 
  TrendingUp, 
  Clock, 
  Users,
  Download,
  Settings,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/utils/brandHelpers';
import toast from 'react-hot-toast';

interface AnalyticsData {
  totalAds: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  averageCTR: number;
  averageConversionRate: number;
  topPerformingAds: Array<{
    adId: string;
    ctr: number;
    conversions: number;
  }>;
}

interface RealTimeData {
  activeAds: number;
  impressionsLastHour: number;
  clicksLastHour: number;
  conversionsLastHour: number;
}

interface Ad {
  id: string;
  payment_intent_id: string;
  preview: string;
  metadata: any;
  created_at: string;
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [analyticsRes, realTimeRes, adsRes] = await Promise.all([
        fetch('/api/analytics/dashboard'),
        fetch('/api/analytics/realtime'),
        fetch('/api/ads?page=1&limit=10')
      ]);

      const [analyticsData, realTimeData, adsData] = await Promise.all([
        analyticsRes.json(),
        realTimeRes.json(),
        adsRes.json()
      ]);

      if (analyticsData.success) {
        setAnalytics(analyticsData.data);
      }

      if (realTimeData.success) {
        setRealTimeData(realTimeData.data);
      }

      if (adsData.success) {
        setAds(adsData.data.ads);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    change, 
    color = 'primary' 
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    change?: string;
    color?: 'primary' | 'green' | 'blue' | 'purple';
  }) => {
    const colorClasses = {
      primary: 'text-primary-400',
      green: 'text-green-400',
      blue: 'text-blue-400',
      purple: 'text-purple-400'
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="aisim-card"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {change && (
              <p className="text-sm text-green-400 mt-1">{change}</p>
            )}
          </div>
          <div className={cn('p-3 rounded-lg bg-surface', colorClasses[color])}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-400">
              Monitor your ad performance and track conversions
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={cn(
              'aisim-button flex items-center space-x-2',
              refreshing && 'opacity-50 cursor-not-allowed'
            )}
          >
            <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Real-time Stats */}
        {realTimeData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Active Ads"
              value={realTimeData.activeAds}
              icon={Eye}
              color="blue"
            />
            <StatCard
              title="Impressions (Last Hour)"
              value={realTimeData.impressionsLastHour.toLocaleString()}
              icon={BarChart3}
              color="primary"
            />
            <StatCard
              title="Clicks (Last Hour)"
              value={realTimeData.clicksLastHour.toLocaleString()}
              icon={MousePointer}
              color="green"
            />
            <StatCard
              title="Conversions (Last Hour)"
              value={realTimeData.conversionsLastHour.toLocaleString()}
              icon={TrendingUp}
              color="purple"
            />
          </div>
        )}

        {/* Main Analytics */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Overall Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="aisim-card"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Overall Performance</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Ads</span>
                  <span className="text-white font-semibold">{analytics.totalAds}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Impressions</span>
                  <span className="text-white font-semibold">{analytics.totalImpressions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Clicks</span>
                  <span className="text-white font-semibold">{analytics.totalClicks.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Conversions</span>
                  <span className="text-white font-semibold">{analytics.totalConversions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Average CTR</span>
                  <span className="text-primary-400 font-semibold">{analytics.averageCTR.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Conversion Rate</span>
                  <span className="text-green-400 font-semibold">{analytics.averageConversionRate.toFixed(2)}%</span>
                </div>
              </div>
            </motion.div>

            {/* Top Performing Ads */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="aisim-card"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Top Performing Ads</h3>
              
              <div className="space-y-4">
                {analytics.topPerformingAds.slice(0, 5).map((ad, index) => (
                  <div key={ad.adId} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-white font-medium">{ad.adId.slice(0, 12)}...</div>
                        <div className="text-sm text-gray-400">{ad.conversions} conversions</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-primary-400 font-semibold">{ad.ctr.toFixed(2)}%</div>
                      <div className="text-xs text-gray-400">CTR</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Recent Ads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="aisim-card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Recent Ads</h3>
            <button className="text-primary-400 hover:text-primary-300 text-sm font-medium">
              View All
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Ad ID</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Created</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Package</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad) => (
                  <tr key={ad.id} className="border-b border-border/50">
                    <td className="py-3 px-4">
                      <div className="font-mono text-sm text-white">{ad.id.slice(0, 16)}...</div>
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(ad.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-400 capitalize">
                      {ad.metadata?.package || 'Unknown'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-400">
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button className="text-primary-400 hover:text-primary-300 text-sm">
                          View
                        </button>
                        <button className="text-gray-400 hover:text-white text-sm">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}



