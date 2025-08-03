// src/contexts/TestLogicContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import useTestLogic from '../hooks/useTestLogic'; // <--- ИМПОРТИРУЕМ НАШ ХУК ЗДЕСЬ

// Определяем интерфейс для значений, которые будут доступны через контекст.
// Он должен полностью соответствовать возвращаемому типу useTestLogic.
interface TestLogicContextType {
  currentQuestionIndex: number;
  userAnswers: any[]; // Было UserAnswer[] в useTestLogic, можно использовать Question[] и UserAnswer[] если импортировано
  testFinished: boolean;
  questions: any[]; // Было Question[]
  testStarted: boolean;
  testResult: any | null; // Было TestResult | null
  showResumeOption: boolean;
  remainingTime: number;
  progressPercentage: number;
  handleAnswerSelect: (questionId: string, selectedOptionId: string) => void;
  handleNextQuestion: () => void;
  handlePreviousQuestion: () => void;
  startNewTest: () => void;
  resumeTest: () => void;
  resetTestStateForNavigation: () => void;
}

// Создаем контекст с начальным значением undefined (будет заполнено провайдером)
// Использование undefined как начального значения и проверка на него в useTestLogicContext - это хорошая практика.
const TestLogicContext = createContext<TestLogicContextType | undefined>(undefined);

// Определяем пропсы для провайдера контекста. Теперь ему НИЧЕГО не нужно передавать,
// кроме children, так как он сам будет получать данные из useTestLogic.
interface TestLogicProviderProps {
  children: ReactNode;
}

// Создаем компонент-провайдер, который будет оборачивать наше приложение
export const TestLogicProvider: React.FC<TestLogicProviderProps> = ({ children }) => {
  // <--- ВОТ ГЛАВНОЕ ИЗМЕНЕНИЕ: ВЫЗЫВАЕМ useTestLogic ПРЯМО ВНУТРИ ПРОВАЙДЕРА!
  const testLogic = useTestLogic();

  // Добавляем лог, чтобы убедиться, что провайдер видит актуальное состояние testStarted
  console.log('TestLogicProvider: testStarted из хука:', testLogic.testStarted);

  return (
    <TestLogicContext.Provider value={testLogic}> {/* <--- ПЕРЕДАЕМ ВЕСЬ ОБЪЕКТ testLogic В КОНТЕКСТ */}
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
