const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const router = express.Router()

// Настройка multer для загрузки изображений
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/images')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, 'img-' + uniqueSuffix + ext)
  }
})

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Только изображения разрешены! (JPG, PNG, GIF, WebP)'), false)
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
})

// Загрузка изображения
router.post('/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' })
    }

    const fileUrl = `/uploads/images/${req.file.filename}`
    console.log('Изображение загружено:', fileUrl)
    
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    })
  } catch (error) {
    console.error('Ошибка загрузки изображения:', error)
    res.status(500).json({ error: 'Ошибка загрузки изображения' })
  }
})

// Удаление изображения
router.delete('/image/:filename', (req, res) => {
  try {
    const filename = req.params.filename
    const filePath = path.join(__dirname, '../../uploads/images', filename)
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log('Изображение удалено:', filename)
      res.json({ success: true, message: 'Изображение удалено' })
    } else {
      res.status(404).json({ error: 'Файл не найден' })
    }
  } catch (error) {
    console.error('Ошибка удаления изображения:', error)
    res.status(500).json({ error: 'Ошибка удаления изображения' })
  }
})

module.exports = router











