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
      e.preventDefault();
      console.log('handleLogoClick: Тест запущен. Вызываю resetTestStateForNavigation() и navigate(/)');
      resetTestStateForNavigation();
      navigate('/');
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
        {/* Logo/Title */}
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
          <h1
            className="text-2xl sm:text-3xl font-extrabold tracking-normal flex items-center"
            style={{ letterSpacing: '-0.025em' }}
          >
            <span style={{ color: 'var(--color-accent-primary)' }}>H</span>
            <span style={{ color: 'var(--color-error)' }}>R</span>
            <span style={{ color: 'var(--color-accent-secondary)' }}>B</span>
            <span style={{ color: 'var(--color-text-primary)' }}>P</span>
            <span style={{ color: 'var(--color-text-primary)' }}>-Тест</span>
          </h1>
        </Link>

        <nav className="space-x-4 sm:space-x-6 flex items-center">
          {/* Ссылка "Тест" */}
          <Link
            to="/"
            onClick={(e) => handleNavLinkClick(e, '/')}
            className={`hidden sm:block text-lg font-medium transition-colors duration-300 ${isActive('/')}`}
          >
            Тест
          </Link>

          {/* Ссылка "Аналитика" */}
          <Link
            to="/analytics"
            onClick={(e) => handleNavLinkClick(e, '/analytics')}
            className={`text-lg font-medium transition-colors duration-300 ${isActive('/analytics')}`}
          >
            Аналитика
          </Link>

          {/* Ссылка "О проекте" */}
          <Link
            to="/about"
            onClick={(e) => handleNavLinkClick(e, '/about')}
            className={`hidden sm:block text-lg font-medium transition-colors duration-300 ${isActive('/about')}`}
            style={{ color: 'var(--color-accent-secondary)' }}
          >
            О проекте
          </Link>

          {/* ОФИЦИАЛЬНАЯ ИКОНКА TELEGRAM (теперь с цветом) */}
          <a href="https://t.me/hr_dushnila" target="_blank" rel="noopener noreferrer" className="transition-colors duration-300 hover:opacity-75">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#3390EC">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.35 8.16l-2.486 11.23c-.15.676-.562.847-.947.847-.282 0-.374-.117-.557-.291-.322-.387-1.785-1.185-2.296-1.378-.344-.131-.644-.249-.854-.249-.24 0-.458.128-.621.282l-2.036 1.956c-.255.245-.487.472-.82.472-.455 0-.621-.205-.733-.557L4.1 11.458c-.131-.482.029-.861.424-1.015l11.666-4.498c.404-.155.776-.046.993.284.218.33.242.756.069 1.107z" fill="#fff"/>
            </svg>
          </a>

          {/* ОФИЦИАЛЬНАЯ ИКОНКА LINKEDIN (теперь с цветом) */}
          <a href="https://www.linkedin.com/in/hr-dushnila/" target="_blank" rel="noopener noreferrer" className="transition-colors duration-300 hover:opacity-75">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M22.238 0H1.762C.787 0 0 .787 0 1.762v20.476C0 23.213.787 24 1.762 24h20.476c.975 0 1.762-.787 1.762-1.762V1.762C24 .787 23.213 0 22.238 0zM7.05 20.475H3.525V9.45H7.05v11.025zM5.287 7.846c-1.173 0-2.128-.955-2.128-2.128s.955-2.128 2.128-2.128 2.128.955 2.128 2.128-.955 2.128-2.128 2.128zM20.475 20.475h-3.525V14.12c0-1.5-.788-2.617-1.848-2.617-1.22 0-2.072.825-2.41 1.622-.11.267-.098.397-.098.775v6.575H9.075V9.45h3.334v1.442c.465-.678 1.144-1.42 2.768-1.42 2.012 0 3.524 1.31 3.524 4.14v6.863z" fill="#0A66C2"/>
            </svg>
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
