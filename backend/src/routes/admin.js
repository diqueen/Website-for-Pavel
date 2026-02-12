const express = require('express')
const router = express.Router()

// Кэш для админ данных
let adminCache = {
  products: null,
  services: null,
  contacts: null,
  stats: null
}
let adminCacheTimestamp = null
const ADMIN_CACHE_DURATION = 10 * 60 * 1000 // 10 минут

// Загрузка данных из JSON файлов
const { 
  loadProductsForTab, 
  saveProductsForTab, 
  loadAllProducts,
  getProductsStats 
} = require('../utils/productsFiles')

// Загрузка товаров для конкретной вкладки (для совместимости)
const loadProducts = (tabId = 'products') => {
  return loadProductsForTab(tabId)
}

// Сохранение товаров для конкретной вкладки (для совместимости)
const saveProducts = (products, tabId = 'products') => {
  return saveProductsForTab(tabId, products)
}

const loadServices = () => {
  try {
    const fs = require('fs')
    const path = require('path')
    const dataPath = path.join(__dirname, '../../data/services.json')
    
    // Используем fs.readFileSync вместо require, чтобы избежать кэширования Node.js
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    return Array.isArray(data) ? data : []
    }
    return []
  } catch (error) {
    console.error('Ошибка загрузки услуг:', error)
    return []
  }
}

const saveServices = (services) => {
  try {
    const fs = require('fs')
    const path = require('path')
    const dataPath = path.join(__dirname, '../../data/services.json')
    fs.writeFileSync(dataPath, JSON.stringify(services, null, 2))
    
    // Сбрасываем кэш require, если файл был загружен через require
    try {
      const resolvedPath = require.resolve(dataPath)
      if (require.cache[resolvedPath]) {
        delete require.cache[resolvedPath]
      }
    } catch (e) {
      // Игнорируем ошибку, если файл не был загружен через require
    }
    
    console.log('Услуги сохранены, кэш сброшен')
    return true
  } catch (error) {
    console.error('Ошибка сохранения услуг:', error)
    return false
  }
}

const loadContacts = () => {
  try {
    const data = require('../../data/contacts.json')
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Ошибка загрузки контактов:', error)
    return []
  }
}

const saveContacts = (contacts) => {
  try {
    const fs = require('fs')
    const path = require('path')
    const dataPath = path.join(__dirname, '../../data/contacts.json')
    fs.writeFileSync(dataPath, JSON.stringify(contacts, null, 2))
    return true
  } catch (error) {
    console.error('Ошибка сохранения контактов:', error)
    return false
  }
}

const loadCooperation = () => {
  try {
    const fs = require('fs')
    const path = require('path')
    const dataPath = path.join(__dirname, '../../data/cooperation.json')
    
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
      return Array.isArray(data) ? data : []
    }
    return []
  } catch (error) {
    console.error('Ошибка загрузки заявок на сотрудничество:', error)
    return []
  }
}

const saveCooperation = (requests) => {
  try {
    const fs = require('fs')
    const path = require('path')
    const dataPath = path.join(__dirname, '../../data/cooperation.json')
    fs.writeFileSync(dataPath, JSON.stringify(requests, null, 2))
    return true
  } catch (error) {
    console.error('Ошибка сохранения заявок на сотрудничество:', error)
    return false
  }
}

// Функции для работы с категориями
const loadCategories = () => {
  try {
    const fs = require('fs')
    const path = require('path')
    const dataPath = path.join(__dirname, '../../data/categories.json')
    
    let categories = []
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
      categories = Array.isArray(data) ? data : []
    } else {
      // Если файла нет, создаем из существующих категорий товаров
      const products = loadProducts()
      const existingCategories = [...new Set(products.map(p => p.category).filter(Boolean))]
      categories = existingCategories.map((name, index) => ({
        id: (index + 1).toString(),
        name: name,
        createdAt: new Date().toISOString()
      }))
      saveCategories(categories)
      return categories
    }
    
    // Удаляем категории, в которых нет товаров
    const products = loadProducts()
    const categoriesWithProducts = new Set(products.map(p => p.category).filter(Boolean))
    
    const filteredCategories = categories.filter(cat => {
      const hasProducts = categoriesWithProducts.has(cat.name)
      if (!hasProducts) {
        console.log(`Удаление пустой категории: ${cat.name}`)
      }
      return hasProducts
    })
    
    // Сохраняем только категории с товарами
    if (filteredCategories.length !== categories.length) {
      saveCategories(filteredCategories)
      console.log(`Удалено ${categories.length - filteredCategories.length} пустых категорий`)
    }
    
    return filteredCategories
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error)
    return []
  }
}

