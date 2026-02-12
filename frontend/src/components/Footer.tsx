'use client'

import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, MessageCircle, Smartphone } from 'lucide-react'
import { useSiteSettings } from '@/hooks/useSiteSettings'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const { settings } = useSiteSettings()

  // Получаем настройки Footer или используем значения по умолчанию
  const footerSettings = settings.pageTitles?.footer || {}
  const footerLogo = footerSettings.logo || settings.company?.logo || ''
  const companyName = footerSettings.companyName || settings.company?.name || 'Marine Company'
  const companyTagline = footerSettings.companyTagline || settings.company?.tagline || 'Морские решения'
  const companyDescription = footerSettings.companyDescription || 
    'Профессиональные решения для морской индустрии. Более 10 лет опыта в поставке оборудования, техническом обслуживании и консультациях.'
  const copyrightText = footerSettings.copyrightText || `© ${currentYear} Marine Company. Все права защищены.`
  const madeWithText = footerSettings.madeWithText || 'Сделано с ❤️ для морской индустрии'

  // Заменяем {currentYear} на актуальный год в тексте копирайта
  const finalCopyrightText = copyrightText.replace('{currentYear}', currentYear.toString())

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom px-4 py-16">
        <div className="text-center">
          {/* Логотип и название */}
          <div className="flex items-center justify-center space-x-3 mb-6">
            {footerLogo ? (
              <img 
                src={footerLogo} 
                alt={companyName}
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling && ((e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex')
                }}
              />
            ) : null}
            {!footerLogo && (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">{companyName.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div>
              <h3 className="text-2xl font-bold">{companyName}</h3>
              {companyTagline && (
                <p className="text-gray-400">{companyTagline}</p>
              )}
            </div>
          </div>

          {/* Описание компании */}
          {companyDescription && (
            <p className="text-gray-300 mb-8 max-w-4xl mx-auto text-lg leading-relaxed">
              {companyDescription}
            </p>
          )}
          
          {/* Контактная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {settings.contacts?.phone && (
              <div className="flex items-center justify-center space-x-3 text-gray-300">
                <Phone className="w-5 h-5 text-blue-400" />
                <span className="text-lg">{settings.contacts.phone}</span>
              </div>
            )}
            {settings.contacts?.email && (
              <div className="flex items-center justify-center space-x-3 text-gray-300">
                <Mail className="w-5 h-5 text-blue-400" />
                <span className="text-lg">{settings.contacts.email}</span>
              </div>
            )}
            {settings.contacts?.address && (
              <div className="flex items-center justify-center space-x-3 text-gray-300">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span className="text-lg">{settings.contacts.address}</span>
              </div>
            )}
            {settings.contacts?.workingHours && (
              <div className="flex items-center justify-center space-x-3 text-gray-300">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-lg">{settings.contacts.workingHours}</span>
              </div>
            )}
            {settings.contacts?.telegram && (
              <div className="flex items-center justify-center space-x-3 text-gray-300">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                <span className="text-lg">{settings.contacts.telegram}</span>
              </div>
            )}
            {settings.contacts?.whatsapp && (
              <div className="flex items-center justify-center space-x-3 text-gray-300">
                <Smartphone className="w-5 h-5 text-blue-400" />
                <span className="text-lg">{settings.contacts.whatsapp}</span>
              </div>
            )}
          </div>

          {/* Копирайт */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <p className="text-gray-400 text-sm">
              {finalCopyrightText}
            </p>
            {madeWithText && (
              <p className="text-gray-500 text-xs mt-2">
                {madeWithText}
              </p>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer