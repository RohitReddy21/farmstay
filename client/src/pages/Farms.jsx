import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MapPin, Users, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../config';
import FavoriteButton from '../components/FavoriteButton';

const Farms = () => {
    const [farms, setFarms] = useState([]);
    const [filteredFarms, setFilteredFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        location: '',
        minPrice: 0,
        maxPrice: 10000,
        capacity: '',
        amenities: [],
        sortBy: 'default'
    });

    const amenitiesList = ['WiFi', 'Pool', 'Parking', 'Kitchen', 'AC', 'Pets Allowed', 'Garden', 'BBQ'];

    useEffect(() => {
        fetchFarms();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [farms, filters]);

    const fetchFarms = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/farms`);
            setFarms(data);
            setFilteredFarms(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...farms];

        // Location filter
        if (filters.location) {
            result = result.filter(farm =>
                farm.location.toLowerCase().includes(filters.location.toLowerCase())
            );
        }

        // Price filter
        result = result.filter(farm =>
            farm.price >= filters.minPrice && farm.price <= filters.maxPrice
        );

        // Capacity filter
        if (filters.capacity) {
            result = result.filter(farm => farm.capacity >= parseInt(filters.capacity));
        }

        // Amenities filter
        if (filters.amenities.length > 0) {
            result = result.filter(farm =>
                filters.amenities.every(amenity =>
                    farm.amenities?.some(a => a.toLowerCase() === amenity.toLowerCase())
                )
            );
        }

        // Sort
        switch (filters.sortBy) {
            case 'price-low':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'capacity':
                result.sort((a, b) => b.capacity - a.capacity);
                break;
            default:
                break;
        }

        setFilteredFarms(result);
    };

    const handleAmenityToggle = (amenity) => {
        setFilters(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const clearFilters = () => {
        setFilters({
            location: '',
            minPrice: 0,
            maxPrice: 10000,
            capacity: '',
            amenities: [],
            sortBy: 'default'
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Find Your Perfect Farm Stay</h1>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="md:hidden bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <SlidersHorizontal size={20} />
                    Filters
                </button>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <AnimatePresence>
                    {(showFilters || window.innerWidth >= 768) && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="md:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md h-fit space-y-6"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Filters</h2>
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-primary hover:text-green-600"
                                >
                                    Clear All
                                </button>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                                <input
                                    type="text"
                                    value={filters.location}
                                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                    placeholder="e.g. California"
                                    className="w-full p-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Price Range: ₹{filters.minPrice} - ₹{filters.maxPrice}
                                </label>
                                <div className="space-y-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max="10000"
                                        step="100"
                                        value={filters.minPrice}
                                        onChange={(e) => setFilters({ ...filters, minPrice: parseInt(e.target.value) })}
                                        className="w-full"
                                    />
                                    <input
                                        type="range"
                                        min="0"
                                        max="10000"
                                        step="100"
                                        value={filters.maxPrice}
                                        onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Capacity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min Guests</label>
                                <input
                                    type="number"
                                    value={filters.capacity}
                                    onChange={(e) => setFilters({ ...filters, capacity: e.target.value })}
                                    placeholder="1"
                                    min="1"
                                    className="w-full p-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            {/* Amenities */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amenities</label>
                                <div className="space-y-2">
                                    {amenitiesList.map(amenity => (
                                        <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filters.amenities.includes(amenity)}
                                                onChange={() => handleAmenityToggle(amenity)}
                                                className="w-4 h-4 text-primary focus:ring-primary rounded"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{amenity}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Sort */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                    className="w-full p-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="default">Default</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="capacity">Capacity</option>
                                </select>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Farms Grid */}
                <div className="md:col-span-3">
                    <div className="mb-4 text-gray-600 dark:text-gray-400">
                        Showing {filteredFarms.length} of {farms.length} farms
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-gray-600 dark:text-gray-400">Loading farms...</div>
                    ) : filteredFarms.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">No farms match your filters</p>
                            <button
                                onClick={clearFilters}
                                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-600"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredFarms.map((farm) => (
                                <motion.div
                                    key={farm._id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ y: -5 }}
                                    className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 transition-colors duration-200"
                                >
                                    <div className="relative">
                                        <img src={farm.images[0] || 'https://via.placeholder.com/400'} alt={farm.title} className="w-full h-48 object-cover" />
                                        <div className="absolute top-3 right-3">
                                            <FavoriteButton farmId={farm._id} />
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{farm.title}</h3>
                                            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full font-medium">₹{farm.price}/night</span>
                                        </div>
                                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-3 space-x-3">
                                            <span className="flex items-center"><MapPin size={14} className="mr-1" /> {farm.location}</span>
                                            <span className="flex items-center"><Users size={14} className="mr-1" /> {farm.capacity}</span>
                                        </div>
                                        <Link to={`/farm/${farm._id}`} className="block w-full text-center bg-secondary text-white py-2 rounded-lg hover:bg-blue-600 transition font-medium">
                                            View Details
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Farms;