const saveCategories = (categories) => {
  try {
    const fs = require('fs')
    const path = require('path')
    const dataPath = path.join(__dirname, '../../data/categories.json')
    fs.writeFileSync(dataPath, JSON.stringify(categories, null, 2))
    return true
  } catch (error) {
    console.error('Ошибка сохранения категорий:', error)
    return false
  }
}

// Функция для автоматического определения статуса наличия товара
const calculateStockStatus = (product) => {
  const quantity = parseInt(product.quantity) || 0
  
  // Товар в наличии, если количество > 0
  return quantity > 0
}

// Функция для обновления статуса всех товаров
// Обновление статуса товаров для всех вкладок
const updateAllProductsStockStatus = () => {
  try {
    const tabs = ['products', 'ship-parts', 'fittings', 'heat-exchangers']
    const allProducts = []
    
    tabs.forEach(tabId => {
      const products = loadProductsForTab(tabId)
      let updated = false
      
      products.forEach(product => {
        const correctStatus = calculateStockStatus(product)
        if (product.inStock !== correctStatus) {
          product.inStock = correctStatus
          updated = true
        }
      })
      
      if (updated) {
        saveProductsForTab(tabId, products)
        console.log(`Статус наличия товаров обновлен для вкладки ${tabId}`)
      }
      
      allProducts.push(...products)
    })
    
    return allProducts
  } catch (error) {
    console.error('Ошибка обновления статуса товаров:', error)
    return []
  }
}

// Dashboard - получение статистики
router.get('/dashboard', (req, res) => {
  try {
    // Получаем статистику по всем вкладкам
    const productsStats = getProductsStats()
    const services = loadServices()
    const contacts = loadContacts()
    const cooperation = loadCooperation()
    
    const stats = {
      totalProducts: productsStats.total,
      totalServices: services.length,
      totalContacts: contacts.length,
      totalCooperation: cooperation.length,
      inStock: productsStats.inStock,
      outOfStock: productsStats.outOfStock,
      categories: 0, // Будет вычислено из всех вкладок
      totalValue: 0, // Будет вычислено из всех вкладок
      byTab: productsStats.byTab // Статистика по каждой вкладке
    }
    
    // Вычисляем общее количество категорий и общую стоимость
    const allProducts = loadAllProducts()
    stats.categories = [...new Set(allProducts.map(p => p.category))].length
    stats.totalValue = allProducts.reduce((sum, p) => {
      const price = parseFloat(String(p.price).replace(/[^\d.]/g, '')) || 0
      return sum + (price * (p.quantity || 0))
    }, 0)
    
    res.json(stats)
  } catch (error) {
    console.error('Ошибка получения статистики:', error)
    res.status(500).json({ error: 'Ошибка получения статистики' })
  }
})

// Товары - CRUD операции
// Параметр ?tab определяет, из какого файла загружать товары
router.get('/products', (req, res) => {
  try {
    // Получаем вкладку из query параметра (по умолчанию 'products')
    const tabId = req.query.tab || 'products'
    
    console.log(`📥 Загрузка товаров для вкладки: ${tabId}`)
    
    // Загружаем товары для конкретной вкладки
    const products = loadProductsForTab(tabId)
    
    console.log(`   Загружено товаров из файла: ${products.length}`)
    
    // Обновляем статус товаров для этой вкладки
    const updatedProducts = products.map(product => {
      const quantity = product.quantity || 0
      const price = parseFloat(product.price) || 0
      return {
        ...product,
        inStock: calculateStockStatus({ quantity, price })
      }
    })
    
    // Сохраняем обновленные товары только если были изменения
    const hasChanges = updatedProducts.some((p, i) => p.inStock !== products[i]?.inStock)
    if (hasChanges) {
      saveProductsForTab(tabId, updatedProducts)
    }
    
    // Сортируем товары: сначала в наличии, потом нет в наличии
    updatedProducts.sort((a, b) => {
      if (a.inStock && !b.inStock) return -1
      if (!a.inStock && b.inStock) return 1
      return 0
    })
    
    console.log(`   Отправлено товаров: ${updatedProducts.length}`)
    
    res.json(updatedProducts)
  } catch (error) {
    console.error('Ошибка получения товаров:', error)
    res.status(500).json({ error: 'Ошибка получения товаров' })
  }
})

