import { AISIM_BRAND } from '../../config/brand.config';

export const AISIM_ADBLOCKER_AD_TEMPLATE = {
  meta: {
    name: 'AISim AdBlocker Promotion',
    description: 'Promotional popup ad for AISim AdBlocker Chrome extension',
    targetAudience: 'Web users frustrated with ads',
    brandColors: AISIM_BRAND.colors
  },
  
  content: {
    headline: "Block Ads. Browse Faster. Stay Private.",
    subheadline: "Experience the web without interruptions. AISim AdBlocker uses AI-powered filtering to block 99.9% of ads, trackers, and malware.",
    bullets: [
      "Lightning-fast page loads (up to 3x faster)",
      "Complete privacy protection with tracker blocking",
      "Zero performance impact on your browser",
      "Blocks video ads, popups, and banners automatically"
    ],
    trustElement: "Join 100,000+ users who browse ad-free",
    ctaText: "Install Free Now",
    ctaLink: "https://chrome.google.com/webstore/detail/aisim-adblocker"
  },

  html: `
<div id="aisim-adblocker-promo" class="aisim-popup-overlay">
  <div class="aisim-popup-container">
    <button class="aisim-popup-close">&times;</button>
    
    <div class="aisim-popup-header">
      <div class="aisim-shield-icon">🛡️</div>
      <div class="aisim-popup-tagline">AISim AdBlocker</div>
    </div>
    
    <div class="aisim-popup-body">
      <h2 class="aisim-popup-headline">Block Ads. Browse Faster. Stay Private.</h2>
      
      <p class="aisim-popup-description">
        Experience the web without interruptions. AISim AdBlocker uses 
        <strong>AI-powered filtering</strong> to block 99.9% of ads, trackers, and malware.
      </p>
      
      <ul class="aisim-popup-benefits">
        <li>
          <div class="benefit-icon">⚡</div>
          <div>
            <strong>Lightning-fast page loads</strong>
            <span>Up to 3x faster browsing</span>
          </div>
        </li>
        <li>
          <div class="benefit-icon">🔒</div>
          <div>
            <strong>Complete privacy protection</strong>
            <span>Block all trackers and analytics</span>
          </div>
        </li>
        <li>
          <div class="benefit-icon">🎯</div>
          <div>
            <strong>Zero performance impact</strong>
            <span>Native browser integration</span>
          </div>
        </li>
        <li>
          <div class="benefit-icon">🛡️</div>
          <div>
            <strong>Auto-block everything</strong>
            <span>Video ads, popups, banners</span>
          </div>
        </li>
      </ul>
      
      <div class="aisim-social-proof">
        <div class="aisim-stats">
          <div class="stat">
            <span class="stat-number">100K+</span>
            <span class="stat-label">Active Users</span>
          </div>
          <div class="stat">
            <span class="stat-number">4.9/5</span>
            <span class="stat-label">Rating</span>
          </div>
          <div class="stat">
            <span class="stat-number">99.9%</span>
            <span class="stat-label">Blocked</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="aisim-popup-footer">
      <a href="https://chrome.google.com/webstore/detail/aisim-adblocker" 
         class="aisim-popup-cta" id="aisim-install-btn">
        <span class="cta-icon">⬇️</span>
        Install Free Now
      </a>
      <p class="aisim-popup-privacy">
        🔒 100% Free • No Credit Card • Works on all websites
      </p>
    </div>
  </div>
</div>
  `,

  css: `
/* AISim AdBlocker Specific Styles */
.aisim-adblocker-ad .aisim-shield-icon {
  margin: 0 auto 16px;
  width: 60px;
  height: 60px;
  font-size: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.aisim-brand-text {
  background: ${AISIM_BRAND.colors.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: ${AISIM_BRAND.typography.fontWeights.bold};
}

.aisim-popup-tagline {
  font-size: 1.25rem;
  font-weight: ${AISIM_BRAND.typography.fontWeights.semibold};
  color: ${AISIM_BRAND.colors.text};
  text-align: center;
  margin-bottom: 16px;
}

.aisim-popup-description {
  font-size: 1rem;
  color: ${AISIM_BRAND.colors.textSecondary};
  text-align: center;
  margin-bottom: 24px;
  line-height: 1.6;
}

.aisim-popup-description strong {
  color: ${AISIM_BRAND.colors.primary};
}

/* Enhanced Benefits List */
.aisim-popup-benefits li {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: rgba(16, 185, 129, 0.05);
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.aisim-popup-benefits li:hover {
  background: rgba(16, 185, 129, 0.1);
  transform: translateX(4px);
}

.aisim-popup-benefits li:before {
  display: none; /* Override default checkmark */
}

.benefit-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.aisim-popup-benefits li div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.aisim-popup-benefits li strong {
  color: ${AISIM_BRAND.colors.text};
  font-size: 1rem;
}

.aisim-popup-benefits li span {
  color: ${AISIM_BRAND.colors.textSecondary};
  font-size: 0.875rem;
}

/* Social Proof Stats */
.aisim-social-proof {
  margin: 24px 0;
  padding: 16px;
  background: ${AISIM_BRAND.colors.background};
  border-radius: 8px;
  border: 1px solid ${AISIM_BRAND.colors.border};
}

.aisim-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: ${AISIM_BRAND.typography.fontWeights.bold};
  background: ${AISIM_BRAND.colors.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 4px;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: ${AISIM_BRAND.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Enhanced CTA Button */
.aisim-popup-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 1.125rem;
}

.cta-icon {
  display: inline-flex;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.aisim-popup-cta:hover .cta-icon {
  animation: none;
  transform: translateY(-2px);
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .aisim-stats {
    gap: 8px;
  }
  
  .stat-number {
    font-size: 1.25rem;
  }
  
  .aisim-popup-benefits li {
    flex-direction: column;
    text-align: center;
  }
}
  `,

  javascript: `
(function() {
  'use strict';
  
  const AISim_AdBlocker_Config = {
    trigger: 'time-delay',
    delayMs: 3000,
    frequency: 'once',
    targetPages: ['*'], // All pages
  };

  class AISim_AdBlocker_Popup {
    constructor(config) {
      this.config = config;
      this.shown = false;
      this.init();
    }

    init() {
      if (!this.shouldShow()) {
        return;
      }

      setTimeout(() => this.show(), this.config.delayMs);
      this.setupEventTracking();
    }

    shouldShow() {
      // Don't show if already installed
      if (this.isExtensionInstalled()) {
        return false;
      }

      const storageKey = 'aisim_adblocker_ad_shown';
      return !localStorage.getItem(storageKey);
    }

    isExtensionInstalled() {
      // Check if AISim AdBlocker is already installed
      // This would be a unique identifier your extension sets
      return document.documentElement.hasAttribute('data-aisim-adblocker');
    }

    show() {
      if (this.shown) return;

      const popup = document.getElementById('aisim-adblocker-promo');
      if (!popup) return;

      popup.classList.add('active');
      this.shown = true;

      // Track impression
      this.trackEvent('ad_impression');

      // Mark as shown
      localStorage.setItem('aisim_adblocker_ad_shown', Date.now().toString());

      // Setup close handlers
      this.setupCloseHandlers();
    }

    hide() {
      const popup = document.getElementById('aisim-adblocker-promo');
      if (!popup) return;

      popup.classList.remove('active');
      this.trackEvent('ad_closed');
    }

    setupCloseHandlers() {
      const closeBtn = document.querySelector('.aisim-popup-close');
      const overlay = document.getElementById('aisim-adblocker-promo');
      
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.hide());
      }

      if (overlay) {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            this.hide();
          }
        });
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.hide();
        }
      });
    }

    setupEventTracking() {
      const installBtn = document.getElementById('aisim-install-btn');
      
      if (installBtn) {
        installBtn.addEventListener('click', () => {
          this.trackEvent('ad_click');
          this.trackEvent('install_initiated');
          
          // Optional: Close popup after click
          setTimeout(() => this.hide(), 500);
        });
      }
    }

    trackEvent(eventName) {
      // Google Analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
          'ad_id': 'aisim_adblocker_promo',
          'ad_type': 'popup',
          'timestamp': Date.now()
        });
      }

      // Custom analytics endpoint
      fetch('https://api.aisim.com/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventName,
          adId: 'aisim_adblocker_promo',
          timestamp: Date.now(),
          url: window.location.href,
          referrer: document.referrer
        })
      }).catch(err => console.error('Analytics error:', err));
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new AISim_AdBlocker_Popup(AISim_AdBlocker_Config);
    });
  } else {
    new AISim_AdBlocker_Popup(AISim_AdBlocker_Config);
  }
})();
  `
};



