import { motion } from 'framer-motion';
import { Heart, Home, Users } from 'lucide-react';

const stayMeta = {
    shared: {
        Icon: Users,
        label: 'Shared cottages',
        chips: ['2 cottages', '2 guests max', 'Friends & solo guests']
    },
    couple: {
        Icon: Heart,
        label: 'Private cottages',
        chips: ['2 cottages', 'Flat stay price', 'Couple friendly']
    },
    default: {
        Icon: Home,
        label: 'Private villa',
        chips: ['Group stay', '4 guests max', 'Farm access']
    }
};

const getStayMeta = (title = '') => {
    const text = title.toLowerCase();
    if (text.includes('shared')) return stayMeta.shared;
    if (text.includes('couple')) return stayMeta.couple;
    return stayMeta.default;
};

const StayOptionsSection = ({ stayOptions }) => {
    return (
        <section className="relative overflow-hidden rounded-[2rem] border border-[#dfd1bb] bg-[#fffaf1]/70 p-4 shadow-[0_20px_70px_rgba(82,58,28,0.08)] dark:border-[#31392f] dark:bg-[#171d17]/80 sm:p-6 lg:p-8">
            <div className="mb-7 flex flex-col gap-4 lg:mb-9 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#7a5527] dark:text-[#e7c678] sm:text-sm sm:tracking-[0.28em]">Your home away</p>
                    <h2 className="mt-3 text-3xl font-black leading-tight text-[#211b14] dark:text-[#fff8ea] sm:text-[40px]">Comfortable Stays</h2>
                </div>
                <p className="max-w-xl text-sm leading-relaxed text-[#645747] dark:text-[#d5c9b7] sm:text-base">
                    Choose from earthy mud cottages for shared or couple stays, or a private limestone villa for a small group retreat.
                </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3 xl:gap-6">
                {stayOptions.map((stay, index) => {
                    const { Icon, label, chips } = getStayMeta(stay.title);
                    return (
                    <motion.article
                        key={stay.title}
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.45, delay: index * 0.08 }}
                        className="group overflow-hidden rounded-[1.75rem] border border-[#ead8b9] bg-white shadow-[0_18px_45px_rgba(82,58,28,0.12)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(82,58,28,0.18)] dark:border-[#31392f] dark:bg-[#232823]"
                    >
                        <div className="relative h-64 overflow-hidden sm:h-72 lg:h-80">
                            <img
                                src={stay.image}
                                alt={stay.title}
                                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#21170d]/70 via-[#21170d]/10 to-transparent" />
                            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/30 bg-white/90 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#7a5527] shadow-lg backdrop-blur dark:bg-[#171d17]/90 dark:text-[#e7c678]">
                                <Icon size={15} />
                                {label}
                            </div>
                            <div className="absolute bottom-4 left-4 right-4">
                                <h3 className="text-xl font-black leading-tight text-white drop-shadow sm:text-2xl">{stay.title}</h3>
                            </div>
                        </div>
                        <div className="p-5 sm:p-6">
                            <p className="min-h-[72px] text-sm font-semibold leading-relaxed text-[#645747] dark:text-[#d5c9b7] sm:text-base">
                                {stay.text}
                            </p>
                            <div className="mt-5 flex flex-wrap gap-2">
                                {chips.map((chip) => (
                                    <span key={chip} className="rounded-full bg-[#f3e5cc] px-3 py-1.5 text-xs font-black text-[#7a5527] dark:bg-[#1a211a] dark:text-[#e7c678]">
                                        {chip}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.article>
                    );
                })}
            </div>
        </section>
    );
};

export default StayOptionsSection;
