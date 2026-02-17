// Premium Subscription Component
// components/SubscriptionPlans.js

'use client';

import { useState, useEffect } from 'react';
import { subscriptionManager } from '@/lib/subscription';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCheck, faTimes, faStar, faCrown, faRocket,
    faChartLine, faShield, faHeadset, faInfinity,
    faBolt, faGem
} from '@fortawesome/free-solid-svg-icons';

const SubscriptionPlans = ({ userId, currentPlan = 'free', onPlanChange }) => {
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(currentPlan);
    const [userSubscription, setUserSubscription] = useState(null);

    useEffect(() => {
        if (userId) {
            loadUserSubscription();
        }
    }, [userId]);

    const loadUserSubscription = async () => {
        try {
            const subscription = await subscriptionManager.getUserSubscription(userId);
            setUserSubscription(subscription);
            setSelectedPlan(subscription.plan_type);
        } catch (error) {
            // console.error('Error loading subscription:', error);
        }
    };

    const handleUpgrade = async (planType) => {
        if (planType === currentPlan) return;
        
        setLoading(true);
        try {
            const result = await subscriptionManager.upgradeSubscription(userId, planType);
            
            if (result.success) {
                setSelectedPlan(planType);
                onPlanChange?.(planType);
                
                // Show success message
                alert(`Successfully upgraded to ${subscriptionManager.plans[planType].name}!`);
            } else {
                alert(`Upgrade failed: ${result.error}`);
            }
        } catch (error) {
            // console.error('Upgrade error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const plans = [
        {
            id: 'free',
            name: 'Free',
            price: 0,
            period: 'Forever',
            description: 'Perfect for getting started',
            icon: faStar,
            color: 'bg-gray-100 border-gray-200',
            buttonColor: 'bg-gray-600 hover:bg-gray-700',
            features: [
                { text: 'Up to 10 active listings', included: true },
                { text: 'Basic customer support', included: true },
                { text: '5% transaction commission', included: true },
                { text: 'Standard listing visibility', included: true },
                { text: 'Basic search filters', included: true },
                { text: 'Advanced analytics', included: false },
                { text: 'Priority support', included: false },
                { text: 'Unlimited listings', included: false },
                { text: 'Sponsored listing credits', included: false },
                { text: 'API access', included: false }
            ]
        },
        {
            id: 'plus',
            name: 'StudX Plus',
            price: 99,
            period: 'per month',
            description: 'Best for active sellers',
            icon: faCrown,
            color: 'bg-blue-50 border-blue-200',
            buttonColor: 'bg-blue-600 hover:bg-blue-700',
            badge: 'Most Popular',
            features: [
                { text: 'Unlimited listings', included: true },
                { text: 'Priority customer support', included: true },
                { text: 'Zero transaction commission', included: true },
                { text: 'Verified seller badge', included: true },
                { text: 'Advanced analytics dashboard', included: true },
                { text: 'Enhanced search visibility', included: true },
                { text: 'Custom listing templates', included: true },
                { text: 'Bulk operations', included: false },
                { text: 'Sponsored listing credits', included: false },
                { text: 'API access', included: false }
            ]
        },
        {
            id: 'pro',
            name: 'StudX Pro',
            price: 199,
            period: 'per month',
            description: 'For power sellers and businesses',
            icon: faRocket,
            color: 'bg-purple-50 border-purple-200',
            buttonColor: 'bg-purple-600 hover:bg-purple-700',
            badge: 'Best Value',
            features: [
                { text: 'Everything in Plus', included: true },
                { text: '₹500 sponsored listing credit', included: true },
                { text: 'Bulk listing operations', included: true },
                { text: 'API access for automation', included: true },
                { text: 'Multi-campus selling', included: true },
                { text: 'White-label mini store', included: true },
                { text: 'Priority dispute resolution', included: true },
                { text: 'Custom integrations', included: true },
                { text: 'Dedicated account manager', included: true },
                { text: 'Advanced seller insights', included: true }
            ]
        }
    ];

    const isCurrentPlan = (planId) => selectedPlan === planId;
    const isUpgrade = (planId) => {
        const planOrder = { free: 0, plus: 1, pro: 2 };
        return planOrder[planId] > planOrder[selectedPlan];
    };

    return (
        <div className="subscription-plans py-12 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Choose Your Plan
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        Unlock powerful features to boost your sales and streamline your selling experience
                    </p>
                </div>

                {/* Current Subscription Status */}
                {userSubscription && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Current Plan: {userSubscription.plan?.name || 'Free'}
                                </h3>
                                {userSubscription.expires_at && (
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Expires on: {new Date(userSubscription.expires_at).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            {userSubscription.plan_type !== 'free' && (
                                <div className="flex items-center text-green-600 dark:text-green-400">
                                    <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                    Active
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Plans Grid */}
                <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative rounded-2xl shadow-lg ${plan.color} ${
                                isCurrentPlan(plan.id) ? 'ring-2 ring-blue-500' : ''
                            } hover:shadow-xl transition-all duration-300`}
                        >
                            {/* Badge */}
                            {plan.badge && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                                        {plan.badge}
                                    </span>
                                </div>
                            )}

                            <div className="p-8">
                                {/* Plan Header */}
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
                                        <FontAwesomeIcon 
                                            icon={plan.icon} 
                                            className={`text-2xl ${
                                                plan.id === 'free' ? 'text-gray-600' :
                                                plan.id === 'plus' ? 'text-blue-600' :
                                                'text-purple-600'
                                            }`}
                                        />
                                    </div>
                                    
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        {plan.name}
                                    </h3>
                                    
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        {plan.description}
                                    </p>

                                    <div className="flex items-baseline justify-center">
                                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                                            ₹{plan.price}
                                        </span>
                                        {plan.price > 0 && (
                                            <span className="text-gray-600 dark:text-gray-400 ml-2">
                                                /{plan.period}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Features List */}
                                <div className="space-y-4 mb-8">
                                    {plan.features.map((feature, index) => (
                                        <div key={index} className="flex items-center">
                                            <FontAwesomeIcon
                                                icon={feature.included ? faCheck : faTimes}
                                                className={`mr-3 ${
                                                    feature.included 
                                                        ? 'text-green-500' 
                                                        : 'text-gray-400 dark:text-gray-600'
                                                }`}
                                            />
                                            <span className={`${
                                                feature.included 
                                                    ? 'text-gray-900 dark:text-white' 
                                                    : 'text-gray-500 dark:text-gray-600'
                                            }`}>
                                                {feature.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={() => handleUpgrade(plan.id)}
                                    disabled={loading || isCurrentPlan(plan.id)}
                                    className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                                        isCurrentPlan(plan.id)
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : plan.buttonColor
                                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Processing...
                                        </div>
                                    ) : isCurrentPlan(plan.id) ? (
                                        'Current Plan'
                                    ) : isUpgrade(plan.id) ? (
                                        `Upgrade to ${plan.name}`
                                    ) : (
                                        `Downgrade to ${plan.name}`
                                    )}
                                </button>

                                {/* Savings Calculator */}
                                {plan.id === 'plus' && (
                                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                                        <p className="text-sm text-green-700 dark:text-green-300 text-center">
                                            💰 Save commission on sales over ₹1,980/month
                                        </p>
                                    </div>
                                )}

                                {plan.id === 'pro' && (
                                    <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                                        <p className="text-sm text-purple-700 dark:text-purple-300 text-center">
                                            🚀 Includes ₹500 sponsored credits + commission savings
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                        Frequently Asked Questions
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                Can I change plans anytime?
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400">
                                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                What happens to my sponsored credits?
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400">
                                Unused credits carry over when you upgrade, but are lost when you downgrade.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                Is there a commitment period?
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400">
                                No long-term commitments. All plans are month-to-month with easy cancellation.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                How does commission savings work?
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400">
                                Plus and Pro plans eliminate the 5% transaction commission on all your sales.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact Support */}
                <div className="mt-8 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        Need help choosing? {' '}
                        <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
                            Contact our sales team
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPlans;
