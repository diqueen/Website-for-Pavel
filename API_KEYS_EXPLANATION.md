# 🔑 Объяснение API ключей в проекте

## 📍 Google Maps API ключ

### ❌ НЕ НУЖЕН

**Почему:**
- В проекте используется **Яндекс карта**, а не Google Maps
- Переменная `GOOGLE_MAPS_API_KEY` в `backend/env.example` - это остаток от шаблона
- Нигде в коде не используется

**Что делать:**
- В `backend/.env` можно **оставить пустым** или **удалить строку**:
  ```env
  GOOGLE_MAPS_API_KEY=
  ```
- Или вообще не добавлять эту переменную

**Вывод:** На работу сайта это **не влияет**.

---

## 🗺️ Яндекс карты API ключ

### ✅ Работает без настройки

**Текущая ситуация:**
- В компоненте `YandexMap.tsx` есть **захардкоженный API ключ**:
  ```typescript
  const API_KEY = 'a18f9c9d-feff-410a-80e3-3366c64ef5e7'
  ```
- Карта работает с этим ключом **без дополнительной настройки**

**Нужно ли что-то делать:**
- **НЕТ** - карта уже работает
- Можно оставить как есть

**Если хотите использовать свой ключ:**

1. Получите ключ на https://developer.tech.yandex.ru/
2. Добавьте в `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_YANDEX_MAPS_API_KEY=ваш-ключ
   ```
3. Обновите `YandexMap.tsx`:
   ```typescript
   const API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || 'a18f9c9d-feff-410a-80e3-3366c64ef5e7'
   ```

**Вывод:** Ничего делать не нужно, карта работает.

---

## 📱 Telegram Bot Token

### ❓ Опционально

**Где указан:** `backend/env.example`

**Нужен ли:**
- Только если вы используете **Telegram бота** для уведомлений
- Если бота нет - можно оставить пустым

**Что делать:**
```env
TELEGRAM_BOT_TOKEN=
# или просто не добавляйте эту строку
```

---

## 💬 WhatsApp API Key

### ❓ Опционально

**Где указан:** `backend/env.example`

**Нужен ли:**
- Только если вы используете **WhatsApp API** для отправки сообщений
- Если не используете - можно оставить пустым

**Что делать:**
```env
WHATSAPP_API_KEY=
# или просто не добавляйте эту строку
```

---

## ✅ Итоговая рекомендация для `.env` файлов

### Backend `.env`:

```env
# Обязательные
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://ваш-домен.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=ваш-email@gmail.com
EMAIL_PASS=ваш-пароль-приложения
ADMIN_EMAIL=admin@ваш-домен.com
ADMIN_PASSWORD=надежный-пароль
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Опциональные (можно не добавлять или оставить пустыми)
# GOOGLE_MAPS_API_KEY=  # НЕ НУЖЕН
# TELEGRAM_BOT_TOKEN=   # Только если есть бот
# WHATSAPP_API_KEY=     # Только если используете WhatsApp API
```

### Frontend `.env.local`:

```env
# Обязательные
NEXT_PUBLIC_API_URL=https://ваш-домен.com/api
NEXT_PUBLIC_CONTACT_EMAIL=info@ваш-домен.com
NEXT_PUBLIC_PHONE_NUMBER=+7 (999) 123-45-67

# Опциональные
# NEXT_PUBLIC_YANDEX_MAPS_API_KEY=  # Не обязательно, карта работает без него
```

---

## 📝 Резюме

1. **Google Maps API ключ** - ❌ НЕ НУЖЕН, можно игнорировать
2. **Яндекс карты API ключ** - ✅ Уже работает, ничего делать не нужно
3. **Telegram/WhatsApp ключи** - ❓ Только если используете эти функции

**Вывод:** Для базовой работы сайта **ничего дополнительно настраивать не нужно** - все уже работает!