router.post('/products', (req, res) => {
  try {
    const { name, description, price, category, drawing, image, images, unit, quantity, inStock } = req.body
    
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Название, цена и категория обязательны' })
    }
    
    // Получаем вкладку из query параметра (по умолчанию 'products')
    const tabId = req.query.tab || 'products'
    
    const products = loadProductsForTab(tabId)
    const newProduct = {
      id: Date.now().toString(),
      name,
      description: description || '',
      price,
      category,
      drawing: drawing || '',
      image: image || '',
      images: Array.isArray(images) ? images : [],
      unit: unit || 'шт',
      quantity: parseInt(quantity) || 0,
      inStock: calculateStockStatus({ quantity: parseInt(quantity) || 0, price }),
      createdAt: new Date().toISOString()
    }
    
    products.push(newProduct)
    saveProductsForTab(tabId, products)
    
    res.status(201).json(newProduct)
  } catch (error) {
    console.error('Ошибка создания товара:', error)
    res.status(500).json({ error: 'Ошибка создания товара' })
  }
})

router.put('/products/:id', (req, res) => {
  try {
    const { id } = req.params
    const { name, description, price, category, drawing, image, images, unit, quantity, inStock } = req.body
    
    // Ищем товар во всех файлах
    const tabs = ['products', 'ship-parts', 'fittings', 'heat-exchangers']
    let foundTab = null
    let foundIndex = -1
    let products = null
    
    for (const tabId of tabs) {
      const tabProducts = loadProductsForTab(tabId)
      const index = tabProducts.findIndex(p => p.id === id)
      if (index !== -1) {
        foundTab = tabId
        foundIndex = index
        products = tabProducts
        break
      }
    }
    
    if (!foundTab || foundIndex === -1) {
      return res.status(404).json({ error: 'Товар не найден' })
    }
    
    // Обновляем товар
    const updatedProduct = {
      ...products[foundIndex],
      name: name || products[foundIndex].name,
      description: description !== undefined ? description : products[foundIndex].description,
      price: price || products[foundIndex].price,
      category: category || products[foundIndex].category,
      drawing: drawing !== undefined ? drawing : products[foundIndex].drawing,
      image: image !== undefined ? image : products[foundIndex].image,
      images: images !== undefined ? (Array.isArray(images) ? images : []) : (products[foundIndex].images || []),
      unit: unit || products[foundIndex].unit,
      quantity: quantity !== undefined ? parseInt(quantity) : products[foundIndex].quantity,
      updatedAt: new Date().toISOString()
    }
    
    // Автоматически определяем статус наличия на основе количества и цены
    updatedProduct.inStock = calculateStockStatus(updatedProduct)
    
    products[foundIndex] = updatedProduct
    
    saveProductsForTab(foundTab, products)
    res.json(products[foundIndex])
  } catch (error) {
    console.error('Ошибка обновления товара:', error)
    res.status(500).json({ error: 'Ошибка обновления товара' })
  }
})

router.delete('/products/:id', (req, res) => {
  try {
    const { id } = req.params
    
    // Ищем товар во всех файлах
    const tabs = ['products', 'ship-parts', 'fittings', 'heat-exchangers']
    let foundTab = null
    let products = null
    
    for (const tabId of tabs) {
      const tabProducts = loadProductsForTab(tabId)
      const index = tabProducts.findIndex(p => p.id === id)
      if (index !== -1) {
        foundTab = tabId
        products = tabProducts.filter(p => p.id !== id)
        break
      }
    }
    
    if (!foundTab) {
      return res.status(404).json({ error: 'Товар не найден' })
    }
    
    saveProductsForTab(foundTab, products)
    res.json({ message: 'Товар удален' })
  } catch (error) {
    console.error('Ошибка удаления товара:', error)
    res.status(500).json({ error: 'Ошибка удаления товара' })
  }
})

