'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import LayoutWithSidebar from '@/components/LayoutWithSidebar';
import FoodItemsManager from '@/components/FoodItemsManager';
import GoogleMapPicker from '@/components/GoogleMapPicker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

export default function MessManagementPage() {
  const [user, setUser] = useState(null);
  const [mess, setMess] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMessForm, setShowMessForm] = useState(false);
  const [messFormData, setMessFormData] = useState({
    name: '',
    description: '',
    location: '',
    location_name: '',
    precise_location: null, // For GPS coordinates
    hostel_name: '',
    contact_phone: '',
    contact_email: '',
    meal_timings: {
      breakfast: '',
      lunch: '',
      dinner: ''
    },
    pricing_info: {
      breakfast: '',
      lunch: '',
      dinner: '',
      monthly: ''
    }
  });
  
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);
      setIsOwner(true); // Auto-approve all logged-in users to create mess

      // Check if user already has a mess
      const { data: existingMess, error: messError } = await supabase
        .from('mess')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (!messError && existingMess) {
        setMess(existingMess);
        
        // Populate form with existing data
        setMessFormData({
          name: existingMess.name || '',
          description: existingMess.description || '',
          location: existingMess.location || '',
          location_name: existingMess.location_name || '',
          precise_location: existingMess.location ? (typeof existingMess.location === 'string' ? JSON.parse(existingMess.location) : existingMess.location) : null,
          hostel_name: existingMess.hostel_name || '',
          contact_phone: existingMess.contact_phone || '',
          contact_email: existingMess.contact_email || '',
          meal_timings: existingMess.meal_timings || {
            breakfast: '',
            lunch: '',
            dinner: ''
          },
          pricing_info: existingMess.pricing_info || {
            breakfast: '',
            lunch: '',
            dinner: '',
            monthly: ''
          }
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error checking access:', error);
      setIsOwner(true); // Default to true so users can try to create mess
      setLoading(false);
    }
  };

  const handleLocationChange = (location) => {
    setMessFormData(prev => ({ 
      ...prev, 
      precise_location: location,
      location: JSON.stringify(location)
    }));
  };

  const handleMessFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const messData = {
        name: messFormData.name,
        description: messFormData.description,
        location: messFormData.precise_location ? JSON.stringify(messFormData.precise_location) : messFormData.location,
        hostel_name: messFormData.hostel_name,
        contact_phone: messFormData.contact_phone,
        contact_email: messFormData.contact_email,
        is_active: true,
        is_owner_verified: true,
        owner_id: user.id
      };

      // Only add optional fields if they have values
      if (messFormData.location_name) {
        messData.location_name = messFormData.location_name;
      }
      if (messFormData.meal_timings && Object.keys(messFormData.meal_timings).length > 0) {
        messData.meal_timings = messFormData.meal_timings;
      }
      if (messFormData.pricing_info && Object.keys(messFormData.pricing_info).length > 0) {
        messData.pricing_info = messFormData.pricing_info;
      }

      let result;
      
      if (mess) {
        // Update existing mess
        result = await supabase
          .from('mess')
          .update({
            ...messData,
            updated_at: new Date().toISOString()
          })
          .eq('id', mess.id)
          .eq('owner_id', user.id)
          .select()
          .single();
      } else {
        // Create new mess
        result = await supabase
          .from('mess')
          .insert({
            ...messData,
            available_foods: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
      }

      if (result.error) {
        console.error('Error saving mess:', result.error);
        alert('Error saving mess: ' + result.error.message);
        return;
      }

      setMess(result.data);
      setShowMessForm(false);
      alert('Mess saved successfully! ✅');
      
    } catch (error) {
      console.error('Error saving mess:', error);
      alert('Error saving mess. Please try again.');
    }
  };

  if (loading) {
    return (
      <LayoutWithSidebar>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </LayoutWithSidebar>
    );
  }

  if (!isOwner) {
    return (
      <LayoutWithSidebar>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Welcome to Mess Management
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              It looks like there was an issue setting up your mess owner account. 
              This could be a temporary issue. Please try refreshing the page.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Profile
              </button>
            </div>
          </div>
        </div>
      </LayoutWithSidebar>
    );
  }

  return (
    <LayoutWithSidebar>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              🍽️ Mess Management Portal
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your mess details and food menu
            </p>
          </div>

          {/* Mess Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Mess Overview
              </h2>
              <button
                onClick={() => setShowMessForm(!showMessForm)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                {mess ? 'Edit Details' : 'Setup Mess'}
              </button>
            </div>

            {mess ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Basic Info</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {mess.name}</p>
                    <p><strong>Location:</strong> {mess.location}</p>
                    <p><strong>Hostel:</strong> {mess.hostel_name}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Contact</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Phone:</strong> {mess.contact_phone}</p>
                    <p><strong>Email:</strong> {mess.contact_email}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Status</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Verified:</strong>{' '}
                      <span className={mess.is_owner_verified ? 'text-green-600' : 'text-red-600'}>
                        {mess.is_owner_verified ? 'Yes' : 'Pending'}
                      </span>
                    </p>
                    <p>
                      <strong>Active:</strong>{' '}
                      <span className={mess.is_active ? 'text-green-600' : 'text-red-600'}>
                        {mess.is_active ? 'Yes' : 'No'}
                      </span>
                    </p>
                    <p><strong>Food Items:</strong> {mess.available_foods?.length || 0}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🍽️</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Setup Your Mess
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete your mess setup to start managing your food menu
                </p>
              </div>
            )}

            {/* Mess Form */}
            {showMessForm && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <form onSubmit={handleMessFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mess Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={messFormData.name}
                        onChange={(e) => setMessFormData({...messFormData, name: e.target.value})}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter mess name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={messFormData.contact_phone}
                        onChange={(e) => setMessFormData({...messFormData, contact_phone: e.target.value})}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={messFormData.contact_email}
                      onChange={(e) => setMessFormData({...messFormData, contact_email: e.target.value})}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={messFormData.description}
                      onChange={(e) => setMessFormData({...messFormData, description: e.target.value})}
                      rows="3"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Describe your mess..."
                    />
                  </div>

                  {/* Location Picker */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FontAwesomeIcon icon={faLocationDot} className="mr-2 text-orange-500" />
                      Set Precise Location
                    </label>
                    {messFormData.precise_location && typeof messFormData.precise_location.lat === 'number' && typeof messFormData.precise_location.lng === 'number' ? (
                      <div className="mb-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-sm text-green-700 dark:text-green-300">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                        Location set: {messFormData.precise_location.lat.toFixed(4)}, {messFormData.precise_location.lng.toFixed(4)}
                      </div>
                    ) : (
                      <div className="mb-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-sm text-yellow-700 dark:text-yellow-300">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                        Please click on the map or use 'Get Current Location' to set your mess location
                      </div>
                    )}
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                      <GoogleMapPicker 
                        onLocationChange={handleLocationChange} 
                        initialPosition={messFormData.precise_location}
                        initialLocation={messFormData.location_name}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowMessForm(false)}
                      className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      {mess ? 'Update Mess' : 'Create Mess'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Food Management */}
          {mess && (
            <FoodItemsManager mess={mess} onUpdate={(updatedMess) => setMess(updatedMess)} />
          )}

        </div>
      </div>
    </LayoutWithSidebar>
  );
}