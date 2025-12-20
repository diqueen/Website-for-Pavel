const express = require('express')
const multer = require('multer')
const xlsx = require('xlsx')
const path = require('path')
const fs = require('fs')
const router = express.Router()

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true)
    } else {
      cb(new Error('Только Excel файлы разрешены!'), false)
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
})

// Импортируем функции для работы с файлами товаров
const { 
  loadProductsForTab, 
  saveProductsForTab, 
  getTabForFileName 
} = require('../utils/productsFiles')

// Функция для проверки, является ли строка подкатегорией
// Подкатегория = объединение ячеек A-G (колонки 0-6), но НЕ первая строка
const isSubcategoryRow = (rowNum, merges) => {
  if (rowNum === 0) return false // Первая строка - это категория, не подкатегория
  if (!merges || merges.length === 0) return false
  
  for (const merge of merges) {
    // Проверяем, что объединение начинается и заканчивается в нашей строке
    if (merge.s.r === rowNum && merge.e.r === rowNum) {
      // Проверяем, что объединение охватывает колонки A-G (0-6)
      const mergeStartCol = merge.s.c
      const mergeEndCol = merge.e.c
      
      // Если объединение начинается с колонки A (0) и заканчивается на колонке G (6)
      if (mergeStartCol === 0 && mergeEndCol === 6) {
        return true
      }
    }
  }
  return false
}

// Функция для получения подкатегории из строки с объединенными ячейками A-G
const getSubcategoryFromRow = (rowNum, worksheet, merges) => {
  if (rowNum === 0) return '' // Первая строка - это категория
  
  // Ищем объединение A-G в этой строке
  for (const merge of merges) {
    if (merge.s.r === rowNum && merge.e.r === rowNum && 
        merge.s.c === 0 && merge.e.c === 6) {
      // Берем значение из начальной ячейки объединения (A)
      const cellAddress = xlsx.utils.encode_cell({ r: merge.s.r, c: merge.s.c })
      const cell = worksheet[cellAddress]
      if (cell && cell.v) {
        return cell.v.toString().trim()
      }
    }
  }
  
  // Если не нашли в объединениях, проверяем ячейку A напрямую
  const cellAddress = xlsx.utils.encode_cell({ r: rowNum, c: 0 })
  const cell = worksheet[cellAddress]
  if (cell && cell.v) {
    return cell.v.toString().trim()
  }
  
  return ''
}

// Функция для получения категории из первой строки
const getCategoryFromFirstRow = (worksheet, merges) => {
  const rowNum = 0
  let category = ''
  
  console.log('Поиск категории в первой строке (строка 0)')
  console.log('Объединения в первой строке:', merges.filter(m => m.s.r === rowNum))
  
  // Проверяем объединенные ячейки в первой строке
  if (merges && merges.length > 0) {
    for (const merge of merges) {
      if (merge.s.r === rowNum) {
        // Берем значение из начальной ячейки объединения
        const cellAddress = xlsx.utils.encode_cell({ r: merge.s.r, c: merge.s.c })
        const cell = worksheet[cellAddress]
        console.log(`Проверяем объединение: ${cellAddress}, значение:`, cell ? cell.v : 'нет')
        if (cell && cell.v) {
          category = cell.v.toString().trim()
          console.log('Категория найдена в объединении:', category)
          break
        }
      }
    }
  }
  
  // Если не нашли в объединениях, ищем в колонках A-G (0-6, так как категория может быть в D-E)
  if (!category) {
    console.log('Ищем категорию в отдельных ячейках первой строки')
    for (let colNum = 0; colNum <= 6; colNum++) {
      const cellAddress = xlsx.utils.encode_cell({ r: rowNum, c: colNum })
      const cell = worksheet[cellAddress]
      if (cell && cell.v) {
        const value = cell.v.toString().trim()
        console.log(`Колонка ${String.fromCharCode(65 + colNum)} (${colNum}):`, value)
        if (value.length > 0) {
          category = value
          console.log('Категория найдена:', category)
          break
        }
      }
    }
  }
  
  return category || 'Без категории'
}

