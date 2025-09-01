/**
 * Email Validation Utilities for Educational Institutions
 * Restricts authentication to only .edu email addresses
 */

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
 * @param {string} email - Email address to validate
 * @returns {object} - { isValid: boolean, message: string, domain: string }
 */
export function validateEducationalEmail(email) {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      message: 'Please provide a valid email address.',
      domain: ''
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
 * @returns {object}
 */
export function validateSignupEmail(email) {
  const validation = validateEducationalEmail(email);
  
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
 * @returns {object}
 */
export function checkSuspiciousEmail(email) {
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
