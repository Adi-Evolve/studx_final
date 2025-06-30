import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        
        // Get recent notes to see if uploads are working
        const { data: notes, error } = await supabase
            .from('notes')
            .select(`
                id,
                title,
                images,
                pdf_urls,
                pdfUrl,
                course_subject,
                academic_year,
                created_at
            `)
            .order('created_at', { ascending: false })
            .limit(5);
        
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        
        return NextResponse.json({
            message: 'Recent notes from database',
            notes: notes,
            count: notes?.length || 0
        });
        
    } catch (error) {
        return NextResponse.json({ 
            error: error.message 
        }, { status: 500 });
    }
}
