import API_URL from '../config';

const Farms = () => {
    // ... state ...

    // ... useEffect ...

    const fetchFarms = async () => {
        try {
            const query = new URLSearchParams(filters).toString();
            const { data } = await axios.get(`${API_URL}/api/farms?${query}`);
            setFarms(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const applyFilters = (e) => {
        e.preventDefault();
        fetchFarms();
    };

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-gray-800">Find Your Perfect Farm Stay</h1>

            {/* Filters */}
            <form onSubmit={applyFilters} className="bg-white p-6 rounded-2xl shadow-md grid md:grid-cols-5 gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input type="text" name="location" placeholder="e.g. California" onChange={handleFilterChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                    <input type="number" name="minPrice" placeholder="0" onChange={handleFilterChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                    <input type="number" name="maxPrice" placeholder="1000" onChange={handleFilterChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                    <input type="number" name="capacity" placeholder="1" onChange={handleFilterChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <button type="submit" className="bg-primary text-white py-2 px-4 rounded-lg hover:bg-green-600 transition font-semibold">
                    Search
                </button>
            </form>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-20">Loading farms...</div>
            ) : (
                <div className="grid md:grid-cols-3 gap-8">
                    {farms.map((farm) => (
                        <motion.div
                            key={farm._id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100"
                        >
                            <img src={farm.images[0] || 'https://via.placeholder.com/400'} alt={farm.title} className="w-full h-56 object-cover" />
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{farm.title}</h3>
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">${farm.price}/night</span>
                                </div>
                                <div className="flex items-center text-gray-500 text-sm mb-4 space-x-4">
                                    <span className="flex items-center"><MapPin size={16} className="mr-1" /> {farm.location}</span>
                                    <span className="flex items-center"><Users size={16} className="mr-1" /> Up to {farm.capacity}</span>
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
    );
};

export default Farms;

