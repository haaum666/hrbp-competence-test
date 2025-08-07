// src/components/common/Header.tsx

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTestLogicContext } from '../../contexts/TestLogicContext';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { testStarted, resetTestStateForNavigation } = useTestLogicContext();

  console.log('Header.tsx: Рендер Header. testStarted:', testStarted, ' Текущий путь:', location.pathname);

  // Helper function to determine active link styles
  const isActive = (path: string) => {
    return location.pathname === path
      ? 'text-text-primary border-b-2 border-text-primary shadow-sm-bottom'
      : 'text-text-secondary hover:text-text-primary';
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    console.log('handleLogoClick: Клик по лого. testStarted:', testStarted);
    if (testStarted) {
      e.preventDefault(); // Предотвращаем стандартное поведение Link, чтобы сначала сбросить состояние
      console.log('handleLogoClick: Тест запущен. Вызываю resetTestStateForNavigation() и navigate(/)');
      resetTestStateForNavigation(); // Сбросить состояние теста
      navigate('/'); // Всегда переходить на главную
      console.log('handleLogoClick: Вызовы resetTestStateForNavigation и navigate завершены.');
    } else {
      console.log('handleLogoClick: Тест не запущен. Link работает как обычно.');
    }
  };

  // Унифицированная функция: Обработка клика по навигационным ссылкам
  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    console.log(`handleNavLinkClick: Клик по ссылке "${path}". testStarted:`, testStarted);
    if (testStarted) {
      e.preventDefault();
      console.log(`handleNavLinkClick: Тест запущен. Предотвращаю дефолт. Вызываю resetTestStateForNavigation() и navigate(${path})`);
      resetTestStateForNavigation();
      navigate(path);
      console.log(`handleNavLinkClick: Вызовы resetTestStateForNavigation и navigate завершены.`);
    }
  };

  return (
    <header
      className="py-4 px-6 sm:px-8 sticky top-0 z-50"
      style={{
        backgroundColor: 'var(--color-background-card)',
        backgroundImage: 'var(--texture-grain)',
        backgroundSize: '4px 4px',
        backgroundRepeat: 'repeat',
        borderBottom: '2px solid var(--color-text-primary)',
        boxShadow: '4px 4px 0px 0px var(--color-neutral)',
      }}
    >
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        {/* Logo/Title - теперь является полноценной ссылкой */}
        <Link
          to="/"
          onClick={handleLogoClick}
          className="flex items-center space-x-2 no-underline"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2"
            style={{ color: 'var(--color-error)' }}
          >
            <path d="M12 1L22 7L12 23L2 7L12 1Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M2 7L12 1L22 7L12 13L2 7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M12 13L2 7M12 13L22 7M12 13L12 23" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
          {/* Добавляем letterSpacing к h1 */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide flex items-center" style={{ letterSpacing: '0em' }}> {/* ДОБАВЛЕН style={{ letterSpacing: '0em' }} И ВОЗВРАЩЕН tracking-wide */}
            <span style={{ color: 'var(--color-accent-primary)' }}>H</span>
            <span style={{ color: 'var(--color-error)' }}>R</span>
            <span style={{ color: 'var(--color-accent-secondary)' }}>B</span>
            <span style={{ color: 'var(--color-text-primary)' }}>P</span>
            <span style={{ color: 'var(--color-text-primary)' }}>-Тест</span>
          </h1>
        </Link>

        <nav className="space-x-4 sm:space-x-6 flex items-center">
          {/* Ссылка "Тест" - СКРЫТА НА МОБИЛЬНЫХ */}
          <Link
            to="/"
            onClick={(e) => handleNavLinkClick(e, '/')}
            className={`hidden sm:block text-lg font-medium transition-colors duration-300 ${isActive('/')}`}
          >
            Тест
          </Link>

          {/* Ссылка "Аналитика" - ВИДИМА ВЕЗДЕ */}
          <Link
            to="/analytics"
            onClick={(e) => handleNavLinkClick(e, '/analytics')}
            className={`text-lg font-medium transition-colors duration-300 ${isActive('/analytics')}`}
          >
            Аналитика
          </Link>

          {/* Ссылка "О проекте" - СКРЫТА НА МОБИЛЬНЫХ, НОВЫЙ ЦВЕТ */}
          <Link
            to="/about"
            onClick={(e) => handleNavLinkClick(e, '/about')}
            className={`hidden sm:block text-lg font-medium transition-colors duration-300 ${isActive('/about')}`}
            style={{ color: 'var(--color-accent-secondary)' }}
          >
            О проекте
          </Link>

          {/* Ссылка "Контакты" - СКРЫТА НА МОБИЛЬНЫХ, НОВЫЙ ЦВЕТ */}
          <Link
            to="/contacts"
            onClick={(e) => handleNavLinkClick(e, '/contacts')}
            className={`hidden sm:block text-lg font-medium transition-colors duration-300 ${isActive('/contacts')}`}
            style={{ color: 'var(--color-accent-secondary)' }}
          >
            Контакты
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
