// StudXchange Analytics Tracking System
// This script tracks page views, API calls, and user interactions

class StudXAnalytics {
    constructor() {
        this.sessionId = this.getOrCreateSessionId()
        this.userId = this.getUserId()
        this.startTime = Date.now()
        this.apiCallsBuffer = []
        this.eventsBuffer = []
        this.isTracking = true
        
        // Initialize tracking
        this.init()
    }
    
    init() {
        // Track initial page view
        this.trackPageView()
        
        // Set up event listeners
        this.setupEventListeners()
        
        // Set up API call tracking
        this.setupApiTracking()
        
        // Send buffered data periodically
        setInterval(() => this.flushBuffers(), 10000) // Every 10 seconds
        
        // Send data before page unload
        window.addEventListener('beforeunload', () => this.flushBuffers())
        
        console.log('📊 StudX Analytics initialized with session:', this.sessionId.substring(0, 8))
    }
    
    getOrCreateSessionId() {
        let sessionId = sessionStorage.getItem('studx_session_id')
        if (!sessionId) {
            sessionId = this.generateId()
            sessionStorage.setItem('studx_session_id', sessionId)
        }
        return sessionId
    }
    
    getUserId() {
        // Try to get user ID from localStorage or cookies
        return localStorage.getItem('studx_user_id') || null
    }
    
    generateId() {
        return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
    }
    
    async trackPageView(page = window.location.pathname) {
        if (!this.isTracking) return
        
        try {
            const data = {
                action: 'track_page_view',
                data: {
                    page: page,
                    pageTitle: document.title,
                    userAgent: navigator.userAgent,
                    ip: await this.getClientIP(),
                    referrer: document.referrer,
                    sessionId: this.sessionId,
                    userId: this.userId,
                    timestamp: new Date().toISOString(),
                    screenResolution: `${screen.width}x${screen.height}`,
                    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
                    language: navigator.language,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            }
            
            await this.sendAnalyticsData(data)
            console.log('📊 Page view tracked:', page)
        } catch (error) {
            console.error('❌ Error tracking page view:', error)
        }
    }
    
    async trackApiCall(endpoint, method, statusCode, responseTime, error = null) {
        if (!this.isTracking) return
        
        const callData = {
            endpoint: endpoint,
            method: method,
            statusCode: statusCode,
            responseTime: responseTime,
            userAgent: navigator.userAgent,
            ip: await this.getClientIP(),
            userId: this.userId,
            sessionId: this.sessionId,
            error: error,
            timestamp: new Date().toISOString()
        }
        
        this.apiCallsBuffer.push(callData)
        
        // Send immediately if it's an error or buffer is full
        if (statusCode >= 400 || this.apiCallsBuffer.length >= 5) {
            this.flushApiCalls()
        }
    }
    
    async trackEvent(eventType, eventName, eventData = {}) {
        if (!this.isTracking) return
        
        const eventInfo = {
            eventType: eventType,
            eventName: eventName,
            eventData: eventData,
            page: window.location.pathname,
            sessionId: this.sessionId,
            userId: this.userId,
            timestamp: new Date().toISOString()
        }
        
        this.eventsBuffer.push(eventInfo)
        console.log('📊 Event tracked:', eventType, eventName)
    }
    
    setupEventListeners() {
        // Track clicks on important elements
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a, button, [data-track]')
            if (target) {
                let eventName = target.getAttribute('data-track') || 
                               target.textContent?.trim().substring(0, 50) ||
                               target.tagName.toLowerCase()
                
                this.trackEvent('click', eventName, {
                    element: target.tagName,
                    className: target.className,
                    href: target.href,
                    id: target.id
                })
            }
        })
        
        // Track form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target
            const formName = form.getAttribute('name') || 
                           form.getAttribute('id') || 
                           'unnamed_form'
            
