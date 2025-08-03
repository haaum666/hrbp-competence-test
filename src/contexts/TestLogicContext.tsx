// src/contexts/TestLogicContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';

// Определяем интерфейс для значений, которые будут доступны через контекст
interface TestLogicContextType {
  testStarted: boolean;
  resetTestStateForNavigation: () => void;
  // Добавьте сюда любые другие состояния/функции из useTestLogic,
  // которые могут понадобиться в Header или других несвязанных компонентах.
}

// Создаем контекст с начальными значениями null (или дефолтными значениями).
// Важно, чтобы Provider всегда предоставлял реальные значения.
const TestLogicContext = createContext<TestLogicContextType | undefined>(undefined);

// Определяем пропсы для провайдера контекста
interface TestLogicProviderProps {
  children: ReactNode;
  testStarted: boolean;
  resetTestStateForNavigation: () => void;
}

// Создаем компонент-провайдер, который будет оборачивать наше приложение
export const TestLogicProvider: React.FC<TestLogicProviderProps> = ({
  children,
  testStarted,
  resetTestStateForNavigation,
}) => {
  const value = {
    testStarted,
    resetTestStateForNavigation,
  };

  return (
    <TestLogicContext.Provider value={value}>
      {children}
    </TestLogicContext.Provider>
  );
};

// Создаем хук для удобного доступа к значениям контекста
export const useTestLogicContext = () => {
  const context = useContext(TestLogicContext);
  if (context === undefined) {
    throw new Error('useTestLogicContext must be used within a TestLogicProvider');
  }
  return context;
};
