import Link from 'next/link';
import Image from 'next/image';

const categories = [
    { name: 'Laptops', href: '/category/Laptop', imageUrl: 'https://source.unsplash.com/random/400x300?laptop' },
    { name: 'Textbooks', href: '/category/Books', imageUrl: 'https://source.unsplash.com/random/400x300?books' },
    { name: 'Bikes & Cycles', href: '/category/Cycle%2FBike', imageUrl: 'https://source.unsplash.com/random/400x300?bicycle' },
    { name: 'Notes & Supplies', href: '/category/Notes', imageUrl: 'https://source.unsplash.com/random/400x300?notebook' },
    { name: 'Hostel Equipment', href: '/category/Hostel%20Equipment', imageUrl: 'https://source.unsplash.com/random/400x300?hostel' },
    { name: 'Rooms/Hostel', href: '/category/Rooms%2FHostel', imageUrl: 'https://source.unsplash.com/random/400x300?room' },
    { name: 'Lab Equipment', href: '/category/Lab%20Equipment', imageUrl: 'https://source.unsplash.com/random/400x300?science' },
    { name: 'Furniture', href: '/category/Furniture', imageUrl: 'https://source.unsplash.com/random/400x300?furniture' },
    { name: 'Others', href: '/category/Others', imageUrl: 'https://source.unsplash.com/random/400x300?stuff' },
];

const featuredItems = [
    { id: 1, name: 'HP Pavilion Laptop', price: '₹45,000', imageUrl: 'https://source.unsplash.com/random/400x300?laptop', category: 'Electronics' },
    { id: 2, name: 'Organic Chemistry, 8th Ed.', price: '₹1,200', imageUrl: 'https://source.unsplash.com/random/400x300?chemistry,book', category: 'Textbooks' },
    { id: 3, name: 'Study Desk with Chair', price: '₹3,500', imageUrl: 'https://source.unsplash.com/random/400x300?desk', category: 'Furniture' },
    { id: 4, name: 'Hero Sprint Pro Bicycle', price: '₹6,000', imageUrl: 'https://source.unsplash.com/random/400x300?road,bike', category: 'Bikes & Cycles' },
];

const recommendedProducts = [
    { id: 5, name: 'Scientific Calculator', price: '₹800', imageUrl: 'https://source.unsplash.com/random/400x300?calculator', category: 'Notes & Supplies' },
    { id: 6, name: 'Electric Kettle', price: '₹1,500', imageUrl: 'https://source.unsplash.com/random/400x300?kettle', category: 'Hostel Equipment' },
    { id: 7, name: 'Gaming Mouse', price: '₹2,500', imageUrl: 'https://source.unsplash.com/random/400x300?gaming,mouse', category: 'Laptops' },
    { id: 8, name: 'Introduction to Algorithms', price: '₹950', imageUrl: 'https://source.unsplash.com/random/400x300?algorithm,book', category: 'Textbooks' },
    { id: 9, name: 'Bean Bag Chair', price: '₹2,200', imageUrl: 'https://source.unsplash.com/random/400x300?bean,bag', category: 'Furniture' },
    { id: 10, name: 'Mountain Bike', price: '₹8,500', imageUrl: 'https://source.unsplash.com/random/400x300?mountain,bike', category: 'Bikes & Cycles' },
    { id: 11, name: 'Microscope', price: '₹7,000', imageUrl: 'https://source.unsplash.com/random/400x300?microscope', category: 'Lab Equipment' },
    { id: 12, name: 'Backpack', price: '₹1,800', imageUrl: 'https://source.unsplash.com/random/400x300?backpack', category: 'Others' },
];

export default function HomePage() {
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {categories.map((category) => (
                            <Link href={category.href} key={category.name} className="text-center group">
                                <div className="relative w-full h-40 rounded-lg overflow-hidden">
                                    <Image src={category.imageUrl} alt={category.name} layout="fill" objectFit="cover" className="group-hover:scale-110 transition-transform duration-300" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-primary group-hover:text-accent">{category.name}</h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Items Section */}
            <section className="bg-primary py-16">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center text-white mb-10">Featured Items</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {featuredItems.map((item) => (
                            <Link href={`/products/${item.id}`} key={item.id}>
                                <div className="group bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer">
                                    <div className="relative h-56 w-full">
                                        <Image src={item.imageUrl} alt={item.name} layout="fill" objectFit="cover" />
                                        <div className="absolute top-2 left-2 bg-secondary text-white text-xs font-bold px-2 py-1 rounded">{item.category}</div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-primary mb-1 truncate">{item.name}</h3>
                                        <p className="text-xl font-bold text-secondary mb-4">{item.price}</p>
                                        <div className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-secondary transition-colors duration-300 text-center">View Details</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

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

            {/* Products You May Like Section */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center text-primary mb-10">Products You May Like</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {recommendedProducts.map((item) => (
                            <Link href={`/products/${item.id}`} key={item.id}>
                                <div className="group bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer">
                                    <div className="relative h-56 w-full">
                                        <Image src={item.imageUrl} alt={item.name} layout="fill" objectFit="cover" />
                                        <div className="absolute top-2 left-2 bg-secondary text-white text-xs font-bold px-2 py-1 rounded">{item.category}</div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-primary mb-1 truncate">{item.name}</h3>
                                        <p className="text-xl font-bold text-secondary mb-4">{item.price}</p>
                                        <div className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-secondary transition-colors duration-300 text-center">View Details</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}
