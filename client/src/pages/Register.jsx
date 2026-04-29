import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import API_URL from '../config';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const { register, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleSendOtp = async () => {
        setError('');
        setNotice('');

        if (!email.trim()) {
            setError('Please enter your email before requesting OTP.');
            return;
        }

        setIsSendingOtp(true);
        try {
            const { data } = await axios.post(`${API_URL}/api/auth/send-otp`, { email });
            setOtpSent(true);
            setNotice(data.message || 'OTP sent to your email address.');
        } catch (err) {
            setError(err.response?.data?.message || 'Could not send OTP. Please try again.');
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!otpSent) {
            setError('Please send and enter the email OTP before signing up.');
            return;
        }

        setIsRegistering(true);
        try {
            await register(name, email, phone, password, otp);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
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
                {notice && <div className="mb-4 rounded-xl border border-[#d9c18e] bg-[#fff4d7] p-3 text-sm text-[#6d4d1f]">{notice}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
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
                                onChange={(e) => setPhone(e.target.value)}
                                autoComplete="tel"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-[#3a2b1e]">Email</label>
                            <input
                                type="email"
                                className="w-full rounded-xl border border-[#e3cfac] bg-white p-3 text-[#211b14] outline-none transition focus:border-[#7a5527] focus:ring-2 focus:ring-[#d6a23d]/30"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setOtp('');
                                    setOtpSent(false);
                                    setNotice('');
                                }}
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
                <div className="rounded-2xl border border-[#ead7b8] bg-white/75 p-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-[#3a2b1e]">Email OTP</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength="6"
                                className="w-full rounded-xl border border-[#e3cfac] bg-white p-3 text-[#211b14] outline-none transition focus:border-[#7a5527] focus:ring-2 focus:ring-[#d6a23d]/30"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder={otpSent ? 'Enter 6-digit OTP' : 'Send OTP first'}
                                autoComplete="one-time-code"
                                required
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isSendingOtp || !email.trim()}
                            className="h-12 rounded-xl border border-[#7a5527] px-6 font-bold text-[#7a5527] transition hover:bg-[#7a5527] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSendingOtp ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-[#8b7a66]">We will send a 6-digit verification code to your email.</p>
                </div>

                <button
                    type="submit"
                    disabled={isRegistering || !otpSent}
                    className="w-full rounded-xl bg-primary py-3 font-bold text-white shadow-lg transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isRegistering ? 'Verifying...' : 'Verify & Sign Up'}
                </button>
            </form>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#ead7b8]"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-[#fffaf1] px-2 text-[#8b7a66]">Or sign up with</span>
                    </div>
                </div>

                <div className="mt-6 flex justify-center">
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

                <p className="mt-6 text-center text-[#645747]">
                    Already have an account? <Link to="/login" className="font-bold text-primary hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
