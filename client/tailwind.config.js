/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // Enable class-based dark mode
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            },
            colors: {
                primary: '#2ecc71', // Emerald Green
                secondary: '#3498db', // Peter River Blue
                accent: '#e74c3c', // Alizarin Red
                background: '#f0f2f5',
                card: '#ffffff',
                text: '#2c3e50',
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
            }
        },
    },
    plugins: [],
}
