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
        ? `https://wa.me/${sellerPhoneNumber}?text=Hello!%20I%20saw%20your%20room%20listing%20for%20'${encodeURIComponent(room.hostel_name || room.title)}'%20on%20StudXchange%20and%20I'm%20interested%20in%20renting%20it.%20%0A%0ACould%20you%20please%20provide%20more%20details%20about:%20%0A-%20Room%20availability%20dates%20%0A-%20Monthly%20rent%20and%20security%20deposit%20%0A-%20Included%20amenities%20and%20utilities%20%0A-%20House%20rules%20and%20preferences%20%0A-%20Best%20time%20for%20room%20viewing%20%0A%0ARoom%20Link:%20${encodeURIComponent(window.location.href)}%20%0A%0AI%20would%20love%20to%20schedule%20a%20viewing%20if%20possible.%20Thank%20you!`
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
