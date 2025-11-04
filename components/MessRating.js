'use client';

import React, { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function MessRating({ mess, currentUser }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(null);
  
  const supabase = createSupabaseBrowserClient();

  // Check if user has already rated
  const checkUserRating = async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('mess_ratings')
        .select('rating')
        .eq('mess_id', mess.id)
        .eq('user_id', currentUser.id)
        .single();
      
      if (data) {
        setUserRating(data.rating);
        setRating(data.rating);
      }
    } catch (error) {
      console.log('No existing rating found');
    }
  };

  // Submit rating
  const submitRating = async (selectedRating) => {
    if (!currentUser) {
      alert('Please log in to rate this mess');
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert or update rating
      const { error } = await supabase
        .from('mess_ratings')
        .upsert({
          mess_id: mess.id,
          user_id: currentUser.id,
          rating: selectedRating,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      setUserRating(selectedRating);
      setRating(selectedRating);
      
      // Show success message
      alert(`✅ Thank you for rating! You gave ${selectedRating} star${selectedRating > 1 ? 's' : ''}`);
      
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarIcon = ({ filled, hovered, onClick, onMouseEnter, onMouseLeave }) => (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={isSubmitting}
      className={`text-2xl transition-colors duration-200 ${
        filled || hovered
          ? 'text-yellow-400' 
          : 'text-gray-300 dark:text-gray-600'
      } hover:text-yellow-400 disabled:opacity-50`}
    >
      ⭐
    </button>
  );

  useEffect(() => {
    checkUserRating();
  }, [mess.id, currentUser]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
            Rate this Mess
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Share your experience with others
          </p>
        </div>
        
        {/* Average Rating Display */}
        {mess.average_rating && (
          <div className="text-right">
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400 text-lg">⭐</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {mess.average_rating.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {mess.total_ratings} rating{mess.total_ratings !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Star Rating Input */}
      <div className="flex items-center space-x-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            filled={star <= (userRating || rating)}
            hovered={star <= hoveredRating}
            onClick={() => submitRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
          />
        ))}
      </div>

      {/* Status Messages */}
      {userRating && (
        <div className="text-sm text-green-600 dark:text-green-400 mb-2">
          ✅ You rated this mess {userRating} star{userRating > 1 ? 's' : ''}
        </div>
      )}

      {isSubmitting && (
        <div className="text-sm text-orange-600 dark:text-orange-400 flex items-center">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-600 mr-2"></div>
          Submitting rating...
        </div>
      )}

      {!currentUser && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Please log in to rate this mess
        </div>
      )}
    </div>
  );
}