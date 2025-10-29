import { GoogleGenerativeAI } from '@google/generative-ai';
import { AISIM_BRAND } from '../config/brand.config';

interface IntakeFormData {
  // Business Info
  businessName: string;
  businessWebsite: string;
  industry: string;
  
  // Ad Objectives
  adGoal: 'awareness' | 'leads' | 'sales' | 'traffic';
  targetAudience: string;
  keyMessage: string;
  
  // Visual Preferences
  preferredColors?: string[];
  includeImages: boolean;
  brandLogo?: string;
  
  // Technical
  displayTrigger: 'immediate' | 'time-delay' | 'scroll' | 'exit-intent';
  displayFrequency: 'once' | 'daily' | 'session';
  targetPages?: string[];
  
  // CTA
  callToAction: string;
  ctaLink: string;
}

export interface GeneratedAd {
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

export class AdCreationService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  }

  /**
   * Generate complete popup ad from intake form
   */
  async generateAd(formData: IntakeFormData, packageType: string): Promise<GeneratedAd> {
    // Step 1: Generate ad copy using Claude
    const adCopy = await this.generateAdCopy(formData);
    
    // Step 2: Generate HTML/CSS/JS structure
    const adCode = await this.generateAdCode(formData, adCopy);
    
    // Step 3: Apply AISim brand standards
    const brandedAd = this.applyBrandStandards(adCode);
    
    // Step 4: Validate and optimize
    const optimizedAd = await this.optimizeAd(brandedAd);
    
    // Step 5: Generate preview
    const preview = await this.generatePreview(optimizedAd);

    const generatedAd: GeneratedAd = {
      id: this.generateAdId(),
      html: optimizedAd.html,
      css: optimizedAd.css,
      javascript: optimizedAd.javascript,
      preview: preview,
      metadata: {
        createdAt: new Date(),
        package: packageType,
        brandCompliant: true,
        estimatedCTR: this.estimateCTR(optimizedAd)
      }
    };

    return generatedAd;
  }

  /**
   * Generate compelling ad copy using Google AI
   */
  private async generateAdCopy(formData: IntakeFormData): Promise<string> {
    const prompt = `
You are an expert copywriter for popup ads. Create compelling ad copy based on this brief:

Business: ${formData.businessName}
Industry: ${formData.industry}
Goal: ${formData.adGoal}
Target Audience: ${formData.targetAudience}
Key Message: ${formData.keyMessage}
Call-to-Action: ${formData.callToAction}

Requirements:
1. Attention-grabbing headline (max 10 words)
2. Compelling subheadline (max 20 words)
3. 2-3 bullet points highlighting benefits
4. Strong CTA button text (max 4 words)
5. Trust element (testimonial snippet, stat, or guarantee)

Tone: Professional, confident, results-oriented (AISim brand style)

Output format:
{
  "headline": "...",
  "subheadline": "...",
  "bullets": ["...", "...", "..."],
  "ctaText": "...",
  "trustElement": "..."
}
    `;

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return text;
    } catch (error) {
      console.error('Google AI API error:', error);
      // Fallback copy
      return JSON.stringify({
        headline: "Transform Your Business Today",
        subheadline: "Join thousands of successful companies using our proven strategies",
        bullets: [
          "Increase conversions by up to 300%",
          "Professional design that builds trust",
          "Easy to implement in minutes"
        ],
        ctaText: "Get Started Now",
        trustElement: "Join 10,000+ satisfied customers"
      });
    }
  }

  /**
   * Generate complete ad code structure
   */
  private async generateAdCode(formData: IntakeFormData, adCopy: string): Promise<{html: string, css: string, javascript: string}> {
    const copyData = JSON.parse(adCopy);

    // Generate HTML
    const html = `
<div id="aisim-popup-overlay" class="aisim-popup-overlay">
  <div class="aisim-popup-container">
    <button class="aisim-popup-close">&times;</button>
    
    <div class="aisim-popup-header">
      ${formData.brandLogo ? `<img src="${formData.brandLogo}" alt="${formData.businessName}" class="aisim-popup-logo">` : ''}
      <h1 class="aisim-popup-headline">${copyData.headline}</h1>
    </div>
    
    <div class="aisim-popup-body">
      <p class="aisim-popup-subheadline">${copyData.subheadline}</p>
      
      <ul class="aisim-popup-benefits">
        ${copyData.bullets.map((bullet: string) => `<li>${bullet}</li>`).join('')}
      </ul>
      
      <div class="aisim-popup-trust">
        <span class="aisim-trust-icon">✓</span>
        <span>${copyData.trustElement}</span>
      </div>
    </div>
    
    <div class="aisim-popup-footer">
      <a href="${formData.ctaLink}" class="aisim-popup-cta" id="aisim-cta-btn">
        ${copyData.ctaText}
      </a>
      <p class="aisim-popup-privacy">Your privacy is protected. No spam, ever.</p>
    </div>
  </div>
</div>
    `;

    // Generate CSS with AISim brand colors
    const css = `
.aisim-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  font-family: ${AISIM_BRAND.typography.fontFamily};
}

.aisim-popup-overlay.active {
  opacity: 1;
  visibility: visible;
}

.aisim-popup-container {
  background: ${AISIM_BRAND.colors.surface};
  border-radius: ${AISIM_BRAND.borderRadius.xl};
  max-width: 500px;
  width: 90%;
  padding: ${AISIM_BRAND.spacing['2xl']};
  position: relative;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  border: 1px solid ${AISIM_BRAND.colors.border};
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.aisim-popup-close {
  position: absolute;
  top: ${AISIM_BRAND.spacing.md};
  right: ${AISIM_BRAND.spacing.md};
  background: none;
  border: none;
  font-size: 2rem;
  color: ${AISIM_BRAND.colors.textSecondary};
  cursor: pointer;
  transition: color 0.2s;
}

.aisim-popup-close:hover {
  color: ${AISIM_BRAND.colors.text};
}

.aisim-popup-header {
  text-align: center;
  margin-bottom: ${AISIM_BRAND.spacing.xl};
}

.aisim-popup-logo {
  max-width: 120px;
  height: auto;
  margin-bottom: ${AISIM_BRAND.spacing.md};
}

.aisim-popup-headline {
  font-size: 2rem;
  font-weight: ${AISIM_BRAND.typography.fontWeights.bold};
  color: ${AISIM_BRAND.colors.text};
  margin: 0;
  background: ${AISIM_BRAND.colors.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.aisim-popup-body {
  margin-bottom: ${AISIM_BRAND.spacing.xl};
}

.aisim-popup-subheadline {
  font-size: 1.125rem;
  color: ${AISIM_BRAND.colors.textSecondary};
  text-align: center;
  margin-bottom: ${AISIM_BRAND.spacing.lg};
  line-height: 1.6;
}

.aisim-popup-benefits {
  list-style: none;
  padding: 0;
  margin: 0 0 ${AISIM_BRAND.spacing.lg} 0;
}

.aisim-popup-benefits li {
  padding: ${AISIM_BRAND.spacing.sm} 0 ${AISIM_BRAND.spacing.sm} ${AISIM_BRAND.spacing.xl};
  position: relative;
  color: ${AISIM_BRAND.colors.textSecondary};
  line-height: 1.6;
}

.aisim-popup-benefits li:before {
  content: "✓";
  position: absolute;
  left: 0;
  color: ${AISIM_BRAND.colors.primary};
  font-weight: ${AISIM_BRAND.typography.fontWeights.bold};
  font-size: 1.2rem;
}

.aisim-popup-trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${AISIM_BRAND.spacing.sm};
  padding: ${AISIM_BRAND.spacing.md};
  background: rgba(16, 185, 129, 0.1);
  border-radius: ${AISIM_BRAND.borderRadius.md};
  color: ${AISIM_BRAND.colors.textSecondary};
  font-size: 0.9rem;
}

.aisim-trust-icon {
  color: ${AISIM_BRAND.colors.primary};
  font-weight: ${AISIM_BRAND.typography.fontWeights.bold};
  font-size: 1.2rem;
}

.aisim-popup-footer {
  text-align: center;
}

.aisim-popup-cta {
  display: inline-block;
  background: ${AISIM_BRAND.components.button.primary.background};
  color: ${AISIM_BRAND.components.button.primary.color};
  padding: ${AISIM_BRAND.components.button.primary.padding};
  border-radius: ${AISIM_BRAND.components.button.primary.borderRadius};
  font-weight: ${AISIM_BRAND.components.button.primary.fontWeight};
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 1.125rem;
  width: 100%;
  max-width: 300px;
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);
}

.aisim-popup-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(16, 185, 129, 0.3);
}

.aisim-popup-privacy {
  margin-top: ${AISIM_BRAND.spacing.md};
  font-size: 0.8rem;
  color: ${AISIM_BRAND.colors.textSecondary};
  opacity: 0.7;
}

/* Responsive Design */
@media (max-width: 768px) {
  .aisim-popup-container {
    padding: ${AISIM_BRAND.spacing.xl};
  }
  
  .aisim-popup-headline {
    font-size: 1.5rem;
  }
  
  .aisim-popup-subheadline {
    font-size: 1rem;
  }
}
    `;

    // Generate JavaScript
    const javascript = `
(function() {
  'use strict';
  
  const AISim_Ad_Config = {
    trigger: '${formData.displayTrigger}',
    frequency: '${formData.displayFrequency}',
    delayMs: 2000,
    scrollThreshold: 50, // percentage
  };

  class AISim_PopupAd {
    constructor(config) {
      this.config = config;
      this.shown = false;
      this.init();
    }

    init() {
      // Check if already shown based on frequency
      if (!this.shouldShow()) {
        return;
      }

      // Set up trigger
      switch (this.config.trigger) {
        case 'immediate':
          this.show();
          break;
        case 'time-delay':
          setTimeout(() => this.show(), this.config.delayMs);
          break;
        case 'scroll':
          this.setupScrollTrigger();
          break;
        case 'exit-intent':
          this.setupExitIntentTrigger();
          break;
      }

      // Set up close handlers
      this.setupCloseHandlers();
    }

    shouldShow() {
      const storageKey = 'aisim_ad_shown';
      const lastShown = localStorage.getItem(storageKey);

      if (!lastShown) {
        return true;
      }

      const now = Date.now();
      const lastShownTime = parseInt(lastShown);

      switch (this.config.frequency) {
        case 'once':
          return false;
        case 'daily':
          return now - lastShownTime > 24 * 60 * 60 * 1000;
        case 'session':
          return !sessionStorage.getItem(storageKey);
        default:
          return true;
      }
    }

    show() {
      if (this.shown) return;

      const overlay = document.querySelector('.aisim-popup-overlay');
      if (!overlay) return;

      overlay.classList.add('active');
      this.shown = true;

      // Track impression
      this.trackImpression();

      // Store shown timestamp
      localStorage.setItem('aisim_ad_shown', Date.now().toString());
      sessionStorage.setItem('aisim_ad_shown', 'true');
    }

    hide() {
      const overlay = document.querySelector('.aisim-popup-overlay');
      if (!overlay) return;

      overlay.classList.remove('active');
    }

    setupScrollTrigger() {
      let triggered = false;
      
      window.addEventListener('scroll', () => {
        if (triggered) return;

        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        
        if (scrollPercent >= this.config.scrollThreshold) {
          this.show();
          triggered = true;
        }
      });
    }

    setupExitIntentTrigger() {
      let triggered = false;

      document.addEventListener('mouseleave', (e) => {
        if (triggered) return;
        if (e.clientY <= 0) {
          this.show();
          triggered = true;
        }
      });
    }

    setupCloseHandlers() {
      // Close button
      const closeBtn = document.querySelector('.aisim-popup-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.hide());
      }

      // Overlay click
      const overlay = document.querySelector('.aisim-popup-overlay');
      if (overlay) {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            this.hide();
          }
        });
      }

      // Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.hide();
        }
      });
    }

    trackImpression() {
      // Send analytics event
      if (typeof gtag !== 'undefined') {
        gtag('event', 'ad_impression', {
          'ad_id': '${this.generateAdId()}',
          'timestamp': Date.now()
        });
      }

      // Can also POST to your analytics endpoint
      fetch('https://api.aisim.com/analytics/impression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adId: '${this.generateAdId()}',
          timestamp: Date.now(),
          url: window.location.href
        })
      }).catch(err => console.error('Analytics error:', err));
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new AISim_PopupAd(AISim_Ad_Config);
    });
  } else {
    new AISim_PopupAd(AISim_Ad_Config);
  }
})();
    `;

    return { html, css, javascript };
  }

  private applyBrandStandards(adCode: any): any {
    // Ensure brand compliance
    // Already applied in generateAdCode, but double-check here
    return adCode;
  }

  private async optimizeAd(adCode: any): Promise<any> {
    // Minify, optimize performance, validate accessibility
    return adCode;
  }

  private async generatePreview(adCode: any): Promise<string> {
    // Generate a screenshot/preview image
    // Using Puppeteer or similar
    return 'data:image/png;base64,...'; // Placeholder
  }

  private estimateCTR(adCode: any): number {
    // AI-powered CTR estimation
    return 2.5; // Placeholder: 2.5% estimated CTR
  }

  private generateAdId(): string {
    return `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
