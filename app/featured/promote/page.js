'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function PromoteItemPage() {
    const [userListings, setUserListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [promoting, setPromoting] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function loadUserData() {
            const supabase = createSupabaseBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                setLoading(false);
                return;
            }
            
            setUser(user);
            
            try {
                // Fetch user's listings from all tables with specific columns
                const [productsRes, notesRes, roomsRes] = await Promise.all([
                    supabase.from('products').select(`
                        id, title, description, price, category, condition, college, 
                        location, images, is_sold, seller_id, created_at
                    `).eq('seller_id', user.id),
                    supabase.from('notes').select(`
                        id, title, description, price, category, college, 
                        academic_year, course_subject, images, pdf_urls, pdfUrl, 
                        seller_id, created_at
                    `).eq('seller_id', user.id),
                    supabase.from('rooms').select(`
                        id, title, description, price, category, college, location, 
                        images, room_type, occupancy, distance, deposit, fees_include_mess, 
                        mess_fees, owner_name, contact1, contact2, amenities, seller_id, created_at
                    `).eq('seller_id', user.id)
                ]);

                const allListings = [
                    ...(productsRes.data || []).map(item => ({ ...item, type: 'product' })),
                    ...(notesRes.data || []).map(item => ({ ...item, type: 'note' })),
                    ...(roomsRes.data || []).map(item => ({ ...item, type: 'room' }))
                ];

                setUserListings(allListings);
            } catch (error) {
                // console.error('Error loading user listings:', error);
            } finally {
                setLoading(false);
            }
        }
        
        loadUserData();
    }, []);

    const handlePromoteItem = async () => {
        if (!selectedItem || !user) return;
        
        setPromoting(true);
        const supabase = createSupabaseBrowserClient();
        
        try {
            // Get next available slot
            const { data: existingSlots, error: slotsError } = await supabase
                .from('sponsorship_sequences')
                .select('slot')
                .order('slot', { ascending: false })
                .limit(1);
            
            const nextSlot = existingSlots?.length > 0 ? existingSlots[0].slot + 1 : 1;
            
            // Add item to sponsorship sequence
            const { error } = await supabase
                .from('sponsorship_sequences')
                .insert({
                    item_id: selectedItem.id,
                    item_type: selectedItem.type,
                    slot: nextSlot
                });
            
            if (error) throw error;
            
            alert('🎉 Your item has been featured successfully!');
            setSelectedItem(null);
            
        } catch (error) {
            // console.error('Error promoting item:', error);
            alert('Error promoting item. Please try again.');
        } finally {
            setPromoting(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-6">🔒</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h2>
                    <p className="text-gray-600 mb-8">You need to be logged in to feature your items.</p>
                    <Link 
                        href="/login" 
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
                    >
                        Login Now
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your listings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white">
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <div className="flex justify-center items-center gap-3 mb-6">
                        <span className="text-6xl animate-bounce">🚀</span>
                        <span className="text-6xl animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</span>
                        <span className="text-6xl animate-bounce" style={{ animationDelay: '0.4s' }}>🎯</span>
                    </div>
                    <h1 className="text-5xl font-black mb-6">
                        BOOST YOUR SALES!
                    </h1>
                    <p className="text-2xl mb-8 opacity-95">
                        Get your item featured and watch the magic happen!
                    </p>
                    
                    {/* Benefits */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white/20 rounded-2xl p-6">
                            <div className="text-3xl mb-3">📈</div>
                            <div className="font-bold text-lg">10x More Views</div>
                            <div className="text-sm opacity-90">Top placement guaranteed</div>
                        </div>
                        <div className="bg-white/20 rounded-2xl p-6">
                            <div className="text-3xl mb-3">⚡</div>
                            <div className="font-bold text-lg">3x Faster Sales</div>
                            <div className="text-sm opacity-90">Sell in record time</div>
                        </div>
                        <div className="bg-white/20 rounded-2xl p-6">
                            <div className="text-3xl mb-3">💰</div>
                            <div className="font-bold text-lg">Higher Prices</div>
                            <div className="text-sm opacity-90">Premium positioning</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-12">
                {userListings.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-6">📦</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">No Items to Feature Yet</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            You need to list some items first before you can feature them.
                        </p>
                        <Link 
                            href="/sell" 
                            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Create Your First Listing
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">
                                Choose Item to Feature
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Select one of your listings to give it premium placement and maximum visibility.
                            </p>
                        </div>

                        {/* Items Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {userListings.map((item) => (
                                <div 
                                    key={`${item.type}-${item.id}`}
                                    className={`bg-white rounded-2xl shadow-lg p-6 cursor-pointer border-2 transition-all duration-300 ${
                                        selectedItem?.id === item.id 
                                            ? 'border-yellow-400 bg-yellow-50 shadow-xl scale-105' 
                                            : 'border-gray-200 hover:border-blue-300 hover:shadow-xl'
                                    }`}
                                    onClick={() => setSelectedItem(item)}
                                >
                                    {/* Item Image */}
                                    <div className="aspect-square bg-gray-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                                        {item.images && item.images.length > 0 ? (
                                            <img 
                                                src={item.images[0]} 
                                                alt={item.name || item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-4xl text-gray-400">
                                                {item.type === 'product' ? '📦' : item.type === 'note' ? '📝' : '🏠'}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Item Details */}
                                    <h3 className="font-bold text-lg mb-2 line-clamp-2">
                                        {item.name || item.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                        {item.description}
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-black text-green-600">
                                            ${item.price}
                                        </span>
                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                                            {item.type}
                                        </span>
                                    </div>
                                    
                                    {/* Selection Indicator */}
                                    {selectedItem?.id === item.id && (
                                        <div className="mt-4 text-center">
                                            <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold text-sm">
                                                ✨ SELECTED FOR FEATURING
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Feature Button */}
                        {selectedItem && (
                            <div className="text-center">
                                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                        Feature "{selectedItem.name || selectedItem.title}"?
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        This item will be added to the featured section and get priority placement throughout the site.
                                    </p>
                                    
                                    <button
                                        onClick={handlePromoteItem}
                                        disabled={promoting}
                                        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-12 py-4 rounded-2xl font-black text-xl hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {promoting ? (
                                            <>
                                                <span className="animate-spin inline-block mr-2">⭐</span>
                                                Featuring Item...
                                            </>
                                        ) : (
                                            <>
                                                🚀 FEATURE THIS ITEM 🚀
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                    </>
                )}
            </div>
        </div>
    );
}