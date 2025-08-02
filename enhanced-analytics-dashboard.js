/**
 * ENHANCED ANALYTICS DASHBOARD
 * Advanced analytics and reporting features for admin panel
 */

class EnhancedAnalyticsDashboard {
    constructor() {
        this.supabase = null;
        this.charts = {};
        this.realTimeSubscriptions = [];
        this.initializeSupabase();
    }

    initializeSupabase() {
        const SUPABASE_URL = 'https://vdpmumstdxgftaaxeacx.supabase.co';
        const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcG11bXN0ZHhnZnRhYXhlYWN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTkwNjA4MiwiZXhwIjoyMDY3NDgyMDgyfQ.tdYV9te2jYq2ARdPiJi6mpkqfvg45YlfgZ2kXnhLVRs';
        
        if (window.supabase) {
            this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        }
    }

    async renderEnhancedAnalyticsDashboard() {
        const container = document.getElementById('content');
        if (!container) return;

        container.innerHTML = `
            <div class="enhanced-analytics-container">
                <!-- Analytics Header -->
                <div class="row mb-4">
                    <div class="col-md-8">
                        <h2 class="mb-1">
                            <i class="fas fa-chart-line text-info me-2"></i>
                            Advanced Analytics Dashboard
                        </h2>
                        <p class="text-muted mb-0">Comprehensive platform analytics and insights</p>
                    </div>
                    <div class="col-md-4 text-end">
                        <div class="btn-group" role="group">
                            <button class="btn btn-outline-primary" onclick="enhancedAnalytics.exportReport()">
                                <i class="fas fa-download me-1"></i>Export Report
                            </button>
                            <button class="btn btn-outline-info" onclick="enhancedAnalytics.scheduleReport()">
                                <i class="fas fa-clock me-1"></i>Schedule
                            </button>
                            <button class="btn btn-outline-success" onclick="enhancedAnalytics.refreshAll()">
                                <i class="fas fa-sync-alt me-1"></i>Refresh
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Real-time Metrics -->
                <div class="row g-4 mb-5">
                    <div class="col-xl-2 col-lg-4 col-md-6">
                        <div class="metric-card gradient-primary">
                            <div class="metric-header">
                                <h6>Total Revenue</h6>
                                <i class="fas fa-rupee-sign"></i>
                            </div>
                            <div class="metric-body">
                                <h2 id="totalRevenue">₹0</h2>
                                <div class="metric-trend" id="revenueTrend">
                                    <i class="fas fa-arrow-up"></i>
                                    <span>Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-2 col-lg-4 col-md-6">
                        <div class="metric-card gradient-success">
                            <div class="metric-header">
                                <h6>Active Users</h6>
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="metric-body">
                                <h2 id="activeUsers">-</h2>
                                <div class="metric-trend" id="usersTrend">
                                    <i class="fas fa-arrow-up"></i>
                                    <span>Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-2 col-lg-4 col-md-6">
                        <div class="metric-card gradient-info">
                            <div class="metric-header">
                                <h6>Products Sold</h6>
                                <i class="fas fa-shopping-cart"></i>
                            </div>
                            <div class="metric-body">
                                <h2 id="productsSold">-</h2>
                                <div class="metric-trend" id="productsTrend">
                                    <i class="fas fa-arrow-up"></i>
                                    <span>Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-2 col-lg-4 col-md-6">
                        <div class="metric-card gradient-warning">
                            <div class="metric-header">
                                <h6>Notes Shared</h6>
                                <i class="fas fa-book"></i>
                            </div>
                            <div class="metric-body">
                                <h2 id="notesShared">-</h2>
                                <div class="metric-trend" id="notesTrend">
                                    <i class="fas fa-arrow-up"></i>
                                    <span>Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-2 col-lg-4 col-md-6">
                        <div class="metric-card gradient-danger">
                            <div class="metric-header">
                                <h6>Room Bookings</h6>
                                <i class="fas fa-home"></i>
                            </div>
                            <div class="metric-body">
                                <h2 id="roomBookings">-</h2>
                                <div class="metric-trend" id="roomsTrend">
                                    <i class="fas fa-arrow-up"></i>
                                    <span>Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-2 col-lg-4 col-md-6">
                        <div class="metric-card gradient-dark">
                            <div class="metric-header">
                                <h6>Conversion Rate</h6>
                                <i class="fas fa-percentage"></i>
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

                <!-- Time Period Selector -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="time-period-selector">
                            <div class="btn-group" role="group" aria-label="Time period">
                                <input type="radio" class="btn-check" name="timePeriod" id="period1d" value="1" autocomplete="off">
                                <label class="btn btn-outline-primary" for="period1d">1D</label>

                                <input type="radio" class="btn-check" name="timePeriod" id="period7d" value="7" autocomplete="off">
                                <label class="btn btn-outline-primary" for="period7d">7D</label>

                                <input type="radio" class="btn-check" name="timePeriod" id="period30d" value="30" autocomplete="off" checked>
                                <label class="btn btn-outline-primary" for="period30d">30D</label>

                                <input type="radio" class="btn-check" name="timePeriod" id="period90d" value="90" autocomplete="off">
                                <label class="btn btn-outline-primary" for="period90d">90D</label>

                                <input type="radio" class="btn-check" name="timePeriod" id="period1y" value="365" autocomplete="off">
                                <label class="btn btn-outline-primary" for="period1y">1Y</label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Analytics Charts -->
                <div class="row mb-4">
                    <div class="col-lg-8">
                        <div class="analytics-card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">Revenue Analytics</h5>
                                <div class="chart-controls">
                                    <select class="form-select form-select-sm" id="revenueMetric">
                                        <option value="total">Total Revenue</option>
                                        <option value="products">Product Sales</option>
                                        <option value="rooms">Room Bookings</option>
                                        <option value="sponsorships">Sponsorships</option>
                                    </select>
                                </div>
                            </div>
                            <div class="card-body">
                                <canvas id="revenueChart" height="400"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="analytics-card">
                            <div class="card-header">
                                <h5 class="mb-0">Revenue Distribution</h5>
                            </div>
                            <div class="card-body">
                                <canvas id="revenueDistributionChart" height="400"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- User Analytics -->
                <div class="row mb-4">
                    <div class="col-lg-6">
                        <div class="analytics-card">
                            <div class="card-header">
                                <h5 class="mb-0">User Growth</h5>
                            </div>
                            <div class="card-body">
                                <canvas id="userGrowthChart" height="300"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="analytics-card">
                            <div class="card-header">
                                <h5 class="mb-0">User Engagement</h5>
                            </div>
                            <div class="card-body">
                                <canvas id="engagementChart" height="300"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Platform Performance -->
                <div class="row mb-4">
                    <div class="col-lg-4">
                        <div class="analytics-card">
                            <div class="card-header">
                                <h5 class="mb-0">Platform Usage</h5>
                            </div>
                            <div class="card-body">
                                <canvas id="platformUsageChart" height="250"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="analytics-card">
                            <div class="card-header">
                                <h5 class="mb-0">Popular Categories</h5>
                            </div>
                            <div class="card-body">
                                <canvas id="categoriesChart" height="250"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="analytics-card">
                            <div class="card-header">
                                <h5 class="mb-0">Device Analytics</h5>
                            </div>
                            <div class="card-body">
                                <canvas id="deviceChart" height="250"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Top Performers -->
                <div class="row mb-4">
                    <div class="col-lg-4">
                        <div class="analytics-card">
                            <div class="card-header">
                                <h5 class="mb-0">Top Products</h5>
                            </div>
                            <div class="card-body">
                                <div class="top-performers-list" id="topProducts">
                                    <div class="text-center py-3">
                                        <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                                        <div class="mt-2 small text-muted">Loading...</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="analytics-card">
                            <div class="card-header">
                                <h5 class="mb-0">Top Notes</h5>
                            </div>
                            <div class="card-body">
                                <div class="top-performers-list" id="topNotes">
                                    <div class="text-center py-3">
                                        <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                                        <div class="mt-2 small text-muted">Loading...</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="analytics-card">
                            <div class="card-header">
                                <h5 class="mb-0">Top Users</h5>
                            </div>
                            <div class="card-body">
                                <div class="top-performers-list" id="topUsers">
                                    <div class="text-center py-3">
                                        <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                                        <div class="mt-2 small text-muted">Loading...</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Real-time Activity Feed -->
                <div class="row">
                    <div class="col-12">
                        <div class="analytics-card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">
                                    <i class="fas fa-broadcast-tower me-2 text-success"></i>
                                    Real-time Activity
                                </h5>
                                <div class="activity-controls">
                                    <button class="btn btn-sm btn-outline-success" onclick="enhancedAnalytics.toggleRealTime()" id="realTimeToggle">
                                        <i class="fas fa-pause me-1"></i>Pause
                                    </button>
                                    <button class="btn btn-sm btn-outline-secondary" onclick="enhancedAnalytics.clearActivity()">
                                        <i class="fas fa-trash me-1"></i>Clear
                                    </button>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="activity-feed" id="activityFeed">
                                    <!-- Real-time activities will be populated here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Load data and initialize features
        await this.loadAnalyticsData();
        this.initializeCharts();
        this.setupRealTimeUpdates();
        this.attachEventListeners();
    }

    async loadAnalyticsData() {
        try {
            // Load basic metrics
            await this.loadMetrics();
            await this.loadTopPerformers();
            
        } catch (error) {
            console.error('Error loading analytics data:', error);
        }
    }

    async loadMetrics() {
        try {
            // Get user count
            const { count: userCount } = await this.supabase
                .from('users')
                .select('*', { count: 'exact', head: true });

            // Get product count (mock data)
            const { count: productCount } = await this.supabase
                .from('products')
                .select('*', { count: 'exact', head: true });

            // Get notes count (mock data)
            const { count: notesCount } = await this.supabase
                .from('notes')
                .select('*', { count: 'exact', head: true });

            // Calculate mock metrics
            const revenue = (productCount || 0) * 299 + (notesCount || 0) * 49;
            const roomBookings = Math.floor((userCount || 0) * 0.12);
            const conversionRate = 3.2;

            // Update UI
            document.getElementById('totalRevenue').textContent = `₹${revenue.toLocaleString()}`;
            document.getElementById('activeUsers').textContent = userCount || 0;
            document.getElementById('productsSold').textContent = productCount || 0;
            document.getElementById('notesShared').textContent = notesCount || 0;
            document.getElementById('roomBookings').textContent = roomBookings;
            document.getElementById('conversionRate').textContent = `${conversionRate}%`;

            this.updateTrends();

        } catch (error) {
            console.error('Error loading metrics:', error);
        }
    }

    updateTrends() {
        const trends = [
            { id: 'revenueTrend', change: 12, period: 'vs last month' },
            { id: 'usersTrend', change: 8, period: 'vs last month' },
            { id: 'productsTrend', change: 15, period: 'vs last month' },
            { id: 'notesTrend', change: 22, period: 'vs last month' },
            { id: 'roomsTrend', change: 5, period: 'vs last month' },
            { id: 'conversionTrend', change: -2, period: 'vs last month' }
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

    initializeCharts() {
        this.initializeRevenueChart();
        this.initializeRevenueDistributionChart();
        this.initializeUserGrowthChart();
        this.initializeEngagementChart();
        this.initializePlatformUsageChart();
        this.initializeCategoriesChart();
        this.initializeDeviceChart();
    }

    initializeRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue',
                    data: [12000, 19000, 15000, 25000, 32000, 28000],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Revenue: ₹${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + (value / 1000) + 'K';
                            }
                        }
                    }
                }
            }
        });
    }

    initializeRevenueDistributionChart() {
        const ctx = document.getElementById('revenueDistributionChart');
        if (!ctx) return;

        this.charts.revenueDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Products', 'Rooms', 'Notes', 'Sponsorships'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: ['#2563eb', '#059669', '#d97706', '#dc2626'],
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

    initializeUserGrowthChart() {
        const ctx = document.getElementById('userGrowthChart');
        if (!ctx) return;

        this.charts.userGrowth = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'New Users',
                    data: [45, 78, 120, 156],
                    backgroundColor: '#10b981',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
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

    initializeEngagementChart() {
        const ctx = document.getElementById('engagementChart');
        if (!ctx) return;

        this.charts.engagement = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Products', 'Notes', 'Rooms', 'Messages', 'Search', 'Profile'],
                datasets: [{
                    label: 'Engagement Score',
                    data: [65, 59, 90, 81, 56, 55],
                    backgroundColor: 'rgba(37, 99, 235, 0.2)',
                    borderColor: '#2563eb',
                    pointBackgroundColor: '#2563eb'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    initializePlatformUsageChart() {
        const ctx = document.getElementById('platformUsageChart');
        if (!ctx) return;

        this.charts.platformUsage = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Products', 'Notes', 'Rooms'],
                datasets: [{
                    data: [50, 30, 20],
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

    initializeCategoriesChart() {
        const ctx = document.getElementById('categoriesChart');
        if (!ctx) return;

        this.charts.categories = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: ['Electronics', 'Books', 'Clothing', 'Study Materials', 'Accessories'],
                datasets: [{
                    data: [30, 25, 20, 15, 10],
                    backgroundColor: [
                        '#2563eb',
                        '#059669',
                        '#d97706',
                        '#dc2626',
                        '#7c3aed'
                    ],
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

    initializeDeviceChart() {
        const ctx = document.getElementById('deviceChart');
        if (!ctx) return;

        this.charts.device = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mobile', 'Desktop', 'Tablet'],
                datasets: [{
                    label: 'Users',
                    data: [65, 25, 10],
                    backgroundColor: ['#2563eb', '#059669', '#d97706'],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    async loadTopPerformers() {
        // Load top products
        this.loadTopProducts();
        this.loadTopNotes();
        this.loadTopUsers();
    }

    async loadTopProducts() {
        const container = document.getElementById('topProducts');
        if (!container) return;

        // Mock data for top products
        const topProducts = [
            { name: 'iPhone 13 Pro', sales: 45, revenue: 45000 },
            { name: 'MacBook Air M2', sales: 32, revenue: 38400 },
            { name: 'Sony WH-1000XM4', sales: 28, revenue: 8400 },
            { name: 'iPad Pro 11"', sales: 24, revenue: 19200 },
            { name: 'AirPods Pro', sales: 20, revenue: 4000 }
        ];

        container.innerHTML = topProducts.map((product, index) => `
            <div class="performer-item">
                <div class="rank">#${index + 1}</div>
                <div class="performer-info">
                    <div class="performer-name">${product.name}</div>
                    <div class="performer-stats">
                        <small class="text-muted">${product.sales} sales • ₹${product.revenue.toLocaleString()}</small>
                    </div>
                </div>
                <div class="performer-trend">
                    <i class="fas fa-arrow-up text-success"></i>
                </div>
            </div>
        `).join('');
    }

    async loadTopNotes() {
        const container = document.getElementById('topNotes');
        if (!container) return;

        // Mock data for top notes
        const topNotes = [
            { title: 'Data Structures Notes', downloads: 234, revenue: 11700 },
            { title: 'Organic Chemistry Guide', downloads: 189, revenue: 9450 },
            { title: 'Physics Formula Sheet', downloads: 156, revenue: 7800 },
            { title: 'English Literature Notes', downloads: 134, revenue: 6700 },
            { title: 'Calculus Problem Solutions', downloads: 123, revenue: 6150 }
        ];

        container.innerHTML = topNotes.map((note, index) => `
            <div class="performer-item">
                <div class="rank">#${index + 1}</div>
                <div class="performer-info">
                    <div class="performer-name">${note.title}</div>
                    <div class="performer-stats">
                        <small class="text-muted">${note.downloads} downloads • ₹${note.revenue.toLocaleString()}</small>
                    </div>
                </div>
                <div class="performer-trend">
                    <i class="fas fa-arrow-up text-success"></i>
                </div>
            </div>
        `).join('');
    }

    async loadTopUsers() {
        const container = document.getElementById('topUsers');
        if (!container) return;

        try {
            const { data: users } = await this.supabase
                .from('users')
                .select('id, name, email')
                .limit(5);

            if (!users || users.length === 0) {
                container.innerHTML = '<div class="text-center text-muted py-3">No data available</div>';
                return;
            }

            // Mock engagement scores
            container.innerHTML = users.map((user, index) => `
                <div class="performer-item">
                    <div class="rank">#${index + 1}</div>
                    <div class="performer-info">
                        <div class="performer-name">${user.name || 'Anonymous User'}</div>
                        <div class="performer-stats">
                            <small class="text-muted">${Math.floor(Math.random() * 100) + 50} activities</small>
                        </div>
                    </div>
                    <div class="performer-trend">
                        <i class="fas fa-arrow-up text-success"></i>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error loading top users:', error);
            container.innerHTML = '<div class="text-center text-danger py-3">Error loading data</div>';
        }
    }

    setupRealTimeUpdates() {
        this.startRealTimeActivity();
        
        // Update metrics every 30 seconds
        setInterval(() => {
            this.loadMetrics();
        }, 30000);
    }

    startRealTimeActivity() {
        const activities = [
            'New user registration',
            'Product purchased',
            'Note uploaded',
            'Room booked',
            'User login',
            'Payment completed',
            'Profile updated',
            'Search performed'
        ];

        this.realTimeInterval = setInterval(() => {
            const activity = activities[Math.floor(Math.random() * activities.length)];
            const timestamp = new Date().toLocaleTimeString();
            
            this.addActivityToFeed({
                type: activity,
                timestamp: timestamp,
                user: `User${Math.floor(Math.random() * 1000)}`
            });
        }, 3000);
    }

    addActivityToFeed(activity) {
        const feed = document.getElementById('activityFeed');
        if (!feed) return;

        const activityElement = document.createElement('div');
        activityElement.className = 'activity-item fade-in';
        activityElement.innerHTML = `
            <div class="activity-content">
                <div class="activity-text">
                    <i class="fas fa-circle text-success me-2" style="font-size: 0.5rem;"></i>
                    <strong>${activity.user}</strong> - ${activity.type}
                </div>
                <div class="activity-time">
                    <small class="text-muted">${activity.timestamp}</small>
                </div>
            </div>
        `;

        feed.insertBefore(activityElement, feed.firstChild);

        // Remove old activities (keep only last 20)
        const items = feed.querySelectorAll('.activity-item');
        if (items.length > 20) {
            items[items.length - 1].remove();
        }
    }

    attachEventListeners() {
        // Time period selector
        const periodButtons = document.querySelectorAll('input[name="timePeriod"]');
        periodButtons.forEach(button => {
            button.addEventListener('change', (e) => {
                this.updateChartsForPeriod(e.target.value);
            });
        });

        // Revenue metric selector
        const revenueMetric = document.getElementById('revenueMetric');
        if (revenueMetric) {
            revenueMetric.addEventListener('change', (e) => {
                this.updateRevenueChart(e.target.value);
            });
        }
    }

    updateChartsForPeriod(days) {
        console.log(`Updating charts for ${days} days`);
        // Implementation to update charts based on selected period
    }

    updateRevenueChart(metric) {
        console.log(`Updating revenue chart for metric: ${metric}`);
        // Implementation to update revenue chart based on selected metric
    }

    toggleRealTime() {
        const button = document.getElementById('realTimeToggle');
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
            this.realTimeInterval = null;
            button.innerHTML = '<i class="fas fa-play me-1"></i>Resume';
            button.className = 'btn btn-sm btn-outline-primary';
        } else {
            this.startRealTimeActivity();
            button.innerHTML = '<i class="fas fa-pause me-1"></i>Pause';
            button.className = 'btn btn-sm btn-outline-success';
        }
    }

    clearActivity() {
        const feed = document.getElementById('activityFeed');
        if (feed) {
            feed.innerHTML = '';
        }
    }

    async exportReport() {
        console.log('Exporting analytics report...');
        // Implementation for export functionality
    }

    async scheduleReport() {
        console.log('Opening schedule report modal...');
        // Implementation for schedule functionality
    }

    async refreshAll() {
        await this.loadAnalyticsData();
        window.showNotification && window.showNotification(
            'Analytics dashboard refreshed!', 
            'success'
        );
    }

    // Cleanup function
    destroy() {
        // Clear intervals
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
        }

        // Destroy charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });

        // Unsubscribe from real-time updates
        this.realTimeSubscriptions.forEach(subscription => {
            if (subscription && typeof subscription.unsubscribe === 'function') {
                subscription.unsubscribe();
            }
        });
    }
}

// Initialize enhanced analytics dashboard
window.enhancedAnalytics = new EnhancedAnalyticsDashboard();

// Add to global scope for use in admin panel
window.loadEnhancedAnalyticsPage = () => {
    return window.enhancedAnalytics.renderEnhancedAnalyticsDashboard();
};

console.log('📊 Enhanced Analytics Dashboard Loaded');
