# 🚀 Инструкция по развертыванию на сервере

## 📋 Подготовка к развертыванию

### ✅ Что уже сделано:
- ✅ Удалены `node_modules` (будут установлены на сервере)
- ✅ Удалены собранные файлы `.next` (будут собраны на сервере)
- ✅ Удалены временные файлы
- ✅ Оставлены только примеры `.env` файлов

---

## 📦 Что нужно загрузить на сервер

### Структура файлов для загрузки:

```
react/
├── backend/
│   ├── src/                    # Исходный код backend
│   ├── data/                   # JSON файлы с данными
│   ├── uploads/                # Папка для загрузок (создать на сервере)
│   │   └── images/             # Изображения (существующие)
│   ├── package.json            # Зависимости backend
│   └── env.example             # Пример настроек
├── frontend/
│   ├── src/                    # Исходный код frontend
│   ├── public/                 # Статические файлы (если есть)
│   ├── package.json            # Зависимости frontend
│   ├── next.config.js          # Конфигурация Next.js
│   ├── tailwind.config.js      # Конфигурация Tailwind
│   ├── tsconfig.json           # Конфигурация TypeScript
│   ├── postcss.config.js       # Конфигурация PostCSS
│   └── env.example             # Пример настроек
├── docs/                       # Документация
├── .gitignore                  # Игнорируемые файлы
└── README.md                   # Основная документация
```

**НЕ загружайте:**
- ❌ `node_modules/` (установятся на сервере)
- ❌ `.next/` (соберется на сервере)
- ❌ `.env` файлы (создадите на сервере)
- ❌ Логи и временные файлы

---

## 🖥️ Развертывание на Linux сервере

### Шаг 1: Подключение к серверу

**IP адрес сервера:** `31.192.110.68`

### 🔍 Как узнать имя пользователя на сервере?

Имя пользователя обычно предоставляется провайдером сервера. Вот несколько способов его узнать:

1. **Проверьте email от провайдера** - обычно там указаны данные для доступа
2. **Проверьте панель управления VPS** (если есть доступ):
   - Timeweb, Selectel, DigitalOcean, AWS и т.д.
   - Обычно в разделе "Доступ" или "SSH ключи"
3. **Стандартные имена пользователей** (попробуйте по очереди):
   - `root` - для серверов с полным доступом
   - `ubuntu` - для Ubuntu серверов
   - `admin` - часто используется
   - `user` - стандартное имя
   - `debian` - для Debian серверов
   - `centos` - для CentOS серверов
4. **Если сервер только что создан** - имя пользователя обычно указано в инструкции провайдера

#### На Windows (PowerShell):

```powershell
# Если у вас есть имя пользователя и пароль
ssh username@31.192.110.68

# Если нужно указать порт (по умолчанию 22)
ssh -p 22 username@31.192.110.68
```

#### Альтернативные способы подключения:

1. **Через PuTTY** (если SSH не установлен):
   - Скачайте PuTTY: https://www.putty.org/
   - Host Name: `31.192.110.68`
   - Port: `22`
   - Connection type: `SSH`
   - Нажмите "Open"

2. **Через WinSCP** (для передачи файлов):
   - Скачайте WinSCP: https://winscp.net/
   - Host name: `31.192.110.68`
   - Port: `22`
   - Username: ваш username
   - Password: ваш пароль

**Примечание:** Замените `username` на ваше реальное имя пользователя на сервере.

### 🔑 Если вы подключились как ROOT

Если вы подключились как `root` (видите `root@...` в командной строке), у вас нет директории `/home/username`. 

**Рекомендуемые варианты размещения проекта:**

#### Вариант 1: В домашней директории root (проще всего)

```bash
# Вы уже находитесь в /root, проверьте текущую директорию
pwd  # Должно показать /root

# Создайте папку для проектов
mkdir -p /root/projects
cd /root/projects

# Клонируйте репозиторий
git clone your-repository-url
cd react  # или имя вашей папки проекта
```

#### Вариант 2: В стандартной директории для веб-проектов (рекомендуется)

```bash
# Создайте директорию для веб-проектов
mkdir -p /var/www
cd /var/www

# Клонируйте репозиторий
git clone your-repository-url
cd react  # или имя вашей папки проекта

# Установите правильные права доступа
chown -R root:root /var/www/react
```

#### Вариант 3: В директории /opt (для приложений)

```bash
# Создайте директорию
mkdir -p /opt/website
cd /opt/website

# Клонируйте репозиторий
git clone your-repository-url
cd react  # или имя вашей папки проекта
```

**Важно:** В дальнейших инструкциях замените `/home/username/react` на выбранный вами путь:
- `/root/projects/react` (если выбрали вариант 1)
- `/var/www/react` (если выбрали вариант 2)
- `/opt/website/react` (если выбрали вариант 3)

