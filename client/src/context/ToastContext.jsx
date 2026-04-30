import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const showToast = useCallback(({ type = 'error', title = 'Notice', message = '' }) => {
        setNotification({ type, title, message, id: Date.now() });
    }, []);

    const closeToast = useCallback(() => {
        setNotification(null);
    }, []);

    useEffect(() => {
        if (!notification) return undefined;
        const timeout = window.setTimeout(closeToast, 3500);
        return () => window.clearTimeout(timeout);
    }, [notification, closeToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Toast notification={notification} onClose={closeToast} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used inside ToastProvider');
    }
    return context;
};
