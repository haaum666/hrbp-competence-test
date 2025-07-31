// src/data/questions.ts
import { Question } from '../types/test';

export const generateQuestions = (): Question[] => [
  {
    id: 'q1',
    categoryid: 'strategy', // Исправлено на categoryid
    level: 'junior',
    type: 'multiple-choice',
    text: 'Какова основная роль HRBP в стратегическом планировании бизнеса?',
    options: [
      { id: 'a', text: 'Управление кадровым учетом и делопроизводством.' },
      { id: 'b', text: 'Поддержка менеджмента в реализации бизнес-стратегии через управление человеческими ресурсами.' },
      { id: 'c', text: 'Организация корпоративных мероприятий.' },
      { id: 'd', text: 'Оценка эффективности рекламы продуктов компании.' },
    ],
    correctAnswer: 'b',
    explanation: 'Основная роль HRBP - выступать в качестве стратегического партнера, интегрируя HR-практики с общими целями бизнеса.',
    sources: 'SHRM Competency Model',
    difficulty: 1,
    timeEstimate: 30,
  },
  {
    id: 'q2',
    categoryid: 'analytics', // Исправлено на categoryid
    level: 'middle',
    type: 'case-study',
    text: 'Ваша компания столкнулась с высокой текучестью кадров в отделе продаж (25% за последний год). Какие три ключевых шага вы предпримете для анализа и решения этой проблемы?',
    // Для case-study и prioritization типов вопросов options и correctAnswer не нужны
    // options: [],
    // correctAnswer: [],
    explanation: 'Для кейсов требуется многоступенчатый анализ, включающий сбор данных, выявление причин и разработку плана действий.',
    sources: 'People Analytics Best Practices',
    difficulty: 2,
    timeEstimate: 120,
  },
  {
    id: 'q3',
    categoryid: 'talent', // Исправлено на categoryid
    level: 'senior',
    type: 'multiple-choice',
    text: 'Какой подход наиболее эффективен для развития лидерских компетенций у топ-менеджеров?',
    options: [
      { id: 'a', text: 'Стандартизированные онлайн-курсы для всех.' },
      { id: 'b', text: 'Индивидуальный коучинг и менторство с персонализированными программами развития.' },
      { id: 'c', text: 'Ежегодные масштабные тренинги по общим темам.' },
      { id: 'd', text: 'Фокусировка только на технических навыках.' },
    ],
    correctAnswer: 'b',
    explanation: 'Для топ-менеджеров наиболее эффективны индивидуальные подходы, учитывающие их специфические потребности и контекст.',
    sources: 'Leadership Development Research',
    difficulty: 3,
    timeEstimate: 45,
  },
];
