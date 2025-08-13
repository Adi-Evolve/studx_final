import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Enhanced error logging
function logError(context, error, data = {}) {
  console.error(`[DELETE API ${context}]:`, {
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
  console.error('[DELETE API] Missing environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    availableKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
  })
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request) {
    console.log('[DELETE API] POST request received')

    try {
        const body = await request.json()
        const { id, type, userEmail } = body

        console.log('[DELETE API] Request data:', { id, type, userEmail })

        if (!id || !type) {
            return NextResponse.json({ error: 'Missing item ID or type' }, { status: 400 })
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
            default:
                return NextResponse.json({ error: 'Invalid item type' }, { status: 400 })
        }

        // Check if user exists in our users table
        console.log('[DELETE API] Validating user...')
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
            console.log('[DELETE API] No user found with email:', userEmail)
            return NextResponse.json({ 
                error: 'User not found',
                userEmail,
                suggestion: 'Please make sure you are logged in with the correct email'
            }, { status: 401 })
        }

        const user = userData[0]
        console.log('[DELETE API] User validated:', user.id)

        // First, verify the user owns the item
        console.log('[DELETE API] Checking item ownership...')
        const { data: item, error: fetchError } = await supabase
            .from(tableName)
            .select('seller_id, title, pdf_url, pdf_urls') // Get both pdf_url and pdf_urls for notes
            .eq('id', id)
            .single()

        if (fetchError || !item) {
            console.log('[DELETE API] Item not found:', { id, type, table: tableName })
            return NextResponse.json({ error: 'Item not found' }, { status: 404 })
        }

        if (item.seller_id !== user.id) {
            console.log('[DELETE API] Ownership mismatch:', {
                itemSellerId: item.seller_id,
                userId: user.id
            })
            return NextResponse.json({ error: 'You can only delete your own items' }, { status: 403 })
        }

        // If it's a note with PDFs, delete the PDFs from storage
        if (type === 'note') {
            console.log('[DELETE API] Cleaning up note PDFs...')
            
            // Handle single pdf_url (legacy)
            if (item.pdf_url) {
                try {
                    const fileName = item.pdf_url.split('/').pop()
                    await supabase.storage.from('notes_pdfs').remove([fileName])
                    console.log('[DELETE API] Removed PDF file:', fileName)
                } catch (pdfError) {
                    console.log('[DELETE API] Could not remove PDF file:', pdfError.message)
                }
            }

            // Handle multiple pdf_urls (new format)
            if (item.pdf_urls && Array.isArray(item.pdf_urls)) {
                for (const pdfData of item.pdf_urls) {
                    try {
                        const pdfObj = typeof pdfData === 'string' ? JSON.parse(pdfData) : pdfData
                        if (pdfObj.fileId) {
                            await supabase.storage.from('notes_pdfs').remove([pdfObj.fileId])
                            console.log('[DELETE API] Removed PDF file:', pdfObj.fileId)
                        }
                    } catch (pdfError) {
                        console.log('[DELETE API] Could not remove PDF file:', pdfError.message)
                    }
                }
            }
        }

        // Delete the item from the database
        console.log('[DELETE API] Deleting item from database...')
        const { error: deleteError } = await supabase
            .from(tableName)
            .delete()
            .eq('id', id)

        if (deleteError) {
            logError('DATABASE_DELETE', deleteError)
            return NextResponse.json({ 
                error: 'Failed to delete item',
                details: deleteError.message 
            }, { status: 500 })
        }

        console.log('[DELETE API] Item deleted successfully:', { id, type, title: item.title })

        return NextResponse.json({ 
            success: true,
            message: 'Item deleted successfully',
            item: {
                id,
                type,
                title: item.title
            }
        })

    } catch (error) {
        console.error('[DELETE API] Unexpected error:', error)
        logError('POST_REQUEST', error)
        return NextResponse.json({ 
            error: 'Internal server error',
            details: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 })
    }
}
