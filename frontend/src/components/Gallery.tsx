'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Play, ArrowLeft, ArrowRight, X } from 'lucide-react'

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'Все проекты' },
    { id: 'ships', name: 'Судостроение' },
    { id: 'equipment', name: 'Оборудование' },
    { id: 'maintenance', name: 'Обслуживание' },
    { id: 'automation', name: 'Автоматизация' }
  ]

  const projects = [
    {
      id: 1,
      title: 'Модернизация рыболовного судна',
      category: 'ships',
      description: 'Комплексная модернизация навигационного и рыбопоискового оборудования',
      image: '/api/placeholder/400/300',
      year: '2023',
      location: 'Мурманск'
    },
    {
      id: 2,
      title: 'Установка системы безопасности',
      category: 'equipment',
      description: 'Монтаж современной системы пожарной безопасности на круизном лайнере',
      image: '/api/placeholder/400/300',
      year: '2023',
      location: 'Санкт-Петербург'
    },
    {
      id: 3,
      title: 'Автоматизация портового терминала',
      category: 'automation',
      description: 'Внедрение автоматизированной системы управления грузопотоками',
      image: '/api/placeholder/400/300',
      year: '2022',
      location: 'Новороссийск'
    },
    {
      id: 4,
      title: 'Техническое обслуживание флота',
      category: 'maintenance',
      description: 'Плановое техническое обслуживание судового оборудования',
      image: '/api/placeholder/400/300',
      year: '2023',
      location: 'Владивосток'
    },
    {
      id: 5,
      title: 'Поставка навигационного оборудования',
      category: 'equipment',
      description: 'Комплексная поставка и настройка навигационных систем',
      image: '/api/placeholder/400/300',
      year: '2022',
      location: 'Архангельск'
    },
    {
      id: 6,
      title: 'Ремонт двигательной установки',
      category: 'maintenance',
      description: 'Капитальный ремонт главного двигателя грузового судна',
      image: '/api/placeholder/400/300',
      year: '2023',
      location: 'Калининград'
    }
  ]

  const filteredProjects = projects.filter(project => 
    selectedCategory === 'all' || project.category === selectedCategory
  )

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % filteredProjects.length)
    }
  }

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? filteredProjects.length - 1 : selectedImage - 1)
    }
  }

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Галерея <span className="text-gradient">проектов</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Реализованные проекты и выполненные работы. Более 500 успешных проектов 
            по всей России и за рубежом.
          </p>
        </motion.div>

        {/* Фильтры категорий */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-marine-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Галерея проектов */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              className="card overflow-hidden group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              onClick={() => setSelectedImage(index)}
            >
              {/* Изображение проекта */}
              <div className="relative h-64 bg-gradient-to-br from-marine-100 to-ocean-100 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-marine-600/20 to-ocean-600/20 group-hover:opacity-0 transition-opacity duration-300"></div>
                
                {/* Overlay с информацией */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Play className="w-12 h-12 mx-auto mb-2" />
                    <span className="text-sm font-medium">Смотреть проект</span>
                  </div>
                </div>

                {/* Бейдж категории */}
                <div className="absolute top-4 left-4 bg-marine-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {categories.find(c => c.id === project.category)?.name}
                </div>

                {/* Год и локация */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex justify-between items-center text-white text-sm">
                    <span>{project.year}</span>
                    <span>{project.location}</span>
                  </div>
                </div>
              </div>

              {/* Информация о проекте */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-marine-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {project.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Статистика */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-gray-200"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-marine-600 mb-2">500+</div>
            <div className="text-gray-600">Реализованных проектов</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-marine-600 mb-2">50+</div>
            <div className="text-gray-600">Городов России</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-marine-600 mb-2">10+</div>
            <div className="text-gray-600">Лет опыта</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-marine-600 mb-2">98%</div>
            <div className="text-gray-600">Довольных клиентов</div>
          </div>
        </motion.div>

        {/* Модальное окно для просмотра изображений */}
        {selectedImage !== null && (
          <motion.div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative max-w-4xl w-full">
              {/* Кнопка закрытия */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Навигационные кнопки */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <ArrowRight className="w-6 h-6" />
              </button>

              {/* Изображение */}
              <div className="bg-gradient-to-br from-marine-100 to-ocean-100 rounded-xl overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-marine-200 to-ocean-200"></div>
              </div>

              {/* Информация о проекте */}
              <div className="mt-6 text-center text-white">
                <h3 className="text-2xl font-bold mb-2">
                  {filteredProjects[selectedImage]?.title}
                </h3>
                <p className="text-lg opacity-90">
                  {filteredProjects[selectedImage]?.description}
                </p>
                <div className="flex justify-center items-center space-x-4 mt-4 text-sm opacity-75">
                  <span>{filteredProjects[selectedImage]?.year}</span>
                  <span>•</span>
                  <span>{filteredProjects[selectedImage]?.location}</span>
                </div>
              </div>

              {/* Индикатор */}
              <div className="flex justify-center mt-6 space-x-2">
                {filteredProjects.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === selectedImage ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default Gallery
