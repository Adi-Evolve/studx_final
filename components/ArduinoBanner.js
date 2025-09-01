import Link from 'next/link';

export default function ArduinoBanner() {
  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl shadow-2xl">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 md:p-12 text-white relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm10 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="flex-1 mb-6 md:mb-0 md:mr-8">
            <div className="flex items-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold mr-3">
                ✓ VERIFIED SELLER
              </div>
              <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                LIMITED STOCK
              </div>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              🔥 Premium Arduino Kits Available!
            </h2>
            
            <h3 className="text-xl md:text-2xl font-semibold mb-4 text-white/90">
              Complete starter kits with all components
            </h3>
            
            <p className="text-lg md:text-xl mb-6 text-white/80 leading-relaxed max-w-2xl">
              Get everything you need to start your electronics journey - Arduino Uno, sensors, wires, breadboard & more from a verified seller!
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="text-2xl md:text-3xl font-bold text-yellow-300">
                Starting from ₹899
              </div>
              <div className="text-sm text-white/70">
                • Fast delivery • Quality guaranteed • Student-friendly prices
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/search?q=arduino&category=Project+Equipment"
                className="bg-white text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 text-center transform hover:scale-105 shadow-lg"
              >
                Shop Arduino Kits →
              </Link>
              <Link 
                href="/search?q=arduino"
                className="border-2 border-white text-white px-8 py-3 rounded-xl font-bold hover:bg-white hover:text-gray-900 transition-all duration-300 text-center"
              >
                View All Products
              </Link>
            </div>
          </div>
          
          {/* Right side - Arduino illustration */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-48 h-48 md:w-64 md:h-64 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/20">
                <div className="text-8xl md:text-9xl animate-pulse">
                  🔌
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-xl">⚡</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center animate-bounce delay-1000">
                <span className="text-xl">🔧</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
