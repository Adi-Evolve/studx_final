// HIDDEN: This page is temporarily hidden but not deleted
// To re-enable, simply uncomment the code below and comment out the redirect

import { redirect } from 'next/navigation';

export default async function MessDetailsPage({ params }) {
  // Redirect to home page - mess section is hidden
  redirect('/');
}

export async function generateMetadata({ params }) {
  return {
    title: 'Mess Services - StudXchange',
    description: 'View mess details and food menu',
  };
}

/* ORIGINAL CODE - HIDDEN BUT NOT DELETED
import { notFound } from 'next/navigation';
import { fetchMessById } from '../actions';
import LayoutWithSidebar from '@/components/LayoutWithSidebar';
import MessPageClient from '@/components/MessPageClient';

export default async function MessDetailsPage({ params }) {
  const { mess, seller, error } = await fetchMessById(params.id);

  if (error || !mess) {
    notFound();
  }

  // Debug logging
  console.log('🔍 Mess data received:', {
    name: mess.name,
    availableFoodsCount: mess.available_foods ? mess.available_foods.length : 0,
    currentMenu: mess.current_menu,
    averageRating: mess.average_rating,
    totalRatings: mess.total_ratings
  });

  return (
    <LayoutWithSidebar>
      <MessPageClient mess={mess} seller={seller} />
    </LayoutWithSidebar>
  );
}

export async function generateMetadata({ params }) {
  const { mess } = await fetchMessById(params.id);
  
  return {
    title: mess ? `${mess.name} - Mess Services` : 'Mess Details',
    description: mess?.description || 'View mess details and food menu',
  };
}
*/