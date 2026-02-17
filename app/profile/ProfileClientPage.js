'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import ListingCard from '@/components/ListingCard';
import BulkUpload from '@/components/BulkUpload';
import BulkOperationsPanel from '@/components/BulkOperationsPanel';
// Reusable UI Components
const TabButton = ({ active, onClick, children }) => (
    <button 
        onClick={onClick}
        className={`px-6 py-3 font-semibold rounded-lg transition-all duration-300 ${
            active 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600 hover:text-slate-900 dark:hover:text-white'
        }`}>
        {children}
    </button>
);
const EditProfileModal = ({ user, onClose, onSave }) => {
    const [fullName, setFullName] = useState(user.name || '');
    const [phoneNumber, setPhoneNumber] = useState(user.phone || '');
    const [isSaving, setIsSaving] = useState(false);
    // Auto-update phone number when user prop changes (e.g., when fetched from database)
    useEffect(() => {
        if (user.phone) {
            setPhoneNumber(user.phone);
        }
    }, [user.phone]);
    const handleSave = async () => {
        setIsSaving(true);
        await onSave({ fullName, phoneNumber });
        setIsSaving(false);
    };
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Edit Profile</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Full Name</label>
                        <input 
                            type="text" 
                            id="fullName" 
                            value={fullName} 
                            onChange={(e) => setFullName(e.target.value)} 
                            className="input-base"
                        />
                    </div>
                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Phone Number</label>
                        <input 
                            type="tel" 
                            id="phoneNumber" 
                            value={phoneNumber} 
                            onChange={(e) => setPhoneNumber(e.target.value)} 
                            className="input-base"
                        />
                    </div>
                </div>
                <div className="mt-8 flex justify-end space-x-4">
                    <button 
                        onClick={onClose} 
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving} 
                        className={`btn-primary ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};
export default function ProfileClientPage({ serverUser, serverProducts, serverNotes, serverRooms, serverRentals }) {
    const [user, setUser] = useState(serverUser);
    const [products, setProducts] = useState(serverProducts || []);
    const [notes, setNotes] = useState(serverNotes || []);
    const [rooms, setRooms] = useState(serverRooms || []);
    const [rentals, setRentals] = useState(serverRentals || []);
    const [activeTab, setActiveTab] = useState('products');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(Date.now());
    const supabase = createSupabaseBrowserClient();
    // Client-side data refresh function
    const refreshListings = async () => {
        if (!user?.id) return;
        setIsRefreshing(true);
        try {
            const [productsRes, notesRes, roomsRes, rentalsRes] = await Promise.all([
                supabase.from('products').select(`
                    id, title, description, price, category, condition, college, 
                    location, images, is_sold, seller_id, created_at
                `).eq('seller_id', user.id),
                supabase.from('notes').select(`
                    id, title, description, price, category, college, 
                    academic_year, course_subject, images, pdf_urls, pdfurl, 
                    seller_id, created_at
                `).eq('seller_id', user.id),
                supabase.from('rooms').select(`
                    id, title, description, price, category, college, location, 
                    images, room_type, occupancy, distance, deposit, fees_include_mess, 
                    mess_fees, owner_name, contact1, contact2, amenities, duration, seller_id, created_at
                `).eq('seller_id', user.id),
                supabase.from('rentals').select(`
                    id, title, description, rental_price, security_deposit, category, condition, 
                    rental_duration, min_rental_period, max_rental_period, college, location,
                    images, is_rented, rental_terms, seller_id, created_at
                `).eq('seller_id', user.id)
            ]);
            // Log results
            // Update state with new data (or empty arrays if errors)
            setProducts((productsRes.data || []).map(item => ({ ...item, type: 'product' })));
            setNotes((notesRes.data || []).map(item => ({ ...item, type: 'note' })));
            setRooms((roomsRes.data || []).map(item => ({ ...item, type: 'room' })));
            setRentals((rentalsRes.data || []).map(item => ({ ...item, type: 'rental' })));
            setLastRefresh(Date.now());
        } catch (error) {
        } finally {
            setIsRefreshing(false);
        }
    };
    
    // Removed auto-refresh mechanism - it was causing unnecessary loading
    // The server-side data loading is sufficient and prevents loading loops
    
    const handleSaveProfile = async ({ fullName, phoneNumber }) => {
        try {
            // console.log('[Profile] Starting profile update...', { fullName, phoneNumber, userId: user.id });
            
            const { data, error } = await supabase
                .from('users')
                .update({ name: fullName, phone: phoneNumber })
                .eq('id', user.id)
                .select()
                .single();
            
            // console.log('[Profile] Supabase response:', { data, error });
            
            if (error) {
                // console.error('[Profile] Supabase error:', error);
                alert('Error updating profile: ' + error.message);
                return;
            }
            
            if (data) {
                // console.log('[Profile] Profile updated successfully:', data);
                setUser(prev => ({ ...prev, ...data }));
                setIsModalOpen(false);
                alert('Profile updated successfully!');
                // Force a small delay to ensure state update completes
                setTimeout(() => {
                    // console.log('[Profile] State update completed');
                }, 100);
            } else {
                // console.warn('[Profile] No data returned from update');
                alert('Profile update completed but no data returned');
                setIsModalOpen(false);
            }
        } catch (err) {
            // console.error('[Profile] Unexpected error:', err);
            alert('An unexpected error occurred while updating your profile: ' + err.message);
        }
    };
    const handleEdit = (item, type) => {
        // Navigate to the edit page instead of opening a modal
        window.location.href = `/edit/${item.id}?type=${type}`;
    };
    const handleRemove = async (id, type) => {
        if (!confirm('Are you sure you want to remove this item?')) return;
        try {
            const response = await fetch('/api/item/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, type, userEmail: user.email }),
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Show success message
                alert(`Item "${result.item?.title || 'Item'}" deleted successfully`);
                // Refresh listings after successful removal
                refreshListings();
            } else {
                // console.error('Remove item failed:', result);
                alert(`Failed to remove item: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            // console.error('Error removing item:', error);
            alert('Failed to remove item due to network error.');
        }
    };
    const handleMarkAsSold = async (id, type) => {
        try {
            const response = await fetch('/api/item/mark-sold', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, type, userEmail: user.email }),
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Show success message
                alert(`Item "${result.item?.title || 'Item'}" marked as sold successfully`);
                // Update the local state immediately for better user experience
                if (type === 'product') {
                    setProducts(products.map(p => p.id === id ? { ...p, is_sold: true } : p));
                }
                // Refresh listings to ensure consistency
                refreshListings();
            } else {
                // console.error('Mark as sold failed:', result);
                alert(`Failed to mark as sold: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            // console.error('Error marking as sold:', error);
            alert('Failed to mark as sold due to network error.');
        }
    };
    const handleBulkUploadSuccess = (newProducts) => {
        setProducts(prev => [...prev, ...newProducts]);
        setShowBulkUpload(false);
    };
    const renderItems = () => {
        if (activeTab === 'bulk') {
            const allListings = [...products, ...notes, ...rooms];
            return (
                <BulkOperationsPanel 
                    userListings={allListings}
                    onListingsUpdate={() => {
                        // Refresh all listings after bulk operations
                        fetchUserListings();
                    }}
                    listingType="all"
                />
            );
        }
        let items, type;
        switch (activeTab) {
            case 'notes': items = notes; type = 'note'; break;
            case 'rooms': items = rooms; type = 'room'; break;
            case 'rentals': items = rentals; type = 'rental'; break;
            default: items = products; type = 'product';
        }
        if (items.length === 0) {
            return (
                <div className="text-center py-16">
                    <div className="w-24 h-24 bg-slate-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl text-slate-400 dark:text-gray-300">
                            {activeTab === 'products' ? '📦' : activeTab === 'notes' ? '📝' : activeTab === 'rentals' ? '🏠' : '🏠'}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No {activeTab} yet</h3>
                    <p className="text-slate-500 dark:text-gray-400 mb-6">
                        {activeTab === 'rentals' 
                            ? "You haven't listed any items for rent." 
                            : `You haven't listed any ${activeTab} for sale.`
                        }
                    </p>
                    {activeTab === 'products' && (
                        <div className="space-x-4">
                            <Link href="/sell/new" className="btn-primary">
                                Add Single Product
                            </Link>
                            <button 
                                onClick={() => setShowBulkUpload(true)}
                                className="btn-secondary"
                            >
                                Bulk Upload
                            </button>
                        </div>
                    )}
                    {activeTab === 'notes' && (
                        <Link href="/sell/new" className="btn-primary">
                            List Your First Notes
                        </Link>
                    )}
                    {activeTab === 'rooms' && (
                        <Link href="/sell/new" className="btn-primary">
                            List Your First Room
                        </Link>
                    )}
                    {activeTab === 'rentals' && (
                        <Link href="/rent" className="btn-primary">
                            List Your First Rental Item
                        </Link>
                    )}
                </div>
            );
        }
        return (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map(item => (
                        <ListingCard
                            key={item.id}
                            item={item}
                            onEdit={() => handleEdit(item, type)}
                            onRemove={() => handleRemove(item.id, type)}
                            onMarkAsSold={type === 'product' ? () => handleMarkAsSold(item.id, type) : undefined}
                        />
                    ))}
                </div>
            </>
        );
    };
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-12">
                {isModalOpen && <EditProfileModal user={user} onClose={() => setIsModalOpen(false)} onSave={handleSaveProfile} />}
                {showBulkUpload && <BulkUpload onClose={() => setShowBulkUpload(false)} onSuccess={handleBulkUploadSuccess} />}
                {/* Profile Header */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 mb-8">
                    <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-emerald-500/20">
                                <Image 
                                    src={user.avatar_url} 
                                    alt={user.name} 
                                    width={96} 
                                    height={96} 
                                    className="object-cover w-full h-full" 
                                    unoptimized 
                                />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                <span className="text-xs text-white">✓</span>
                            </div>
                        </div>
                        <div className="text-center sm:text-left flex-1">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{user.name}</h1>
                            <p className="text-slate-600 dark:text-gray-300 text-lg mb-2">{user.email}</p>
                            {user.phone && (
                                <p className="text-slate-500 dark:text-gray-400 mb-4">📞 {user.phone}</p>
                            )}
                            <button 
                                onClick={() => setIsModalOpen(true)} 
                                className="btn-primary"
                            >
                                ✏️ Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
                {/* Tabs and Content */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="px-8 py-6 border-b border-slate-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex flex-wrap gap-2">
                            <TabButton 
                                active={activeTab === 'products'} 
                                onClick={() => setActiveTab('products')}
                            >
                                📦 Products ({products.length})
                            </TabButton>
                            <TabButton 
                                active={activeTab === 'notes'} 
                                onClick={() => setActiveTab('notes')}
                            >
                                📝 Notes ({notes.length})
                            </TabButton>
                            <TabButton 
                                active={activeTab === 'rooms'} 
                                onClick={() => setActiveTab('rooms')}
                            >
                                🏠 Rooms ({rooms.length})
                            </TabButton>
                            <TabButton 
                                active={activeTab === 'rentals'} 
                                onClick={() => setActiveTab('rentals')}
                            >
                                🏠 Rentals ({rentals.length})
                            </TabButton>
                            <TabButton 
                                active={activeTab === 'bulk'} 
                                onClick={() => setActiveTab('bulk')}
                            >
                                ⚡ Bulk Operations
                            </TabButton>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={refreshListings}
                                disabled={isRefreshing}
                                className={`btn-secondary text-sm ${isRefreshing ? 'opacity-60 cursor-not-allowed' : ''}`}
                                title="Refresh your listings"
                            >
                                {isRefreshing ? '🔄' : '🔄'} Refresh
                            </button>
                            {activeTab === 'products' && (
                                <button 
                                    onClick={() => setShowBulkUpload(true)}
                                    className="btn-secondary text-sm"
                                >
                                    📤 Bulk Upload
                                </button>
                            )}
                        </div>
                    </div>
                    {/* Tab Content */}
                    <div className="p-8">
                        {renderItems()}
                    </div>
                </div>
            </div>
        </div>
    );
}

