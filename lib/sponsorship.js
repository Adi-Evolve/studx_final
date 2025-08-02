/**
 * Advanced Sponsorship System for StudX Platform
 * Handles sponsored item priority, search integration, and no-duplication logic
 */

import { createSupabaseBrowserClient } from '@/lib/supabase/client';

class SponsorshipManager {
    constructor() {
        this.supabase = createSupabaseBrowserClient();
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.usedSponsoredItems = new Set(); // Track used sponsored items to prevent duplication
    }

    /**
     * Get sponsored items with priority and no-duplication logic
     * @param {Object} options - Configuration options
     * @returns {Array} Sponsored items array
     */
    async getSponsoredItems(options = {}) {
        const {
            searchQuery = null,
            category = null,
            type = null, // 'product', 'note', 'room', 'regular'
            currentItemId = null,
            limit = 3,
            excludeUsed = false
        } = options;

        try {
            // Get sponsored items from sequence table
            let query = this.supabase
                .from('sponsorship_sequences')
                .select('*')
                .order('slot', { ascending: true });

            // Filter by item type if specified
            if (type) {
                // Map 'regular' to 'product' for database compatibility
                const dbType = type === 'regular' ? 'product' : type;
                query = query.eq('item_type', dbType);
            }

            const { data: sponsorships, error } = await query;

            if (error) throw error;

            const sponsoredItems = [];

            // Fetch details for each sponsored item
            for (const sponsor of sponsorships) {
                // Skip if already used and excludeUsed is true
                if (excludeUsed && this.usedSponsoredItems.has(`${sponsor.item_type}-${sponsor.item_id}`)) {
                    continue;
                }

                const itemData = await this.fetchItemDetails(sponsor.item_type, sponsor.item_id);
                if (!itemData) continue;

                // Skip if it's the current item being viewed
                if (currentItemId && sponsor.item_id === currentItemId) continue;

                // Apply relevance scoring
                const relevanceScore = this.calculateRelevanceScore(itemData, {
                    searchQuery,
                    category,
                    type,
                    sponsorSlot: sponsor.slot
                });

                // Map database types back to display types
                const displayType = sponsor.item_type === 'product' ? 'regular' : sponsor.item_type;

                sponsoredItems.push({
                    ...itemData,
                    type: displayType,
                    sponsor_slot: sponsor.slot,
                    relevance_score: relevanceScore,
                    is_sponsored: true
                });

                // Mark as used if needed
                if (excludeUsed) {
                    this.usedSponsoredItems.add(`${sponsor.item_type}-${sponsor.item_id}`);
                }

                // Break if we have enough items
                if (sponsoredItems.length >= limit) break;
            }

            // Sort by relevance and sponsor slot
            sponsoredItems.sort((a, b) => {
                if (a.relevance_score !== b.relevance_score) {
                    return b.relevance_score - a.relevance_score;
                }
                return a.sponsor_slot - b.sponsor_slot;
            });

            return sponsoredItems.slice(0, limit);

        } catch (error) {
            console.error('Error fetching sponsored items:', error);
            return [];
        }
    }

    /**
     * Get random sponsored item for search priority
     * @param {string} searchQuery - Search query
     * @param {string} type - Item type to prioritize
     * @returns {Object|null} Single sponsored item
     */
    async getRandomSponsoredItemForSearch(searchQuery, type = null) {
        const sponsoredItems = await this.getSponsoredItems({
            searchQuery,
            type,
            limit: 10, // Get more to have better random selection
            excludeUsed: true
        });

        if (sponsoredItems.length === 0) return null;

        // Filter highly relevant items (score > 3)
        const highlyRelevant = sponsoredItems.filter(item => item.relevance_score > 3);
        const itemsToSelect = highlyRelevant.length > 0 ? highlyRelevant : sponsoredItems;

        // Return random item from relevant sponsored items
        const randomIndex = Math.floor(Math.random() * itemsToSelect.length);
        return itemsToSelect[randomIndex];
    }

