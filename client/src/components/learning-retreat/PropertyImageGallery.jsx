import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PropertyImageGallery = ({ experience, stayType, stayOptions, linkedFarm, retreatHeroImage }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    
    const getPropertyImages = () => {
        // If we have a linked farm with images, use them
        if (linkedFarm?.images && linkedFarm.images.length > 0) {
            return linkedFarm.images.filter(img => img); // Filter out empty URLs
        }
        
        // Fallback to default images based on experience/stay type
        if (experience === 'day') {
            return [
                retreatHeroImage || 'https://browncowsdairy.com/cdn/shop/files/IJJU8350_1.jpg?v=1775652524&width=1200',
                'https://browncowsdairy.com/cdn/shop/files/give-me-other-image.png?v=1775656183&width=1200',
                'https://browncowsdairy.com/cdn/shop/files/families-in-farms.png?v=1775656252&width=1200'
            ];
        }
        
        if (stayType === 'Solo' || stayType === 'Couple') {
            // Use Mud Cottage images for both Solo and Couple
            return stayOptions[0]?.images || [
                stayOptions[0]?.image || 'https://browncowsdairy.com/cdn/shop/files/WhatsAppImage2025-12-16at5.07.08PM.jpg?v=1777122827&width=1200',
                'https://browncowsdairy.com/cdn/shop/files/DSC00332.jpg?v=1776069148&width=1200',
                'https://browncowsdairy.com/cdn/shop/files/DSC00333.jpg?v=1776069148&width=1200'
            ];
        } else if (stayType === 'Group') {
            // Use Limestone Villa images for Group
            return stayOptions[1]?.images || [
                stayOptions[1]?.image || 'https://browncowsdairy.com/cdn/shop/files/DSC00331.jpg?v=1776069148&width=1200',
                'https://browncowsdairy.com/cdn/shop/files/IJJU8350_1.jpg?v=1775652524&width=1200',
                'https://browncowsdairy.com/cdn/shop/files/DSC08697.jpg?v=1776069148&width=1200'
            ];
        }
        return [stayOptions[0]?.image || retreatHeroImage];
    };

    const images = getPropertyImages();
    
    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
    };
    
    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
    };

    const getPropertyName = () => {
        if (linkedFarm?.title) {
            return linkedFarm.title;
        }
        if (experience === 'day') return 'Farm Experience';
        return stayType === 'Group' ? 'Limestone Villa' : 'Mud Cottage';
    };

    if (!images || images.length === 0) {
        return (
            <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-3xl bg-gray-200 shadow-2xl dark:bg-[#1c211c] sm:h-[360px] lg:h-[460px]">
                <p className="text-gray-500 dark:text-gray-400">No images available</p>
            </div>
        );
    }

    return (
        <div className="group relative overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#1c211c]">
            {/* Slider */}
            <div className="relative h-56 overflow-hidden sm:h-[360px] lg:h-[460px]">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentSlide}
                        src={images[currentSlide]}
                        alt={getPropertyName()}
                        className="h-full w-full object-cover"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                        onError={(e) => {
                            e.target.src = retreatHeroImage || 'https://via.placeholder.com/800x600?text=Image+Not+Available';
                        }}
                    />
                </AnimatePresence>
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                
                {/* Navigation arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/25 p-2 text-white opacity-100 backdrop-blur-sm transition-opacity duration-300 hover:bg-white/35 sm:left-4 lg:opacity-0 lg:group-hover:opacity-100"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/25 p-2 text-white opacity-100 backdrop-blur-sm transition-opacity duration-300 hover:bg-white/35 sm:right-4 lg:opacity-0 lg:group-hover:opacity-100"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}
                
                {/* Slide indicators */}
                {images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-4">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    index === currentSlide 
                                        ? 'bg-white w-8' 
                                        : 'bg-white/50 hover:bg-white/75'
                                }`}
                            />
                        ))}
                    </div>
                )}
                
                {/* Property name badge */}
                <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
                    <div className="max-w-[230px] truncate rounded-full bg-white/25 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm sm:max-w-none sm:text-sm">
                        {getPropertyName()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyImageGallery;
