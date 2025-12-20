const express = require('express')
const router = express.Router()
const { 
  loadProductsForTab, 
  saveProductsForTab, 
  loadAllProducts,
  getProductsStats 
} = require('../utils/productsFiles')

// Функция для принудительного сброса кэша (оставлена для совместимости)
function clearProductsCache() {
  console.log('Кэш товаров принудительно сброшен (для совместимости)')
}

// Получение всех товаров с поддержкой пагинации
// Параметр ?tab определяет, из какого файла загружать товары
router.get('/', (req, res) => {
  try {
    // Получаем вкладку из query параметра (по умолчанию 'products' - "Все товары")
    const tabId = req.query.tab || 'products'
    
    // Загружаем товары для конкретной вкладки
    const products = loadProductsForTab(tabId)
    
    // Отключаем кеширование браузером для актуальных данных
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    })
    
    // Параметры пагинации
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 12
    const inStockOnly = req.query.inStock === 'true'
    
    // Фильтрация товаров
    let filteredProducts = products
    if (inStockOnly) {
      filteredProducts = products.filter(product => product.inStock)
    }
    
    // Сортируем товары: сначала в наличии, потом нет в наличии
    filteredProducts.sort((a, b) => {
      if (a.inStock && !b.inStock) return -1
      if (!a.inStock && b.inStock) return 1
      return 0
    })
    
    // Вычисление пагинации
    const totalProducts = filteredProducts.length
    const totalPages = Math.ceil(totalProducts / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    
    // Получение товаров для текущей страницы
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)
    
    // Отключаем кеширование браузером для актуальных данных
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Content-Type': 'application/json; charset=utf-8'
    })
    
    // Если запрос с пагинацией, возвращаем объект с метаданными
    if (req.query.page || req.query.limit) {
      res.json({
        products: paginatedProducts,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalProducts: totalProducts,
          limit: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      })
    } else {
      // Обратная совместимость - возвращаем массив товаров
      res.json(products)
    }
  } catch (error) {
    console.error('Ошибка получения товаров:', error)
    res.status(500).json({ error: 'Ошибка получения товаров' })
  }
})

// Получение товара по ID (ищем во всех файлах)
router.get('/:id', (req, res) => {
  try {
    const productId = req.params.id
    console.log(`🔍 Поиск товара по ID: ${productId}`)
    
    // Ищем товар во всех файлах
    const allProducts = loadAllProducts()
    console.log(`   Всего товаров во всех файлах: ${allProducts.length}`)
    
    const product = allProducts.find(p => p.id === productId)
    
    if (product) {
      console.log(`   ✅ Товар найден: ${product.name}`)
      res.json(product)
    } else {
      console.log(`   ❌ Товар с ID "${productId}" не найден`)
      res.status(404).json({ error: 'Товар не найден' })
    }
  } catch (error) {
    console.error('Ошибка получения товара:', error)
    res.status(500).json({ error: 'Ошибка получения товара' })
  }
})

