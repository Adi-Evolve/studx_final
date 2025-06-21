'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';

export default function CompareModal({ currentProduct, onClose }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [comparisonProduct, setComparisonProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const supabase = createClientComponentClient();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setComparisonProduct(null);
        const tables = ['regular_products', 'notes', 'rooms'];
        let allResults = [];

        for (const table of tables) {
            const { data } = await supabase
                .from(table)
                .select('*')
                .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
            
            if (data) {
                allResults = [...allResults, ...data.map(item => ({ ...item, type: table }))];
            }
        }
        setSearchResults(allResults);
        setLoading(false);
    };

    const getAttribute = (product, attr) => product?.[attr] || 'N/A';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl w-full" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-primary">Compare Products</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>

                {!comparisonProduct ? (
                    <div>
                        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for a product to compare..."
                                className="flex-grow p-2 border rounded-lg"
                            />
                            <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg">Search</button>
                        </form>
                        <div className="max-h-80 overflow-y-auto">
                            {loading && <p>Searching...</p>}
                            {searchResults.map(item => (
                                <div key={item.id} onClick={() => setComparisonProduct(item)} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                                    <Image src={item.image_urls?.[0] || 'https://source.unsplash.com/random/100x100?item'} alt={item.title || item.hostel_name} width={50} height={50} className="rounded-md" />
                                    <div>
                                        <p className="font-semibold text-primary">{item.title || item.hostel_name}</p>
                                        <p className="text-accent font-bold">₹{item.price || item.fees}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div>
                        <button onClick={() => setComparisonProduct(null)} className="mb-4 text-primary hover:underline">← Back to Search</button>
                        <table className="w-full text-left table-fixed">
                            <thead>
                                <tr className="border-b">
                                    <th className="w-1/3 py-2">Feature</th>
                                    <th className="w-1/3 py-2">{currentProduct.title || currentProduct.hostel_name}</th>
                                    <th className="w-1/3 py-2">{comparisonProduct.title || comparisonProduct.hostel_name}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b"><td className="py-2 font-bold">Price</td><td>₹{getAttribute(currentProduct, 'price') || getAttribute(currentProduct, 'fees')}</td><td>₹{getAttribute(comparisonProduct, 'price') || getAttribute(comparisonProduct, 'fees')}</td></tr>
                                <tr className="border-b"><td className="py-2 font-bold">Category</td><td>{currentProduct.category || 'N/A'}</td><td>{comparisonProduct.category || 'N/A'}</td></tr>
                                <tr className="border-b"><td className="py-2 font-bold">Description</td><td className="text-sm">{getAttribute(currentProduct, 'description')}</td><td className="text-sm">{getAttribute(comparisonProduct, 'description')}</td></tr>
                                {/* Add more specific attributes as needed */}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
