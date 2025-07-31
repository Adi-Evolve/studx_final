// Script to check notes table schema and fetch all notes
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;
const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

async function checkNotesSchemaAndFetch() {
    // Check table columns
    const { data: columns, error: schemaError } = await serviceClient
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'notes');
    if (schemaError) {
        console.log('❌ Error fetching notes schema:', schemaError.message);
    } else {
        console.log('✅ Notes table columns:', columns.map(c => c.column_name));
    }

    // Fetch all notes (no limit, no column selection)
    const { data: notes, error: notesError } = await serviceClient
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });
    if (notesError) {
        console.log('❌ Error fetching all notes:', notesError.message);
    } else {
        console.log('✅ All notes fetched:', notes);
    }
}

checkNotesSchemaAndFetch();
