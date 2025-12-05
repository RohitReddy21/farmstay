import { useState } from 'react';
import { Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import API_URL from '../config';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { data } = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
            setMessage(data.message || 'Password reset link sent to your email!');
            setEmail('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-green-50 dark:from-gray-900 dark:to-gray-800 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full"
            >
                <div className="text-center mb-8">
                    <div className="bg-primary/10 dark:bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="text-primary" size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Forgot Password?</h2>
                    <p className="text-gray-600 dark:text-gray-400">No worries! Enter your email and we'll send you reset instructions.</p>
                </div>

                {message && (
                    <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg mb-4">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="your@email.com"
                            className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a href="/login" className="text-primary hover:text-green-600 font-medium">
                        ← Back to Login
                    </a>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
