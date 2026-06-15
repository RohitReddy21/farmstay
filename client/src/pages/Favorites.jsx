import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowUpDown, Heart, MapPin, Search, Trash2, Users } from 'lucide-react';
import API_URL from '../config';
import { optimizeImageUrl } from '../utils/imageOptimization';

const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;

const getLowestPrice = (farm = {}) => {
    const variationPrices = (farm.variations || [])
        .map((variation) => Number(variation.price || 0))
        .filter((price) => price > 0);

    if (variationPrices.length) return Math.min(...variationPrices);
    return Number(farm.price || 0);
};

const Favorites = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('all');
    const [sortBy, setSortBy] = useState('recent');

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
            setFavorites(data.filter((favorite) => favorite.farm));
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

            setFavorites((current) => current.filter((favorite) => favorite.farm?._id !== farmId));
        } catch (error) {
            console.error('Error removing favorite:', error);
            alert('Failed to remove from favorites');
        }
    };

    const locations = useMemo(() => {
        const values = favorites
            .map((favorite) => favorite.farm?.location)
            .filter(Boolean);
        return ['all', ...Array.from(new Set(values))];
    }, [favorites]);

    const filteredFavorites = useMemo(() => {
        const text = searchTerm.trim().toLowerCase();
        const filtered = favorites.filter((favorite) => {
            const farm = favorite.farm || {};
            const searchable = `${farm.title || ''} ${farm.location || ''}`.toLowerCase();
            const matchesSearch = !text || searchable.includes(text);
            const matchesLocation = locationFilter === 'all' || farm.location === locationFilter;
            return matchesSearch && matchesLocation;
        });

        return [...filtered].sort((a, b) => {
            if (sortBy === 'price_low') return getLowestPrice(a.farm) - getLowestPrice(b.farm);
            if (sortBy === 'price_high') return getLowestPrice(b.farm) - getLowestPrice(a.farm);
            if (sortBy === 'capacity') return Number(b.farm?.capacity || 0) - Number(a.farm?.capacity || 0);
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }, [favorites, locationFilter, searchTerm, sortBy]);

    const stats = useMemo(() => {
        const prices = favorites.map((favorite) => getLowestPrice(favorite.farm)).filter(Boolean);
        return {
            saved: favorites.length,
            locations: Math.max(0, locations.length - 1),
            lowestPrice: prices.length ? Math.min(...prices) : 0
        };
    }, [favorites, locations.length]);

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="grid gap-6 md:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="h-80 animate-pulse rounded-3xl bg-[#f1e3cc]" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="mb-8 rounded-3xl border border-[#ead7b8] bg-gradient-to-br from-[#fffaf1] to-[#f4ead8] p-6 shadow-sm md:p-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#7a5527]">
                            <Heart size={14} className="fill-red-500 text-red-500" />
                            Wishlist
                        </div>
                        <h1 className="text-3xl font-black text-[#211b14] md:text-4xl">Saved Farm Stays</h1>
                        <p className="mt-2 max-w-2xl text-[#645747]">
                            Keep your favorite stays in one place, compare them quickly, and open details when you are ready to book.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-2xl bg-white px-4 py-3">
                            <p className="text-2xl font-black text-[#211b14]">{stats.saved}</p>
                            <p className="text-xs font-bold uppercase text-[#8b7a66]">Saved</p>
                        </div>
                        <div className="rounded-2xl bg-white px-4 py-3">
                            <p className="text-2xl font-black text-[#211b14]">{stats.locations}</p>
                            <p className="text-xs font-bold uppercase text-[#8b7a66]">Areas</p>
                        </div>
                        <div className="rounded-2xl bg-white px-4 py-3">
                            <p className="text-2xl font-black text-[#211b14]">{stats.lowestPrice ? formatCurrency(stats.lowestPrice) : '-'}</p>
                            <p className="text-xs font-bold uppercase text-[#8b7a66]">From</p>
                        </div>
                    </div>
                </div>
            </div>

            {favorites.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#ead7b8] bg-[#fffaf1] py-16 text-center">
                    <Heart size={64} className="mx-auto mb-4 text-gray-300" />
                    <h2 className="mb-2 text-2xl font-bold text-gray-700">No saved stays yet</h2>
                    <p className="mb-6 text-gray-500">Tap the heart on any farm stay to save it here.</p>
                    <button
                        onClick={() => navigate('/farms')}
                        className="rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-md transition-all hover:bg-primary-800"
                    >
                        Explore Farms
                    </button>
                </div>
            ) : (
                <>
                    <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
                        <label className="flex items-center gap-2 rounded-2xl border border-[#ead7b8] bg-white px-4 py-3">
                            <Search size={18} className="text-[#7a5527]" />
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search saved stays"
                                className="w-full bg-transparent text-sm font-semibold outline-none"
                            />
                        </label>

                        <label className="flex items-center gap-2 rounded-2xl border border-[#ead7b8] bg-white px-4 py-3">
                            <MapPin size={18} className="text-[#7a5527]" />
                            <select
                                value={locationFilter}
                                onChange={(event) => setLocationFilter(event.target.value)}
                                className="bg-transparent text-sm font-bold outline-none"
                            >
                                {locations.map((location) => (
                                    <option key={location} value={location}>
                                        {location === 'all' ? 'All areas' : location}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex items-center gap-2 rounded-2xl border border-[#ead7b8] bg-white px-4 py-3">
                            <ArrowUpDown size={18} className="text-[#7a5527]" />
                            <select
                                value={sortBy}
                                onChange={(event) => setSortBy(event.target.value)}
                                className="bg-transparent text-sm font-bold outline-none"
                            >
                                <option value="recent">Recently saved</option>
                                <option value="price_low">Lowest price</option>
                                <option value="price_high">Highest price</option>
                                <option value="capacity">Most guests</option>
                            </select>
                        </label>
                    </div>

                    {filteredFavorites.length === 0 ? (
                        <div className="rounded-2xl border border-[#ead7b8] bg-white p-10 text-center text-[#645747]">
                            No saved stays match this filter.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredFavorites.map((favorite) => {
                                const farm = favorite.farm;
                                const price = getLowestPrice(farm);
                                return (
                                    <article
                                        key={favorite._id}
                                        className="group overflow-hidden rounded-3xl border border-[#ead7b8] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                                    >
                                        <div className="relative h-56 overflow-hidden" onClick={() => navigate(`/farm/${farm._id}`)}>
                                            <img
                                                src={optimizeImageUrl(farm.images?.[0], { width: 620, height: 420 }) || 'https://via.placeholder.com/400'}
                                                alt={farm.title}
                                                loading="lazy"
                                                decoding="async"
                                                className="h-full w-full cursor-pointer object-cover transition duration-500 group-hover:scale-105"
                                            />
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleRemoveFavorite(farm._id);
                                                }}
                                                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-500 shadow-lg transition hover:bg-red-50"
                                                title="Remove from wishlist"
                                                aria-label="Remove from wishlist"
                                            >
                                                <Heart size={20} className="fill-red-500" />
                                            </button>
                                            <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">
                                                Saved {new Date(favorite.createdAt).toLocaleDateString('en-IN')}
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            <h3 className="line-clamp-1 text-xl font-black text-[#211b14]">{farm.title}</h3>
                                            <div className="mt-3 flex items-center text-sm font-medium text-[#645747]">
                                                <MapPin size={16} className="mr-1.5 text-[#7a5527]" />
                                                <span className="line-clamp-1">{farm.location}</span>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm font-medium text-[#645747]">
                                                <Users size={16} className="mr-1.5 text-[#7a5527]" />
                                                <span>Up to {farm.capacity} guests</span>
                                            </div>

                                            <div className="mt-5 flex items-center justify-between border-t border-[#f1dfc6] pt-4">
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8b7a66]">From</p>
                                                    <p className="text-2xl font-black text-primary">{formatCurrency(price)} <span className="text-sm font-semibold text-[#8b7a66]">/ night</span></p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleRemoveFavorite(farm._id)}
                                                        className="rounded-xl border border-[#ead7b8] p-3 text-[#7a5527] transition hover:bg-[#fff4e2]"
                                                        aria-label="Remove"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/farm/${farm._id}`)}
                                                        className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-800"
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Favorites;
