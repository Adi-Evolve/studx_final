'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CategoryPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClientComponentClient();
    const params = useParams();
    const categoryName = decodeURIComponent(params.name);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!categoryName) return;

            setLoading(true);

            // Fetch from all product tables. This can be optimized later.
            const { data: regularProducts, error: regularError } = await supabase
                .from('regular_products')
                .select('*')
                .eq('category', categoryName);

            const { data: notes, error: notesError } = await supabase
                .from('notes')
                .select('*')
                .eq('category', categoryName);

            const { data: rooms, error: roomsError } = await supabase
                .from('rooms')
                .select('*')
                .eq('category', categoryName);

            if (regularError || notesError || roomsError) {
                console.error('Error fetching products:', regularError || notesError || roomsError);
            } else {
                const allProducts = [
                    ...(regularProducts || []),
                    ...(notes || []),
                    ...(rooms || []),
                ];
                setProducts(allProducts);
            }

            setLoading(false);
        };

        fetchProducts();
    }, [supabase, categoryName]);

    if (loading) {
        return <div className="text-center py-10">Loading products for {categoryName}...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-primary mb-8">{categoryName}</h1>
            {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map(product => (
                        <div key={product.id} className="group bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="relative h-56 w-full">
                                <Image 
                                    src={product.image_urls?.[0] || 'https://source.unsplash.com/random/400x300?placeholder'}
                                    alt={product.title}
                                    layout="fill"
                                    objectFit="cover"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-primary mb-1 truncate">{product.title || product.hostel_name}</h3>
                                <p className="text-xl font-bold text-secondary mb-4">₹{product.price || product.fees}</p>
                                <Link href={`/products/${product.id}`} className="w-full text-center bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-secondary transition-colors duration-300 block">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500">No products found in this category yet.</p>
            )}
        </div>
    );
}
