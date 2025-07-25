import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
    console.log('=== Test User Creation ===');
    
    try {
        const supabase = createRouteHandlerClient({ cookies });
        
        // Get authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }
        
        console.log('✅ Authenticated user:', user.email);
        
        // Check if user exists in public.users
        const { data: userData, error: publicUserError } = await supabase
            .from('users')
            .select('id, email, name, phone')
            .eq('id', user.id)
            .single();
            
        if (publicUserError || !userData) {
            console.log('❌ User not found in public.users table:', publicUserError?.message);
            
            // Create the user in public.users
            const newUserData = {
                id: user.id,
                email: user.email,
                name: user?.user_metadata?.name || 
                      user?.user_metadata?.full_name || 
                      user?.user_metadata?.display_name || 
                      user.email.split('@')[0],
                avatar_url: user?.user_metadata?.picture || 
                           user?.user_metadata?.avatar_url || 
                           user?.user_metadata?.photo || null,
                phone: user?.phone || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            console.log('Creating user with data:', newUserData);
            
            const { data: insertedUser, error: insertError } = await supabase
                .from('users')
                .insert(newUserData)
                .select('id, email, name')
                .single();
            
            if (insertError) {
                console.error('❌ Failed to create user:', insertError);
                return NextResponse.json({ 
                    error: 'User creation failed',
                    details: insertError.message
                }, { status: 500 });
            }
            
            console.log('✅ Created user:', insertedUser);
        } else {
            console.log('✅ User exists in public.users:', userData.email);
        }
        
        // Now try to insert a test note
        const testNote = {
            seller_id: user.id,
            title: 'Test Note',
            description: 'Test Description',
            price: 100,
            college: 'Test College',
            course_subject: 'Test Subject',
            academic_year: '2024',
            category: 'Test Category'
        };
        
        console.log('Trying to insert test note...');
        
        const { data: noteData, error: noteError } = await supabase
            .from('notes')
            .insert(testNote)
            .select('id, title')
            .single();
        
        if (noteError) {
            console.error('❌ Note insertion failed:', noteError);
            return NextResponse.json({ 
                error: 'Note insertion failed',
                details: noteError.message
            }, { status: 500 });
        }
        
        console.log('✅ Note inserted successfully:', noteData);
        
        // Clean up the test note
        await supabase.from('notes').delete().eq('id', noteData.id);
        
        return NextResponse.json({ 
            success: true,
            user: user.email,
            note: noteData
        });
        
    } catch (error) {
        console.error('Test error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
