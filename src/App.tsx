// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { TestLogicProvider } from './contexts/TestLogicContext';
import Header from './components/common/Header';
import TestPage from './pages/TestPage';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';

function App() {
  console.log('App.tsx: Рендер компонента App.');

  return (
    <Router>
      <TestLogicProvider>
        {/* Главный контейнер приложения. min-h-screen обеспечит, что он всегда занимает всю высоту */}
        {/* flex flex-col позволит содержимому (Header, main) располагаться вертикально */}
        <div className="min-h-screen flex flex-col font-sans" style={{ color: 'var(--color-text-primary)' }}>
          <Header />
          
          {/* Основное содержимое, которое будет занимать все доступное вертикальное пространство */}
          {/* pt-28: для мобильных (112px) - остается без изменений
              sm:pt-32: для десктопа (128px) - увеличено с sm:pt-20
              pb-20 sm:pb-0: Нижний отступ для футера на мобильных. */}
          <main className="flex-grow flex flex-col items-center justify-start pt-28 sm:pt-32 pb-20 sm:pb-0"> {/* <-- ИЗМЕНЕНИЯ ЗДЕСЬ */}
            <Routes>
              <Route path="/" element={<TestPage />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
            </Routes>
          </main>
          
          {/* MobileFooter будет рендериться, его позиционирование `fixed` 
              внутри самого MobileFooter.tsx вынесет его из обычного потока.
              App.tsx компенсирует его высоту через padding-bottom на main. */}
        </div>
      </TestLogicProvider>
    </Router>
  );
}

export default App;
