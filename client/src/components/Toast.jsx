import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

const Toast = ({ notification, onClose }) => {
    if (!notification) return null;

    const { type, title, message } = notification;

    const styles = {
        success: {
            bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
            border: 'border-green-200',
            icon: 'text-green-600',
            title: 'text-green-900',
            message: 'text-green-700'
        },
        error: {
            bg: 'bg-gradient-to-r from-red-50 to-rose-50',
            border: 'border-red-200',
            icon: 'text-red-600',
            title: 'text-red-900',
            message: 'text-red-700'
        }
    };

    const style = styles[type] || styles.error;
    const Icon = type === 'success' ? CheckCircle : AlertCircle;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                transition={{ duration: 0.3, type: 'spring' }}
                className="fixed top-4 right-4 z-50 max-w-md"
            >
                <div className={`${style.bg} ${style.border} border-2 rounded-2xl shadow-2xl p-4 backdrop-blur-sm`}>
                    <div className="flex items-start gap-3">
                        <Icon className={`${style.icon} flex-shrink-0 mt-0.5`} size={24} />
                        <div className="flex-1">
                            <h4 className={`${style.title} font-bold text-lg mb-1`}>{title}</h4>
                            <p className={`${style.message} text-sm leading-relaxed`}>{message}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default Toast;
