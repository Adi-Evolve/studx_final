'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import Link from 'next/link';
import SellerInfoModal from '../../../components/modals/SellerInfoModal';
import CompareModal from '../../../components/modals/CompareModal';
import ReviewForm from '../../../components/forms/ReviewForm';

// Placeholder for the real map component
const MapPlaceholder = () => (
    <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">Map will be here</p>
    </div>
);

function ProductDetails() {
    const [product, setProduct] = useState(null);
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const params = useParams();
    const { id } = params;
    const supabase = createClientComponentClient();

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;

            // Try fetching from each table. This is a simplified approach.
            // A better solution might involve a view or a search function in Supabase.
            let item = null;
            let tableName = '';

            const tables = ['regular_products', 'notes', 'rooms'];
            for (const table of tables) {
                const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
                if (data) {
                    item = data;
                    tableName = table;
                    break;
                }
            }

            if (item) {
                setProduct({ ...item, type: tableName });

                // Fetch seller info
                const { data: sellerData, error: sellerError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', item.seller_id)
                    .single();
                
                if (sellerError) {
                    setError('Could not fetch seller information.');
                } else {
                    setSeller(sellerData);
                }

            } else {
                setError('Product not found.');
            }
            setLoading(false);
        };

        fetchProduct();
    }, [id, supabase]);

    if (loading) {
        return <div className="text-center py-10">Loading product details...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    if (!product) {
        return <div className="text-center py-10">Product not found.</div>;
    }

    // Render based on product type
    switch (product.type) {
        case 'regular_products':
            return <RegularProductInterface product={product} seller={seller} />;
        case 'notes':
            return <NoteInterface product={product} />;
        case 'rooms':
            return <RoomInterface product={product} />;
        default:
            return <div className="text-center py-10">Unknown product type.</div>;
    }
}

const RegularProductInterface = ({ product, seller }) => {
    const [isSellerModalOpen, setSellerModalOpen] = useState(false);
    const [isCompareModalOpen, setCompareModalOpen] = useState(false);
    const whatsappLink = seller ? `https://wa.me/${seller.phone_number}?text=I'm%20interested%20in%20your%20product:%20${encodeURIComponent(product.title)}` : '';

    return (
        <>
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Image Gallery */}
                    <div>
                        <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg">
                            <Image 
                                src={product.image_urls?.[0] || 'https://source.unsplash.com/random/800x600?product'}
                                alt={product.title}
                                layout="fill"
                                objectFit="cover"
                            />
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        <h1 className="text-4xl font-extrabold text-primary mb-2">{product.title}</h1>
                        <p className="text-secondary text-lg mb-4">Posted on {new Date(product.created_at).toLocaleDateString()}</p>
                        <p className="text-2xl font-bold text-accent mb-6">₹{product.price}</p>
                        
                        <h2 className="text-xl font-bold text-primary mb-2">Description</h2>
                        <p className="text-gray-700 mb-6">{product.description}</p>

                        <div className="flex space-x-4 mb-8">
                            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition duration-300">
                                Contact Seller
                            </a>
                            <button onClick={() => setCompareModalOpen(true)} className="bg-gray-200 text-primary font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition duration-300">
                                Compare
                            </button>
                            <button onClick={() => setSellerModalOpen(true)} className="bg-gray-200 text-primary font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition duration-300">
                                Seller Info
                            </button>
                        </div>

                        <h2 className="text-xl font-bold text-primary mb-2">Location</h2>
                        <MapPlaceholder />
                    </div>
                </div>

                {/* Similar Products Section */}
                <div className="mt-20">
                    <h2 className="text-3xl font-bold text-center text-primary mb-10">Similar Products</h2>
                    <div className="text-center text-gray-500">Similar products will be shown here.</div>
                </div>
            </div>

            {isSellerModalOpen && (
                <SellerInfoModal 
                    seller={seller} 
                    sellerId={product.seller_id} 
                    onClose={() => setSellerModalOpen(false)} 
                />
            )}
            {isCompareModalOpen && (
                <CompareModal 
                    currentProduct={product} 
                    onClose={() => setCompareModalOpen(false)} 
                />
            )}
        </>
    );
};

