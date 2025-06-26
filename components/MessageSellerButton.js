'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { createOrGetConversation } from '@/app/actions';

export default function MessageSellerButton({ listingId, sellerId, listingType, sellerName }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleMessageSeller = async () => {
        if (!listingId || !sellerId) {
            alert('Cannot start conversation - missing information');
            return;
        }

        setIsLoading(true);
        try {
            const conversation = await createOrGetConversation({
                listingId,
                sellerId,
                listingType
            });

            // Redirect to chat page with conversation ID
            router.push(`/messages/${conversation.id}`);
        } catch (error) {
            console.error('Error starting conversation:', error);
            if (error.message === 'User not authenticated') {
                router.push('/login');
            } else {
                alert('Failed to start conversation. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleMessageSeller}
            disabled={isLoading}
            className="btn-primary w-full disabled:opacity-50"
        >
            {isLoading ? (
                <>
                    <div className="spinner" />
                    Starting Chat...
                </>
            ) : (
                <>
                    <FontAwesomeIcon icon={faComments} className="w-4 h-4" />
                    Message {sellerName || 'Seller'}
                </>
            )}
        </button>
    );
}