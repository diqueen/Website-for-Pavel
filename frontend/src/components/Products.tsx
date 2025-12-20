'use client'

import { useState, useEffect, memo } from 'react'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { Package, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { apiUrl } from '@/lib/api'

interface Product {
  id: string
  name: string
  description: string
  category: string
  subcategory?: string
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

const Products = () => {
  const pathname = usePathname()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const productsPerPage = 12
  
  // Определяем цветовую схему для страницы
  const getPageColors = () => {
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
  }

  const colors = getPageColors()

  // Загрузка товаров
  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Добавляем timestamp для предотвращения кеширования браузером
        const response = await fetch(`${apiUrl('/products')}?page=${currentPage}&limit=${productsPerPage}&t=${Date.now()}`)
        if (response.ok) {
          const data = await response.json()
          
          // Если API поддерживает пагинацию
          if (data.products) {
            // Сортируем товары: сначала в наличии, потом нет в наличии
            const sortedProducts = data.products.sort((a: Product, b: Product) => {
              if (a.inStock && !b.inStock) return -1
              if (!a.inStock && b.inStock) return 1
              return 0
            })
            
            setProducts(sortedProducts)
            setTotalPages(data.pagination?.totalPages || 1)
            setTotalProducts(data.pagination?.totalProducts || 0)
          } else {
            // Fallback для старого API - показываем все товары, но сортируем по наличию
            const sortedProducts = Array.isArray(data) ? data
              .sort((a: Product, b: Product) => {
                if (a.inStock && !b.inStock) return -1
                if (!a.inStock && b.inStock) return 1
                return 0
              })
              .slice(0, 6) : []
            
            setProducts(sortedProducts)
            setTotalPages(1)
            setTotalProducts(sortedProducts.length)
          }
        } else {
          console.error('Ошибка API:', response.statusText)
          setProducts([])
        }
      } catch (error) {
        console.error('Ошибка загрузки товаров:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [currentPage])

  return (
    <section className={`${colors.bg} py-20`}>
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className={`text-3xl md:text-4xl font-bold ${colors.text} mb-6`}>
            Наши товары
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Мы предлагаем широкий ассортимент качественного морского оборудования и комплектующих 
            от ведущих производителей отрасли. Все товары проходят строгий контроль качества и 
            соответствуют международным стандартам.
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center">
            <div className="flex flex-col items-center">
              <div className="wave-loader h-12 mb-4">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <span
                    key={index}
                    className="w-1 h-12 bg-gradient-to-t from-blue-600 to-blue-400 rounded"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  />
                ))}
              </div>
              <p className="text-gray-600">Загрузка товаров...</p>
            </div>
            <p className="text-sm text-gray-500 mt-2">Проверка подключения к API...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 scrollbar-hide">
            {products.slice(0, 6).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl border-2 border-transparent hover:border-blue-500 transition-all duration-300 flex-shrink-0 w-80 md:w-auto md:flex-shrink"
              >
                {/* Изображение товара */}
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling!.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div className={`absolute inset-0 flex items-center justify-center ${product.image ? 'hidden' : ''}`}>
                    <Package className={`w-16 h-16 ${colors.accent}`} />
                  </div>
                </div>
                
                <div className="p-4">
                <Link href={`/products/${product.id}`}>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 text-center hover:text-blue-600 transition-colors cursor-pointer">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-gray-600 text-sm text-center mb-3">
                  {product.description || 'Подробное описание товара будет добавлено в ближайшее время.'}
                </p>
                {product.drawing && (
                  <p className="text-gray-500 text-xs text-center mb-2">
                    Чертеж: {product.drawing}
                  </p>
                )}
                <div className="text-center mb-3 flex flex-wrap justify-center gap-2">
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                    {product.category}
                  </span>
                  {product.subcategory && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                      {product.subcategory}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-center mb-2">
                  <span className="text-sm text-gray-600">
                    Количество: {product.quantity} {product.unit}
                  </span>
                </div>
                <div className="flex items-center justify-center mb-2">
                  <span className={`text-sm px-2 py-1 rounded-full font-medium ${
                    product.inStock 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {product.inStock ? 'В наличии' : 'Нет в наличии'}
                  </span>
                </div>
                <div className="flex items-center justify-center mb-3">
                  <span className="text-lg font-bold text-gray-800">
                    {product.price} ₽
                  </span>
                </div>
                </div>
              </motion.div>
            ))}
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
              <p className="text-gray-600 mb-6">
                В данный момент мы обновляем наш каталог товаров. 
                Пожалуйста, свяжитесь с нами для получения актуальной информации о наличии.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Отладочная информация: Загружено товаров - {products.length}
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

        {/* Пагинация */}
        {products.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Назад
            </button>
            
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Вперед
            </button>
          </div>
        )}


        {/* Кнопка "Смотреть все товары" */}
        {products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <Link 
              href="/products"
              className={`inline-flex items-center text-white font-semibold py-3 px-8 rounded-xl transition-colors duration-300 text-lg ${
                colors.primary === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                colors.primary === 'sky' ? 'bg-sky-600 hover:bg-sky-700' :
                colors.primary === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' :
                colors.primary === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700' :
                'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Смотреть все товары
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default memo(Products)