// Функция для анализа структуры Excel файла
const analyzeExcelStructure = (worksheet) => {
  if (!worksheet || !worksheet['!ref']) {
    console.log('Нет данных в листе или нет диапазона')
    return []
  }
  
  let range
  try {
    range = xlsx.utils.decode_range(worksheet['!ref'])
    
    // Проверяем валидность диапазона
    if (!range || !range.s || !range.e) {
      console.warn('Неверный диапазон в листе')
      return []
    }
    
    // Проверяем, что диапазон имеет корректные координаты
    if (typeof range.s.r !== 'number' || typeof range.s.c !== 'number' ||
        typeof range.e.r !== 'number' || typeof range.e.c !== 'number') {
      console.warn('Некорректные координаты диапазона')
      return []
    }
    
  } catch (error) {
    console.warn('Ошибка декодирования диапазона:', error.message)
    return []
  }
  
  const analyzedRows = []
  const merges = worksheet['!merges'] || []
  
  console.log('Объединенные ячейки:', merges.length)
  console.log('Диапазон:', `R${range.s.r + 1}C${range.s.c + 1}:R${range.e.r + 1}C${range.e.c + 1}`)
  
  // Получаем категорию из первой строки (строка 0)
  const category = getCategoryFromFirstRow(worksheet, merges)
  console.log('Найдена категория:', category)
  
  const startRow = range.s?.r ?? 0
  const endRow = range.e?.r ?? 0
  
  console.log(`Обрабатываем строки с ${startRow} по ${endRow}`)
  
  // Текущая подкатегория (обновляется при встрече строки с объединением A-G)
  let currentSubcategory = ''
  
  // Начинаем со второй строки (индекс 1), так как:
  // Строка 0 (индекс 0) = категория
  // Строка 1+ (индекс 1+) = заголовки, подкатегории или товары
  for (let rowNum = Math.max(1, startRow); rowNum <= endRow; rowNum++) {
    
    // Проверяем, является ли строка подкатегорией (объединение A-G, но не первая строка)
    if (isSubcategoryRow(rowNum, merges)) {
      currentSubcategory = getSubcategoryFromRow(rowNum, worksheet, merges)
      console.log(`Строка ${rowNum + 1}: найдена подкатегория - "${currentSubcategory}"`)
      
      // Добавляем информацию о подкатегории в структуру
      analyzedRows.push({
        rowNumber: rowNum + 1,
        type: 'SUBCATEGORY',
        value: currentSubcategory,
        category: category,
        subcategory: currentSubcategory
      })
      continue
    }
    
    // Пропускаем первую строку (категория) и строку с заголовками (обычно строка 1)
    if (rowNum === 0 || rowNum === 1) {
      continue
    }
    
    // Читаем данные строки (только колонки A-F, индексы 0-5)
    const row = []
    for (let colNum = 0; colNum <= 5; colNum++) {
      const cellAddress = xlsx.utils.encode_cell({ r: rowNum, c: colNum })
      const cell = worksheet[cellAddress]
      
      // Если ячейка часть объединения, берем значение из начальной ячейки
      let cellValue = cell ? cell.v : ''
      if (cellValue === '' || cellValue === undefined || cellValue === null) {
        for (const merge of merges) {
          if (rowNum >= merge.s.r && rowNum <= merge.e.r &&
              colNum >= merge.s.c && colNum <= merge.e.c) {
            const masterCell = xlsx.utils.encode_cell({ r: merge.s.r, c: merge.s.c })
            const masterCellData = worksheet[masterCell]
            cellValue = masterCellData ? masterCellData.v : ''
            break
          }
        }
      }
      
      row.push(cellValue !== undefined && cellValue !== null ? cellValue : '')
    }
    
    // Пропускаем пустые строки
    if (row.every(cell => !cell || cell.toString().trim() === '')) {
      console.log(`Строка ${rowNum + 1}: пропущена (пустая)`)
      continue
    }
    
    // Проверяем, есть ли название товара в колонке B (индекс 1)
    const productName = row[1] ? row[1].toString().trim() : ''
    if (!productName) {
      console.log(`Строка ${rowNum + 1}: пропущена (нет названия в колонке B)`, row)
      continue
    }
    
    console.log(`Строка ${rowNum + 1}: найдена как товар - "${productName}"`, {
      A: row[0],
      B: row[1],
      C: row[2],
      D: row[3],
      E: row[4],
      F: row[5],
      subcategory: currentSubcategory || 'Без подкатегории'
    })
    
    // Это строка с товаром
    analyzedRows.push({
      rowNumber: rowNum + 1,
      type: 'PRODUCT',
      value: productName,
      category: category,
      subcategory: currentSubcategory || undefined, // Сохраняем текущую подкатегорию
      data: row
    })
  }
  
  console.log(`Всего найдено товаров: ${analyzedRows.filter(r => r.type === 'PRODUCT').length}`)
  console.log(`Всего найдено подкатегорий: ${analyzedRows.filter(r => r.type === 'SUBCATEGORY').length}`)
  return analyzedRows
}

