'use client';

import Link from 'next/link';
import { useState, useEffect, createContext, useContext } from 'react';

// Create context for sidebar state
const SidebarContext = createContext();

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && !isCollapsed) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isCollapsed]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, isMobile, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

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
  const { isCollapsed, setIsCollapsed, isMobile } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);

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
          fixed left-0 z-[46] bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 
          ${
            shouldShowExpanded ? 'w-64' : 'w-16'
          }
          ${
            isMobile 
              ? `top-0 h-full overflow-y-auto ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}` 
              : 'top-[72px] h-[calc(100vh-72px)] overflow-y-auto'
          }
        `}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
      >
        
        {/* Sidebar Header */}
        <div className={`p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 ${isMobile ? 'sticky top-0 z-10' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 justify-center">
              {shouldShowExpanded ? (
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center">
                  <span className="mr-2">📂</span>
                  Categories
                </h2>
              ) : (
                <span className="text-2xl">📂</span>
              )}
            </div>
            {/* Close button for mobile */}
            {isMobile && shouldShowExpanded && (
              <button
                onClick={() => setIsCollapsed(true)}
                className="ml-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close categories"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
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
    </>
  );
}