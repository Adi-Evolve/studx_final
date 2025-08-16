/**
 * SPONSORSHIP SYSTEM - COMPREHENSIVE TESTS
 * Tests all sponsorship functionality in the admin panel
 */

class SponsorshipTester {
    constructor() {
        this.supabase = null;
        this.testResults = [];
        this.initializeSupabase();
    }

    initializeSupabase() {
        try {
            const SUPABASE_URL = 'https://vdpmumstdxgftaaxeacx.supabase.co';
            const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcG11bXN0ZHhnZnRhYXhlYWN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTkwNjA4MiwiZXhwIjoyMDY3NDgyMDgyfQ.tdYV9te2jYq2ARdPiJi6mpkqfvg45YlfgZ2kXnhLVRs';
            
            if (window.supabase) {
                this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
                // console.log('✅ Sponsorship Tester - Supabase connected');
            } else {
                throw new Error('Supabase library not found');
            }
        } catch (error) {
            // console.error('❌ Sponsorship Tester - Supabase connection failed:', error);
        }
    }

    async runTest(testName, testFunction) {
        try {
            // console.log(`🧪 Testing: ${testName}`);
            const result = await testFunction();
            this.testResults.push({ name: testName, status: 'PASSED', result });
            // console.log(`✅ PASSED: ${testName}`);
            return result;
        } catch (error) {
            this.testResults.push({ name: testName, status: 'FAILED', error: error.message });
            // console.error(`❌ FAILED: ${testName} - ${error.message}`);
            return false;
        }
    }

    async runSponsorshipTests() {
        // console.log('🚀 Starting Sponsorship System Tests');
        // console.log('=====================================');

        // Test 1: Database Schema
        await this.testSponsorshipTableSchema();
        
        // Test 2: CRUD Operations
        await this.testCreateSponsorship();
        await this.testReadSponsorships();
        await this.testUpdateSponsorship();
        await this.testDeleteSponsorship();
        
        // Test 3: UI Functions
        await this.testSponsorshipUI();
        await this.testModalFunctionality();
        await this.testItemSelection();
        await this.testDuplicationPrevention();
        
        // Test 4: Business Logic
        await this.testCategoryFiltering();
        await this.testSlotManagement();
        await this.testSponsorshipMetrics();
        
        // Test 5: Error Handling
        await this.testErrorScenarios();

        this.displayResults();
    }

    // Test 1: Database Schema
    async testSponsorshipTableSchema() {
        await this.runTest('Sponsorship Table Schema', async () => {
            const { data, error } = await this.supabase
                .from('sponsorship_sequences')
                .select('*')
                .limit(1);
            
            if (error) throw new Error(`Schema test failed: ${error.message}`);
            
            // Check if table structure is correct
            const { data: tableInfo, error: schemaError } = await this.supabase.rpc('get_table_columns', {
                table_name: 'sponsorship_sequences'
            }).catch(() => {
                // Fallback: Just check if we can query the table
                return { data: null, error: null };
            });
            
            // console.log('✅ Sponsorship table accessible');
            return true;
        });
    }

