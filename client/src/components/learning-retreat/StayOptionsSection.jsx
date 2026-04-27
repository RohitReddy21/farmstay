import { motion } from 'framer-motion';

const StayOptionsSection = ({ stayOptions }) => {
    return (
        <section>
            <div className="mb-6 sm:mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a5527] dark:text-[#e7c678] sm:text-sm sm:tracking-[0.24em]">Your home away</p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-[38px]">Comfortable Stays</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
                {stayOptions.map((stay, index) => (
                    <article 
                        key={stay.title} 
                        className="group relative min-h-[240px] overflow-hidden rounded-3xl shadow-xl sm:min-h-[330px] sm:shadow-2xl"
                    >
                        <img 
                            src={stay.image} 
                            alt={stay.title} 
                            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" 
                            loading="lazy" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 p-5 text-white sm:p-7">
                            <h3 className="text-lg font-semibold">{stay.title}</h3>
                            <p className="mt-2 text-base opacity-90 sm:text-lg">{stay.text}</p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default StayOptionsSection;
