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
        // Устанавливаем Inter как основной шрифт по умолчанию для font-sans
        sans: ['Inter', 'sans-serif'],
        // Добавляем Montserrat для использования с классом font-heading
        heading: ['Montserrat', 'sans-serif'],
      },
      colors: {
        // Новая цветовая палитра: приглушенные, землистые тона
        // Эти цвета будут использоваться Tailwind CSS классами (например, bg-background-card)
        'background-light-beige': '#F5F5DC',      // Светлый бежевый фон
        'background-card': '#FAF0E6',             // Кремовый фон для карточек и элементов
        'text-primary': '#333333',                 // Темно-серый для основного текста
        'text-secondary': '#696969',               // Серо-коричневый для вторичного текста

        'accent-primary': '#ADD8E6',               // Приглушенный серо-голубой (для прогресса, выбранных опций)
        'accent-secondary': '#8FBC8F',             // Мягкий оливково-зеленый (для основных кнопок "Next", "Start")
        'success': '#98FB98',                      // Светлый серо-зеленый для правильных ответов
        'error': '#CD5C5C',                        // Приглушенный серо-красный для неправильных ответов и "Завершить тест"
        'neutral': '#D3D3D3',                      // Светло-серый для неактивных/нейтральных элементов, кнопок "Back"
        'button-text': '#FFFFFF',                  // Белый текст для кнопок
        'option-border': '#D3D3D3',                // Граница для неотмеченных опций

        // Обновленные цвета для уровней сложности вопросов, теперь они из новой палитры
        'level-junior': '#ADD8E6',                 // Приглушенный серо-голубой
        'level-middle': '#8FBC8F',                 // Мягкий оливково-зеленый
        'level-senior': '#CD5C5C',                 // Приглушенный серо-красный
        'level-default': '#696969',                // Серо-коричневый (для случая, если уровень не определен)
      },
    },
  },
  plugins: [],
};

export default config;
