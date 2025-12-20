'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Settings, Clock, CheckCircle } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useSiteSettings } from '@/hooks/useSiteSettings'
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

const ServicesPage = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { settings } = useSiteSettings()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  
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

  // Загрузка услуг
  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await fetch(apiUrl('/admin/services'))
        if (response.ok) {
          const data = await response.json()
          const servicesList = Array.isArray(data) ? data : []
          
          // Загружаем полные данные для каждой услуги (с изображениями и видео)
          const fullServices = await Promise.all(
            servicesList.map(async (service: Service) => {
              try {
                const fullRes = await fetch(apiUrl(`/admin/services/${service.id}/full`))
                if (fullRes.ok) {
                  return await fullRes.json()
                }
                return service
              } catch (err) {
                console.error(`Ошибка загрузки полных данных услуги ${service.id}:`, err)
                return service
              }
            })
          )
          
          setServices(fullServices)
        }
      } catch (error) {
        console.error('Ошибка загрузки услуг:', error)
      } finally {
        setLoading(false)
      }
    }

    loadServices()
  }, [])

  return (
    <div className={`min-h-screen ${colors.bg}`}>
      {/* Header с белым фоном для лучшей видимости */}
      <div className="bg-white shadow-sm">
        <Header />
      </div>
      
      {/* Hero секция */}
      <section className="bg-gradient-to-br from-teal-600 to-teal-700 text-white py-20 pt-40 relative overflow-hidden">
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
          🐚
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
          🐙
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
          🌊
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
          ⚓
        </motion.div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {settings?.pageTitles?.services?.title || 'Наши услуги'}
            </h1>
            {settings?.pageTitles?.services?.subtitle ? (
              <p className="text-xl md:text-2xl text-teal-100 max-w-3xl mx-auto">
                {settings.pageTitles.services.subtitle}
              </p>
            ) : (
              <p className="text-xl md:text-2xl text-teal-100 max-w-3xl mx-auto">
                Мы предлагаем комплексные решения для морской индустрии, включая поставку оборудования, 
                техническое обслуживание и профессиональные консультации. Наша команда экспертов готова 
                помочь вам с любыми задачами в морской сфере.
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Основной контент */}
      <section className="py-20">
        <div className="container-custom">
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
                        className="w-1 h-12 bg-gradient-to-t from-teal-600 to-teal-400 rounded"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600">Загрузка услуг...</p>
                </div>
              </motion.div>
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-teal-500 transition-all duration-300"
                >
                  {/* Фото услуги */}
                  {service.image ? (
                    <div className="mb-6">
                      <img 
                        src={service.image} 
                        alt={service.name}
                        className="w-full h-48 object-cover rounded-xl"
                      />
                    </div>
                  ) : (
                    <div className={`text-4xl mb-6 ${colors.accent} flex justify-center`}>
                      <Settings className="w-12 h-12" />
                    </div>
                  )}

                  {/* Название услуги */}
                  <Link href={`/services/${service.id}`}>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center hover:text-emerald-600 transition-colors cursor-pointer">
                      {service.name}
                    </h3>
                  </Link>

                  {/* Описание */}
                  <p className="text-gray-600 text-lg leading-relaxed mb-6 text-center">
                    {service.description || 'Подробное описание услуги будет добавлено в ближайшее время.'}
                  </p>

                  {/* Детали услуги */}
                  <div className="space-y-3 mb-6">
                    {service.executionTime && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-5 h-5 mr-2" />
                          <span className="font-medium">Время выполнения:</span>
                        </div>
                        <span className="text-gray-800 font-semibold">
                          {service.executionTime}
                        </span>
                      </div>
                    )}
                    {service.price && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600">
                          <span className="font-medium">Стоимость:</span>
                        </div>
                        <span className="text-gray-800 font-semibold text-lg">
                          {service.price} ₽
                        </span>
                      </div>
                    )}
                  </div>


                  {/* Кнопка оформления */}
                  <div className="text-center">
                    <button 
                      className={`w-full text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-300 text-lg ${
                        colors.primary === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                        colors.primary === 'sky' ? 'bg-sky-600 hover:bg-sky-700' :
                        colors.primary === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' :
                        colors.primary === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700' :
                        'bg-blue-600 hover:bg-blue-700'
                      }`}
                      onClick={() => {
                        router.push(`/services/${service.id}`)
                      }}
                    >
                      Оформить заказ
                    </button>
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
                <div className={`text-6xl mb-4 ${colors.accent}`}>🔧</div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Услуги временно недоступны
                </h3>
                <p className="text-gray-600 mb-6 text-lg">
                  В данный момент мы обновляем каталог наших услуг. 
                  Пожалуйста, свяжитесь с нами для получения актуальной информации.
                </p>
                <button className={`btn-primary ${
                  colors.primary === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                  colors.primary === 'sky' ? 'bg-sky-600 hover:bg-sky-700' :
                  colors.primary === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  colors.primary === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700' :
                  'bg-blue-600 hover:bg-blue-700'
                }`}>
                  Получить консультацию
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

export default ServicesPage
