/** @type {import('tailwindcss').Config} */
// Design tokens (REVAMP.md A3). Components style with these Tailwind classes;
// modern-ui.css keeps only the glossy-button effects and scrollbar styling.
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1', // accent alias kept for legacy class usage
        surface: {
          base: '#1F2128',    // app background / deepest
          raised: '#2A2D3A',  // sidebar & toolbar chrome
          overlay: '#353945', // cards, inputs, dropdowns
          hover: '#3E4250',
          elevated: '#4A4F5E',
        },
        ink: {
          DEFAULT: '#F9FAFB',
          secondary: '#D1D5DB',
          muted: '#9CA3AF',
          faint: '#6B7280',
        },
        accent: {
          DEFAULT: '#6366F1',
          hover: '#5558E3',
          soft: '#312E81',
        },
        danger: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
        line: {
          subtle: 'rgba(255, 255, 255, 0.08)',
          medium: 'rgba(255, 255, 255, 0.15)',
          strong: 'rgba(255, 255, 255, 0.25)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
