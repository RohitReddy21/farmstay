const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5001' : (import.meta.env.VITE_API_URL || 'http://localhost:5001');

export default API_URL;
