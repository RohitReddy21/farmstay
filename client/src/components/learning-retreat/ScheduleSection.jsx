import { motion } from 'framer-motion';

const ScheduleSection = ({ schedule }) => {
    return (
        <section>
            <div className="mb-6 sm:mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a5527] dark:text-[#e7c678] sm:text-sm sm:tracking-[0.24em]">Your retreat journey</p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-[38px]">Schedule</h2>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {schedule.map((day, dayIndex) => (
                    <motion.div
                        key={day.day}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: dayIndex * 0.2 }}
                        className="space-y-6"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: dayIndex * 0.1 }}
                            className="rounded-3xl border border-[#d6a23d]/30 bg-gradient-to-r from-[#7a5527] to-[#5d3d19] p-5 shadow-xl sm:p-6"
                        >
                            <h3 className="text-lg font-bold text-white mb-2">
                                {day.day}
                            </h3>
                            <p className="text-white/80">
                                {day.items.length} Activities Planned
                            </p>
                        </motion.div>
                        
                        <div className="space-y-4">
                            {day.items.map((item, itemIndex) => (
                                <motion.div
                                    key={`${item[0]}-${itemIndex}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: itemIndex * 0.1 }}
                                    className="group"
                                >
                                    <div className="flex gap-3 rounded-2xl border-2 border-[#dfd1bb]/30 bg-gradient-to-br from-[#fffaf1] to-[#f9f4ed] p-4 transition-all duration-300 hover:border-[#d6a23d]/50 hover:shadow-xl dark:border-[#31392f]/30 dark:from-[#1a211a] dark:to-[#232823] sm:gap-4 sm:p-5 lg:hover:scale-[1.02]">
                                        <div className="flex-shrink-0">
                                            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#7a5527] to-[#5d3d19] mt-2 group-hover:scale-150 transition-transform duration-300" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-[#211b14] dark:text-[#fff8ea] mb-2">
                                                {item[0]}
                                            </h4>
                                            <p className="text-sm leading-relaxed text-[#645747] dark:text-[#d5c9b7] sm:text-base">
                                                {item[1]}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default ScheduleSection;
