'use client'

import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, MessageCircle, Smartphone } from 'lucide-react'
import { useSiteSettings } from '@/hooks/useSiteSettings'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const { settings } = useSiteSettings()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom px-4 py-16">
        <div className="text-center">
          {/* Логотип и название */}
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold">Marine Company</h3>
              <p className="text-gray-400">Морские решения</p>
            </div>
          </div>

          {/* Описание компании */}
          <p className="text-gray-300 mb-8 max-w-4xl mx-auto text-lg leading-relaxed">
            Профессиональные решения для морской индустрии. Более 10 лет опыта 
            в поставке оборудования, техническом обслуживании и консультациях.
          </p>
          
          {/* Контактная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-center space-x-3 text-gray-300">
              <Phone className="w-5 h-5 text-blue-400" />
              <span className="text-lg">{settings.contacts.phone}</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-gray-300">
              <Mail className="w-5 h-5 text-blue-400" />
              <span className="text-lg">{settings.contacts.email}</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-gray-300">
              <MapPin className="w-5 h-5 text-blue-400" />
              <span className="text-lg">{settings.contacts.address}</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-gray-300">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-lg">{settings.contacts.workingHours}</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-gray-300">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              <span className="text-lg">{settings.contacts.telegram}</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-gray-300">
              <Smartphone className="w-5 h-5 text-blue-400" />
              <span className="text-lg">{settings.contacts.whatsapp}</span>
            </div>
          </div>

          {/* Копирайт */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <p className="text-gray-400 text-sm">
              © {currentYear} Marine Company. Все права защищены.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Сделано с ❤️ для морской индустрии
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer