// src/components/layout/Sidebar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import ConfirmModal from '../common/ConfirmModal'; // Импортируем модальное окно

interface SidebarProps {
  // Пропсы для управления модальным окном
  isModalOpen: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
  onConfirmExit: () => void; // Функция для подтверждения выхода и сброса теста
  testStarted: boolean; // Нужно, чтобы знать, активен ли тест
}

const Sidebar: React.FC<SidebarProps> = ({
  isModalOpen,
  onOpenModal,
  onCloseModal,
  onConfirmExit,
  testStarted,
}) => {
  // УНИФИЦИРОВАННЫЕ СТИЛИ ДЛЯ КНОПОК САЙДБАРА
  // Полностью соответствуют стилю кнопок теста, используя переменные CSS
  const getSidebarButtonStyle = (isPrimary: boolean) => ({
    backgroundColor: isPrimary ? 'var(--button-primary-bg)' : 'var(--button-secondary-bg)',
    color: isPrimary ? 'var(--button-primary-text)' : 'var(--button-secondary-text)',
    backgroundImage: 'var(--texture-grain)',
    backgroundSize: '4px 4px',
    backgroundRepeat: 'repeat',
    filter: 'brightness(1.0)',
    transition: 'filter 0.3s ease',
    border: isPrimary ? `1px solid var(--button-primary-border)` : `1px solid var(--button-secondary-border)`,
    boxShadow: '2px 2px 0px 0px var(--color-text-primary)', // Тень для кнопок, как у основного текста
  });

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>, isPrimaryButton: boolean, isEnter: boolean) => {
    // Яркость при наведении, как в других кнопках
    e.currentTarget.style.filter = isEnter ? 'brightness(0.9)' : 'brightness(1.0)';
  };

  return (
    <>
      <div
        className="hidden md:flex flex-col items-start p-4 rounded-xl shadow-xl flex-shrink-0"
        style={{
          width: '200px', // Фиксированная ширина сайдбара
          backgroundColor: 'var(--color-background-card)',
          backgroundImage: 'var(--texture-grain)',
          backgroundSize: '4px 4px',
          backgroundRepeat: 'repeat',
          color: 'var(--color-text-primary)',
          border: '2px solid var(--color-neutral)',
          boxShadow: '4px 4px 0px 0px var(--color-neutral)', // Тень для самой панели
        }}
      >
        <h3 className="text-xl font-bold mb-6 w-full text-center font-heading" style={{color: 'var(--color-text-primary)'}}>
          Навигация
        </h3>
        <div className="flex flex-col space-y-4 w-full">
          <Link
            to="/"
            className="w-full font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 text-center font-sans"
            style={getSidebarButtonStyle(false)}
            onMouseEnter={(e) => handleButtonHover(e, false, true)}
            onMouseLeave={(e) => handleButtonHover(e, false, false)}
          >
            Главная
          </Link>
          <Link
            to="/contacts" // Предполагаемый путь, если у вас есть страница контактов
            className="w-full font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 text-center font-sans"
            style={getSidebarButtonStyle(false)}
            onMouseEnter={(e) => handleButtonHover(e, false, true)}
            onMouseLeave={(e) => handleButtonHover(e, false, false)}
          >
            Контакты
          </Link>
          <Link
            to="/about" // Предполагаемый путь, если у вас есть страница "О проекте"
            className="w-full font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 text-center font-sans"
            style={getSidebarButtonStyle(false)}
            onMouseEnter={(e) => handleButtonHover(e, false, true)}
            onMouseLeave={(e) => handleButtonHover(e, false, false)}
          >
            О проекте
          </Link>
          {testStarted && ( // Кнопка "Вернуться на главную" появляется только если тест запущен
            <button
              onClick={onOpenModal}
              className="w-full font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 text-center font-sans"
              style={getSidebarButtonStyle(true)} // Используем Primary стиль для этой важной кнопки
              onMouseEnter={(e) => handleButtonHover(e, true, true)}
              onMouseLeave={(e) => handleButtonHover(e, true, false)}
            >
              Вернуться на главную
            </button>
          )}
        </div>
      </div>

      {/* Модальное окно подтверждения, управляемое из TestPage через пропсы */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        onConfirm={onConfirmExit}
        title="Вернуться на главную?"
        message="Вы уверены, что хотите завершить тест и вернуться на главную? Весь текущий прогресс будет потерян."
        confirmText="Да, вернуться"
        cancelText="Отмена"
      />
    </>
  );
};

export default Sidebar;
