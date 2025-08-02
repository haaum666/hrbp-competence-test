import React from 'react';
import { TestResult, AnswerDetail, Question, UserAnswer } from '../../types/test.d';
import DataExporter from './DataExporter';
import { Link } from 'react-router-dom';

interface ResultDetailViewProps {
  testResult: TestResult | null; 
  questions: Question[]; 
  userAnswers: UserAnswer[]; 
}

const ResultDetailView: React.FC<ResultDetailViewProps> = ({ testResult, questions, userAnswers }) => {
  if (!testResult) {
    return (
      <div className="bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md p-6 sm:p-8 max-w-3xl w-full mx-auto text-center border border-gray-700/50 text-bauhaus-white font-sans">
        <p className="text-2xl font-heading">Результаты теста не найдены.</p>
        <Link to="/" className="mt-6 inline-block bg-bauhaus-blue hover:bg-blue-700 text-bauhaus-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-bauhaus-blue focus:ring-opacity-50">
          Начать новый тест
        </Link>
      </div>
    );
  }

  const { totalQuestions, correctAnswers, incorrectAnswers, unanswered, scorePercentage, answers } = testResult;

  return (
    <div className="bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md p-6 sm:p-8 max-w-4xl w-full mx-auto border border-bauhaus-dark-gray text-bauhaus-white font-sans">
      <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-bauhaus-white text-center font-heading">
        Детальный Отчет по Тесту
      </h2>

      {/* Сводка результатов */}
      <div className="text-lg space-y-2 mb-8 p-4 bg-bauhaus-black bg-opacity-70 rounded-lg border border-bauhaus-dark-gray shadow-inner">
        <p className="text-bauhaus-light-gray">Всего вопросов: <span className="font-semibold text-bauhaus-white">{totalQuestions}</span></p>
        <p className="text-bauhaus-light-gray">Правильных ответов: <span className="font-semibold text-bauhaus-blue">{correctAnswers}</span></p>
        <p className="text-bauhaus-light-gray">Неправильных ответов: <span className="font-semibold text-bauhaus-red">{incorrectAnswers}</span></p>
        <p className="text-bauhaus-light-gray">Без ответа: <span className="font-semibold text-bauhaus-yellow">{unanswered}</span></p>
        <p className="text-2xl sm:text-3xl pt-4 border-t border-bauhaus-dark-gray mt-4">Итоговый балл: <span className="font-extrabold text-bauhaus-white">{scorePercentage.toFixed(2)}%</span></p>
      </div>

      {/* Кнопка экспорта данных */}
      <div className="flex justify-center mb-8">
        <DataExporter
          testResult={testResult}
          questions={questions}
          userAnswers={userAnswers}
        />
      </div>

      {/* Детали по каждому вопросу */}
      <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-bauhaus-white font-heading">Разбор вопросов:</h3>
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-bauhaus-dark-gray scrollbar-track-bauhaus-black"> {/* Добавлены стили для скроллбара */}
        {answers.map((detail: AnswerDetail, index: number) => {
          const questionData = questions.find(q => q.id === detail.question.id) || detail.question; // Используем questions из пропсов для полной информации
          const userAnswerData = userAnswers.find(ua => ua.questionId === questionData.id);

          const isCorrect = userAnswerData ? userAnswerData.isCorrect : false; // Корректность берем из userAnswerData
          const selectedOptionText = userAnswerData && userAnswerData.selectedOptionId
            ? questionData.options.find(opt => opt.id === userAnswerData.selectedOptionId)?.text || 'Не выбран'
            : 'Не отвечено';
          const correctOptionText = questionData.options.find(opt => opt.isCorrect)?.text || 'N/A';

          const borderColor = isCorrect ? 'border-bauhaus-blue' : (userAnswerData ? 'border-bauhaus-red' : 'border-bauhaus-gray');

          return (
            <div key={questionData.id} className={`bg-bauhaus-black bg-opacity-50 p-5 rounded-lg border-l-4 ${borderColor} shadow-md`}>
              <p className="font-medium text-bauhaus-white mb-3 text-lg sm:text-xl font-heading">
                Вопрос {index + 1}: {questionData.text}
                <span className={`ml-3 text-sm sm:text-base font-semibold ${
                  isCorrect ? 'text-bauhaus-blue' : (userAnswerData ? 'text-bauhaus-red' : 'text-bauhaus-yellow')
                }`}>
                  ({isCorrect ? 'Верно' : (userAnswerData ? 'Неверно' : 'Без ответа')})
                </span>
              </p>

              {selectedOptionText !== 'Не отвечено' && ( // Показываем "Ваш ответ" только если ответ был
                <p className="text-sm sm:text-base text-bauhaus-light-gray mb-2">
                  Ваш ответ: <span className={`font-normal ${isCorrect ? 'text-bauhaus-blue' : 'text-bauhaus-red'}`}>{selectedOptionText}</span>
                </p>
              )}

              {/* Правильный ответ показываем всегда, если он есть */}
              {correctOptionText !== 'N/A' && (
                <p className="text-sm sm:text-base text-bauhaus-light-gray">
                  Правильный ответ: <span className="font-normal text-bauhaus-yellow">{correctOptionText}</span>
                </p>
              )}

              {questionData.explanation && (
                <div className="mt-3 p-3 bg-bauhaus-dark-gray bg-opacity-70 rounded-md text-sm sm:text-base text-bauhaus-light-gray italic">
                  <strong className="text-bauhaus-white">Объяснение:</strong> {questionData.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-8">
        <Link to="/" onClick={() => {
          localStorage.removeItem('currentTestState'); // Очищаем состояние теста
        }} className="bg-bauhaus-blue hover:bg-blue-700 text-bauhaus-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-105 inline-block text-center">
          Вернуться к началу / Пройти тест снова
        </Link>
      </div>
    </div>
  );
};

export default ResultDetailView;
