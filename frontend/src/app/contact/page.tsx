'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import YandexMap from '@/components/YandexMap'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { apiUrl } from '@/lib/api'

export default function ContactPage() {
  const { settings, loading: settingsLoading } = useSiteSettings()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
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
      const response = await fetch(apiUrl('/contact/submit'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || '',
          message: formData.message,
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setIsSubmitted(true)
        // Сброс формы
        setFormData({
          name: '',
          phone: '',
          email: '',
          message: ''
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

  // Используем данные из настроек сайта
  const contactInfo = {
    phone: settings.contacts?.phone || "+7 (999) 123-45-67",
    email: settings.contacts?.email || "info@marine-company.ru",
    address: settings.contacts?.address || settings.contacts?.location || "Адрес не указан",
    workingHours: settings.contacts?.workingHours || "Пн-Пт: 9:00-18:00, Сб: 10:00-16:00",
    emergencyPhone: settings.contacts?.phone || "+7 (999) 123-45-68"
  }

  const socialLinks = {
    whatsapp: settings.contacts?.whatsapp ? `https://wa.me/${settings.contacts.whatsapp.replace(/\D/g, '')}` : "https://wa.me/79991234567",
    telegram: settings.contacts?.telegram ? `https://t.me/${settings.contacts.telegram.replace('@', '')}` : "https://t.me/marine_company",
    vk: "https://vk.com/marine_company"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-100">
      {/* Header с белым фоном */}
      <div className="bg-white shadow-sm">
        <Header />
      </div>
      
      {/* Hero секция с правильным отступом для фиксированного Header */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-20 pt-40 relative overflow-hidden">
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
          🐚
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

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {settings?.pageTitles?.contact?.title || 'Контакты'}
            </h1>
            {settings?.pageTitles?.contact?.subtitle && (
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mt-4">
                {settings.pageTitles.contact.subtitle}
              </p>
            )}
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Свяжитесь с нами любым удобным способом. Мы всегда готовы помочь 
              и ответить на все ваши вопросы.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Основной контент */}
      <section className="py-16">
        <div className="container-custom px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Контактная информация */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-8">Свяжитесь с нами</h2>
              
              <div className="space-y-6">
                {/* Телефон */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Телефон</h3>
                    <p className="text-gray-600 mb-2">{contactInfo.phone}</p>
                    <p className="text-sm text-gray-500">Аварийный: {contactInfo.emergencyPhone}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Email</h3>
                    <a 
                      href={`mailto:${contactInfo.email}`}
                      className="text-sky-600 hover:text-sky-700 transition-colors"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                </div>

                {/* Адрес */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Адрес</h3>
                    <p className="text-gray-600">{contactInfo.address}</p>
                  </div>
                </div>

                {/* Часы работы */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Часы работы</h3>
                    <p className="text-gray-600">{contactInfo.workingHours}</p>
                  </div>
                </div>
              </div>

              {/* Социальные сети */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Мы в социальных сетях</h3>
                <div className="flex gap-4">
                  <a
                    href={socialLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                  >
                    <MessageSquare className="w-6 h-6" />
                  </a>
                  <a
                    href={socialLinks.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
                  >
                    <Send className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Форма обратной связи */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Отправить заявку</h2>
              
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Сообщение отправлено!
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      placeholder="Введите ваше имя"
                    />
                  </div>

                  {/* Телефон */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      placeholder="your@email.com"
                    />
                  </div>

                  {/* Интересующие вас товары */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Интересующие вас товары *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      placeholder="Укажите интересующие вас товары..."
                    />
                  </div>

                  {/* Кнопка отправки */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                      isSubmitting
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-sky-600 text-white hover:bg-sky-700'
                    }`}
                  >
                    {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Карта */}
      <section className="py-16 bg-white">
        <div className="container-custom px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Как нас найти</h2>
            <p className="text-gray-600">
              Мы находимся по адресу: {contactInfo.address}
            </p>
          </motion.div>

          {/* Интерактивная карта */}
          <div className="max-w-3xl mx-auto">
            <YandexMap height="400px" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
