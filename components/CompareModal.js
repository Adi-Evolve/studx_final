'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCheck, faTimes, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

export default function CompareModal({ currentItem, compareItem, onClose }) {
    if (!currentItem || !compareItem) return null;

    const getImageUrl = (item) => {
        return (Array.isArray(item.images) && item.images.length > 0 && item.images[0])
            || (Array.isArray(item.image_urls) && item.image_urls.length > 0 && item.image_urls[0])
            || `https://i.pravatar.cc/300?u=${item.id}`;
    };

    const formatPrice = (price) => {
        return price ? `₹${price.toLocaleString()}` : 'Not specified';
    };

    const getBetterValue = (value1, value2, type) => {
        if (type === 'price') {
            if (!value1 && !value2) return null;
            if (!value1) return 'right';
            if (!value2) return 'left';
            return value1 < value2 ? 'left' : value1 > value2 ? 'right' : null;
        }
        return null;
    };

    const ComparisonRow = ({ label, value1, value2, type = null }) => {
        const better = getBetterValue(value1, value2, type);
        
        return (
            <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4 font-semibold text-gray-700 bg-gray-50 border-r">{label}</td>
                <td className={`py-4 px-4 ${better === 'left' ? 'bg-green-50 text-green-700 font-semibold' : ''}`}>
                    <div className="flex items-center justify-between">
                        <span>{value1 || 'N/A'}</span>
                        {better === 'left' && <FontAwesomeIcon icon={faCheck} className="w-4 h-4 text-green-600" />}
                    </div>
                </td>
                <td className={`py-4 px-4 ${better === 'right' ? 'bg-green-50 text-green-700 font-semibold' : ''}`}>
                    <div className="flex items-center justify-between">
                        <span>{value2 || 'N/A'}</span>
                        {better === 'right' && <FontAwesomeIcon icon={faCheck} className="w-4 h-4 text-green-600" />}
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <FontAwesomeIcon icon={faExchangeAlt} className="w-6 h-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Product Comparison</h2>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-red-600 transition-colors">
                            <FontAwesomeIcon icon={faXmark} size="lg" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[80vh]">
                    {/* Product Images and Basic Info */}
                    <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50">
                        <div className="text-center">
                            <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                                <Image
                                    src={getImageUrl(currentItem)}
                                    alt={currentItem.title || currentItem.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {currentItem.title || currentItem.name}
                            </h3>
                            <p className="text-2xl font-bold text-blue-600">
                                {formatPrice(currentItem.price || currentItem.fees)}
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                                <Image
                                    src={getImageUrl(compareItem)}
                                    alt={compareItem.title || compareItem.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {compareItem.title || compareItem.name}
                            </h3>
                            <p className="text-2xl font-bold text-blue-600">
                                {formatPrice(compareItem.price || compareItem.fees)}
                            </p>
                        </div>
                    </div>

                    {/* Comparison Table */}
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="py-3 px-4 text-left font-bold text-gray-900 border-r">Features</th>
                                        <th className="py-3 px-4 text-center font-bold text-gray-900">
                                            {currentItem.title || currentItem.name}
                                        </th>
                                        <th className="py-3 px-4 text-center font-bold text-gray-900">
                                            {compareItem.title || compareItem.name}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <ComparisonRow 
                                        label="Price" 
                                        value1={formatPrice(currentItem.price || currentItem.fees)}
                                        value2={formatPrice(compareItem.price || compareItem.fees)}
                                        type="price"
                                    />
                                    <ComparisonRow 
                                        label="Category" 
                                        value1={currentItem.category}
                                        value2={compareItem.category}
                                    />
                                    <ComparisonRow 
                                        label="Condition" 
                                        value1={currentItem.condition}
                                        value2={compareItem.condition}
                                    />
                                    <ComparisonRow 
                                        label="College" 
                                        value1={currentItem.college}
                                        value2={compareItem.college}
                                    />
                                    <ComparisonRow 
                                        label="Description" 
                                        value1={currentItem.description?.substring(0, 100) + (currentItem.description?.length > 100 ? '...' : '')}
                                        value2={compareItem.description?.substring(0, 100) + (compareItem.description?.length > 100 ? '...' : '')}
                                    />
                                    {currentItem.type === 'room' && compareItem.type === 'room' && (
                                        <>
                                            <ComparisonRow 
                                                label="Room Type" 
                                                value1={currentItem.roomType}
                                                value2={compareItem.roomType}
                                            />
                                            <ComparisonRow 
                                                label="Occupancy" 
                                                value1={currentItem.occupancy}
                                                value2={compareItem.occupancy}
                                            />
                                            <ComparisonRow 
                                                label="Amenities" 
                                                value1={currentItem.amenities?.length ? `${currentItem.amenities.length} amenities` : 'None listed'}
                                                value2={compareItem.amenities?.length ? `${compareItem.amenities.length} amenities` : 'None listed'}
                                            />
                                        </>
                                    )}
                                    <ComparisonRow 
                                        label="Posted Date" 
                                        value1={currentItem.created_at ? new Date(currentItem.created_at).toLocaleDateString() : 'Unknown'}
                                        value2={compareItem.created_at ? new Date(compareItem.created_at).toLocaleDateString() : 'Unknown'}
                                    />
                                </tbody>
                            </table>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-4 mt-6">
                            <a
                                href={`/products/${currentItem.type || 'regular'}/${currentItem.id}`}
                                className="btn-primary"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View {currentItem.title || currentItem.name}
                            </a>
                            <a
                                href={`/products/${compareItem.type || 'regular'}/${compareItem.id}`}
                                className="btn-primary"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View {compareItem.title || compareItem.name}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
