// src/components/layout/MobileFooter.tsx

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTestLogicContext } from '../../contexts/TestLogicContext';

const MobileFooter: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { testStarted, resetTestStateForNavigation } = useTestLogicContext();

  const isActive = (path: string) => {
    return location.pathname === path
      ? 'text-text-primary' // Более простой активный стиль для футера
      : 'text-text-secondary';
  };

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    console.log(`MobileFooter: Клик по ссылке "${path}". testStarted:`, testStarted);
    if (testStarted) {
      e.preventDefault();
      console.log(`MobileFooter: Тест запущен. Предотвращаю дефолт. Вызываю resetTestStateForNavigation() и navigate(${path})`);
      resetTestStateForNavigation();
      navigate(path);
      console.log(`MobileFooter: Вызовы resetTestStateForNavigation и navigate завершены.`);
    }
  };

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 w-full py-3 px-4 sm:hidden z-40"
      style={{
        backgroundColor: 'var(--color-background-card)',
        backgroundImage: 'var(--texture-grain)',
        backgroundSize: '4px 4px',
        backgroundRepeat: 'repeat',
        borderTop: '2px solid var(--color-text-primary)',
        boxShadow: '0px -4px 0px 0px var(--color-neutral)',
      }}
    >
      <nav className="flex justify-around items-center h-full">
        {/* Ссылка "Тест" */}
        <Link
          to="/"
          onClick={(e) => handleNavLinkClick(e, '/')}
          className={`flex flex-col items-center text-xs font-medium ${isActive('/')}`}
        >
          {/* Иконка для "Тест" (изображает академическую шапочку) */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-graduation-cap"><path d="M22 10v6M12 15l-10-5L12 4l10 5-10 5ZM2 10l10 5L22 10"></path><path d="M6 12L2 10M12 20v-5M18 12l4-2"></path></svg>
          <span className="mt-1">Тест</span>
        </Link>

        {/* Ссылка "О проекте" */}
        <Link
          to="/about"
          onClick={(e) => handleNavLinkClick(e, '/about')}
          className={`flex flex-col items-center text-xs font-medium ${isActive('/about')}`}
          // Условное применение цвета, чтобы активный цвет был основным, а неактивный - акцентным
          style={{ color: isActive('/about') === 'text-text-primary' ? 'var(--color-text-primary)' : 'var(--color-accent-secondary)' }}
        >
          {/* Иконка для "О проекте" (информация) */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          <span className="mt-1">О проекте</span>
        </Link>

        {/* Ссылка "Аналитика" */}
        <Link
          to="/analytics"
          onClick={(e) => handleNavLinkClick(e, '/analytics')}
          className={`flex flex-col items-center text-xs font-medium ${isActive('/analytics')}`}
        >
          {/* Иконка для "Аналитики" (диаграмма) */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
          <span className="mt-1">Аналитика</span>
        </Link>

        {/* ИКОНКА TELEGRAM (ПЕРЕНЕСЕНА ИЗ HEADER) */}
        <a href="https://t.me/hr_dushnila" target="_blank" rel="noopener noreferrer" className="transition-colors duration-300 hover:opacity-75">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#26A5E4" width="24" height="24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L6 12zm0 0h12" />
          </svg>
        </a>

        {/* ИКОНКА LINKEDIN (ПЕРЕНЕСЕНА ИЗ HEADER) */}
        <a href="https://www.linkedin.com/in/hr-dushnila/" target="_blank" rel="noopener noreferrer" className="transition-colors duration-300 hover:opacity-75">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#0A66C2">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.765s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.765-1.75 1.765zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
        </a>
      </nav>
    </footer>
  );
};

export default MobileFooter;
