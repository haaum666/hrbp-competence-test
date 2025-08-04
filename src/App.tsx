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
        {/* flex flex-col позволит содержимому (Header, main, MobileFooter) располагаться вертикально */}
        <div className="min-h-screen flex flex-col font-sans" style={{ color: 'var(--color-text-primary)' }}>
          <Header />
          
          {/* Основное содержимое, которое будет занимать все доступное вертикальное пространство */}
          {/* pt-28 sm:pt-6: Добавим верхний отступ здесь для всего контента страницы.
              pt-28 (112px) для мобильных, чтобы избежать перекрытия хедером.
              sm:pt-6 (24px) для десктопа, чтобы контент не был слишком прижат к хедеру.
              pb-20 sm:pb-0: Нижний отступ для футера на мобильных. */}
          <main className="flex-grow flex flex-col items-center justify-start pt-28 sm:pt-6 pb-20 sm:pb-0"> {/* <-- ИЗМЕНЕНИЯ ЗДЕСЬ */}
            <Routes>
              <Route path="/" element={<TestPage />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
            </Routes>
          </main>
          
          {/* MobileFooter будет рендериться здесь, но его позиционирование `fixed`
              внутри самого MobileFooter.tsx вынесет его из обычного потока,
              поэтому он не будет влиять на main. Однако, App.tsx должен знать о его высоте
              через padding-bottom на main. */}
        </div>
      </TestLogicProvider>
    </Router>
  );
}

export default App;
