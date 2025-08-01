'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faMobile, 
    faMoneyBillWave, 
    faCreditCard,
    faCheck,
    faInfoCircle,
    faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { faPaypal } from '@fortawesome/free-brands-svg-icons';

export default function PaymentMethodSelector({ 
    amount, 
    sellerInfo, 
    userCollege,
    onMethodSelected,
    onCancel 
}) {
    const [selectedMethod, setSelectedMethod] = useState('');

    const paymentMethods = [
        {
            id: 'upi',
            name: 'UPI Payment',
            icon: faMobile,
            iconColor: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/30',
            borderColor: 'border-blue-200 dark:border-blue-800',
            fees: 'Free',
            feesColor: 'text-green-600',
            description: 'Pay via any UPI app (GPay, PhonePe, Paytm, etc.)',
            processingTime: 'Instant',
            available: !!sellerInfo.upi_id,
            recommended: true,
            benefits: ['No processing fees', 'Instant transfer', 'Screenshot verification']
        },
        {
            id: 'cod',
            name: 'Cash on Delivery',
            icon: faMoneyBillWave,
            iconColor: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/30',
            borderColor: 'border-green-200 dark:border-green-800',
            fees: 'Free',
            feesColor: 'text-green-600',
            description: 'Pay when you receive the item',
            processingTime: 'On delivery',
            available: sellerInfo.college === userCollege && amount <= 50000, // Local delivery and amount limit
            benefits: ['No online payment needed', 'High trust factor', 'Inspect before payment']
        },
        {
            id: 'paypal',
            name: 'PayPal',
            icon: faPaypal,
            iconColor: 'text-blue-500',
            bgColor: 'bg-blue-50 dark:bg-blue-900/30',
            borderColor: 'border-blue-200 dark:border-blue-800',
            fees: `₹${Math.round(amount * 0.029 + 3.5)}`,
            feesColor: 'text-orange-600',
            description: 'International payments & buyer protection',
            processingTime: '1-2 minutes',
            available: true,
            benefits: ['Buyer protection', 'International support', 'Secure transactions']
        }
    ];

    const handleMethodSelect = (methodId) => {
        setSelectedMethod(methodId);
    };

    const handleContinue = () => {
        if (!selectedMethod) return;
        
        const method = paymentMethods.find(m => m.id === selectedMethod);
        if (onMethodSelected) {
            onMethodSelected(selectedMethod, method);
        }
    };

    const getTotalAmount = (method) => {
        if (method.id === 'paypal') {
            const fees = Math.round(amount * 0.029 + 3.5);
            return amount + fees;
        }
        return amount;
    };

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 sticky top-0 z-10">
                <h3 className="text-xl font-bold text-white">Choose Payment Method</h3>
                <p className="text-primary-100">Select how you'd like to pay ₹{amount}</p>
            </div>

            <div className="p-6 overflow-y-auto">
                {/* Payment Methods */}
                <div className="space-y-4 mb-6">
                    {paymentMethods.filter(method => method.available).map(method => (
                        <div
                            key={method.id}
                            className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                                selectedMethod === method.id 
                                    ? `${method.borderColor} ${method.bgColor} shadow-md` 
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
                            }`}
                            onClick={() => handleMethodSelect(method.id)}
                        >
                            {/* Recommended Badge */}
                            {method.recommended && (
                                <div className="absolute -top-2 left-4">
                                    <span className="bg-yellow-400 text-yellow-900 text-xs font-medium px-2 py-1 rounded-full">
                                        Recommended
                                    </span>
                                </div>
                            )}

                            <div className="flex items-start space-x-4">
                                {/* Radio Button */}
                                <div className="flex-shrink-0 mt-1">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        selectedMethod === method.id 
                                            ? 'border-primary-500 bg-primary-500' 
                                            : 'border-gray-300 dark:border-gray-600'
                                    }`}>
                                        {selectedMethod === method.id && (
                                            <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-white" />
                                        )}
                                    </div>
                                </div>

                                {/* Method Icon */}
                                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${method.bgColor}`}>
                                    <FontAwesomeIcon icon={method.icon} className={`w-6 h-6 ${method.iconColor}`} />
                                </div>

                                {/* Method Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {method.name}
                                        </h4>
                                        <div className="text-right">
                                            <div className={`text-sm font-medium ${method.feesColor}`}>
                                                {method.fees}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                fees
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        {method.description}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                                        <span>Processing: {method.processingTime}</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            Total: ₹{getTotalAmount(method)}
                                        </span>
                                    </div>

                                    {/* Benefits */}
                                    <div className="flex flex-wrap gap-1">
                                        {method.benefits.map((benefit, index) => (
                                            <span 
                                                key={index}
                                                className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded"
                                            >
                                                {benefit}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Unavailable Methods Info */}
                {paymentMethods.some(method => !method.available) && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                            <FontAwesomeIcon icon={faInfoCircle} className="w-4 h-4 mr-2 text-gray-500" />
                            Unavailable Payment Methods
                        </h5>
                        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                            {!sellerInfo.upi_id && (
                                <p>• UPI Payment: Seller hasn't provided UPI ID</p>
                            )}
                            {sellerInfo.college !== userCollege && (
                                <p>• Cash on Delivery: Only available for same college transactions</p>
                            )}
                            {amount > 50000 && sellerInfo.college === userCollege && (
                                <p>• Cash on Delivery: Not available for amounts above ₹50,000</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Security Notice */}
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                        <FontAwesomeIcon icon={faCheck} className="text-blue-500 mr-2 mt-0.5" />
                        <div className="text-sm">
                            <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                                Secure Payment
                            </h5>
                            <p className="text-blue-700 dark:text-blue-300">
                                All payments are processed securely. Your financial information is protected and never stored on our servers.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Summary */}
                {selectedMethod && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Payment Summary</h5>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Item Amount:</span>
                                <span className="text-gray-900 dark:text-gray-100">₹{amount}</span>
                            </div>
                            {selectedMethod === 'paypal' && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Processing Fees:</span>
                                    <span className="text-gray-900 dark:text-gray-100">
                                        ₹{Math.round(amount * 0.029 + 3.5)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between font-semibold text-lg border-t border-gray-300 dark:border-gray-600 pt-1">
                                <span className="text-gray-900 dark:text-gray-100">Total:</span>
                                <span className="text-gray-900 dark:text-gray-100">
                                    ₹{getTotalAmount(paymentMethods.find(m => m.id === selectedMethod))}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 sticky bottom-0 bg-white dark:bg-gray-800 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleContinue}
                        disabled={!selectedMethod}
                        className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continue with {selectedMethod && paymentMethods.find(m => m.id === selectedMethod)?.name}
                    </button>
                </div>
            </div>
        </div>
    );
}
