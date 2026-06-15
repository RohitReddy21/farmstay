import { useState } from 'react';
import { User, X } from 'lucide-react';
import StarRating from './StarRating';

const ReviewList = ({ reviews }) => {
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    if (reviews.length === 0) {
        return (
            <div className="rounded-xl bg-gray-50 py-12 text-center">
                <p className="text-gray-500">No reviews yet. Be the first to review!</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review._id} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
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

                        <p className="leading-relaxed text-gray-700">{review.comment}</p>

                        {review.photos?.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {review.photos.map((photo, index) => (
                                    <button
                                        key={`${review._id}-${photo}`}
                                        type="button"
                                        onClick={() => setSelectedPhoto(photo)}
                                        className="overflow-hidden rounded-xl border border-[#ead7b8] bg-[#fffaf1]"
                                    >
                                        <img
                                            src={photo}
                                            alt={`Review photo ${index + 1}`}
                                            className="h-28 w-full object-cover transition duration-300 hover:scale-105"
                                            loading="lazy"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {selectedPhoto && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedPhoto(null)}>
                    <button
                        type="button"
                        onClick={() => setSelectedPhoto(null)}
                        className="absolute right-4 top-4 rounded-full bg-white p-2 text-[#211b14] shadow-lg"
                        aria-label="Close photo"
                    >
                        <X size={20} />
                    </button>
                    <img
                        src={selectedPhoto}
                        alt="Review full size"
                        className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
};

export default ReviewList;
