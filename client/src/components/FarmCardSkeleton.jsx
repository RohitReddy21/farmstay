import { motion } from 'framer-motion';

const FarmCardSkeleton = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700"
        >
            {/* Image Skeleton */}
            <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>

            {/* Content Skeleton */}
            <div className="p-5 space-y-3">
                {/* Title and Price */}
                <div className="flex justify-between items-start">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                </div>

                {/* Location and Capacity */}
                <div className="flex space-x-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                </div>

                {/* Button */}
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
        </motion.div>
    );
};

export default FarmCardSkeleton;
