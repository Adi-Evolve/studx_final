/**
 * ENHANCED USER MANAGEMENT SYSTEM
 * Advanced user management features for admin panel
 */

class EnhancedUserManager {
    constructor() {
        this.supabase = null;
        this.userCache = new Map();
        this.currentFilters = {};
        this.initializeSupabase();
    }

    initializeSupabase() {
        const SUPABASE_URL = 'https://vdpmumstdxgftaaxeacx.supabase.co';
        const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcG11bXN0ZHhnZnRhYXhlYWN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTkwNjA4MiwiZXhwIjoyMDY3NDgyMDgyfQ.tdYV9te2jYq2ARdPiJi6mpkqfvg45YlfgZ2kXnhLVRs';
        
        if (window.supabase) {
            this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        }
    }

    async renderEnhancedUserDashboard() {
        const container = document.getElementById('content');
        if (!container) return;

        container.innerHTML = `
            <div class="enhanced-user-container">
                <!-- Enhanced Header -->
                <div class="row mb-4">
                    <div class="col-md-8">
                        <h2 class="mb-1">
                            <i class="fas fa-users text-primary me-2"></i>
                            Advanced User Management
                        </h2>
                        <p class="text-muted mb-0">Comprehensive user analytics and management</p>
                    </div>
                    <div class="col-md-4 text-end">
                        <div class="btn-group" role="group">
                            <button class="btn btn-outline-secondary" onclick="enhancedUserManager.exportUserData()">
                                <i class="fas fa-download me-1"></i>Export
                            </button>
                            <button class="btn btn-outline-primary" onclick="enhancedUserManager.openImportModal()">
                                <i class="fas fa-upload me-1"></i>Import
                            </button>
                            <button class="btn btn-primary" onclick="enhancedUserManager.openAddUserModal()">
                                <i class="fas fa-user-plus me-1"></i>Add User
                            </button>
                        </div>
                    </div>
                </div>

                <!-- User Statistics Cards -->
                <div class="row g-4 mb-5">
                    <div class="col-xl-3 col-lg-6">
                        <div class="metric-card gradient-primary">
                            <div class="metric-header">
                                <h6>Total Users</h6>
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="metric-body">
                                <h2 id="totalUsersCount">-</h2>
                                <div class="metric-trend" id="usersTrend">
                                    <i class="fas fa-arrow-up"></i>
                                    <span>Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-3 col-lg-6">
                        <div class="metric-card gradient-success">
                            <div class="metric-header">
                                <h6>Active Today</h6>
                                <i class="fas fa-user-check"></i>
                            </div>
                            <div class="metric-body">
                                <h2 id="activeUsersCount">-</h2>
                                <div class="metric-trend" id="activeTrend">
                                    <i class="fas fa-arrow-up"></i>
                                    <span>Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-3 col-lg-6">
                        <div class="metric-card gradient-info">
                            <div class="metric-header">
                                <h6>New This Week</h6>
                                <i class="fas fa-user-plus"></i>
                            </div>
                            <div class="metric-body">
                                <h2 id="newUsersCount">-</h2>
                                <div class="metric-trend" id="newUsersTrend">
                                    <i class="fas fa-arrow-up"></i>
                                    <span>Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-3 col-lg-6">
                        <div class="metric-card gradient-warning">
                            <div class="metric-header">
                                <h6>Premium Users</h6>
                                <i class="fas fa-crown"></i>
                            </div>
                            <div class="metric-body">
                                <h2 id="premiumUsersCount">-</h2>
                                <div class="metric-trend" id="premiumTrend">
                                    <i class="fas fa-arrow-up"></i>
                                    <span>Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Analytics Charts -->
                <div class="row mb-4">
                    <div class="col-lg-8">
                        <div class="analytics-card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">User Growth Analytics</h5>
                                <div class="chart-controls">
                                    <select class="form-select form-select-sm" id="growthPeriod">
                                        <option value="7">Last 7 days</option>
                                        <option value="30" selected>Last 30 days</option>
                                        <option value="90">Last 90 days</option>
                                        <option value="365">Last year</option>
                                    </select>
                                </div>
                            </div>
                            <div class="card-body">
                                <canvas id="userGrowthChart" height="300"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="analytics-card">
                            <div class="card-header">
                                <h5 class="mb-0">User Distribution</h5>
                            </div>
                            <div class="card-body">
                                <canvas id="userDistributionChart" height="300"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Advanced User Management Table -->
                <div class="management-card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="fas fa-table me-2"></i>
                            User Management
                        </h5>
                        <div class="table-controls">
                            <div class="input-group input-group-sm">
                                <span class="input-group-text"><i class="fas fa-search"></i></span>
                                <input type="text" class="form-control" id="userSearch" placeholder="Search users...">
                            </div>
                            <select class="form-select form-select-sm ms-2" id="roleFilter">
                                <option value="">All Roles</option>
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="premium">Premium</option>
                                <option value="admin">Admin</option>
                            </select>
                            <select class="form-select form-select-sm ms-2" id="statusFilter">
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                            </select>
                            <button class="btn btn-sm btn-outline-primary ms-2" onclick="enhancedUserManager.refreshUserTable()">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover" id="userTable">
                                <thead>
                                    <tr>
                                        <th>
                                            <input type="checkbox" id="selectAllUsers" class="form-check-input">
                                        </th>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Activity</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="userTableBody">
                                    <tr>
                                        <td colspan="8" class="text-center py-4">
                                            <div class="spinner-border text-primary" role="status"></div>
                                            <div class="mt-2">Loading users...</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Pagination -->
                        <nav aria-label="User pagination">
                            <ul class="pagination justify-content-end" id="userPagination">
                                <!-- Pagination will be generated -->
                            </ul>
                        </nav>
                    </div>
                </div>

                <!-- Bulk Actions Bar -->
                <div class="bulk-actions-bar" id="bulkActionsBar" style="display: none;">
                    <div class="d-flex justify-content-between align-items-center">
                        <span id="selectedUserCount">0 users selected</span>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-success" onclick="enhancedUserManager.bulkActivate()">
                                <i class="fas fa-user-check me-1"></i>Activate
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="enhancedUserManager.bulkSuspend()">
                                <i class="fas fa-user-times me-1"></i>Suspend
                            </button>
                            <button class="btn btn-sm btn-info" onclick="enhancedUserManager.bulkMessage()">
                                <i class="fas fa-envelope me-1"></i>Message
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="enhancedUserManager.bulkDelete()">
                                <i class="fas fa-trash me-1"></i>Delete
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="enhancedUserManager.clearSelection()">
                                <i class="fas fa-times me-1"></i>Clear
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- User Detail Modal -->
            <div class="modal fade" id="userDetailModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-user me-2"></i>
                                User Details
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="userDetailContent">
                            <!-- Content will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add User Modal -->
            <div class="modal fade" id="addUserModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-user-plus me-2"></i>
                                Add New User
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="addUserForm">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="userName" class="form-label">Full Name</label>
                                            <input type="text" class="form-control" id="userName" required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="userEmail" class="form-label">Email</label>
                                            <input type="email" class="form-control" id="userEmail" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="userRole" class="form-label">Role</label>
                                            <select class="form-select" id="userRole" required>
                                                <option value="">Select Role</option>
                                                <option value="student">Student</option>
                                                <option value="teacher">Teacher</option>
                                                <option value="premium">Premium</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="userPhone" class="form-label">Phone</label>
                                            <input type="tel" class="form-control" id="userPhone">
                                        </div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="userPassword" class="form-label">Password</label>
                                    <input type="password" class="form-control" id="userPassword" required>
                                    <div class="form-text">Minimum 8 characters</div>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="sendWelcomeEmail" checked>
                                    <label class="form-check-label" for="sendWelcomeEmail">
                                        Send welcome email
                                    </label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-success" onclick="enhancedUserManager.addUser()">
                                <i class="fas fa-user-plus me-1"></i>Add User
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Load data and initialize features
        await this.loadUserMetrics();
        await this.loadUserTable();
        this.initializeCharts();
        this.attachEventListeners();
    }

    async loadUserMetrics() {
        try {
            // Get total users count
            const { count: totalUsers } = await this.supabase
                .from('users')
                .select('*', { count: 'exact', head: true });

            document.getElementById('totalUsersCount').textContent = totalUsers || 0;

            // Mock data for other metrics
            document.getElementById('activeUsersCount').textContent = Math.floor((totalUsers || 0) * 0.15);
            document.getElementById('newUsersCount').textContent = Math.floor((totalUsers || 0) * 0.05);
            document.getElementById('premiumUsersCount').textContent = Math.floor((totalUsers || 0) * 0.08);

            this.updateUserTrends();

        } catch (error) {
            console.error('Error loading user metrics:', error);
        }
    }

    updateUserTrends() {
        const trends = [
            { id: 'usersTrend', change: 8, period: 'vs last month' },
            { id: 'activeTrend', change: 12, period: 'today' },
            { id: 'newUsersTrend', change: 15, period: 'vs last week' },
            { id: 'premiumTrend', change: 5, period: 'vs last month' }
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
        // User Growth Chart
        const growthCtx = document.getElementById('userGrowthChart');
        if (growthCtx) {
            new Chart(growthCtx, {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                        label: 'New Users',
                        data: [45, 78, 120, 156],
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        tension: 0.4
                    }, {
                        label: 'Active Users',
                        data: [230, 345, 456, 523],
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

        // User Distribution Chart
        const distributionCtx = document.getElementById('userDistributionChart');
        if (distributionCtx) {
            new Chart(distributionCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Students', 'Teachers', 'Premium', 'Admin'],
                    datasets: [{
                        data: [65, 20, 12, 3],
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
    }

    async loadUserTable() {
        try {
            const { data: users, error } = await this.supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            const tbody = document.getElementById('userTableBody');
            if (!tbody) return;

            if (users.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center py-4">
                            <i class="fas fa-users fa-3x text-muted mb-3"></i>
                            <div>No users found</div>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = users.map(user => `
                <tr data-user-id="${user.id}">
                    <td>
                        <input type="checkbox" class="form-check-input user-checkbox" value="${user.id}">
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="user-avatar">
                                <img src="${this.getAvatarUrl(user)}" alt="${user.name || 'User'}" class="rounded-circle">
                            </div>
                            <div class="ms-2">
                                <div class="fw-semibold">${user.name || 'Anonymous User'}</div>
                                <small class="text-muted">ID: ${user.id.substring(0, 8)}...</small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div>${user.email || 'N/A'}</div>
                        <small class="text-muted">${user.email_verified ? 'Verified' : 'Unverified'}</small>
                    </td>
                    <td>
                        <span class="badge bg-${this.getRoleBadgeColor(user.role)}">
                            ${(user.role || 'student').charAt(0).toUpperCase() + (user.role || 'student').slice(1)}
                        </span>
                    </td>
                    <td>
                        <span class="badge bg-${this.getStatusBadgeColor(user.status)}">
                            ${(user.status || 'active').charAt(0).toUpperCase() + (user.status || 'active').slice(1)}
                        </span>
                    </td>
                    <td>
                        <div class="user-activity">
                            <small class="text-muted d-block">Last seen: ${this.formatLastSeen(user.last_seen_at)}</small>
                            <small class="text-success">●</small> ${this.isOnline(user.last_seen_at) ? 'Online' : 'Offline'}
                        </div>
                    </td>
                    <td>
                        <small class="text-muted">
                            ${new Date(user.created_at).toLocaleDateString()}
                        </small>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" onclick="enhancedUserManager.viewUser('${user.id}')" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-info" onclick="enhancedUserManager.editUser('${user.id}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-warning" onclick="enhancedUserManager.messageUser('${user.id}')" title="Message">
                                <i class="fas fa-envelope"></i>
                            </button>
                            <button class="btn btn-outline-${user.status === 'active' ? 'warning' : 'success'}" 
                                    onclick="enhancedUserManager.toggleUserStatus('${user.id}')" 
                                    title="${user.status === 'active' ? 'Suspend' : 'Activate'}">
                                <i class="fas fa-${user.status === 'active' ? 'user-times' : 'user-check'}"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="enhancedUserManager.deleteUser('${user.id}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            this.attachTableEventListeners();

        } catch (error) {
            console.error('Error loading user table:', error);
            document.getElementById('userTableBody').innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4 text-danger">
                        <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                        <div>Error loading users: ${error.message}</div>
                    </td>
                </tr>
            `;
        }
    }

    // Utility functions
    getAvatarUrl(user) {
        if (user.avatar_url) return user.avatar_url;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&size=40&background=2563eb&color=ffffff`;
    }

