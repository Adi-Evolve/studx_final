'use client';

import CategorySidebar, { SidebarProvider } from './CategorySidebar';

export default function LayoutWithSidebar({ children }) {
  return (
    <SidebarProvider>
      <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Horizontal category bar */}
        <CategorySidebar />
        
        {/* Main content area */}
        <div className="min-h-screen">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}