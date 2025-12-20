'use client'

import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'
import YandexMap from './YandexMap'
import { useSiteSettings } from '@/hooks/useSiteSettings'

interface ContactProps {
  onContactClick: () => void
}

const Contact = ({ onContactClick }: ContactProps) => {
  const pathname = usePathname()
  const { settings } = useSiteSettings()
  
  // Определяем цвета для каждой страницы
  const getPageColors = () => {
    switch (pathname) {
      case '/':
        return {
          primary: 'blue',
          secondary: 'cyan',
          accent: 'sky'
        }
      case '/products':
        return {
          primary: 'blue',
          secondary: 'cyan',
          accent: 'sky'
        }
      case '/services':
        return {
          primary: 'teal',
          secondary: 'cyan',
          accent: 'teal'
        }
      case '/contact':
        return {
          primary: 'sky',
          secondary: 'blue',
          accent: 'sky'
        }
      default:
        return {
          primary: 'blue',
          secondary: 'cyan',
          accent: 'sky'
        }
    }
  }

  const colors = getPageColors()

  const contactInfo = [
    {
      icon: Phone,
      title: 'Телефон',
      value: '+7 (999) 123-45-67',
      description: 'Основной номер для связи'
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'info@marine-company.ru',
      description: 'Электронная почта'
    },
    {
      icon: MapPin,
      title: 'Адрес',
      value: 'г. Москва, ул. Морская, д. 15',
      description: 'Главный офис компании'
    },
    {
      icon: Clock,
      title: 'Режим работы',
      value: 'Пн-Пт: 9:00 - 18:00',
      description: 'Сб-Вс: 10:00 - 16:00'
    }
  ]

  const services = [
    'Консультации по оборудованию',
    'Техническая поддержка',
    'Проектирование решений',
    'Монтаж и настройка',
    'Обслуживание и ремонт',
    'Поставка запчастей'
  ]

  return (
    <section className="section-padding bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Наши <span className={`text-${colors.primary}-600`}>контакты</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Свяжитесь с нами любым удобным способом. Наши специалисты готовы 
            ответить на ваши вопросы и помочь с выбором оборудования.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Контактная информация */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Свяжитесь с нами
            </h3>

            <div className="space-y-6 mb-8">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br from-${colors.primary}-600 to-${colors.secondary}-600 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <info.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {info.title}
                    </h4>
                    <p className={`text-lg text-${colors.primary}-600 font-medium mb-1`}>
                      {info.value}
                    </p>
                    <p className="text-gray-600">
                      {info.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Услуги */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Мы предоставляем:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className={`w-2 h-2 bg-${colors.primary}-600 rounded-full`}></div>
                    <span className="text-gray-700">{service}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Карта и форма */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Карта */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Наше местоположение
              </h3>
              <YandexMap height="256px" />
            </div>

            {/* Быстрая форма */}
            <div className={`bg-gradient-to-br from-${colors.primary}-600 to-${colors.secondary}-600 rounded-xl p-6 text-white`}>
              <h3 className="text-xl font-bold mb-4">
                Нужна консультация?
              </h3>
              <p className={`text-${colors.primary}-100 mb-6`}>
                Оставьте заявку, и наш специалист свяжется с вами в течение 30 минут
              </p>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Ваше имя"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <input
                  type="tel"
                  placeholder="Номер телефона"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <textarea
                  placeholder="Сообщение (необязательно)"
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                />
                <button 
                  onClick={onContactClick}
                  className={`w-full bg-white text-${colors.primary}-600 font-medium py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors`}
                >
                  Отправить заявку
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Дополнительные способы связи */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Другие способы связи
          </h3>
          <div className="flex flex-wrap justify-center gap-6">
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span>Telegram</span>
            </button>
            <button className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
              <Mail className="w-5 h-5" />
              <span>Email</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Contact
