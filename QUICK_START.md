# 🚀 Быстрый старт для развертывания

## 📋 Что уже сделано

✅ Проект подготовлен к развертыванию:
- Удалены `node_modules` (установятся на сервере)
- Удалены собранные файлы `.next` (соберутся на сервере)
- Удалены временные файлы
- Оставлены только необходимые исходные файлы

## 📦 Что загрузить на сервер

Загрузите всю папку `react/` на сервер, **кроме**:
- ❌ `node_modules/` (если есть)
- ❌ `.next/` (если есть)
- ❌ `.env` файлы (если есть)

## 🖥️ Минимальные шаги на сервере

### 1. Установка зависимостей

```bash
cd /path/to/react/backend
npm install --production

cd ../frontend
npm install
```

### 2. Создание .env файлов

```bash
# Backend
cd backend
cp env.example .env
nano .env  # Настройте переменные

# Frontend
cd ../frontend
cp env.example .env.local
nano .env.local  # Настройте переменные
```

### 3. Сборка и запуск

```bash
# Сборка frontend
cd frontend
npm run build

# Запуск через PM2
pm2 start backend/src/index.js --name "marine-backend"
pm2 start "npm --prefix frontend start" --name "marine-frontend"
```

## 📚 Подробные инструкции

См. файл `DEPLOYMENT.md` для полной инструкции по развертыванию.

## ✅ Чек-лист

См. файл `DEPLOYMENT_CHECKLIST.md` для проверки всех файлов.

---

**Готово к развертыванию! 🎉**


