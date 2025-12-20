'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Anchor, Ship, Waves } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import Link from 'next/link'

interface HeroProps {
  onContactClick: () => void
}

const Hero = ({ onContactClick }: HeroProps) => {
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

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Фоновые элементы */}
      <div className="absolute inset-0 ocean-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-marine-600/20 via-ocean-500/30 to-marine-400/20"></div>
      </div>

      {/* Анимированные морские элементы (старые) */}
      <motion.div
        className="absolute top-20 left-10 text-marine-600/20 floating-element"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <Anchor className="w-16 h-16" />
      </motion.div>

      <motion.div
        className="absolute bottom-20 right-10 text-marine-600/20 floating-element"
        animate={{ x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Ship className="w-20 h-20" />
      </motion.div>

      <motion.div
        className="absolute top-1/2 left-1/4 text-marine-600/10 floating-element"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Waves className="w-24 h-24" />
      </motion.div>

      {/* Анимированные стикеры морской тематики на фоне */}
      <motion.div
        className="absolute top-10 right-20 text-6xl opacity-40"
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
        className="absolute top-32 left-20 text-5xl opacity-35"
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
        className="absolute top-1/3 right-1/3 text-4xl opacity-40"
        animate={{ 
          y: [0, -20, 0],
          x: [0, 15, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 1
        }}
      >
        🐚
      </motion.div>

      <motion.div
        className="absolute bottom-1/3 left-1/4 text-5xl opacity-35"
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
        🌊
      </motion.div>

      <motion.div
        className="absolute top-1/2 right-1/4 text-6xl opacity-40"
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
        ⚓
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 right-10 text-4xl opacity-35"
        animate={{ 
          x: [0, 20, 0],
          rotate: [0, -12, 12, 0]
        }}
        transition={{ 
          duration: 16, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 2.5
        }}
      >
        🐙
      </motion.div>

      {/* Основной контент */}
      <div className="section-container relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
              {settings.siteInfo.title}
            </h1>
          </motion.div>

          {settings.siteInfo.description && (
          <motion.p
              className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed text-white/90"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
              {settings.siteInfo.description}
          </motion.p>
          )}

          {/* Кнопка сотрудничества */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8"
          >
            <Link href="/cooperation">
              <button className="marine-button-secondary text-lg flex items-center space-x-2 group mx-auto">
                <span>Сотрудничество</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            </Link>
          </motion.div>

          {/* Статистика */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {settings.siteInfo.statistics
              .filter(stat => stat.trim() !== '')
              .map((stat, index) => (
              <div key={index} className="text-center marine-card p-6">
                <div className="text-3xl md:text-4xl font-bold text-marine-800 mb-2">
                  {stat.match(/\d+/)?.[0] || '0'}+
            </div>
                <div className="text-marine-700 font-medium">
                  {stat.replace(/\d+/g, '').trim()}
            </div>
            </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Прокрутка вниз */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-marine-300 rounded-full flex justify-center backdrop-blur-marine">
          <motion.div
            className="w-1 h-3 bg-marine-400 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  )
}

export default Hero
