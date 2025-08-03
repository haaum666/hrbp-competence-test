// src/App.tsx

import React from 'react'; // Удаляем useEffect, так как он больше не нужен напрямую здесь
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Импортируем наш провайдер контекста
import { TestLogicProvider } from './contexts/TestLogicContext';

// Импортируем компонент Header
import Header from './components/common/Header';

// Импортируем TestPage, который будет содержать логику старта/продолжения теста
import TestPage from './pages/TestPage';

// Импортируем AnalyticsDashboard
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';

// УДАЛЯЕМ ИМПОРТ useTestLogic, так как он теперь вызывается внутри TestLogicProvider
// import useTestLogic from './hooks/useTestLogic'; 

function App() {
  console.log('App.tsx: Рендер компонента App.'); // Оставляем этот лог для отслеживания рендеров App

  // УДАЛЯЕМ ВЫЗОВ useTestLogic() ЗДЕСЬ, так как он теперь в TestLogicProvider
  // const {
  //   testStarted,
  //   resetTestStateForNavigation,
  // } = useTestLogic();

  // УДАЛЯЕМ ЭТОТ ЛОГ, так как testStarted больше не определяется здесь
  // console.log('App.tsx: testStarted из useTestLogic (после вызова хука):', testStarted);


  return (
    <Router>
      {/* <--- ГЛАВНОЕ ИЗМЕНЕНИЕ: TestLogicProvider теперь не принимает пропсы testStarted и resetTestStateForNavigation,
                 поскольку он сам вызывает useTestLogic и предоставляет все его значения через контекст. */}
      <TestLogicProvider> 
        <div className="min-h-screen flex flex-col font-sans" style={{ color: 'var(--color-text-primary)' }}>
          <Header />
          <main className="flex-grow p-4 sm:p-6 flex items-center justify-center">
            <Routes>
              <Route path="/" element={<TestPage />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
            </Routes>
          </main>
        </div>
      </TestLogicProvider>
    </Router>
  );
}

export default App;
