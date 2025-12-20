'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import Products from '@/components/Products'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'

export default function Home() {
  const [showContactForm, setShowContactForm] = useState(false)

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Анимированный морской фон */}
      <div className="fixed inset-0 -z-10">
        {/* Основной градиент */}
        <div className="absolute inset-0 bg-gradient-to-br from-marine-50 via-ocean-100 to-marine-200"></div>
        
        {/* Волновой паттерн */}
        <div className="absolute inset-0 wave-pattern opacity-30"></div>
        
        {/* Плавающие элементы */}
        <motion.div
          className="absolute top-20 left-10 w-24 h-24 bg-marine-200/40 rounded-full floating-element"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute top-40 right-20 w-20 h-20 bg-ocean-300/30 rounded-full floating-element"
          animate={{
            y: [0, 25, 0],
            x: [0, -25, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        <motion.div
          className="absolute bottom-40 left-1/4 w-16 h-16 bg-marine-400/20 rounded-full floating-element"
          animate={{
            y: [0, -15, 0],
            x: [0, 15, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
        
        {/* Дополнительные декоративные элементы */}
        <motion.div
          className="absolute top-1/3 right-1/3 w-32 h-32 bg-gradient-to-br from-marine-300/20 to-ocean-400/20 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Основной контент */}
      <div className="relative z-10">
      <Header />
      <Hero onContactClick={() => setShowContactForm(true)} />
      <Services />
      <Products />
      <Contact onContactClick={() => setShowContactForm(true)} />
      <Footer />
      </div>

      {/* Модальное окно с формой обратной связи */}
      {showContactForm && (
        <ContactForm 
          isOpen={showContactForm} 
          onClose={() => setShowContactForm(false)} 
        />
      )}
    </main>
  )
}