    /**
     * Get all sponsored items for homepage featured section
     */
    async getAllSponsoredItems() {
        try {
            // Try to get from sponsorship_sequences table first (new system)
            const { data: sponsorshipData, error: sponsorshipError } = await this.supabase
                .from('sponsorship_sequences')
                .select('*')
                .order('created_at', { ascending: false });

            if (sponsorshipError) {
                console.error('Error fetching from sponsorship_sequences:', sponsorshipError);
                // Fallback to old system - get featured items from individual tables
                return await this.getFallbackFeaturedItems();
            }

            if (!sponsorshipData || sponsorshipData.length === 0) {
                // Fallback to old system if no sponsored items
                return await this.getFallbackFeaturedItems();
            }

            // Get the actual item data for each sponsored item
            const sponsoredItems = [];
            
            for (const sponsorItem of sponsorshipData) {
                try {
                    let itemData = null;
                    
                    if (sponsorItem.item_type === 'room') {
                        const { data: roomData } = await this.supabase
                            .from('rooms')
                            .select('*')
                            .eq('id', sponsorItem.item_id)
                            .single();
                        itemData = roomData ? { ...roomData, type: 'room' } : null;
                    } else if (sponsorItem.item_type === 'note') {
                        const { data: noteData } = await this.supabase
                            .from('notes')
                            .select('*')
                            .eq('id', sponsorItem.item_id)
                            .single();
                        itemData = noteData ? { ...noteData, type: 'note' } : null;
                    } else {
                        const { data: productData } = await this.supabase
                            .from('products')
                            .select('*')
                            .eq('id', sponsorItem.item_id)
                            .single();
                        itemData = productData ? { ...productData, type: 'regular' } : null;
                    }
                    
                    if (itemData) {
                        sponsoredItems.push({
                            ...itemData,
                            is_sponsored: true,
                            sponsored_at: sponsorItem.created_at
                        });
                    }
                } catch (itemError) {
                    console.error(`Error fetching sponsored item ${sponsorItem.item_type}:${sponsorItem.item_id}:`, itemError);
                }
            }

            // Cache the result
            this.cache.set('all_sponsored_items', sponsoredItems, this.CACHE_DURATION);
            
            return sponsoredItems;
        } catch (error) {
            console.error('Error in getAllSponsoredItems:', error);
            return await this.getFallbackFeaturedItems();
        }
    }

    /**
     * Fallback method to get featured items from old system
     */
    async getFallbackFeaturedItems() {
        try {
            const sponsoredItems = [];
            
            // Get featured items from each table
            const tables = [
                { name: 'products', type: 'regular' },
                { name: 'notes', type: 'note' },
                { name: 'rooms', type: 'room' }
            ];
            
            for (const table of tables) {
                try {
                    const { data, error } = await this.supabase
                        .from(table.name)
                        .select('*')
                        .eq('featured', true)
                        .order('created_at', { ascending: false })
                        .limit(5);
                    
                    if (data && data.length > 0) {
                        const items = data.map(item => ({
                            ...item,
                            type: table.type,
                            is_sponsored: true,
                            isFeatured: true
                        }));
                        sponsoredItems.push(...items);
                    }
                } catch (tableError) {
                    console.error(`Error fetching featured from ${table.name}:`, tableError);
                }
            }
            
            return sponsoredItems;
        } catch (error) {
            console.error('Error in getFallbackFeaturedItems:', error);
            return [];
        }
    }

    /**
     * Get sponsored items for category pages with priority
     * @param {string} category - Category name
     * @param {string} type - Item type ('product', 'note', 'room')
     * @returns {Array} Sponsored items for category
     */
    async getSponsoredItemsForCategory(category, type = null) {
        return await this.getSponsoredItems({
            category,
            type,
            limit: 5,
            excludeUsed: true
        });
    }

