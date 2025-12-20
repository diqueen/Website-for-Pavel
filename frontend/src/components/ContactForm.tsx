'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { X, Phone, Mail, MessageCircle, Send, CheckCircle } from 'lucide-react'

interface ContactFormProps {
  isOpen: boolean
  onClose: () => void
}

const ContactForm = ({ isOpen, onClose }: ContactFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    message: '',
    contactMethod: 'phone'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Имитация отправки формы
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Сброс формы через 3 секунды
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: '',
        phone: '',
        email: '',
        company: '',
        message: '',
        contactMethod: 'phone'
      })
      onClose()
    }, 3000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const contactMethods = [
    { value: 'phone', label: 'Телефон', icon: Phone },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Заголовок */}
            <div className="relative p-6 border-b border-gray-200">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-marine-600 to-ocean-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Получить консультацию
                </h2>
                <p className="text-gray-600">
                  Оставьте заявку, и наш специалист свяжется с вами в течение 30 минут
                </p>
              </div>
            </div>

            {/* Форма */}
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Имя */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Ваше имя *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-marine-500 focus:border-transparent"
                    placeholder="Введите ваше имя"
                  />
                </div>

                {/* Телефон */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Номер телефона *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-marine-500 focus:border-transparent"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-marine-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Компания */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Компания
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-marine-500 focus:border-transparent"
                    placeholder="Название вашей компании"
                  />
                </div>

                {/* Предпочтительный способ связи */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Предпочтительный способ связи
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {contactMethods.map((method) => (
                      <label
                        key={method.value}
                        className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.contactMethod === method.value
                            ? 'border-marine-600 bg-marine-50 text-marine-600'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="contactMethod"
                          value={method.value}
                          checked={formData.contactMethod === method.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <method.icon className="w-5 h-5 mb-1" />
                        <span className="text-xs text-center">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Сообщение */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Сообщение
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-marine-500 focus:border-transparent resize-none"
                    placeholder="Опишите ваши потребности или задайте вопрос..."
                  />
                </div>

                {/* Кнопка отправки */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-marine-600 to-ocean-600 text-white font-medium py-3 px-6 rounded-lg hover:from-marine-700 hover:to-ocean-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Отправка...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Отправить заявку</span>
                    </>
                  )}
                </button>

                {/* Согласие */}
                <p className="text-xs text-gray-500 text-center">
                  Отправляя заявку, вы соглашаетесь с{' '}
                  <a href="/privacy" className="text-marine-600 hover:underline">
                    политикой конфиденциальности
                  </a>
                </p>
              </form>
            ) : (
              /* Сообщение об успешной отправке */
              <motion.div
                className="p-6 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Заявка отправлена!
                </h3>
                <p className="text-gray-600 mb-4">
                  Спасибо за обращение. Наш специалист свяжется с вами в ближайшее время.
                </p>
                <div className="text-sm text-gray-500">
                  <p>Ожидайте звонка в течение 30 минут</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ContactForm
