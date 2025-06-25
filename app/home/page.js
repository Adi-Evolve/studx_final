import Link from 'next/link';

import InfiniteFeed from '@/components/InfiniteFeed';
import { fetchListings, fetchSponsoredListings } from '@/app/actions';
import FeaturedSlider from '@/components/FeaturedSlider';
import HeroBanner from '@/components/HeroBanner';

const categories = [
    { name: 'Laptops', href: '/category/Laptop', imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1926&auto=format&fit=crop' },
    { name: 'Textbooks', href: '/category/Textbook', imageUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Bikes', href: '/category/Bike', imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Notes', href: '/category/Notes', imageUrl: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Rooms', href: '/category/Rooms', imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Hostel Essentials', href: '/category/Dorm', imageUrl: 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Furniture', href: '/category/Furniture', imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Other', href: '/category/Other', imageUrl: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=2070&auto=format&fit=crop' },
];

export default async function HomePage() {
    // Fetch data for the sponsored slider and the main feed concurrently.
    const [sponsoredListings, initialItems] = await Promise.all([
        fetchSponsoredListings(),
        fetchListings({ page: 1 })
    ]);

    return (
        <div className="bg-light-bg text-light-text">
            <HeroBanner />
            {/* Categories Section */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center text-primary mb-10">Explore Categories</h2>
                    <div className="flex justify-center flex-wrap gap-8">
                        {categories.map((category) => (
                            <Link href={category.href} key={category.name} className="flex flex-col items-center text-center group">
                                <div className="w-24 h-24 bg-secondary text-white flex items-center justify-center rounded-full group-hover:bg-accent transition-all duration-300 group-hover:ring-8 group-hover:ring-yellow-400 relative overflow-hidden">
                                    <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="mt-4 font-semibold text-primary">{category.name}</h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sponsored Listings Section */}
            {sponsoredListings && sponsoredListings.length > 0 && (
                <section className="py-16" style={{ backgroundColor: '#2a3d56' }}>
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl font-bold text-center text-white mb-10">Featured Items</h2>
                        <FeaturedSlider listings={sponsoredListings} />
                    </div>
                </section>
            )}

            {/* How It Works Section */}
            <section className="py-16">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-primary mb-10">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="flex flex-col items-center">
                            <div className="bg-secondary text-white text-3xl font-bold w-16 h-16 flex items-center justify-center rounded-full mb-4">1</div>
                            <h3 className="text-xl font-semibold text-primary mb-2">Find an Item</h3>
                            <p className="text-light-text">Search or browse through categories to find what you need.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="bg-secondary text-white text-3xl font-bold w-16 h-16 flex items-center justify-center rounded-full mb-4">2</div>
                            <h3 className="text-xl font-semibold text-primary mb-2">Contact the Seller</h3>
                            <p className="text-light-text">Connect safely with the seller through our platform.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="bg-secondary text-white text-3xl font-bold w-16 h-16 flex items-center justify-center rounded-full mb-4">3</div>
                            <h3 className="text-xl font-semibold text-primary mb-2">Meet & Deal</h3>
                            <p className="text-light-text">Arrange a meetup on campus to finalize your deal.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Latest Listings Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center text-primary mb-12">Latest Listings</h2>
                    <InfiniteFeed initialItems={initialItems} />
                </div>
            </section>
        </div>
    );
}
