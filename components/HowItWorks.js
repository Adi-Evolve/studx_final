import React from 'react';

export default function HowItWorks() {
    const steps = [
        {
            step: "1",
            title: "Browse & Discover",
            description: "Explore textbooks, notes, and room listings from verified college students",
            icon: "🔍"
        },
        {
            step: "2", 
            title: "Connect Safely",
            description: "Message sellers directly through our secure chat system",
            icon: "💬"
        },
        {
            step: "3",
            title: "Meet & Exchange",
            description: "Meet on campus for safe, convenient transactions",
            icon: "🤝"
        },
        {
            step: "4",
            title: "Rate & Review",
            description: "Share your experience to help build our trusted community",
            icon: "⭐"
        }
    ];

    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        How StudX Works
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Join thousands of students buying and selling safely on campus
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((item, index) => (
                        <div key={index} className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                <span className="text-2xl">{item.icon}</span>
                            </div>
                            <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold mb-4">
                                {item.step}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {item.title}
                            </h3>
                            <p className="text-gray-600">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <div className="bg-white rounded-lg shadow-sm p-6 inline-block">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Ready to get started?
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a 
                                href="/sell" 
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Start Selling
                            </a>
                            <a 
                                href="/products/regular" 
                                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            >
                                Start Shopping
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}