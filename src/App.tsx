import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Импортируем новый компонент Header
import Header from './components/common/Header';

// Импортируем TestPage, который будет содержать логику старта/продолжения теста
import TestPage from './pages/TestPage'; // Убедитесь, что TestPage.tsx существует в src/pages/

// Импортируем AnalyticsDashboard
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';

function App() {
  return (
    <Router>
      {/* Главный контейнер приложения: фон, минимальная высота */}
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col font-sans">
        {/* Header находится вне <main>, чтобы быть на всех страницах */}
        <Header /> 

        {/* Основной контент, который будет меняться в зависимости от маршрута */}
        <main className="flex-grow p-4 sm:p-6 flex items-center justify-center">
          <Routes>
            {/* Домашняя страница, использующая TestPage */}
            <Route path="/" element={<TestPage />} /> 

            {/* Маршрут для дашборда аналитики */}
            <Route path="/analytics" element={<AnalyticsDashboard />} />

            {/* Внимание: Если у вас есть другие маршруты (например, /test или /results),
                их также нужно будет перенести в TestPage.tsx или создать для них отдельные компоненты/страницы.
                В текущем состоянии App.tsx, маршрут '/test' и '/results' удалены, 
                так как TestPage будет управлять состоянием теста и отображать TestRenderer/ResultDetailView 
                в зависимости от него, а не через отдельные маршруты.
                Если TestPage будет управлять отображением, то роуты '/test' и '/results' здесь не нужны.
                Если же вы хотите сохранить их как отдельные страницы, то нужно будет создать соответствующие файлы.

                На данный момент, предполагается, что TestPage будет отображать логику теста.
            */}
          </Routes>
        </main>

        {/* Футер или другие глобальные элементы, если они понадобятся */}
      </div>
    </Router>
  );
}

export default App;
