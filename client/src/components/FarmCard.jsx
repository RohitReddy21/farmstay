import { Link } from 'react-router-dom';
import { MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import FavoriteButton from './FavoriteButton';

const FarmCard = ({ farm }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = farm.images || [];

    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 4000); // Change image every 4 seconds

        return () => clearInterval(interval);
    }, [images.length]);

    const variations = farm.variations || [];
    const hasVariations = variations.length > 0;
    const variationPrices = variations.map((variation) => Number(variation.price)).filter(Boolean);
    const startingPrice = variationPrices.length > 0 ? Math.min(...variationPrices) : farm.price;
    const maxCapacity = hasVariations
        ? Math.max(...variations.map((variation) => Number(variation.capacity) || 0))
        : farm.capacity;
    const cottageCount = variations.reduce((count, variation) => count + (variation.availableCottages?.length || 0), 0);
    const sharedCount = variations.filter((variation) => variation.label?.toLowerCase().includes('shared')).length;
    const coupleCount = variations.filter((variation) => variation.label?.toLowerCase().includes('couple')).length;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg transition-colors duration-200 dark:border-gray-700 dark:bg-gray-800 md:rounded-2xl"
        >
            <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-700">
                <motion.img
                    key={currentImageIndex}
                    src={images[currentImageIndex] || 'https://via.placeholder.com/400'}
                    alt={farm.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="h-44 w-full object-cover md:h-48"
                    loading="lazy"
                />
                {images.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`h-1.5 rounded-full transition-all ${
                                    index === currentImageIndex
                                        ? 'w-4 bg-white'
                                        : 'w-1.5 bg-white/50 hover:bg-white/75'
                                }`}
                                aria-label={`Go to image ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
                <div className="absolute top-3 right-3">
                    <FavoriteButton farmId={farm._id} />
                </div>
            </div>
            <div className="flex flex-1 flex-col p-4 md:p-5">
                <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 flex-1 text-base font-bold text-gray-900 dark:text-white md:text-lg">{farm.title}</h3>
                    <span className="whitespace-nowrap rounded-full bg-[#edf7ee] px-2.5 py-1 text-xs font-bold text-[#2f6b3a] dark:bg-green-900 dark:text-green-200">
                        {hasVariations ? 'From ' : ''}₹{startingPrice}/night
                    </span>
                </div>
                <div className="mb-3 flex flex-wrap gap-2">
                    {farm.subCategory && (
                        <span className="rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {farm.subCategory}
                        </span>
                    )}
                    {farm.availability && (
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            farm.availability === 'All Days'
                                ? 'border-purple-100 bg-purple-50 text-purple-600 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                : 'border-orange-100 bg-orange-50 text-orange-600 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                        }`}>
                            {farm.availability}
                        </span>
                    )}
                </div>
                <div className="mb-3 flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400 md:text-sm">
                    <span className="flex min-w-0 items-center">
                        <MapPin size={14} className="mr-1 shrink-0" />
                        <span className="truncate">{farm.location}</span>
                    </span>
                    <span className="flex items-center">
                        <Users size={14} className="mr-1" />
                        {maxCapacity}
                    </span>
                </div>
                {hasVariations && (
                    <div className="mb-4 rounded-xl border border-[#e7dbc9] bg-[#fbf7ef] p-3 dark:border-gray-700 dark:bg-gray-900/40">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-[#7a5527] dark:text-amber-300">
                                    Cottage choices
                                </p>
                                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                    {cottageCount} cottages available
                                </p>
                            </div>
                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#7a5527] shadow-sm dark:bg-gray-800 dark:text-amber-200">
                                {variations.length} options
                            </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                            {sharedCount > 0 && <span className="rounded-full bg-white px-2 py-1 text-gray-700 dark:bg-gray-800 dark:text-gray-200">{sharedCount} shared</span>}
                            {coupleCount > 0 && <span className="rounded-full bg-white px-2 py-1 text-gray-700 dark:bg-gray-800 dark:text-gray-200">{coupleCount} couple</span>}
                            <span className="rounded-full bg-white px-2 py-1 text-gray-700 dark:bg-gray-800 dark:text-gray-200">Max 2 each</span>
                        </div>
                    </div>
                )}
                <Link to={`/farm/${farm._id}`} className="mt-auto block w-full rounded-lg bg-secondary py-2.5 text-center text-sm font-medium text-white transition hover:bg-blue-600 md:py-2 md:text-base">
                    View Details
                </Link>
            </div>
        </motion.div>
    );
};

export default FarmCard;
