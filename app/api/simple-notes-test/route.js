import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
    console.log('=== Simple Notes Test ===');
    
    try {
        const supabase = createRouteHandlerClient({ cookies });
        
        // Get authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }
        
        console.log('✅ User authenticated:', user.email);
        
        // Check if user exists in public.users and create if needed
        const { data: userData, error: publicUserError } = await supabase
            .from('users')
            .select('id, email, name')
            .eq('id', user.id)
            .single();
            
        if (publicUserError || !userData) {
            console.log('Creating user in public.users...');
            
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert({
                    id: user.id,
                    email: user.email,
                    name: user.email.split('@')[0],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select('id, email, name')
                .single();
                
            if (createError) {
                console.error('User creation failed:', createError);
                return NextResponse.json({ error: createError.message }, { status: 500 });
            }
            console.log('✅ User created:', newUser);
        } else {
            console.log('✅ User exists:', userData);
        }
        
        // Try inserting a minimal note
        const noteData = {
            seller_id: user.id,
            title: 'Test Note Simple',
            description: 'Test Description',
            price: 99,
            college: 'Test College',
            course_subject: 'Test Subject',
            academic_year: '2024',
            category: 'Notes'
        };
        
        console.log('Inserting note:', noteData);
        
        const { data: note, error: noteError } = await supabase
            .from('notes')
            .insert(noteData)
            .select('id, title')
            .single();
        
        if (noteError) {
            console.error('Note insertion failed:', noteError);
            return NextResponse.json({ 
                error: 'Note insertion failed',
                details: noteError.message,
                code: noteError.code
            }, { status: 500 });
        }
        
        console.log('✅ Note created:', note);
        
        // Clean up
        await supabase.from('notes').delete().eq('id', note.id);
        
        return NextResponse.json({ 
            success: true,
            user: user.email,
            note: note
        });
        
    } catch (error) {
        console.error('🚨 SIMPLE TEST ERROR:', error);
        return NextResponse.json({ 
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
