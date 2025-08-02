import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();

  // Функция для определения, активна ли ссылка
  const isActive = (path: string) => {
    return location.pathname === path
      ? 'text-accent-primary border-b-2 border-accent-primary' // Активный: приглушенный синий
      : 'text-text-secondary hover:text-text-primary'; // Неактивный: приглушенный средне-серый, при наведении - темный землистый
  };

  return (
    <header
      className="shadow-lg py-4 px-6 sm:px-8 sticky top-0 z-50 border-b"
      style={{
        backgroundColor: 'var(--color-background-card)', // Фон хедера (кремовый)
        backgroundImage: 'var(--texture-grain)', // Зернистость
        backgroundSize: '4px 4px',
        backgroundRepeat: 'repeat',
        borderColor: 'var(--color-neutral)', // Легкая серая граница снизу (серо-бежевый)
      }}
    >
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        {/* Логотип / Название проекта */}
        <Link to="/" className="text-2xl sm:text-3xl font-extrabold tracking-wide flex items-center">
          {/* Замена иконки мозга на SVG-иконку "структурный ромб" */}
          <svg
            width="32" // Увеличил размер для лучшей видимости, можете настроить
            height="32" // Увеличил размер для лучшей видимости, можете настроить
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2" // Добавил отступ справа
            style={{ color: 'var(--color-error)' }} // Цвет иконки (приглушенный оранжево-красный)
          >
            <path d="M12 1L22 7L12 23L2 7L12 1Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M2 7L12 1L22 7L12 13L2 7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M12 13L2 7M12 13L22 7M12 13L12 23" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
          {/* ИСПРАВЛЕНО: Буквы HRBP с разными цветами */}
          <span style={{ color: 'var(--color-accent-primary)' }}>H</span>
          <span style={{ color: 'var(--color-error)' }}>R</span>
          <span style={{ color: 'var(--color-accent-secondary)' }}>B</span>
          <span style={{ color: 'var(--color-text-primary)' }}>P</span>
          <span style={{ color: 'var(--color-text-primary)' }}>-Тест</span>
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
