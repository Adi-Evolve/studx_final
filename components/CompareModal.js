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
            <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-900">
                <td className="py-4 px-4 font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-600">{label}</td>
                <td className={`py-4 px-4 text-gray-900 dark:text-gray-100 ${better === 'left' ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 font-semibold' : 'bg-white dark:bg-gray-900'}`}>
                    <div className="flex items-center justify-between">
                        <span>{value1 || 'N/A'}</span>
                        {better === 'left' && <FontAwesomeIcon icon={faCheck} className="w-4 h-4 text-green-600 dark:text-green-400" />}
                    </div>
                </td>
                <td className={`py-4 px-4 text-gray-900 dark:text-gray-100 ${better === 'right' ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 font-semibold' : 'bg-white dark:bg-gray-900'}`}>
                    <div className="flex items-center justify-between">
                        <span>{value2 || 'N/A'}</span>
                        {better === 'right' && <FontAwesomeIcon icon={faCheck} className="w-4 h-4 text-green-600 dark:text-green-400" />}
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-black dark:bg-opacity-80 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden relative border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-10">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <FontAwesomeIcon icon={faExchangeAlt} className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Product Comparison</h2>
                        </div>
                        <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                            <FontAwesomeIcon icon={faXmark} size="lg" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[80vh]">
                    {/* Product Images and Basic Info */}
                    <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50 dark:bg-gray-900">
                        <div className="text-center">
                            <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                                <Image
                                    src={getImageUrl(currentItem)}
                                    alt={currentItem.title || currentItem.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                                {currentItem.title || currentItem.name}
                            </h3>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
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
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                                {compareItem.title || compareItem.name}
                            </h3>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {formatPrice(compareItem.price || compareItem.fees)}
                            </p>
                        </div>
                    </div>

                    {/* Comparison Table */}
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <thead>
                                    <tr className="bg-gray-100 dark:bg-gray-800">
                                        <th className="py-3 px-4 text-left font-bold text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600">Features</th>
                                        <th className="py-3 px-4 text-center font-bold text-gray-900 dark:text-gray-100">
                                            {currentItem.title || currentItem.name}
                                        </th>
                                        <th className="py-3 px-4 text-center font-bold text-gray-900 dark:text-gray-100">
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
                                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View {currentItem.title || currentItem.name}
                            </a>
                            <a
                                href={`/products/${compareItem.type || 'regular'}/${compareItem.id}`}
                                className="inline-flex items-center justify-center px-6 py-3 bg-green-600 dark:bg-green-700 text-white rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-800 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
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
