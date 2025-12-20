'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Settings, ArrowLeft, Clock, CheckCircle, Play } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { apiUrl } from '@/lib/api'

interface Service {
  id: string
  name: string
  description: string
  price: string
  executionTime: string
  image?: string
  video?: string
  createdAt?: string
  updatedAt?: string
}

export default function ServicePage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.id as string
  
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadService = async () => {
      try {
        // Загружаем полные данные услуги (с изображениями и видео)
        const response = await fetch(apiUrl(`/admin/services/${serviceId}/full`))
        if (response.ok) {
          const serviceData = await response.json()
          setService(serviceData)
        } else if (response.status === 404) {
          setError('Услуга не найдена')
        } else {
          setError('Ошибка загрузки услуги')
        }
      } catch (err) {
        console.error('Ошибка загрузки услуги:', err)
        setError('Ошибка загрузки услуги')
      } finally {
        setLoading(false)
      }
    }

    if (serviceId) {
      loadService()
    }
  }, [serviceId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm">
          <Header />
        </div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка услуги...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm">
          <Header />
        </div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">🔧</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Услуга не найдена</h1>
            <p className="text-gray-600 mb-6">{error || 'Услуга с указанным ID не существует'}</p>
            <Link href="/services">
              <button className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors">
                Вернуться к услугам
              </button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-emerald-50">
      <div className="bg-white shadow-sm">
        <Header />
      </div>

      {/* Хлебные крошки */}
      <section className="bg-white border-b py-4">
        <div className="container-custom px-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-emerald-600">Главная</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-emerald-600">Услуги</Link>
            <span>/</span>
            <span className="text-gray-900">{service.name}</span>
          </div>
        </div>
      </section>

      {/* Основной контент */}
      <section className="py-12">
        <div className="container-custom px-4">
          <div className="mb-6">
            <Link href="/services">
              <button className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Вернуться к услугам</span>
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Левая колонка - Изображение/Видео */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Фото услуги */}
              {service.image && (
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Видео */}
              {service.video && (
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  {service.video.startsWith('data:video') || service.video.includes('.mp4') || service.video.includes('.webm') ? (
                    <video 
                      src={service.video} 
                      controls
                      className="w-full h-96 object-cover rounded-lg"
                    />
                  ) : (
                    <img 
                      src={service.video} 
                      alt="Видео превью"
                      className="w-full h-96 object-cover rounded-lg"
                    />
                  )}
                </div>
              )}

              {!service.image && !service.video && (
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <div className="w-full h-96 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center">
                    <Settings className="w-32 h-32 text-emerald-400" />
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
              {/* Название */}
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{service.name}</h1>
              </div>

              {/* Цена и время выполнения */}
              <div className="bg-emerald-50 rounded-xl p-6">
                {service.price && (
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg text-gray-700 font-medium">Стоимость:</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {service.price} ₽
                    </span>
                  </div>
                )}
                {service.executionTime && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">Время выполнения:</span>
                    <span>{service.executionTime}</span>
                  </div>
                )}
              </div>

              {/* Описание */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Описание услуги</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {service.description || 'Подробное описание услуги будет добавлено в ближайшее время.'}
                </p>
              </div>

              {/* Кнопки действий */}
              <div className="flex gap-4 pt-4">
                <button 
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                  onClick={() => {
                    alert(`Заявка на услугу "${service.name}" отправлена!`)
                  }}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Оформить заявку</span>
                </button>
                <button 
                  className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    alert(`Запрос на услугу "${service.name}" отправлен!`)
                  }}
                >
                  Запросить консультацию
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

