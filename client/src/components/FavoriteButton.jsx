import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const FavoriteButton = ({ farmId, size = 24, className = '' }) => {
    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            checkFavoriteStatus();
        }
    }, [user, farmId]);

    const checkFavoriteStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_URL}/api/favorites/check/${farmId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsFavorite(data.isFavorite);
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };

    const toggleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            alert('Please login to save favorites');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            if (isFavorite) {
                await axios.delete(`${API_URL}/api/favorites/${farmId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsFavorite(false);
            } else {
                await axios.post(`${API_URL}/api/favorites/${farmId}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsFavorite(true);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            alert(error.response?.data?.message || 'Failed to update favorites');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <button
            onClick={toggleFavorite}
            disabled={loading}
            className={`p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-all disabled:opacity-50 ${className}`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
            <Heart
                size={size}
                className={`transition-all ${isFavorite
                        ? 'text-red-500 fill-red-500'
                        : 'text-gray-400 hover:text-red-500'
                    }`}
            />
        </button>
    );
};

export default FavoriteButton;
