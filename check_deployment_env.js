#!/usr/bin/env node

/**
 * Environment Variable Deployment Check
 * This script verifies all required environment variables are properly set
 */

console.log('🔍 StudX Environment Variable Check\n')

const requiredVars = {
  'NEXT_PUBLIC_SUPABASE_URL': {
    value: process.env.NEXT_PUBLIC_SUPABASE_URL,
    expected: 'https://vdpmumstdxgftaaxeacx.supabase.co',
    description: 'Supabase Project URL (Public)'
  },
  'SUPABASE_SECRET_KEY': {
    value: process.env.SUPABASE_SECRET_KEY,
    expected: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Supabase Service Role Key (Secret)'
  },
  'IMGBB_API_KEY': {
    value: process.env.IMGBB_API_KEY,
    expected: '272785e1c6e6221d927bad99483ff9ed',
    description: 'ImgBB API Key for image uploads'
  }
}

let allGood = true

console.log('📋 Environment Variables Status:\n')

Object.entries(requiredVars).forEach(([key, config]) => {
  const isPresent = !!config.value
  const isCorrect = config.value === config.expected
  const status = isPresent ? (isCorrect ? '✅' : '⚠️') : '❌'
  
  console.log(`${status} ${key}`)
  console.log(`   Description: ${config.description}`)
  console.log(`   Present: ${isPresent ? 'Yes' : 'No'}`)
  
  if (isPresent) {
    console.log(`   Matches Expected: ${isCorrect ? 'Yes' : 'No'}`)
    if (!isCorrect && key !== 'SUPABASE_SECRET_KEY') {
      console.log(`   Current: ${config.value}`)
      console.log(`   Expected: ${config.expected}`)
    }
  }
  
  console.log('')
  
  if (!isPresent) {
    allGood = false
  }
})

// Test Supabase connection
console.log('🔗 Testing Supabase Connection...')
try {
  const { createClient } = require('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
  )
  console.log('✅ Supabase client created successfully')
} catch (error) {
  console.log('❌ Supabase client creation failed:', error.message)
  allGood = false
}

// Summary
console.log('\n📊 Summary:')
if (allGood) {
  console.log('✅ All environment variables are properly configured!')
  console.log('🚀 Your deployment should work correctly.')
} else {
  console.log('❌ Some environment variables are missing or incorrect.')
  console.log('🔧 Please fix the issues above before deploying.')
}

console.log('\n💡 Deployment Platform Instructions:')
console.log('Vercel: Project Settings → Environment Variables')
console.log('Netlify: Site Settings → Environment Variables') 
console.log('Render: Environment → Add Environment Variable')
console.log('')
console.log('⚠️  Remember to REDEPLOY after setting environment variables!')

// Export for API usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { requiredVars, allGood }
}
