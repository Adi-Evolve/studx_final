'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitReview } from '@/app/actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as faSolidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as faRegularStar } from '@fortawesome/free-regular-svg-icons';

const StarRating = ({ rating, setRating }) => {
    return (
        <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesomeIcon
                    key={star}
                    icon={rating >= star ? faSolidStar : faRegularStar}
                    className={`cursor-pointer text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                    onClick={() => setRating(star)}
                />
            ))}
        </div>
    );
};

export default function Reviews({ roomId, userId, initialReviews = [] }) {
    const [reviews, setReviews] = useState(initialReviews);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment || !rating) {
            setError('Please provide a rating and a comment.');
            return;
        }
        if (!userId) {
            setError('You must be logged in to leave a review.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        const result = await submitReview({ roomId, rating, comment });

        if (result.error) {
            setError(result.error.message);
        } else {
            // Optimistically update the UI and refresh from server
            setReviews([result.data, ...reviews]);
            setComment('');
            setRating(5);
            router.refresh(); // Re-fetch server-side data
        }

        setIsSubmitting(false);
    };

    return (
        <div className="mt-12">
            <h2 className="text-3xl font-bold text-primary mb-8">Reviews & Ratings</h2>
            
            {userId && (
                <div className="mb-10 bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-semibold text-primary mb-4">Leave a Review</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Your Rating</label>
                            <StarRating rating={rating} setRating={setRating} />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="comment" className="block text-gray-700 text-sm font-bold mb-2">Your Comment</label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows="4"
                                className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Share your experience with the room, owner, and amenities..."
                                required
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-accent hover:bg-primary text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 disabled:bg-gray-400"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                </div>
            )}

            <div className="space-y-6">
                {reviews.length > 0 ? reviews.map(review => (
                    <div key={review.id} className="bg-white p-5 rounded-lg shadow-sm">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <img 
                                    className="w-10 h-10 rounded-full"
                                    src={review.user_avatar_url || `https://i.pravatar.cc/40?u=${review.user_id}`}
                                    alt={review.user_name || 'User'}
                                />
                            </div>
                            <div className="ml-4 flex-grow">
                                <div className="flex items-center justify-between">
                                    <p className="font-bold text-primary">{review.user_name || 'Anonymous'}</p>
                                    <div className="flex items-center">
                                        <span className="text-yellow-500 font-bold mr-1">{review.rating}.0</span>
                                        <FontAwesomeIcon icon={faSolidStar} className="text-yellow-400" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">{new Date(review.created_at).toLocaleDateString()}</p>
                                <p className="text-gray-700">{review.comment}</p>
                            </div>
                        </div>
                    </div>
                )) : <p className="text-center text-gray-500 py-8">No reviews yet. Be the first to leave one!</p>}
            </div>
        </div>
    );
}
