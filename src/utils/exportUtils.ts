import { TestResult, Question, UserAnswer, AnswerDetail } from '../types/test.d';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx'; // Импортируем всю библиотеку как XLSX

/**
 * Преобразует данные TestResult в массив объектов, готовых для экспорта в CSV/XLSX.
 * Каждая строка соответствует одному вопросу с деталями ответа пользователя.
 * @param {TestResult} testResult - Объект с результатами теста.
 * @returns {Array<Object>} Массив объектов, где каждый объект - это строка таблицы.
 */
const prepareDataForExport = (testResult: TestResult) => {
  const data: any[] = [];

  // Добавляем общую статистику в первую строку для удобства
  data.push({
    'Тип данных': 'Общая статистика',
    'Всего вопросов': testResult.totalQuestions,
    'Правильных ответов': testResult.correctAnswers,
    'Неправильных ответов': testResult.incorrectAnswers,
    'Пропущено вопросов': testResult.unanswered,
    'Итоговый балл (%)': testResult.scorePercentage.toFixed(2),
    '': '', // Пустые столбцы для выравнивания
    ' ': '',
    '  ': '',
    '  ': '',
    '   ': '',
    '    ': '',
    '     ': '',
    '      ': '',
    '       ': '',
    '        ': '',
    '         ': '',
  });

  // Добавляем пустую строку для разделения
  data.push({});

  // Добавляем заголовки для детальных результатов
  data.push({
    'Тип данных': 'Детали по вопросам',
    'Вопрос ID': 'Вопрос ID',
    'Текст вопроса': 'Текст вопроса',
    'Тип вопроса': 'Тип вопроса',
    'Категория': 'Категория',
    'Сложность': 'Сложность',
    'Время на вопрос (сек)': 'Время на вопрос (сек)',
    'Выбранный ID ответа': 'Выбранный ID ответа',
    'Текст выбранного ответа': 'Текст выбранного ответа',
    'Правильный ID ответа': 'Правильный ID ответа',
    'Текст правильного ответа': 'Текст правильного ответа',
    'Ответ верен?': 'Ответ верен?',
    'Время потрачено (сек)': 'Время потрачено (сек)',
  });


  testResult.answers.forEach((answerDetail: AnswerDetail) => {
    const question = answerDetail.question;
    const userAnswer = answerDetail.userAnswer;

    // Находим текст выбранного ответа
    const selectedOptionText = userAnswer?.selectedOptionId
      ? question.options?.find(opt => opt.id === userAnswer.selectedOptionId)?.text || 'Не найдено'
      : 'Нет ответа';

    // Находим текст правильного ответа
    const correctOptionText = question.correctAnswer
      ? question.options?.find(opt => opt.id === question.correctAnswer)?.text || 'Не найдено'
      : 'N/A (Нет однозначного правильного)';

    data.push({
      'Тип данных': 'Вопрос',
      'Вопрос ID': question.id,
      'Текст вопроса': question.text,
      'Тип вопроса': question.type,
      'Категория': question.category || 'Не указано',
      'Сложность': question.difficulty || 'Не указано',
      'Время на вопрос (сек)': question.timeEstimate,
      'Выбранный ID ответа': userAnswer?.selectedOptionId || 'N/A',
      'Текст выбранного ответа': selectedOptionText,
      'Правильный ID ответа': question.correctAnswer || 'N/A',
      'Текст правильного ответа': correctOptionText,
      'Ответ верен?': answerDetail.isCorrect ? 'Да' : 'Нет',
      'Время потрачено (сек)': userAnswer?.timeSpent?.toFixed(0) || '0',
    });
  });

  return data;
};

/**
 * Экспортирует результаты теста в CSV файл.
 * @param {TestResult} testResult - Объект с результатами теста.
 * @param {string} fileName - Имя файла без расширения.
 */
export const exportToCsv = (testResult: TestResult, fileName: string = 'test_results') => {
  const data = prepareDataForExport(testResult);

  // Генерация CSV из массива объектов
  const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true }); // skipHeader: true, так как заголовки уже в prepareDataForExport
  const csv = XLSX.utils.sheet_to_csv(worksheet, { FS: ';', RS: '\n' }); // Используем ';' как разделитель

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}.csv`);
};

/**
 * Экспортирует результаты теста в XLSX файл.
 * @param {TestResult} testResult - Объект с результатами теста.
 * @param {string} fileName - Имя файла без расширения.
 */
export const exportToXlsx = (testResult: TestResult, fileName: string = 'test_results') => {
  const data = prepareDataForExport(testResult);

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true }); // skipHeader: true

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Результаты Теста');

  // Автоматическая ширина столбцов
  const max_width = data.reduce((w, r) => Math.max(w, ...Object.values(r).map(val => (val ? String(val).length : 0))), 10);
  worksheet['!cols'] = Array.from({ length: Object.keys(data[0] || {}).length }, () => ({ wch: max_width }));


  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