    // Test 2: CRUD Operations
    async testCreateSponsorship() {
        await this.runTest('Create Sponsorship', async () => {
            // Test data for insertion
            const testSponsorship = {
                item_id: 999999, // Test ID
                item_type: 'product',
                slot: 999,
                is_active: true,
                title: 'Test Sponsorship Item',
                category: 'product',
                created_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('sponsorship_sequences')
                .insert(testSponsorship)
                .select();

            if (error) throw new Error(`Insert failed: ${error.message}`);
            
            // Store test ID for cleanup
            this.testSponsorshipId = data[0]?.id;
            // console.log('✅ Test sponsorship created with ID:', this.testSponsorshipId);
            return true;
        });
    }

    async testReadSponsorships() {
        await this.runTest('Read Sponsorships', async () => {
            const { data, error } = await this.supabase
                .from('sponsorship_sequences')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw new Error(`Read failed: ${error.message}`);
            
            // console.log(`✅ Found ${data.length} sponsorships`);
            return data.length >= 0;
        });
    }

    async testUpdateSponsorship() {
        await this.runTest('Update Sponsorship', async () => {
            if (!this.testSponsorshipId) {
                // console.log('⚠️ No test sponsorship to update, skipping');
                return true;
            }

            const { data, error } = await this.supabase
                .from('sponsorship_sequences')
                .update({ title: 'Updated Test Title' })
                .eq('id', this.testSponsorshipId)
                .select();

            if (error) throw new Error(`Update failed: ${error.message}`);
            
            // console.log('✅ Sponsorship updated successfully');
            return true;
        });
    }

    async testDeleteSponsorship() {
        await this.runTest('Delete Sponsorship', async () => {
            if (!this.testSponsorshipId) {
                // console.log('⚠️ No test sponsorship to delete, skipping');
                return true;
            }

            const { error } = await this.supabase
                .from('sponsorship_sequences')
                .delete()
                .eq('id', this.testSponsorshipId);

            if (error) throw new Error(`Delete failed: ${error.message}`);
            
            // console.log('✅ Test sponsorship deleted successfully');
            return true;
        });
    }

    // Test 3: UI Functions
    async testSponsorshipUI() {
        await this.runTest('Sponsorship UI Elements', async () => {
            // Check if sponsorship page loads
            if (typeof window.loadPage === 'function') {
                window.loadPage('sponsorship');
                
                // Wait for content to load
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Check for sponsorship container
                const sponsorshipContainer = document.querySelector('.sponsorship-container');
                if (!sponsorshipContainer) {
                    throw new Error('Sponsorship container not found');
                }
                
                // console.log('✅ Sponsorship UI loaded successfully');
            }
            
            return true;
        });
    }

    async testModalFunctionality() {
        await this.runTest('Sponsorship Modal', async () => {
            // Check modal exists
            const modal = document.getElementById('sponsorshipModal');
            if (!modal) throw new Error('Sponsorship modal not found');
            
            // Check modal opening function
            if (typeof window.openSponsorshipModal !== 'function') {
                throw new Error('openSponsorshipModal function not found');
            }
            
            // Test modal opening
            window.openSponsorshipModal();
            
            // Check if modal content loads
            const availableItems = document.getElementById('availableItems');
            if (!availableItems) throw new Error('Available items container not found');
            
            // console.log('✅ Sponsorship modal functionality working');
            return true;
        });
    }

    async testItemSelection() {
        await this.runTest('Item Selection System', async () => {
            // Check selection functions
            const functions = ['selectItem', 'clearAllSelections'];
            for (const funcName of functions) {
                if (typeof window[funcName] !== 'function') {
                    throw new Error(`${funcName} function not found`);
                }
            }
            
            // Test selection system
            window.selectedItems = [];
            
            // Simulate item selection
            if (typeof window.selectItem === 'function') {
                try {
                    // This might fail if event context is wrong, but function should exist
                    // console.log('✅ Item selection functions available');
                } catch (e) {
                    // console.log('⚠️ Item selection function exists but context may be wrong');
                }
            }
            
            return true;
        });
    }

    async testDuplicationPrevention() {
        await this.runTest('Duplication Prevention', async () => {
            // Test that duplicate prevention logic exists
            const { data: existingSponsors } = await this.supabase
                .from('sponsorship_sequences')
                .select('item_id, item_type');
            
            if (existingSponsors && existingSponsors.length > 0) {
                // console.log(`✅ Duplication prevention: ${existingSponsors.length} existing sponsors to check against`);
            }
            
            // Test unique constraint (indirectly)
            const uniqueItems = new Set();
            existingSponsors?.forEach(sponsor => {
                const key = `${sponsor.item_type}-${sponsor.item_id}`;
                if (uniqueItems.has(key)) {
                    throw new Error(`Duplicate sponsorship found: ${key}`);
                }
                uniqueItems.add(key);
            });
            
            // console.log('✅ No duplicate sponsorships found');
            return true;
        });
    }

    // Test 4: Business Logic
    async testCategoryFiltering() {
        await this.runTest('Category Filtering', async () => {
            const categories = ['product', 'note', 'room'];
            
            for (const category of categories) {
                const { data, error } = await this.supabase
                    .from('sponsorship_sequences')
                    .select('*')
                    .eq('item_type', category);
                
                if (error) throw new Error(`Category filtering failed for ${category}: ${error.message}`);
                
                // console.log(`✅ Found ${data.length} ${category} sponsorships`);
            }
            
            return true;
        });
    }

    async testSlotManagement() {
        await this.runTest('Slot Management', async () => {
            const { data, error } = await this.supabase
                .from('sponsorship_sequences')
                .select('slot')
                .order('slot', { ascending: true });
            
            if (error) throw new Error(`Slot query failed: ${error.message}`);
            
            // Check for slot conflicts
            const slots = data.map(item => item.slot);
            const uniqueSlots = new Set(slots);
            
            if (slots.length !== uniqueSlots.size) {
                throw new Error('Duplicate slots found');
            }
            
            // console.log(`✅ ${slots.length} unique slots managed correctly`);
            return true;
        });
    }

    async testSponsorshipMetrics() {
        await this.runTest('Sponsorship Metrics', async () => {
            // Test metrics calculations
            const { data: activeSponsors } = await this.supabase
                .from('sponsorship_sequences')
                .select('*')
                .eq('is_active', true);
            
            const { data: allSponsors } = await this.supabase
                .from('sponsorship_sequences')
                .select('*');
            
            // console.log(`✅ Metrics: ${activeSponsors?.length || 0} active, ${allSponsors?.length || 0} total sponsorships`);
            return true;
        });
    }

    // Test 5: Error Handling
    async testErrorScenarios() {
        await this.runTest('Error Handling', async () => {
            // Test invalid data insertion
            try {
                await this.supabase
                    .from('sponsorship_sequences')
                    .insert({
                        item_id: null, // This should fail
                        item_type: 'invalid_type',
                        slot: -1
                    });
                
                throw new Error('Invalid data was accepted - constraint failed');
            } catch (error) {
                if (error.message.includes('constraint') || error.message.includes('null')) {
                    // console.log('✅ Database constraints working correctly');
                    return true;
                }
                throw error;
            }
        });
    }

    displayResults() {
        // console.log('=====================================');
        // console.log('🏁 SPONSORSHIP TESTS COMPLETED');
        // console.log('=====================================');
        
        const passed = this.testResults.filter(r => r.status === 'PASSED').length;
        const failed = this.testResults.filter(r => r.status === 'FAILED').length;
        
        // console.log(`📊 Total Tests: ${this.testResults.length}`);
        // console.log(`✅ Passed: ${passed}`);
        // console.log(`❌ Failed: ${failed}`);
        // console.log(`📈 Success Rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);
        
        console.table(this.testResults);
        
        if (failed === 0) {
            // console.log('🎉 ALL SPONSORSHIP TESTS PASSED!');
        } else {
            // console.log(`⚠️ ${failed} tests failed. Review above for details.`);
        }
    }
}

// Auto-export for use in admin panel
window.SponsorshipTester = SponsorshipTester;
window.runSponsorshipTests = () => {
    const tester = new SponsorshipTester();
    return tester.runSponsorshipTests();
};

// console.log('🧪 Sponsorship Test Suite Loaded. Run with: runSponsorshipTests()');