// Удаление всех товаров для конкретной вкладки, по категории или по списку ID
router.delete('/products', (req, res) => {
  try {
    // Получаем вкладку из query параметра (по умолчанию 'products')
    const tabId = req.query.tab || 'products'
    const category = req.query.category // Опциональный параметр для удаления по категории
    const ids = req.query.ids // Опциональный параметр для удаления по списку ID (через запятую)
    
    if (ids) {
      // Батч-удаление по списку ID (максимально быстро!)
      const idArray = ids.split(',').filter(id => id.trim())
      const products = loadProductsForTab(tabId)
      const filteredProducts = products.filter(p => !idArray.includes(p.id))
      const deletedCount = products.length - filteredProducts.length
      
      saveProductsForTab(tabId, filteredProducts)
      
      console.log(`Быстро удалено ${deletedCount} товаров по ID для вкладки ${tabId}`)
      res.json({ 
        message: `Удалено ${deletedCount} товаров`,
        deleted: deletedCount
      })
    } else if (category) {
      // Удаляем товары только указанной категории
      const products = loadProductsForTab(tabId)
      const filteredProducts = products.filter(p => p.category !== category)
      const deletedCount = products.length - filteredProducts.length
      
      saveProductsForTab(tabId, filteredProducts)
      
      console.log(`Удалено ${deletedCount} товаров категории "${category}" для вкладки ${tabId}`)
      res.json({ 
        message: `Удалено ${deletedCount} товаров категории "${category}"`,
        deleted: deletedCount
      })
    } else {
      // Удаляем все товары для вкладки
      const emptyProducts = []
      saveProductsForTab(tabId, emptyProducts)
      
      // Явно сбрасываем кеш в products.js
      try {
        const productsRoute = require('./products')
        if (productsRoute && productsRoute.clearProductsCache) {
          productsRoute.clearProductsCache()
          console.log('Кеш товаров сброшен после удаления всех товаров')
        }
      } catch (e) {
        console.log('Не удалось сбросить кэш products.js:', e.message)
      }
      
      // После удаления всех товаров удаляем все категории (только для этой вкладки)
      // Категории хранятся отдельно, но для совместимости оставляем
      const emptyCategories = []
      saveCategories(emptyCategories)
      
      console.log(`Все товары для вкладки ${tabId} удалены, кеш сброшен`)
      res.json({ message: `Все товары для вкладки ${tabId} удалены` })
    }
  } catch (error) {
    console.error('Ошибка удаления товаров:', error)
    res.status(500).json({ error: 'Ошибка удаления товаров' })
  }
})

// Услуги - CRUD операции
router.get('/services', (req, res) => {
  try {
    const services = loadServices()
    console.log('Загружено услуг:', services.length)
    
    // Всегда отправляем упрощенную версию для списка (без изображений и видео)
    // Это предотвращает зависания из-за больших base64 строк
    const simplifiedServices = services.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      price: s.price,
      executionTime: s.executionTime,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      // Не отправляем изображения и видео в списке - они загружаются отдельно при редактировании
      hasImage: !!s.image,
      hasVideo: !!s.video
    }))
    
    console.log('Отправлена упрощенная версия услуг (без изображений/видео)')
    res.json(simplifiedServices)
  } catch (error) {
    console.error('Ошибка получения услуг:', error)
    res.status(500).json({ error: 'Ошибка получения услуг: ' + error.message })
  }
})

router.post('/services', (req, res) => {
  try {
    // Логируем размер данных
    const requestSize = JSON.stringify(req.body).length
    console.log('Размер данных создания услуги:', (requestSize / 1024 / 1024).toFixed(2), 'MB')
    
    const { name, description, price, executionTime, image, video } = req.body
    
    // Валидация обязательных полей
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Название услуги обязательно' })
    }
    
    if (!description || description.trim() === '') {
      return res.status(400).json({ error: 'Описание услуги обязательно' })
    }
    
    if (price === undefined || price === null || price === '') {
      return res.status(400).json({ error: 'Цена услуги обязательна' })
    }
    
    const services = loadServices()
    const newService = {
      id: Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      price: String(price),
      executionTime: executionTime || '',
      image: image || '',
      video: video || '',
      createdAt: new Date().toISOString()
    }
    
    services.push(newService)
    const saved = saveServices(services)
    
    if (!saved) {
      return res.status(500).json({ error: 'Ошибка сохранения услуги' })
    }
    
    console.log('Услуга успешно создана:', newService.id)
    // Возвращаем упрощенную версию (без изображений и видео)
    const simplifiedService = {
      id: newService.id,
      name: newService.name,
      description: newService.description,
      price: newService.price,
      executionTime: newService.executionTime,
      createdAt: newService.createdAt,
      hasImage: !!newService.image,
      hasVideo: !!newService.video
    }
    res.status(201).json(simplifiedService)
  } catch (error) {
    console.error('Ошибка создания услуги:', error)
    res.status(500).json({ error: 'Ошибка создания услуги: ' + error.message })
  }
})

