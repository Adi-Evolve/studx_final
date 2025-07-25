'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSortAmountDown, faXmark, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function AdvancedFilters({ onFiltersChange, categories = [], initialFilters = null, autoOpen = false }) {
    const [isOpen, setIsOpen] = useState(autoOpen);
    const [filters, setFilters] = useState({
        category: '',
        priceRange: { min: '', max: '' },
        condition: '',
        college: '',
        sortBy: 'newest',
        itemType: 'all',
        ...initialFilters
    });

    // Auto-open when there are initial filters or autoOpen is true
    useEffect(() => {
        if (initialFilters || autoOpen) {
            const hasActiveFilters = initialFilters && Object.values(initialFilters).some(value => {
                if (typeof value === 'object') {
                    return value.min || value.max;
                }
                return value && value !== 'newest' && value !== 'all';
            });
            
            if (hasActiveFilters || autoOpen) {
                setIsOpen(true);
            }
        }
    }, [initialFilters, autoOpen]);

    // Update filters when initialFilters change
    useEffect(() => {
        if (initialFilters) {
            setFilters(prev => ({ ...prev, ...initialFilters }));
        }
    }, [initialFilters]);

    const conditions = ['New', 'Like New', 'Good', 'Fair', 'For Parts'];
    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'alphabetical', label: 'A-Z' }
    ];

    const itemTypes = [
        { value: 'all', label: 'All Items' },
        { value: 'regular', label: 'Products' },
        { value: 'note', label: 'Notes' },
        { value: 'room', label: 'Rooms' }
    ];

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handlePriceRangeChange = (type, value) => {
        const newPriceRange = { ...filters.priceRange, [type]: value };
        const newFilters = { ...filters, priceRange: newPriceRange };
        setFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const clearFilters = () => {
        const clearedFilters = {
            category: '',
            priceRange: { min: '', max: '' },
            condition: '',
            college: '',
            sortBy: 'newest',
            itemType: 'all'
        };
        setFilters(clearedFilters);
        onFiltersChange(clearedFilters);
    };

    const closeFilters = () => {
        setIsOpen(false);
    };

    const activeFiltersCount = Object.values(filters).filter(value => {
        if (typeof value === 'object') {
            return value.min || value.max;
        }
        return value && value !== 'newest' && value !== 'all';
    }).length;

    return (
        <div className="relative">
            {/* Filter Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`btn-secondary flex items-center space-x-2 relative transition-all duration-200 ${
                    isOpen ? 'ring-2 ring-accent bg-accent text-white' : ''
                }`}
            >
                <FontAwesomeIcon icon={faFilter} />
                <span>Filters & Sort</span>
                {activeFiltersCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                        {activeFiltersCount}
                    </span>
                )}
            </button>

            {/* Filter Panel */}
            {isOpen && (
                <>
                    {/* Backdrop for mobile */}
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                        onClick={closeFilters}
                    ></div>
                    
                    <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-2xl shadow-strong border border-border-light p-6 z-50 animate-scale-in max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-primary">Filters & Sorting</h3>
                            {/* Enhanced Close Button */}
                            <button
                                onClick={closeFilters}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 transition-all duration-200 hover:scale-110"
                                title="Close filters"
                            >
                                <FontAwesomeIcon icon={faTimes} className="text-lg" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Sort By */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FontAwesomeIcon icon={faSortAmountDown} className="mr-2" />
                                    Sort By
                                </label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                    className="select-field"
                                >
                                    {sortOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Item Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    📦 Item Type
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {itemTypes.map(type => (
                                        <button
                                            key={type.value}
                                            onClick={() => handleFilterChange('itemType', type.value)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                filters.itemType === type.value
                                                    ? 'bg-accent text-white shadow-md scale-105'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    💰 Price Range
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="number"
                                        placeholder="Min ₹"
                                        value={filters.priceRange.min}
                                        onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                                        className="input-field"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max ₹"
                                        value={filters.priceRange.max}
                                        onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            {categories.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        🏷️ Category
                                    </label>
                                    <select
                                        value={filters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                        className="select-field"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Condition */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ⭐ Condition
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleFilterChange('condition', '')}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                            filters.condition === ''
                                                ? 'bg-accent text-white shadow-md scale-105'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        All
                                    </button>
                                    {conditions.map(condition => (
                                        <button
                                            key={condition}
                                            onClick={() => handleFilterChange('condition', condition)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                filters.condition === condition
                                                    ? 'bg-accent text-white shadow-md scale-105'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {condition}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* College */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    🏫 College
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter college name"
                                    value={filters.college}
                                    onChange={(e) => handleFilterChange('college', e.target.value)}
                                    className="input-field"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3 pt-4 border-t border-border-light">
                                <button
                                    onClick={clearFilters}
                                    className="flex-1 btn-secondary text-sm hover:bg-gray-200 transition-colors"
                                >
                                    Clear All
                                </button>
                                <button
                                    onClick={closeFilters}
                                    className="flex-1 btn-accent text-sm hover:bg-accent-dark transition-colors"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}