# 🧪 Инструкция для тестового запуска на сервере

Упрощенная версия для быстрого тестирования без Nginx и SSL.

---

## 📋 Что понадобится:

- ✅ Сервер с IP: `31.192.110.68`
- ✅ Доступ по SSH (вы подключены как `root`)
- ✅ Интернет на сервере

---

## 🚀 Пошаговая инструкция:

### Шаг 1: Подключение к серверу

```bash
ssh root@31.192.110.68
```

---

### Шаг 2: Выбор места для проекта

```bash
# Создайте папку для проекта
mkdir -p /var/www
cd /var/www
```

Или в домашней директории root:
```bash
mkdir -p /root/projects
cd /root/projects
```

---

### Шаг 3: Загрузка проекта

#### Вариант A: Через Git (если есть репозиторий)

```bash
# Клонируйте репозиторий
git clone ваш-url-репозитория
cd react  # или имя вашей папки проекта
```

#### Вариант B: Через SCP (с локального компьютера)

На вашем компьютере (Windows PowerShell):
```powershell
scp -r react root@31.192.110.68:/var/www/
```

Затем на сервере:
```bash
cd /var/www/react
```

---

### Шаг 4: Установка Node.js

```bash
# Обновление системы
apt update && apt upgrade -y

# Установка Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Проверка установки
node --version  # Должно быть 18.x или выше
npm --version   # Должно быть 8.x или выше
```

---

### Шаг 5: Установка зависимостей

```bash
# Убедитесь, что вы в корне проекта
# Если выбрали /var/www:
cd /var/www/react
# Если выбрали /root/projects:
cd /root/projects/react

# Установка зависимостей backend
cd backend
npm install --production

# Установка зависимостей frontend
cd ../frontend
npm install
```

---

### Шаг 6: Настройка переменных окружения

#### Backend (.env)

```bash
cd backend
cp env.example .env
nano .env
```

Минимальная конфигурация для теста:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL (IP с портом)
FRONTEND_URL=http://31.192.110.68:3000

# Email Configuration (можно оставить пустым для теста)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=ваш-email@gmail.com
EMAIL_PASS=ваш-пароль-приложения

# Admin Configuration
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=admin123

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Сохраните: `Ctrl+O`, `Enter`, `Ctrl+X`

#### Frontend (.env.local)

```bash
cd ../frontend
cp env.example .env.local
nano .env.local
```

Минимальная конфигурация для теста:

```env
# API Configuration (IP с портом backend)
NEXT_PUBLIC_API_URL=http://31.192.110.68:5000

# Contact Form Configuration
NEXT_PUBLIC_CONTACT_EMAIL=info@test.com
NEXT_PUBLIC_PHONE_NUMBER=+7 (999) 123-45-67
```

Сохраните: `Ctrl+O`, `Enter`, `Ctrl+X`

---

### Шаг 7: Создание папки для загрузок

```bash
cd ../backend
mkdir -p uploads/images
chmod -R 755 uploads
```

---

### Шаг 8: Сборка frontend

```bash
cd ../frontend
npm run build
```

Это может занять несколько минут.

---

### Шаг 9: Установка PM2

```bash
# Установка PM2 глобально
npm install -g pm2
```

---

### Шаг 10: Запуск приложений

```bash
# Запуск backend
cd ../backend
pm2 start src/index.js --name "marine-backend"

# Запуск frontend
cd ../frontend
pm2 start npm --name "marine-frontend" -- start

# Сохранение конфигурации PM2
pm2 save

# Настройка автозапуска при перезагрузке сервера
pm2 startup
# Выполните команду, которую покажет PM2
```

---

### Шаг 11: Открытие портов в файрволе

```bash
# Разрешить порты 3000 и 5000
ufw allow 3000/tcp
ufw allow 5000/tcp
ufw allow 22/tcp  # SSH (если еще не открыт)

# Включить файрвол (если еще не включен)
ufw enable
```

---

### Шаг 12: Проверка работы

```bash
# Проверка статуса приложений
pm2 status

# Просмотр логов
pm2 logs

# Проверка портов
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000
```

---

## 🌐 Доступ к сайту:

После выполнения всех шагов сайт будет доступен:

- **Frontend (сайт):** `http://31.192.110.68:3000`
- **Backend API:** `http://31.192.110.68:5000`

Откройте в браузере: `http://31.192.110.68:3000`

---

## 🔧 Полезные команды:

### Управление PM2:

```bash
# Статус приложений
pm2 status

# Просмотр логов
pm2 logs
pm2 logs marine-backend
pm2 logs marine-frontend

# Перезапуск
pm2 restart all
pm2 restart marine-backend
pm2 restart marine-frontend

# Остановка
pm2 stop all

# Удаление из PM2
pm2 delete all
```

### Проверка работы:

```bash
# Проверка backend
curl http://localhost:5000/api/health

# Проверка frontend
curl http://localhost:3000
```

---

## ❌ Решение проблем:

### Порт занят:

```bash
# Проверка, что занимает порт
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000

# Если порт занят, остановите процесс или измените порт в .env
```

### Приложение не запускается:

```bash
# Проверьте логи
pm2 logs

# Проверьте, что все зависимости установлены
cd backend && npm install
cd ../frontend && npm install
```

### Не могу подключиться снаружи:

```bash
# Проверьте файрвол
ufw status

# Убедитесь, что порты открыты
ufw allow 3000/tcp
ufw allow 5000/tcp
```

---

## ✅ Чек-лист:

- [ ] Подключился к серверу
- [ ] Создал папку для проекта
- [ ] Загрузил проект (Git или SCP)
- [ ] Установил Node.js
- [ ] Установил зависимости (backend и frontend)
- [ ] Настроил `.env` файлы
- [ ] Создал папку uploads
- [ ] Собрал frontend (`npm run build`)
- [ ] Установил PM2
- [ ] Запустил backend через PM2
- [ ] Запустил frontend через PM2
- [ ] Открыл порты в файрволе
- [ ] Проверил доступность сайта в браузере

---

## 📝 Важные пути:

**Если выбрали `/var/www/react`:**
- Backend: `/var/www/react/backend`
- Frontend: `/var/www/react/frontend`

**Если выбрали `/root/projects/react`:**
- Backend: `/root/projects/react/backend`
- Frontend: `/root/projects/react/frontend`

---

## 🎯 Что дальше?

После успешного тестирования:
1. Настройте Nginx (см. `DEPLOYMENT.md`, Шаг 9)
2. Настройте SSL сертификат (см. `DEPLOYMENT.md`, Шаг 10)
3. Подключите домен (если есть)

Полная инструкция для продакшена находится в файле `DEPLOYMENT.md`.

---

**Успешного тестирования! 🚀**

