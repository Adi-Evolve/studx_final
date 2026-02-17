import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Enhanced error logging
function logError(context, error, data = {}) {
  console.error(`[MARK-SOLD API ${context}]:`, {
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
  console.error('[MARK-SOLD API] Missing environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    availableKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
  })
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request) {
    console.log('[MARK-SOLD API] POST request received')

    try {
        const body = await request.json()
        const { id, userEmail } = body

        console.log('[MARK-SOLD API] Request data:', { id, userEmail })

        if (!id) {
            return NextResponse.json({ error: 'Missing product ID' }, { status: 400 })
        }

        if (!userEmail) {
            return NextResponse.json({ error: 'Missing user email' }, { status: 400 })
        }

        // Check if user exists in our users table
        console.log('[MARK-SOLD API] Validating user...')
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
            console.log('[MARK-SOLD API] No user found with email:', userEmail)
            return NextResponse.json({ 
                error: 'User not found',
                userEmail,
                suggestion: 'Please make sure you are logged in with the correct email'
            }, { status: 401 })
        }

        const user = userData[0]
        console.log('[MARK-SOLD API] User validated:', user.id)

        // First, verify the user owns the product
        console.log('[MARK-SOLD API] Checking product ownership...')
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('seller_id, title, is_sold')
            .eq('id', id)
            .single()

        if (fetchError || !product) {
            console.log('[MARK-SOLD API] Product not found:', id)
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        if (product.seller_id !== user.id) {
            console.log('[MARK-SOLD API] Ownership mismatch:', {
                productSellerId: product.seller_id,
                userId: user.id
            })
            return NextResponse.json({ error: 'You can only mark your own products as sold' }, { status: 403 })
        }

        if (product.is_sold) {
            console.log('[MARK-SOLD API] Product already marked as sold')
            return NextResponse.json({ 
                error: 'Product is already marked as sold',
                product: { id, title: product.title }
            }, { status: 400 })
        }

        // Update the is_sold status
        console.log('[MARK-SOLD API] Marking product as sold...')
        const { error: updateError } = await supabase
            .from('products')
            .update({ 
                is_sold: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (updateError) {
            logError('DATABASE_UPDATE', updateError)
            return NextResponse.json({ 
                error: 'Failed to mark product as sold',
                details: updateError.message 
            }, { status: 500 })
        }

        console.log('[MARK-SOLD API] Item marked as sold successfully:', id)

        return NextResponse.json({ 
            success: true,
            message: 'Item marked as sold successfully',
            item: {
                id,
                type: 'product',
                title: product.title,
                is_sold: true
            }
        })

    } catch (error) {
        console.error('[MARK-SOLD API] Unexpected error:', error)
        logError('POST_REQUEST', error)
        return NextResponse.json({ 
            error: 'Internal server error',
            details: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 })
    }
}
