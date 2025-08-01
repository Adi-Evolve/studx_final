/**
 * StudX Sponsored Product Display System
 * Professional implementation for contextual sponsored product placement
 */

class SponsoredProductManager {
    constructor() {
        this.supabaseUrl = 'https://vdpmumstdxgftaaxeacx.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcG11bXN0ZHhnZnRhYXhlYWN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDQyMzQyNywiZXhwIjoyMDUwMDAwNDI3fQ.EAbUAWsQtBuA3pltyQDNKpJGHlX7Z8d1Lob8IjYglmQ';
        this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Main method to display sponsored products on any page
     * @param {string} containerId - DOM element ID where to display sponsored products
     * @param {Object} options - Configuration options
     */
    async displaySponsored(containerId, options = {}) {
        const defaultOptions = {
            maxItems: 3,
            displayType: 'grid', // 'grid', 'carousel', 'banner', 'sidebar'
            category: null,
            searchQuery: null,
            currentPage: 'general',
            showBadge: true,
            responsiveColumns: { xs: 1, sm: 2, md: 3, lg: 4 }
        };

        const config = { ...defaultOptions, ...options };
        const container = document.getElementById(containerId);

        if (!container) {
            console.warn(`Sponsored Products: Container ${containerId} not found`);
            return;
        }

        try {
            // Show loading state
            this.showLoadingState(container);

            // Get sponsored products
            const sponsoredProducts = await this.getSponsoredProducts(config);

            if (sponsoredProducts.length === 0) {
                this.hideContainer(container);
                return;
            }

            // Render sponsored products
            this.renderSponsoredProducts(container, sponsoredProducts, config);

            // Track display analytics
            this.trackDisplayAnalytics(sponsoredProducts, config);

        } catch (error) {
            console.error('Error displaying sponsored products:', error);
            this.hideContainer(container);
        }
    }

    /**
     * Get sponsored products from database with smart filtering
     */
    async getSponsoredProducts(config) {
        const cacheKey = `sponsored_${JSON.stringify(config)}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            // Get active sponsorships
            const { data: sponsorships, error } = await this.supabase
                .from('sponsorship_sequences')
                .select('*')
                .order('slot_number', { ascending: true })
                .limit(config.maxItems * 2); // Get more for filtering

            if (error) throw error;

            // Get detailed product information
            const sponsoredProducts = await this.enrichSponsorshipData(sponsorships, config);

            // Apply contextual filtering
            const filteredProducts = this.applyContextualFiltering(sponsoredProducts, config);

            // Limit to max items
            const finalProducts = filteredProducts.slice(0, config.maxItems);

            // Cache results
            this.cache.set(cacheKey, {
                data: finalProducts,
                timestamp: Date.now()
            });

            return finalProducts;

        } catch (error) {
            console.error('Error fetching sponsored products:', error);
            return [];
        }
    }

    /**
     * Enrich sponsorship data with product details
     */
    async enrichSponsorshipData(sponsorships, config) {
        const enrichedProducts = [];

        for (const sponsorship of sponsorships) {
            try {
                let productData = null;

                // Get product data based on item type
                switch (sponsorship.item_type) {
                    case 'product':
                        const { data: product } = await this.supabase
                            .from('products')
                            .select('*')
                            .eq('id', sponsorship.item_id)
                            .single();
                        productData = product;
                        break;

                    case 'note':
                        const { data: note } = await this.supabase
                            .from('notes')
                            .select('*')
                            .eq('id', sponsorship.item_id)
                            .single();
                        productData = note;
                        break;

                    case 'room':
                        const { data: room } = await this.supabase
                            .from('rooms')
                            .select('*')
                            .eq('id', sponsorship.item_id)
                            .single();
                        productData = room;
                        break;
                }

                if (productData) {
                    enrichedProducts.push({
                        ...productData,
                        sponsorship: sponsorship,
                        isSponsored: true,
                        sponsorSlot: sponsorship.slot_number
                    });
                }

            } catch (error) {
                console.warn(`Error enriching sponsorship ${sponsorship.id}:`, error);
            }
        }

        return enrichedProducts;
    }

    /**
     * Apply contextual filtering based on page context
     */
    applyContextualFiltering(products, config) {
        let filtered = [...products];

        // Filter by category if specified
        if (config.category) {
            filtered = filtered.filter(product => 
                product.category?.toLowerCase().includes(config.category.toLowerCase()) ||
                product.tags?.some(tag => tag.toLowerCase().includes(config.category.toLowerCase()))
            );
        }

        // Filter by search query if specified
        if (config.searchQuery) {
            const query = config.searchQuery.toLowerCase();
            filtered = filtered.filter(product =>
                product.title?.toLowerCase().includes(query) ||
                product.description?.toLowerCase().includes(query) ||
                product.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Page-specific filtering
        switch (config.currentPage) {
            case 'search':
                // Prioritize products matching search intent
                break;
            case 'category':
                // Show category-relevant sponsored products
                break;
            case 'product':
                // Show complementary products
                break;
            case 'homepage':
                // Show popular/featured sponsored products
                filtered = filtered.filter(product => product.sponsorSlot <= 5);
                break;
        }

        return filtered;
    }

    /**
     * Render sponsored products in the container
     */
    renderSponsoredProducts(container, products, config) {
        const html = this.generateSponsoredHTML(products, config);
        container.innerHTML = html;

        // Add click event listeners
        this.attachEventListeners(container, products, config);

        // Add responsive classes
        this.applyResponsiveClasses(container, config);
    }

    /**
     * Generate HTML for sponsored products
     */
    generateSponsoredHTML(products, config) {
        const containerClass = `sponsored-${config.displayType}`;
        const badgeHTML = config.showBadge ? '<span class="sponsored-badge">Sponsored</span>' : '';

        switch (config.displayType) {
            case 'grid':
                return `
                    <div class="sponsored-container ${containerClass}">
                        <div class="sponsored-header">
                            <h5><i class="fas fa-star text-warning"></i> Sponsored Products</h5>
                        </div>
                        <div class="row">
                            ${products.map(product => `
                                <div class="col-lg-${12/config.responsiveColumns.lg} col-md-${12/config.responsiveColumns.md} col-sm-${12/config.responsiveColumns.sm} col-${12/config.responsiveColumns.xs} mb-3">
                                    <div class="sponsored-product-card" data-product-id="${product.id}" data-sponsor-slot="${product.sponsorSlot}">
                                        ${badgeHTML}
                                        <div class="product-image">
                                            <img src="${product.image_url || product.images?.[0] || '/api/placeholder/300/200'}" 
                                                 alt="${product.title || product.name}" 
                                                 class="img-fluid rounded">
                                        </div>
                                        <div class="product-info">
                                            <h6 class="product-title">${product.title || product.name}</h6>
                                            <p class="product-price">
                                                ${product.price ? `₹${product.price}` : 'View Details'}
                                            </p>
                                            <div class="product-meta">
                                                <span class="badge bg-secondary">${product.category || product.item_type}</span>
                                                ${product.college ? `<span class="badge bg-info">${product.college}</span>` : ''}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;

            case 'carousel':
                return `
                    <div class="sponsored-container ${containerClass}">
                        <div class="sponsored-header">
                            <h5><i class="fas fa-star text-warning"></i> Sponsored Products</h5>
                        </div>
                        <div class="sponsored-carousel">
                            <div class="carousel-track">
                                ${products.map(product => `
                                    <div class="carousel-item sponsored-product-card" data-product-id="${product.id}" data-sponsor-slot="${product.sponsorSlot}">
                                        ${badgeHTML}
                                        <img src="${product.image_url || product.images?.[0] || '/api/placeholder/200/150'}" 
                                             alt="${product.title || product.name}" class="carousel-image">
                                        <div class="carousel-content">
                                            <h6>${product.title || product.name}</h6>
                                            <p class="price">${product.price ? `₹${product.price}` : 'View Details'}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `;

            case 'banner':
                const featuredProduct = products[0];
                return `
                    <div class="sponsored-container ${containerClass}">
                        <div class="sponsored-banner sponsored-product-card" data-product-id="${featuredProduct.id}" data-sponsor-slot="${featuredProduct.sponsorSlot}">
                            ${badgeHTML}
                            <div class="banner-content">
                                <div class="banner-image">
                                    <img src="${featuredProduct.image_url || featuredProduct.images?.[0] || '/api/placeholder/400/200'}" 
                                         alt="${featuredProduct.title || featuredProduct.name}">
                                </div>
                                <div class="banner-info">
                                    <h4>${featuredProduct.title || featuredProduct.name}</h4>
                                    <p>${featuredProduct.description?.substring(0, 100) || ''}...</p>
                                    <div class="banner-price">
                                        ${featuredProduct.price ? `₹${featuredProduct.price}` : 'View Details'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

            case 'sidebar':
                return `
                    <div class="sponsored-container ${containerClass}">
                        <div class="sponsored-header">
                            <h6><i class="fas fa-star text-warning"></i> Sponsored</h6>
                        </div>
                        <div class="sponsored-sidebar-items">
                            ${products.map(product => `
                                <div class="sidebar-item sponsored-product-card" data-product-id="${product.id}" data-sponsor-slot="${product.sponsorSlot}">
                                    ${badgeHTML}
                                    <div class="sidebar-image">
                                        <img src="${product.image_url || product.images?.[0] || '/api/placeholder/100/80'}" 
                                             alt="${product.title || product.name}">
                                    </div>
                                    <div class="sidebar-content">
                                        <h6>${(product.title || product.name).substring(0, 50)}...</h6>
                                        <p class="price">${product.price ? `₹${product.price}` : 'View Details'}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;

            default:
                return '';
        }
    }

    /**
     * Attach click event listeners for analytics tracking
     */
    attachEventListeners(container, products, config) {
        const productCards = container.querySelectorAll('.sponsored-product-card');
        
        productCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const productId = card.dataset.productId;
                const sponsorSlot = card.dataset.sponsorSlot;
                
                // Track click analytics
                this.trackClickAnalytics(productId, sponsorSlot, config);
                
                // Navigate to product page
                this.navigateToProduct(productId, products);
            });
        });
    }

    /**
     * Navigate to product page
     */
    navigateToProduct(productId, products) {
        const product = products.find(p => p.id === productId);
        if (product) {
            // Add sponsored tracking parameter
            const url = `/product/${productId}?ref=sponsored&slot=${product.sponsorSlot}`;
            window.location.href = url;
        }
    }

    /**
     * Track display analytics
     */
    trackDisplayAnalytics(products, config) {
        products.forEach(product => {
            // Analytics tracking for display impressions
            console.log(`Sponsored Display: ${product.id} in slot ${product.sponsorSlot}`);
            
            // Send to analytics service (implement as needed)
            this.sendAnalytics('sponsored_display', {
                product_id: product.id,
                slot_number: product.sponsorSlot,
                page_type: config.currentPage,
                display_type: config.displayType
            });
        });
    }

    /**
     * Track click analytics
     */
    trackClickAnalytics(productId, sponsorSlot, config) {
        console.log(`Sponsored Click: ${productId} in slot ${sponsorSlot}`);
        
        // Send to analytics service
        this.sendAnalytics('sponsored_click', {
            product_id: productId,
            slot_number: sponsorSlot,
            page_type: config.currentPage,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Send analytics data (implement with your analytics service)
     */
    sendAnalytics(event, data) {
        // Implement with Google Analytics, Mixpanel, or custom analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', event, data);
        }
    }

    /**
     * Show loading state
     */
    showLoadingState(container) {
        container.innerHTML = `
            <div class="sponsored-loading">
                <div class="d-flex align-items-center">
                    <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    <span>Loading sponsored content...</span>
                </div>
            </div>
        `;
    }

    /**
     * Hide container if no sponsored products
     */
    hideContainer(container) {
        container.style.display = 'none';
    }

    /**
     * Apply responsive classes
     */
    applyResponsiveClasses(container, config) {
        container.classList.add('sponsored-responsive');
        
        // Add display type class
        container.classList.add(`sponsored-${config.displayType}`);
    }

    /**
     * Clear cache (useful for admin updates)
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Initialize sponsored products on page load
     */
    static init() {
        // Auto-initialize common sponsored sections
        document.addEventListener('DOMContentLoaded', () => {
            const manager = new SponsoredProductManager();

            // Check for sponsored containers and auto-load
            const sponsoredContainers = document.querySelectorAll('[data-sponsored-auto]');
            
            sponsoredContainers.forEach(container => {
                const options = {
                    maxItems: parseInt(container.dataset.sponsoredMax) || 3,
                    displayType: container.dataset.sponsoredType || 'grid',
                    category: container.dataset.sponsoredCategory || null,
                    currentPage: container.dataset.sponsoredPage || 'general'
                };

                manager.displaySponsored(container.id, options);
            });
        });
    }
}

// Auto-initialize
SponsoredProductManager.init();

// Make globally available
window.SponsoredProductManager = SponsoredProductManager;
