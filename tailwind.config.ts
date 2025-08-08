// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
      colors: {
        // --- Цветовая Палитра, синхронизированная с index.css ---
        // Эти цвета будут доступны как Tailwind-классы (например, bg-primary-background)

        'primary-background': '#28486e', // var(--color-background)
        'card-background': '#fadeb1',    // var(--color-background-card)
        
        'text-main': '#3A4232',        // var(--color-text-primary)
        'text-secondary-light': '#6E7766', // var(--color-text-secondary)
        'neutral-light': '#FFF5E0',      // var(--color-neutral)

        'accent-blue-green': '#67A1BF', // var(--color-accent-primary)
        'accent-olive': '#A3C690',     // var(--color-accent-secondary)
        
        'status-error': '#E07A5F',     // var(--color-error)
        'status-success': '#A3C690',   // var(--color-success) - такой же как accent-olive
        'status-warning': '#f7b32b',   // var(--color-warning)

        // Цвета для уровней сложности вопросов
        'level-junior': '#67A1BF',
        'level-middle': '#A3C690',
        'level-senior': '#E07A5F',
        'level-default': '#6E7766',
      },
    },
  },
  plugins: [],
};

export default config;
