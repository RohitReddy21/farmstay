import { useState } from 'react';
import axios from 'axios';
import StarRating from './StarRating';
import API_URL from '../config';

const ReviewForm = ({ farmId, bookingId, onReviewAdded, onCancel }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(
                `${API_URL}/api/reviews`,
                { farmId, bookingId, rating, comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onReviewAdded(data);
        } catch (error) {
            console.error('Error submitting review:', error);
            alert(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Write a Review</h3>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <StarRating rating={rating} setRating={setRating} size={32} editable={true} />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Experience</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    rows="4"
                    placeholder="Tell us about your stay..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                />
            </div>

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-green-600 transition font-semibold disabled:bg-gray-300"
                >
                    {loading ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default ReviewForm;
