'use client';

import { useTheme } from './ThemeProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-full transition-all duration-300 ease-in-out
        bg-gray-200 dark:bg-gray-700 
        hover:bg-gray-300 dark:hover:bg-gray-600
        border border-gray-300 dark:border-gray-600
        text-gray-700 dark:text-gray-300
        hover:text-gray-900 dark:hover:text-white
        focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
        shadow-sm hover:shadow-md
        ${className}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-5 h-5">
        <FontAwesomeIcon
          icon={isDark ? faMoon : faSun}
          className="w-5 h-5 transition-all duration-300 ease-in-out"
        />
      </div>
    </button>
  );
}
