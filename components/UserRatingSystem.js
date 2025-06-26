'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';

export default function UserRatingSystem({ 
    ratedUserId, 
    listingId, 
    transactionType = 'sale',
    onRatingSubmitted,
    showExistingRatings = true,
    compact = false 
}) {
    const [userProfile, setUserProfile] = useState(null);
    const [existingRatings, setExistingRatings] = useState([]);
    const [canRate, setCanRate] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [newRating, setNewRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        if (ratedUserId) {
            fetchUserProfile();
            fetchExistingRatings();
            checkCanRate();
        }
    }, [ratedUserId, listingId]);

    const fetchUserProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', ratedUserId)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching user profile:', error);
                return;
            }

            setUserProfile(data);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const fetchExistingRatings = async () => {
        if (!showExistingRatings) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('user_ratings')
                .select(`
                    *,
                    rater_profile:user_profiles!rater_user_id(display_name)
                `)
                .eq('rated_user_id', ratedUserId)
                .order('created_at', { ascending: false })
                .limit(compact ? 3 : 10);

            if (error) throw error;

            setExistingRatings(data || []);
        } catch (error) {
            console.error('Error fetching ratings:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkCanRate = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user || user.id === ratedUserId) {
                setCanRate(false);
                return;
            }

            // Check if user has already rated this seller for this listing
            if (listingId) {
                const { data: existingRating } = await supabase
                    .from('user_ratings')
                    .select('id')
                    .eq('rated_user_id', ratedUserId)
                    .eq('rater_user_id', user.id)
                    .eq('listing_id', listingId)
                    .single();

                setCanRate(!existingRating);
            } else {
                setCanRate(true);
            }
        } catch (error) {
            console.error('Error checking rating permission:', error);
            setCanRate(false);
        }
    };

    const submitRating = async () => {
        if (!newRating || submitting) return;

        setSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { error } = await supabase
                .from('user_ratings')
                .insert({
                    rated_user_id: ratedUserId,
                    rater_user_id: user.id,
                    listing_id: listingId,
                    rating: newRating,
                    review_text: reviewText.trim() || null,
                    transaction_type: transactionType
                });

            if (error) throw error;

            // Create notification for the rated user
            await supabase
                .from('notifications')
                .insert({
                    user_id: ratedUserId,
                    type: 'system',
                    title: 'New Rating Received',
                    message: `You received a ${newRating}-star rating${reviewText ? ' with a review' : ''}.`,
                    action_url: '/profile'
                });

            setShowRatingModal(false);
            setNewRating(0);
            setReviewText('');
            setCanRate(false);
            
            // Refresh data
            fetchUserProfile();
            fetchExistingRatings();

            if (onRatingSubmitted) {
                onRatingSubmitted();
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('Failed to submit rating. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating, size = 'w-4 h-4') => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <FontAwesomeIcon key={i} icon={faStar} className={`${size} text-yellow-400`} />
            );
        }

        if (hasHalfStar) {
            stars.push(
                <FontAwesomeIcon key="half" icon={faStarHalfAlt} className={`${size} text-yellow-400`} />
            );
        }

        const remainingStars = 5 - Math.ceil(rating);
        for (let i = 0; i < remainingStars; i++) {
            stars.push(
                <FontAwesomeIcon key={`empty-${i}`} icon={faStar} className={`${size} text-gray-300`} />
            );
        }

        return stars;
    };

    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 30) return `${diffInDays} days ago`;
        if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
        return `${Math.floor(diffInDays / 365)} years ago`;
    };

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                {userProfile?.average_rating > 0 ? (
                    <>
                        <div className="flex items-center">
                            {renderStars(userProfile.average_rating)}
                        </div>
                        <span className="text-sm text-gray-600">
                            {userProfile.average_rating.toFixed(1)} ({userProfile.total_ratings})
                        </span>
                        {userProfile.verified_seller && (
                            <span className="badge badge-success text-xs">Verified</span>
                        )}
                    </>
                ) : (
                    <span className="text-sm text-gray-500">No ratings yet</span>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* User Rating Summary */}
            <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Seller Rating</h3>
                    {canRate && (
                        <button
                            onClick={() => setShowRatingModal(true)}
                            className="btn-primary btn-sm"
                        >
                            Rate Seller
                        </button>
                    )}
                </div>

                {userProfile?.average_rating > 0 ? (
                    <div className="flex items-center gap-4 mb-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                                {userProfile.average_rating.toFixed(1)}
                            </div>
                            <div className="flex items-center justify-center mb-1">
                                {renderStars(userProfile.average_rating, 'w-5 h-5')}
                            </div>
                            <div className="text-sm text-gray-600">
                                {userProfile.total_ratings} rating{userProfile.total_ratings !== 1 ? 's' : ''}
                            </div>
                        </div>
                        
                        <div className="flex-1">
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map(star => {
                                    const count = existingRatings.filter(r => r.rating === star).length;
                                    const percentage = userProfile.total_ratings > 0 ? (count / userProfile.total_ratings) * 100 : 0;
                                    
                                    return (
                                        <div key={star} className="flex items-center gap-2 text-sm">
                                            <span className="w-3">{star}</span>
                                            <FontAwesomeIcon icon={faStar} className="w-3 h-3 text-yellow-400" />
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-gray-600 w-8">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <FontAwesomeIcon icon={faStar} className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500">No ratings yet</p>
                        <p className="text-sm text-gray-400">Be the first to rate this seller</p>
                    </div>
                )}

                {userProfile?.verified_seller && (
                    <div className="flex items-center gap-2 text-sm text-success-600">
                        <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                        <span>Verified Seller</span>
                    </div>
                )}
            </div>

            {/* Reviews List */}
            {showExistingRatings && existingRatings.length > 0 && (
                <div className="card p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Recent Reviews ({existingRatings.length})
                    </h4>
                    
                    <div className="space-y-4">
                        {existingRatings.map((rating) => (
                            <div key={rating.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-medium text-primary-600">
                                                {rating.rater_profile?.display_name?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {rating.rater_profile?.display_name || 'Anonymous User'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {renderStars(rating.rating)}
                                                <span className="text-sm text-gray-500">
                                                    {formatTimeAgo(rating.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {rating.review_text && (
                                    <p className="text-gray-700 text-sm ml-11">
                                        {rating.review_text}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Rating Modal */}
            {showRatingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="card max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Rate This Seller</h3>
                            <button
                                onClick={() => setShowRatingModal(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                            >
                                <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Your Rating
                            </label>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setNewRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="p-1 transition-transform hover:scale-110"
                                    >
                                        <FontAwesomeIcon
                                            icon={faStar}
                                            className={`w-8 h-8 transition-colors ${
                                                star <= (hoverRating || newRating)
                                                    ? 'text-yellow-400'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            {newRating > 0 && (
                                <p className="text-sm text-gray-600 mt-1">
                                    {newRating === 5 ? 'Excellent!' :
                                     newRating === 4 ? 'Good' :
                                     newRating === 3 ? 'Average' :
                                     newRating === 2 ? 'Poor' : 'Very Poor'}
                                </p>
                            )}
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Review (Optional)
                            </label>
                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Share your experience with this seller..."
                                rows={3}
                                className="input-base w-full resize-none"
                                maxLength={500}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {reviewText.length}/500 characters
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRatingModal(false)}
                                className="btn-secondary flex-1"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitRating}
                                disabled={!newRating || submitting}
                                className="btn-primary flex-1"
                            >
                                {submitting ? 'Submitting...' : 'Submit Rating'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}