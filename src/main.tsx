import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'; // Импорт вашего основного компонента App
import './styles/index.css'; // Импорт глобальных стилей (если они есть)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
