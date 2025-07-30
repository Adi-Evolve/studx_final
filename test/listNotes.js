// Script to list all notes in the Supabase 'notes' table
// Run with: node test/listNotes.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function listNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('id, title, category, created_at');
  if (error) {
    console.error('Error fetching notes:', error.message);
    return;
  }
  console.log('Notes in database:');
  data.forEach(note => {
    console.log(`ID: ${note.id}, Title: ${note.title}, Category: ${note.category}, Created: ${note.created_at}`);
  });
}

listNotes();
