'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Fetch all active and verified mess services
export async function fetchMessServices() {
  const supabase = createSupabaseServerClient();
  
  try {
    const { data, error } = await supabase
      .from('mess')
      .select('*')
      .eq('is_active', true)
      .eq('is_owner_verified', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching mess services:', error);
      return { mess: [], error: error.message };
    }

    return { mess: data || [], error: null };
  } catch (error) {
    console.error('Error in fetchMessServices:', error);
    return { mess: [], error: 'Failed to fetch mess services' };
  }
}

// Fetch single mess by ID
export async function fetchMessById(id) {
  const supabase = createSupabaseServerClient();
  
  try {
    // Fetch mess with owner information
    const { data: messData, error: messError } = await supabase
      .from('mess')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .eq('is_owner_verified', true)
      .single();

    if (messError) {
      console.error('Error fetching mess:', messError);
      return { mess: null, seller: null, error: messError.message };
    }

    // Fetch seller information if owner_id exists
    let seller = null;
    if (messData?.owner_id) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, email, phone')
        .eq('id', messData.owner_id)
        .single();

      if (!userError && userData) {
        seller = userData;
      }
    }

    return { mess: messData, seller, error: null };
  } catch (error) {
    console.error('Error in fetchMessById:', error);
    return { mess: null, seller: null, error: 'Failed to fetch mess details' };
  }
}

// Check if user is a mess owner
export async function checkMessOwnerStatus() {
  const supabase = createSupabaseServerClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { isOwner: false, mess: null, error: null };

    // Check if user has a mess directly
    const { data: mess, error } = await supabase
      .from('mess')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking mess owner status:', error);
      return { isOwner: false, mess: null, error: error.message };
    }

    return { 
      isOwner: !!mess, 
      mess: mess || null, 
      error: null 
    };
  } catch (error) {
    console.error('Error in checkMessOwnerStatus:', error);
    return { isOwner: false, mess: null, error: 'Failed to check owner status' };
  }
}

// Create or update mess (for owners)
export async function createOrUpdateMess(messData) {
  const supabase = createSupabaseServerClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'User not authenticated' };

    // Check if user already has a mess
    const { data: existingMess } = await supabase
      .from('mess')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    let result;
    
    if (existingMess) {
      // Update existing mess
      result = await supabase
        .from('mess')
        .update({
          ...messData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingMess.id)
        .select()
        .single();
    } else {
      // Create new mess
      result = await supabase
        .from('mess')
        .insert({
          ...messData,
          owner_id: user.id,
          is_active: true,
          is_owner_verified: true
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error creating/updating mess:', result.error);
      return { success: false, error: result.error.message };
    }

    revalidatePath('/mess');
    revalidatePath('/profile/mess');
    
    return { success: true, mess: result.data, error: null };
  } catch (error) {
    console.error('Error in createOrUpdateMess:', error);
    return { success: false, error: 'Failed to save mess' };
  }
}

// Update mess food items
export async function updateMessFoodItems(messId, foodItems) {
  const supabase = createSupabaseServerClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'User not authenticated' };

    const { data, error } = await supabase
      .from('mess')
      .update({
        available_foods: foodItems,
        updated_at: new Date().toISOString()
      })
      .eq('id', messId)
      .eq('owner_id', user.id) // Ensure owner can only update their own mess
      .select()
      .single();

    if (error) {
      console.error('Error updating food items:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/mess');
    revalidatePath('/profile/mess');
    
    return { success: true, mess: data, error: null };
  } catch (error) {
    console.error('Error in updateMessFoodItems:', error);
    return { success: false, error: 'Failed to update food items' };
  }
}

// Get mess for owner (including unverified)
export async function getOwnerMess() {
  const supabase = createSupabaseServerClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { mess: null, error: 'User not authenticated' };

    const { data, error } = await supabase
      .from('mess')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching owner mess:', error);
      return { mess: null, error: error.message };
    }

    return { mess: data || null, error: null };
  } catch (error) {
    console.error('Error in getOwnerMess:', error);
    return { mess: null, error: 'Failed to fetch mess' };
  }
}