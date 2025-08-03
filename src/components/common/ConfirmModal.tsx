// src/components/common/ConfirmModal.tsx
import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
}) => {
  if (!isOpen) {
    return null;
  }

  // Общие стили для кнопок модального окна
  const getModalButtonStyle = (isPrimary: boolean) => ({
    backgroundColor: isPrimary ? 'var(--button-primary-bg)' : 'var(--button-secondary-bg)',
    color: isPrimary ? 'var(--button-primary-text)' : 'var(--button-secondary-text)',
    backgroundImage: 'var(--texture-grain)',
    backgroundSize: '4px 4px',
    backgroundRepeat: 'repeat',
    filter: 'brightness(1.0)',
    transition: 'filter 0.3s ease',
    border: isPrimary ? `1px solid var(--button-primary-border)` : `1px solid var(--button-secondary-border)`,
  });

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isPrimaryButton: boolean, isEnter: boolean) => {
    if (isPrimaryButton) {
      e.currentTarget.style.filter = isEnter ? 'brightness(0.9)' : 'brightness(1.0)';
    } else {
      e.currentTarget.style.filter = isEnter ? 'brightness(0.95)' : 'brightness(1.0)';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} // Прозрачный черный фон для затемнения
    >
      <div
        className="relative p-6 rounded-xl shadow-2xl max-w-sm w-full text-center"
        style={{
          backgroundColor: 'var(--color-background-card)',
          backgroundImage: 'var(--texture-grain)',
          backgroundSize: '4px 4px',
          backgroundRepeat: 'repeat',
          color: 'var(--color-text-primary)',
          border: '2px solid var(--color-neutral)',
          boxShadow: '4px 4px 0px 0px var(--color-neutral)',
        }}
      >
        <h3 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </h3>
        <p className="text-base sm:text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          {message}
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto font-bold py-2 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50"
            style={getModalButtonStyle(true)}
            onMouseEnter={(e) => handleButtonHover(e, true, true)}
            onMouseLeave={(e) => handleButtonHover(e, true, false)}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto font-bold py-2 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50"
            style={getModalButtonStyle(false)}
            onMouseEnter={(e) => handleButtonHover(e, false, true)}
            onMouseLeave={(e) => handleButtonHover(e, false, false)}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
