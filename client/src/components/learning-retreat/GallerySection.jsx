import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';

const GallerySection = ({ gallery, lightboxIndex, setLightboxIndex }) => {
    return (
        <section>
            <div className="mb-6 sm:mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a5527] dark:text-[#e7c678] sm:text-sm sm:tracking-[0.24em]">Experience gallery</p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-[38px]">Moments at the Farm</h2>
            </div>
            
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
                {gallery.map((image, index) => (
                    <button 
                        key={image} 
                        onClick={() => setLightboxIndex(index)} 
                        className="group mb-4 block w-full overflow-hidden rounded-3xl shadow-lg sm:mb-5"
                    >
                        <img 
                            src={image} 
                            alt={`Retreat gallery ${index + 1}`} 
                            className={`w-full object-cover transition duration-700 group-hover:scale-105 ${index % 3 === 0 ? 'h-64 sm:h-80' : 'h-52 sm:h-60'}`} 
                            loading="lazy" 
                        />
                    </button>
                ))}
            </div>
        </section>
    );
};

export default GallerySection;
