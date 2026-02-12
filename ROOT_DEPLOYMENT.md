# 🚀 Краткая инструкция для ROOT пользователя

## 📍 Вы подключились как root

Если вы видите `root@...` в командной строке, следуйте этой инструкции.

---

## 🎯 Шаг 1: Выберите место для проекта

Рекомендуется использовать `/var/www` (стандартная директория для веб-проектов):

```bash
# Создайте директорию для проекта
mkdir -p /var/www
cd /var/www
```

Или используйте домашнюю директорию root:

```bash
# Вы уже в /root, создайте папку для проектов
mkdir -p /root/projects
cd /root/projects
```

---

## 📥 Шаг 2: Клонируйте репозиторий

```bash
# Если репозиторий на GitHub/GitLab
git clone https://github.com/username/repository-name.git

# Или если у вас есть SSH ключ
git clone git@github.com:username/repository-name.git

# Перейдите в папку проекта
cd react  # или имя вашей папки проекта
```

**Если у вас нет репозитория Git:**
- Создайте репозиторий на GitHub/GitLab
- Или загрузите файлы через SCP/WinSCP в выбранную директорию

---

## 🔧 Шаг 3: Установите Node.js (если еще не установлен)

```bash
# Обновление системы
apt update && apt upgrade -y

# Установка Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Проверка версии
node --version  # Должно быть 18.x или выше
npm --version   # Должно быть 8.x или выше
```

---

## 📦 Шаг 4: Установите зависимости

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

## ⚙️ Шаг 5: Настройте переменные окружения

### Backend

```bash
cd backend
cp env.example .env
nano .env
```

Настройте:
```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://31.192.110.68:3000
# ... остальные настройки
```

### Frontend

```bash
cd ../frontend
cp env.example .env.local
nano .env.local
```

Настройте:
```env
NEXT_PUBLIC_API_URL=http://31.192.110.68:5000
# ... остальные настройки
```

---

## 📁 Шаг 6: Создайте папку для загрузок

```bash
cd ../backend
mkdir -p uploads/images
chmod -R 755 uploads
```

---

## 🏗️ Шаг 7: Соберите frontend

```bash
cd ../frontend
npm run build
```

---

## 🚀 Шаг 8: Установите и запустите PM2

```bash
# Установка PM2
npm install -g pm2

# Запуск backend
cd ../backend
pm2 start src/index.js --name "marine-backend"

# Запуск frontend
cd ../frontend
pm2 start npm --name "marine-frontend" -- start

# Сохранение конфигурации
pm2 save

# Настройка автозапуска
pm2 startup
```

---

## 📝 Важные пути для запоминания

**Если выбрали `/var/www/react`:**
- Backend: `/var/www/react/backend`
- Frontend: `/var/www/react/frontend`

**Если выбрали `/root/projects/react`:**
- Backend: `/root/projects/react/backend`
- Frontend: `/root/projects/react/frontend`

---

## 🔍 Полезные команды

```bash
# Проверка статуса PM2
pm2 status

# Просмотр логов
pm2 logs

# Перезапуск приложений
pm2 restart all

# Проверка текущей директории
pwd

# Просмотр содержимого директории
ls -la
```

---

## ❓ Что делать дальше?

1. ✅ Установите Nginx (см. DEPLOYMENT.md, Шаг 9)
2. ✅ Настройте SSL сертификат (см. DEPLOYMENT.md, Шаг 10)
3. ✅ Настройте файрвол (см. DEPLOYMENT.md, Шаг 11)

Полная инструкция находится в файле `DEPLOYMENT.md`.








