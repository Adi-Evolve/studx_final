'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const categories = [
  { href: "/category/Laptop", icon: "💻", title: "Laptops" },
  { href: "/category/Project Equipment", icon: "🔬", title: "Project Equipments" },
  { href: "/category/Textbook", icon: "📚", title: "Textbooks" },
  { href: "/category/Electronics", icon: "🔌", title: "Electronics" },
  { href: "/category/Bike", icon: "🚲", title: "Bikes" },
  { href: "/category/Notes", icon: "📝", title: "Notes" },
  { href: "/category/Rooms", icon: "🏠", title: "Rooms" },
  { href: "/mess", icon: "🍽️", title: "Mess" },
  { href: "/category/Furniture", icon: "🪑", title: "Furniture" },
  { href: "/category/Dorm Equipment", icon: "🛏️", title: "Dorm Equipment" },
  { href: "/category/Books", icon: "📖", title: "Books" }
];

export default function CategorySidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // On desktop, keep collapsed by default but allow hover expand
      if (!mobile) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Improve expansion logic - on desktop expand on hover, on mobile via toggle
  const shouldShowExpanded = isMobile ? !isCollapsed : (isHovered);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[45] lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed left-0 z-[35] bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 overflow-y-auto
          ${
            shouldShowExpanded ? 'w-64' : 'w-16'
          }
          ${
            isMobile 
              ? `top-[72px] h-[calc(100vh-72px)] ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}` 
              : 'top-[72px] h-[calc(100vh-72px)]'
          }
        `}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
      >
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800">
          <div className="flex items-center justify-center">
            {shouldShowExpanded ? (
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center">
                <span className="mr-2">📂</span>
                Categories
              </h2>
            ) : (
              <span className="text-2xl">📂</span>
            )}
          </div>
        </div>

        {/* Categories List */}
        <nav className="p-2">
          <div className="space-y-1">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={category.href}
                className={`flex items-center p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 group transform hover:scale-105 ${
                  shouldShowExpanded ? 'justify-start' : 'justify-center'
                } border border-transparent hover:border-blue-200 dark:hover:border-gray-600 hover:shadow-md`}
                title={!shouldShowExpanded ? category.title : ''}
                onClick={() => isMobile && setIsCollapsed(true)}
              >
                <span className="text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110">{category.icon}</span>
                {shouldShowExpanded && (
                  <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors whitespace-nowrap">
                    {category.title}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Enhanced Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`fixed top-[84px] left-4 z-[40] p-3 rounded-full shadow-lg transition-all duration-300 lg:hidden transform hover:scale-110 ${
            isCollapsed 
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white' 
              : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white'
          }`}
          aria-label="Toggle categories menu"
        >
          <svg 
            className={`w-5 h-5 transition-transform duration-300 ${
              isCollapsed ? '' : 'rotate-45'
            }`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {isCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            )}
          </svg>
        </button>
      )}
    </>
  );
}