// Функция для создания уникального ID товара на основе категории, подкатегории и названия
const generateProductId = (category, subcategory, name, sheetName) => {
  // Создаем уникальный ключ из категории, подкатегории, названия и листа
  const key = `${sheetName || ''}_${category || 'Без категории'}_${subcategory || 'Без подкатегории'}_${name || ''}`
  
  // Создаем хеш из ключа для более короткого ID
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  // Добавляем timestamp для дополнительной уникальности
  const timestamp = Date.now()
  
  // Возвращаем ID в формате: hash_timestamp
  return `product_${Math.abs(hash)}_${timestamp}_${Math.random().toString(36).substr(2, 5)}`
}

// Функция для конвертации в товары
// вид - опциональный параметр для установки вида товара (название вкладки: "Судовые запчасти", "Арматура", "Теплообменники")
const convertToProducts = (analyzedRows, sheetName = '', вид = null) => {
  const products = []
  console.log(`Конвертация товаров: получено ${analyzedRows.length} строк для обработки, лист: ${sheetName}${вид ? `, вид: ${вид}` : ''}`)
  
  for (const row of analyzedRows) {
    if (row.type === 'PRODUCT' && row.data) {
      const productData = row.data
      
      // Извлекаем данные согласно новой структуре:
      // Колонка A (индекс 0): номер товара - пропускаем
      // Колонка B (индекс 1): Наименование товара
      // Колонка C (индекс 2): Чертеж товара
      // Колонка D (индекс 3): Единица измерения
      // Колонка E (индекс 4): Количество
      // Колонка F (индекс 5): Цена
      
      const name = productData[1] ? productData[1].toString().trim() : ''
      const drawing = productData[2] ? productData[2].toString().trim() : ''
      const unit = productData[3] ? productData[3].toString().trim() : 'шт'
      
      // Парсим количество и цену, учитывая что они могут быть числами или строками
      let quantity = 0
      if (productData[4] !== undefined && productData[4] !== null && productData[4] !== '') {
        const qtyValue = typeof productData[4] === 'string' 
          ? productData[4].replace(',', '.').trim() 
          : productData[4]
        quantity = parseFloat(qtyValue) || 0
      }
      
      let price = 0
      if (productData[5] !== undefined && productData[5] !== null && productData[5] !== '') {
        const priceValue = typeof productData[5] === 'string' 
          ? productData[5].replace(',', '.').trim() 
          : productData[5]
        price = parseFloat(priceValue) || 0
      }
      
      // Пропускаем товары без названия
      if (!name) {
        console.log(`Пропущен товар без названия в строке ${row.rowNumber}`)
        continue
      }
      
      // Нормализуем единицу измерения
      let normalizedUnit = 'шт'
      const unitLower = unit.toLowerCase()
      if (unitLower.includes('к-т') || unitLower.includes('комплект') || unitLower === 'к-т') {
        normalizedUnit = 'к-т'
      } else if (unitLower.includes('пара') || unitLower === 'пара') {
        normalizedUnit = 'пара'
      } else if (unitLower.includes('шт') || unitLower === 'шт' || unitLower === '') {
        normalizedUnit = 'шт'
      }
      
      // Определяем наличие товара: есть в наличии если количество > 0 И цена > 0
      const isInStock = quantity > 0 && price > 0
      
      // Получаем категорию и подкатегорию из строки
      // Используем категорию из Excel файла, forceCategory не перезаписывает категорию
      const category = row.category || 'Без категории'
      const subcategory = row.subcategory || undefined
      
      // Генерируем уникальный ID на основе категории, подкатегории и названия
      const productId = generateProductId(category, subcategory, name, sheetName)
      
      const product = {
        id: productId,
        name: name,
        description: drawing || '',
        category: category,
        subcategory: subcategory, // Добавляем подкатегорию
        // Поле вид больше не нужно - товары сохраняются в отдельные файлы
        drawing: drawing,
        unit: normalizedUnit,
        price: price.toString(),
        quantity: Math.floor(quantity), // Округляем количество до целого
        inStock: isInStock,
        sheetName: sheetName,
        createdAt: new Date().toISOString()
      }
      
      products.push(product)
      console.log(`Товар добавлен: "${product.name}" | Категория: "${product.category}" | Подкатегория: "${product.subcategory || 'нет'}" | Лист: "${sheetName}" | ID: ${product.id}`)
    }
  }
  
  console.log(`Конвертация завершена для листа "${sheetName}": создано ${products.length} товаров`)
  return products
}

