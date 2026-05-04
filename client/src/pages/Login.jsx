import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState('');
    const redirectTo = location.state?.from || '/';
    const redirectState = location.state?.bookingDraft
        ? { bookingDraft: location.state.bookingDraft }
        : undefined;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            await login(email, password);
            navigate(redirectTo, { replace: true, state: redirectState });
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-[#f7efe2] px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-md rounded-3xl border border-[#ead7b8] bg-[#fffaf1] p-6 shadow-xl sm:p-8">
                <div className="mb-8 text-center">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-[#8a642d]">Brown Cows Dairy</p>
                    <h2 className="text-3xl font-bold text-[#211b14]">Welcome Back</h2>
                    <p className="mt-2 text-sm text-[#645747]">Login to continue your farm stay booking.</p>
                </div>
            {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            {message && <div className="mb-4 rounded-xl border border-[#cfe4c8] bg-[#f1f8ec] p-3 text-sm text-[#3f6b3f]">{message}</div>}

            <div className="mb-6">
                <div className="flex justify-center">
                    {import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID_HERE" ? (
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                try {
                                    await googleLogin(credentialResponse.credential);
                                    navigate(redirectTo, { replace: true, state: redirectState });
                                } catch (err) {
                                    setError('Google Login Failed');
                                }
                            }}
                            onError={() => {
                                setError('Google Login Failed');
                            }}
                            theme="filled_blue"
                            shape="pill"
                        />
                    ) : (
                        <div className="text-center text-xs italic text-[#8b7a66]">
                            Google Login is currently disabled.
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
                        <span className="bg-[#fffaf1] px-2 text-[#8b7a66]">Or login with email</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="mb-1 block text-sm font-semibold text-[#3a2b1e]">Email</label>
                    <input
                        type="email"
                        className="w-full rounded-xl border border-[#e3cfac] bg-white p-3 text-[#211b14] outline-none transition focus:border-[#7a5527] focus:ring-2 focus:ring-[#d6a23d]/30"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <div className="mb-1 flex items-center justify-between">
                        <label className="block text-sm font-semibold text-[#3a2b1e]">Password</label>
                        <Link to="/forgot-password" className="text-sm font-semibold text-[#7a5527] hover:underline">
                            Forgot Password?
                        </Link>
                    </div>
                    <input
                        type="password"
                        className="w-full rounded-xl border border-[#e3cfac] bg-white p-3 text-[#211b14] outline-none transition focus:border-[#7a5527] focus:ring-2 focus:ring-[#d6a23d]/30"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="w-full rounded-xl bg-primary py-3 font-bold text-white shadow-lg transition hover:bg-primary-800">
                    Login
                </button>
            </form>
                <p className="mt-6 text-center text-[#645747]">
                    Don't have an account? <Link to="/register" state={location.state} className="font-bold text-primary hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;

