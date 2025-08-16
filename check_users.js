import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUsers() {
  // console.log('🔍 Checking users in database...\n')
  
  try {
    // Get all users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      // console.error('❌ Error fetching users:', error)
      return
    }

    // console.log(`📊 Found ${users.length} users:`)
    users.forEach((user, index) => {
      // console.log(`${index + 1}. Email: ${user.email}`)
      // console.log(`   ID: ${user.id}`)
      // console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`)
      // console.log('')
    })

    if (users.length === 0) {
      // console.log('⚠️  No users found in database!')
      // console.log('💡 You need to sign up/register a user first.')
    }

  } catch (error) {
    // console.error('💥 Unexpected error:', error)
  }
}

checkUsers()
