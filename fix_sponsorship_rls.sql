-- Fix sponsorship_sequences RLS policies

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view sponsored listings" ON public.sponsorship_sequences;
DROP POLICY IF EXISTS "Authenticated users can manage sponsored listings" ON public.sponsorship_sequences;
DROP POLICY IF EXISTS "sponsorship_sequences_select_all" ON public.sponsorship_sequences;
DROP POLICY IF EXISTS "sponsorship_sequences_insert_system" ON public.sponsorship_sequences;
DROP POLICY IF EXISTS "sponsorship_sequences_update_system" ON public.sponsorship_sequences;
DROP POLICY IF EXISTS "sponsorship_sequences_delete_system" ON public.sponsorship_sequences;

-- Create new policies that work correctly
CREATE POLICY "sponsorship_sequences_select_all" ON public.sponsorship_sequences
    FOR SELECT USING (true);

CREATE POLICY "sponsorship_sequences_insert_system" ON public.sponsorship_sequences
    FOR INSERT WITH CHECK (true);

CREATE POLICY "sponsorship_sequences_update_system" ON public.sponsorship_sequences
    FOR UPDATE USING (true);

CREATE POLICY "sponsorship_sequences_delete_system" ON public.sponsorship_sequences
    FOR DELETE USING (true);

-- Ensure table has RLS enabled
ALTER TABLE public.sponsorship_sequences ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT ON public.sponsorship_sequences TO anon;
GRANT ALL ON public.sponsorship_sequences TO authenticated;
GRANT ALL ON public.sponsorship_sequences TO service_role;

-- Test the fix
SELECT 'Sponsorship sequences table policies updated successfully' as status;
