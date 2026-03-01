import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        club: {
          black: '#0a0a0f',
          dark: '#12121a',
          card: '#1a1a26',
          border: '#2a2a3a',
          mute: '#6b7280',
          neon: {
            pink: '#ff2d95',
            cyan: '#00f5ff',
            purple: '#a855f7',
            green: '#22c55e',
            yellow: '#eab308',
          },
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 45, 149, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 45, 149, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
