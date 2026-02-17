'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown, faFilter } from '@fortawesome/free-solid-svg-icons';

export default function SortingControls({ onSortChange, currentSort = 'newest' }) {
    const [isOpen, setIsOpen] = useState(false);

    const sortOptions = [
        { value: 'newest', label: 'Newest First', icon: faSortDown },
        { value: 'oldest', label: 'Oldest First', icon: faSortUp },
        { value: 'price-low', label: 'Price: Low to High', icon: faSortUp },
        { value: 'price-high', label: 'Price: High to Low', icon: faSortDown },
        { value: 'name-asc', label: 'Name: A to Z', icon: faSortUp },
        { value: 'name-desc', label: 'Name: Z to A', icon: faSortDown },
        { value: 'popularity', label: 'Most Popular', icon: faSort }
    ];

    const currentOption = sortOptions.find(option => option.value === currentSort);

    const handleSortChange = (sortValue) => {
        onSortChange(sortValue);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn-secondary flex items-center gap-2 min-w-[180px] justify-between"
            >
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={currentOption?.icon || faSort} className="w-4 h-4" />
                    <span className="text-sm font-medium">Sort: {currentOption?.label || 'Select'}</span>
                </div>
                <FontAwesomeIcon 
                    icon={faSortDown} 
                    className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Dropdown */}
                    <div className="absolute top-full left-0 mt-2 w-full min-w-[220px] card card-elevated py-2 z-20 animate-fade-in-down">
                        {sortOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSortChange(option.value)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors ${
                                    currentSort === option.value ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'
                                }`}
                            >
                                <FontAwesomeIcon icon={option.icon} className="w-4 h-4" />
                                <span>{option.label}</span>
                                {currentSort === option.value && (
                                    <span className="ml-auto w-2 h-2 bg-primary-500 rounded-full"></span>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}