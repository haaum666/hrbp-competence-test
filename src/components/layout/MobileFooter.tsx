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
    // Этот div будет нашим мобильным футером
    // `fixed bottom-0 left-0 right-0` прибивает его к низу экрана
    // `w-full` делает его шириной 100%
    // `sm:hidden` скрывает его на экранах sm и выше, т.е. он виден только на мобильных
    // `z-40` обеспечивает, что футер будет поверх другого контента
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

        {/* Ссылка "Контакты" */}
        <Link
          to="/contacts"
          onClick={(e) => handleNavLinkClick(e, '/contacts')}
          className={`flex flex-col items-center text-xs font-medium ${isActive('/contacts')}`}
          // Условное применение цвета, аналогично "О проекте"
          style={{ color: isActive('/contacts') === 'text-text-primary' ? 'var(--color-text-primary)' : 'var(--color-accent-secondary)' }}
        >
          {/* Иконка для "Контакты" (конверт) */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          <span className="mt-1">Контакты</span>
        </Link>
      </nav>
    </footer>
  );
};

export default MobileFooter;