const NoteInterface = ({ product }) => {
    const handleBuyNow = () => {
        // This assumes the PDF is stored in Supabase storage and the URL is in the product data
        if (product.pdf_urls && product.pdf_urls.length > 0) {
            window.open(product.pdf_urls[0], '_blank');
        } else {
            alert('No PDF available for download.');
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Image Gallery */}
                <div>
                    <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg">
                        <Image 
                            src={product.image_urls?.[0] || 'https://source.unsplash.com/random/800x600?notes'}
                            alt={product.title}
                            layout="fill"
                            objectFit="cover"
                        />
                    </div>
                </div>

                {/* Note Info */}
                <div>
                    <h1 className="text-4xl font-extrabold text-primary mb-2">{product.title}</h1>
                    <p className="text-secondary text-lg mb-4">Posted on {new Date(product.created_at).toLocaleDateString()}</p>
                    <p className="text-2xl font-bold text-accent mb-6">₹{product.price}</p>
                    
                    <h2 className="text-xl font-bold text-primary mb-2">Description</h2>
                    <p className="text-gray-700 mb-6">{product.description}</p>

                    <div className="flex space-x-4 mb-8">
                        <button onClick={handleBuyNow} className="bg-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-primary transition duration-300">
                            Buy Now
                        </button>
                        <button className="bg-gray-200 text-primary font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition duration-300">
                            Add to Wishlist
                        </button>
                    </div>
                </div>
            </div>

            {/* Similar Notes Section */}
            <div className="mt-20">
                <h2 className="text-3xl font-bold text-center text-primary mb-10">Similar Notes</h2>
                <div className="text-center text-gray-500">Similar notes will be shown here.</div>
            </div>
        </div>
    );
};

const RoomInterface = ({ product }) => {
    const [reviews, setReviews] = useState([]);
    const [isCompareModalOpen, setCompareModalOpen] = useState(false);
    const [user, setUser] = useState(null);
    const supabase = createClientComponentClient();

    const fetchReviews = async () => {
        const { data, error } = await supabase
            .from('room_reviews')
            .select('*, commenter:users(full_name, avatar_url)')
            .eq('room_id', product.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching reviews:', error);
        } else {
            setReviews(data);
        }
    };

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };

        getUser();
        fetchReviews();
    }, [product.id, supabase]);

    return (
        <>
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Image Gallery */}
                    <div>
                        <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg">
                            <Image 
                                src={product.image_urls?.[0] || 'https://source.unsplash.com/random/800x600?room'}
                                alt={product.hostel_name}
                                layout="fill"
                                objectFit="cover"
                            />
                        </div>
                    </div>

                    {/* Room Info */}
                    <div>
                        <h1 className="text-4xl font-extrabold text-primary mb-2">{product.hostel_name}</h1>
                        <p className="text-secondary text-lg mb-4">Near {product.college}</p>
                        <p className="text-2xl font-bold text-accent mb-6">₹{product.fees} / {product.fees_period}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6 text-primary">
                            <p><strong>Room Type:</strong> {product.room_type}</p>
                            <p><strong>Occupancy:</strong> {product.occupancy}</p>
                            <p><strong>Owner:</strong> {product.owner_name}</p>
                        </div>

                        <h2 className="text-xl font-bold text-primary mb-2">Amenities</h2>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {product.amenities.map(amenity => (
                                <span key={amenity} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">{amenity}</span>
                            ))}
                        </div>

                        <h2 className="text-xl font-bold text-primary mb-2">Description</h2>
                        <p className="text-gray-700 mb-6">{product.description}</p>

                        <div className="flex space-x-4 mb-8">
                            <button className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition duration-300">
                                Contact Seller
                            </button>
                            <button onClick={() => setCompareModalOpen(true)} className="bg-gray-200 text-primary font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition duration-300">
                                Compare
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
                    <div>
                        <h2 className="text-2xl font-bold text-primary mb-6">Location</h2>
                        <MapPlaceholder />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-primary mb-6">Reviews & Ratings</h2>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                            {reviews.length > 0 ? reviews.map(review => (
                                <div key={review.id} className="bg-white p-4 rounded-lg shadow">
                                    <div className="flex items-center mb-2">
                                        <Image src={review.commenter?.avatar_url || '/default-avatar.png'} alt={review.commenter?.full_name} width={40} height={40} className="rounded-full" />
                                        <div className="ml-3">
                                            <p className="font-bold">{review.commenter?.full_name || 'Anonymous'}</p>
                                            <p className="text-yellow-400">{'⭐'.repeat(review.rating)}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-700">{review.review}</p>
                                </div>
                            )) : (
                                <p className="text-gray-500">No reviews yet.</p>
                            )}
                        </div>
                        {user && user.id !== product.seller_id ? (
                            <ReviewForm roomId={product.id} userId={user.id} onReviewSubmitted={fetchReviews} />
                        ) : (
                            <p className="text-gray-500 mt-6">{user ? 'You cannot review your own listing.' : 'Please log in to leave a review.'}</p>
                        )}
                    </div>
                </div>

                {/* Similar Rooms Section */}
                <div className="mt-20">
                    <h2 className="text-3xl font-bold text-center text-primary mb-10">Similar Rooms</h2>
                    <div className="text-center text-gray-500">Similar rooms will be shown here.</div>
                </div>
            </div>

            {isCompareModalOpen && (
                <CompareModal 
                    currentProduct={product} 
                    onClose={() => setCompareModalOpen(false)} 
                />
            )}
        </>
    );
};

export default function ProductPage() {
    return (
        <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
            <ProductDetails />
        </Suspense>
    );
}
