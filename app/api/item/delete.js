import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const supabase = createRouteHandlerClient({ cookies: () => request.cookies });
    const { id, type } = await request.json();
    let table = type === 'note' ? 'notes' : type === 'room' ? 'rooms' : 'products';
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}
