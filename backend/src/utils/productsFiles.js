const fs = require('fs')
const path = require('path')

// Маппинг вкладок на имена файлов
const TAB_TO_FILE = {
  'products': 'products-all.json',
  'ship-parts': 'products-ship-parts.json',
  'fittings': 'products-fittings.json',
  'heat-exchangers': 'products-heat-exchangers.json'
}

// Обратный маппинг для получения вкладки по имени файла
const FILE_TO_TAB = {
  'products-all.json': 'products',
  'products-ship-parts.json': 'ship-parts',
  'products-fittings.json': 'fittings',
  'products-heat-exchangers.json': 'heat-exchangers'
}

// Получить путь к файлу для вкладки
function getProductsFilePath(tabId) {
  // Проверяем оба возможных пути к данным
  const possiblePaths = [
    path.join(__dirname, '../../data'), // react/backend/data
    path.join(__dirname, '../../../backend/data'), // react/backend/data (альтернативный путь)
  ]
  
  // Используем первый существующий путь или создаем директорию
  let dataDir = possiblePaths[0]
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      dataDir = possiblePath
      break
    }
  }
  
  // Если директории нет, создаем первую
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  
  const fileName = TAB_TO_FILE[tabId] || 'products-all.json'
  return path.join(dataDir, fileName)
}

// Загрузить товары для конкретной вкладки
function loadProductsForTab(tabId) {
  try {
    const filePath = getProductsFilePath(tabId)
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8')
      
      // Проверяем, что файл не пустой и содержит валидный JSON
      if (!data || data.trim() === '') {
        console.warn(`Файл ${filePath} пуст, возвращаем пустой массив`)
        return []
      }
      
      try {
        const products = JSON.parse(data)
        return Array.isArray(products) ? products : []
      } catch (parseError) {
        // Если ошибка парсинга, пытаемся восстановить файл
        console.error(`Ошибка парсинга JSON для вкладки ${tabId}:`, parseError.message)
        console.log(`Попытка восстановления файла ${filePath}...`)
        
        // Сохраняем пустой массив, чтобы восстановить файл
        try {
          fs.writeFileSync(filePath, JSON.stringify([], null, 2))
          console.log(`Файл ${filePath} восстановлен (пустой массив)`)
        } catch (writeError) {
          console.error(`Не удалось восстановить файл ${filePath}:`, writeError)
        }
        
        return []
      }
    }
    return []
  } catch (error) {
    console.error(`Ошибка загрузки товаров для вкладки ${tabId}:`, error)
    return []
  }
}

// Сохранить товары для конкретной вкладки
// Используем атомарную запись через временный файл для предотвращения повреждения данных
function saveProductsForTab(tabId, products) {
  try {
    const filePath = getProductsFilePath(tabId)
    const dataDir = path.dirname(filePath)
    const tempFilePath = `${filePath}.tmp`
    
    // Создаем директорию, если её нет
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    // Сначала записываем во временный файл
    const jsonData = JSON.stringify(products, null, 2)
    fs.writeFileSync(tempFilePath, jsonData, 'utf8')
    
    // Проверяем, что временный файл записан корректно
    try {
      const testData = fs.readFileSync(tempFilePath, 'utf8')
      JSON.parse(testData) // Проверяем, что JSON валидный
    } catch (testError) {
      console.error(`❌ Ошибка валидации временного файла для вкладки ${tabId}:`, testError)
      // Удаляем временный файл при ошибке
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath)
        }
      } catch (unlinkError) {
        console.error(`Ошибка удаления временного файла:`, unlinkError)
      }
      return false
    }
    
    // Атомарно заменяем оригинальный файл временным
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    fs.renameSync(tempFilePath, filePath)
    
    console.log(`✅ Товары сохранены для вкладки ${tabId} в файл: ${filePath}`)
    console.log(`   Всего товаров: ${products.length}`)
    return true
  } catch (error) {
    console.error(`❌ Ошибка сохранения товаров для вкладки ${tabId}:`, error)
    
    // Удаляем временный файл при ошибке
    try {
      const tempFilePath = `${getProductsFilePath(tabId)}.tmp`
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath)
      }
    } catch (unlinkError) {
      // Игнорируем ошибку удаления временного файла
    }
    
    return false
  }
}

// Загрузить все товары из всех файлов (для статистики)
function loadAllProducts() {
  const allProducts = []
  const tabs = Object.keys(TAB_TO_FILE)
  
  tabs.forEach(tabId => {
    const products = loadProductsForTab(tabId)
    allProducts.push(...products)
  })
  
  return allProducts
}

// Получить статистику по всем вкладкам
function getProductsStats() {
  const stats = {
    total: 0,
    inStock: 0,
    outOfStock: 0,
    byTab: {}
  }
  
  const tabs = Object.keys(TAB_TO_FILE)
  
  tabs.forEach(tabId => {
    const products = loadProductsForTab(tabId)
    const tabStats = {
      total: products.length,
      inStock: products.filter(p => p.inStock).length,
      outOfStock: products.filter(p => !p.inStock).length
    }
    
    stats.byTab[tabId] = tabStats
    stats.total += tabStats.total
    stats.inStock += tabStats.inStock
    stats.outOfStock += tabStats.outOfStock
  })
  
  return stats
}

// Получить имя файла для вкладки
function getFileNameForTab(tabId) {
  return TAB_TO_FILE[tabId] || 'products-all.json'
}

// Получить вкладку по имени файла
function getTabForFileName(fileName) {
  return FILE_TO_TAB[fileName] || 'products'
}

module.exports = {
  getProductsFilePath,
  loadProductsForTab,
  saveProductsForTab,
  loadAllProducts,
  getProductsStats,
  getFileNameForTab,
  getTabForFileName,
  TAB_TO_FILE,
  FILE_TO_TAB
}

