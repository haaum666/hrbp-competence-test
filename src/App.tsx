import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-6">Добро пожаловать в HRBP-Тест!</h1>
        <p className="text-lg text-center">
          Это базовая версия приложения. Скоро здесь появятся вопросы и функциональность.
        </p>
        <p className="text-sm mt-4">
          Пока вы можете проверить, что все работает.
        </p>
        <div className="mt-8">
          {/* Здесь будут маршруты для разных страниц */}
          <Routes>
            <Route path="/" element={<p>Главная страница (скоро)</p>} />
            <Route path="/test" element={<p>Страница теста (скоро)</p>} />
            <Route path="/results" element={<p>Страница результатов (скоро)</p>} />
            <Route path="*" element={<p>Страница не найдена</p>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
