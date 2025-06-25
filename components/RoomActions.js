'use client';

import { useState } from 'react';

export default function RoomActions({ room, sellerPhoneNumber }) {
    const [isComparing, setIsComparing] = useState(false);

    const handleCompare = () => {
        // Placeholder for compare logic as per prior instructions
        // This can be expanded to use a global state (Context, Redux, etc.)
        setIsComparing(!isComparing);
        alert(isComparing ? 'Removed from comparison.' : 'Added to comparison!');
    };

    const whatsappLink = sellerPhoneNumber 
        ? `https://wa.me/${sellerPhoneNumber}?text=I'm%20interested%20in%20your%20room:%20${encodeURIComponent(room.hostel_name || room.title)}`
        : '#';

    return (
        <div className="flex space-x-4 mb-8">
            <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`bg-green-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-600 transition duration-300 shadow-sm ${!sellerPhoneNumber ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={(e) => {
                    if (!sellerPhoneNumber) {
                        e.preventDefault();
                        alert('Seller contact information is not available.');
                    }
                }}
            >
                Contact Seller
            </a>
            <button 
                onClick={handleCompare}
                className="bg-gray-200 text-primary font-bold py-3 px-8 rounded-lg hover:bg-gray-300 transition duration-300"
            >
                {isComparing ? 'Remove from Compare' : 'Compare'}
            </button>
        </div>
    );
}
