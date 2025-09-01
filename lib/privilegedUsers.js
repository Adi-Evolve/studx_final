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
      badgeColor: 'from-purple-500 to-blue-600',
      borderColor: 'border-purple-400',
      shadowColor: 'shadow-purple-200',
      commission: 0, // No commission for this user
      showSpecialBadge: true,
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
export function getCustomStyling(sellerEmail) {
  const privileges = getUserPrivileges(sellerEmail);
  if (!privileges) return null;
  
  return {
    cardClass: `border-2 ${privileges.features.borderColor} shadow-lg ${privileges.features.shadowColor} ring-2 ring-purple-100 dark:ring-purple-900/30 transform hover:scale-110`,
    badgeText: privileges.features.featuredBadge,
    badgeClass: `bg-gradient-to-r ${privileges.features.badgeColor} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white dark:border-gray-800 animate-pulse`,
    titleClass: 'text-purple-900 dark:text-purple-300 font-bold',
    priceClass: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 font-extrabold',
    priority: 1, // Highest priority for sorting
    description: privileges.description
  };
}
