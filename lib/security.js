// 🔒 COMPREHENSIVE SECURITY UTILITIES
// This file contains security functions for input validation, rate limiting, and protection

import { headers } from 'next/headers'
import { createServerSupabaseClient } from '../lib/supabase/server'

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map()

// 🛡️ Rate Limiting
export function rateLimit(identifier, maxRequests = 100, windowMs = 15 * 60 * 1000) {
  const now = Date.now()
  const windowStart = now - windowMs
  
  if (!rateLimitStore.has(identifier)) {
    rateLimitStore.set(identifier, [])
  }
  
  const requests = rateLimitStore.get(identifier)
  
  // Remove old requests outside the window
  const validRequests = requests.filter(timestamp => timestamp > windowStart)
  
  if (validRequests.length >= maxRequests) {
    return false
  }
  
  validRequests.push(now)
  rateLimitStore.set(identifier, validRequests)
  
  return true
}

// 🔍 Input Validation & Sanitization
export function validateAndSanitizeInput(input, type = 'string', maxLength = 1000) {
  if (!input) return null
  
  // Basic sanitization
  let sanitized = input.toString().trim()
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=/gi, '')
  
  // Length validation
  if (sanitized.length > maxLength) {
    throw new Error(`Input too long. Maximum ${maxLength} characters allowed.`)
  }
  
  // Type-specific validation
  switch (type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(sanitized)) {
        throw new Error('Invalid email format')
      }
      break
    case 'phone':
      const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/
      if (!phoneRegex.test(sanitized.replace(/\s/g, ''))) {
        throw new Error('Invalid phone number format')
      }
      break
    case 'number':
      const num = parseFloat(sanitized)
      if (isNaN(num)) {
        throw new Error('Invalid number format')
      }
      return num
    case 'url':
      try {
        new URL(sanitized)
      } catch {
        throw new Error('Invalid URL format')
      }
      break
  }
  
  return sanitized
}

// 🔐 Authentication & Authorization
export async function validateUserSession(requiredRole = null) {
  const supabase = createServerSupabaseClient()
  
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return { valid: false, error: 'No valid session found' }
    }
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('email', session.user.email)
      .single()
    
    if (userError || !user) {
      return { valid: false, error: 'User not found in database' }
    }
    
    if (requiredRole && user.role !== requiredRole) {
      return { valid: false, error: 'Insufficient permissions' }
    }
    
    return { 
      valid: true, 
      user,
      session 
    }
  } catch (error) {
    return { valid: false, error: 'Authentication failed' }
  }
}

// 🛡️ CSRF Protection
export function generateCSRFToken() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export function validateCSRFToken(token, sessionToken) {
  return token === sessionToken
}

// 🔒 SQL Injection Prevention (for raw queries)
export function escapeSQL(input) {
  if (typeof input !== 'string') {
    return input
  }
  return input.replace(/'/g, "''").replace(/;/g, '')
}

// 🚫 Blocked User Agents / IPs
const blockedUserAgents = [
  'sqlmap',
  'nikto',
  'nessus',
  'burp',
  'scanner'
]

const blockedIPs = [
  // Add any known malicious IPs here
]

export function isBlockedRequest(userAgent, ip) {
  const ua = userAgent?.toLowerCase() || ''
  
  if (blockedUserAgents.some(blocked => ua.includes(blocked))) {
    return true
  }
  
  if (blockedIPs.includes(ip)) {
    return true
  }
  
  return false
}

// 🔍 Security Headers Validation
export function validateSecurityHeaders(request) {
  const headerList = headers()
  const userAgent = headerList.get('user-agent')
  const referer = headerList.get('referer')
  const origin = headerList.get('origin')
  
  // Get client IP
  const forwarded = headerList.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : headerList.get('x-real-ip')
  
  // Check for blocked requests
  if (isBlockedRequest(userAgent, ip)) {
    throw new Error('Blocked request detected')
  }
  
  return { userAgent, referer, origin, ip }
}

// 🛡️ API Response Security
export function secureAPIResponse(data, status = 200) {
  const response = {
    success: status < 400,
    data: status < 400 ? data : null,
    error: status >= 400 ? data : null,
    timestamp: new Date().toISOString(),
    // Remove sensitive information
    ...(process.env.NODE_ENV !== 'production' && { debug: true })
  }
  
  return Response.json(response, {
    status,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  })
}

// 🔐 Environment Variable Validation
export function validateEnvironmentVariables() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SECRET_KEY',
    'IMGBB_API_KEY',
    'NEXT_PUBLIC_RAZORPAY_KEY_ID',
    'RAZORPAY_SECRET_KEY'
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
  
  return true
}
