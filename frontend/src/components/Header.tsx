'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Menu, X, Settings, ShoppingCart } from 'lucide-react'
import { usePathname } from 'next/navigation'
import AdminPanel from './AdminPanel'
import Cart from './Cart'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { useCart } from '@/contexts/CartContext'
import { getApiUrl } from '@/lib/api'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const pathname = usePathname()
  const { settings } = useSiteSettings()
  const { totalItems } = useCart()
  
  const companyName = settings.company?.name || 'Marine Company'
  // Преобразуем URL логотипа: если это localhost:5000, используем proxy через Next.js
  const companyLogo = settings.company?.logo 
    ? settings.company.logo.replace(getApiUrl(), '')
    : ''
  const companyTagline = settings.company?.tagline || 'Морские решения'
  
  // Логируем для отладки
  useEffect(() => {
    if (companyLogo) {
      console.log('Логотип компании в Header:', companyLogo)
    }
  }, [companyLogo])

  useEffect(() => {
    // Устанавливаем флаг загрузки
    setIsLoaded(true)
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const menuItems = [
    { name: 'Главная', href: '/' },
    { name: 'Все товары', href: '/products' },
    { name: 'Судовые запчасти', href: '/products/ship-parts' },
    { name: 'Арматура', href: '/products/fittings' },
    { name: 'Теплообменники', href: '/products/heat-exchangers' },
    { name: 'Услуги', href: '/services' },
    { name: 'Контакты', href: '/contact' },
    { name: 'Сотрудничество', href: '/cooperation' },
  ]

  // Определяем, находимся ли мы на главной странице
  const isHomePage = pathname === '/'
  
  // Определяем цвета для каждой страницы
  const getPageColors = () => {
    switch (pathname) {
      case '/':
        return {
          primary: 'blue',
          hover: 'blue',
          active: 'blue'
        }
      case '/products':
        return {
          primary: 'blue',
          hover: 'blue',
          active: 'blue'
        }
      case '/services':
        return {
          primary: 'teal',
          hover: 'teal',
          active: 'teal'
        }
      case '/contact':
        return {
          primary: 'sky',
          hover: 'sky',
          active: 'sky'
        }
      default:
        return {
          primary: 'blue',
          hover: 'blue',
          active: 'blue'
        }
    }
  }

  const colors = getPageColors()

  return (
    <>
      {/* Основная навигация */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || !isHomePage
            ? 'bg-white shadow-2xl border-b border-gray-200' 
            : 'bg-white border-b border-gray-200'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: isLoaded ? 0.1 : 0 }}
      >
        <nav className="section-container py-5 lg:py-6">
          <div className="flex items-center justify-between">
            {/* Логотип */}
            <Link href="/" className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-marine-500 to-ocean-700 rounded-2xl blur-md opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                <div className="relative w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-marine-600 via-marine-500 to-ocean-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 overflow-hidden border-2 border-white/20">
                  {companyLogo ? (
                    <img 
                      key={companyLogo}
                      src={companyLogo}
                      alt={companyName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Ошибка загрузки логотипа:', companyLogo)
                        // Пробуем загрузить напрямую с backend, если proxy не работает
                        const directUrl = companyLogo.startsWith('http') 
                          ? companyLogo 
                          : `${getApiUrl()}${companyLogo}`
                        if (e.currentTarget.src !== directUrl && !companyLogo.startsWith('http')) {
                          console.log('Попытка загрузки напрямую с backend:', directUrl)
                          e.currentTarget.src = directUrl
                        } else {
                          e.currentTarget.style.display = 'none'
                          const nextSibling = e.currentTarget.nextElementSibling as HTMLElement
                          if (nextSibling) {
                            nextSibling.style.display = 'flex'
                          }
                        }
                      }}
                      onLoad={() => {
                        console.log('Логотип успешно загружен:', companyLogo)
                      }}
                    />
                  ) : null}
                  <span className={`text-white font-bold text-2xl lg:text-3xl ${companyLogo ? 'hidden' : 'flex'}`}>🌊</span>
                </div>
              </div>
              <div className="space-y-0.5">
                <h1 className={`text-2xl lg:text-3xl font-bold tracking-tight ${isHomePage ? 'text-gradient-marine' : 'text-marine-800'}`}>
                  {companyName}
                </h1>
                <p className={`text-sm lg:text-base font-medium ${isHomePage ? 'text-marine-600' : 'text-marine-500'}`}>
                  {companyTagline}
                </p>
              </div>
            </Link>

            {/* Кнопка меню (для всех устройств) */}
            <div className="flex items-center space-x-2">
              {/* Кнопка корзины */}
              <button
                onClick={() => setShowCart(true)}
                className="relative p-3 text-marine-600 hover:text-marine-700 transition-all duration-300 hover:bg-gradient-to-br hover:from-marine-50 hover:to-ocean-50 rounded-xl hover:shadow-lg hover:scale-105 border border-transparent hover:border-marine-200"
                title="Корзина"
              >
                <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>

              {/* Кнопка админ-панели */}
              <button
                onClick={() => setShowAdminPanel(true)}
                className="relative p-3 text-marine-600 hover:text-marine-700 transition-all duration-300 hover:bg-gradient-to-br hover:from-marine-50 hover:to-ocean-50 rounded-xl hover:shadow-lg hover:scale-105 border border-transparent hover:border-marine-200"
                title="Админ-панель"
              >
                <Settings className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
              
              {/* Кнопка меню */}
              <button
                className="relative p-3 text-gray-700 hover:text-gray-900 transition-all duration-300 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 rounded-xl hover:shadow-lg hover:scale-105 border border-transparent hover:border-gray-200"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Меню"
              >
                {isOpen ? <X className="w-6 h-6 lg:w-7 lg:h-7" /> : <Menu className="w-6 h-6 lg:w-7 lg:h-7" />}
              </button>
            </div>
          </div>

          {/* Выпадающее меню (для всех устройств) */}
          <motion.div
            className={`overflow-hidden transition-all duration-300 ${
              isOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}
            initial={false}
          >
            <div className="bg-white py-4 space-y-3">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                const getActiveClasses = () => {
                  switch (colors.primary) {
                    case 'blue':
                      return isActive ? 'text-blue-600' : ''
                    case 'teal':
                      return isActive ? 'text-teal-600' : ''
                    case 'sky':
                      return isActive ? 'text-sky-600' : ''
                    default:
                      return isActive ? 'text-blue-600' : ''
                  }
                }
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-6 py-3 text-base font-medium transition-colors duration-200 rounded-xl ${
                      getActiveClasses() || 'text-gray-700 hover:text-blue-600'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </motion.div>
        </nav>
      </motion.header>

      {/* Админ-панель модальное окно */}
      <AdminPanel 
        isOpen={showAdminPanel} 
        onClose={() => setShowAdminPanel(false)} 
      />

      {/* Корзина */}
      <Cart isOpen={showCart} onClose={() => setShowCart(false)} />
    </>
  )
}

export default Header
