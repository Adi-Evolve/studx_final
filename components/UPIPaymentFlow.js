'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faUpload, faSpinner, faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default function UPIPaymentFlow({ 
    sellerUPI, 
    amount, 
    orderId,
    productName,
    sellerName,
    onPaymentComplete,
    onCancel 
}) {
    const [qrCodeUrl, setQRCodeUrl] = useState('');
    const [paymentProof, setPaymentProof] = useState(null);
    const [proofPreview, setProofPreview] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [step, setStep] = useState(1); // 1: Payment, 2: Upload Proof

    useEffect(() => {
        generateQRCode();
    }, []);

    const generateQRCode = async () => {
        try {
            const upiString = `upi://pay?pa=${sellerUPI}&pn=${encodeURIComponent(sellerName || 'StudXchange Seller')}&am=${amount}&cu=INR&tn=Order-${orderId}-${encodeURIComponent(productName)}`;
            const qrUrl = await QRCode.toDataURL(upiString, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            setQRCodeUrl(qrUrl);
        } catch (error) {
            // console.error('Error generating QR code:', error);
        }
    };

    const handleProofUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setPaymentProof(file);
            const reader = new FileReader();
            reader.onload = (e) => setProofPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const submitPaymentProof = async () => {
        if (!paymentProof) return;

        setIsUploading(true);
        try {
            // Here you would typically upload to your storage service
            // For now, we'll simulate the upload
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            if (onPaymentComplete) {
                onPaymentComplete({
                    orderId,
                    paymentMethod: 'upi',
                    proofFile: paymentProof,
                    status: 'pending_verification'
                });
            }
        } catch (error) {
            // console.error('Error uploading payment proof:', error);
            alert('Failed to upload payment proof. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const copyUPIId = () => {
        navigator.clipboard.writeText(sellerUPI);
        alert('UPI ID copied to clipboard!');
    };

    const openUPIApp = () => {
        const upiString = `upi://pay?pa=${sellerUPI}&pn=${encodeURIComponent(sellerName || 'StudXchange Seller')}&am=${amount}&cu=INR&tn=Order-${orderId}-${encodeURIComponent(productName)}`;
        window.location.href = upiString;
    };

    return (
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white">UPI Payment</h3>
                <p className="text-blue-100">₹{amount} to {sellerName}</p>
            </div>

            {/* Step 1: Payment */}
            {step === 1 && (
                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            Scan QR Code to Pay
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Use any UPI app (GPay, PhonePe, Paytm, etc.)
                        </p>
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center">
                        {qrCodeUrl ? (
                            <div className="bg-white p-4 rounded-lg shadow-md border-2 border-gray-200">
                                <img src={qrCodeUrl} alt="UPI QR Code" className="w-64 h-64" />
                            </div>
                        ) : (
                            <div className="w-64 h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-gray-400 animate-spin" />
                            </div>
                        )}
                    </div>

                    {/* UPI ID Display */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">UPI ID</p>
                                <p className="font-mono text-lg text-gray-900 dark:text-gray-100">{sellerUPI}</p>
                            </div>
                            <button 
                                onClick={copyUPIId}
                                className="btn-secondary btn-sm"
                            >
                                Copy
                            </button>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">₹{amount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                            <span className="font-mono text-gray-900 dark:text-gray-100">{orderId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Product:</span>
                            <span className="text-gray-900 dark:text-gray-100 text-right">{productName}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button 
                            onClick={openUPIApp}
                            className="w-full btn-primary"
                        >
                            Open UPI App
                        </button>
                        
                        <button 
                            onClick={() => setStep(2)}
                            className="w-full btn-secondary"
                        >
                            I've Made the Payment
                        </button>
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start">
                            <FontAwesomeIcon icon={faQrcode} className="text-blue-500 mr-2 mt-0.5" />
                            <div className="text-sm">
                                <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                                    How to pay:
                                </h5>
                                <ol className="text-blue-700 dark:text-blue-300 list-decimal list-inside space-y-1">
                                    <li>Open any UPI app on your phone</li>
                                    <li>Scan the QR code or enter the UPI ID</li>
                                    <li>Verify the amount and complete payment</li>
                                    <li>Upload payment screenshot for verification</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Upload Proof */}
            {step === 2 && (
                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <FontAwesomeIcon icon={faCheck} className="w-12 h-12 text-green-500 mb-2" />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            Payment Completed?
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Upload a screenshot of your payment for verification
                        </p>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleProofUpload}
                                className="hidden"
                                id="payment-proof"
                            />
                            <label
                                htmlFor="payment-proof"
                                className="cursor-pointer block"
                            >
                                <FontAwesomeIcon icon={faUpload} className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Click to upload payment screenshot
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    JPG, PNG up to 10MB
                                </p>
                            </label>
                        </div>

                        {/* Preview */}
                        {proofPreview && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Preview:</p>
                                <img 
                                    src={proofPreview} 
                                    alt="Payment Proof" 
                                    className="w-full max-w-xs mx-auto rounded-lg border"
                                />
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={submitPaymentProof}
                        disabled={!paymentProof || isUploading}
                        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                Uploading...
                            </>
                        ) : (
                            'Submit Payment Proof'
                        )}
                    </button>

                    {/* Back Button */}
                    <button
                        onClick={() => setStep(1)}
                        className="w-full btn-secondary"
                        disabled={isUploading}
                    >
                        Back to Payment
                    </button>

                    {/* Warning */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <div className="flex items-start">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 mr-2 mt-0.5" />
                            <div className="text-sm">
                                <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                                    Important:
                                </h5>
                                <p className="text-yellow-700 dark:text-yellow-300">
                                    Only upload screenshots from your own payment. False payments may result in account suspension.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-between">
                <button
                    onClick={onCancel}
                    className="text-gray-600 dark:text-gray-400 text-sm hover:text-gray-800 dark:hover:text-gray-200"
                    disabled={isUploading}
                >
                    Cancel Payment
                </button>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                    Secure Payment
                </div>
            </div>
        </div>
    );
}
