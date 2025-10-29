// AISim AdBlocker Service Worker
class AISimAdBlocker {
    constructor() {
        this.init();
    }

    init() {
        this.setupWebRequestListener();
        this.setupMessageListener();
        this.loadAdFilters();
        this.initializeStats();
    }

    setupWebRequestListener() {
        chrome.webRequest.onBeforeRequest.addListener(
            (details) => {
                if (this.shouldBlockRequest(details)) {
                    this.trackBlockedAd(details);
                    return { cancel: true };
                }
            },
            { urls: ["<all_urls>"] },
            ["requestBody"]
        );
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            switch (message.type) {
                case 'ANALYTICS_EVENT':
                    this.handleAnalyticsEvent(message.event, message.data);
                    break;
                case 'GET_STATS':
                    this.getStats().then(sendResponse);
                    return true;
                case 'WHITELIST_SITE':
                    this.whitelistSite(message.domain);
                    break;
            }
        });
    }

    async loadAdFilters() {
        try {
            const result = await chrome.storage.local.get(['adFilters']);
            if (!result.adFilters) {
                // Load default filters
                const defaultFilters = await this.loadDefaultFilters();
                await chrome.storage.local.set({ adFilters: defaultFilters });
            }
        } catch (error) {
            console.error('Failed to load ad filters:', error);
        }
    }

    async loadDefaultFilters() {
        // Default ad blocking patterns
        return [
            'doubleclick.net',
            'googlesyndication.com',
            'googleadservices.com',
            'facebook.com/tr',
            'amazon-adsystem.com',
            'adsystem.amazon.com',
            'googletagmanager.com/gtag/js',
            'google-analytics.com/analytics.js',
            'facebook.com/connect',
            'twitter.com/i/adsct',
            'linkedin.com/li.lms',
            'snapchat.com/tr',
            'tiktok.com/i18n/pixel',
            'ads.yahoo.com',
            'bing.com/ads',
            'outbrain.com',
            'taboola.com',
            'criteo.com',
            'adsrvr.org',
            'adnxs.com'
        ];
    }

    shouldBlockRequest(details) {
        const url = details.url.toLowerCase();
        
        // Check if site is whitelisted
        if (this.isSiteWhitelisted(details.initiator)) {
            return false;
        }

        // Check against ad filters
        return this.adFilters.some(filter => url.includes(filter));
    }

    isSiteWhitelisted(initiator) {
        // Check if the initiating site is whitelisted
        if (!initiator) return false;
        
        const domain = new URL(initiator).hostname;
        return this.whitelistedSites.includes(domain);
    }

    async trackBlockedAd(details) {
        try {
            const result = await chrome.storage.local.get(['adsBlocked', 'dataSaved']);
            const adsBlocked = (result.adsBlocked || 0) + 1;
            const dataSaved = (result.dataSaved || 0) + this.estimateDataSize(details);
            
            await chrome.storage.local.set({
                adsBlocked: adsBlocked,
                dataSaved: dataSaved,
                lastBlocked: Date.now()
            });

            // Send analytics event
            this.sendAnalyticsEvent('ad_blocked', {
                url: details.url,
                type: details.type,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Failed to track blocked ad:', error);
        }
    }

    estimateDataSize(details) {
        // Rough estimate of data size based on request type
        const type = details.type;
        switch (type) {
            case 'script': return 50000; // ~50KB
            case 'image': return 20000;  // ~20KB
            case 'xmlhttprequest': return 10000; // ~10KB
            default: return 5000; // ~5KB
        }
    }

    async getStats() {
        const result = await chrome.storage.local.get([
            'adsBlocked',
            'timeSaved',
            'dataSaved',
            'sitesWhitelisted'
        ]);
        
        return {
            adsBlocked: result.adsBlocked || 0,
            timeSaved: result.timeSaved || 0,
            dataSaved: result.dataSaved || 0,
            sitesWhitelisted: result.sitesWhitelisted || []
        };
    }

    async whitelistSite(domain) {
        try {
            const result = await chrome.storage.local.get(['sitesWhitelisted']);
            const whitelisted = result.sitesWhitelisted || [];
            
            if (!whitelisted.includes(domain)) {
                whitelisted.push(domain);
                await chrome.storage.local.set({ sitesWhitelisted: whitelisted });
                
                this.sendAnalyticsEvent('site_whitelisted', {
                    domain: domain,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            console.error('Failed to whitelist site:', error);
        }
    }

    sendAnalyticsEvent(eventName, data) {
        // Send to analytics endpoint
        fetch('https://api.aisim.com/analytics/event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event: eventName,
                data: data,
                source: 'adblocker_extension'
            })
        }).catch(error => {
            console.error('Failed to send analytics event:', error);
        });
    }

    async initializeStats() {
        const result = await chrome.storage.local.get(['adsBlocked']);
        if (!result.adsBlocked) {
            await chrome.storage.local.set({
                adsBlocked: 0,
                timeSaved: 0,
                dataSaved: 0,
                sitesWhitelisted: []
            });
        }
    }
}

// Initialize the ad blocker
new AISimAdBlocker();



