'use client';

import { useState } from 'react';
import { calculateTransactionFees } from '@/lib/transactionFees';

export default function PaymentModal({ 
    listing, 
    isOpen, 
    onClose, 
    onPaymentSuccess 
}) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    
    if (!isOpen || !listing) return null;

    const fees = calculateTransactionFees(listing.price);

    const handlePayment = async () => {
        setIsProcessing(true);
        try {
            // Step 1: Create Razorpay order via backend
            const orderRes = await fetch('/api/razorpay-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: listing.price, currency: 'INR' })
            });
            if (orderRes.status === 404) {
                throw new Error('Razorpay backend route not found. Please ensure /api/razorpay-order.js exists.');
            }
            const order = await orderRes.json();
            if (!order.id) throw new Error('Failed to create Razorpay order');

            // Step 2: Initialize Razorpay payment
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'StudX Marketplace',
                description: `Purchase: ${listing.title}`,
                order_id: order.id,
                handler: function (response) {
                    alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
                    onPaymentSuccess({ id: response.razorpay_payment_id });
                    onClose();
                },
                prefill: {
                    name: 'Student User',
                    email: 'student@example.com'
                },
                theme: {
                    color: '#3B82F6'
                }
            };
            if (!window.Razorpay) {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => {
                    const rzp = new window.Razorpay(options);
                    rzp.open();
                };
                document.body.appendChild(script);
            } else {
                const rzp = new window.Razorpay(options);
                rzp.open();
            }
        } catch (error) {
            alert('Payment failed: ' + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                📚 Purchase Digital Notes
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Instant download after payment
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Item Summary */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {listing.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {listing.description?.substring(0, 100)}...
                        </p>
                    </div>

                    {/* Fee Breakdown */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                            💰 Digital Notes Purchase Breakdown
                        </h4>
                        
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Notes Price:</span>
                                <span className="font-medium">₹{fees.originalAmount}</span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Platform Fee ({fees.feePercent}%):</span>
                                <span className="text-red-600 dark:text-red-400">₹{fees.platformFee}</span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Payment Processing:</span>
                                <span className="text-red-600 dark:text-red-400">₹{fees.gatewayFee}</span>
                            </div>
                            
                            <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                                <div className="flex justify-between font-bold">
                                    <span className="text-gray-900 dark:text-white">Total Amount:</span>
                                    <span className="text-blue-600 dark:text-blue-400">₹{fees.originalAmount}</span>
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                💡 Note seller receives: ₹{fees.sellerAmount} after fees
                            </div>
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Payment Method
                        </label>
                        <select
                            value={paymentMethod}
                            onChange={() => {}}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            disabled
                        >
                            <option value="razorpay">💳 Razorpay (UPI, Cards, Net Banking)</option>
                        </select>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-6">
                        <div className="flex items-start">
                            <div className="text-blue-600 dark:text-blue-400 mr-2">🔒</div>
                            <div className="text-sm text-blue-800 dark:text-blue-200">
                                <p className="font-medium mb-1">Secure Digital Purchase</p>
                                <p>Your payment is protected by bank-level encryption. You'll get instant access to download the notes after successful payment.</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {isProcessing ? 'Processing...' : `Pay ₹${fees.originalAmount}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Add this script to your app layout for Razorpay
export function RazorpayScript() {
    return (
        <script
            src="https://checkout.razorpay.com/v1/checkout.js"
            async
        />
    );
}
