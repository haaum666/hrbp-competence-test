// src/components/common/Header.tsx

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTestLogicContext } from '../../contexts/TestLogicContext';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { testStarted, resetTestStateForNavigation } = useTestLogicContext();

  // ДОБАВЛЕНО: Этот лог будет показывать testStarted из контекста при каждом рендере Header.
  console.log('Header.tsx: testStarted из контекста:', testStarted);

  const isActive = (path: string) => {
    return location.pathname === path
      ? 'text-text-primary border-b-2 border-text-primary shadow-sm-bottom'
      : 'text-text-secondary hover:text-text-primary';
  };

  const handleLogoClick = () => {
    if (testStarted) {
      console.log('Header: Тест запущен, сбрасываю состояние теста для навигации.');
      resetTestStateForNavigation();
    } else {
      console.log('Header: Тест не запущен, просто перехожу на главную.');
    }
    navigate('/');
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
        <div
          onClick={handleLogoClick}
          className="text-2xl sm:text-3xl font-extrabold tracking-wide flex items-center cursor-pointer"
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
          <span style={{ color: 'var(--color-accent-primary)' }}>H</span>
          <span style={{ color: 'var(--color-error)' }}>R</span>
          <span style={{ color: 'var(--color-accent-secondary)' }}>B</span>
          <span style={{ color: 'var(--color-text-primary)' }}>P</span>
          <span style={{ color: 'var(--color-text-primary)' }}>-Тест</span> {/* <-- ИСПРАВЛЕНО ЗДЕСЬ! */}
        </div>

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
