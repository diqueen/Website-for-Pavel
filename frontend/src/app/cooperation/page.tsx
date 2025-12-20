'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, Phone, Mail } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { apiUrl } from '@/lib/api'

export default function CooperationPage() {
  const { settings } = useSiteSettings()
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    positions: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch(apiUrl('/cooperation/submit'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          contact: formData.contact,
          positions: formData.positions,
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setIsSubmitted(true)
        // Сброс формы
        setFormData({
          name: '',
          contact: '',
          positions: ''
        })
      } else {
        alert(data.message || 'Ошибка при отправке заявки. Попробуйте позже.')
      }
    } catch (error) {
      console.error('Ошибка отправки формы:', error)
      alert('Ошибка при отправке заявки. Попробуйте позже.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100">
      {/* Header с белым фоном */}
      <div className="bg-white shadow-sm">
        <Header />
      </div>
      
      {/* Hero секция */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-800 text-white py-20 pt-40 relative overflow-hidden">
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
          🐙
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
          🐚
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {settings.cooperation?.title || 'Сотрудничество'}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              {settings.cooperation?.description || 'Мы открыты для сотрудничества с поставщиками, производителями и партнерами. Давайте создадим успешное партнерство вместе!'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Основной контент */}
      <section className="py-16">
        <div className="container-custom px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Информация о сотрудничестве */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-8">Почему стоит сотрудничать с нами?</h2>
              
              <div className="space-y-6 mb-8">
                {settings.cooperation?.benefits && settings.cooperation.benefits.length > 0 ? (
                  settings.cooperation.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">{benefit.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">{benefit.title}</h3>
                        <p className="text-gray-600">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">🤝</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">Надежное партнерство</h3>
                        <p className="text-gray-600">
                          Мы ценим долгосрочные отношения и всегда выполняем свои обязательства
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">📈</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">Растущий рынок</h3>
                        <p className="text-gray-600">
                          Мы работаем на динамично развивающемся рынке морского оборудования
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">💼</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">Профессиональная команда</h3>
                        <p className="text-gray-600">
                          Наша команда имеет многолетний опыт в морской индустрии
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">🌐</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">Широкая клиентская база</h3>
                        <p className="text-gray-600">
                          Мы работаем с множеством клиентов по всей стране
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Контакты */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Свяжитесь с нами</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">{settings.contacts.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">{settings.contacts.email}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Форма заявки на сотрудничество */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Отправить заявку на сотрудничество</h2>
              
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Заявка отправлена!
                  </h3>
                  <p className="text-gray-600">
                    Мы свяжемся с вами в ближайшее время
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Имя */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ваше имя *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      placeholder="Введите ваше имя"
                    />
                  </div>

                  {/* Способы связи */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Способы связи *
                    </label>
                    <input
                      type="text"
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      placeholder="Телефон, email или другие способы связи"
                    />
                  </div>

                  {/* Предлагаемые позиции/услуги */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Предлагаемые вами позиции/услуги *
                    </label>
                    <textarea
                      name="positions"
                      value={formData.positions}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      placeholder="Опишите предлагаемые вами товары, услуги или условия сотрудничества..."
                    />
                  </div>

                  {/* Кнопка отправки */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      isSubmitting
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Отправка...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Отправить заявку</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

