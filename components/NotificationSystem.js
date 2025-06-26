'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';

export default function NotificationSystem({ userId }) {
    // Temporarily disabled notification system - table doesn't exist yet
    // This prevents 404 errors in console
    const [unreadCount] = useState(0);
    
    if (!userId) return null;

    return (
        <div className="relative">
            {/* Notification Bell - Disabled */}
            <button
                onClick={() => {
                    // TODO: Implement when notifications table is created
                    console.log('Notifications feature coming soon!');
                }}
                className="relative p-3 text-gray-600 hover:text-gray-700 transition-colors duration-200 rounded-xl hover:bg-gray-50 opacity-50 cursor-not-allowed"
                title="Notifications feature coming soon"
            >
                <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>
        </div>
    );
}