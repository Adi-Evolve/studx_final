'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import ListingCard from './ListingCard';

export default function CompareModal({ currentItem, compareItem, onClose }) {
    if (!currentItem || !compareItem) return null;

    const renderDetail = (label, value) => (
        <div className="py-2 border-b">
            <p className="font-semibold text-gray-600">{label}</p>
            <p className="text-gray-800">{value || 'N/A'}</p>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white border-b px-6 py-4 z-10 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-primary">Compare Items</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-600 transition-colors">
                        <FontAwesomeIcon icon={faXmark} size="lg" />
                    </button>
                </div>

                <div className="p-8 grid grid-cols-2 gap-8">
                    {/* Current Item */}
                    <div>
                        <ListingCard item={currentItem} />
                        <div className="mt-4 space-y-2">
                            {renderDetail('Price', `₹${currentItem.price}`)}
                            {renderDetail('Category', currentItem.category)}
                            {renderDetail('Condition', currentItem.condition)}
                            {renderDetail('College', currentItem.college)}
                        </div>
                    </div>

                    {/* Compare Item */}
                    <div>
                        <ListingCard item={compareItem} />
                        <div className="mt-4 space-y-2">
                            {renderDetail('Price', `₹${compareItem.price}`)}
                            {renderDetail('Category', compareItem.category)}
                            {renderDetail('Condition', compareItem.condition)}
                            {renderDetail('College', compareItem.college)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
