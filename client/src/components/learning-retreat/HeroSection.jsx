import { motion } from 'framer-motion';
import { ArrowRight, Download, Sparkles } from 'lucide-react';

const HeroSection = ({ retreatContent, setShowBrochure, onBookNow }) => {
    return (
        <section className="relative min-h-[calc(100vh-72px)] overflow-hidden">
            <video 
                className="absolute inset-0 h-full w-full object-cover" 
                src={retreatContent.heroVideo} 
                autoPlay 
                muted 
                loop 
                playsInline 
                poster={retreatContent.heroImage} 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#11170f]/90 via-[#24301f]/62 to-[#11170f]/25" />
            <div className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-[1480px] items-center px-4 py-20 sm:px-6 sm:py-24 lg:px-10">
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl"
                >
                    <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-[#d8b66a]/40 bg-[#fff7e8]/12 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f4d88b] backdrop-blur sm:mb-6 sm:px-4 sm:text-sm sm:tracking-[0.22em]">
                        <Sparkles size={16} />
                        <span className="truncate">Brown Cows Farm Retreat</span>
                    </div>
                    <h1 className="text-3xl font-semibold leading-[1.08] tracking-tight text-[#fff8ea] sm:text-5xl lg:text-7xl">
                        {retreatContent.title}
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#efe4d1] sm:mt-6 sm:text-xl">
                        {retreatContent.subtitle}
                    </p>
                    <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row">
                        <button 
                            onClick={onBookNow} 
                            className="inline-flex items-center justify-center rounded-full bg-[#7a5527] px-6 py-3.5 font-semibold text-white shadow-2xl transition hover:bg-[#5d3d19] sm:px-7 sm:py-4"
                        >
                            Book Your Stay <ArrowRight className="ml-2" size={19} />
                        </button>
                        <button 
                            onClick={() => setShowBrochure(true)} 
                            className="inline-flex items-center justify-center rounded-full border border-[#fff8ea]/45 bg-[#fff8ea]/12 px-6 py-3.5 font-semibold text-[#fff8ea] backdrop-blur transition hover:bg-[#fff8ea]/22 sm:px-7 sm:py-4"
                        >
                            <Download className="mr-2" size={19} />
                            Download Brochure
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;
