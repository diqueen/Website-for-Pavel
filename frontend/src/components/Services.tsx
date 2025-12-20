'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { Settings, ArrowRight } from 'lucide-react'
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

const Services = () => {
  const pathname = usePathname()
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
          const servicesList = Array.isArray(data) ? data.slice(0, 3) : []
          
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
    <section className="section-padding bg-gradient-to-br from-marine-50 via-ocean-50 to-marine-100">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-marine mb-6">
            Наши услуги
          </h2>
          <p className="text-xl text-marine-700 max-w-3xl mx-auto leading-relaxed">
            Мы предлагаем комплексные решения для морской индустрии, включая поставку оборудования, 
            техническое обслуживание и профессиональные консультации. Наша команда экспертов готова 
            помочь вам с любыми задачами в морской сфере.
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marine-600 mx-auto mb-4"></div>
            <p className="text-marine-600">Загрузка услуг...</p>
          </div>
        ) : services.length > 0 ? (
          <div className="flex md:grid md:grid-cols-3 gap-8 mb-12 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 scrollbar-hide">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="marine-card p-8 text-center group flex-shrink-0 w-80 md:w-auto md:flex-shrink"
              >
                <Link href={`/services/${service.id}`}>
                  <div className="cursor-pointer">
                    {service.image ? (
                      <div className="mb-6 flex justify-center">
                        <img 
                          src={service.image} 
                          alt={service.name}
                          className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity"
                        />
                      </div>
                    ) : (
                      <div className="text-marine-600 mb-6 flex justify-center group-hover:scale-110 transition-transform duration-300">
                        <Settings className="w-12 h-12" />
                      </div>
                    )}
                </div>
                </Link>
                <Link href={`/services/${service.id}`}>
                  <h3 className="text-xl font-bold text-marine-800 mb-4 hover:text-marine-600 transition-colors cursor-pointer">
                    {service.name}
                </h3>
                </Link>
                <p className="text-marine-600 mb-6 leading-relaxed">
                  {service.description || 'Подробное описание услуги будет добавлено в ближайшее время.'}
                </p>
                {service.executionTime && (
                  <div className="flex justify-center mb-4">
                    <span className="bg-marine-100 text-marine-700 px-4 py-2 rounded-full text-sm font-medium">
                      {service.executionTime}
                    </span>
                  </div>
                )}
                {service.price && (
                <div className="text-center">
                    <span className="text-2xl font-bold text-marine-800">
                      {service.price} ₽
                  </span>
                </div>
                )}
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
              className="marine-card p-8 max-w-2xl mx-auto"
            >
              <div className="text-6xl mb-4 text-marine-600">🔧</div>
              <h3 className="text-2xl font-semibold text-marine-800 mb-4">
                Услуги временно недоступны
              </h3>
              <p className="text-marine-600 mb-6">
                В данный момент мы обновляем каталог наших услуг. 
                Пожалуйста, свяжитесь с нами для получения актуальной информации.
              </p>
              <button className="marine-button">
                Получить консультацию
              </button>
            </motion.div>
          </div>
        )}

        {/* Кнопка "Смотреть все услуги" */}
        {services.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <Link 
              href="/services"
              className="marine-button inline-flex items-center text-lg"
            >
              Смотреть все услуги
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default Services
