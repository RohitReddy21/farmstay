import { Star } from 'lucide-react';

const StarRating = ({ rating, setRating, size = 20, editable = false }) => {
    const stars = [1, 2, 3, 4, 5];

    return (
        <div className="flex items-center gap-1">
            {stars.map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!editable}
                    onClick={() => editable && setRating(star)}
                    className={`${editable ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-all`}
                >
                    <Star
                        size={size}
                        className={`${star <= rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                    />
                </button>
            ))}
        </div>
    );
};

export default StarRating;
