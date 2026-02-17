import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Enhanced error logging
function logError(context, error, data = {}) {
  console.error(`[UPDATE API ${context}]:`, {
    message: error.message,
    stack: error.stack?.substring(0, 500),
    data,
    timestamp: new Date().toISOString()
  })
}

// Initialize Supabase with service key (same as sell API)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('[UPDATE API] Missing environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    availableKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
  })
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request) {
    console.log('[UPDATE API] POST request received')

    try {
        const body = await request.json()
        const { id, type, data, userEmail } = body

        console.log('[UPDATE API] Request data:', { id, type, userEmail, dataKeys: Object.keys(data || {}) })

        if (!id || !type || !data) {
            return NextResponse.json({ error: 'Missing required fields (id, type, data)' }, { status: 400 })
        }

        if (!userEmail) {
            return NextResponse.json({ error: 'Missing user email' }, { status: 400 })
        }

        // Validate table name
        let tableName
        switch (type) {
            case 'product':
                tableName = 'products'
                break
            case 'note':
                tableName = 'notes'
                break
            case 'room':
                tableName = 'rooms'
                break
            case 'rental':
                tableName = 'rentals'
                break
            default:
                return NextResponse.json({ error: 'Invalid item type' }, { status: 400 })
        }

        // Check if user exists in our users table
        console.log('[UPDATE API] Validating user...')
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, email')
            .eq('email', userEmail)

        if (userError) {
            logError('USER_VALIDATION', userError)
            return NextResponse.json({ 
                error: 'Database error during user validation',
                userEmail,
                details: userError.message 
            }, { status: 500 })
        }

        if (!userData || userData.length === 0) {
            console.log('[UPDATE API] No user found with email:', userEmail)
            return NextResponse.json({ 
                error: 'User not found',
                userEmail,
                suggestion: 'Please make sure you are logged in with the correct email'
            }, { status: 401 })
        }

        const user = userData[0]
        console.log('[UPDATE API] User validated:', user.id)

        // Verify ownership
        console.log('[UPDATE API] Checking item ownership...')
        const { data: item, error: fetchError } = await supabase
            .from(tableName)
            .select('seller_id, title')
            .eq('id', id)
            .single()

        if (fetchError || !item) {
            console.log('[UPDATE API] Item not found:', { id, type, table: tableName })
            return NextResponse.json({ error: 'Item not found' }, { status: 404 })
        }

        if (item.seller_id !== user.id) {
            console.log('[UPDATE API] Ownership mismatch:', {
                itemSellerId: item.seller_id,
                userId: user.id
            })
            return NextResponse.json({ error: 'You can only edit your own items' }, { status: 403 })
        }

        // Clean the data - remove any fields that shouldn't be updated
        const updateData = { ...data }
        delete updateData.id
        delete updateData.seller_id
        delete updateData.created_at
        delete updateData.type

        // Add updated timestamp
        updateData.updated_at = new Date().toISOString()

        console.log('[UPDATE API] Updating item with data:', Object.keys(updateData))

        // Update the item
        const { error: updateError } = await supabase
            .from(tableName)
            .update(updateData)
            .eq('id', id)

        if (updateError) {
            logError('DATABASE_UPDATE', updateError)
            return NextResponse.json({ 
                error: 'Failed to update item',
                details: updateError.message 
            }, { status: 500 })
        }

        console.log('[UPDATE API] Item updated successfully:', { id, type, title: item.title })

        return NextResponse.json({ 
            success: true,
            message: 'Item updated successfully',
            item: {
                id,
                type,
                title: item.title
            }
        })

    } catch (error) {
        console.error('[UPDATE API] Unexpected error:', error)
        logError('POST_REQUEST', error)
        return NextResponse.json({ 
            error: 'Internal server error',
            details: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 })
    }
}
