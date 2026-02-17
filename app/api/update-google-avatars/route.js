import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const supabaseAdmin = createSupabaseAdminClient();
        
        // Update the trigger function to capture Google profile pictures
        await supabaseAdmin.rpc('exec_sql', {
            sql: `
                CREATE OR REPLACE FUNCTION public.handle_new_user()
                RETURNS TRIGGER AS $$
                BEGIN
                    INSERT INTO public.users (id, name, avatar_url, phone)
                    VALUES (
                        new.id, 
                        COALESCE(
                            new.raw_user_meta_data->>'name',
                            new.raw_user_meta_data->>'full_name'
                        ),
                        COALESCE(
                            new.raw_user_meta_data->>'picture',     -- Google profile picture
                            new.raw_user_meta_data->>'avatar_url',  -- Generic OAuth avatar
                            new.raw_user_meta_data->>'photo'        -- Alternative Google field
                        ),
                        new.phone
                    );
                    RETURN new;
                END;
                $$ LANGUAGE plpgsql SECURITY DEFINER;
            `
        });

        // Update existing users who might have Google avatars
        const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (authError) {
            // console.error('Error fetching auth users:', authError);
            return NextResponse.json({ error: authError.message }, { status: 500 });
        }

        let updatedCount = 0;
        
        for (const authUser of authUsers.users) {
            const googleAvatar = authUser.user_metadata?.picture 
                || authUser.user_metadata?.avatar_url 
                || authUser.user_metadata?.photo;
                
            if (googleAvatar) {
                const { error: updateError } = await supabaseAdmin
                    .from('users')
                    .update({ avatar_url: googleAvatar })
                    .eq('id', authUser.id);
                    
                if (!updateError) {
                    updatedCount++;
                    // console.log(`Updated avatar for user ${authUser.id}: ${googleAvatar}`);
                }
            }
        }
        
        return NextResponse.json({ 
            success: true, 
            message: `Updated avatars for ${updatedCount} users`,
            updatedCount 
        });
        
    } catch (error) {
        // console.error('Error updating Google avatars:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
