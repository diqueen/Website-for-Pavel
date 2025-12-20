const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')

// Путь к файлу с настройками
const settingsFilePath = path.join(__dirname, '../../data/site-settings.json')

// Функция для загрузки настроек
const loadSettings = () => {
  try {
    if (fs.existsSync(settingsFilePath)) {
      const data = fs.readFileSync(settingsFilePath, 'utf8')
      return JSON.parse(data)
    }
    return null
  } catch (error) {
    console.error('Ошибка загрузки настроек:', error)
    return null
  }
}

// Функция для сохранения настроек
const saveSettings = (settings) => {
  try {
    const dataDir = path.dirname(settingsFilePath)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    settings.updatedAt = new Date().toISOString()
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2))
    return true
  } catch (error) {
    console.error('Ошибка сохранения настроек:', error)
    return false
  }
}

// GET /api/settings - получить все настройки
router.get('/', (req, res) => {
  try {
    const settings = loadSettings()
    if (settings) {
      res.json(settings)
    } else {
      res.status(404).json({ error: 'Настройки не найдены' })
    }
  } catch (error) {
    console.error('Ошибка получения настроек:', error)
    res.status(500).json({ error: 'Ошибка получения настроек' })
  }
})

// PUT /api/settings - обновить настройки
router.put('/', (req, res) => {
  try {
    const newSettings = req.body
    
    if (!newSettings) {
      return res.status(400).json({ error: 'Данные настроек не предоставлены' })
    }
    
    // Логируем данные компании для отладки
    if (newSettings.company) {
      console.log('Сохранение настроек компании:', {
        name: newSettings.company.name,
        logo: newSettings.company.logo,
        tagline: newSettings.company.tagline
      })
    }
    
    const success = saveSettings(newSettings)
    if (success) {
      // Проверяем, что настройки действительно сохранились
      const savedSettings = loadSettings()
      if (savedSettings && savedSettings.company) {
        console.log('Настройки сохранены, логотип:', savedSettings.company.logo)
      }
      res.json({ message: 'Настройки успешно обновлены', settings: newSettings })
    } else {
      res.status(500).json({ error: 'Ошибка сохранения настроек' })
    }
  } catch (error) {
    console.error('Ошибка обновления настроек:', error)
    res.status(500).json({ error: 'Ошибка обновления настроек' })
  }
})

// GET /api/settings/contacts - получить контакты
router.get('/contacts', (req, res) => {
  try {
    const settings = loadSettings()
    if (settings && settings.contacts) {
      res.json(settings.contacts)
    } else {
      res.status(404).json({ error: 'Контакты не найдены' })
    }
  } catch (error) {
    console.error('Ошибка получения контактов:', error)
    res.status(500).json({ error: 'Ошибка получения контактов' })
  }
})

// PUT /api/settings/contacts - обновить контакты
router.put('/contacts', (req, res) => {
  try {
    const newContacts = req.body
    
    if (!newContacts) {
      return res.status(400).json({ error: 'Данные контактов не предоставлены' })
    }
    
    const settings = loadSettings() || {}
    settings.contacts = { ...settings.contacts, ...newContacts }
    
    const success = saveSettings(settings)
    if (success) {
      res.json({ message: 'Контакты успешно обновлены', contacts: settings.contacts })
    } else {
      res.status(500).json({ error: 'Ошибка сохранения контактов' })
    }
  } catch (error) {
    console.error('Ошибка обновления контактов:', error)
    res.status(500).json({ error: 'Ошибка обновления контактов' })
  }
})

// GET /api/settings/site-info - получить информацию о сайте
router.get('/site-info', (req, res) => {
  try {
    const settings = loadSettings()
    if (settings && settings.siteInfo) {
      res.json(settings.siteInfo)
    } else {
      res.status(404).json({ error: 'Информация о сайте не найдена' })
    }
  } catch (error) {
    console.error('Ошибка получения информации о сайте:', error)
    res.status(500).json({ error: 'Ошибка получения информации о сайте' })
  }
})

// PUT /api/settings/site-info - обновить информацию о сайте
router.put('/site-info', (req, res) => {
  try {
    const newSiteInfo = req.body
    
    if (!newSiteInfo) {
      return res.status(400).json({ error: 'Данные информации о сайте не предоставлены' })
    }
    
    const settings = loadSettings() || {}
    settings.siteInfo = { ...settings.siteInfo, ...newSiteInfo }
    
    const success = saveSettings(settings)
    if (success) {
      res.json({ message: 'Информация о сайте успешно обновлена', siteInfo: settings.siteInfo })
    } else {
      res.status(500).json({ error: 'Ошибка сохранения информации о сайте' })
    }
  } catch (error) {
    console.error('Ошибка обновления информации о сайте:', error)
    res.status(500).json({ error: 'Ошибка обновления информации о сайте' })
  }
})

module.exports = router

