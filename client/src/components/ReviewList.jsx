import { User } from 'lucide-react';
import StarRating from './StarRating';

const ReviewList = ({ reviews }) => {
    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-gray-500">No reviews yet. Be the first to review!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
                                {review.user?.name?.charAt(0).toUpperCase() || <User size={20} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">{review.user?.name || 'Anonymous'}</h4>
                                <p className="text-xs text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                        <StarRating rating={review.rating} size={16} />
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
            ))}
        </div>
    );
};

export default ReviewList;
