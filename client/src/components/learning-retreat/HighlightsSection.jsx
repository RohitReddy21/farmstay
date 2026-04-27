import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const HighlightsSection = ({ highlights }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="hidden gap-4 sm:grid sm:grid-cols-2"
        >
            {highlights.map((item, index) => (
                <motion.div 
                    key={item} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    className="group rounded-3xl border border-[#e4d6bf] bg-gradient-to-br from-[#fffaf1] to-[#f9f4ed] p-4 shadow-lg transition-all duration-300 hover:border-[#d6a23d] hover:shadow-xl dark:border-[#30382f] dark:from-[#1b211b] dark:to-[#232823] sm:p-6"
                >
                    <div className="flex items-start gap-4">
                        <div className="rounded-full bg-gradient-to-br from-[#527b52] to-[#3d5e3d] p-3 text-white shadow-lg">
                            <CheckCircle2 size={18} className="transition-transform group-hover:scale-110 sm:size-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-base font-semibold text-[#211b14] transition-colors group-hover:text-[#7a5527] dark:text-[#fff8ea] dark:group-hover:text-[#e7c678] sm:text-lg">
                                {item}
                            </p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
};

export default HighlightsSection;