            this.trackEvent('form_submit', formName, {
                action: form.action,
                method: form.method
            })
        })
        
        // Track scroll depth
        let maxScrollDepth = 0
        window.addEventListener('scroll', () => {
            const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth
                
                // Track milestone scroll depths
                if ([25, 50, 75, 90, 100].includes(scrollDepth)) {
                    this.trackEvent('scroll', `scroll_${scrollDepth}%`, {
                        depth: scrollDepth,
                        page: window.location.pathname
                    })
                }
            }
        })
        
        // Track time on page
        let timeOnPage = 0
        setInterval(() => {
            timeOnPage += 1
            // Track every 30 seconds
            if (timeOnPage % 30 === 0) {
                this.trackEvent('engagement', 'time_on_page', {
                    seconds: timeOnPage,
                    page: window.location.pathname
                })
            }
        }, 1000)
    }
    
    setupApiTracking() {
        // Intercept fetch requests
        const originalFetch = window.fetch
        window.fetch = async (...args) => {
            const startTime = Date.now()
            
            try {
                const response = await originalFetch(...args)
                const responseTime = Date.now() - startTime
                
                // Extract endpoint from URL
                const url = typeof args[0] === 'string' ? args[0] : args[0].url
                const method = args[1]?.method || 'GET'
                
                this.trackApiCall(
                    this.cleanEndpoint(url),
                    method,
                    response.status,
                    responseTime
                )
                
                return response
            } catch (error) {
                const responseTime = Date.now() - startTime
                const url = typeof args[0] === 'string' ? args[0] : args[0].url
                const method = args[1]?.method || 'GET'
                
                this.trackApiCall(
                    this.cleanEndpoint(url),
                    method,
                    0,
                    responseTime,
                    error.message
                )
                
                throw error
            }
        }
        
        // Intercept XMLHttpRequest
        const originalXHROpen = XMLHttpRequest.prototype.open
        const originalXHRSend = XMLHttpRequest.prototype.send
        
        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            this._trackingData = {
                method: method,
                url: url,
                startTime: Date.now()
            }
            return originalXHROpen.call(this, method, url, ...args)
        }
        
        XMLHttpRequest.prototype.send = function(...args) {
            if (this._trackingData) {
                this.addEventListener('loadend', () => {
                    const responseTime = Date.now() - this._trackingData.startTime
                    window.studxAnalytics.trackApiCall(
                        window.studxAnalytics.cleanEndpoint(this._trackingData.url),
                        this._trackingData.method,
                        this.status,
                        responseTime
                    )
                })
            }
            return originalXHRSend.call(this, ...args)
        }
    }
    
    cleanEndpoint(url) {
        try {
            const urlObj = new URL(url, window.location.origin)
            // Remove query parameters and hash for cleaner grouping
            return urlObj.pathname
        } catch {
            return url
        }
    }
    
    async getClientIP() {
        try {
            // Try to get IP from a free service (optional, fallback to server-side detection)
            const response = await fetch('https://api.ipify.org?format=json')
            const data = await response.json()
            return data.ip
        } catch {
            return 'unknown'
        }
    }
    
    async flushBuffers() {
        await Promise.all([
            this.flushApiCalls(),
            this.flushEvents()
        ])
    }
    
    async flushApiCalls() {
        if (this.apiCallsBuffer.length === 0) return
        
        const calls = [...this.apiCallsBuffer]
        this.apiCallsBuffer = []
        
        try {
            for (const call of calls) {
                await this.sendAnalyticsData({
                    action: 'track_api_call',
                    data: call
                })
            }
            console.log(`📊 Flushed ${calls.length} API call(s)`)
        } catch (error) {
            console.error('❌ Error flushing API calls:', error)
            // Put back the failed calls
            this.apiCallsBuffer.unshift(...calls)
        }
    }
    
    async flushEvents() {
        if (this.eventsBuffer.length === 0) return
        
        const events = [...this.eventsBuffer]
        this.eventsBuffer = []
        
        try {
            // Send events to analytics endpoint
            await fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'track_events',
                    data: events
                })
            })
            console.log(`📊 Flushed ${events.length} event(s)`)
        } catch (error) {
            console.error('❌ Error flushing events:', error)
            // Put back the failed events
            this.eventsBuffer.unshift(...events)
        }
    }
    
    async sendAnalyticsData(data) {
        try {
            await fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
        } catch (error) {
            console.error('❌ Error sending analytics data:', error)
        }
    }
    
    // Public methods for manual tracking
    trackCustomEvent(eventName, eventData = {}) {
        this.trackEvent('custom', eventName, eventData)
    }
    
    trackConversion(conversionName, value = 0) {
        this.trackEvent('conversion', conversionName, { value })
    }
    
    trackError(error, context = {}) {
        this.trackEvent('error', error.message || 'Unknown error', {
            stack: error.stack,
            context: context
        })
    }
    
    // Admin methods
    disable() {
        this.isTracking = false
        console.log('📊 Analytics tracking disabled')
    }
    
    enable() {
        this.isTracking = true
        console.log('📊 Analytics tracking enabled')
    }
    
    getSessionInfo() {
        return {
            sessionId: this.sessionId,
            userId: this.userId,
            startTime: this.startTime,
            bufferedApiCalls: this.apiCallsBuffer.length,
            bufferedEvents: this.eventsBuffer.length
        }
    }
}

// Initialize analytics when DOM is loaded
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        window.studxAnalytics = new StudXAnalytics()
        
        // Track page changes for SPA (Single Page Applications)
        let currentPath = window.location.pathname
        setInterval(() => {
            if (window.location.pathname !== currentPath) {
                currentPath = window.location.pathname
                window.studxAnalytics.trackPageView(currentPath)
            }
        }, 1000)
    })
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StudXAnalytics
}