// Получить полные данные услуги (с изображениями и видео) для редактирования
router.get('/services/:id/full', (req, res) => {
  try {
    const { id } = req.params
    const services = loadServices()
    const service = services.find(s => s.id === id)
    
    if (!service) {
      return res.status(404).json({ error: 'Услуга не найдена' })
    }
    
    // Отправляем полные данные с изображениями и видео
    res.json(service)
  } catch (error) {
    console.error('Ошибка получения услуги:', error)
    res.status(500).json({ error: 'Ошибка получения услуги' })
  }
})

router.put('/services/:id', (req, res) => {
  try {
    const { id } = req.params
    const { name, description, price, executionTime, image, video } = req.body
    
    // Логируем размер данных
    const requestSize = JSON.stringify(req.body).length
    console.log('Размер данных обновления услуги:', (requestSize / 1024 / 1024).toFixed(2), 'MB')
    
    const services = loadServices()
    const serviceIndex = services.findIndex(s => s.id === id)
    
    if (serviceIndex === -1) {
      return res.status(404).json({ error: 'Услуга не найдена' })
    }
    
    services[serviceIndex] = {
      ...services[serviceIndex],
      name: name !== undefined ? name.trim() : services[serviceIndex].name,
      description: description !== undefined ? description.trim() : services[serviceIndex].description,
      price: price !== undefined ? String(price) : services[serviceIndex].price,
      executionTime: executionTime !== undefined ? executionTime : services[serviceIndex].executionTime,
      image: image !== undefined ? image : services[serviceIndex].image,
      video: video !== undefined ? video : services[serviceIndex].video,
      updatedAt: new Date().toISOString()
    }
    
    const saved = saveServices(services)
    
    if (!saved) {
      return res.status(500).json({ error: 'Ошибка сохранения услуги' })
    }
    
    console.log('Услуга успешно обновлена:', id)
    // Возвращаем упрощенную версию после обновления (без изображений и видео)
    const updatedService = {
      id: services[serviceIndex].id,
      name: services[serviceIndex].name,
      description: services[serviceIndex].description,
      price: services[serviceIndex].price,
      executionTime: services[serviceIndex].executionTime,
      createdAt: services[serviceIndex].createdAt,
      updatedAt: services[serviceIndex].updatedAt,
      hasImage: !!services[serviceIndex].image,
      hasVideo: !!services[serviceIndex].video
    }
    res.json(updatedService)
  } catch (error) {
    console.error('Ошибка обновления услуги:', error)
    res.status(500).json({ error: 'Ошибка обновления услуги' })
  }
})

router.delete('/services/:id', (req, res) => {
  try {
    const { id } = req.params
    const services = loadServices()
    const serviceIndex = services.findIndex(s => s.id === id)
    
    if (serviceIndex === -1) {
      return res.status(404).json({ error: 'Услуга не найдена' })
    }
    
    services.splice(serviceIndex, 1)
    saveServices(services)
    res.json({ message: 'Услуга удалена' })
  } catch (error) {
    console.error('Ошибка удаления услуги:', error)
    res.status(500).json({ error: 'Ошибка удаления услуги' })
  }
})

// Контакты - CRUD операции
router.get('/contacts', (req, res) => {
  try {
    const contacts = loadContacts()
    res.json(contacts)
  } catch (error) {
    console.error('Ошибка получения контактов:', error)
    res.status(500).json({ error: 'Ошибка получения контактов' })
  }
})

router.post('/contacts', (req, res) => {
  try {
    const { name, email, phone, message, status } = req.body
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Имя и email обязательны' })
    }
    
    const contacts = loadContacts()
    const newContact = {
      id: Date.now().toString(),
      name,
      email,
      phone: phone || '',
      message: message || '',
      status: status || 'new',
      createdAt: new Date().toISOString()
    }
    
    contacts.push(newContact)
    saveContacts(contacts)
    
    res.status(201).json(newContact)
  } catch (error) {
    console.error('Ошибка создания контакта:', error)
    res.status(500).json({ error: 'Ошибка создания контакта' })
  }
})