    /**
     * Fetch item details from respective table
     * @param {string} itemType - Type of item ('product', 'note', 'room')
     * @param {number} itemId - Item ID
     * @returns {Object|null} Item details
     */
    async fetchItemDetails(itemType, itemId) {
        const cacheKey = `item_${itemType}_${itemId}`;
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            let tableName = itemType;
            if (itemType === 'product') tableName = 'products';
            else if (itemType === 'note') tableName = 'notes';
            else if (itemType === 'room') tableName = 'rooms';

            const { data, error } = await this.supabase
                .from(tableName)
                .select('*')
                .eq('id', itemId)
                .single();

            if (error) throw error;

            // Cache the result
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            return data;

        } catch (error) {
            console.error(`Error fetching ${itemType} details:`, error);
            return null;
        }
    }

    /**
     * Calculate relevance score for sponsored item
     * @param {Object} item - Item data
     * @param {Object} context - Search/filter context
     * @returns {number} Relevance score (0-10)
     */
    calculateRelevanceScore(item, context) {
        let score = 0;

        // Base score from sponsor slot (higher slots get slightly lower base score)
        score += Math.max(0, 5 - (context.sponsorSlot || 1) * 0.5);

        // Search query matching
        if (context.searchQuery) {
            const query = context.searchQuery.toLowerCase();
            const title = (item.title || '').toLowerCase();
            const description = (item.description || '').toLowerCase();
            const category = (item.category || '').toLowerCase();

            if (title.includes(query)) score += 5;
            if (description.includes(query)) score += 3;
            if (category.includes(query)) score += 2;

            // Exact matches get bonus
            if (title === query || title.includes(query.split(' ')[0])) score += 3;
        }

        // Category matching
        if (context.category) {
            const itemCategory = (item.category || '').toLowerCase();
            const targetCategory = context.category.toLowerCase();
            
            if (itemCategory.includes(targetCategory) || targetCategory.includes(itemCategory)) {
                score += 4;
            }
        }

        // Type matching
        if (context.type && context.type === item.type) {
            score += 2;
        }

        // College matching (if available in context)
        if (context.college && item.college === context.college) {
            score += 1;
        }

        return Math.min(10, score); // Cap at 10
    }

    /**
     * Mix sponsored items with regular items for search results with comprehensive deduplication
     * @param {Array} regularItems - Regular search results
     * @param {string} searchQuery - Search query
     * @param {Object} options - Options
     * @returns {Array} Mixed items array with sponsored items first, then unique regular items
     */
    async mixSponsoredWithRegular(regularItems, searchQuery, options = {}) {
        const { type = null, insertEvery = 5, maxSponsored = 3 } = options;

        // Get sponsored items for search
        const sponsoredItems = await this.getSponsoredItems({
            searchQuery,
            type,
            limit: maxSponsored,
            excludeUsed: true
        });

        if (sponsoredItems.length === 0) return regularItems;

        // Create a Set of sponsored item IDs for efficient deduplication
        const sponsoredItemIds = new Set(sponsoredItems.map(item => item.id));

        // Filter out any regular items that are already in sponsored results
        const filteredRegularItems = regularItems.filter(item => !sponsoredItemIds.has(item.id));

        // For search results, we want sponsored items to have priority placement
        // Option 1: Place all sponsored items at the top
        if (searchQuery && searchQuery.trim()) {
            // For search results, show sponsored items first with indicators
            const sponsoredWithIndicators = sponsoredItems.map(item => ({
                ...item,
                is_sponsored: true,
                sponsored_label: 'Sponsored'
            }));
            
            return [...sponsoredWithIndicators, ...filteredRegularItems];
        }

        // Option 2: Mix sponsored items throughout regular results (for browsing)
        const mixedItems = [];
        let sponsoredIndex = 0;

        // Add first sponsored item at the very beginning if available
        if (sponsoredItems.length > 0) {
            mixedItems.push({
                ...sponsoredItems[0],
                is_sponsored: true,
                sponsored_label: 'Sponsored'
            });
            sponsoredIndex = 1;
        }

        // Mix remaining sponsored items throughout regular results
        for (let i = 0; i < filteredRegularItems.length; i++) {
            // Add regular item
            mixedItems.push(filteredRegularItems[i]);

            // Insert sponsored item every N items
            if ((i + 1) % insertEvery === 0 && sponsoredIndex < sponsoredItems.length) {
                mixedItems.push({
                    ...sponsoredItems[sponsoredIndex],
                    is_sponsored: true,
                    sponsored_label: 'Sponsored'
                });
                sponsoredIndex++;
            }
        }

        // Add any remaining sponsored items at the end
        while (sponsoredIndex < sponsoredItems.length) {
            mixedItems.push({
                ...sponsoredItems[sponsoredIndex],
                is_sponsored: true,
                sponsored_label: 'Sponsored'
            });
            sponsoredIndex++;
        }

        return mixedItems;
    }

    /**
     * Get featured items for homepage
     * @param {number} limit - Number of items to return
     * @returns {Array} Featured items
     */
    async getFeaturedItems(limit = 8) {
        return await this.getSponsoredItems({
            limit,
            excludeUsed: false // Allow reuse for featured section
        });
    }

    /**
     * Reset used items tracking (call this on new page loads)
     */
    resetUsedItems() {
        this.usedSponsoredItems.clear();
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }
}

// Export singleton instance
export const sponsorshipManager = new SponsorshipManager();
export default SponsorshipManager;
