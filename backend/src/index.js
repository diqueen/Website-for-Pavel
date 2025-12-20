const express = require('express')
const cors = require('cors')
const compression = require('compression')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')
require('dotenv').config()

// Импорт маршрутов
const contactRoutes = require('./routes/contact')
const adminRoutes = require('./routes/admin')
const servicesRoutes = require('./routes/services')
const contactsRoutes = require('./routes/contacts')
const productsRoutes = require('./routes/products')
const excelRoutes = require('./routes/excel')
const settingsRoutes = require('./routes/settings')
const galleryRoutes = require('./routes/gallery')
const cooperationRoutes = require('./routes/cooperation')

const app = express()
const PORT = process.env.PORT || 5000

// CORS настройки ДО всех других middleware (важно!)
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Content-Length'],
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

// Явная обработка OPTIONS запросов для всех маршрутов
app.options('*', cors(corsOptions))

// Безопасность (после CORS, чтобы не перезаписывать заголовки)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http://localhost:5000"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Разрешаем cross-origin для ресурсов
  crossOriginEmbedderPolicy: false // Отключаем для совместимости
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с IP
  message: {
    error: 'Слишком много запросов, попробуйте позже'
  }
})
app.use('/api/', limiter)

// Сжатие ответов
app.use(compression())

// Парсинг JSON и form-data (увеличено для загрузки изображений и видео)
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Статические файлы для загрузок с правильными CORS заголовками
app.use('/uploads', (req, res, next) => {
  // Устанавливаем CORS заголовки для статических файлов
  const origin = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3000'
  res.header('Access-Control-Allow-Origin', origin)
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Cross-Origin-Resource-Policy', 'cross-origin')
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none')
  
  // Обработка OPTIONS запросов
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  
  next()
}, express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, filePath) => {
    // Устанавливаем заголовки для каждого файла
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000')
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  }
}))

// Логирование запросов (с информацией о CORS)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`)
  next()
})

// API маршруты
app.use('/api/contact', contactRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/services', servicesRoutes)
app.use('/api/contacts', contactsRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/excel', excelRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/gallery', galleryRoutes)
app.use('/api/cooperation', cooperationRoutes)
app.use('/api/upload', require('./routes/upload'))

// Проверка здоровья сервера
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  })
})

// Главная страница API
app.get('/api', (req, res) => {
  res.json({
    message: 'Marine Company API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      contact: '/api/contact',
      products: '/api/products',
      services: '/api/services',
      gallery: '/api/gallery',
      admin: '/api/admin'
    }
  })
})

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  })
  
  res.status(err.status || 500).json({ 
    error: 'Внутренняя ошибка сервера',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Что-то пошло не так',
    timestamp: new Date().toISOString()
  })
})

// 404 для неизвестных маршрутов
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Маршрут не найден',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM получен, завершение работы сервера...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT получен, завершение работы сервера...')
  process.exit(0)
})

app.listen(PORT, () => {
  console.log('🌊 Marine Company API Server')
  console.log(`🚀 Сервер запущен на порту ${PORT}`)
  console.log(`🌍 Окружение: ${process.env.NODE_ENV || 'development'}`)
  console.log(`📊 Админ-панель: http://localhost:${PORT}/api/admin`)
  console.log(`📞 Контакты API: http://localhost:${PORT}/api/contact`)
  console.log(`🔧 Услуги API: http://localhost:${PORT}/api/services`)
  console.log(`👥 Управление заявками: http://localhost:${PORT}/api/contacts`)
  console.log(`🖼️ Галерея API: http://localhost:${PORT}/api/gallery`)
  console.log(`💊 Health Check: http://localhost:${PORT}/api/health`)
})

module.exports = app
