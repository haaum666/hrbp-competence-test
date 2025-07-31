import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; // Добавлен Link

// Временный компонент для страницы теста
const TestPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-3xl">
    Страница Теста (скоро здесь будут вопросы!)
  </div>
);

function App() {
  return (
    <Router>
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4
                      bg-gradient-to-br from-gray-900 via-gray-800 to-black
                      text-white font-sans overflow-hidden">

        {/* Абстрактные фоновые элементы */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-bl from-red-800 to-yellow-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-tr from-purple-800 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tl from-green-800 to-teal-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

        {/* Основной контейнер содержимого */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center p-8
                        bg-white bg-opacity-5 rounded-xl shadow-2xl backdrop-blur-md border border-gray-700/50
                        max-w-4xl mx-auto transform hover:scale-102 transition-transform duration-300 ease-in-out">

          {/* Заголовок */}
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-lg"
              style={{ textShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
            HRBP-Тест
          </h1>

          {/* Анонс теста */}
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mb-10 leading-relaxed">
            Ребятушки, я тут совсем угорел по своей работе и начал собирать тест на HRBP.
            <br/><br/>
            Сейчас он на стадии валидации, параллельно собираю web-версию (на скрине).
            <br/>
            Исследования и аналитику уже прошел - проработал источники уровня Harvard Business Review, SHRM.
            <br/>
            В течение месяца планирую выпустить в прод.
            <br/><br/>
            76 вопросов: кейсы, приоритизация, знания • От Junior до Senior • Персональная аналитика.
            <br/>
            Бесплатно и без ограничений - я таких в открытом доступе еще не видел.
            <br/><br/>
            Каждый вопрос с детальными объяснениями и персональными рекомендациями по развитию.
            <br/>
            Закрываю свою потребность - мне не хватало подобного теста, решил сделать сам.
            <br/><br/>
            Логи исследований, инфу про наполнение и валидацию буду публиковать по ходу разработки.
            <br/><br/>
            Мне очень важно ваше мнение, буду рад, если кто-нибудь захочет вступить в фокус-группу проекта.
          </p>

          {/* Кнопка "Начать Тест" (теперь она ведет на /test) */}
          <Link to="/test" className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white font-bold py-4 px-12 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 inline-block">
            Начать Тест
          </Link>

          {/* Секция с маршрутами */}
          <div className="mt-12 p-6 bg-white bg-opacity-5 rounded-lg backdrop-blur-sm shadow-xl border border-gray-700/30">
            <Routes>
              <Route path="/" element={<p className="text-lg text-gray-300">Нажмите "Начать Тест", чтобы перейти!</p>} />
              <Route path="/test" element={<TestPage />} /> {/* Маршрут для страницы теста */}
              <Route path="/results" element={<p className="text-lg text-gray-300">Страница результатов (скоро)</p>} />
              <Route path="*" element={<p className="text-lg text-gray-300">Страница не найдена</p>} />
            </Routes>
          </div>

        </div>
      </div>
    </Router>
  );
}

export default App;
