import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import EditForm from './EditForm'

// Initialize Supabase with service key for server-side data fetching
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function getUserFromSession() {
    try {
        const cookieStore = cookies()
        const authCookie = cookieStore.get('sb-studx-auth-token')
        
        if (!authCookie) {
            return null
        }

        // Extract email from auth cookie if available
        // For now, we'll need to get user info another way
        return null
    } catch (error) {
        // console.error('Error getting user session:', error)
        return null
    }
}

async function getItemData(id, type, userEmail = null) {
    let tableName;
    switch (type) {
        case 'product': tableName = 'products'; break;
        case 'note': tableName = 'notes'; break;
        case 'room': tableName = 'rooms'; break;
        case 'rental': tableName = 'rentals'; break;
        default: return null;
    }

    const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single()
    if (error) {
        // console.error('Error fetching item:', error)
        return null
    }
    return data
}

export default async function EditItemPage({ params, searchParams }) {
    const { id } = params
    const { type } = searchParams

    // For now, we'll allow access and let the client-side handle authentication
    // This matches the pattern used in other parts of the app
    const itemData = await getItemData(id, type)

    if (!itemData) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="text-center py-10">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Item Not Found</h1>
                    <p className="text-gray-600">The item you're trying to edit could not be found.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Edit Your Listing</h1>
            <EditForm item={itemData} type={type} />
        </div>
    )
}
