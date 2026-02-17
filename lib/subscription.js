// Subscription Management System
// lib/subscription.js

import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export class SubscriptionManager {
    constructor() {
        this.supabase = createSupabaseBrowserClient();
        this.razorpay = null; // Will be initialized when needed
    }

    // Subscription Plans Configuration
    static plans = {
        free: {
            name: 'Free',
            price: 0,
            duration: 'forever',
            features: [
                'up_to_10_listings',
                'basic_support',
                'standard_commission'
            ],
            limits: {
                maxListings: 10,
                sponsoredCredit: 0,
                commission: 0.05 // 5%
            }
        },
        plus: {
            name: 'StudX Plus',
            price: 99,
            duration: 'month',
            features: [
                'unlimited_listings',
                'priority_support',
                'detailed_analytics',
                'no_commission',
                'verified_badge',
                'advanced_filters'
            ],
            limits: {
                maxListings: -1, // Unlimited
                sponsoredCredit: 0,
                commission: 0 // No commission
            }
        },
        pro: {
            name: 'StudX Pro',
            price: 199,
            duration: 'month',
            features: [
                'all_plus_features',
                'sponsored_listing_credit',
                'bulk_operations',
                'api_access',
                'priority_customer_support',
                'multi_campus_selling',
                'white_label_store'
            ],
            limits: {
                maxListings: -1, // Unlimited
                sponsoredCredit: 500, // ₹500 monthly credit
                commission: 0 // No commission
            }
        }
    };

    // Get user's current subscription
    async getUserSubscription(userId) {
        try {
            const { data, error } = await this.supabase
                .from('user_subscriptions')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0) {
                const subscription = data[0];
                
                // Check if subscription is still valid
                if (new Date(subscription.expires_at) > new Date()) {
                    return {
                        ...subscription,
                        plan: SubscriptionManager.plans[subscription.plan_type]
                    };
                } else {
                    // Subscription expired, mark as inactive
                    await this.expireSubscription(subscription.id);
                    return { plan_type: 'free', plan: SubscriptionManager.plans.free };
                }
            }

            return { plan_type: 'free', plan: SubscriptionManager.plans.free };
        } catch (error) {
            // console.error('Error fetching user subscription:', error);
            return { plan_type: 'free', plan: SubscriptionManager.plans.free };
        }
    }

    // Check if user can perform an action based on their plan
    async canUserPerformAction(userId, action, currentCount = 0) {
        const subscription = await this.getUserSubscription(userId);
        const plan = subscription.plan;

        switch (action) {
            case 'create_listing':
                if (plan.limits.maxListings === -1) return true;
                return currentCount < plan.limits.maxListings;
            
            case 'use_sponsored_credit':
                return plan.limits.sponsoredCredit > 0;
            
            case 'access_analytics':
                return ['plus', 'pro'].includes(subscription.plan_type);
            
            case 'bulk_operations':
                return subscription.plan_type === 'pro';
            
            case 'api_access':
                return subscription.plan_type === 'pro';
            
            default:
                return true;
        }
    }

    // Calculate commission based on user's plan
    async calculateCommission(userId, transactionAmount) {
        const subscription = await this.getUserSubscription(userId);
        const baseCommission = transactionAmount * subscription.plan.limits.commission;
        
        return {
            commission: baseCommission,
            discountApplied: subscription.plan_type !== 'free',
            planType: subscription.plan_type
        };
    }

    // Upgrade user subscription
    async upgradeSubscription(userId, planType, paymentDetails = null) {
        const plan = SubscriptionManager.plans[planType];
        if (!plan) throw new Error('Invalid plan type');

        try {
            // If it's a paid plan, process payment
            if (plan.price > 0) {
                const paymentResult = await this.processPayment(userId, plan, paymentDetails);
                if (!paymentResult.success) {
                    throw new Error('Payment failed: ' + paymentResult.error);
                }
            }

            // Calculate expiry date
            const expiresAt = new Date();
            if (plan.duration === 'month') {
                expiresAt.setMonth(expiresAt.getMonth() + 1);
            } else if (plan.duration === 'year') {
                expiresAt.setFullYear(expiresAt.getFullYear() + 1);
            }

            // Deactivate existing subscriptions
            await this.deactivateExistingSubscriptions(userId);

            // Create new subscription
            const { data, error } = await this.supabase
                .from('user_subscriptions')
                .insert({
                    user_id: userId,
                    plan_type: planType,
                    status: 'active',
                    started_at: new Date().toISOString(),
                    expires_at: plan.duration === 'forever' ? null : expiresAt.toISOString(),
                    payment_id: paymentDetails?.paymentId || null,
                    amount_paid: plan.price
                })
                .select()
                .single();

            if (error) throw error;

            // Add sponsored credit if applicable
            if (plan.limits.sponsoredCredit > 0) {
                await this.addSponsoredCredit(userId, plan.limits.sponsoredCredit);
            }

            // Send confirmation email/notification
            await this.sendSubscriptionConfirmation(userId, planType);

            return { success: true, subscription: data };
        } catch (error) {
            // console.error('Error upgrading subscription:', error);
            return { success: false, error: error.message };
        }
    }

    // Process payment using Razorpay
    async processPayment(userId, plan, paymentDetails) {
        try {
            // Initialize Razorpay if not already done
            if (!this.razorpay && typeof window !== 'undefined') {
                this.razorpay = new window.Razorpay({
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                });
            }

            // Create order on backend
            const orderResponse = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: plan.price * 100, // Razorpay expects amount in paise
                    currency: 'INR',
                    userId,
                    planType: plan.name
                })
            });

            const order = await orderResponse.json();
            if (!order.success) throw new Error(order.error);

            // Open Razorpay payment modal
            return new Promise((resolve) => {
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: order.amount,
                    currency: order.currency,
                    name: 'StudX',
                    description: `${plan.name} Subscription`,
                    order_id: order.id,
                    handler: function (response) {
                        // Payment successful
                        resolve({
                            success: true,
                            paymentId: response.razorpay_payment_id,
                            orderId: response.razorpay_order_id,
                            signature: response.razorpay_signature
                        });
                    },
                    modal: {
                        ondismiss: function() {
                            resolve({
                                success: false,
                                error: 'Payment cancelled by user'
                            });
                        }
                    },
                    theme: {
                        color: '#3B82F6'
                    }
                };

                this.razorpay.open(options);
            });
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Add sponsored listing credit to user account
    async addSponsoredCredit(userId, amount) {
        try {
            const { error } = await this.supabase
                .from('user_credits')
                .upsert({
                    user_id: userId,
                    sponsored_credit: amount,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            // console.error('Error adding sponsored credit:', error);
            return { success: false, error: error.message };
        }
    }

    // Use sponsored credit
    async useSponsoredCredit(userId, amount) {
        try {
            const { data: currentCredit } = await this.supabase
                .from('user_credits')
                .select('sponsored_credit')
                .eq('user_id', userId)
                .single();

            if (!currentCredit || currentCredit.sponsored_credit < amount) {
                return { success: false, error: 'Insufficient sponsored credit' };
            }

            const { error } = await this.supabase
                .from('user_credits')
                .update({
                    sponsored_credit: currentCredit.sponsored_credit - amount,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (error) throw error;
            return { success: true, remainingCredit: currentCredit.sponsored_credit - amount };
        } catch (error) {
            // console.error('Error using sponsored credit:', error);
            return { success: false, error: error.message };
        }
    }

    // Deactivate existing subscriptions
    async deactivateExistingSubscriptions(userId) {
        const { error } = await this.supabase
            .from('user_subscriptions')
            .update({ status: 'inactive' })
            .eq('user_id', userId)
            .eq('status', 'active');

        if (error) {
            // console.error('Error deactivating subscriptions:', error);
        }
    }

    // Expire subscription
    async expireSubscription(subscriptionId) {
        const { error } = await this.supabase
            .from('user_subscriptions')
            .update({ status: 'expired' })
            .eq('id', subscriptionId);

        if (error) {
            // console.error('Error expiring subscription:', error);
        }
    }

    // Send subscription confirmation
    async sendSubscriptionConfirmation(userId, planType) {
        try {
            await fetch('/api/notifications/subscription-confirmation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, planType })
            });
        } catch (error) {
            // console.error('Error sending confirmation:', error);
        }
    }

    // Get subscription analytics
    async getSubscriptionAnalytics() {
        try {
            const { data, error } = await this.supabase
                .from('user_subscriptions')
                .select('plan_type, status, created_at, amount_paid')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const analytics = {
                totalSubscriptions: data.length,
                activeSubscriptions: data.filter(s => s.status === 'active').length,
                revenueByPlan: {},
                monthlyRevenue: 0
            };

            data.forEach(sub => {
                if (!analytics.revenueByPlan[sub.plan_type]) {
                    analytics.revenueByPlan[sub.plan_type] = 0;
                }
                analytics.revenueByPlan[sub.plan_type] += sub.amount_paid || 0;
                
                // Calculate this month's revenue
                const subDate = new Date(sub.created_at);
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                
                if (subDate.getMonth() === currentMonth && subDate.getFullYear() === currentYear) {
                    analytics.monthlyRevenue += sub.amount_paid || 0;
                }
            });

            return analytics;
        } catch (error) {
            // console.error('Error getting subscription analytics:', error);
            return null;
        }
    }
}

// Export singleton instance
export const subscriptionManager = new SubscriptionManager();
export default SubscriptionManager;
