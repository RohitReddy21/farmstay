import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Success = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');

    return (
        <div className="flex flex-col items-center justify-center py-20">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
                <CheckCircle size={100} className="text-primary mb-6" />
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
            <p className="text-xl text-gray-600 mb-8">Thank you for your booking. You will receive a confirmation email shortly.</p>
            <Link to="/" className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-green-600 transition">
                Return Home
            </Link>
        </div>
    );
};

export default Success;
