import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password);
            navigate('/');
        } catch (err) {
            setError('Registration failed');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Create Account</h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                        type="text"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition">
                    Sign Up
                </button>
            </form>
            <p className="mt-6 text-center text-gray-600">
                Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Login</Link>
            </p>
        </div>
    );
};

export default Register;

