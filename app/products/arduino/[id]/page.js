import { createSupabaseServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function ArduinoKitPage({ params }) {
    const { id } = params;
    const supabase = createSupabaseServerClient();

    // Fetch Arduino kit from arduino table
    const { data: arduinoKit, error } = await supabase
        .from('arduino')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !arduinoKit) {
        notFound();
    }

    // Parse product information from JSON
    let productInfo;
    try {
        productInfo = JSON.parse(arduinoKit.other_components || '{}');
    } catch (e) {
        notFound();
    }

    if (!productInfo.title) {
        notFound();
    }

    // Get component list
    const components = [];
    if (arduinoKit.arduino_uno_r3) components.push('Arduino Uno R3');
    if (arduinoKit.breadboard) components.push('Breadboard');
    if (arduinoKit.servo_motor_sg90) components.push('Servo Motor SG90');
    if (arduinoKit.led_red) components.push('Red LED');
    if (arduinoKit.led_green) components.push('Green LED');
    if (arduinoKit.resistor_220_ohm) components.push('220Ω Resistor');
    if (arduinoKit.ultrasonic_sensor) components.push('Ultrasonic Sensor');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back button */}
                <div className="mb-6">
                    <Link 
                        href="/" 
                        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Listings
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                        {/* Images Section */}
                        <div className="space-y-4">
                            <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-lg flex items-center justify-center">
                                {productInfo.images && productInfo.images[0] ? (
                                    <Image
                                        src={productInfo.images[0]}
                                        alt={productInfo.title}
                                        width={500}
                                        height={500}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="text-center">
                                        <div className="text-6xl mb-4">⚡</div>
                                        <p className="text-gray-600 dark:text-gray-400">Arduino Kit</p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Additional images */}
                            {productInfo.images && productInfo.images.length > 1 && (
                                <div className="grid grid-cols-3 gap-2">
                                    {productInfo.images.slice(1, 4).map((image, index) => (
                                        <div key={index} className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                            <Image
                                                src={image}
                                                alt={`${productInfo.title} ${index + 2}`}
                                                width={150}
                                                height={150}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Details */}
                        <div className="space-y-6">
                            {/* Header */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                        ⚡ Arduino Kit
                                    </span>
                                    {productInfo.condition && (
                                        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-semibold">
                                            {productInfo.condition}
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {productInfo.title}
                                </h1>
                                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                                    ₹{productInfo.price?.toLocaleString()}
                                </p>
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    Description
                                </h3>
                                <div className="prose dark:prose-invert max-w-none">
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                        {productInfo.description}
                                    </p>
                                </div>
                            </div>

                            {/* Components Included */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                    Components Included ({components.length} items)
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {components.map((component, index) => (
                                        <div key={index} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                                            <span className="text-green-500">✓</span>
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{component}</span>
                                        </div>
                                    ))}
                                </div>
                                
                                {productInfo.component_count && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                        Total components: {productInfo.component_count}
                                    </p>
                                )}
                            </div>

                            {/* Details */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {productInfo.category || 'Project Equipment'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">College</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {productInfo.college || 'Not specified'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {productInfo.location || 'Not specified'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Posted</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {new Date(arduinoKit.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Contact Section */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    Interested in this Arduino Kit?
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 mb-4">
                                    Contact the seller to discuss details and arrange pickup/delivery.
                                </p>
                                <div className="flex gap-3">
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                                        Contact Seller
                                    </button>
                                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                                        Add to Wishlist
                                    </button>
                                </div>
                            </div>

                            {/* Arduino Kit Features */}
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                                    ⚡ Arduino Kit Features
                                </h3>
                                <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                                    <li>• Perfect for electronics learning and prototyping</li>
                                    <li>• Compatible with Arduino IDE and libraries</li>
                                    <li>• Beginner-friendly with online tutorials available</li>
                                    <li>• All components tested and verified</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar Arduino Kits - Placeholder */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                        Similar Arduino Kits
                    </h2>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                            More Arduino kits will appear here as they become available
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}