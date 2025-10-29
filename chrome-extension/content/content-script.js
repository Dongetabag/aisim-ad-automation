// AISim AdBlocker Content Script
class AISimContentScript {
    constructor() {
        this.init();
    }

    init() {
        this.setupAdInjection();
        this.setupPromoAdDisplay();
        this.trackPageMetrics();
    }

    setupAdInjection() {
        // Inject AISim promotional ads on appropriate pages
        if (this.shouldShowPromoAd()) {
            this.injectPromoAd();
        }
    }

    shouldShowPromoAd() {
        // Check if we should show a promo ad on this page
        const url = window.location.href;
        const domain = window.location.hostname;
        
        // Don't show on AISim's own pages
        if (domain.includes('aisim.com')) return false;
        
        // Don't show on certain page types
        const skipPages = ['/login', '/signup', '/checkout', '/payment'];
        if (skipPages.some(page => url.includes(page))) return false;
        
        // Check if user has seen promo recently
        const lastShown = localStorage.getItem('aisim_promo_last_shown');
        if (lastShown && Date.now() - parseInt(lastShown) < 24 * 60 * 60 * 1000) {
            return false;
        }
        
        return true;
    }

    injectPromoAd() {
        // Create the AISim promotional popup
        const popup = document.createElement('div');
        popup.id = 'aisim-adblocker-promo';
        popup.className = 'aisim-popup-overlay';
        popup.innerHTML = this.getPromoAdHTML();
        
        document.body.appendChild(popup);
        
        // Initialize the popup behavior
        this.initializePromoPopup(popup);
        
        // Mark as shown
        localStorage.setItem('aisim_promo_last_shown', Date.now().toString());
    }

    getPromoAdHTML() {
        return `
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
        `;
    }

    initializePromoPopup(popup) {
        // Show popup with delay
        setTimeout(() => {
            popup.classList.add('active');
            this.trackEvent('promo_impression');
        }, 3000);

        // Close button
        const closeBtn = popup.querySelector('.aisim-popup-close');
        closeBtn.addEventListener('click', () => {
            this.hidePopup(popup);
            this.trackEvent('promo_closed');
        });

        // Overlay click
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                this.hidePopup(popup);
                this.trackEvent('promo_closed');
            }
        });

        // Install button
        const installBtn = popup.querySelector('#aisim-install-btn');
        installBtn.addEventListener('click', () => {
            this.trackEvent('promo_click');
            this.trackEvent('install_initiated');
        });

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hidePopup(popup);
                this.trackEvent('promo_closed');
            }
        });
    }

    hidePopup(popup) {
        popup.classList.remove('active');
        setTimeout(() => {
            popup.remove();
        }, 300);
    }

    setupPromoAdDisplay() {
        // Additional promotional content can be injected here
        // This could include banner ads, inline content, etc.
    }

    trackPageMetrics() {
        // Track page load time and other metrics
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            
            this.trackEvent('page_loaded', {
                url: window.location.href,
                loadTime: loadTime,
                timestamp: Date.now()
            });
        });
    }

    trackEvent(eventName, data = {}) {
        // Send analytics event to background script
        chrome.runtime.sendMessage({
            type: 'ANALYTICS_EVENT',
            event: eventName,
            data: {
                ...data,
                url: window.location.href,
                timestamp: Date.now()
            }
        });
    }
}

// Initialize content script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new AISimContentScript();
    });
} else {
    new AISimContentScript();
}



