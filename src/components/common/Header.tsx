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
            style={{ color: 'var(--color-accent-primary)' }}
          >
            О проекте
          </Link>

          {/* ИКОНКА TELEGRAM (теперь с цветом) */}
          <a href="https://t.me/hr_dushnila" target="_blank" rel="noopener noreferrer" className="transition-colors duration-300 hover:opacity-75">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#26A5E4" width="24" height="24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L6 12zm0 0h12" />
            </svg>
          </a>

          {/* ИКОНКА LINKEDIN (теперь с цветом) */}
          <a href="https://www.linkedin.com/in/hr-dushnila/" target="_blank" rel="noopener noreferrer" className="transition-colors duration-300 hover:opacity-75">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#0A66C2">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.765s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.765-1.75 1.765zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
