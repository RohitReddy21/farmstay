const DEFAULT_API_URL = 'http://localhost:5001';

const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).trim().replace(/\/+$/, '');

if (import.meta.env.DEV && API_URL.includes('farmer-c0b.onrender.com')) {
  console.warn(
    'VITE_API_URL points to farmer-c0b.onrender.com, which is not serving this API. Use the Express backend URL instead.'
  );
}

export default API_URL;
