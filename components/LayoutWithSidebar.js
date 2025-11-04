'use client';

import { useState, useEffect } from 'react';
import CategorySidebar from './CategorySidebar';

export default function LayoutWithSidebar({ children }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      <CategorySidebar />
      
      {/* Main content area - no top padding to eliminate gaps */}
      <div className={`
        transition-all duration-300
        ${
          isMobile 
            ? 'ml-0' 
            : 'ml-16'
        }
      `}>
        <div className="min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}