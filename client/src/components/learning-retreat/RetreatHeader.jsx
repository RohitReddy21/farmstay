import { motion } from 'framer-motion';

const RetreatHeader = ({ retreatContent }) => {
    return (
        <div className="space-y-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
            >
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-[#d6a23d] to-transparent" />
                    <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#7a5527] dark:text-[#e7c678] sm:text-sm sm:tracking-[0.3em]">Signature retreat</p>
                    <div className="h-px flex-1 bg-gradient-to-l from-[#d6a23d] to-transparent" />
                </div>
                <h2 className="bg-gradient-to-r from-[#211b14] to-[#7a5527] bg-clip-text text-3xl font-bold leading-tight tracking-tight text-transparent dark:from-[#fff8ea] dark:to-[#e7c678] sm:text-[38px]">
                    {retreatContent.retreatName}
                </h2>
                <p className="max-w-3xl text-base font-light leading-relaxed text-[#5b4d3e] dark:text-[#dacdbb] sm:text-xl">
                    Leave behind the noise of city life and step into a world where time slows down. Our farm experience invites you to reconnect with nature, learn traditional farming practices, and discover the simple joys of rural living.
                </p>
            </motion.div>
        </div>
    );
};

export default RetreatHeader;
