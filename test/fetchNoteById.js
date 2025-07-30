// Script to fetch a note by ID from Supabase
// Usage: node test/fetchNoteById.js <note_id>

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const noteId = process.argv[2];
if (!noteId) {
  console.error('Please provide a note ID as an argument.');
  process.exit(1);
}

async function fetchNoteById(id) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    console.error('Error fetching note:', error.message);
    return;
  }
  if (!data) {
    console.log('No note found with ID:', id);
  } else {
    console.log('Note found:', data);
  }
}

fetchNoteById(noteId);
