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
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                // Brown Cows retreat palette
                primary: {
                    DEFAULT: '#7a5527',
                    50: '#fffaf1',
                    100: '#f4ead8',
                    200: '#ead7b8',
                    300: '#dfbf88',
                    400: '#d6a23d',
                    500: '#a97833',
                    600: '#8b5f25',
                    700: '#7a5527',
                    800: '#5d3d19',
                    900: '#21170d',
                },
                secondary: {
                    DEFAULT: '#527b52',
                    50: '#f3f8f1',
                    100: '#e4efdf',
                    200: '#cadfbd',
                    300: '#a9ca98',
                    400: '#80aa6e',
                    500: '#63905a',
                    600: '#527b52',
                    700: '#3d5e3d',
                    800: '#304a31',
                    900: '#263d29',
                },
                accent: '#d6a23d',
                background: '#f5efe3',
                surface: '#fffaf1',
                text: {
                    primary: '#211b14',
                    secondary: '#645747',
                },
            },
            borderRadius: {
                'lg': '0.75rem',  // 12px for cards
                'md': '0.5rem',   // 8px for buttons/inputs
                'xl': '1rem',     // 16px for modals
            },
            boxShadow: {
                'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            },
        },
    },
    plugins: [],
}