router.put('/contacts/:id', (req, res) => {
  try {
    const { id } = req.params
    const { name, email, phone, message, status } = req.body
    
    const contacts = loadContacts()
    // Преобразуем id в число для сравнения, так как в файле id может быть числом
    const contactId = isNaN(Number(id)) ? id : Number(id)
    const contactIndex = contacts.findIndex(c => {
      // Сравниваем как строку и как число
      return String(c.id) === String(id) || c.id === contactId
    })
    
    if (contactIndex === -1) {
      return res.status(404).json({ error: 'Контакт не найден' })
    }
    
    // Обновляем только переданные поля
    const updatedContact = {
      ...contacts[contactIndex],
      updatedAt: new Date().toISOString()
    }
    
    if (name !== undefined) updatedContact.name = name
    if (email !== undefined) updatedContact.email = email
    if (phone !== undefined) updatedContact.phone = phone
    if (message !== undefined) updatedContact.message = message
    if (status !== undefined) updatedContact.status = status
    
    contacts[contactIndex] = updatedContact
    
    saveContacts(contacts)
    console.log('Контакт обновлен:', updatedContact)
    res.json(updatedContact)
  } catch (error) {
    console.error('Ошибка обновления контакта:', error)
    res.status(500).json({ error: 'Ошибка обновления контакта' })
  }
})

router.delete('/contacts/:id', (req, res) => {
  try {
    const { id } = req.params
    const contacts = loadContacts()
    // Преобразуем id в число для сравнения, так как в файле id может быть числом
    const contactId = isNaN(Number(id)) ? id : Number(id)
    const contactIndex = contacts.findIndex(c => {
      // Сравниваем как строку и как число
      return String(c.id) === String(id) || c.id === contactId
    })
    
    if (contactIndex === -1) {
      return res.status(404).json({ error: 'Контакт не найден' })
    }
    
    contacts.splice(contactIndex, 1)
    saveContacts(contacts)
    console.log('Контакт удален, ID:', id)
    res.json({ message: 'Контакт удален' })
  } catch (error) {
    console.error('Ошибка удаления контакта:', error)
    res.status(500).json({ error: 'Ошибка удаления контакта' })
  }
})

// Категории - CRUD операции
router.get('/categories', (req, res) => {
  try {
    const categories = loadCategories()
    res.json(categories)
  } catch (error) {
    console.error('Ошибка получения категорий:', error)
    res.status(500).json({ error: 'Ошибка получения категорий' })
  }
})

router.post('/categories', (req, res) => {
  try {
    const { name } = req.body
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Название категории обязательно' })
    }
    
    const categories = loadCategories()
    
    // Проверяем, не существует ли уже такая категория
    const existingCategory = categories.find(c => c.name.toLowerCase() === name.trim().toLowerCase())
    if (existingCategory) {
      return res.status(400).json({ error: 'Категория с таким названием уже существует' })
    }
    
    const newCategory = {
      id: Date.now().toString(),
      name: name.trim(),
      createdAt: new Date().toISOString()
    }
    
    categories.push(newCategory)
    saveCategories(categories)
    
    res.status(201).json(newCategory)
  } catch (error) {
    console.error('Ошибка создания категории:', error)
    res.status(500).json({ error: 'Ошибка создания категории' })
  }
})

router.put('/categories/:id', (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Название категории обязательно' })
    }
    
    const categories = loadCategories()
    const categoryIndex = categories.findIndex(c => c.id === id)
    
    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Категория не найдена' })
    }
    
    // Проверяем, не существует ли уже такая категория (кроме текущей)
    const existingCategory = categories.find(c => 
      c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== id
    )
    if (existingCategory) {
      return res.status(400).json({ error: 'Категория с таким названием уже существует' })
    }
    
    const oldName = categories[categoryIndex].name
    categories[categoryIndex] = {
      ...categories[categoryIndex],
      name: name.trim(),
      updatedAt: new Date().toISOString()
    }
    
    saveCategories(categories)
    
    // Обновляем категорию во всех товарах
    const products = loadProducts()
    let productsUpdated = false
    products.forEach(product => {
      if (product.category === oldName) {
        product.category = name.trim()
        productsUpdated = true
      }
    })
    
    if (productsUpdated) {
      saveProducts(products)
    }
    
    res.json(categories[categoryIndex])
  } catch (error) {
    console.error('Ошибка обновления категории:', error)
    res.status(500).json({ error: 'Ошибка обновления категории' })
  }
})

