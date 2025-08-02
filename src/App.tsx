import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Импортируем новый компонент Header
import Header from './components/common/Header';

// Импортируем TestPage, который будет содержать логику старта/продолжения теста
import TestPage from './pages/TestPage';

// Импортируем AnalyticsDashboard
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';

function App() {
  return (
    <Router>
      {/* Главный контейнер приложения:
          - min-h-screen для заполнения всей высоты экрана
          - flex flex-col для вертикального размещения содержимого (Header, main)
          - font-sans для использования системного шрифта
          - style={{ color: 'var(--color-text-primary)' }} для применения основного цвета текста из CSS-переменных
          - ФОН (background-color и background-image) будет применен через стили body в index.css,
            поэтому здесь удалены классы bg-gradient-to-br и text-white.
      */}
      <div className="min-h-screen flex flex-col font-sans" style={{ color: 'var(--color-text-primary)' }}>
        {/* Header находится вне <main>, чтобы быть на всех страницах */}
        <Header />

        {/* Основной контент, который будет меняться в зависимости от маршрута
            - flex-grow: чтобы main занимал все доступное пространство
            - p-4 sm:p-6: отступы для адаптивности
            - flex items-center justify-center: центрирование содержимого по горизонтали и вертикали
        */}
        <main className="flex-grow p-4 sm:p-6 flex items-center justify-center">
          <Routes>
            {/* Домашняя страница, использующая TestPage */}
            <Route path="/" element={<TestPage />} />

            {/* Маршрут для дашборда аналитики */}
            <Route path="/analytics" element={<AnalyticsDashboard />} />

            {/* Важные примечания:
                - Если у вас появятся другие основные разделы, они должны быть определены здесь как отдельные <Route>.
                - Логика отображения TestRenderer, StartScreen, ResultDetailView теперь управляется внутри TestPage,
                  чтобы избежать сложных вложенных маршрутов для каждого состояния теста.
            */}
          </Routes>
        </main>

        {/* Здесь можно добавить Футер или другие глобальные элементы, если они понадобятся */}
      </div>
    </Router>
  );
}

export default App;
