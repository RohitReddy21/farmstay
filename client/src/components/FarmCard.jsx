import { Link } from 'react-router-dom';
import { MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import FavoriteButton from './FavoriteButton';

const FarmCard = ({ farm }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 transition-colors duration-200"
        >
            <div className="relative">
                <img
                    src={farm.images[0] || 'https://via.placeholder.com/400'}
                    alt={farm.title}
                    className="w-full h-44 md:h-48 object-cover"
                    loading="lazy"
                />
                <div className="absolute top-3 right-3">
                    <FavoriteButton farmId={farm._id} />
                </div>
            </div>
            <div className="p-4 md:p-5">
                <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white line-clamp-1 flex-1">{farm.title}</h3>
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap">₹{farm.price}/night</span>
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs md:text-sm mb-3 space-x-3">
                    <span className="flex items-center"><MapPin size={14} className="mr-1" /> {farm.location}</span>
                    <span className="flex items-center"><Users size={14} className="mr-1" /> {farm.capacity}</span>
                </div>
                <Link to={`/farm/${farm._id}`} className="block w-full text-center bg-secondary text-white py-2.5 md:py-2 rounded-lg hover:bg-blue-600 transition font-medium text-sm md:text-base">
                    View Details
                </Link>
            </div>
        </motion.div>
    );
};

export default FarmCard;