router.delete('/categories/:id', (req, res) => {
  try {
    const { id } = req.params
    const categories = loadCategories()
    const categoryIndex = categories.findIndex(c => c.id === id)
    
    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Категория не найдена' })
    }
    
    const categoryName = categories[categoryIndex].name
    
    // Удаляем все товары с этой категорией из всех вкладок
    const tabs = ['products', 'ship-parts', 'fittings', 'heat-exchangers']
    let totalDeleted = 0
    const deletedByTab = {}
    
    tabs.forEach(tabId => {
      const products = loadProductsForTab(tabId)
      const productsBefore = products.length
      const filteredProducts = products.filter(p => p.category !== categoryName)
      const deletedCount = productsBefore - filteredProducts.length
      
      if (deletedCount > 0) {
        saveProductsForTab(tabId, filteredProducts)
        totalDeleted += deletedCount
        deletedByTab[tabId] = deletedCount
        console.log(`Удалено ${deletedCount} товаров категории "${categoryName}" из вкладки ${tabId}`)
      }
    })
    
    // Удаляем саму категорию
    categories.splice(categoryIndex, 1)
    saveCategories(categories)
    
    console.log(`Категория "${categoryName}" удалена. Всего удалено товаров: ${totalDeleted}`)
    
    res.json({ 
      message: `Категория "${categoryName}" удалена${totalDeleted > 0 ? `. Удалено ${totalDeleted} товар(ов) с этой категорией` : ''}`,
      deletedProducts: totalDeleted,
      deletedByTab: deletedByTab
    })
  } catch (error) {
    console.error('Ошибка удаления категории:', error)
    res.status(500).json({ error: 'Ошибка удаления категории' })
  }
})

// Заявки на сотрудничество
router.get('/cooperation', (req, res) => {
  try {
    const requests = loadCooperation()
    console.log('Загружено заявок на сотрудничество:', requests.length)
    res.json(requests)
  } catch (error) {
    console.error('Ошибка загрузки заявок на сотрудничество:', error)
    res.status(500).json({ error: 'Ошибка загрузки заявок на сотрудничество' })
  }
})

router.put('/cooperation/:id', (req, res) => {
  try {
    const { id } = req.params
    const { name, contact, positions, status } = req.body
    
    const requests = loadCooperation()
    const requestId = isNaN(Number(id)) ? id : Number(id)
    const requestIndex = requests.findIndex(r => {
      return String(r.id) === String(id) || r.id === requestId
    })
    
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Заявка не найдена' })
    }
    
    const updatedRequest = {
      ...requests[requestIndex],
      updatedAt: new Date().toISOString()
    }
    
    if (name !== undefined) updatedRequest.name = name
    if (contact !== undefined) updatedRequest.contact = contact
    if (positions !== undefined) updatedRequest.positions = positions
    if (status !== undefined) updatedRequest.status = status
    
    requests[requestIndex] = updatedRequest
    
    saveCooperation(requests)
    console.log('Заявка на сотрудничество обновлена:', updatedRequest)
    res.json(updatedRequest)
  } catch (error) {
    console.error('Ошибка обновления заявки на сотрудничество:', error)
    res.status(500).json({ error: 'Ошибка обновления заявки на сотрудничество' })
  }
})

router.delete('/cooperation/:id', (req, res) => {
  try {
    const { id } = req.params
    const requests = loadCooperation()
    const requestId = isNaN(Number(id)) ? id : Number(id)
    const requestIndex = requests.findIndex(r => {
      return String(r.id) === String(id) || r.id === requestId
    })
    
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Заявка не найдена' })
    }
    
    requests.splice(requestIndex, 1)
    saveCooperation(requests)
    console.log('Заявка на сотрудничество удалена, ID:', id)
    res.json({ message: 'Заявка удалена' })
  } catch (error) {
    console.error('Ошибка удаления заявки на сотрудничество:', error)
    res.status(500).json({ error: 'Ошибка удаления заявки на сотрудничество' })
  }
})

module.exports = router