// Предварительный просмотр Excel файла
router.post('/preview', upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' })
    }

    const filePath = req.file.path
    const workbook = xlsx.readFile(filePath)
    
    // Получаем информацию о всех листах
    const sheetInfo = workbook.SheetNames.map(sheetName => {
      try {
        const worksheet = workbook.Sheets[sheetName]
        
        // Проверяем, есть ли данные в листе
        if (!worksheet || !worksheet['!ref']) {
          return {
            name: sheetName,
            hasData: false,
            rows: 0,
            cols: 0,
            error: 'Нет данных'
          }
        }
        
        const range = xlsx.utils.decode_range(worksheet['!ref'])
        
        // Проверяем валидность диапазона
        if (!range || !range.s || !range.e) {
          return {
            name: sheetName,
            hasData: false,
            rows: 0,
            cols: 0,
            error: 'Неверный диапазон'
          }
        }
        
        // Проверяем, что координаты являются числами
        if (typeof range.s.r !== 'number' || typeof range.s.c !== 'number' ||
            typeof range.e.r !== 'number' || typeof range.e.c !== 'number') {
          return {
            name: sheetName,
            hasData: false,
            rows: 0,
            cols: 0,
            error: 'Некорректные координаты диапазона'
          }
        }
        
        const hasData = range.e.r > range.s.r || range.e.c > range.s.c
        
        return {
          name: sheetName,
          hasData: hasData,
          rows: hasData ? range.e.r - range.s.r + 1 : 0,
          cols: hasData ? range.e.c - range.s.c + 1 : 0,
          error: null
        }
      } catch (error) {
        console.warn(`Ошибка обработки листа ${sheetName}:`, error.message)
        return {
          name: sheetName,
          hasData: false,
          rows: 0,
          cols: 0,
          error: error.message
        }
      }
    })
    
    // Обрабатываем все листы с данными
    const allAnalyzedRows = []
    const allPreviewProducts = []
    const sheetResults = []
    
    console.log('Всего листов в файле:', sheetInfo.length)
    console.log('Листы с данными:', sheetInfo.filter(s => s.hasData).length)
    
    sheetInfo.forEach(sheet => {
      if (sheet.hasData) {
        try {
          console.log(`\n=== ОБРАБОТКА ЛИСТА: ${sheet.name} ===`)
          const worksheet = workbook.Sheets[sheet.name]
          
          // Каждый лист обрабатывается независимо - категория определяется из первой строки листа
          const analyzedRows = analyzeExcelStructure(worksheet)
          console.log(`Лист ${sheet.name}: проанализировано ${analyzedRows.length} строк`)
          console.log(`  - Товаров: ${analyzedRows.filter(r => r.type === 'PRODUCT').length}`)
          console.log(`  - Подкатегорий: ${analyzedRows.filter(r => r.type === 'SUBCATEGORY').length}`)
          
          // Конвертируем в товары с привязкой к категории и подкатегории
          const previewProducts = convertToProducts(analyzedRows, sheet.name)
          
          console.log(`Лист ${sheet.name}: создано ${previewProducts.length} товаров`)
          
          // Проверяем уникальность ID товаров
          const productIds = previewProducts.map(p => p.id)
          const uniqueIds = new Set(productIds)
          if (productIds.length !== uniqueIds.size) {
            console.warn(`⚠️  ВНИМАНИЕ: Найдены дубликаты ID в листе ${sheet.name}!`)
          }
          
          allAnalyzedRows.push(...analyzedRows)
          allPreviewProducts.push(...previewProducts)
          
          // Собираем статистику по листу
          const sheetCategories = [...new Set(analyzedRows.filter(r => r.type === 'PRODUCT').map(r => r.category))]
          const sheetSubcategories = [...new Set(analyzedRows.filter(r => r.type === 'PRODUCT' && r.subcategory).map(r => r.subcategory))]
          
          sheetResults.push({
            sheetName: sheet.name,
            categories: sheetCategories,
            subcategories: sheetSubcategories,
            products: previewProducts.length,
            rows: analyzedRows.length
          })
          
          console.log(`=== ЛИСТ ${sheet.name} ОБРАБОТАН ===\n`)
        } catch (error) {
          console.error(`Ошибка обработки листа ${sheet.name}:`, error)
          sheetResults.push({
            sheetName: sheet.name,
            categories: [],
            subcategories: [],
            products: 0,
            rows: 0,
            error: error.message
          })
        }
      } else {
        console.log(`Пропускаем лист ${sheet.name}: ${sheet.error || 'нет данных'}`)
      }
    })
    
    // Подсчитываем статистику по наличию
    const inStock = allPreviewProducts.filter(p => p.inStock).length
    const outOfStock = allPreviewProducts.filter(p => !p.inStock).length
    
    // Подсчитываем уникальные категории и подкатегории
    const uniqueCategories = new Set(allPreviewProducts.map(p => p.category).filter(Boolean))
    const uniqueSubcategories = new Set(allPreviewProducts.map(p => p.subcategory).filter(Boolean))
    
    // Создаем структуру категорий с подкатегориями для статистики
    const categoriesWithSubcategoriesMap = new Map()
    allPreviewProducts.forEach(product => {
      if (product.category) {
        if (!categoriesWithSubcategoriesMap.has(product.category)) {
          categoriesWithSubcategoriesMap.set(product.category, new Set())
        }
        if (product.subcategory) {
          categoriesWithSubcategoriesMap.get(product.category).add(product.subcategory)
        }
      }
    })
    
    // Получаем общую статистику
    const stats = {
      totalSheets: sheetInfo.length,
      processedSheets: sheetResults.length,
      totalRows: allAnalyzedRows.length,
      categories: Array.from(uniqueCategories).sort(),
      totalCategories: uniqueCategories.size,
      totalSubcategories: uniqueSubcategories.size,
      categoriesWithSubcategories: Array.from(categoriesWithSubcategoriesMap.entries()).map(([category, subcategories]) => ({
        category,
        subcategories: Array.from(subcategories).sort(),
        subcategoriesCount: subcategories.size
      })).sort((a, b) => a.category.localeCompare(b.category)),
      products: allPreviewProducts.length,
      sheets: sheetInfo,
      sheetResults: sheetResults
    }
    
    console.log('=== СТАТИСТИКА ПРЕДПРОСМОТРА ===')
    console.log('Всего товаров:', allPreviewProducts.length)
    console.log('В наличии:', inStock)
    console.log('Нет в наличии:', outOfStock)
    console.log('Всего строк:', allAnalyzedRows.length)
    console.log('Категории:', stats.categories)
    console.log('Первые 3 товара:', allPreviewProducts.slice(0, 3).map(p => ({ name: p.name, price: p.price, quantity: p.quantity })))
    
    // Удаляем временный файл
    fs.unlinkSync(filePath)
    
    // Формируем ответ в формате, который ожидает фронтенд
    const response = {
      success: true,
      stats,
      // Данные для фронтенда в ожидаемом формате
      sheetsProcessed: sheetResults.length,
      totalProducts: allPreviewProducts.length,
      totalCategories: uniqueCategories.size,
      totalSubcategories: uniqueSubcategories.size,
      inStock: inStock,
      outOfStock: outOfStock,
      products: allPreviewProducts, // Все товары, не только первые 10
      preview: allPreviewProducts.slice(0, 10), // Первые 10 товаров для предварительного просмотра
      analyzedStructure: allAnalyzedRows.slice(0, 20) // Первые 20 строк структуры
    }
    
    console.log('Отправляем ответ:', {
      success: response.success,
      sheetsProcessed: response.sheetsProcessed,
      totalProducts: response.totalProducts,
      inStock: response.inStock,
      outOfStock: response.outOfStock,
      productsLength: response.products.length
    })
    
    res.json(response)
    
  } catch (error) {
    console.error('Ошибка обработки Excel файла:', error)
    res.status(500).json({ error: 'Ошибка обработки Excel файла' })
  }
})

