import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLaptop, faBook, faBicycle, faPen, faBed, faFlask, faChair, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import InfiniteFeed from '@/components/InfiniteFeed';
import { fetchListings, fetchSponsoredListings } from '@/app/actions';
import FeaturedSlider from '@/components/FeaturedSlider'; // This component will be created next

const categories = [
    { name: 'Laptops', href: '/category/Laptop', icon: faLaptop },
    { name: 'Textbooks', href: '/category/Books', icon: faBook },
    { name: 'Bikes & Cycles', href: '/category/Cycle%2FBike', icon: faBicycle },
    { name: 'Notes', href: '/category/Notes', icon: faPen },
    { name: 'Rooms/Hostel', href: '/category/Rooms%2FHostel', icon: faBed },
    { name: 'Lab Gear', href: '/category/Lab%20Equipment', icon: faFlask },
    { name: 'Furniture', href: '/category/Furniture', icon: faChair },
    { name: 'Others', href: '/category/Others', icon: faEllipsisH },
];

export default async function HomePage() {
    // Fetch data for the sponsored slider and the main feed concurrently.
    const [sponsoredListings, initialItems] = await Promise.all([
        fetchSponsoredListings(),
        fetchListings({ page: 1 })
    ]);

    return (
        <div className="bg-light-bg text-light-text">
            {/* Hero Section */}
            <section className="bg-primary text-white">
                <div className="container mx-auto px-6 py-20 text-center">
                    <h1 className="text-5xl font-extrabold mb-4">The Student Hub for Buying & Selling</h1>
                    <p className="text-xl text-accent mb-8">From textbooks to tech, find everything you need for college life, right here on campus.</p>
                    <Link href="/sell" className="bg-secondary text-white font-bold py-3 px-8 rounded-full hover:bg-accent transition duration-300 text-lg">
                        Start Selling Now
                    </Link>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center text-primary mb-10">Explore Categories</h2>
                    <div className="flex justify-center flex-wrap gap-8">
                        {categories.map((category) => (
                            <Link href={category.href} key={category.name} className="flex flex-col items-center text-center group">
                                <div className="w-24 h-24 bg-secondary text-white flex items-center justify-center rounded-full group-hover:bg-accent transition-all duration-300 group-hover:ring-8 group-hover:ring-yellow-400">
                                    <FontAwesomeIcon icon={category.icon} className="text-4xl" />
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
