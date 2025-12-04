import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, MapPin, Users, Trash2 } from 'lucide-react';
import API_URL from '../config';

const Favorites = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        fetchFavorites();
    }, [user, navigate]);

    const fetchFavorites = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_URL}/api/favorites`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFavorites(data);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (farmId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/favorites/${farmId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state
            setFavorites(favorites.filter(fav => fav.farm._id !== farmId));
        } catch (error) {
            console.error('Error removing favorite:', error);
            alert('Failed to remove from favorites');
        }
    };

    if (loading) {
        return <div className="text-center py-20">Loading favorites...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
                <p className="text-gray-600">Farms you've saved for later</p>
            </div>

            {favorites.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl">
                    <Heart size={64} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">No favorites yet</h2>
                    <p className="text-gray-500 mb-6">Start exploring and save your favorite farms!</p>
                    <button
                        onClick={() => navigate('/farms')}
                        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-600 transition-all shadow-md"
                    >
                        Explore Farms
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((favorite) => {
                        const farm = favorite.farm;
                        return (
                            <div
                                key={favorite._id}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer group"
                            >
                                {/* Farm Image */}
                                <div
                                    className="relative h-48 overflow-hidden"
                                    onClick={() => navigate(`/farm/${farm._id}`)}
                                >
                                    <img
                                        src={farm.images?.[0] || 'https://via.placeholder.com/400'}
                                        alt={farm.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />

                                    {/* Remove Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveFavorite(farm._id);
                                        }}
                                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-all group/btn"
                                        title="Remove from favorites"
                                    >
                                        <Heart
                                            size={20}
                                            className="text-red-500 fill-red-500 group-hover/btn:scale-110 transition-transform"
                                        />
                                    </button>
                                </div>

                                {/* Farm Details */}
                                <div
                                    className="p-4"
                                    onClick={() => navigate(`/farm/${farm._id}`)}
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                                        {farm.title}
                                    </h3>

                                    <div className="flex items-center text-gray-600 text-sm mb-3">
                                        <MapPin size={16} className="mr-1" />
                                        <span className="line-clamp-1">{farm.location}</span>
                                    </div>

                                    <div className="flex items-center text-gray-600 text-sm mb-3">
                                        <Users size={16} className="mr-1" />
                                        <span>Up to {farm.capacity} guests</span>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <div>
                                            <span className="text-2xl font-bold text-primary">₹{farm.price}</span>
                                            <span className="text-gray-500 text-sm ml-1">/ night</span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/farm/${farm._id}`);
                                            }}
                                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-600 transition-all text-sm font-semibold"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Favorites;
