import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Используем переменную окружения Vercel, чтобы определить базовый путь
  // Для продакшн-сборки на Vercel, базовый путь должен быть '/'
  // Для локальной разработки, базовый путь может быть './'
  base: process.env.VERCEL_ENV === 'production' ? '/' : './',
})