// Импорт товаров из Excel файла
router.post('/import', upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' })
    }

    // Получаем вид из запроса (название вкладки, на которую был импорт)
    // Пробуем получить из query параметров (более надежно) или из req.body
    const вид = req.query.вид || req.body.вид || null
    console.log('📦 req.query.вид:', req.query.вид)
    console.log('📦 req.body.вид:', req.body.вид)
    console.log('📦 Итоговый вид:', вид)
    if (вид) {
      console.log(`\nℹ️  ИМПОРТ НА ВКЛАДКУ: "${вид}" (товары будут иметь вид "${вид}")`)
    } else {
      console.log(`\n⚠️  ВНИМАНИЕ: Вид не передан! Товары будут без вида.`)
    }

    const filePath = req.file.path
    const workbook = xlsx.readFile(filePath)
    
    // Получаем информацию о всех листах
    const sheetInfo = workbook.SheetNames.map(sheetName => {
      try {
        const worksheet = workbook.Sheets[sheetName]
        
        // Проверяем, есть ли данные в листе
        if (!worksheet || !worksheet['!ref']) {
          return {
            name: sheetName,
            hasData: false,
            rows: 0,
            cols: 0,
            error: 'Нет данных'
          }
        }
        
        const range = xlsx.utils.decode_range(worksheet['!ref'])
        
        // Проверяем валидность диапазона
        if (!range || !range.s || !range.e) {
          return {
            name: sheetName,
            hasData: false,
            rows: 0,
            cols: 0,
            error: 'Неверный диапазон'
          }
        }
        
        // Проверяем, что координаты являются числами
        if (typeof range.s.r !== 'number' || typeof range.s.c !== 'number' ||
            typeof range.e.r !== 'number' || typeof range.e.c !== 'number') {
          return {
            name: sheetName,
            hasData: false,
            rows: 0,
            cols: 0,
            error: 'Некорректные координаты диапазона'
          }
        }
        
        const hasData = range.e.r > range.s.r || range.e.c > range.s.c
        
        return {
          name: sheetName,
          hasData: hasData,
          rows: hasData ? range.e.r - range.s.r + 1 : 0,
          cols: hasData ? range.e.c - range.s.c + 1 : 0,
          error: null
        }
      } catch (error) {
        console.warn(`Ошибка обработки листа ${sheetName}:`, error.message)
        return {
          name: sheetName,
          hasData: false,
          rows: 0,
          cols: 0,
          error: error.message
        }
      }
    })
    
    // Обрабатываем все листы с данными
    const allAnalyzedRows = []
    const allNewProducts = []
    const sheetResults = []
    
    sheetInfo.forEach(sheet => {
      if (sheet.hasData) {
        try {
          console.log(`\n=== ИМПОРТ ЛИСТА: ${sheet.name} ===`)
          const worksheet = workbook.Sheets[sheet.name]
          
          // Каждый лист обрабатывается независимо - категория определяется из первой строки листа
          const analyzedRows = analyzeExcelStructure(worksheet)
          console.log(`Лист ${sheet.name}: проанализировано ${analyzedRows.length} строк`)
          
          // Конвертируем в товары с привязкой к категории и подкатегории
          // Передаем вид для привязки товаров к вкладке
          const newProducts = convertToProducts(analyzedRows, sheet.name, вид)
          
          console.log(`Лист ${sheet.name}: создано ${newProducts.length} товаров`)
          
          // Проверяем уникальность ID товаров
          const productIds = newProducts.map(p => p.id)
          const uniqueIds = new Set(productIds)
          if (productIds.length !== uniqueIds.size) {
            console.warn(`⚠️  ВНИМАНИЕ: Найдены дубликаты ID в листе ${sheet.name}!`)
          }
          
          allAnalyzedRows.push(...analyzedRows)
          allNewProducts.push(...newProducts)
          
          // Собираем статистику по листу
          const sheetCategories = [...new Set(analyzedRows.filter(r => r.type === 'PRODUCT').map(r => r.category))]
          const sheetSubcategories = [...new Set(analyzedRows.filter(r => r.type === 'PRODUCT' && r.subcategory).map(r => r.subcategory))]
          
          sheetResults.push({
            sheetName: sheet.name,
            categories: sheetCategories,
            subcategories: sheetSubcategories,
            products: newProducts.length,
            rows: analyzedRows.length
          })
          
          console.log(`=== ЛИСТ ${sheet.name} ИМПОРТИРОВАН ===\n`)
        } catch (error) {
          console.error(`Ошибка обработки листа ${sheet.name}:`, error)
          sheetResults.push({
            sheetName: sheet.name,
            categories: [],
            subcategories: [],
            products: 0,
            rows: 0,
            error: error.message
          })
        }
      }
    })
    
    // Определяем вкладку для сохранения товаров
    // Если вид не передан, используем 'products' (Все товары)
    let tabId = 'products'
    if (вид === 'Судовые запчасти') {
      tabId = 'ship-parts'
    } else if (вид === 'Арматура') {
      tabId = 'fittings'
    } else if (вид === 'Теплообменники') {
      tabId = 'heat-exchangers'
    } else if (вид === 'Все товары') {
      tabId = 'products'
    }
    
    console.log(`\n📁 Сохранение товаров в файл для вкладки: ${tabId}`)
    
    // Загружаем существующие товары для этой вкладки
    const existingProducts = loadProductsForTab(tabId)
    
    // Создаем Map для быстрого поиска существующих товаров по ID
    const existingProductsMap = new Map()
    existingProducts.forEach(product => {
      existingProductsMap.set(product.id, product)
    })
    
    // Объединяем товары: если товар с таким ID уже существует, обновляем его, иначе добавляем новый
    const updatedProducts = [...existingProducts]
    const newProductsToAdd = []
    
    allNewProducts.forEach(newProduct => {
      // Удаляем поле вид, так как оно больше не нужно
      delete newProduct.вид
      
      if (existingProductsMap.has(newProduct.id)) {
        // Товар с таким ID уже существует - обновляем его
        const existingIndex = updatedProducts.findIndex(p => p.id === newProduct.id)
        if (existingIndex !== -1) {
          updatedProducts[existingIndex] = {
            ...updatedProducts[existingIndex],
            ...newProduct,
            updatedAt: new Date().toISOString()
          }
          console.log(`Обновлен товар: ${newProduct.name} (ID: ${newProduct.id})`)
        }
      } else {
        // Новый товар - добавляем
        newProductsToAdd.push(newProduct)
      }
    })
    
    // Добавляем новые товары
    const allProducts = [...updatedProducts, ...newProductsToAdd]
    
    console.log(`\n=== ИТОГИ ИМПОРТА ===`)
    console.log(`Вкладка: ${tabId}`)
    console.log(`Существовало товаров: ${existingProducts.length}`)
    console.log(`Новых товаров: ${newProductsToAdd.length}`)
    console.log(`Обновлено товаров: ${allNewProducts.length - newProductsToAdd.length}`)
    console.log(`Всего товаров после импорта: ${allProducts.length}`)
    console.log(`=====================\n`)
    
    // Сохраняем обновленный список товаров в файл для этой вкладки
    if (saveProductsForTab(tabId, allProducts)) {
      // Удаляем временный файл
      fs.unlinkSync(filePath)
      
      res.json({
        success: true,
        message: `Успешно импортировано ${newProductsToAdd.length} новых товаров, обновлено ${allNewProducts.length - newProductsToAdd.length} существующих из ${sheetResults.length} листов`,
        imported: newProductsToAdd.length,
        updated: allNewProducts.length - newProductsToAdd.length,
        total: allProducts.length,
        categories: [...new Set(allNewProducts.map(p => p.category))],
        sheetResults: sheetResults
      })
    } else {
      res.status(500).json({ error: 'Ошибка сохранения товаров' })
    }
    
  } catch (error) {
    console.error('Ошибка импорта Excel файла:', error)
    res.status(500).json({ error: 'Ошибка импорта Excel файла' })
  }
})

// Обработка ошибок multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Файл слишком большой. Максимальный размер: 10MB' })
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Слишком много файлов' })
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Неожиданное поле файла' })
    }
  }
  
  if (error.message === 'Только Excel файлы разрешены!') {
    return res.status(400).json({ error: 'Разрешены только Excel файлы (.xlsx, .xls)' })
  }
  
  console.error('Ошибка multer:', error)
  res.status(500).json({ error: 'Ошибка загрузки файла' })
})

module.exports = router
