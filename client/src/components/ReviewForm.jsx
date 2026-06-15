import { useEffect, useState } from 'react';
import axios from 'axios';
import { Camera, X } from 'lucide-react';
import StarRating from './StarRating';
import API_URL from '../config';

const ReviewForm = ({ farmId, bookingId, onReviewAdded, onReviewSubmitted, onCancel }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [photos, setPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const previews = photos.map((file) => ({
            name: file.name,
            url: URL.createObjectURL(file)
        }));
        setPhotoPreviews(previews);

        return () => previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    }, [photos]);

    const handlePhotoChange = (event) => {
        setPhotos(Array.from(event.target.files || []).slice(0, 4));
    };

    const removePhoto = (index) => {
        setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('farmId', farmId);
            if (bookingId) formData.append('bookingId', bookingId);
            formData.append('rating', String(rating));
            formData.append('comment', comment);
            photos.forEach((photo) => formData.append('photos', photo));

            const { data } = await axios.post(
                `${API_URL}/api/reviews`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            onReviewAdded?.(data);
            onReviewSubmitted?.(data);
        } catch (error) {
            console.error('Error submitting review:', error);
            alert(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-[#ead7b8] bg-white p-6 shadow-md">
            <h3 className="mb-4 text-xl font-bold text-gray-900">Write a Review</h3>

            <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">Rating</label>
                <StarRating rating={rating} setRating={setRating} size={32} editable />
            </div>

            <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">Your Experience</label>
                <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    required
                    rows="4"
                    placeholder="Tell us about your stay..."
                    className="w-full resize-none rounded-lg border border-gray-300 p-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary"
                />
            </div>

            <div className="mb-5">
                <label className="mb-2 block text-sm font-medium text-gray-700">Add stay photos</label>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d9c18e] bg-[#fffaf1] px-4 py-5 text-center transition hover:bg-[#f8efdf]">
                    <Camera className="mb-2 text-[#7a5527]" size={26} />
                    <span className="text-sm font-bold text-[#211b14]">Upload up to 4 photos</span>
                    <span className="text-xs text-[#8b7a66]">JPG, PNG, or WEBP from your stay</span>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoChange}
                        className="hidden"
                    />
                </label>

                {photoPreviews.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {photoPreviews.map((preview, index) => (
                            <div key={`${preview.name}-${index}`} className="relative overflow-hidden rounded-xl border border-[#ead7b8]">
                                <img src={preview.url} alt={preview.name} className="h-24 w-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removePhoto(index)}
                                    className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-red-600 shadow"
                                    aria-label="Remove photo"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-primary px-6 py-2 font-semibold text-white transition hover:bg-primary-800 disabled:bg-gray-300"
                >
                    {loading ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="rounded-lg bg-gray-100 px-6 py-2 font-semibold text-gray-700 transition hover:bg-gray-200"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default ReviewForm;
