# ✅ Чек-лист подготовки к развертыванию

## 📦 Файлы для загрузки на сервер

### ✅ Backend файлы

- [x] `backend/src/` - весь исходный код
  - [x] `backend/src/index.js` - главный файл сервера
  - [x] `backend/src/routes/` - все маршруты API
  - [x] `backend/src/utils/` - утилиты
- [x] `backend/data/` - JSON файлы с данными
  - [x] `products-all.json`
  - [x] `products-ship-parts.json`
  - [x] `products-fittings.json`
  - [x] `products-heat-exchangers.json`
  - [x] `services.json`
  - [x] `categories.json`
  - [x] `contacts.json`
  - [x] `cooperation.json`
  - [x] `site-settings.json`
- [x] `backend/uploads/images/` - загруженные изображения
- [x] `backend/package.json` - зависимости
- [x] `backend/env.example` - пример настроек

### ✅ Frontend файлы

- [x] `frontend/src/` - весь исходный код
  - [x] `frontend/src/app/` - страницы Next.js
  - [x] `frontend/src/components/` - React компоненты
  - [x] `frontend/src/contexts/` - контексты
  - [x] `frontend/src/hooks/` - кастомные хуки
  - [x] `frontend/src/lib/` - утилиты
- [x] `frontend/package.json` - зависимости
- [x] `frontend/next.config.js` - конфигурация Next.js
- [x] `frontend/tailwind.config.js` - конфигурация Tailwind
- [x] `frontend/tsconfig.json` - конфигурация TypeScript
- [x] `frontend/postcss.config.js` - конфигурация PostCSS
- [x] `frontend/env.example` - пример настроек

### ✅ Корневые файлы

- [x] `package.json` - корневой package.json
- [x] `.gitignore` - игнорируемые файлы
- [x] `README.md` - документация
- [x] `DEPLOYMENT.md` - инструкция по развертыванию

### ✅ Документация (опционально)

- [x] `docs/` - папка с документацией

---

## ❌ Файлы, которые НЕ нужно загружать

- [ ] `node_modules/` - установятся на сервере
- [ ] `.next/` - соберется на сервере
- [ ] `.env` и `.env.local` - создадите на сервере
- [ ] `package-lock.json` - создастся на сервере (можно оставить)
- [ ] `*.log` - логи
- [ ] Временные файлы
- [ ] `tools/ngrok/` - удалено

---

## 🔍 Проверка перед загрузкой

### 1. Структура проекта

```bash
react/
├── backend/
│   ├── src/          ✓
│   ├── data/         ✓
│   ├── uploads/      ✓
│   └── package.json  ✓
├── frontend/
│   ├── src/          ✓
│   └── package.json  ✓
└── package.json      ✓
```

### 2. Критичные файлы

- [x] `backend/src/index.js` - существует
- [x] `frontend/src/app/layout.tsx` - существует
- [x] `backend/package.json` - существует
- [x] `frontend/package.json` - существует
- [x] `backend/env.example` - существует
- [x] `frontend/env.example` - существует

### 3. Данные

- [x] JSON файлы в `backend/data/` присутствуют
- [x] Изображения в `backend/uploads/images/` присутствуют (если есть)

---

## 🚀 Быстрая проверка

Запустите скрипт подготовки:

```bash
# Windows
prepare-deployment.bat

# Или вручную проверьте:
# 1. Нет node_modules
# 2. Нет .next
# 3. Нет .env файлов (только .example)
# 4. Все исходные файлы на месте
```

---

## 📝 Что сделать на сервере

1. **Установить Node.js 18+**
2. **Загрузить файлы** на сервер
3. **Установить зависимости**: `npm install`
4. **Создать .env файлы** из примеров
5. **Собрать frontend**: `npm run build`
6. **Запустить через PM2**
7. **Настроить Nginx**

Подробные инструкции в `DEPLOYMENT.md`

---

## ⚠️ Важные замечания

1. **НЕ загружайте .env файлы** - они содержат секретные данные
2. **Создайте .env файлы на сервере** из `env.example`
3. **Проверьте права доступа** к папке `uploads`
4. **Настройте CORS** в backend для вашего домена
5. **Используйте HTTPS** в продакшн

---

**Готово к развертыванию! ✅**


