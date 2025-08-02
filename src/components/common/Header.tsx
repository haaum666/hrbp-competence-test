import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();

  // Функция для определения, активна ли ссылка
  const isActive = (path: string) => {
    return location.pathname === path ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-300 hover:text-white';
  };

  return (
    <header className="bg-gray-900 shadow-lg py-4 px-6 sm:px-8 mb-8 sticky top-0 z-50 border-b border-gray-700">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        {/* Логотип / Название проекта */}
        <Link to="/" className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide flex items-center">
          <span role="img" aria-label="brain" className="mr-2 text-3xl sm:text-4xl">🧠</span> HRBP-Тест
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
