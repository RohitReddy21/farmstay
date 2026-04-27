import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

const Lightbox = ({ index, images, onClose, onPrev, onNext }) => (
    <AnimatePresence>
        {index !== null && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative max-w-5xl max-h-[90vh] w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <img
                        src={images[index]}
                        alt={`Gallery image ${index + 1}`}
                        className="h-full w-full rounded-2xl object-contain"
                    />
                    
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute -top-12 right-0 rounded-full bg-white/20 backdrop-blur-sm p-3 text-white transition hover:bg-white/30 lg:top-4 lg:right-4"
                    >
                        <X size={24} />
                    </button>
                    
                    {/* Navigation buttons */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={onPrev}
                                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur-sm p-3 text-white transition hover:bg-white/30"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={onNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur-sm p-3 text-white transition hover:bg-white/30"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}
                    
                    {/* Image counter */}
                    {images.length > 1 && (
                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white lg:bottom-4">
                            <span className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-sm">
                                {index + 1} / {images.length}
                            </span>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default Lightbox;
