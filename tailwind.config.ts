import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Устанавливаем Inter как основной шрифт по умолчанию для font-sans
        sans: ['Inter', 'sans-serif'], 
        // Добавляем Montserrat для использования с классом font-heading
        heading: ['Montserrat', 'sans-serif'], 
      },
      colors: {
        // Добавляем цвета, вдохновленные Баухаусом, для акцентов и фона
        'bauhaus-red': '#D4002D',    // Насыщенный красный
        'bauhaus-blue': '#005D9A',   // Глубокий синий
        'bauhaus-yellow': '#FDBB2F', // Яркий желтый
        'bauhaus-black': '#1A1A1A',  // Мягкий черный
        'bauhaus-white': '#F8F8F8',  // Мягкий белый
        'bauhaus-gray': '#AAAAAA',   // Средний серый
        'bauhaus-light-gray': '#D0D0D0', // Светло-серый
        'bauhaus-dark-gray': '#4A4A4A',  // Темно-серый
      },
    },
  },
  plugins: [],
};

export default config;
