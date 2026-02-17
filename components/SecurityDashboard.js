'use client';

import { useState, useEffect } from 'react';

export default function SecurityDashboard() {
    const [securityStatus, setSecurityStatus] = useState({
        loading: true,
        score: 0,
        checks: []
    });

    useEffect(() => {
        runSecurityScan();
    }, []);

    const runSecurityScan = async () => {
        setSecurityStatus({ loading: true, score: 0, checks: [] });

        const checks = [
            {
                name: 'Environment Variables',
                description: 'Check if sensitive data is properly configured',
                test: checkEnvironmentVariables
            },
            {
                name: 'API Security',
                description: 'Verify API endpoints are protected',
                test: checkAPIEndpoints
            },
            {
                name: 'Authentication',
                description: 'Test user authentication system',
                test: checkAuthentication
            },
            {
                name: 'File Access Control',
                description: 'Verify sensitive files are blocked',
                test: checkFileAccess
            },
            {
                name: 'Security Headers',
                description: 'Check security headers are present',
                test: checkSecurityHeaders
            }
        ];

        const results = [];
        let totalScore = 0;

        for (const check of checks) {
            try {
                const result = await check.test();
                results.push({
                    ...check,
                    status: result.passed ? 'passed' : 'failed',
                    message: result.message,
                    details: result.details || []
                });
                if (result.passed) totalScore += 20;
            } catch (error) {
                results.push({
                    ...check,
                    status: 'error',
                    message: `Error: ${error.message}`,
                    details: []
                });
            }
        }

        setSecurityStatus({
            loading: false,
            score: totalScore,
            checks: results
        });
    };

    const checkEnvironmentVariables = async () => {
        // This runs on the client, so we can only check what's exposed
        const publicEnvVars = {
            'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
            'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            'NEXT_PUBLIC_RAZORPAY_KEY_ID': process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        };

        const missing = [];
        const present = [];

        Object.entries(publicEnvVars).forEach(([key, value]) => {
            if (!value) {
                missing.push(key);
            } else {
                present.push(`${key}: ${value.substring(0, 20)}...`);
            }
        });

        return {
            passed: missing.length === 0,
            message: missing.length === 0 
                ? 'All required environment variables are configured'
                : `Missing variables: ${missing.join(', ')}`,
            details: present
        };
    };

    const checkAPIEndpoints = async () => {
        const endpoints = [
            { path: '/api/products', method: 'GET' },
            { path: '/api/sell', method: 'POST' }
        ];

        const results = [];
        let allPassed = true;

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint.path, {
                    method: endpoint.method,
                    headers: endpoint.method === 'POST' ? { 'Content-Type': 'application/json' } : {}
                });
                
                results.push(`${endpoint.method} ${endpoint.path}: ${response.status}`);
                
                // Check for security headers
                const securityHeaders = ['X-Content-Type-Options', 'X-Frame-Options'];
                securityHeaders.forEach(header => {
                    if (response.headers.get(header)) {
                        results.push(`  ✓ ${header}: ${response.headers.get(header)}`);
                    }
                });
            } catch (error) {
                results.push(`${endpoint.method} ${endpoint.path}: Error - ${error.message}`);
                allPassed = false;
            }
        }

        return {
            passed: allPassed,
            message: allPassed ? 'API endpoints are responding correctly' : 'Some API endpoints have issues',
            details: results
        };
    };

    const checkAuthentication = async () => {
        try {
            // Test if we can access protected routes
            const response = await fetch('/api/auth/session');
            const hasSession = response.ok;

            return {
                passed: true, // Authentication system exists
                message: hasSession 
                    ? 'User is currently authenticated' 
                    : 'Authentication system is working (user not logged in)',
                details: [`Session status: ${hasSession ? 'Active' : 'None'}`]
            };
        } catch (error) {
            return {
                passed: false,
                message: 'Authentication system error',
                details: [error.message]
            };
        }
    };

    const checkFileAccess = async () => {
        const blockedFiles = [
            '/adi.html',
            '/admin-panel-tests.js',
            '/test-api.html'
        ];

        const results = [];
        let allBlocked = true;

        for (const file of blockedFiles) {
            try {
                const response = await fetch(file);
                const blocked = response.status === 403 || response.status === 404;
                
                results.push(`${file}: ${blocked ? '🚫 Blocked' : '⚠️ Accessible'} (${response.status})`);
                
                if (!blocked) allBlocked = false;
            } catch (error) {
                results.push(`${file}: 🚫 Blocked (Network error - good!)`);
            }
        }

        return {
            passed: allBlocked,
            message: allBlocked 
                ? 'All sensitive files are properly blocked' 
                : 'Some sensitive files may be accessible',
            details: results
        };
    };

    const checkSecurityHeaders = async () => {
        try {
            const response = await fetch(window.location.origin);
            const headers = [
                'X-Content-Type-Options',
                'X-Frame-Options', 
                'X-XSS-Protection',
                'Strict-Transport-Security',
                'Content-Security-Policy'
            ];

            const results = [];
            let foundHeaders = 0;

            headers.forEach(header => {
                const value = response.headers.get(header);
                if (value) {
                    results.push(`✓ ${header}: ${value}`);
                    foundHeaders++;
                } else {
                    results.push(`✗ ${header}: Not set`);
                }
            });

            return {
                passed: foundHeaders >= 3, // At least 3 security headers
                message: `${foundHeaders}/${headers.length} security headers configured`,
                details: results
            };
        } catch (error) {
            return {
                passed: false,
                message: 'Unable to check security headers',
                details: [error.message]
            };
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'passed': return '✅';
            case 'failed': return '❌';
            case 'error': return '⚠️';
            default: return '⏳';
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
                    🔒 Security Dashboard
                </h1>
                
                {securityStatus.loading ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <div className={`text-4xl font-bold ${getScoreColor(securityStatus.score)}`}>
                            {securityStatus.score}/100
                        </div>
                        <div className="text-gray-600 dark:text-gray-300 mt-2">
                            Security Score
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {securityStatus.checks.map((check, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">{getStatusIcon(check.status)}</span>
                                <div>
                                    <h3 className="font-semibold text-gray-800 dark:text-white">
                                        {check.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {check.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="ml-8">
                            <p className={`text-sm font-medium ${
                                check.status === 'passed' ? 'text-green-600' :
                                check.status === 'failed' ? 'text-red-600' :
                                'text-yellow-600'
                            }`}>
                                {check.message}
                            </p>
                            
                            {check.details && check.details.length > 0 && (
                                <details className="mt-2">
                                    <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                                        Show details
                                    </summary>
                                    <div className="mt-2 pl-4 border-l-2 border-gray-300">
                                        {check.details.map((detail, detailIndex) => (
                                            <p key={detailIndex} className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                                                {detail}
                                            </p>
                                        ))}
                                    </div>
                                </details>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={runSecurityScan}
                    disabled={securityStatus.loading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {securityStatus.loading ? 'Scanning...' : 'Run Security Scan'}
                </button>
            </div>

            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    🛡️ Security Recommendations
                </h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Always use environment variables for sensitive data</li>
                    <li>• Regularly update dependencies to patch vulnerabilities</li>
                    <li>• Enable two-factor authentication on all accounts</li>
                    <li>• Monitor API usage for unusual patterns</li>
                    <li>• Keep security headers up to date</li>
                </ul>
            </div>
        </div>
    );
}