### Шаг 2: Установка Node.js

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Проверка версии
node --version  # Должно быть 18.x или выше
npm --version   # Должно быть 8.x или выше
```

### Шаг 3: Загрузка файлов на сервер

#### Вариант A: Через SCP (если файлы на локальной машине)

```bash
# С локальной машины (Windows PowerShell)
# Если вы root:
scp -r react root@31.192.110.68:/root/projects/
# или
scp -r react root@31.192.110.68:/var/www/

# Если у вас другой пользователь:
scp -r react username@31.192.110.68:/home/username/
```

#### Вариант B: Через Git (рекомендуется)

```bash
# На сервере (если вы root)
# Выберите один из вариантов:

# Вариант 1: В /root/projects
cd /root
mkdir -p projects
cd projects
git clone your-repository-url
cd react  # или имя вашей папки проекта

# Вариант 2: В /var/www (рекомендуется)
cd /var/www
git clone your-repository-url
cd react  # или имя вашей папки проекта

# Если у вас другой пользователь:
cd /home/username
git clone your-repository-url
cd react
```

**Где взять URL репозитория?**
- Если репозиторий на GitHub: `https://github.com/username/repository-name.git`
- Если репозиторий на GitLab: `https://gitlab.com/username/repository-name.git`
- Если репозиторий приватный, вам понадобится токен доступа или SSH ключ

#### Вариант C: Через FTP/SFTP клиент

Используйте FileZilla, WinSCP или другой FTP клиент для загрузки файлов.

### Шаг 4: Установка зависимостей

```bash
# Переход в папку проекта
# ЗАМЕНИТЕ путь на ваш реальный путь!
# Если вы root и выбрали /root/projects:
cd /root/projects/react
# Если вы root и выбрали /var/www:
cd /var/www/react
# Если у вас другой пользователь:
cd /home/username/react

# Установка зависимостей backend
cd backend
npm install --production

# Установка зависимостей frontend
cd ../frontend
npm install
```

### Шаг 5: Настройка переменных окружения

#### Backend (.env)

```bash
# ЗАМЕНИТЕ путь на ваш реальный путь!
# Если вы root и выбрали /root/projects:
cd /root/projects/react/backend
# Если вы root и выбрали /var/www:
cd /var/www/react/backend
# Если у вас другой пользователь:
cd /home/username/react/backend

cp env.example .env
nano .env
```

Настройте следующие переменные:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL (замените на ваш домен)
FRONTEND_URL=http://31.192.110.68:3000

# Admin Configuration
ADMIN_EMAIL=admin@31.192.110.68
ADMIN_PASSWORD=looppi7980

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (.env.local)

```bash
# ЗАМЕНИТЕ путь на ваш реальный путь!
# Если вы root и выбрали /root/projects:
cd /root/projects/react/frontend
# Если вы root и выбрали /var/www:
cd /var/www/react/frontend
# Если у вас другой пользователь:
cd /home/username/react/frontend

cp env.example .env.local
nano .env.local
```

Настройте следующие переменные:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://31.192.110.68:5000

# Contact Form Configuration
NEXT_PUBLIC_CONTACT_EMAIL=test@gmail.com
NEXT_PUBLIC_PHONE_NUMBER=+7 (914) 349-10-50
```

### Шаг 6: Создание папки для загрузок

```bash
# ЗАМЕНИТЕ путь на ваш реальный путь!
# Если вы root и выбрали /root/projects:
cd /root/projects/react/backend
# Если вы root и выбрали /var/www:
cd /var/www/react/backend
# Если у вас другой пользователь:
cd /home/username/react/backend

mkdir -p uploads/images
chmod -R 755 uploads
```

### Шаг 7: Сборка frontend

```bash
# ЗАМЕНИТЕ путь на ваш реальный путь!
# Если вы root и выбрали /root/projects:
cd /root/projects/react/frontend
# Если вы root и выбрали /var/www:
cd /var/www/react/frontend
# Если у вас другой пользователь:
cd /home/username/react/frontend

npm run build
```

### Шаг 8: Установка PM2 (менеджер процессов)

```bash
# Установка PM2 глобально
sudo npm install -g pm2

# Запуск backend через PM2
# ЗАМЕНИТЕ путь на ваш реальный путь!
# Если вы root и выбрали /root/projects:
cd /root/projects/react/backend
# Если вы root и выбрали /var/www:
cd /var/www/react/backend
# Если у вас другой пользователь:
cd /home/username/react/backend

pm2 start src/index.js --name "marine-backend"