// Создание нового товара
// Параметр ?tab определяет, в какой файл сохранять товар
router.post('/', (req, res) => {
  try {
    // Получаем вкладку из query параметра (по умолчанию 'products')
    const tabId = req.query.tab || 'products'
    
    const products = loadProductsForTab(tabId)
    const newProduct = {
      id: `product-${Date.now()}`,
      ...req.body,
      inStock: req.body.inStock !== undefined ? req.body.inStock : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    products.push(newProduct)
    
    if (saveProductsForTab(tabId, products)) {
      res.status(201).json(newProduct)
    } else {
      throw new Error('Ошибка сохранения')
    }
  } catch (error) {
    console.error('Ошибка создания товара:', error)
    res.status(500).json({ error: 'Ошибка создания товара' })
  }
})

// Обновление товара
// Ищем товар во всех файлах и обновляем в нужном
router.put('/:id', (req, res) => {
  try {
    // Ищем товар во всех файлах
    const tabs = ['products', 'ship-parts', 'fittings', 'heat-exchangers']
    let foundTab = null
    let foundIndex = -1
    let products = null
    
    for (const tabId of tabs) {
      const tabProducts = loadProductsForTab(tabId)
      const index = tabProducts.findIndex(p => p.id === req.params.id)
      if (index !== -1) {
        foundTab = tabId
        foundIndex = index
        products = tabProducts
        break
      }
    }
    
    if (foundTab && foundIndex !== -1) {
      products[foundIndex] = {
        ...products[foundIndex],
        ...req.body,
        updatedAt: new Date().toISOString()
      }
      
      if (saveProductsForTab(foundTab, products)) {
        res.json(products[foundIndex])
      } else {
        throw new Error('Ошибка сохранения')
      }
    } else {
      res.status(404).json({ error: 'Товар не найден' })
    }
  } catch (error) {
    console.error('Ошибка обновления товара:', error)
    res.status(500).json({ error: 'Ошибка обновления товара' })
  }
})

// Удаление товара
// Ищем товар во всех файлах и удаляем из нужного
router.delete('/:id', (req, res) => {
  try {
    // Ищем товар во всех файлах
    const tabs = ['products', 'ship-parts', 'fittings', 'heat-exchangers']
    let foundTab = null
    let products = null
    
    for (const tabId of tabs) {
      const tabProducts = loadProductsForTab(tabId)
      const index = tabProducts.findIndex(p => p.id === req.params.id)
      if (index !== -1) {
        foundTab = tabId
        products = tabProducts.filter(p => p.id !== req.params.id)
        break
      }
    }
    
    if (foundTab && products) {
      if (saveProductsForTab(foundTab, products)) {
        res.json({ success: true, message: 'Товар удален' })
      } else {
        throw new Error('Ошибка сохранения')
      }
    } else {
      res.status(404).json({ error: 'Товар не найден' })
    }
  } catch (error) {
    console.error('Ошибка удаления товара:', error)
    res.status(500).json({ error: 'Ошибка удаления товара' })
  }
})

// Получение категорий товаров для конкретной вкладки
router.get('/categories/list', (req, res) => {
  try {
    const tabId = req.query.tab || 'products'
    const products = loadProductsForTab(tabId)
    const categories = [...new Set(products.map(p => p.category))].filter(Boolean)
    res.json(categories)
  } catch (error) {
    console.error('Ошибка получения категорий:', error)
    res.status(500).json({ error: 'Ошибка получения категорий' })
  }
})

// Получение товаров по категории для конкретной вкладки
router.get('/category/:category', (req, res) => {
  try {
    const tabId = req.query.tab || 'products'
    const products = loadProductsForTab(tabId)
    const categoryProducts = products.filter(p => p.category === req.params.category)
    
    // Сортируем товары по категории: сначала в наличии, потом нет в наличии
    categoryProducts.sort((a, b) => {
      if (a.inStock && !b.inStock) return -1
      if (!a.inStock && b.inStock) return 1
      return 0
    })
    
    res.json(categoryProducts)
  } catch (error) {
    console.error('Ошибка получения товаров по категории:', error)
    res.status(500).json({ error: 'Ошибка получения товаров по категории' })
  }
})

// Поиск товаров в конкретной вкладке
router.get('/search/:query', (req, res) => {
  try {
    const tabId = req.query.tab || 'products'
    const products = loadProductsForTab(tabId)
    const { query } = req.params
    const searchLower = query.toLowerCase()
    
    const searchResults = products.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      (p.description && p.description.toLowerCase().includes(searchLower)) ||
      (p.category && p.category.toLowerCase().includes(searchLower))
    )
    
    // Сортируем результаты поиска: сначала в наличии, потом нет в наличии
    searchResults.sort((a, b) => {
      if (a.inStock && !b.inStock) return -1
      if (!a.inStock && b.inStock) return 1
      return 0
    })
    
    res.json({
      query,
      results: searchResults,
      total: searchResults.length
    })
  } catch (error) {
    console.error('Ошибка поиска товаров:', error)
    res.status(500).json({ error: 'Ошибка поиска товаров' })
  }
})

// Получение статистики по всем вкладкам
router.get('/stats/all', (req, res) => {
  try {
    const stats = getProductsStats()
    res.json(stats)
  } catch (error) {
    console.error('Ошибка получения статистики:', error)
    res.status(500).json({ error: 'Ошибка получения статистики' })
  }
})

// Экспортируем функцию для сброса кэша
module.exports = router
module.exports.clearProductsCache = clearProductsCache
