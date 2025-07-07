// PWA Installation Hook and Component
'use client';
import { useState, useEffect } from 'react';

export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Save the event for later use
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        // Listen for successful app installation
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setIsInstallable(false);
            setDeferredPrompt(null);
            console.log('StudX PWA was installed successfully');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const promptInstall = async () => {
        if (!deferredPrompt) return false;

        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        
        // Clear the deferred prompt
        setDeferredPrompt(null);
        setIsInstallable(false);

        return outcome === 'accepted';
    };

    return {
        isInstallable,
        isInstalled,
        promptInstall
    };
}

// PWA Install Prompt Component
export default function PWAInstallPrompt() {
    const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
    const [showPrompt, setShowPrompt] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Show prompt after a delay if app is installable
        if (isInstallable && !dismissed) {
            const timer = setTimeout(() => {
                setShowPrompt(true);
            }, 3000); // Show after 3 seconds

            return () => clearTimeout(timer);
        }
    }, [isInstallable, dismissed]);

    const handleInstall = async () => {
        const installed = await promptInstall();
        if (installed) {
            setShowPrompt(false);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        setDismissed(true);
        // Remember dismissal for this session
        sessionStorage.setItem('pwa-prompt-dismissed', 'true');
    };

    // Don't show if already installed or dismissed this session
    if (isInstalled || !isInstallable || !showPrompt) {
        return null;
    }

    if (sessionStorage.getItem('pwa-prompt-dismissed')) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-xl">📱</span>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900">
                            Install StudX App
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Get quick access to buy and sell items with our mobile app experience.
                        </p>
                        <div className="mt-3 flex space-x-2">
                            <button
                                onClick={handleInstall}
                                className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-2 rounded-lg font-medium transition-colors"
                            >
                                Install
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-2 rounded-lg font-medium transition-colors"
                            >
                                Not now
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

// PWA Install Button (for header/menu)
export function PWAInstallButton({ className = "" }) {
    const { isInstallable, isInstalled, promptInstall } = usePWAInstall();

    if (isInstalled) {
        return (
            <div className={`flex items-center text-green-600 ${className}`}>
                <span className="mr-2">✅</span>
                <span className="text-sm">App Installed</span>
            </div>
        );
    }

    if (!isInstallable) {
        return null;
    }

    return (
        <button
            onClick={promptInstall}
            className={`flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors ${className}`}
        >
            <span className="mr-2">📱</span>
            Install App
        </button>
    );
}

// Service Worker Registration
export function registerServiceWorker() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('SW registered: ', registration);
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
}
