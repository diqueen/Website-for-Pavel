'use client'

import React, { useState, useEffect, memo, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Package, ShoppingCart, Eye } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SearchBar from '@/components/SearchBar'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { useCart } from '@/contexts/CartContext'
import { apiUrl } from '@/lib/api'

interface Product {
  id: string
  name: string
  description: string
  category: string
  subcategory?: string
  // Поле вид больше не нужно - товары хранятся в отдельных файлах
  drawing?: string
  unit: 'шт' | 'к-т' | 'пара'
  price: string
  quantity: number
  stock: number
  rating: number
  reviews: number
  inStock: boolean
  image?: string
  images?: string[]
  specifications?: Record<string, string>
}

// Мемоизированный компонент карточки товара
const ProductCard = memo(({ product, colors }: { product: Product, colors: any }) => {
  const { addToCart } = useCart()
  
  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      unit: product.unit,
    })
  }
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-sky-500 transition-all duration-300">
      {/* Изображение товара */}
      <Link href={`/products/${product.id}`}>
        <div className="relative mb-4 cursor-pointer">
          {product.image ? (
            <div className="w-full h-48 rounded-xl overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const parent = e.currentTarget.parentElement
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-48 bg-${colors.primary}-100 rounded-xl flex items-center justify-center">
                        <svg class="w-16 h-16 text-${colors.primary}-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                        </svg>
                      </div>
                    `
                  }
                }}
              />
            </div>
          ) : (
            <div className={`w-full h-48 bg-${colors.primary}-100 rounded-xl flex items-center justify-center`}>
              <Package className={`w-16 h-16 text-${colors.primary}-600`} />
            </div>
          )}
          {/* Маркер наличия товара */}
          {product.inStock ? (
            product.quantity > 0 && product.quantity < 5 ? (
              <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                Осталось: {product.quantity}
              </div>
            ) : (
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                В наличии
              </div>
            )
          ) : (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
              Нет в наличии
            </div>
          )}
        </div>
      </Link>

      {/* Название товара */}
      <Link href={`/products/${product.id}`}>
        <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-blue-600 transition-colors cursor-pointer">
          {product.name}
        </h3>
      </Link>

      {/* Категория и подкатегория */}
      <div className="mb-3 flex flex-wrap gap-2">
        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm font-medium">
          {product.category}
        </span>
        {product.subcategory && (
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-medium">
            {product.subcategory}
          </span>
        )}
      </div>

      {/* Чертеж */}
      {product.drawing && (
        <div className="mb-2">
          <span className="text-gray-500 text-sm">
            Чертеж: {product.drawing}
          </span>
        </div>
      )}

      {/* Количество и единица измерения */}
      <div className="mb-3">
        <span className="text-gray-600 text-sm">
          Количество: {product.quantity} {product.unit}
        </span>
      </div>

      {/* Описание */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {product.description || 'Подробное описание товара будет добавлено в ближайшее время.'}
      </p>

      {/* Цена и кнопки */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-xl font-bold text-gray-800">
            {product.price} ₽
          </span>
        </div>
        <div className="flex gap-2">
          <Link href={`/products/${product.id}`}>
            <button 
              className={`p-2 rounded-lg transition-colors ${
                colors.primary === 'blue' ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' :
                colors.primary === 'sky' ? 'bg-sky-100 text-sky-600 hover:bg-sky-200' :
                colors.primary === 'emerald' ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' :
                colors.primary === 'indigo' ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' :
                'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              <Eye className="w-4 h-4" />
            </button>
          </Link>
          <button 
            className={`p-2 rounded-lg transition-colors ${
              product.inStock
                ? colors.primary === 'blue' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                  colors.primary === 'sky' ? 'bg-sky-600 text-white hover:bg-sky-700' :
                  colors.primary === 'emerald' ? 'bg-emerald-600 text-white hover:bg-emerald-700' :
                  colors.primary === 'indigo' ? 'bg-indigo-600 text-white hover:bg-indigo-700' :
                  'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleAddToCart}
            disabled={!product.inStock}
            title={product.inStock ? 'Добавить в корзину' : 'Товар недоступен'}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
})

ProductCard.displayName = 'ProductCard'

interface ProductsPageProps {
  categoryFilter?: string
}

function ProductsPage(props?: ProductsPageProps) {
  const { categoryFilter } = props || {}
  const pathname = usePathname()
  const { settings } = useSiteSettings()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [cache, setCache] = useState<{[key: string]: any}>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null) // Не устанавливаем categoryFilter, чтобы избежать двойной фильтрации
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [showAllSubcategories, setShowAllSubcategories] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 24 // Количество товаров на странице
  
  // Определяем заголовок и подзаголовок в зависимости от категории
  const getPageTitle = () => {
    if (categoryFilter === 'Судовые запчасти') {
      return settings?.pageTitles?.shipParts?.title || 'Судовые запчасти'
    } else if (categoryFilter === 'Арматура') {
      return settings?.pageTitles?.fittings?.title || 'Арматура'
    } else if (categoryFilter === 'Теплообменники') {
      return settings?.pageTitles?.heatExchangers?.title || 'Теплообменники'
    }
    return settings?.pageTitles?.products?.title || 'Наши товары'
  }
  
  const getPageSubtitle = () => {
    if (categoryFilter === 'Судовые запчасти') {
      return settings?.pageTitles?.shipParts?.subtitle || ''
    } else if (categoryFilter === 'Арматура') {
      return settings?.pageTitles?.fittings?.subtitle || ''
    } else if (categoryFilter === 'Теплообменники') {
      return settings?.pageTitles?.heatExchangers?.subtitle || ''
    }
    return settings?.pageTitles?.products?.subtitle || 'Мы предлагаем широкий ассортимент качественного морского оборудования и комплектующих от ведущих производителей отрасли. Все товары проходят строгий контроль качества и соответствуют международным стандартам.'
  }
  
  // Определяем цветовую схему для страницы (мемоизировано)
  const colors = useMemo(() => {
    switch (pathname) {
      case '/':
        return {
          primary: 'blue',
          bg: 'bg-blue-50',
          text: 'text-blue-800',
          accent: 'text-blue-600'
        }
      case '/products':
        return {
          primary: 'sky',
          bg: 'bg-sky-50',
          text: 'text-sky-800',
          accent: 'text-sky-600'
        }
      case '/services':
        return {
          primary: 'emerald',
          bg: 'bg-emerald-50',
          text: 'text-emerald-800',
          accent: 'text-emerald-600'
        }
      case '/contact':
        return {
          primary: 'indigo',
          bg: 'bg-indigo-50',
          text: 'text-indigo-800',
          accent: 'text-indigo-600'
        }
      default:
        return {
          primary: 'blue',
          bg: 'bg-blue-50',
          text: 'text-blue-800',
          accent: 'text-blue-600'
        }
    }
  }, [pathname])

  // Функция для получения классов кнопки категории (вернули исходный размер)
  const getCategoryButtonClass = (isActive: boolean) => {
    const baseClass = "px-6 py-3 rounded-full font-medium transition-all duration-200"
    if (isActive) {
      if (colors.primary === 'sky') {
        return `${baseClass} bg-sky-600 text-white shadow-lg scale-105`
      } else if (colors.primary === 'blue') {
        return `${baseClass} bg-blue-600 text-white shadow-lg scale-105`
      } else if (colors.primary === 'emerald') {
        return `${baseClass} bg-emerald-600 text-white shadow-lg scale-105`
      } else if (colors.primary === 'indigo') {
        return `${baseClass} bg-indigo-600 text-white shadow-lg scale-105`
      }
      return `${baseClass} bg-blue-600 text-white shadow-lg scale-105`
    } else {
      if (colors.primary === 'sky') {
        return `${baseClass} bg-white text-gray-700 hover:bg-sky-50 hover:text-sky-600 shadow-md hover:shadow-lg`
      } else if (colors.primary === 'blue') {
        return `${baseClass} bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-md hover:shadow-lg`
      } else if (colors.primary === 'emerald') {
        return `${baseClass} bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 shadow-md hover:shadow-lg`
      } else if (colors.primary === 'indigo') {
        return `${baseClass} bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 shadow-md hover:shadow-lg`
      }
      return `${baseClass} bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-md hover:shadow-lg`
    }
  }

  // Загрузка товаров
  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Определяем tabId на основе categoryFilter
        let tabId = 'products'
        if (categoryFilter === 'Судовые запчасти') {
          tabId = 'ship-parts'
        } else if (categoryFilter === 'Арматура') {
          tabId = 'fittings'
        } else if (categoryFilter === 'Теплообменники') {
          tabId = 'heat-exchangers'
        }
        
        // Добавляем timestamp для предотвращения кэширования браузером
        const response = await fetch(`${apiUrl('/products')}?tab=${tabId}&t=${Date.now()}`)
        if (response.ok) {
          const data = await response.json()
          console.log(`Загружено товаров для вкладки ${tabId}:`, Array.isArray(data) ? data.length : 'не массив')
          
          // Проверяем, что данные - массив
          if (!Array.isArray(data)) {
            console.error('Данные не являются массивом:', data)
            setProducts([])
            setFilteredProducts([])
            return
          }
          
          // Сортируем товары: сначала в наличии, потом нет в наличии
          const sortedProducts = data
            .sort((a: Product, b: Product) => {
              if (a.inStock && !b.inStock) return -1
              if (!a.inStock && b.inStock) return 1
              return 0
            })
          
          // Товары уже отфильтрованы по вкладке на сервере
          setProducts(sortedProducts)
          setFilteredProducts(sortedProducts)
        } else {
          console.error('Ошибка HTTP при загрузке товаров:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Ошибка загрузки товаров:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [categoryFilter])

  // Создаем структуру категорий с подкатегориями (мемоизировано)
  // Категории и подкатегории берутся только из товаров текущей вкладки
  const categoriesWithSubcategories = useMemo(() => {
    const categoryMap = new Map<string, Map<string, number>>() // Map для сохранения порядка появления подкатегорий
    
    // Товары уже отфильтрованы по вкладке, просто обрабатываем их
    products.forEach(product => {
      if (product.category) {
        if (!categoryMap.has(product.category)) {
          categoryMap.set(product.category, new Map())
        }
        if (product.subcategory) {
          const subcategoriesMap = categoryMap.get(product.category)!
          // Сохраняем порядок первого появления подкатегории
          if (!subcategoriesMap.has(product.subcategory)) {
            subcategoriesMap.set(product.subcategory, subcategoriesMap.size)
          }
        }
      }
    })
    
    // Преобразуем в массив объектов с подкатегориями в порядке появления
    return Array.from(categoryMap.entries())
      .map(([category, subcategoriesMap]) => {
        // Сортируем подкатегории по порядку появления (значение в Map)
        const subcategories = Array.from(subcategoriesMap.entries())
          .sort((a, b) => a[1] - b[1]) // Сортируем по порядку появления
          .map(([subcategory]) => subcategory) // Берем только название
        
        return {
          category,
          subcategories
        }
      })
      .sort((a, b) => a.category.localeCompare(b.category)) // Категории остаются отсортированными
  }, [products])

  // Получаем все уникальные категории (для обратной совместимости)
  const categories = useMemo(() => 
    categoriesWithSubcategories.map(c => c.category),
    [categoriesWithSubcategories]
  )

  // Функция фильтрации товаров (мемоизирована)
  const applyFilters = useCallback((search: string, category: string | null, subcategory: string | null) => {
    // Товары уже отфильтрованы по вкладке при загрузке, поэтому начинаем с products
    let filtered = products

    // Затем фильтр по категории (выбранной слева)
    if (category) {
      filtered = filtered.filter(product => product.category === category)
    }

    // Фильтр по подкатегории (только если выбрана категория)
    if (subcategory && category) {
      filtered = filtered.filter(product => 
        product.category === category && product.subcategory === subcategory
      )
    }

    // Фильтр по поисковому запросу
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        (product.subcategory && product.subcategory.toLowerCase().includes(searchLower)) ||
        (product.drawing && product.drawing.toLowerCase().includes(searchLower))
      )
    }

    setFilteredProducts(filtered)
    setCurrentPage(1) // Сбрасываем на первую страницу при фильтрации
  }, [products, categoryFilter])

  // Функция поиска (мемоизирована)
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    applyFilters(query, selectedCategory, selectedSubcategory)
  }, [selectedCategory, selectedSubcategory, applyFilters])

  // Функция выбора категории (мемоизирована)
  const handleCategorySelect = useCallback((category: string | null) => {
    // Если нажали на уже выбранную категорию - снимаем выбор
    if (selectedCategory === category) {
      setSelectedCategory(null)
      setSelectedSubcategory(null)
      setShowAllSubcategories(false)
      applyFilters(searchQuery, null, null) // Показываем все товары
    } else {
      // Выбираем новую категорию
      setSelectedCategory(category)
      setSelectedSubcategory(null) // Сбрасываем подкатегорию при выборе новой категории
      setShowAllSubcategories(false) // Сбрасываем состояние развернутости подкатегорий
      
      // Применяем фильтр по категории (без подкатегории)
      applyFilters(searchQuery, category, null)
    }
  }, [searchQuery, applyFilters, selectedCategory])

  // Функция выбора подкатегории (мемоизирована)
  const handleSubcategorySelect = useCallback((category: string, subcategory: string | null) => {
    // Если нажали на уже выбранную подкатегорию - снимаем выбор
    if (selectedCategory === category && selectedSubcategory === subcategory) {
      setSelectedSubcategory(null)
      applyFilters(searchQuery, category, null) // Показываем все товары категории
    } else {
      // Выбираем новую подкатегорию
      setSelectedCategory(category)
      setSelectedSubcategory(subcategory)
      applyFilters(searchQuery, category, subcategory)
    }
  }, [searchQuery, applyFilters, selectedCategory, selectedSubcategory])


  // Пагинация
  const totalPages = useMemo(() => 
    Math.ceil(filteredProducts.length / itemsPerPage),
    [filteredProducts.length, itemsPerPage]
  )

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredProducts, currentPage, itemsPerPage])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className={`min-h-screen ${colors.bg}`}>
      {/* Header с белым фоном для лучшей видимости */}
      <div className="bg-white shadow-sm">
        <Header />
      </div>
      
      {/* Hero секция */}
      <section className="bg-gradient-to-br from-sky-600 to-blue-700 text-white py-20 pt-40 relative overflow-hidden">
        {/* Морские стикеры */}
        <motion.div
          className="absolute top-10 right-20 text-5xl opacity-30"
          animate={{ 
            y: [0, -30, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          🐟
        </motion.div>

        <motion.div
          className="absolute top-32 left-20 text-4xl opacity-25"
          animate={{ 
            x: [0, 25, 0],
            rotate: [0, -15, 15, 0]
          }}
          transition={{ 
            duration: 18, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2
          }}
        >
          🦀
        </motion.div>

        <motion.div
          className="absolute bottom-10 right-1/4 text-5xl opacity-30"
          animate={{ 
            y: [0, 25, 0],
            rotate: [0, 8, -8, 0]
          }}
          transition={{ 
            duration: 14, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1.5
          }}
        >
          ⚓
        </motion.div>

        <motion.div
          className="absolute bottom-20 left-10 text-4xl opacity-25"
          animate={{ 
            x: [0, -20, 0],
            y: [0, 15, 0],
            rotate: [0, -10, 10, 0]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 3
          }}
        >
          🌊
        </motion.div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {getPageTitle()}
            </h1>
            {getPageSubtitle() && (
              <p className="text-xl md:text-2xl text-sky-100 max-w-3xl mx-auto">
                {getPageSubtitle()}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Основной контент */}
      <section className="py-20">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          {/* Двухколоночный layout: категории слева, подкатегории справа */}
          {!loading && categoriesWithSubcategories.length > 0 && (
            <div className="flex flex-col lg:flex-row gap-6 mb-8">
              {/* Левая колонка - Список категорий */}
              <div className="lg:w-64 flex-shrink-0">
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Категории</h3>
                  <div className="space-y-1">
                    {categoriesWithSubcategories.map(({ category, subcategories }) => {
                      const isCategorySelected = selectedCategory === category
                      const hasSubcategories = subcategories.length > 0

                      return (
                        <button
                          key={category}
                          onClick={() => {
                            handleCategorySelect(category)
                          }}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                            isCategorySelected
                              ? colors.primary === 'sky' ? 'bg-sky-100 text-sky-700 border-2 border-sky-300' :
                                colors.primary === 'blue' ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' :
                                colors.primary === 'emerald' ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300' :
                                colors.primary === 'indigo' ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300' :
                                'bg-blue-100 text-blue-700 border-2 border-blue-300'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{category}</span>
                            {hasSubcategories && (
                              <span className="text-xs text-gray-500">
                                ({subcategories.length})
                              </span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Правая колонка - Подкатегории выбранной категории */}
              <div className="flex-1">
                {selectedCategory ? (
                  (() => {
                    const selectedCategoryData = categoriesWithSubcategories.find(c => c.category === selectedCategory)
                    const subcategories = selectedCategoryData?.subcategories || []
                    
                    return (
                      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Подкатегории: {selectedCategory}
                          </h3>
                          {subcategories.length > 0 && (
                            <span className="text-sm text-gray-500">
                              Всего: {subcategories.length}
                            </span>
                          )}
                        </div>
                        {subcategories.length > 0 ? (
                          <div>
                            {(() => {
                              const maxVisibleSubcategories = 12
                              const visibleSubcategories = showAllSubcategories 
                                ? subcategories 
                                : subcategories.slice(0, maxVisibleSubcategories)
                              const hasMoreSubcategories = subcategories.length > maxVisibleSubcategories

                              return (
                                <>
                                  <div className="flex flex-wrap gap-3">
                                    {visibleSubcategories.map((subcategory) => {
                                      const isSubcategorySelected = 
                                        selectedSubcategory === subcategory
                                      
                                      return (
                                        <button
                                          key={subcategory}
                                          onClick={() => handleSubcategorySelect(selectedCategory, subcategory)}
                                          className={`px-5 py-3 rounded-lg text-sm font-medium transition-colors ${
                                            isSubcategorySelected
                                              ? colors.primary === 'sky' ? 'bg-sky-600 text-white shadow-md' :
                                                colors.primary === 'blue' ? 'bg-blue-600 text-white shadow-md' :
                                                colors.primary === 'emerald' ? 'bg-emerald-600 text-white shadow-md' :
                                                colors.primary === 'indigo' ? 'bg-indigo-600 text-white shadow-md' :
                                                'bg-blue-600 text-white shadow-md'
                                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                          }`}
                                        >
                                          {subcategory}
                                        </button>
                                      )
                                    })}
                                  </div>
                                  
                                  {hasMoreSubcategories && (
                                    <button
                                      onClick={() => setShowAllSubcategories(!showAllSubcategories)}
                                      className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        colors.primary === 'sky' ? 'bg-sky-50 text-sky-700 hover:bg-sky-100' :
                                        colors.primary === 'blue' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' :
                                        colors.primary === 'emerald' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' :
                                        colors.primary === 'indigo' ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' :
                                        'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                      }`}
                                    >
                                      {showAllSubcategories 
                                        ? `Скрыть (показано ${subcategories.length})` 
                                        : `Показать все (${subcategories.length - maxVisibleSubcategories} еще)`}
                                    </button>
                                  )}
                                </>
                              )
                            })()}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p>В этой категории нет подкатегорий</p>
                            <p className="text-sm mt-2">Товары будут отображаться напрямую из категории</p>
                          </div>
                        )}
                      </div>
                    )
                  })()
                ) : (
                  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-lg font-medium mb-2">Выберите категорию</p>
                      <p className="text-sm">Выберите категорию слева, чтобы увидеть её подкатегории</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Поиск */}
          <div className="mb-8">
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Поиск по названию, описанию, категории..."
              className="max-w-2xl mx-auto"
            />
            {(searchQuery || selectedCategory || selectedSubcategory) && (
              <div className="text-center mt-4">
                <p className="text-gray-600">
                  Найдено товаров: <span className="font-semibold">{filteredProducts.length}</span>
                  {searchQuery && (
                    <span className="ml-2">
                      по запросу "<span className="font-semibold text-blue-600">{searchQuery}</span>"
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="ml-2">
                      в категории "<span className="font-semibold text-blue-600">{selectedCategory}</span>"
                    </span>
                  )}
                  {selectedSubcategory && (
                    <span className="ml-2">
                      в подкатегории "<span className="font-semibold text-blue-600">{selectedSubcategory}</span>"
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto"
              >
                <div className="flex flex-col items-center">
                  <div className="wave-loader h-12 mb-4">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <span
                        key={index}
                        className="w-1 h-12 bg-gradient-to-t from-sky-600 to-sky-400 rounded"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      />
                    ))}
                  </div>
                <p className="text-gray-600">Загрузка товаров...</p>
                </div>
              </motion.div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4 sm:px-6">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                colors={colors}
              />
            ))}
            </div>
            
            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-sky-50 hover:text-sky-600 shadow-md'
                  }`}
                >
                  Назад
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 7) {
                      pageNum = i + 1
                    } else if (currentPage <= 4) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i
                    } else {
                      pageNum = currentPage - 3 + i
                    }
                    
                    return (
                      <button 
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-sky-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-sky-50 hover:text-sky-600 shadow-md'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                
                      <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-sky-50 hover:text-sky-600 shadow-md'
                  }`}
                >
                  Вперед
                      </button>
                    </div>
            )}
            
            <div className="mt-4 text-center text-gray-600 text-sm">
              Показано {paginatedProducts.length} из {filteredProducts.length} товаров
            </div>
            </>
          ) : searchQuery ? (
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto"
              >
                <div className={`text-6xl mb-4 ${colors.accent}`}>🔍</div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Товары не найдены
                </h3>
                <p className="text-gray-600 mb-6 text-lg">
                  По вашему запросу "<span className="font-semibold text-blue-600">{searchQuery}</span>" 
                  товары не найдены. Попробуйте изменить поисковый запрос.
                </p>
                <button 
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory(null)
                    setFilteredProducts(products)
                  }}
                  className={`btn-primary ${
                    colors.primary === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                    colors.primary === 'sky' ? 'bg-sky-600 hover:bg-sky-700' :
                    colors.primary === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' :
                    colors.primary === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Показать все товары
                </button>
              </motion.div>
            </div>
          ) : (
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto"
              >
                <div className={`text-6xl mb-4 ${colors.accent}`}>📦</div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Каталог товаров временно недоступен
                </h3>
                <p className="text-gray-600 mb-6 text-lg">
                  В данный момент мы обновляем наш каталог товаров. 
                  Пожалуйста, свяжитесь с нами для получения актуальной информации о наличии.
                </p>
                <button className={`btn-primary ${
                  colors.primary === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                  colors.primary === 'sky' ? 'bg-sky-600 hover:bg-sky-700' :
                  colors.primary === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  colors.primary === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700' :
                  'bg-blue-600 hover:bg-blue-700'
                }`}>
                  Узнать о наличии
                </button>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default memo(ProductsPage) as any
