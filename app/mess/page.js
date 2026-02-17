// HIDDEN: This page is temporarily hidden but not deleted
// To re-enable, restore the original mess services listing code

import { redirect } from 'next/navigation';

export default function MessPage() {
  // Redirect to home page - mess section is hidden
  redirect('/');
}

export const metadata = {
  title: 'Mess Services - StudXchange',
  description: 'Find verified mess services and delicious homemade food near your campus.',
};