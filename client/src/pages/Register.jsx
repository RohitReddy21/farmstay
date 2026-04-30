import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useToast } from '../context/ToastContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const { register, googleLogin } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const getTenDigitPhone = (value = '') => value.replace(/\D/g, '').slice(0, 10);

    const showFormError = (message) => {
        setError(message);
        showToast({
            type: 'error',
            title: 'Complete sign up details',
            message
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || !email.trim() || !password) {
            showFormError('Please fill all required fields.');
            return;
        }

        if (getTenDigitPhone(phone).length !== 10) {
            showFormError('Mobile number must be exactly 10 digits.');
            return;
        }

        setIsRegistering(true);
        try {
            await register(name, email, phone, password);
            navigate('/');
        } catch (err) {
            showFormError(err.response?.data?.message || 'Registration failed');
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f7efe2] px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl rounded-3xl border border-[#ead7b8] bg-[#fffaf1] p-5 shadow-xl sm:p-8 lg:p-10">
                <div className="mb-8 text-center">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-[#8a642d]">Brown Cows Dairy</p>
                    <h2 className="text-3xl font-bold text-[#211b14] sm:text-4xl">Create Account</h2>
                    <p className="mt-2 text-sm text-[#645747]">Sign up with your details to get started.</p>
                </div>

                {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

                <div className="mb-6">
                    <div className="flex justify-center">
                        {import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID_HERE" ? (
                            <GoogleLogin
                                onSuccess={async (credentialResponse) => {
                                    try {
                                        await googleLogin(credentialResponse.credential);
                                        navigate('/');
                                    } catch (err) {
                                        setError('Google Sign-Up Failed');
                                    }
                                }}
                                onError={() => {
                                    setError('Google Sign-Up Failed');
                                }}
                                theme="filled_blue"
                                shape="pill"
                                text="signup_with"
                            />
                        ) : (
                            <div className="text-center text-xs italic text-[#8b7a66]">
                                Google signup is currently unavailable.
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#ead7b8]"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-[#fffaf1] px-2 text-[#8b7a66]">Or sign up with details</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-[#3a2b1e]">Name</label>
                            <input
                                type="text"
                                className="w-full rounded-xl border border-[#e3cfac] bg-white p-3 text-[#211b14] outline-none transition focus:border-[#7a5527] focus:ring-2 focus:ring-[#d6a23d]/30"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoComplete="name"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-[#3a2b1e]">Mobile Number</label>
                            <input
                                type="tel"
                                className="w-full rounded-xl border border-[#e3cfac] bg-white p-3 text-[#211b14] outline-none transition focus:border-[#7a5527] focus:ring-2 focus:ring-[#d6a23d]/30"
                                value={phone}
                                onChange={(e) => {
                                    setError('');
                                    setPhone(getTenDigitPhone(e.target.value));
                                }}
                                autoComplete="tel"
                                inputMode="numeric"
                                pattern="[0-9]{10}"
                                maxLength="10"
                                required
                            />
                            {phone && phone.length < 10 && (
                                <p className="mt-1 text-xs font-semibold text-red-600">Enter exactly 10 digits.</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-[#3a2b1e]">Email</label>
                            <input
                                type="email"
                                className="w-full rounded-xl border border-[#e3cfac] bg-white p-3 text-[#211b14] outline-none transition focus:border-[#7a5527] focus:ring-2 focus:ring-[#d6a23d]/30"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-[#3a2b1e]">Password</label>
                            <input
                                type="password"
                                className="w-full rounded-xl border border-[#e3cfac] bg-white p-3 text-[#211b14] outline-none transition focus:border-[#7a5527] focus:ring-2 focus:ring-[#d6a23d]/30"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isRegistering}
                        className="w-full rounded-xl bg-primary py-3 font-bold text-white shadow-lg transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isRegistering ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-6 text-center text-[#645747]">
                    Already have an account? <Link to="/login" className="font-bold text-primary hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
