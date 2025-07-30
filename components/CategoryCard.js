'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CategoryCard({ href, icon, title, className = "" }) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    // Reset animation after it completes
    setTimeout(() => setIsAnimating(false), 400);
  };

  return (
    <div
      className={`group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl dark:hover:shadow-gray-700 transition-all duration-300 transform hover:scale-105 p-4 md:p-6 text-center border dark:border-gray-700 ${className}`}
      onClick={e => {
        handleClick();
        window.location.href = href;
      }}
      style={{ cursor: 'pointer' }}
    >
      <div className={`text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300 ${isAnimating ? 'icon-subtle-tilt' : ''}`}>
        {icon}
      </div>
      <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm md:text-base">
        {title}
      </h3>
    </div>
  );
}
