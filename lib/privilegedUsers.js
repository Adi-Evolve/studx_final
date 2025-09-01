// Privileged users configuration
// Users with special selling privileges and enhanced product display

export const PRIVILEGED_USERS = {
  'adiinamdar888@gmail.com': {
    name: 'Adi Inamdar',
    privilege: 'premium_seller',
    description: 'Arduino & Electronics Specialist',
    features: {
      priorityDisplay: true,
      customCardDesign: true,
      featuredBadge: 'VERIFIED SELLER',
      newLabel: 'NEW', // Special NEW label for fresh listings
      badgeColor: 'from-indigo-600 via-purple-600 to-pink-600',
      newLabelColor: 'from-emerald-500 via-teal-500 to-cyan-500',
      borderColor: 'border-purple-400',
      shadowColor: 'shadow-purple-200',
      commission: 0, // No commission for this user
      showSpecialBadge: true,
      highlightCategories: ['Project Equipment'], // Categories that get extra highlighting
    }
  }
};

// Check if a user has special privileges
export function isPrivilegedUser(email) {
  return PRIVILEGED_USERS.hasOwnProperty(email);
}

// Get user privilege information
export function getUserPrivileges(email) {
  return PRIVILEGED_USERS[email] || null;
}

// Check if user can use special categories
export function canUseSpecialCategories(email) {
  // No special categories, all users use standard categories
  return false;
}

// Get available categories for a user (same for all users)
export function getAvailableCategories(email) {
  const baseCategories = [
    'Laptops', 
    'Project Equipment',  // Arduino kits and electronics go here
    'Books', 
    'Cycle/Bike', 
    'Hostel Equipment', 
    'Notes', 
    'Rooms/Hostel', 
    'Furniture', 
    'Assignments/Projects', 
    'Others'
  ];
  
  // Everyone gets the same categories
  return baseCategories;
}

// Check if product should get priority display
export function shouldGetPriorityDisplay(sellerEmail) {
  const privileges = getUserPrivileges(sellerEmail);
  return privileges && privileges.features.priorityDisplay;
}

// Get custom styling for privileged user products
export function getCustomStyling(sellerEmail, category = '', isNewListing = false) {
  const privileges = getUserPrivileges(sellerEmail);
  if (!privileges) return null;
  
  // Check if this category gets extra highlighting
  const isHighlightCategory = privileges.features.highlightCategories?.includes(category);
  
  const baseCardClass = `border-2 ${privileges.features.borderColor} shadow-lg ${privileges.features.shadowColor} ring-2 ring-purple-100 dark:ring-purple-900/30 transform hover:scale-105`;
  
  // Enhanced styling for highlight categories (like Project Equipment)
  const enhancedCardClass = `border-3 border-gradient-to-r from-purple-400 to-blue-500 shadow-2xl ring-4 ring-purple-200 dark:ring-purple-800/50 transform hover:scale-110 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20`;
  
  return {
    cardClass: isHighlightCategory ? enhancedCardClass : baseCardClass,
    badgeText: privileges.features.featuredBadge,
    badgeClass: `bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[9px] font-bold shadow-lg border-2 border-emerald-300 animate-pulse hover:animate-none transition-all duration-300 uppercase tracking-wider`,
    showNewLabel: false, // Disabled NEW label
    newLabelText: privileges.features.newLabel,
    newLabelClass: `hidden`, // Hide NEW label completely
    titleClass: isHighlightCategory ? 'text-purple-900 dark:text-purple-300 font-extrabold text-lg' : 'text-purple-900 dark:text-purple-300 font-bold',
    priceClass: `text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 ${isHighlightCategory ? 'font-extrabold text-xl' : 'font-extrabold'}`,
    priority: 1, // Highest priority for sorting
    description: privileges.description,
    isHighlightCategory: isHighlightCategory
  };
}
