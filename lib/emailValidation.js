import { createClient } from '@supabase/supabase-js';

/**
 * Email Validation Utilities for Educational Institutions
 * Restricts authentication to only .edu email addresses
 */

// Admin/privileged accounts that are exempt from educational email requirement
const ADMIN_ACCOUNTS = [
  'adiinamdar888@gmail.com', // Platform admin account
];

/**
 * Check if user already exists in the database (for grandfathering)
 * @param {string} email 
 * @returns {Promise<boolean>}
 */
export async function isExistingUser(email) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not available for user check');
      return false;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', email.toLowerCase().trim())
      .single();
    
    return !error && !!data;
  } catch (error) {
    console.warn('Error checking existing user:', error);
    return false;
  }
}

// List of allowed educational email domains
const ALLOWED_EDU_DOMAINS = [
  'edu',           // Standard US educational domain
  'edu.in',        // Indian educational institutions
  'edu.au',        // Australian educational institutions
  'edu.uk',        // UK educational institutions
  'ac.uk',         // UK academic institutions
  'edu.sg',        // Singapore educational institutions
  'edu.my',        // Malaysian educational institutions
  'edu.pk',        // Pakistani educational institutions
  'edu.bd',        // Bangladeshi educational institutions
  'edu.np',        // Nepali educational institutions
  'edu.lk',        // Sri Lankan educational institutions
  'ac.in',         // Indian academic institutions
  'ac.za',         // South African academic institutions
  'edu.za',        // South African educational institutions
];

// Common educational keywords that might appear in domains
const EDU_KEYWORDS = [
  'university',
  'college',
  'school',
  'institute',
  'academy',
  'edu',
];

/**
 * Validates if an email address belongs to an educational institution
 * Only applies to new signups - existing users are grandfathered
 * @param {string} email - Email address to validate
 * @param {boolean} isExistingUser - Whether this is an existing user (bypasses validation)
 * @returns {object} - { isValid: boolean, message: string, domain: string }
 */
export function validateEducationalEmail(email, isExistingUser = false) {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      message: 'Please provide a valid email address.',
      domain: ''
    };
  }

  // Check if email is an admin account (exempt from educational email requirement)
  if (ADMIN_ACCOUNTS.includes(email.toLowerCase().trim())) {
    return {
      isValid: true,
      message: 'Valid admin account.',
      domain: email.split('@')[1],
      type: 'admin'
    };
  }
  
  // Grandfather existing users - they can continue using their accounts
  if (isExistingUser) {
    return {
      isValid: true,
      message: 'Existing user - grandfathered access.',
      domain: email.split('@')[1],
      type: 'grandfathered'
    };
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Please provide a valid email format.',
      domain: ''
    };
  }

  const emailLower = email.toLowerCase().trim();
  const domain = emailLower.split('@')[1];
  
  if (!domain) {
    return {
      isValid: false,
      message: 'Invalid email format.',
      domain: ''
    };
  }

  // Check if domain ends with any allowed educational domains
  const isDirectEduDomain = ALLOWED_EDU_DOMAINS.some(eduDomain => 
    domain.endsWith('.' + eduDomain) || domain === eduDomain
  );

  if (isDirectEduDomain) {
    return {
      isValid: true,
      message: 'Valid educational email address.',
      domain: domain,
      type: 'educational'
    };
  }

  // Check if domain contains educational keywords (more lenient check)
  const hasEduKeyword = EDU_KEYWORDS.some(keyword => 
    domain.includes(keyword)
  );

  if (hasEduKeyword) {
    return {
      isValid: true,
      message: 'Valid educational email address.',
      domain: domain,
      type: 'educational_keyword'
    };
  }

  return {
    isValid: false,
    message: 'Please use an official educational email address (.edu, .edu.in, university.edu, etc.). StudX is exclusively for students and educational institutions.',
    domain: domain,
    type: 'non_educational'
  };
}

/**
 * Validates email during signup
 * @param {string} email 
 * @param {boolean} isExistingUser - Whether this is an existing user
 * @returns {object}
 */
export function validateSignupEmail(email, isExistingUser = false) {
  const validation = validateEducationalEmail(email, isExistingUser);
  
  if (!validation.isValid) {
    return {
      ...validation,
      message: validation.message + ' ' + getEducationalEmailExamples()
    };
  }
  
  return validation;
}

/**
 * Gets examples of valid educational email formats
 * @returns {string}
 */
function getEducationalEmailExamples() {
  return 'Examples: john@university.edu, student@college.edu.in, name@school.ac.uk';
}

/**
 * Extracts institution name from email domain
 * @param {string} email 
 * @returns {string}
 */
export function getInstitutionFromEmail(email) {
  try {
    const domain = email.toLowerCase().split('@')[1];
    if (!domain) return '';
    
    // Remove common suffixes and get institution name
    const parts = domain.split('.');
    const institutionPart = parts.find(part => 
      EDU_KEYWORDS.some(keyword => part.includes(keyword)) ||
      part.length > 4 // Assume longer parts are institution names
    ) || parts[0];
    
    // Capitalize first letter
    return institutionPart.charAt(0).toUpperCase() + institutionPart.slice(1);
  } catch (error) {
    return '';
  }
}

/**
 * Check if email domain is suspicious or commonly used for fake accounts
 * @param {string} email 
 * @param {boolean} isExistingUser - Whether this is an existing user
 * @returns {object}
 */
export function checkSuspiciousEmail(email, isExistingUser = false) {
  // Check if email is an admin account (exempt from suspicious email checks)
  if (ADMIN_ACCOUNTS.includes(email.toLowerCase().trim())) {
    return {
      isSuspicious: false,
      domain: email.split('@')[1],
      message: 'Valid admin account.',
      type: 'admin'
    };
  }
  
  // Grandfather existing users
  if (isExistingUser) {
    return {
      isSuspicious: false,
      domain: email.split('@')[1],
      message: 'Existing user - grandfathered access.',
      type: 'grandfathered'
    };
  }

  const suspiciousDomains = [
    'gmail.com',
    'yahoo.com', 
    'hotmail.com',
    'outlook.com',
    'protonmail.com',
    'tempmail.org',
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com'
  ];
  
  const domain = email.toLowerCase().split('@')[1];
  const isSuspicious = suspiciousDomains.includes(domain);
  
  return {
    isSuspicious,
    domain,
    message: isSuspicious ? 
      'Personal email addresses are not allowed. Please use your official educational email.' :
      'Email domain appears to be legitimate.'
  };
}
