'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';

// Keep context for backward compatibility with Header
const SidebarContext = createContext();

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <SidebarContext.Provider value={{ isCollapsed: !isOpen, setIsCollapsed: (v) => setIsOpen(!v), isMobile, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

const categories = [
  { href: "/category/Laptop", icon: "💻", title: "Laptops" },
  { href: "/category/Project Equipment", icon: "🔬", title: "Project Equipment" },
  { href: "/category/Textbook", icon: "📚", title: "Textbooks" },
  { href: "/category/Electronics", icon: "🔌", title: "Electronics" },
  { href: "/category/Bike", icon: "🚲", title: "Bikes" },
  { href: "/category/Notes", icon: "📝", title: "Notes" },
  { href: "/category/Rooms", icon: "🏠", title: "Hostels & Flats" },
  { href: "/category/Furniture", icon: "🪑", title: "Furniture" },
  { href: "/category/Dorm Equipment", icon: "🛏️", title: "Dorm Equipment" },
  { href: "/category/Books", icon: "📖", title: "Books" },
];

export default function CategorySidebar() {
  const pathname = usePathname();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (el) el.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 relative">
        {/* Left fade + arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-md border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform"
            aria-label="Scroll left"
          >
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Scrollable pills */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2 py-2.5 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {categories.map((cat) => {
            const isActive = pathname === cat.href || pathname?.startsWith(cat.href + '/');
            return (
              <Link
                key={cat.href}
                href={cat.href}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 border ${
                  isActive
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200 dark:shadow-emerald-900/40'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-700 dark:hover:text-emerald-400'
                }`}
              >
                <span className="text-sm sm:text-base">{cat.icon}</span>
                <span>{cat.title}</span>
              </Link>
            );
          })}
        </div>

        {/* Right fade + arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-md border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform"
            aria-label="Scroll right"
          >
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}