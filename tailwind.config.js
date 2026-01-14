/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                antigravity: {
                    bg: 'hsl(var(--bg))',
                    card: 'hsl(var(--card))',
                    accent: 'hsl(var(--accent))',
                    muted: 'hsl(var(--muted))',
                    border: 'hsl(var(--border))',
                    text: 'hsl(var(--text))',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
