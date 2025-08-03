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
  // testStarted: boolean; // УДАЛЕН: Больше не нужен, т.к. кнопка "На главную" всегда видна
}

const Sidebar: React.FC<SidebarProps> = ({
  isModalOpen,
  onOpenModal,
  onCloseModal,
  onConfirmExit,
  // testStarted, // УДАЛЕН: Больше не нужен
}) => {
  // УНИФИЦИРОВАННЫЕ СТИЛИ ДЛЯ КНОПОК
  // Используем те же стили, что и для других кнопок в вашем проекте
  const getButtonStyle = (isPrimary: boolean) => ({
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
    // Яркость при наведении
    e.currentTarget.style.filter = isEnter ? 'brightness(0.9)' : 'brightness(1.0)';
  };

  return (
    <>
      {/* Этот блок будет виден только на больших экранах (md и выше) */}
      {/* ПОЗИЦИЯ ИЗМЕНЕНА: Теперь в левом нижнем углу */}
      <div
        className="hidden md:flex flex-col items-center p-3 space-y-3
                   fixed left-4 bottom-4 z-40 /* ИЗМЕНЕНО: top-1/2 -translate-y-1/2 на bottom-4 */
                   rounded-xl shadow-xl transition-opacity duration-300 opacity-50 hover:opacity-100
                   w-auto max-w-xs"
        style={{
          backgroundColor: 'var(--color-background-card)',
          backgroundImage: 'var(--texture-grain)',
          backgroundSize: '4px 4px',
          backgroundRepeat: 'repeat',
          border: '2px solid var(--color-neutral)',
          boxShadow: '4px 4px 0px 0px var(--color-neutral)', // Тень для самого блока
        }}
      >
        {/* Кнопки навигации */}
        <Link
          to="/contacts"
          className="w-full font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 text-center font-sans"
          style={getButtonStyle(false)}
          onMouseEnter={(e) => handleButtonHover(e, false, true)}
          onMouseLeave={(e) => handleButtonHover(e, false, false)}
        >
          Контакты
        </Link>
        <Link
          to="/about"
          className="w-full font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 text-center font-sans"
          style={getButtonStyle(false)}
          onMouseEnter={(e) => handleButtonHover(e, false, true)}
          onMouseLeave={(e) => handleButtonHover(e, false, false)}
        >
          О проекте
        </Link>
        {/* Кнопка "На главную" теперь всегда видна на десктопе */}
        <button
          onClick={onOpenModal}
          className="w-full font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 text-center font-sans"
          style={getButtonStyle(true)}
          onMouseEnter={(e) => handleButtonHover(e, true, true)}
          onMouseLeave={(e) => handleButtonHover(e, true, false)}
        >
          На главную
        </button>
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
