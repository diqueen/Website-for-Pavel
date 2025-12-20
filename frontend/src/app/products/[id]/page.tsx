'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, ArrowLeft, ShoppingCart, Eye, CheckCircle, X } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
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
  images?: string[] // Дополнительные фотографии для галереи
  specifications?: Record<string, string>
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const { addToCart } = useCart()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const handleAddToCart = () => {
    if (product && product.inStock) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        unit: product.unit,
      })
    }
  }

  useEffect(() => {
    const loadProduct = async () => {
      try {
        // Используем прямой запрос по ID - backend ищет товар во всех файлах
        const response = await fetch(apiUrl(`/products/${productId}`))
        if (response.ok) {
          const foundProduct = await response.json()
          
          if (foundProduct && foundProduct.id) {
            console.log('Загружен товар:', foundProduct)
            console.log('Изображение товара:', foundProduct.image)
            console.log('Дополнительные изображения:', foundProduct.images)
            setProduct(foundProduct)
          } else {
            setError('Товар не найден')
          }
        } else {
          if (response.status === 404) {
            setError('Товар не найден')
          } else {
            setError('Ошибка загрузки товара')
          }
        }
      } catch (err) {
        console.error('Ошибка загрузки товара:', err)
        setError('Ошибка загрузки товара')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      loadProduct()
    }
  }, [productId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm">
          <Header />
        </div>
        <div className="flex items-center justify-center min-h-screen">
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
              <p className="text-gray-600">Загрузка товара...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm">
          <Header />
        </div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">📦</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Товар не найден</h1>
            <p className="text-gray-600 mb-6">{error || 'Товар с указанным ID не существует'}</p>
            <Link href="/products">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Вернуться к каталогу
              </button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <Header />
      </div>

      {/* Хлебные крошки */}
      <section className="bg-white border-b py-4">
        <div className="container-custom px-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Главная</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-blue-600">Запчасти и арматура</Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </section>

      {/* Основной контент */}
      <section className="py-12">
        <div className="container-custom px-4">
          <div className="mb-6">
            <Link href="/products">
              <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Вернуться к каталогу</span>
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Левая колонка - Изображение и галерея */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              {/* Главное изображение */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-96 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <Package className="w-32 h-32 text-blue-400" />
                  </div>
                )}
              </div>

              {/* Галерея дополнительных фотографий */}
              {product.images && product.images.length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Дополнительные фотографии</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {product.images.map((img, index) => (
                      <div 
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border-2 border-gray-200 hover:border-blue-500"
                        onClick={() => setSelectedImage(img)}
                      >
                        <img 
                          src={img} 
                          alt={`${product.name} - фото ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const parent = e.currentTarget.parentElement
                            if (parent) {
                              parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400"><Package class="w-8 h-8" /></div>'
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Правая колонка - Информация */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Название и категория */}
              <div>
                <div className="mb-2 flex flex-wrap gap-2">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                    {product.category}
                  </span>
                  {product.subcategory && (
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {product.subcategory}
                    </span>
                  )}
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                {product.drawing && (
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Чертеж:</span> {product.drawing}
                  </p>
                )}
              </div>

              {/* Цена и наличие */}
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    {product.price} ₽
                  </span>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    product.inStock 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.inStock ? 'В наличии' : 'Нет в наличии'}
                  </span>
                </div>
                {product.inStock && (
                  <p className="text-gray-600 text-sm">
                    Количество: {product.quantity} {product.unit}
                  </p>
                )}
              </div>

              {/* Описание */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Описание</h2>
                <p className="text-gray-700 leading-relaxed">
                  {product.description || 'Подробное описание товара будет добавлено в ближайшее время.'}
                </p>
              </div>

              {/* Характеристики */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Характеристики</h2>
                  <div className="bg-white rounded-lg border divide-y">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between p-3">
                        <span className="text-gray-600 font-medium">{key}:</span>
                        <span className="text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Кнопки действий */}
              <div className="flex gap-4 pt-4">
                <button 
                  className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold transition-colors ${
                    product.inStock
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!product.inStock}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{product.inStock ? 'Добавить в корзину' : 'Нет в наличии'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Модальное окно для просмотра изображения */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-7xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors shadow-lg"
                aria-label="Закрыть"
              >
                <X className="w-6 h-6 text-gray-800" />
              </button>
              <img
                src={selectedImage}
                alt={product.name}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EИзображение не найдено%3C/text%3E%3C/svg%3E'
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}

