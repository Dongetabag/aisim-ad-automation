// AISim AdBlocker Popup Script
class AISimPopup {
    constructor() {
        this.init();
    }

    init() {
        this.loadStats();
        this.setupEventListeners();
        this.loadPromoAd();
    }

    async loadStats() {
        try {
            const result = await chrome.storage.local.get([
                'adsBlocked',
                'timeSaved',
                'dataSaved',
                'sitesWhitelisted'
            ]);

            const adsBlocked = result.adsBlocked || 0;
            const timeSaved = result.timeSaved || 0;
            const dataSaved = result.dataSaved || 0;

            document.getElementById('adsBlocked').textContent = adsBlocked.toLocaleString();
            document.getElementById('timeSaved').textContent = this.formatTime(timeSaved);
            document.getElementById('dataSaved').textContent = this.formatData(dataSaved);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    setupEventListeners() {
        // Whitelist button
        document.getElementById('whitelistBtn').addEventListener('click', () => {
            this.whitelistCurrentSite();
        });

        // Settings button
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openSettings();
        });

        // Promo close button
        document.getElementById('promoClose').addEventListener('click', () => {
            this.hidePromo();
        });

        // Promo CTA button
        document.getElementById('promoCTA').addEventListener('click', () => {
            this.openUpgradePage();
        });
    }

    async whitelistCurrentSite() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const url = new URL(tab.url);
            const domain = url.hostname;

            const result = await chrome.storage.local.get(['sitesWhitelisted']);
            const whitelisted = result.sitesWhitelisted || [];

            if (!whitelisted.includes(domain)) {
                whitelisted.push(domain);
                await chrome.storage.local.set({ sitesWhitelisted: whitelisted });
                
                // Update button state
                const btn = document.getElementById('whitelistBtn');
                btn.innerHTML = '<span class="btn-icon">✅</span> Whitelisted';
                btn.classList.add('whitelisted');
                
                // Show success message
                this.showNotification('Site whitelisted successfully!');
            } else {
                this.showNotification('Site is already whitelisted');
            }
        } catch (error) {
            console.error('Failed to whitelist site:', error);
            this.showNotification('Failed to whitelist site');
        }
    }

    openSettings() {
        chrome.tabs.create({ url: 'chrome://extensions/?options=' + chrome.runtime.id });
    }

    hidePromo() {
        const promoSection = document.getElementById('promoSection');
        promoSection.style.display = 'none';
        
        // Store preference
        chrome.storage.local.set({ promoHidden: true });
    }

    openUpgradePage() {
        chrome.tabs.create({ 
            url: 'https://aisim.com/upgrade?source=extension' 
        });
    }

    async loadPromoAd() {
        try {
            const result = await chrome.storage.local.get(['promoHidden']);
            if (result.promoHidden) {
                document.getElementById('promoSection').style.display = 'none';
                return;
            }

            // Check if user should see promo (e.g., after blocking 10+ ads)
            const stats = await chrome.storage.local.get(['adsBlocked']);
            if (stats.adsBlocked < 10) {
                document.getElementById('promoSection').style.display = 'none';
                return;
            }

            // Load dynamic promo content
            this.loadDynamicPromo();
        } catch (error) {
            console.error('Failed to load promo ad:', error);
        }
    }

    async loadDynamicPromo() {
        try {
            // In a real implementation, this would fetch from your API
            const promoData = {
                title: "Upgrade to AISim Pro",
                description: "Get advanced features, priority support, and custom ad filtering",
                ctaText: "Learn More",
                ctaUrl: "https://aisim.com/upgrade"
            };

            // Update promo content
            document.querySelector('.promo-title').textContent = promoData.title;
            document.querySelector('.promo-description').textContent = promoData.description;
            document.getElementById('promoCTA').textContent = promoData.ctaText;

            // Track promo impression
            this.trackEvent('promo_impression', {
                promo_type: 'upgrade',
                source: 'popup'
            });
        } catch (error) {
            console.error('Failed to load dynamic promo:', error);
        }
    }

    trackEvent(eventName, data = {}) {
        // Send analytics event
        chrome.runtime.sendMessage({
            type: 'ANALYTICS_EVENT',
            event: eventName,
            data: {
                ...data,
                timestamp: Date.now(),
                source: 'popup'
            }
        });
    }

    showNotification(message) {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            animation: slideDown 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    formatTime(seconds) {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }

    formatData(bytes) {
        if (bytes < 1024) return `${bytes}B`;
        const kb = bytes / 1024;
        if (kb < 1024) return `${Math.round(kb)}KB`;
        const mb = kb / 1024;
        return `${Math.round(mb)}MB`;
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AISimPopup();
});

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    .action-btn.whitelisted {
        background: #10b981 !important;
        color: white !important;
    }
`;
document.head.appendChild(style);



