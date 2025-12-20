const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')

// Путь к файлу с услугами
const servicesFilePath = path.join(__dirname, '../../data/services.json')

// Функция для загрузки услуг из файла
function loadServices() {
  try {
    if (fs.existsSync(servicesFilePath)) {
      const data = fs.readFileSync(servicesFilePath, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Ошибка загрузки услуг:', error)
    return []
  }
}

// Функция для сохранения услуг в файл
function saveServices(services) {
  try {
    const dataDir = path.dirname(servicesFilePath)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    fs.writeFileSync(servicesFilePath, JSON.stringify(services, null, 2))
    return true
  } catch (error) {
    console.error('Ошибка сохранения услуг:', error)
    return false
  }
}

// Получение всех услуг
router.get('/', (req, res) => {
  try {
    const services = loadServices()
    res.json(services)
  } catch (error) {
    console.error('Ошибка получения услуг:', error)
    res.status(500).json({ error: 'Ошибка получения услуг' })
  }
})

// Получение услуги по ID
router.get('/:id', (req, res) => {
  try {
    const services = loadServices()
    const service = services.find(s => s.id === req.params.id)
    
    if (service) {
      res.json(service)
    } else {
      res.status(404).json({ error: 'Услуга не найдена' })
    }
  } catch (error) {
    console.error('Ошибка получения услуги:', error)
    res.status(500).json({ error: 'Ошибка получения услуги' })
  }
})

// Создание новой услуги
router.post('/', (req, res) => {
  try {
    const services = loadServices()
    const newService = {
      id: `service-${Date.now()}`,
      ...req.body,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    }
    
    services.push(newService)
    
    if (saveServices(services)) {
      res.status(201).json(newService)
    } else {
      throw new Error('Ошибка сохранения')
    }
  } catch (error) {
    console.error('Ошибка создания услуги:', error)
    res.status(500).json({ error: 'Ошибка создания услуги' })
  }
})

// Обновление услуги
router.put('/:id', (req, res) => {
  try {
    const services = loadServices()
    const index = services.findIndex(s => s.id === req.params.id)
    
    if (index !== -1) {
      services[index] = {
        ...services[index],
        ...req.body,
        isActive: req.body.isActive !== undefined ? req.body.isActive : services[index].isActive
      }
      
      if (saveServices(services)) {
        res.json(services[index])
      } else {
        throw new Error('Ошибка сохранения')
      }
    } else {
      res.status(404).json({ error: 'Услуга не найдена' })
    }
  } catch (error) {
    console.error('Ошибка обновления услуги:', error)
    res.status(500).json({ error: 'Ошибка обновления услуги' })
  }
})

// Удаление услуги
router.delete('/:id', (req, res) => {
  try {
    const services = loadServices()
    const filteredServices = services.filter(s => s.id !== req.params.id)
    
    if (filteredServices.length < services.length) {
      if (saveServices(filteredServices)) {
        res.json({ success: true, message: 'Услуга удалена' })
      } else {
        throw new Error('Ошибка сохранения')
      }
    } else {
      res.status(404).json({ error: 'Услуга не найдена' })
    }
  } catch (error) {
    console.error('Ошибка удаления услуги:', error)
    res.status(500).json({ error: 'Ошибка удаления услуги' })
  }
})

// Получение категорий услуг
router.get('/categories/list', (req, res) => {
  try {
    const services = loadServices()
    const categories = [...new Set(services.map(s => s.category))].filter(Boolean)
    res.json(categories)
  } catch (error) {
    console.error('Ошибка получения категорий:', error)
    res.status(500).json({ error: 'Ошибка получения категорий' })
  }
})

// Получение услуг по категории
router.get('/category/:category', (req, res) => {
  try {
    const services = loadServices()
    const categoryServices = services.filter(s => s.category === req.params.category)
    res.json(categoryServices)
  } catch (error) {
    console.error('Ошибка получения услуг по категории:', error)
    res.status(500).json({ error: 'Ошибка получения услуг по категории' })
  }
})

// Активация/деактивация услуги
router.patch('/:id/toggle', (req, res) => {
  try {
    const services = loadServices()
    const index = services.findIndex(s => s.id === req.params.id)
    
    if (index !== -1) {
      services[index].isActive = !services[index].isActive
      
      if (saveServices(services)) {
        res.json({ 
          success: true, 
          isActive: services[index].isActive,
          message: `Услуга ${services[index].isActive ? 'активирована' : 'деактивирована'}`
        })
      } else {
        throw new Error('Ошибка сохранения')
      }
    } else {
      res.status(404).json({ error: 'Услуга не найдена' })
    }
  } catch (error) {
    console.error('Ошибка переключения статуса услуги:', error)
    res.status(500).json({ error: 'Ошибка переключения статуса услуги' })
  }
})

module.exports = router
