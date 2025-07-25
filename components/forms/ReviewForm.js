'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ReviewForm({ roomId, userId, onReviewSubmitted }) {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const supabase = createClientComponentClient();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0 || !review.trim()) {
            setError('Please provide a rating and a review.');
            return;
        }

        setSubmitting(true);
        setError(null);

        const { data, error: submissionError } = await supabase
            .from('room_reviews')
            .insert({
                room_id: roomId,
                commenter_id: userId,
                rating,
                review
            });

        if (submissionError) {
            setError('Failed to submit review. Please try again.');
            // console.error('Submission error:', submissionError);
        } else {
            setRating(0);
            setReview('');
            if (onReviewSubmitted) {
                onReviewSubmitted();
            }
        }
        setSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg shadow-inner mt-6">
            <h3 className="font-bold text-lg text-primary mb-4">Leave a Review</h3>
            <div className="mb-4">
                <label className="block text-primary mb-2">Your Rating</label>
                <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button 
                            type="button"
                            key={star} 
                            onClick={() => setRating(star)} 
                            className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                            ★
                        </button>
                    ))}
                </div>
            </div>
            <div className="mb-4">
                <label className="block text-primary mb-2">Your Review</label>
                <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Share your experience..."
                    className="w-full p-2 border rounded-lg h-28"
                />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button type="submit" disabled={submitting} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-secondary disabled:bg-gray-400">
                {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
}
