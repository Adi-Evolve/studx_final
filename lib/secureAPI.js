// 🔒 SECURE API ROUTE WRAPPER
// This wrapper provides comprehensive security for all API routes

import { 
  rateLimit, 
  validateAndSanitizeInput, 
  validateUserSession,
  validateSecurityHeaders,
  secureAPIResponse,
  validateEnvironmentVariables
} from './security'

// 🛡️ Secure API Handler Wrapper
export function secureAPIHandler(handler, options = {}) {
  return async function(request) {
    const startTime = Date.now()
    
    try {
      // 🔍 Environment validation
      validateEnvironmentVariables()
      
      // 🔒 Security headers validation
      const { ip, userAgent } = validateSecurityHeaders(request)
      
      // 🚦 Rate limiting
      const rateLimitKey = ip || 'unknown'
      if (!rateLimit(rateLimitKey, options.maxRequests || 100, options.windowMs || 15 * 60 * 1000)) {
        return secureAPIResponse('Rate limit exceeded. Try again later.', 429)
      }
      
      // 🔐 Authentication check (if required)
      if (options.requireAuth) {
        const authResult = await validateUserSession(options.requiredRole)
        if (!authResult.valid) {
          return secureAPIResponse(authResult.error, 401)
        }
        request.user = authResult.user
        request.session = authResult.session
      }
      
      // 📊 Request logging (in production, use proper logging)
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔒 Secure API: ${request.method} ${request.url}`, {
          ip,
          userAgent: userAgent?.substring(0, 100),
          authenticated: !!request.user
        })
      }
      
      // 🎯 Call the actual handler
      const result = await handler(request)
      
      // ⏱️ Performance monitoring
      const duration = Date.now() - startTime
      if (duration > 5000) {
        console.warn(`⚠️ Slow API response: ${request.url} took ${duration}ms`)
      }
      
      return result
      
    } catch (error) {
      console.error('🚨 API Security Error:', {
        url: request.url,
        method: request.method,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
      
      // Don't expose internal errors to client
      const isInternalError = error.message.includes('Database') || 
                              error.message.includes('Environment') ||
                              error.message.includes('Internal')
      
      return secureAPIResponse(
        isInternalError ? 'Internal server error' : error.message,
        isInternalError ? 500 : 400
      )
    }
  }
}

// 🔐 Secure Data Validation Middleware
export function validateRequestData(schema) {
  return function(handler) {
    return async function(request) {
      try {
        const body = await request.json()
        
        // Validate each field according to schema
        const validatedData = {}
        
        for (const [field, rules] of Object.entries(schema)) {
          const value = body[field]
          
          // Required field check
          if (rules.required && (!value && value !== 0)) {
            return secureAPIResponse(`${field} is required`, 400)
          }
          
          // Skip validation for optional empty fields
          if (!value && !rules.required) {
            continue
          }
          
          // Validate and sanitize
          try {
            validatedData[field] = validateAndSanitizeInput(
              value, 
              rules.type || 'string',
              rules.maxLength || 1000
            )
          } catch (validationError) {
            return secureAPIResponse(
              `Invalid ${field}: ${validationError.message}`,
              400
            )
          }
        }
        
        // Add validated data to request
        request.validatedData = validatedData
        return await handler(request)
        
      } catch (error) {
        return secureAPIResponse('Invalid request data', 400)
      }
    }
  }
}

// 🔒 Admin-only API wrapper
export const adminOnlyAPI = (handler) => 
  secureAPIHandler(handler, { requireAuth: true, requiredRole: 'admin' })

// 🔐 User-authenticated API wrapper  
export const authenticatedAPI = (handler) => 
  secureAPIHandler(handler, { requireAuth: true })

// 🚦 Rate-limited public API wrapper
export const publicAPI = (handler, maxRequests = 50) => 
  secureAPIHandler(handler, { maxRequests })

// Export pre-configured secure handlers
export {
  secureAPIResponse,
  validateAndSanitizeInput
}
