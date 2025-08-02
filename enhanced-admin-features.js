/**
 * ENHANCED ADMIN PANEL FEATURES
 * Improvements and new features for adi.html
 */

// Enhanced Sponsorship Management System
class EnhancedSponsorshipManager {
    constructor() {
        this.supabase = null;
        this.performanceMetrics = {};
        this.initializeSupabase();
    }

    initializeSupabase() {
        const SUPABASE_URL = 'https://vdpmumstdxgftaaxeacx.supabase.co';
        const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcG11bXN0ZHhnZnRhYXhlYWN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTkwNjA4MiwiZXhwIjoyMDY3NDgyMDgyfQ.tdYV9te2jYq2ARdPiJi6mpkqfvg45YlfgZ2kXnhLVRs';
        
        if (window.supabase) {
            this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        }
    }

    // Enhanced sponsorship dashboard with advanced metrics
    async renderEnhancedSponsorshipDashboard() {
        const container = document.getElementById('content');
        if (!container) return;

        container.innerHTML = `
            <div class="enhanced-sponsorship-container">
                <!-- Advanced Header with Real-time Stats -->
                <div class="row mb-4">
                    <div class="col-md-8">
                        <h2 class="mb-1">
                            <i class="fas fa-star text-warning me-2"></i>
                            Enhanced Sponsorship Center
                        </h2>
                        <p class="text-muted mb-0">Advanced management with performance analytics</p>
                    </div>
                    <div class="col-md-4 text-end">
                        <div class="btn-group" role="group">
                            <button class="btn btn-outline-primary" onclick="enhancedSponsorshipManager.exportSponsorshipReport()">
                                <i class="fas fa-download me-1"></i>Export Report
                            </button>
                            <button class="btn btn-primary" onclick="enhancedSponsorshipManager.openAdvancedModal()">
                                <i class="fas fa-plus me-1"></i>Add Sponsorship
                            </button>
                            <button class="btn btn-success" onclick="enhancedSponsorshipManager.bulkManageModal()">
                                <i class="fas fa-tasks me-1"></i>Bulk Manage
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Enhanced Metrics Cards -->
                <div class="row g-4 mb-5">
                    <div class="col-xl-3 col-lg-6">
                        <div class="metric-card gradient-primary">
                            <div class="metric-header">
                                <h6>Active Sponsorships</h6>
                                <i class="fas fa-star"></i>
                            </div>
                            <div class="metric-body">
                                <h2 id="activeSponsorsCount">-</h2>
                                <div class="metric-trend" id="sponsorsTrend">
                                    <i class="fas fa-arrow-up"></i>
                                    <span>Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-3 col-lg-6">
                        <div class="metric-card gradient-success">
                            <div class="metric-header">
                                <h6>Revenue This Month</h6>
                                <i class="fas fa-rupee-sign"></i>
                            </div>
                            <div class="metric-body">
                                <h2 id="sponsorRevenue">₹0</h2>
                                <div class="metric-trend" id="revenueTrend">
                                    <i class="fas fa-arrow-up"></i>
                                    <span>Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-3 col-lg-6">
                        <div class="metric-card gradient-info">
                            <div class="metric-header">
                                <h6>Click-Through Rate</h6>
                                <i class="fas fa-mouse-pointer"></i>
                            </div>
                            <div class="metric-body">
                                <h2 id="ctrRate">-</h2>
                                <div class="metric-trend" id="ctrTrend">
                                    <i class="fas fa-arrow-up"></i>
                                    <span>Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-3 col-lg-6">
                        <div class="metric-card gradient-warning">
                            <div class="metric-header">
                                <h6>Conversion Rate</h6>
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div class="metric-body">
                                <h2 id="conversionRate">-</h2>
                                <div class="metric-trend" id="conversionTrend">
                                    <i class="fas fa-arrow-up"></i>
                                    <span>Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Performance Analytics Chart -->
                <div class="row mb-4">
                    <div class="col-lg-8">
                        <div class="analytics-card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">Sponsorship Performance</h5>
                                <div class="chart-controls">
                                    <select class="form-select form-select-sm" id="performancePeriod">
                                        <option value="7">Last 7 days</option>
                                        <option value="30" selected>Last 30 days</option>
                                        <option value="90">Last 90 days</option>
                                    </select>
                                </div>
                            </div>
                            <div class="card-body">
                                <canvas id="performanceChart" height="300"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="analytics-card">
                            <div class="card-header">
                                <h5 class="mb-0">Top Performing Categories</h5>
                            </div>
                            <div class="card-body">
                                <canvas id="categoryChart" height="300"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Advanced Sponsorship Management Table -->
                <div class="management-card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="fas fa-table me-2"></i>
                            Sponsorship Management
                        </h5>
                        <div class="table-controls">
                            <div class="input-group input-group-sm">
                                <span class="input-group-text"><i class="fas fa-search"></i></span>
                                <input type="text" class="form-control" id="sponsorshipSearch" placeholder="Search sponsorships...">
                            </div>
                            <select class="form-select form-select-sm ms-2" id="statusFilter">
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="expired">Expired</option>
                            </select>
                            <select class="form-select form-select-sm ms-2" id="categoryFilter">
                                <option value="">All Categories</option>
                                <option value="product">Products</option>
                                <option value="note">Notes</option>
                                <option value="room">Rooms</option>
                            </select>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover" id="sponsorshipTable">
                                <thead>
                                    <tr>
                                        <th>
                                            <input type="checkbox" id="selectAllSponsors" class="form-check-input">
                                        </th>
                                        <th>Slot</th>
                                        <th>Item Details</th>
                                        <th>Category</th>
                                        <th>Performance</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="sponsorshipTableBody">
                                    <tr>
                                        <td colspan="8" class="text-center py-4">
                                            <div class="spinner-border text-primary" role="status"></div>
                                            <div class="mt-2">Loading sponsorships...</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Pagination -->
                        <nav aria-label="Sponsorship pagination">
                            <ul class="pagination justify-content-end" id="sponsorshipPagination">
                                <!-- Pagination will be generated -->
                            </ul>
                        </nav>
                    </div>
                </div>

                <!-- Bulk Actions Bar (Hidden by default) -->
                <div class="bulk-actions-bar" id="bulkActionsBar" style="display: none;">
                    <div class="d-flex justify-content-between align-items-center">
                        <span id="selectedCount">0 items selected</span>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-success" onclick="enhancedSponsorshipManager.bulkActivate()">
                                <i class="fas fa-play me-1"></i>Activate
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="enhancedSponsorshipManager.bulkDeactivate()">
                                <i class="fas fa-pause me-1"></i>Deactivate
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="enhancedSponsorshipManager.bulkDelete()">
                                <i class="fas fa-trash me-1"></i>Delete
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="enhancedSponsorshipManager.clearSelection()">
                                <i class="fas fa-times me-1"></i>Clear
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Enhanced Sponsorship Modal -->
            <div class="modal fade" id="enhancedSponsorshipModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-star me-2"></i>
                                Advanced Sponsorship Management
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Modal content will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Load data and initialize features
        await this.loadEnhancedMetrics();
        await this.loadSponsorshipTable();
        this.initializeCharts();
        this.attachEventListeners();
    }

    // Load enhanced metrics with real-time updates
    async loadEnhancedMetrics() {
        try {
            // Get active sponsorships count
            const { count: activeCount } = await this.supabase
                .from('sponsorship_sequences')
                .select('*', { count: 'exact', head: true })
                .eq('is_active', true);

            document.getElementById('activeSponsorsCount').textContent = activeCount || 0;

            // Calculate revenue (mock data for now)
            const revenue = (activeCount || 0) * 499; // Assuming ₹499 per sponsorship
            document.getElementById('sponsorRevenue').textContent = `₹${revenue.toLocaleString()}`;

            // Mock performance metrics
            document.getElementById('ctrRate').textContent = '3.2%';
            document.getElementById('conversionRate').textContent = '1.8%';

            // Update trends
            this.updateTrendIndicators();

        } catch (error) {
            console.error('Error loading metrics:', error);
        }
    }

    updateTrendIndicators() {
        const trends = [
            { id: 'sponsorsTrend', change: 12, period: 'vs last month' },
            { id: 'revenueTrend', change: 8, period: 'vs last month' },
            { id: 'ctrTrend', change: -2, period: 'vs last month' },
            { id: 'conversionTrend', change: 5, period: 'vs last month' }
        ];

        trends.forEach(trend => {
            const element = document.getElementById(trend.id);
            if (element) {
                const icon = trend.change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
                const color = trend.change >= 0 ? 'text-success' : 'text-danger';
                element.innerHTML = `
                    <i class="fas ${icon} ${color}"></i>
                    <span class="${color}">${Math.abs(trend.change)}% ${trend.period}</span>
                `;
            }
        });
    }

    // Initialize performance charts
    initializeCharts() {
        // Performance Chart
        const performanceCtx = document.getElementById('performanceChart');
        if (performanceCtx) {
            new Chart(performanceCtx, {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                        label: 'Clicks',
                        data: [120, 190, 300, 500],
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        tension: 0.4
                    }, {
                        label: 'Conversions',
                        data: [30, 45, 78, 90],
                        borderColor: '#059669',
                        backgroundColor: 'rgba(5, 150, 105, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Category Chart
        const categoryCtx = document.getElementById('categoryChart');
        if (categoryCtx) {
            new Chart(categoryCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Products', 'Notes', 'Rooms'],
                    datasets: [{
                        data: [45, 30, 25],
                        backgroundColor: ['#2563eb', '#059669', '#d97706'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }

    // Load and render sponsorship table
    async loadSponsorshipTable() {
        try {
            const { data: sponsorships, error } = await this.supabase
                .from('sponsorship_sequences')
                .select('*')
                .order('slot', { ascending: true });

            if (error) throw error;

            const tbody = document.getElementById('sponsorshipTableBody');
            if (!tbody) return;

            if (sponsorships.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center py-4">
                            <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                            <div>No sponsorships found</div>
                            <button class="btn btn-primary mt-2" onclick="enhancedSponsorshipManager.openAdvancedModal()">
                                Add First Sponsorship
                            </button>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = sponsorships.map(sponsor => `
                <tr data-sponsor-id="${sponsor.id}">
                    <td>
                        <input type="checkbox" class="form-check-input sponsor-checkbox" value="${sponsor.id}">
                    </td>
                    <td>
                        <span class="badge bg-primary">#${sponsor.slot}</span>
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="item-avatar ${sponsor.item_type}">
                                <i class="fas ${this.getTypeIcon(sponsor.item_type)}"></i>
                            </div>
                            <div class="ms-2">
                                <div class="fw-semibold">${sponsor.title || 'Unknown Item'}</div>
                                <small class="text-muted">ID: ${sponsor.item_id}</small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="badge bg-${this.getCategoryColor(sponsor.item_type)}">
                            ${sponsor.item_type.charAt(0).toUpperCase() + sponsor.item_type.slice(1)}
                        </span>
                    </td>
                    <td>
                        <div class="performance-metrics">
                            <small class="text-muted d-block">CTR: ${this.generateRandomCTR()}%</small>
                            <small class="text-muted">Conv: ${this.generateRandomConversion()}%</small>
                        </div>
                    </td>
                    <td>
                        <span class="badge bg-${sponsor.is_active ? 'success' : 'secondary'}">
                            ${sponsor.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td>
                        <small class="text-muted">
                            ${new Date(sponsor.created_at).toLocaleDateString()}
                        </small>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" onclick="enhancedSponsorshipManager.editSponsorship(${sponsor.id})" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-info" onclick="enhancedSponsorshipManager.viewAnalytics(${sponsor.id})" title="Analytics">
                                <i class="fas fa-chart-bar"></i>
                            </button>
                            <button class="btn btn-outline-${sponsor.is_active ? 'warning' : 'success'}" 
                                    onclick="enhancedSponsorshipManager.toggleStatus(${sponsor.id})" 
                                    title="${sponsor.is_active ? 'Deactivate' : 'Activate'}">
                                <i class="fas fa-${sponsor.is_active ? 'pause' : 'play'}"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="enhancedSponsorshipManager.deleteSponsorship(${sponsor.id})" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            this.attachTableEventListeners();

        } catch (error) {
            console.error('Error loading sponsorship table:', error);
            document.getElementById('sponsorshipTableBody').innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4 text-danger">
                        <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                        <div>Error loading sponsorships: ${error.message}</div>
                    </td>
                </tr>
            `;
        }
    }

    // Utility functions
    getTypeIcon(type) {
        const icons = {
            'product': 'fa-shopping-bag',
            'note': 'fa-book',
            'room': 'fa-home'
        };
        return icons[type] || 'fa-star';
    }

    getCategoryColor(type) {
        const colors = {
            'product': 'success',
            'note': 'primary',
            'room': 'warning'
        };
        return colors[type] || 'secondary';
    }

    generateRandomCTR() {
        return (Math.random() * 5 + 1).toFixed(1);
    }

    generateRandomConversion() {
        return (Math.random() * 3 + 0.5).toFixed(1);
    }

    // Event listeners
    attachEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('sponsorshipSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterTable(e.target.value);
            });
        }

        // Filter functionality
        const statusFilter = document.getElementById('statusFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.applyFilters());
        }
    }

    attachTableEventListeners() {
        // Select all checkbox
        const selectAllCheckbox = document.getElementById('selectAllSponsors');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.sponsor-checkbox');
                checkboxes.forEach(cb => cb.checked = e.target.checked);
                this.updateBulkActionsBar();
            });
        }

        // Individual checkboxes
        const checkboxes = document.querySelectorAll('.sponsor-checkbox');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => this.updateBulkActionsBar());
        });
    }

    updateBulkActionsBar() {
        const selectedCheckboxes = document.querySelectorAll('.sponsor-checkbox:checked');
        const bulkActionsBar = document.getElementById('bulkActionsBar');
        const selectedCount = document.getElementById('selectedCount');

        if (selectedCheckboxes.length > 0) {
            bulkActionsBar.style.display = 'block';
            selectedCount.textContent = `${selectedCheckboxes.length} item${selectedCheckboxes.length !== 1 ? 's' : ''} selected`;
        } else {
            bulkActionsBar.style.display = 'none';
        }
    }

    // Advanced features
    async openAdvancedModal() {
        // Enhanced modal with more features
        window.openSponsorshipModal();
    }

    async bulkManageModal() {
        // Open bulk management modal
        console.log('Opening bulk management modal...');
    }

    async exportSponsorshipReport() {
        // Export functionality
        console.log('Exporting sponsorship report...');
    }

    // CRUD operations
    async editSponsorship(id) {
        console.log('Editing sponsorship:', id);
    }

    async viewAnalytics(id) {
        console.log('Viewing analytics for sponsorship:', id);
    }

    async toggleStatus(id) {
        try {
            // Get current status
            const { data: current } = await this.supabase
                .from('sponsorship_sequences')
                .select('is_active')
                .eq('id', id)
                .single();

            // Toggle status
            const { error } = await this.supabase
                .from('sponsorship_sequences')
                .update({ is_active: !current.is_active })
                .eq('id', id);

            if (error) throw error;

            // Reload table
            await this.loadSponsorshipTable();
            
            window.showNotification && window.showNotification(
                'Sponsorship status updated successfully!', 
                'success'
            );

        } catch (error) {
            console.error('Error toggling status:', error);
            window.showNotification && window.showNotification(
                'Error updating sponsorship status: ' + error.message, 
                'error'
            );
        }
    }

    async deleteSponsorship(id) {
        if (!confirm('Are you sure you want to delete this sponsorship?')) return;

        try {
            const { error } = await this.supabase
                .from('sponsorship_sequences')
                .delete()
                .eq('id', id);

            if (error) throw error;

            await this.loadSponsorshipTable();
            await this.loadEnhancedMetrics();
            
            window.showNotification && window.showNotification(
                'Sponsorship deleted successfully!', 
                'success'
            );

        } catch (error) {
            console.error('Error deleting sponsorship:', error);
            window.showNotification && window.showNotification(
                'Error deleting sponsorship: ' + error.message, 
                'error'
            );
        }
    }

    // Bulk operations
    async bulkActivate() {
        const selectedIds = this.getSelectedIds();
        if (selectedIds.length === 0) return;

        try {
            const { error } = await this.supabase
                .from('sponsorship_sequences')
                .update({ is_active: true })
                .in('id', selectedIds);

            if (error) throw error;

            await this.loadSponsorshipTable();
            this.clearSelection();
            
            window.showNotification && window.showNotification(
                `${selectedIds.length} sponsorships activated successfully!`, 
                'success'
            );

        } catch (error) {
            console.error('Error bulk activating:', error);
        }
    }

    async bulkDeactivate() {
        const selectedIds = this.getSelectedIds();
        if (selectedIds.length === 0) return;

        try {
            const { error } = await this.supabase
                .from('sponsorship_sequences')
                .update({ is_active: false })
                .in('id', selectedIds);

            if (error) throw error;

            await this.loadSponsorshipTable();
            this.clearSelection();
            
            window.showNotification && window.showNotification(
                `${selectedIds.length} sponsorships deactivated successfully!`, 
                'success'
            );

        } catch (error) {
            console.error('Error bulk deactivating:', error);
        }
    }

    async bulkDelete() {
        const selectedIds = this.getSelectedIds();
        if (selectedIds.length === 0) return;

        if (!confirm(`Are you sure you want to delete ${selectedIds.length} sponsorships?`)) return;

        try {
            const { error } = await this.supabase
                .from('sponsorship_sequences')
                .delete()
                .in('id', selectedIds);

            if (error) throw error;

            await this.loadSponsorshipTable();
            await this.loadEnhancedMetrics();
            this.clearSelection();
            
            window.showNotification && window.showNotification(
                `${selectedIds.length} sponsorships deleted successfully!`, 
                'success'
            );

        } catch (error) {
            console.error('Error bulk deleting:', error);
        }
    }

    getSelectedIds() {
        const selectedCheckboxes = document.querySelectorAll('.sponsor-checkbox:checked');
        return Array.from(selectedCheckboxes).map(cb => parseInt(cb.value));
    }

    clearSelection() {
        const checkboxes = document.querySelectorAll('.sponsor-checkbox, #selectAllSponsors');
        checkboxes.forEach(cb => cb.checked = false);
        this.updateBulkActionsBar();
    }

    // Filtering
    filterTable(searchTerm) {
        const rows = document.querySelectorAll('#sponsorshipTableBody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const isVisible = text.includes(searchTerm.toLowerCase());
            row.style.display = isVisible ? '' : 'none';
        });
    }

    applyFilters() {
        const statusFilter = document.getElementById('statusFilter').value;
        const categoryFilter = document.getElementById('categoryFilter').value;
        const rows = document.querySelectorAll('#sponsorshipTableBody tr[data-sponsor-id]');

        rows.forEach(row => {
            let isVisible = true;

            if (statusFilter) {
                const statusBadge = row.querySelector('td:nth-child(6) .badge');
                const status = statusBadge?.textContent.toLowerCase();
                isVisible = isVisible && status === statusFilter;
            }

            if (categoryFilter) {
                const categoryBadge = row.querySelector('td:nth-child(4) .badge');
                const category = categoryBadge?.textContent.toLowerCase();
                isVisible = isVisible && category === categoryFilter;
            }

            row.style.display = isVisible ? '' : 'none';
        });
    }
}

// Initialize enhanced sponsorship manager
window.enhancedSponsorshipManager = new EnhancedSponsorshipManager();

// Add to global scope for use in admin panel
window.loadEnhancedSponsorshipPage = () => {
    return window.enhancedSponsorshipManager.renderEnhancedSponsorshipDashboard();
};

console.log('🚀 Enhanced Sponsorship Manager Loaded');
