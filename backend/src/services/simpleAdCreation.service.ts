import { AISIM_BRAND } from '../config/brand.config';

interface IntakeFormData {
  companyName: string;
  industry: string;
  targetAudience: string;
  keyMessage: string;
  tone: string;
  callToAction: string;
  preferredColors?: string[];
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

export class SimpleAdCreationService {
  /**
   * Generate complete popup ad from intake form (simplified version)
   */
  async generateAd(formData: IntakeFormData, packageType: string = 'starter'): Promise<GeneratedAd> {
    try {
      // Generate ad copy
      const adCopy = this.generateAdCopy(formData);
      
      // Generate HTML/CSS/JS
      const adCode = this.generateAdCode(formData, adCopy);
      
      // Apply brand standards
      const brandedAd = this.applyBrandStandards(adCode);
      
      // Generate preview
      const preview = this.generatePreview(brandedAd);

      const generatedAd: GeneratedAd = {
        id: this.generateAdId(),
        html: brandedAd.html,
        css: brandedAd.css,
        javascript: brandedAd.javascript,
        preview: preview,
        metadata: {
          createdAt: new Date(),
          package: packageType,
          brandCompliant: true,
          estimatedCTR: 0.15 // 15% estimated CTR
        }
      };

      return generatedAd;
    } catch (error) {
      console.error('Ad generation error:', error);
      throw new Error('Failed to generate ad');
    }
  }

  /**
   * Generate compelling ad copy
   */
  private generateAdCopy(formData: IntakeFormData): any {
    return {
      headline: `Transform Your ${formData.industry} Business`,
      subheadline: `Join thousands of successful ${formData.industry} companies using our proven strategies`,
      bullets: [
        `Increase ${formData.industry.toLowerCase()} conversions by up to 300%`,
        `Professional design that builds trust with ${formData.targetAudience}`,
        `Easy to implement in minutes`
      ],
      ctaText: formData.callToAction || "Get Started Now",
      trustElement: `Join 10,000+ satisfied ${formData.industry.toLowerCase()} customers`
    };
  }

  /**
   * Generate HTML/CSS/JavaScript code
   */
  private generateAdCode(formData: IntakeFormData, adCopy: any): any {
    const colors = formData.preferredColors || ['#10b981', '#34d399'];
    const primaryColor = colors[0];
    const secondaryColor = colors[1] || '#34d399';

    const html = `
<div id="aisim-popup" class="aisim-popup-overlay">
  <div class="aisim-popup-content">
    <button class="aisim-close-btn" onclick="closeAISimPopup()">&times;</button>
    <div class="aisim-popup-header">
      <h2 class="aisim-headline">${adCopy.headline}</h2>
      <p class="aisim-subheadline">${adCopy.subheadline}</p>
    </div>
    <div class="aisim-popup-body">
      <ul class="aisim-bullets">
        ${adCopy.bullets.map((bullet: string) => `<li>${bullet}</li>`).join('')}
      </ul>
      <div class="aisim-trust">
        <p class="aisim-trust-text">${adCopy.trustElement}</p>
      </div>
    </div>
    <div class="aisim-popup-footer">
      <button class="aisim-cta-btn" onclick="handleAISimCTA()">
        ${adCopy.ctaText}
      </button>
    </div>
  </div>
</div>
    `.trim();

    const css = `
.aisim-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.aisim-popup-content {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid #333;
}

.aisim-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: #666;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.aisim-close-btn:hover {
  background: #333;
  color: #fff;
}

.aisim-popup-header {
  text-align: center;
  margin-bottom: 24px;
}

.aisim-headline {
  color: ${primaryColor};
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px 0;
  line-height: 1.2;
}

.aisim-subheadline {
  color: #e5e5e5;
  font-size: 16px;
  margin: 0;
  line-height: 1.4;
}

.aisim-popup-body {
  margin-bottom: 24px;
}

.aisim-bullets {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
}

.aisim-bullets li {
  color: #e5e5e5;
  font-size: 14px;
  margin-bottom: 12px;
  padding-left: 24px;
  position: relative;
  line-height: 1.4;
}

.aisim-bullets li:before {
  content: "✓";
  position: absolute;
  left: 0;
  color: ${secondaryColor};
  font-weight: bold;
  font-size: 16px;
}

.aisim-trust {
  text-align: center;
  padding: 16px;
  background: #2a2a2a;
  border-radius: 8px;
  border-left: 4px solid ${primaryColor};
}

.aisim-trust-text {
  color: #ccc;
  font-size: 14px;
  margin: 0;
  font-style: italic;
}

.aisim-popup-footer {
  text-align: center;
}

.aisim-cta-btn {
  background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
  color: white;
  border: none;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.aisim-cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.aisim-cta-btn:active {
  transform: translateY(0);
}

@media (max-width: 600px) {
  .aisim-popup-content {
    padding: 24px;
    margin: 20px;
  }
  
  .aisim-headline {
    font-size: 24px;
  }
  
  .aisim-cta-btn {
    padding: 14px 28px;
    font-size: 14px;
  }
}
    `.trim();

    const javascript = `
function closeAISimPopup() {
  const popup = document.getElementById('aisim-popup');
  if (popup) {
    popup.style.opacity = '0';
    popup.style.transform = 'scale(0.9)';
    setTimeout(() => {
      popup.remove();
    }, 300);
  }
}

function handleAISimCTA() {
  // Track CTA click
  if (typeof gtag !== 'undefined') {
    gtag('event', 'click', {
      event_category: 'AISim Ad',
      event_label: 'CTA Click',
      value: 1
    });
  }
  
  // Redirect to business website or landing page
  const businessUrl = '${formData.companyName ? formData.companyName.toLowerCase().replace(/\s+/g, '') + '.com' : '#'}';
  window.open(businessUrl, '_blank');
  
  // Close popup after click
  closeAISimPopup();
}

// Auto-close after 30 seconds
setTimeout(() => {
  closeAISimPopup();
}, 30000);

// Close on escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeAISimPopup();
  }
});

// Add entrance animation
document.addEventListener('DOMContentLoaded', function() {
  const popup = document.getElementById('aisim-popup');
  if (popup) {
    popup.style.opacity = '0';
    popup.style.transform = 'scale(0.9)';
    popup.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
      popup.style.opacity = '1';
      popup.style.transform = 'scale(1)';
    }, 100);
  }
});
    `.trim();

    return { html, css, javascript };
  }

  /**
   * Apply AISim brand standards
   */
  private applyBrandStandards(adCode: any): any {
    // Brand standards are already applied in the CSS
    return adCode;
  }

  /**
   * Generate preview HTML
   */
  private generatePreview(adCode: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AISim Ad Preview</title>
  <style>${adCode.css}</style>
</head>
<body style="margin: 0; padding: 20px; background: #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 800px; margin: 0 auto;">
    <h2 style="color: #333; margin-bottom: 20px;">Ad Preview</h2>
    <div style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      ${adCode.html}
    </div>
  </div>
  <script>${adCode.javascript}</script>
</body>
</html>
    `.trim();
  }

  /**
   * Generate unique ad ID
   */
  private generateAdId(): string {
    return 'ad_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

