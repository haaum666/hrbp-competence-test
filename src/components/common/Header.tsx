import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();

  // Функция для определения, активна ли ссылка
  const isActive = (path: string) => {
    // Используем CSS-переменные для активных и неактивных состояний
    return location.pathname === path
      ? 'text-accent-primary border-b-2 border-accent-primary' // Активный: приглушенный серо-голубой
      : 'text-text-secondary hover:text-text-primary'; // Неактивный: серо-коричневый, при наведении - темно-серый
  };

  return (
    <header
      className="shadow-lg py-4 px-6 sm:px-8 sticky top-0 z-50 border-b"
      style={{
        backgroundColor: 'var(--color-background-card)', // Кремовый фон для хедера
        backgroundImage: 'var(--texture-grain)', // Зернистость
        backgroundSize: '4px 4px',
        backgroundRepeat: 'repeat',
        borderColor: 'var(--color-neutral)', // Легкая серая граница снизу
      }}
    >
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        {/* Логотип / Название проекта */}
        <Link to="/" className="text-2xl sm:text-3xl font-extrabold tracking-wide flex items-center"
          style={{ color: 'var(--color-text-primary)' }} // Темно-серый цвет для текста
        >
          {/* Пока оставляем мозг, но обсудим замену на следующем шаге */}
          <span role="img" aria-label="brain" className="mr-2 text-3xl sm:text-4xl"
            style={{ filter: 'grayscale(100%) brightness(1.2)' }} // Сделаем мозг более нейтральным, если он розовый
          >🧠</span> HRBP-Тест
        </Link>

        {/* Навигационные ссылки */}
        <nav className="space-x-4 sm:space-x-6">
          <Link to="/" className={`text-lg font-medium transition-colors duration-300 ${isActive('/')}`}>
            Тест
          </Link>
          <Link to="/analytics" className={`text-lg font-medium transition-colors duration-300 ${isActive('/analytics')}`}>
            Аналитика
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
