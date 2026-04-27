import { motion } from 'framer-motion';
import { MapPin, Mail, Phone } from 'lucide-react';

const ContactSection = ({ retreatContent }) => {
    return (
        <section>
            <div className="mb-6 sm:mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a5527] dark:text-[#e7c678] sm:text-sm sm:tracking-[0.24em]">Visit our farm</p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-[38px]">Address</h2>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="rounded-3xl border border-[#dfd1bb]/30 bg-gradient-to-br from-[#fffaf1] to-[#f9f4ed] p-5 shadow-xl dark:border-[#31392f]/30 dark:from-[#1a211a] dark:to-[#232823] sm:p-8"
                >
                    <div className="space-y-6">
                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className="rounded-full bg-[#7a5527] p-3 text-white">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#211b14] dark:text-[#fff8ea] mb-2 text-lg">Farm Location</h3>
                                <p className="text-[#645747] dark:text-[#d5c9b7] leading-relaxed">
                                    {retreatContent.location}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className="rounded-full bg-[#7a5527] p-3 text-white">
                                <Phone size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#211b14] dark:text-[#fff8ea] mb-2">Phone</h3>
                                <p className="text-[#645747] dark:text-[#d5c9b7]">
                                    {retreatContent.whatsapp}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className="rounded-full bg-[#7a5527] p-3 text-white">
                                <Mail size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#211b14] dark:text-[#fff8ea] mb-2 text-lg">Email</h3>
                                <p className="text-[#645747] dark:text-[#d5c9b7]">
                                    {retreatContent.email}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="overflow-hidden rounded-3xl shadow-xl"
                >
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3844.8475682469!2d78.3899!3d17.0004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDAwJzAwLjAiTiA3OMKwMjMnMjAuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
                        width="100%"
                        height="320"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="h-full min-h-[320px] w-full sm:min-h-[400px]"
                    />
                </motion.div>
            </div>
        </section>
    );
};

export default ContactSection;
