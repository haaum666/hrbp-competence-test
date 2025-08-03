// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Импортируем наш пользовательский хук для логики теста
import useTestLogic from './hooks/useTestLogic';

// Импортируем наш провайдер контекста
import { TestLogicProvider } from './contexts/TestLogicContext';

// Импортируем новый компонент Header
import Header from './components/common/Header';

// Импортируем TestPage, который будет содержать логику старта/продолжения теста
import TestPage from './pages/TestPage';

// Импортируем AnalyticsDashboard
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';

function App() {
  // НОВОЕ: Добавлен лог для отслеживания рендера компонента App
  console.log('App.tsx: Рендер компонента App.'); // Этот лог покажет каждый рендер App

  // Инициализируем всю логику теста с помощью нашего хука
  const {
    testStarted,
    resetTestStateForNavigation,
    // ... здесь могут быть другие возвращаемые значения из useTestLogic,
    // если они когда-либо понадобятся глобально в App или в других Provider'ах
  } = useTestLogic();

  // НОВОЕ: Этот лог теперь находится ПОСЛЕ вызова useTestLogic(),
  // чтобы получить актуальное значение testStarted
  console.log('App.tsx: testStarted из useTestLogic (после вызова хука):', testStarted);


  return (
    <Router>
      {/* Оборачиваем все приложение в TestLogicProvider, передавая ему необходимые значения */}
      {/* testStarted и resetTestStateForNavigation передаются из useTestLogic */}
      <TestLogicProvider
        testStarted={testStarted}
        resetTestStateForNavigation={resetTestStateForNavigation}
      >
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