    getRoleBadgeColor(role) {
        const colors = {
            'student': 'primary',
            'teacher': 'success',
            'premium': 'warning',
            'admin': 'danger'
        };
        return colors[role] || 'secondary';
    }

    getStatusBadgeColor(status) {
        const colors = {
            'active': 'success',
            'inactive': 'secondary',
            'suspended': 'danger'
        };
        return colors[status] || 'secondary';
    }

    formatLastSeen(lastSeen) {
        if (!lastSeen) return 'Never';
        const date = new Date(lastSeen);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    }

    isOnline(lastSeen) {
        if (!lastSeen) return false;
        const diff = new Date() - new Date(lastSeen);
        return diff < 300000; // 5 minutes
    }

    // Event listeners
    attachEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('userSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterUsers(e.target.value);
            });
        }

        // Filter functionality
        const roleFilter = document.getElementById('roleFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        if (roleFilter) {
            roleFilter.addEventListener('change', () => this.applyUserFilters());
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyUserFilters());
        }
    }

    attachTableEventListeners() {
        // Select all checkbox
        const selectAllCheckbox = document.getElementById('selectAllUsers');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.user-checkbox');
                checkboxes.forEach(cb => cb.checked = e.target.checked);
                this.updateBulkActionsBar();
            });
        }

        // Individual checkboxes
        const checkboxes = document.querySelectorAll('.user-checkbox');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => this.updateBulkActionsBar());
        });
    }

    updateBulkActionsBar() {
        const selectedCheckboxes = document.querySelectorAll('.user-checkbox:checked');
        const bulkActionsBar = document.getElementById('bulkActionsBar');
        const selectedCount = document.getElementById('selectedUserCount');

        if (selectedCheckboxes.length > 0) {
            bulkActionsBar.style.display = 'block';
            selectedCount.textContent = `${selectedCheckboxes.length} user${selectedCheckboxes.length !== 1 ? 's' : ''} selected`;
        } else {
            bulkActionsBar.style.display = 'none';
        }
    }

    // CRUD operations
    async viewUser(userId) {
        try {
            const { data: user, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;

            const modal = new bootstrap.Modal(document.getElementById('userDetailModal'));
            const content = document.getElementById('userDetailContent');
            
            content.innerHTML = `
                <div class="row">
                    <div class="col-md-4 text-center">
                        <img src="${this.getAvatarUrl(user)}" alt="${user.name}" class="rounded-circle mb-3" width="120" height="120">
                        <h5>${user.name || 'Anonymous User'}</h5>
                        <span class="badge bg-${this.getRoleBadgeColor(user.role)} mb-2">
                            ${(user.role || 'student').charAt(0).toUpperCase() + (user.role || 'student').slice(1)}
                        </span>
                    </div>
                    <div class="col-md-8">
                        <table class="table table-borderless">
                            <tr>
                                <td><strong>Email:</strong></td>
                                <td>${user.email || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td><strong>Phone:</strong></td>
                                <td>${user.phone || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td><strong>Status:</strong></td>
                                <td>
                                    <span class="badge bg-${this.getStatusBadgeColor(user.status)}">
                                        ${(user.status || 'active').charAt(0).toUpperCase() + (user.status || 'active').slice(1)}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td><strong>Joined:</strong></td>
                                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                            </tr>
                            <tr>
                                <td><strong>Last Seen:</strong></td>
                                <td>${this.formatLastSeen(user.last_seen_at)}</td>
                            </tr>
                            <tr>
                                <td><strong>Email Verified:</strong></td>
                                <td>
                                    <span class="badge bg-${user.email_verified ? 'success' : 'warning'}">
                                        ${user.email_verified ? 'Verified' : 'Unverified'}
                                    </span>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            `;
            
            modal.show();

        } catch (error) {
            console.error('Error viewing user:', error);
            window.showNotification && window.showNotification(
                'Error loading user details: ' + error.message, 
                'error'
            );
        }
    }

    async editUser(userId) {
        console.log('Editing user:', userId);
        // Implementation for edit user modal
    }

    async messageUser(userId) {
        console.log('Messaging user:', userId);
        // Implementation for message user
    }

    async toggleUserStatus(userId) {
        try {
            // Get current status
            const { data: user } = await this.supabase
                .from('users')
                .select('status')
                .eq('id', userId)
                .single();

            const newStatus = user.status === 'active' ? 'suspended' : 'active';

            const { error } = await this.supabase
                .from('users')
                .update({ status: newStatus })
                .eq('id', userId);

            if (error) throw error;

            await this.loadUserTable();
            
            window.showNotification && window.showNotification(
                `User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully!`, 
                'success'
            );

        } catch (error) {
            console.error('Error toggling user status:', error);
            window.showNotification && window.showNotification(
                'Error updating user status: ' + error.message, 
                'error'
            );
        }
    }

    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            const { error } = await this.supabase
                .from('users')
                .delete()
                .eq('id', userId);

            if (error) throw error;

            await this.loadUserTable();
            await this.loadUserMetrics();
            
            window.showNotification && window.showNotification(
                'User deleted successfully!', 
                'success'
            );

        } catch (error) {
            console.error('Error deleting user:', error);
            window.showNotification && window.showNotification(
                'Error deleting user: ' + error.message, 
                'error'
            );
        }
    }

    async addUser() {
        const form = document.getElementById('addUserForm');
        const formData = new FormData(form);
        
        const userData = {
            name: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            role: document.getElementById('userRole').value,
            phone: document.getElementById('userPhone').value,
            password: document.getElementById('userPassword').value,
            status: 'active'
        };

        try {
            const { error } = await this.supabase
                .from('users')
                .insert([userData]);

            if (error) throw error;

            const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
            modal.hide();
            form.reset();

            await this.loadUserTable();
            await this.loadUserMetrics();
            
            window.showNotification && window.showNotification(
                'User added successfully!', 
                'success'
            );

        } catch (error) {
            console.error('Error adding user:', error);
            window.showNotification && window.showNotification(
                'Error adding user: ' + error.message, 
                'error'
            );
        }
    }

    // Modal functions
    openAddUserModal() {
        const modal = new bootstrap.Modal(document.getElementById('addUserModal'));
        modal.show();
    }

    openImportModal() {
        console.log('Opening import modal...');
        // Implementation for import users
    }

    async exportUserData() {
        console.log('Exporting user data...');
        // Implementation for export users
    }

    async refreshUserTable() {
        await this.loadUserTable();
        window.showNotification && window.showNotification(
            'User table refreshed!', 
            'success'
        );
    }

    // Bulk operations
    getSelectedUserIds() {
        const selectedCheckboxes = document.querySelectorAll('.user-checkbox:checked');
        return Array.from(selectedCheckboxes).map(cb => cb.value);
    }

    clearSelection() {
        const checkboxes = document.querySelectorAll('.user-checkbox, #selectAllUsers');
        checkboxes.forEach(cb => cb.checked = false);
        this.updateBulkActionsBar();
    }

    async bulkActivate() {
        const selectedIds = this.getSelectedUserIds();
        if (selectedIds.length === 0) return;

        try {
            const { error } = await this.supabase
                .from('users')
                .update({ status: 'active' })
                .in('id', selectedIds);

            if (error) throw error;

            await this.loadUserTable();
            this.clearSelection();
            
            window.showNotification && window.showNotification(
                `${selectedIds.length} users activated successfully!`, 
                'success'
            );

        } catch (error) {
            console.error('Error bulk activating:', error);
        }
    }

    async bulkSuspend() {
        const selectedIds = this.getSelectedUserIds();
        if (selectedIds.length === 0) return;

        if (!confirm(`Are you sure you want to suspend ${selectedIds.length} users?`)) return;

        try {
            const { error } = await this.supabase
                .from('users')
                .update({ status: 'suspended' })
                .in('id', selectedIds);

            if (error) throw error;

            await this.loadUserTable();
            this.clearSelection();
            
            window.showNotification && window.showNotification(
                `${selectedIds.length} users suspended successfully!`, 
                'success'
            );

        } catch (error) {
            console.error('Error bulk suspending:', error);
        }
    }

    async bulkMessage() {
        const selectedIds = this.getSelectedUserIds();
        if (selectedIds.length === 0) return;

        console.log(`Messaging ${selectedIds.length} users...`);
        // Implementation for bulk messaging
    }

    async bulkDelete() {
        const selectedIds = this.getSelectedUserIds();
        if (selectedIds.length === 0) return;

        if (!confirm(`Are you sure you want to delete ${selectedIds.length} users? This action cannot be undone.`)) return;

        try {
            const { error } = await this.supabase
                .from('users')
                .delete()
                .in('id', selectedIds);

            if (error) throw error;

            await this.loadUserTable();
            await this.loadUserMetrics();
            this.clearSelection();
            
            window.showNotification && window.showNotification(
                `${selectedIds.length} users deleted successfully!`, 
                'success'
            );

        } catch (error) {
            console.error('Error bulk deleting:', error);
        }
    }

    // Filtering
    filterUsers(searchTerm) {
        const rows = document.querySelectorAll('#userTableBody tr[data-user-id]');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const isVisible = text.includes(searchTerm.toLowerCase());
            row.style.display = isVisible ? '' : 'none';
        });
    }

    applyUserFilters() {
        const roleFilter = document.getElementById('roleFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const rows = document.querySelectorAll('#userTableBody tr[data-user-id]');

        rows.forEach(row => {
            let isVisible = true;

            if (roleFilter) {
                const roleBadge = row.querySelector('td:nth-child(4) .badge');
                const role = roleBadge?.textContent.toLowerCase();
                isVisible = isVisible && role === roleFilter;
            }

            if (statusFilter) {
                const statusBadge = row.querySelector('td:nth-child(5) .badge');
                const status = statusBadge?.textContent.toLowerCase();
                isVisible = isVisible && status === statusFilter;
            }

            row.style.display = isVisible ? '' : 'none';
        });
    }
}

// Initialize enhanced user manager
window.enhancedUserManager = new EnhancedUserManager();

// Add to global scope for use in admin panel
window.loadEnhancedUserPage = () => {
    return window.enhancedUserManager.renderEnhancedUserDashboard();
};

console.log('👥 Enhanced User Manager Loaded');
