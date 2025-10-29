'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Download, Code, ExternalLink, Copy, Check } from 'lucide-react';
import { cn } from '@/utils/brandHelpers';
import toast from 'react-hot-toast';

interface AdPreviewProps {
  adData: {
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
  };
  onDownload?: () => void;
}

export default function AdPreview({ adData, onDownload }: AdPreviewProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'html' | 'css' | 'javascript'>('preview');
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success(`${type} copied to clipboard!`);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const generateFullCode = () => {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AISim Ad - ${adData.id}</title>
    <style>${adData.css}</style>
</head>
<body>
    ${adData.html}
    <script>${adData.javascript}</script>
</body>
</html>`;
  };

  const generateEmbedCode = () => {
    return `<script>
(function() {
  const css = document.createElement('style');
  css.textContent = \`${adData.css}\`;
  document.head.appendChild(css);
  
  const container = document.createElement('div');
  container.innerHTML = \`${adData.html}\`;
  document.body.appendChild(container);
  
  ${adData.javascript}
})();
</script>`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="aisim-card"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gradient mb-2">
              Your AI-Generated Ad
            </h2>
            <p className="text-gray-400">
              Generated on {new Date(adData.metadata.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Estimated CTR</div>
              <div className="text-lg font-semibold text-primary-400">
                {adData.metadata.estimatedCTR}%
              </div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" title="Brand Compliant" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-surface p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('preview')}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all',
              activeTab === 'preview'
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-white'
            )}
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all',
              activeTab === 'code'
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-white'
            )}
          >
            <Code className="w-4 h-4" />
            <span>Code</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'preview' ? (
          <div className="space-y-6">
            {/* Live Preview */}
            <div className="bg-white rounded-lg p-8 min-h-[400px]">
              <div className="text-center text-gray-600 mb-4">
                Live Preview - Your ad will look like this:
              </div>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-4"
                dangerouslySetInnerHTML={{ 
                  __html: `
                    <style>${adData.css}</style>
                    ${adData.html}
                    <script>${adData.javascript}</script>
                  `
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={onDownload}
                className="aisim-button flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Package</span>
              </button>
              
              <button
                onClick={() => copyToClipboard(generateEmbedCode(), 'Embed Code')}
                className="bg-surface border border-border text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all flex items-center space-x-2"
              >
                {copied === 'Embed Code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>Copy Embed Code</span>
              </button>
              
              <button
                onClick={() => window.open(`/api/embed/${adData.id}`, '_blank')}
                className="bg-surface border border-border text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all flex items-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Full Page</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Code Tabs */}
            <div className="flex space-x-1 bg-surface p-1 rounded-lg">
              {['HTML', 'CSS', 'JavaScript', 'Full Code'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase() as any)}
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-400 hover:text-white transition-all"
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Code Display */}
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-400">Code</span>
                <button
                  onClick={() => {
                    const code = activeTab === 'html' ? adData.html :
                                activeTab === 'css' ? adData.css :
                                activeTab === 'javascript' ? adData.javascript :
                                generateFullCode();
                    copyToClipboard(code, activeTab.toUpperCase());
                  }}
                  className="text-gray-400 hover:text-white transition-all flex items-center space-x-1"
                >
                  {copied === activeTab.toUpperCase() ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="text-sm">Copy</span>
                </button>
              </div>
              
              <pre className="text-sm text-gray-300 overflow-x-auto">
                <code>
                  {activeTab === 'html' ? adData.html :
                   activeTab === 'css' ? adData.css :
                   activeTab === 'javascript' ? adData.javascript :
                   generateFullCode()}
                </code>
              </pre>
            </div>

            {/* Instructions */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <h3 className="font-semibold text-blue-400 mb-2">Implementation Instructions</h3>
              <ol className="text-sm text-blue-300 space-y-1 list-decimal list-inside">
                <li>Copy the embed code above</li>
                <li>Paste it before the closing &lt;/body&gt; tag on your website</li>
                <li>The ad will automatically appear based on your trigger settings</li>
                <li>Monitor performance in your analytics dashboard</li>
              </ol>
            </div>
          </div>
        )}

        {/* Ad Metadata */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-400 mb-1">Ad ID</div>
              <div className="font-mono text-white">{adData.id}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Package</div>
              <div className="text-white capitalize">{adData.metadata.package}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Brand Compliant</div>
              <div className="flex items-center space-x-2">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  adData.metadata.brandCompliant ? 'bg-green-500' : 'bg-red-500'
                )} />
                <span className="text-white">
                  {adData.metadata.brandCompliant ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
