import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQSection = ({ faqs }) => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section>
            <div className="mb-6 sm:mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a5527] dark:text-[#e7c678] sm:text-sm sm:tracking-[0.24em]">Get your questions answered</p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-[38px]">Frequently asked questions</h2>
            </div>

            <div className="mx-auto max-w-4xl space-y-4">
                {faqs.map((faq, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="overflow-hidden rounded-2xl border border-[#dfd1bb] bg-[#fffaf1] dark:border-[#31392f] dark:bg-[#1a211a]"
                    >
                        <button
                            onClick={() => toggleFAQ(index)}
                            className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors duration-200 hover:bg-[#f9f4ed] dark:hover:bg-[#232823] sm:px-6 sm:py-5"
                        >
                            <h3 className="pr-4 text-base font-semibold text-[#211b14] dark:text-[#fff8ea] sm:text-lg">
                                {faq[0]}
                            </h3>
                            <motion.div
                                animate={{ rotate: openIndex === index ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex-shrink-0"
                            >
                                <ChevronDown 
                                    size={20} 
                                    className="text-[#7a5527] dark:text-[#e7c678]" 
                                />
                            </motion.div>
                        </button>
                        
                        <AnimatePresence>
                            {openIndex === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-4 pb-5 sm:px-6">
                                        <p className="text-sm leading-relaxed text-[#645747] dark:text-[#d5c9b7] sm:text-base">
                                            {faq[1]}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default FAQSection;
