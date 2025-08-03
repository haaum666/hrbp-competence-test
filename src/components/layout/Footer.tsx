// src/components/layout/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import ConfirmModal from '../common/ConfirmModal'; // Импортируем модальное окно

interface FooterProps {
  // Пропсы для управления модальным окном
  isModalOpen: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
  onConfirmExit: () => void; // Функция для подтверждения выхода и сброса теста
  testStarted: boolean; // Нужно, чтобы знать, активен ли тест
}

const Footer: React.FC<FooterProps> = ({
  isModalOpen,
  onOpenModal,
  onCloseModal,
  onConfirmExit,
  testStarted,
}) => {
  // УНИФИЦИРОВАННЫЕ СТИЛИ ДЛЯ КНОПОК ПОДВАЛА
  const getFooterButtonStyle = (isPrimary: boolean) => ({
    backgroundColor: isPrimary ? 'var(--button-primary-bg)' : 'var(--button-secondary-bg)',
    color: isPrimary ? 'var(--button-primary-text)' : 'var(--button-secondary-text)',
    backgroundImage: 'var(--texture-grain)',
    backgroundSize: '4px 4px',
    backgroundRepeat: 'repeat',
    filter: 'brightness(1.0)',
    transition: 'filter 0.3s ease',
    border: isPrimary ? `1px solid var(--button-primary-border)` : `1px solid var(--button-secondary-border)`,
    boxShadow: '2px 2px 0px 0px var(--color-text-primary)', // Тень для кнопок
  });

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>, isPrimaryButton: boolean, isEnter: boolean) => {
    e.currentTarget.style.filter = isEnter ? 'brightness(0.9)' : 'brightness(1.0)';
  };

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 md:hidden flex justify-around items-center p-3 rounded-t-xl shadow-2xl"
        style={{
          backgroundColor: 'var(--color-background-card)',
          backgroundImage: 'var(--texture-grain)',
          backgroundSize: '4px 4px',
          backgroundRepeat: 'repeat',
          color: 'var(--color-text-primary)',
          borderTop: '2px solid var(--color-neutral)', // Верхняя граница для подвала
          boxShadow: '0px -4px 0px 0px var(--color-neutral)', // Тень сверху
        }}
      >
        <Link
          to="/"
          className="flex flex-col items-center text-xs font-semibold p-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          style={{color: 'var(--color-text-primary)'}}
        >
          {/* Иконка для главной, если у вас есть иконочная библиотека */}
          <span className="mb-1 text-base">🏠</span>
          Главная
        </Link>
        <Link
          to="/contacts"
          className="flex flex-col items-center text-xs font-semibold p-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          style={{color: 'var(--color-text-primary)'}}
        >
          {/* Иконка для контактов */}
          <span className="mb-1 text-base">📞</span>
          Контакты
        </Link>
        <Link
          to="/about"
          className="flex flex-col items-center text-xs font-semibold p-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          style={{color: 'var(--color-text-primary)'}}
        >
          {/* Иконка для "О проекте" */}
          <span className="mb-1 text-base">ℹ️</span>
          О проекте
        </Link>
        {testStarted && (
          <button
            onClick={onOpenModal}
            className="flex flex-col items-center text-xs font-semibold p-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
            style={{ ...getFooterButtonStyle(true), minWidth: '80px', flexShrink: 0 }} // Стили для кнопки "Вернуться на главную"
            onMouseEnter={(e) => handleButtonHover(e, true, true)}
            onMouseLeave={(e) => handleButtonHover(e, true, false)}
          >
            <span className="mb-1 text-base">↩️</span>
            На главную
          </button>
        )}
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

export default Footer;