# Запуск frontend через PM2
# ЗАМЕНИТЕ путь на ваш реальный путь!
# Если вы root и выбрали /root/projects:
cd /root/projects/react/frontend
# Если вы root и выбрали /var/www:
cd /var/www/react/frontend
# Если у вас другой пользователь:
cd /home/username/react/frontend

pm2 start npm --name "marine-frontend" -- start

# Сохранение конфигурации PM2
pm2 save

# Настройка автозапуска при перезагрузке сервера
pm2 startup
```

### Шаг 9: Настройка Nginx (реверс-прокси)

```bash
# Установка Nginx
sudo apt install nginx -y

# Создание конфигурации
sudo nano /etc/nginx/sites-available/marine-website
```

Добавьте следующую конфигурацию:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Загрузки (изображения)
    location /uploads {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Активируйте конфигурацию:

```bash
# Создание символической ссылки
sudo ln -s /etc/nginx/sites-available/marine-website /etc/nginx/sites-enabled/

# Удаление дефолтной конфигурации (опционально)
sudo rm /etc/nginx/sites-enabled/default

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
```

### Шаг 10: Настройка SSL (Let's Encrypt)

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получение SSL сертификата
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Автоматическое обновление сертификата
sudo certbot renew --dry-run
```

### Шаг 11: Настройка файрвола

```bash
# Разрешение HTTP и HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw allow 22/tcp  # SSH
sudo ufw enable
```

---

## 🔧 Управление приложением

### Просмотр статуса

```bash
pm2 status
pm2 logs
pm2 logs marine-backend
pm2 logs marine-frontend
```

### Перезапуск

```bash
pm2 restart marine-backend
pm2 restart marine-frontend
# или
pm2 restart all
```

### Остановка

```bash
pm2 stop marine-backend
pm2 stop marine-frontend
```

### Удаление из PM2

```bash
pm2 delete marine-backend
pm2 delete marine-frontend
```

---

## 🔄 Обновление приложения

### 1. Остановка приложений

```bash
pm2 stop all
```

### 2. Обновление кода

```bash
# Если используете Git
git pull origin main

# Или загрузите новые файлы через SCP/FTP
```

### 3. Обновление зависимостей

```bash
cd /home/username/react/backend
npm install --production

cd ../frontend
npm install
npm run build
```

### 4. Перезапуск

```bash
pm2 restart all
```

---

## 🐛 Решение проблем

### Проверка логов

```bash
# Логи PM2
pm2 logs

# Логи Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Логи системы
sudo journalctl -u nginx -f
```

### Проверка портов

```bash
# Проверка, что порты заняты
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :5000
```

### Проверка процессов

```bash
# Проверка Node.js процессов
ps aux | grep node

# Проверка PM2
pm2 list
```

### Перезапуск сервисов

```bash
# Перезапуск Nginx
sudo systemctl restart nginx

# Перезапуск PM2
pm2 restart all
```

---

## 📊 Мониторинг

### PM2 Monitoring

```bash
# Веб-интерфейс мониторинга (опционально)
pm2 install pm2-server-monit
```

### Проверка здоровья

```bash
# Проверка backend
curl http://localhost:5000/api/health

# Проверка frontend
curl http://localhost:3000
```

---

## 🔒 Безопасность

### Рекомендации:

1. **Используйте сильные пароли** для всех учетных записей
2. **Настройте SSH ключи** вместо паролей
3. **Регулярно обновляйте систему**: `sudo apt update && sudo apt upgrade`
4. **Настройте автоматические бэкапы** данных
5. **Ограничьте доступ** к админ-панели по IP (опционально)
6. **Используйте HTTPS** для всех соединений
7. **Настройте rate limiting** в Nginx (дополнительно)

---

## 📝 Чек-лист развертывания

- [ ] Node.js 18+ установлен
- [ ] Файлы проекта загружены на сервер
- [ ] Зависимости установлены (`npm install`)
- [ ] `.env` файлы созданы и настроены
- [ ] Папка `uploads` создана с правильными правами
- [ ] Frontend собран (`npm run build`)
- [ ] Backend запущен через PM2
- [ ] Frontend запущен через PM2
- [ ] Nginx настроен и работает
- [ ] SSL сертификат установлен (опционально)
- [ ] Файрвол настроен
- [ ] Приложение доступно по домену
- [ ] Админ-панель работает
- [ ] Загрузка файлов работает

---

## 📞 Поддержка

Если возникли проблемы при развертывании:

1. Проверьте логи: `pm2 logs`
2. Проверьте конфигурацию Nginx: `sudo nginx -t`
3. Проверьте переменные окружения
4. Убедитесь, что все порты открыты
5. Проверьте права доступа к файлам

---

**Успешного развертывания! 🚀**


