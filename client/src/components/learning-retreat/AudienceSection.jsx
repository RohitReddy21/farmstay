import { motion } from 'framer-motion';

const AudienceSection = ({ audience }) => {
    return (
        <section className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#f9f4ed]/30 to-[#efe4d1]/30 dark:from-[#232823]/30 dark:to-[#1a211a]/30"></div>
            
            <div className="relative z-10">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-8 text-center sm:mb-12"
                >
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#7a5527] dark:text-[#e7c678] sm:mb-4 sm:text-sm sm:tracking-[0.24em]">
                        Who should join
                    </p>
                    <h2 className="mb-4 text-3xl font-bold leading-tight text-[#211b14] dark:text-[#fff8ea] sm:mb-6 sm:text-[38px]">
                        Designed for curious guests
                    </h2>
                    <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#645747] dark:text-[#d5c9b7] sm:text-lg">
                        Whether you're seeking peace, learning, or quality time with loved ones, our farm retreat offers something meaningful for everyone.
                    </p>
                </motion.div>

                {/* Cards Grid */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4 xl:gap-8">
                    {audience.map((card, index) => (
                        <motion.article
                            key={card.title}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.15 }}
                            className="group overflow-hidden rounded-3xl bg-white shadow-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl dark:bg-[#1c211c]"
                        >
                            <div className="relative overflow-hidden">
                                <img 
                                    src={card.image} 
                                    alt={card.title} 
                                    className="h-44 w-full object-cover transition duration-700 group-hover:scale-110 sm:h-48" 
                                    loading="lazy" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                            <div className="p-5 sm:p-6">
                                <h3 className="text-base font-bold text-[#211b14] dark:text-[#fff8ea] mb-3 group-hover:text-[#7a5527] dark:group-hover:text-[#e7c678] transition-colors duration-300">
                                    {card.title}
                                </h3>
                                <p className="text-sm text-[#645747] dark:text-[#d5c9b7] leading-relaxed group-hover:text-[#5b4d3e] dark:group-hover:text-[#dacdbb] transition-colors duration-300 line-clamp-3">
                                    {card.text}
                                </p>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AudienceSection;
