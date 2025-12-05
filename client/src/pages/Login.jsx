import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">Welcome Back</h2>
            {error && <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200 p-3 rounded-lg mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                        type="email"
                        className="w-full p-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none dark:bg-gray-700 dark:text-white"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <Link to="/forgot-password" className="text-sm text-primary hover:text-green-600">
                            Forgot Password?
                        </Link>
                    </div>
                    <input
                        type="password"
                        className="w-full p-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none dark:bg-gray-700 dark:text-white"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition">
                    Login
                </button>
            </form>
            <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
                Don't have an account? <Link to="/register" className="text-primary font-semibold hover:underline">Sign up</Link>
            </p>
        </div>
    );
};

export default Login;

