import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css'
import App from './App.jsx'
import GlobalErrorBoundary from './components/GlobalErrorBoundary';

console.log('App starting...');

// Use environment variable for Client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE") {
  console.warn('Missing VITE_GOOGLE_CLIENT_ID in environment variables. Google OAuth may fail.');
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Failed to find the root element');
} else {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <GlobalErrorBoundary>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || "placeholder_id"}>
          <App />
        </GoogleOAuthProvider>
      </GlobalErrorBoundary>
    </StrictMode>,
  );
  console.log('App mounted.');
}

