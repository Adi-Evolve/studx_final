// Test script to check fees_period data in rooms
// This will run as a Next.js API route

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { createSupabaseServerClient } = await import('@/lib/supabase/server');
  
  try {
    const supabase = createSupabaseServerClient();
    
    // Check if fees_period column exists and get sample data
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('id, title, price, fees_period, duration, fees, created_at')
      .limit(5);
    
    if (error) {
      return res.status(500).json({ 
        error: 'Database query failed', 
        details: error.message,
        message: 'fees_period column may not exist'
      });
    }
    
    // Check column information
    const { data: columns, error: columnError } = await supabase
      .rpc('sql', { 
        query: `
          SELECT column_name, data_type, column_default, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'rooms' 
          AND column_name IN ('fees_period', 'duration')
        `
      });
      
    return res.status(200).json({
      message: 'Room fees_period data check',
      rooms: rooms || [],
      totalRooms: rooms?.length || 0,
      columns: columns || [],
      hasData: rooms?.length > 0,
      hasFeesPeriod: rooms?.some(room => room.fees_period),
      sample: rooms?.slice(0, 3)
    });
    
  } catch (error) {
    return res.status(500).json({ 
      error: 'Server error', 
      details: error.message 
    });
  }
}
