'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Trash2, Edit, Plus, Upload, FileSpreadsheet,
  Settings, Users, Package, Wrench, MessageSquare, 
  BarChart3, Home, X, UserPlus, Menu
} from 'lucide-react'
import { apiUrl, getApiUrl } from '@/lib/api'

// Интерфейсы для разных типов данных
interface Product {
  id: string
  name: string
  description: string
  category: string
  subcategory?: string
  вид?: string | null // Вид товара - название вкладки, на которую был загружен товар
  drawing?: string
  image?: string
  images?: string[] // Дополнительные фотографии для галереи (до 10)
  unit: 'шт' | 'к-т' | 'пара'
  price: string
  quantity: number
  inStock: boolean
  createdAt?: string
  updatedAt?: string
}

interface Service {
  id: string
  name: string
  description: string
  price: string
  executionTime: string
  image?: string
  video?: string
  createdAt?: string
  updatedAt?: string
  hasImage?: boolean // Флаг наличия изображения (для упрощенной версии)
  hasVideo?: boolean // Флаг наличия видео (для упрощенной версии)
}

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  message: string
  status: 'new' | 'in_progress' | 'completed'
  createdAt?: string
  updatedAt?: string
}

interface CooperationRequest {
  id: string | number
  name: string
  contact: string
  positions: string
  status: 'new' | 'in_progress' | 'completed'
  createdAt: string
  updatedAt?: string
}

interface DashboardStats {
  totalProducts: number
  totalServices: number
  totalContacts: number
  totalCooperation: number
  inStock: number
  outOfStock: number
  categories: number
  totalValue: number
}

interface ExcelPreview {
  sheetsProcessed?: number
  totalProducts?: number
  totalCategories?: number
  totalSubcategories?: number
  inStock?: number
  outOfStock?: number
}

interface SiteSettings {
  company?: {
    name: string
    logo: string
    tagline: string
  }
  siteInfo: {
    title: string
    description?: string
    statistics: string[]
  }
  cooperation?: {
    title: string
    description: string
    benefits?: Array<{
      icon: string
      title: string
      description: string
    }>
  }
  contacts: {
    phone: string
    email: string
    address: string
    workingHours: string
    location: string
    telegram: string
    whatsapp: string
    otherContacts: string
  }
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string
  }
  pageTitles?: {
    products?: {
      title: string
      subtitle: string
    }
    shipParts?: {
      title: string
      subtitle: string
    }
    fittings?: {
      title: string
      subtitle: string
    }
    heatExchangers?: {
      title: string
      subtitle: string
    }
    services?: {
      title: string
      subtitle: string
    }
    contact?: {
      title: string
      subtitle: string
    }
  }
  updatedAt?: string
}

interface AdminPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [cooperation, setCooperation] = useState<CooperationRequest[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showExcelUpload, setShowExcelUpload] = useState(false)
  const [excelPreview, setExcelPreview] = useState<ExcelPreview | null>(null)
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([])
  const [editingCategory, setEditingCategory] = useState<{id: string, name: string} | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')

  // Определяем категорию для текущей вкладки
  const getCategoryForTab = (tabId: string): string | null => {
    switch (tabId) {
      case 'ship-parts':
        return 'Судовые запчасти'
      case 'fittings':
        return 'Арматура'
      case 'heat-exchangers':
        return 'Теплообменники'
      default:
        return null
    }
  }
  
  // Получаем название вкладки (вид) для текущей вкладки
  const getViewForTab = (tabId: string): string | null => {
    switch (tabId) {
      case 'ship-parts':
        return 'Судовые запчасти'
      case 'fittings':
        return 'Арматура'
      case 'heat-exchangers':
        return 'Теплообменники'
      case 'products':
        return 'Все товары' // Для "Все товары" устанавливаем явный вид
      default:
        return null
    }
  }
  
  // Получаем товары для текущей вкладки
  // Товары уже загружены для нужной вкладки через API, просто возвращаем их
  const getProductsForTab = (): Product[] => {
    return products
  }
  
  // Фильтрация товаров по поисковому запросу и категории вкладки
  const filteredProducts = (() => {
    const tabProducts = getProductsForTab()
    if (!searchQuery.trim()) return tabProducts
    
    const query = searchQuery.toLowerCase()
    return tabProducts.filter(product => {
      return (
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.price.includes(query) ||
        product.quantity.toString().includes(query)
      )
    })
  })()

  // Загрузка данных
  useEffect(() => {
    if (isOpen) {
      // Очищаем товары при переключении вкладок, чтобы избежать показа товаров не той вкладки
      setProducts([])
      loadDashboardData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isOpen])

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isNavOpen) {
          setIsNavOpen(false)
        } else {
          onClose()
        }
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (isNavOpen && !target.closest('.nav-dropdown')) {
        setIsNavOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, isNavOpen, onClose])

  // Функция для выполнения запроса с таймаутом
  const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 10000) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      return response
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Таймаут запроса: сервер не отвечает')
      }
      throw error
    }
  }

  const loadDashboardData = async () => {
    if (!isOpen) return // Не загружаем данные, если панель закрыта
    
    setLoading(true)
    setError('')
      
    try {
      // Загружаем данные в зависимости от активной вкладки
      if (activeTab === 'dashboard' || activeTab === 'products' || activeTab === 'ship-parts' || activeTab === 'fittings' || activeTab === 'heat-exchangers') {
        // Определяем tabId для запроса товаров
        const tabId = activeTab === 'dashboard' ? 'products' : activeTab
        
        let statsRes, productsRes
        
        try {
          [statsRes, productsRes] = await Promise.all([
            fetchWithTimeout(apiUrl('/admin/dashboard'), {}, 10000),
            fetchWithTimeout(apiUrl(`/admin/products?tab=${tabId}`), {}, 10000)
          ])
        } catch (fetchError: any) {
          console.error('Ошибка сети при загрузке данных:', fetchError)
          const errorMessage = fetchError.message || 'Ошибка подключения к серверу'
          setError(`Ошибка подключения: ${errorMessage}. Проверьте, запущен ли backend сервер.`)
          setProducts([])
          setLoading(false)
          return
        }
        
        if (statsRes.ok) {
          try {
            const statsData = await statsRes.json()
            setStats(statsData)
          } catch (err) {
            console.error('Ошибка парсинга статистики:', err)
            // Не устанавливаем ошибку для статистики, так как это не критично
          }
        } else {
          try {
            const errorData = await statsRes.json()
            console.error('Ошибка загрузки статистики:', errorData)
          } catch (err) {
            console.error('Ошибка парсинга ошибки статистики:', err)
          }
        }
        
        if (productsRes.ok) {
          try {
            const productsData = await productsRes.json()
            console.log('Загружено товаров:', productsData.length)
            setProducts(Array.isArray(productsData) ? productsData : [])
            setError('') // Очищаем ошибку при успешной загрузке
          } catch (err) {
            console.error('Ошибка парсинга товаров:', err)
            setError('Ошибка обработки данных товаров. Возможно, данные повреждены.')
            setProducts([])
          }
        } else {
          let errorMessage = 'Неизвестная ошибка'
          try {
            const errorData = await productsRes.json()
            errorMessage = errorData.error || errorData.message || 'Неизвестная ошибка'
            console.error('Ошибка загрузки товаров:', errorData)
          } catch (err) {
            console.error('Ошибка парсинга ошибки товаров:', err)
            errorMessage = `Ошибка HTTP ${productsRes.status}: ${productsRes.statusText}`
          }
          setError(`Ошибка загрузки товаров: ${errorMessage}`)
          setProducts([])
        }
      }
      
      if (activeTab === 'services') {
        console.log('Загрузка услуг с API:', apiUrl('/admin/services'))
        try {
          const servicesRes = await fetchWithTimeout(apiUrl('/admin/services'), {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }, 10000)
          
          console.log('Ответ сервера:', servicesRes.status, servicesRes.statusText)
          
          if (servicesRes.ok) {
            const servicesData = await servicesRes.json()
            console.log('Получены услуги:', servicesData)
            console.log('Тип данных:', typeof servicesData, Array.isArray(servicesData))
            console.log('Количество услуг:', Array.isArray(servicesData) ? servicesData.length : 'не массив')
            
            if (Array.isArray(servicesData)) {
              setServices(servicesData)
              setError('') // Очищаем ошибку при успешной загрузке
              console.log('Услуги установлены в состояние:', servicesData.length)
            } else {
              console.error('Данные не являются массивом:', servicesData)
              setServices([])
              setError('Ошибка: данные услуг имеют неверный формат')
            }
          } else {
            console.error('Ошибка HTTP при загрузке услуг:', servicesRes.status, servicesRes.statusText)
            let errorMessage = servicesRes.statusText
            try {
              const errorText = await servicesRes.text()
              const errorData = JSON.parse(errorText)
              errorMessage = errorData.error || errorData.message || errorMessage
            } catch (e) {
              // Игнорируем ошибку парсинга
            }
            setServices([])
            setError(`Ошибка загрузки услуг: ${errorMessage}`)
          }
        } catch (fetchError: any) {
          console.error('Ошибка fetch при загрузке услуг:', fetchError)
          setServices([])
          const errorMessage = fetchError.message || (fetchError instanceof Error ? fetchError.message : 'Неизвестная ошибка')
          setError(`Ошибка подключения к серверу: ${errorMessage}`)
        }
      }
      
      if (activeTab === 'contacts') {
        try {
          const contactsRes = await fetchWithTimeout(apiUrl('/admin/contacts'), {}, 10000)
          if (contactsRes.ok) {
            const contactsData = await contactsRes.json()
            setContacts(Array.isArray(contactsData) ? contactsData : [])
            setError('') // Очищаем ошибку при успешной загрузке
          } else {
            setContacts([])
            setError(`Ошибка загрузки контактов: HTTP ${contactsRes.status}`)
          }
        } catch (fetchError: any) {
          console.error('Ошибка загрузки контактов:', fetchError)
          setContacts([])
          const errorMessage = fetchError.message || 'Неизвестная ошибка'
          setError(`Ошибка подключения: ${errorMessage}`)
        }
      }
      if (activeTab === 'cooperation') {
        console.log('Загрузка заявок на сотрудничество...')
        try {
          const cooperationRes = await fetchWithTimeout(apiUrl('/admin/cooperation'), {}, 10000)
          console.log('Ответ сервера:', cooperationRes.status, cooperationRes.statusText)
          if (cooperationRes.ok) {
            const cooperationData = await cooperationRes.json()
            console.log('Получены заявки на сотрудничество:', cooperationData)
            console.log('Тип данных:', typeof cooperationData, Array.isArray(cooperationData))
            console.log('Количество заявок:', Array.isArray(cooperationData) ? cooperationData.length : 'не массив')
            setCooperation(Array.isArray(cooperationData) ? cooperationData : [])
            setError('') // Очищаем ошибку при успешной загрузке
          } else {
            console.error('Ошибка HTTP при загрузке заявок:', cooperationRes.status, cooperationRes.statusText)
            const errorText = await cooperationRes.text()
            console.error('Текст ошибки:', errorText)
            setCooperation([])
            let errorMessage = cooperationRes.statusText
            try {
              const errorData = JSON.parse(errorText)
              errorMessage = errorData.error || errorData.message || errorMessage
            } catch (e) {
              // Игнорируем ошибку парсинга
            }
            setError(`Ошибка загрузки заявок на сотрудничество: ${errorMessage}`)
          }
        } catch (fetchError: any) {
          console.error('Ошибка fetch при загрузке заявок на сотрудничество:', fetchError)
          setCooperation([])
          const errorMessage = fetchError.message || (fetchError instanceof Error ? fetchError.message : 'Неизвестная ошибка')
          setError(`Ошибка подключения: ${errorMessage}`)
        }
      }
      
      if (activeTab === 'settings' || activeTab === 'homepage') {
        const settingsRes = await fetch(apiUrl('/settings'))
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json()
          setSiteSettings(settingsData)
        }
      }
      
      if (activeTab === 'categories' || activeTab === 'products' || activeTab === 'ship-parts' || activeTab === 'fittings' || activeTab === 'heat-exchangers') {
        const categoriesRes = await fetch(apiUrl('/admin/categories'))
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(Array.isArray(categoriesData) ? categoriesData : [])
        }
      }
      
    } catch (err) {
      console.error('Ошибка загрузки данных:', err)
      setError('Ошибка загрузки данных: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
      // Устанавливаем пустые массивы в случае ошибки
      if (activeTab === 'services') {
        setServices([])
      }
    } finally {
      setLoading(false)
    }
  }

  // CRUD операции для товаров
  const createProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const res = await fetch(apiUrl('/admin/products'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })
      if (res.ok) {
        loadDashboardData()
      }
    } catch (err) {
      setError('Ошибка создания товара')
    }
  }

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const res = await fetch(apiUrl(`/admin/products/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })
      if (res.ok) {
        loadDashboardData()
      }
    } catch (err) {
      setError('Ошибка обновления товара')
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) {
      return
    }
    
    try {
      // Определяем tabId для быстрого батч-удаления
      const tabId = activeTab === 'products' ? 'products' : 
                    activeTab === 'ship-parts' ? 'ship-parts' :
                    activeTab === 'fittings' ? 'fittings' :
                    activeTab === 'heat-exchangers' ? 'heat-exchangers' : 'products'
      
      // Используем батч-удаление (даже для одного товара - быстрее!)
      const res = await fetch(apiUrl(`/admin/products?tab=${tabId}&ids=${encodeURIComponent(id)}`), { 
        method: 'DELETE' 
      })
      if (res.ok) {
        // Очищаем товары перед перезагрузкой для мгновенного обновления UI
        setProducts(prev => prev.filter(p => p.id !== id))
        // Перезагружаем данные в фоне (не блокируем UI)
        loadDashboardData()
      } else {
        setError('Ошибка удаления товара')
      }
    } catch (err) {
      setError('Ошибка удаления товара')
    }
  }

  const deleteAllProducts = async () => {
    // Определяем tabId для удаления товаров
    const tabId = activeTab === 'products' ? 'products' : 
                  activeTab === 'ship-parts' ? 'ship-parts' :
                  activeTab === 'fittings' ? 'fittings' :
                  activeTab === 'heat-exchangers' ? 'heat-exchangers' : 'products'
    
    const productsToDelete = getProductsForTab()
    const tabName = activeTab === 'products' ? 'Все товары' :
                    activeTab === 'ship-parts' ? 'Судовые запчасти' :
                    activeTab === 'fittings' ? 'Арматура' :
                    activeTab === 'heat-exchangers' ? 'Теплообменники' : activeTab
    
    if (!confirm(`ВНИМАНИЕ! Вы уверены, что хотите удалить ВСЕ товары вкладки "${tabName}" (${productsToDelete.length} шт.)?\n\nЭто действие нельзя отменить!`)) {
      return
    }
    
    // Двойное подтверждение для безопасности
    if (!confirm(`Это последнее предупреждение! Все товары вкладки "${tabName}" будут безвозвратно удалены. Продолжить?`)) {
      return
    }
    
    try {
      // Удаляем все товары для текущей вкладки одним запросом (максимально быстро!)
      const res = await fetch(apiUrl(`/admin/products?tab=${tabId}`), { method: 'DELETE' })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Неизвестная ошибка' }))
        throw new Error(errorData.error || 'Ошибка удаления всех товаров')
      }
      setError('')
      // Перезагружаем данные после успешного удаления
      await loadDashboardData()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления товаров'
      setError(`Ошибка удаления товаров: ${errorMessage}`)
      console.error('Ошибка удаления товаров:', err)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите файл изображения')
      return
    }

    // Проверяем размер файла (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      if (editingProduct && reader.result) {
        setEditingProduct({
          ...editingProduct,
          image: reader.result as string
        })
      }
    }
    reader.onerror = () => {
      setError('Ошибка при чтении файла')
    }
    reader.readAsDataURL(file)
  }

  const handleAdditionalImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите файл изображения')
      return
    }

    // Проверяем размер файла (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      if (editingProduct && reader.result) {
        const currentImages = editingProduct.images || []
        
        if (index !== undefined) {
          // Замена существующего изображения
          const newImages = [...currentImages]
          newImages[index] = reader.result as string
          setEditingProduct({
            ...editingProduct,
            images: newImages
          })
        } else {
          // Добавление нового изображения
          if (currentImages.length >= 10) {
            setError('Можно загрузить максимум 10 дополнительных фотографий')
            return
          }
          setEditingProduct({
            ...editingProduct,
            images: [...currentImages, reader.result as string]
          })
        }
      }
    }
    reader.onerror = () => {
      setError('Ошибка при чтении файла')
    }
    reader.readAsDataURL(file)
  }

  const removeAdditionalImage = (index: number) => {
    if (editingProduct && editingProduct.images) {
      const newImages = editingProduct.images.filter((_, i) => i !== index)
      setEditingProduct({
        ...editingProduct,
        images: newImages
      })
    }
  }

  const saveProductEdit = async () => {
    if (!editingProduct) return
    
    // Определяем tabId для сохранения товара
    const tabId = activeTab === 'products' ? 'products' : 
                  activeTab === 'ship-parts' ? 'ship-parts' :
                  activeTab === 'fittings' ? 'fittings' :
                  activeTab === 'heat-exchangers' ? 'heat-exchangers' : 'products'
    
    // Если мы на вкладке категории, принудительно устанавливаем категорию
    const categoryForTab = getCategoryForTab(activeTab)
    if (categoryForTab) {
      editingProduct.category = categoryForTab
    }
    
    // Валидация обязательных полей
    if (!editingProduct.name || !editingProduct.name.trim()) {
      setError('Название товара обязательно')
      return
    }
    if (!editingProduct.category || !editingProduct.category.trim()) {
      setError('Категория товара обязательна')
      return
    }
    if (!editingProduct.price || editingProduct.price.trim() === '' || parseFloat(editingProduct.price) < 0) {
      setError('Цена товара обязательна и должна быть неотрицательной')
      return
    }
    
    try {
      // Если товар новый (ID начинается с 'temp-'), создаем его
      if (editingProduct.id.startsWith('temp-')) {
        const { id, ...productData } = editingProduct
        // Удаляем поле вид, если оно есть (больше не нужно)
        delete productData.вид
        
        // Определяем tabId для сохранения товара
        const tabId = activeTab === 'products' ? 'products' : 
                      activeTab === 'ship-parts' ? 'ship-parts' :
                      activeTab === 'fittings' ? 'fittings' :
                      activeTab === 'heat-exchangers' ? 'heat-exchangers' : 'products'
        
        const res = await fetch(apiUrl(`/admin/products?tab=${tabId}`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        })
        if (res.ok) {
          setEditingProduct(null)
          loadDashboardData()
          setError('')
        } else {
          const errorData = await res.json().catch(() => ({ error: 'Неизвестная ошибка' }))
          setError(errorData.error || 'Ошибка создания товара')
        }
      } else {
        // Иначе обновляем существующий товар
        const productToUpdate = { ...editingProduct }
        // Удаляем поле вид, если оно есть (больше не нужно)
        delete productToUpdate.вид
        
        const res = await fetch(apiUrl(`/admin/products/${editingProduct.id}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productToUpdate)
        })
        if (res.ok) {
          setEditingProduct(null)
          loadDashboardData()
          setError('')
        } else {
          const errorData = await res.json().catch(() => ({ error: 'Неизвестная ошибка' }))
          setError(errorData.error || 'Ошибка сохранения товара')
        }
      }
    } catch (err) {
      console.error('Ошибка сохранения товара:', err)
      setError('Ошибка сохранения товара: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  // CRUD операции для услуг
  const createService = async (serviceData: Omit<Service, 'id'>) => {
    try {
      const res = await fetch(apiUrl('/admin/services'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData)
      })
      if (res.ok) {
        const newService = await res.json()
        setError('')
        // Загружаем полные данные новой услуги для редактирования
        try {
          const fullRes = await fetch(apiUrl(`/admin/services/${newService.id}/full`))
          if (fullRes.ok) {
            const fullService = await fullRes.json()
            setEditingService(fullService)
          } else {
            setEditingService(newService)
          }
        } catch (err) {
          setEditingService(newService)
        }
        // Загружаем услуги независимо от текущей вкладки
        const servicesRes = await fetch(apiUrl('/admin/services'))
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json()
          console.log('Услуги загружены после создания:', servicesData.length)
          setServices(Array.isArray(servicesData) ? servicesData : [])
        } else {
          console.error('Ошибка загрузки услуг после создания')
        }
        // Также обновляем общие данные, если нужно
        if (activeTab === 'dashboard') {
        loadDashboardData()
        }
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Неизвестная ошибка' }))
        setError(errorData.error || 'Ошибка создания услуги')
      }
    } catch (err) {
      console.error('Ошибка создания услуги:', err)
      setError('Ошибка создания услуги: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  const saveServiceEdit = async () => {
    if (!editingService) return
    
    // Валидация обязательных полей
    if (!editingService.name || editingService.name.trim() === '') {
      setError('Наименование услуги обязательно')
      return
    }
    
    if (!editingService.description || editingService.description.trim() === '') {
      setError('Описание услуги обязательно')
      return
    }
    
    if (!editingService.price || editingService.price.trim() === '') {
      setError('Цена услуги обязательна')
      return
    }
    
    try {
      // Если это новая услуга (id начинается с 'temp-'), создаем её
      if (editingService.id.startsWith('temp-')) {
        const serviceData: Omit<Service, 'id'> = {
          name: editingService.name.trim(),
          description: editingService.description.trim(),
          price: editingService.price.trim(),
          executionTime: editingService.executionTime || '',
          image: editingService.image || '',
          video: editingService.video || ''
        }
        
        // Проверяем размер данных перед отправкой
        const dataSize = JSON.stringify(serviceData).length
        console.log('Размер данных услуги для отправки:', (dataSize / 1024 / 1024).toFixed(2), 'MB')
        
        const res = await fetch(apiUrl('/admin/services'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serviceData)
        })
        
        if (res.ok) {
          setError('')
          // Перезагружаем список услуг
          const servicesRes = await fetch(apiUrl('/admin/services'))
          if (servicesRes.ok) {
            const servicesData = await servicesRes.json()
            setServices(Array.isArray(servicesData) ? servicesData : [])
          }
          // Закрываем модальное окно после успешного сохранения
          setEditingService(null)
        } else {
          let errorMessage = 'Неизвестная ошибка'
          try {
            const errorData = await res.json()
            errorMessage = errorData.error || errorData.message || `HTTP ${res.status}: ${res.statusText}`
          } catch (parseError) {
            errorMessage = `HTTP ${res.status}: ${res.statusText || 'Ошибка сервера'}`
          }
          console.error('Ошибка создания услуги:', errorMessage)
          setError('Ошибка создания услуги: ' + errorMessage)
        }
      } else {
        // Обновляем существующую услугу
        // Проверяем размер данных перед отправкой
        const dataSize = JSON.stringify(editingService).length
        console.log('Размер данных услуги для обновления:', (dataSize / 1024 / 1024).toFixed(2), 'MB')
        
        const res = await fetch(apiUrl(`/admin/services/${editingService.id}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingService)
        })
        
        if (res.ok) {
          setError('')
          // Перезагружаем список услуг
          const servicesRes = await fetch(apiUrl('/admin/services'))
          if (servicesRes.ok) {
            const servicesData = await servicesRes.json()
            setServices(Array.isArray(servicesData) ? servicesData : [])
          }
          // Закрываем модальное окно после успешного сохранения
          setEditingService(null)
        } else {
          let errorMessage = 'Неизвестная ошибка'
          try {
            const errorData = await res.json()
            errorMessage = errorData.error || errorData.message || `HTTP ${res.status}: ${res.statusText}`
          } catch (parseError) {
            errorMessage = `HTTP ${res.status}: ${res.statusText || 'Ошибка сервера'}`
          }
          console.error('Ошибка сохранения услуги:', errorMessage)
          setError('Ошибка сохранения услуги: ' + errorMessage)
        }
      }
    } catch (err) {
      console.error('Ошибка при сохранении услуги:', err)
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка'
      // Если это ошибка сети, даем более понятное сообщение
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setError('Ошибка подключения к серверу. Проверьте, что сервер запущен и доступен.')
      } else {
        setError('Ошибка сохранения услуги: ' + errorMessage)
      }
    }
  }

  const handleServiceImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0]
    if (!file) return

    // Проверка формата для фото
    if (type === 'image' && !['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Пожалуйста, загрузите изображение в формате JPEG или PNG')
      return
    }

    // Проверка формата для видео
    if (type === 'video' && !['image/jpeg', 'image/png', 'video/mp4', 'video/webm'].includes(file.type)) {
      alert('Пожалуйста, загрузите файл в формате JPEG, PNG, MP4 или WebM')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      if (editingService) {
        setEditingService({
          ...editingService,
          [type]: base64String
        })
      }
    }
    reader.readAsDataURL(file)
  }

  const updateService = async (id: string, serviceData: Partial<Service>) => {
    try {
      const res = await fetch(apiUrl(`/admin/services/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData)
      })
      if (res.ok) {
        setError('')
        // Загружаем услуги независимо от текущей вкладки
        const servicesRes = await fetch(apiUrl('/admin/services'))
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json()
          setServices(servicesData)
        }
        // Также обновляем общие данные
        loadDashboardData()
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Неизвестная ошибка' }))
        setError(errorData.error || 'Ошибка обновления услуги')
      }
    } catch (err) {
      console.error('Ошибка обновления услуги:', err)
      setError('Ошибка обновления услуги: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  const deleteService = async (id: string) => {
    try {
      const res = await fetch(apiUrl(`/admin/services/${id}`), { method: 'DELETE' })
      if (res.ok) {
        setError('')
        // Загружаем услуги независимо от текущей вкладки
        const servicesRes = await fetch(apiUrl('/admin/services'))
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json()
          setServices(servicesData)
        }
        // Также обновляем общие данные
        loadDashboardData()
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Неизвестная ошибка' }))
        setError(errorData.error || 'Ошибка удаления услуги')
      }
    } catch (err) {
      console.error('Ошибка удаления услуги:', err)
      setError('Ошибка удаления услуги: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  // CRUD операции для контактов
  const updateContact = async (id: string, contactData: Partial<Contact>) => {
    try {
      const res = await fetch(apiUrl(`/admin/contacts/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
      })
      if (res.ok) {
        loadDashboardData()
      }
    } catch (err) {
      setError('Ошибка обновления контакта')
    }
  }

  const deleteContact = async (id: string | number) => {
    try {
      const res = await fetch(apiUrl(`/admin/contacts/${id}`), { method: 'DELETE' })
      if (res.ok) {
        loadDashboardData()
      } else {
        const errorData = await res.json().catch(() => ({}))
        setError(errorData.error || 'Ошибка удаления контакта')
      }
    } catch (err) {
      console.error('Ошибка удаления контакта:', err)
      setError('Ошибка удаления контакта: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  // CRUD операции для заявок на сотрудничество
  const updateCooperation = async (id: string | number, requestData: Partial<CooperationRequest>) => {
    try {
      const res = await fetch(apiUrl(`/admin/cooperation/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })
      if (res.ok) {
        loadDashboardData()
      } else {
        const errorData = await res.json().catch(() => ({}))
        setError(errorData.error || 'Ошибка обновления заявки')
      }
    } catch (err) {
      console.error('Ошибка обновления заявки на сотрудничество:', err)
      setError('Ошибка обновления заявки: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  const deleteCooperation = async (id: string | number) => {
    try {
      const res = await fetch(apiUrl(`/admin/cooperation/${id}`), { method: 'DELETE' })
      if (res.ok) {
        loadDashboardData()
      } else {
        const errorData = await res.json().catch(() => ({}))
        setError(errorData.error || 'Ошибка удаления заявки')
      }
    } catch (err) {
      console.error('Ошибка удаления заявки на сотрудничество:', err)
      setError('Ошибка удаления заявки: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
    }
  }

  // CRUD операции для категорий
  const loadCategories = async () => {
    try {
      const res = await fetch(apiUrl('/admin/categories'))
      if (res.ok) {
        const data = await res.json()
        setCategories(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      setError('Ошибка загрузки категорий')
    }
  }

  const createCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Название категории обязательно')
      return
    }
    
    try {
      const res = await fetch(apiUrl('/admin/categories'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() })
      })
      
      if (res.ok) {
        setError('')
        setNewCategoryName('')
        await loadCategories()
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Неизвестная ошибка' }))
        setError(errorData.error || 'Ошибка создания категории')
      }
    } catch (err) {
      setError('Ошибка создания категории')
    }
  }

  const updateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      setError('Название категории обязательно')
      return
    }
    
    try {
      const res = await fetch(apiUrl(`/admin/categories/${editingCategory.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingCategory.name.trim() })
      })
      
      if (res.ok) {
        setError('')
        setEditingCategory(null)
        await loadCategories()
        // Перезагружаем товары, так как категория могла измениться
        if (activeTab === 'products' || activeTab === 'ship-parts' || activeTab === 'fittings' || activeTab === 'heat-exchangers') {
          const productsRes = await fetch(apiUrl('/admin/products'))
          if (productsRes.ok) {
            const productsData = await productsRes.json()
            setProducts(Array.isArray(productsData) ? productsData : [])
          }
        }
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Неизвестная ошибка' }))
        setError(errorData.error || 'Ошибка обновления категории')
      }
    } catch (err) {
      setError('Ошибка обновления категории')
    }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию? Товары с этой категорией не будут удалены, но их категория будет сброшена.')) {
      return
    }
    
    try {
      const res = await fetch(apiUrl(`/admin/categories/${id}`), {
        method: 'DELETE'
      })
      
      if (res.ok) {
        setError('')
        await loadCategories()
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Неизвестная ошибка' }))
        setError(errorData.error || 'Ошибка удаления категории')
      }
    } catch (err) {
      setError('Ошибка удаления категории')
    }
  }

  // Функции для работы с настройками сайта
  const saveSiteSettings = async (settings: SiteSettings) => {
    try {
      const res = await fetch(apiUrl('/settings'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      if (res.ok) {
        setSiteSettings(settings)
        setError('')
        // Показываем уведомление об успешном сохранении
        alert('Настройки успешно сохранены!')
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Ошибка сохранения настроек')
      }
    } catch (err) {
      setError('Ошибка сохранения настроек')
    }
  }

  const saveSiteInfo = async (siteInfo: SiteSettings['siteInfo']) => {
    if (!siteSettings) return
    const updatedSettings = { ...siteSettings, siteInfo }
    await saveSiteSettings(updatedSettings)
  }

  const saveContacts = async (contacts: SiteSettings['contacts']) => {
    if (!siteSettings) return
    const updatedSettings = { ...siteSettings, contacts }
    await saveSiteSettings(updatedSettings)
  }

  // Excel функции
  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setExcelFile(file)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('excelFile', file)

      const res = await fetch(apiUrl('/excel/preview'), {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      if (res.ok) {
        setExcelPreview(data)
        setShowExcelUpload(true)
      } else {
        setError(data.error || 'Ошибка загрузки файла')
      }
    } catch (err) {
      setError('Ошибка загрузки файла')
    } finally {
      setLoading(false)
    }
  }

  const handleExcelImport = async () => {
    if (!excelFile) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('excelFile', excelFile)
      
      // Определяем вид на основе activeTab (название вкладки)
      const view = getViewForTab(activeTab)
      
      // Добавляем вид в FormData
      if (view) {
        formData.append('вид', view)
      }
      
      // Также передаем вид через query параметр на случай, если multer не обработает поле формы
      const url = view 
        ? apiUrl(`/excel/import?вид=${encodeURIComponent(view)}`)
        : apiUrl('/excel/import')

      const res = await fetch(url, {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      if (res.ok) {
        setShowExcelUpload(false)
        setExcelPreview(null)
        setExcelFile(null)
        setError('')
        // Очищаем товары перед перезагрузкой, чтобы избежать показа старых данных
        setProducts([])
        // Перезагружаем данные после успешного импорта
        await loadDashboardData()
      } else {
        setError(data.error || 'Ошибка импорта')
      }
    } catch (err) {
      setError('Ошибка импорта')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-2">
        <motion.div 
          className="bg-white rounded-lg shadow-xl w-full max-w-[98vw] h-[98vh] flex flex-col"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="bg-white border-b border-gray-200">
            <div className="px-3 sm:px-4">
              <div className="flex justify-between items-center py-1.5">
                <h1 className="text-lg font-semibold text-gray-900">Админ-панель</h1>
                <button
                  onClick={onClose}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto flex flex-col scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="px-3 sm:px-4 py-2">
              {/* Navigation Tabs - Mobile Style */}
              <div className="sticky top-0 bg-white border-b border-gray-200 mb-2 z-10">
                <div className="flex items-center justify-between py-1">
                  <button
                    onClick={() => setIsNavOpen(!isNavOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Menu className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {(() => {
                        const tabs = [
                          { id: 'dashboard', name: 'Дашборд', icon: BarChart3 },
                          { id: 'products', name: 'Товары', icon: Package },
                          { id: 'ship-parts', name: 'Судовые запчасти', icon: Package },
                          { id: 'fittings', name: 'Арматура', icon: Package },
                          { id: 'heat-exchangers', name: 'Теплообменники', icon: Package },
                          { id: 'categories', name: 'Категории', icon: Package },
                          { id: 'services', name: 'Услуги', icon: Wrench },
                          { id: 'contacts', name: 'Обратная связь', icon: MessageSquare },
                          { id: 'cooperation', name: 'Сотрудничество', icon: UserPlus },
                          { id: 'settings', name: 'Настройки сайта', icon: Settings },
                          { id: 'homepage', name: 'Главная страница', icon: Home },
                        ]
                        const currentTab = tabs.find(t => t.id === activeTab) || tabs[0]
                        return currentTab.name
                      })()}
                    </span>
                  </button>
                  {isNavOpen && (
                    <button
                      onClick={() => setIsNavOpen(false)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {isNavOpen && (
                  <div className="nav-dropdown border-t border-gray-200 bg-white">
                    <div className="py-1 max-h-96 overflow-y-auto">
                      {[
                        { id: 'dashboard', name: 'Дашборд', icon: BarChart3 },
                        { id: 'products', name: 'Товары', icon: Package },
                        { id: 'ship-parts', name: 'Судовые запчасти', icon: Package },
                        { id: 'fittings', name: 'Арматура', icon: Package },
                        { id: 'heat-exchangers', name: 'Теплообменники', icon: Package },
                        { id: 'categories', name: 'Категории', icon: Package },
                        { id: 'services', name: 'Услуги', icon: Wrench },
                        { id: 'contacts', name: 'Обратная связь', icon: MessageSquare },
                        { id: 'cooperation', name: 'Сотрудничество', icon: UserPlus },
                        { id: 'settings', name: 'Настройки сайта', icon: Settings },
                        { id: 'homepage', name: 'Главная страница', icon: Home },
                      ].map((tab) => {
                        const Icon = tab.icon
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setActiveTab(tab.id)
                              setIsNavOpen(false)
                            }}
                            className={`w-full flex items-center gap-2 py-1.5 px-3 text-sm transition-colors ${
                              activeTab === tab.id
                                ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {tab.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-2 p-2 bg-red-50 border-l-2 border-red-500 text-red-700 text-sm rounded">
                  {error}
                </div>
              )}

              {/* Loading State */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center">
                    <div className="wave-loader h-8 mb-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <span
                          key={index}
                          className="w-0.5 h-8 bg-gradient-to-t from-blue-600 to-blue-400 rounded"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-gray-600">Загрузка...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Dashboard Tab */}
                  {activeTab === 'dashboard' && stats && (
                    <div className="space-y-2">
                      <h2 className="text-base font-semibold text-gray-900">Общая статистика</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <div className="flex items-center">
                            <div className="p-1 bg-blue-100 rounded">
                              <Package className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="ml-2">
                              <p className="text-xs text-gray-500">Товары</p>
                              <p className="text-lg font-semibold text-gray-900">{stats.totalProducts}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <div className="flex items-center">
                            <div className="p-1 bg-green-100 rounded">
                              <Wrench className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="ml-2">
                              <p className="text-xs text-gray-500">Услуги</p>
                              <p className="text-lg font-semibold text-gray-900">{stats.totalServices}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <div className="flex items-center">
                            <div className="p-1 bg-yellow-100 rounded">
                              <MessageSquare className="w-4 h-4 text-yellow-600" />
                            </div>
                            <div className="ml-2">
                              <p className="text-xs text-gray-500">Контакты</p>
                              <p className="text-lg font-semibold text-gray-900">{stats.totalContacts}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <div className="flex items-center">
                            <div className="p-1 bg-purple-100 rounded">
                              <BarChart3 className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="ml-2">
                              <p className="text-xs text-gray-500">В наличии</p>
                              <p className="text-lg font-semibold text-gray-900">{stats.inStock}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Products Tab */}
                  {(activeTab === 'products' || activeTab === 'ship-parts' || activeTab === 'fittings' || activeTab === 'heat-exchangers') && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h2 className="text-base font-semibold text-gray-900">
                          {activeTab === 'products' ? 'Товары' : 
                           activeTab === 'ship-parts' ? 'Судовые запчасти' :
                           activeTab === 'fittings' ? 'Арматура' :
                           activeTab === 'heat-exchangers' ? 'Теплообменники' : 'Товары'}
                        </h2>
                        <div className="flex gap-2 flex-wrap">
                          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 cursor-pointer transition-colors">
                            <Upload className="w-4 h-4" />
                            Загрузить Excel
                            <input
                              type="file"
                              accept=".xlsx,.xls"
                              onChange={handleExcelUpload}
                              className="hidden"
                            />
                          </label>
                          <button
                            onClick={() => {
                              // Загружаем категории, если они еще не загружены
                              if (categories.length === 0) {
                                loadCategories()
                              }
                              // Определяем категорию для нового товара
                              const categoryForTab = getCategoryForTab(activeTab)
                              const defaultCategory = categoryForTab || (categories.length > 0 ? categories[0].name : '')
                              
                              // Открываем форму редактирования с новым товаром
                              setEditingProduct({
                                id: 'temp-' + Date.now(),
                                name: '',
                                description: '',
                                category: defaultCategory,
                                drawing: '',
                                image: '',
                                images: [],
                                unit: 'шт',
                                price: '',
                                quantity: 0,
                                inStock: false
                              })
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Добавить товар
                          </button>
                          {filteredProducts.length > 0 && (
                            <button
                              onClick={deleteAllProducts}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                              title="Удалить все товары на этой вкладке"
                            >
                              <Trash2 className="w-4 h-4" />
                              Удалить все товары
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="bg-white rounded-lg border overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b">
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              💡 Совет: Используйте горизонтальную прокрутку для просмотра всех колонок
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Поиск товаров..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              {searchQuery && (
                                <button
                                  onClick={() => setSearchQuery('')}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          {searchQuery && (
                            <div className="mt-2 text-sm text-gray-600">
                              Найдено товаров: <span className="font-semibold">{filteredProducts.length}</span>
                            </div>
                          )}
                        </div>
                        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] admin-table-scroll">
                          <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '1000px' }}>
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40 sticky left-0 bg-gray-50 z-10 border-r border-gray-200">Действия</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Количество</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Название</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Категория</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Цена</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Статус</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {filteredProducts.length === 0 && (
                                <tr>
                                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                    {searchQuery ? 'Товары не найдены' : 'Товары не загружены'}
                                  </td>
                                </tr>
                              )}
                              {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 group">
                                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium sticky left-0 bg-white group-hover:bg-gray-50 z-10 border-r border-gray-200">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => setEditingProduct({...product})}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors border border-blue-200 shadow-sm"
                                        title="Редактировать товар"
                                      >
                                        <Settings className="w-4 h-4" />
                                        <span className="text-xs font-medium">Изменить</span>
                                      </button>
                                    <button
                                      onClick={() => deleteProduct(product.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors border border-red-200 shadow-sm"
                                        title="Удалить товар"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                        <span className="text-xs font-medium">Удалить</span>
                                    </button>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{product.quantity} {product.unit}</td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{product.price} ₽</td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {product.inStock ? 'В наличии' : 'Нет в наличии'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Модальное окно редактирования товара */}
                      {editingProduct && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-semibold text-gray-900">Редактировать товар</h3>
                              <button
                                onClick={() => setEditingProduct(null)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X className="w-6 h-6" />
                              </button>
                            </div>
                            
                            <div className="space-y-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Название товара
                                </label>
                                <input
                                  type="text"
                                  value={editingProduct.name}
                                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Количество
                                  </label>
                                  <input
                                    type="number"
                                    value={editingProduct.quantity}
                                    onChange={(e) => setEditingProduct({...editingProduct, quantity: parseInt(e.target.value) || 0})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Единица измерения
                                  </label>
                                  <select
                                    value={editingProduct.unit}
                                    onChange={(e) => setEditingProduct({...editingProduct, unit: e.target.value as 'шт' | 'к-т' | 'пара'})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                  >
                                    <option value="шт">шт</option>
                                    <option value="к-т">к-т</option>
                                    <option value="пара">пара</option>
                                  </select>
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Цена (₽)
                                </label>
                                <input
                                  type="text"
                                  value={editingProduct.price}
                                  onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Категория
                                </label>
                                <div className="flex gap-2">
                                  <select
                                    value={editingProduct.category}
                                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                    disabled={!!getCategoryForTab(activeTab)} // Блокируем изменение категории на вкладках категорий
                                  >
                                    <option value="">Выберите категорию</option>
                                    <option value="Судовые запчасти">Судовые запчасти</option>
                                    <option value="Арматура">Арматура</option>
                                    <option value="Теплообменники">Теплообменники</option>
                                    {categories.map((cat) => (
                                      <option key={cat.id} value={cat.name}>
                                        {cat.name}
                                      </option>
                                    ))}
                                  </select>
                                  {!getCategoryForTab(activeTab) && (
                                    <input
                                      type="text"
                                      placeholder="Или введите новую"
                                      value={editingProduct.category && !categories.find(c => c.name === editingProduct.category) && !['Судовые запчасти', 'Арматура', 'Теплообменники'].includes(editingProduct.category) ? editingProduct.category : ''}
                                      onChange={(e) => {
                                        const newValue = e.target.value
                                        if (!categories.find(c => c.name === newValue) && !['Судовые запчасти', 'Арматура', 'Теплообменники'].includes(newValue)) {
                                          setEditingProduct({...editingProduct, category: newValue})
                                        }
                                      }}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                    />
                                  )}
                                </div>
                                {getCategoryForTab(activeTab) && (
                                  <p className="mt-1 text-xs text-gray-500">
                                    Категория зафиксирована: {getCategoryForTab(activeTab)}
                                  </p>
                                )}
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Описание
                                </label>
                                <textarea
                                  value={editingProduct.description}
                                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Чертеж (URL или путь к файлу)
                                </label>
                                <input
                                  type="text"
                                  value={editingProduct.drawing || ''}
                                  onChange={(e) => setEditingProduct({...editingProduct, drawing: e.target.value})}
                                  placeholder="Введите URL или путь к чертежу"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Фото товара
                                </label>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Загрузить файл
                                  </label>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0]
                                      if (!file) return
                                      
                                      if (!file.type.startsWith('image/')) {
                                        setError('Пожалуйста, выберите файл изображения')
                                        return
                                      }
                                      
                                      if (file.size > 5 * 1024 * 1024) {
                                        setError('Размер файла не должен превышать 5MB')
                                        return
                                      }
                                      
                                      const formData = new FormData()
                                      formData.append('image', file)
                                      
                                      try {
                                        const res = await fetch(apiUrl('/upload/image'), {
                                          method: 'POST',
                                          body: formData
                                        })
                                        
                                        if (res.ok) {
                                          const data = await res.json()
                                          setEditingProduct({
                                            ...editingProduct,
                                            image: `${getApiUrl()}${data.url}`
                                          })
                                          setError('')
                                        } else {
                                          const errorData = await res.json()
                                          setError(errorData.error || 'Ошибка загрузки изображения')
                                        }
                                      } catch (err) {
                                        setError('Ошибка загрузки изображения')
                                        console.error('Ошибка загрузки изображения товара:', err)
                                      }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
                                  />
                                  <p className="mt-1 text-xs text-gray-500">
                                    Максимальный размер: 5MB. Форматы: JPG, PNG, GIF, WebP
                                  </p>
                                  {editingProduct.image && (
                                    <div className="mt-3">
                                      <label className="block text-xs text-gray-600 mb-1">
                                        Предпросмотр
                                      </label>
                                      <div className="relative border border-gray-300 rounded-md p-2 bg-gray-50">
                                        <img
                                          src={editingProduct.image}
                                          alt="Предпросмотр"
                                          className="max-w-full h-auto max-h-48 mx-auto rounded-md"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement
                                            target.style.display = 'none'
                                          }}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => setEditingProduct({...editingProduct, image: ''})}
                                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                          title="Удалить фото"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Дополнительные фотографии для галереи */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Дополнительные фотографии для галереи (до 10 шт)
                                </label>
                                <div className="space-y-2">
                                  {/* Существующие фотографии */}
                                  {editingProduct.images && editingProduct.images.length > 0 && (
                                    <div className="grid grid-cols-5 gap-3">
                                      {editingProduct.images.map((img, index) => (
                                        <div key={index} className="relative">
                                          <img 
                                            src={img} 
                                            alt={`Дополнительное фото ${index + 1}`}
                                            className="w-full h-24 object-cover border border-gray-300 rounded"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => removeAdditionalImage(index)}
                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                            title="Удалить фото"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                          <div className="mt-1">
                                            <input
                                              type="file"
                                              accept="image/*"
                                              onChange={(e) => handleAdditionalImageUpload(e, index)}
                                              className="w-full text-xs"
                                              title="Заменить фото"
                                            />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {/* Кнопка добавления новой фотографии */}
                                  {(!editingProduct.images || editingProduct.images.length < 10) && (
                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">
                                        Добавить новую фотографию ({editingProduct.images?.length || 0}/10)
                                      </label>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAdditionalImageUpload}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
                                      />
                                    </div>
                                  )}
                                  
                                  {editingProduct.images && editingProduct.images.length >= 10 && (
                                    <p className="text-sm text-gray-500">
                                      Достигнут лимит в 10 дополнительных фотографий
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="bg-blue-50 p-3 rounded-md">
                                <p className="text-sm text-blue-800">
                                  💡 <strong>Статус наличия</strong> определяется автоматически: 
                                  товар будет "В наличии", если количество {'>'} 0 и цена {'>'} 0
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-6">
                              <button
                                onClick={() => setEditingProduct(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                              >
                                Отмена
                              </button>
                              <button
                                onClick={saveProductEdit}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                              >
                                Сохранить
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Categories Tab */}
                  {activeTab === 'categories' && (() => {
                    // Определяем категории для каждой вкладки
                    const tabCategories = [
                      { 
                        tabName: 'Все товары', 
                        tabId: 'products',
                        products: products // Товары уже загружены для нужной вкладки
                      },
                      { 
                        tabName: 'Судовые запчасти', 
                        tabId: 'ship-parts',
                        products: products // Товары уже загружены для нужной вкладки
                      },
                      { 
                        tabName: 'Арматура', 
                        tabId: 'fittings',
                        products: products // Товары уже загружены для нужной вкладки
                      },
                      { 
                        tabName: 'Теплообменники', 
                        tabId: 'heat-exchangers',
                        products: products // Товары уже загружены для нужной вкладки
                      }
                    ]

                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h2 className="text-base font-semibold text-gray-900">Категории товаров</h2>
                          <div className="flex gap-2">
                            <button
                              onClick={loadDashboardData}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            >
                              <Settings className="w-4 h-4" />
                              Обновить
                            </button>
                          </div>
                        </div>

                        {/* Список категорий по вкладкам */}
                        {tabCategories.map(({ tabName, tabId, products: tabProducts }) => {
                          // Получаем уникальные категории товаров для этой вкладки
                          const categoriesSet = new Set<string>()
                          tabProducts.forEach(p => {
                            if (p.category) {
                              categoriesSet.add(p.category)
                            }
                          })
                          const categories = Array.from(categoriesSet).sort()
                          
                          return (
                            <div key={tabId} className="bg-white rounded-lg border overflow-hidden">
                              <div className="px-6 py-4 bg-gray-50 border-b">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {tabName}
                                  <span className="ml-2 text-sm font-normal text-gray-500">
                                    ({categories.length} категорий, {tabProducts.length} товаров)
                                  </span>
                                </h3>
                              </div>
                              <div className="overflow-x-auto">
                                {categories.length === 0 ? (
                                  <div className="px-6 py-4 text-center text-gray-500">
                                    Категории не найдены для этой вкладки
                                  </div>
                                ) : (
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категория</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Количество товаров</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {categories.map((category) => {
                                        const categoryProducts = tabProducts.filter(p => p.category === category)
                                        return (
                                          <tr key={`${tabId}-${category}`} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                              {category}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                              {categoryProducts.length} товар(ов)
                                            </td>
                                          </tr>
                                        )
                                      })}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}

                  {/* Services Tab */}
                  {activeTab === 'services' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                        <h2 className="text-base font-semibold text-gray-900">Услуги</h2>
                          {services.length > 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                              Всего услуг: {services.length}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                        <button
                            onClick={() => loadDashboardData()}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            title="Обновить список услуг"
                          >
                            <Settings className="w-4 h-4" />
                            Обновить
                          </button>
                        <button
                          onClick={() => {
                            // Создаем временную услугу для редактирования
                            const tempService: Service = {
                              id: 'temp-' + Date.now(),
                              name: '',
                            description: '',
                              price: '',
                              executionTime: ''
                            }
                            setEditingService(tempService)
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4" />
                          Добавить услугу
                        </button>
                        </div>
                      </div>

                      {loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-gray-600">Загрузка услуг...</p>
                        </div>
                      ) : (
                      <div className="bg-white rounded-lg border overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border-r border-gray-200">Действия</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Время выполнения</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {services.length === 0 ? (
                                  <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                      Услуги не найдены. Нажмите "Добавить услугу" для создания новой услуги.
                                  </td>
                                  </tr>
                                ) : (
                                  services.map((service) => (
                                <tr key={service.id} className="hover:bg-gray-50 group">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky left-0 bg-white group-hover:bg-gray-50 z-10 border-r border-gray-200">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={async () => {
                                          // Загружаем полные данные услуги с изображениями и видео
                                          try {
                                            const res = await fetch(apiUrl(`/admin/services/${service.id}/full`))
                                            if (res.ok) {
                                              const fullService = await res.json()
                                              setEditingService(fullService)
                                            } else {
                                              // Если не удалось загрузить полные данные, используем упрощенную версию
                                              setEditingService({...service})
                                            }
                                          } catch (err) {
                                            console.error('Ошибка загрузки полных данных услуги:', err)
                                            // Используем упрощенную версию в случае ошибки
                                            setEditingService({...service})
                                          }
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors border border-blue-200 shadow-sm"
                                        title="Редактировать услугу"
                                      >
                                        <Settings className="w-4 h-4" />
                                        <span className="text-xs font-medium">Изменить</span>
                                      </button>
                                    <button
                                      onClick={() => deleteService(service.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors border border-red-200 shadow-sm"
                                        title="Удалить услугу"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                        <span className="text-xs font-medium">Удалить</span>
                                    </button>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.name}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.price} ₽</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.executionTime || '-'}</td>
                                </tr>
                              ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      )}

                      {/* Модальное окно редактирования услуги */}
                      {editingService && (
                        <div className="fixed inset-0 z-50 overflow-y-auto">
                          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setEditingService(null)}></div>
                          <div className="flex items-center justify-center min-h-screen p-4">
                            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto relative z-10">
                              <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                  <h3 className="text-xl font-semibold text-gray-900">
                                    {editingService.id.startsWith('temp-') ? 'Создание новой услуги' : 'Редактирование услуги'}
                                  </h3>
                                  <button
                                    onClick={() => {
                                      setEditingService(null)
                                      setError('')
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <X className="w-6 h-6" />
                                  </button>
                                </div>

                                {error && (
                                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm text-red-600">{error}</p>
                                  </div>
                                )}

                                <div className="space-y-2">
                                  {/* Наименование услуги */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Наименование услуги *
                                    </label>
                                    <input
                                      type="text"
                                      value={editingService.name}
                                      onChange={(e) => setEditingService({...editingService, name: e.target.value})}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                                      placeholder="Введите наименование услуги"
                                    />
                                  </div>

                                  {/* Описание услуги */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Описание услуги *
                                    </label>
                                    <textarea
                                      value={editingService.description}
                                      onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                                      rows={4}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                                      placeholder="Введите описание услуги"
                                    />
                                  </div>

                                  {/* Цена услуги */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Цена услуги *
                                    </label>
                                    <input
                                      type="text"
                                      value={editingService.price}
                                      onChange={(e) => setEditingService({...editingService, price: e.target.value})}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                                      placeholder="0"
                                    />
                                  </div>

                                  {/* Примерное время выполнения */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Примерное время выполнения
                                    </label>
                                    <input
                                      type="text"
                                      value={editingService.executionTime}
                                      onChange={(e) => setEditingService({...editingService, executionTime: e.target.value})}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                                      placeholder="Например: 2-3 часа, 1 день и т.д."
                                    />
                                  </div>

                                  {/* Фото услуги */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Фото услуги (JPEG, PNG)
                                    </label>
                                    <input
                                      type="file"
                                      accept="image/jpeg,image/png"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0]
                                        if (!file) return
                                        
                                        if (!['image/jpeg', 'image/png'].includes(file.type)) {
                                          setError('Пожалуйста, выберите файл JPEG или PNG')
                                          return
                                        }
                                        
                                        if (file.size > 5 * 1024 * 1024) {
                                          setError('Размер файла не должен превышать 5MB')
                                          return
                                        }
                                        
                                        const formData = new FormData()
                                        formData.append('image', file)
                                        
                                        try {
                                          const res = await fetch(apiUrl('/upload/image'), {
                                            method: 'POST',
                                            body: formData
                                          })
                                          
                                          if (res.ok) {
                                            const data = await res.json()
                                            setEditingService({
                                              ...editingService,
                                              image: `${getApiUrl()}${data.url}`
                                            })
                                            setError('')
                                          } else {
                                            const errorData = await res.json()
                                            setError(errorData.error || 'Ошибка загрузки изображения')
                                          }
                                        } catch (err) {
                                          setError('Ошибка загрузки изображения')
                                          console.error('Ошибка загрузки изображения услуги:', err)
                                        }
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                      Максимальный размер: 5MB. Форматы: JPEG, PNG
                                    </p>
                                    {editingService.image && editingService.image.trim() !== '' && (
                                      <div className="mt-2">
                                        <img 
                                          src={editingService.image} 
                                          alt="Превью фото" 
                                          className="h-32 w-32 object-cover border border-gray-300 rounded"
                                          onError={(e) => {
                                            console.error('Ошибка загрузки изображения услуги:', editingService.image)
                                            e.currentTarget.style.display = 'none'
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>

                                  {/* Видео */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Видео (MP4, WebM) или изображение (JPEG, PNG)
                                    </label>
                                    <input
                                      type="file"
                                      accept="image/jpeg,image/png,video/mp4,video/webm"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0]
                                        if (!file) return
                                        
                                        const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/webm']
                                        if (!allowedTypes.includes(file.type)) {
                                          setError('Пожалуйста, выберите файл JPEG, PNG, MP4 или WebM')
                                          return
                                        }
                                        
                                        const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 5 * 1024 * 1024
                                        if (file.size > maxSize) {
                                          setError(`Размер файла не должен превышать ${maxSize / (1024 * 1024)}MB`)
                                          return
                                        }
                                        
                                        // Для видео используем base64, для изображений - загрузка на сервер
                                        if (file.type.startsWith('video/')) {
                                          const reader = new FileReader()
                                          reader.onload = (e) => {
                                            setEditingService({
                                              ...editingService,
                                              video: e.target?.result as string
                                            })
                                            setError('')
                                          }
                                          reader.onerror = () => {
                                            setError('Ошибка чтения файла')
                                          }
                                          reader.readAsDataURL(file)
                                        } else {
                                          const formData = new FormData()
                                          formData.append('image', file)
                                          
                                          try {
                                            const res = await fetch(apiUrl('/upload/image'), {
                                              method: 'POST',
                                              body: formData
                                            })
                                            
                                            if (res.ok) {
                                              const data = await res.json()
                                              setEditingService({
                                                ...editingService,
                                                video: `${getApiUrl()}${data.url}`
                                              })
                                              setError('')
                                            } else {
                                              const errorData = await res.json()
                                              setError(errorData.error || 'Ошибка загрузки изображения')
                                            }
                                          } catch (err) {
                                            setError('Ошибка загрузки изображения')
                                            console.error('Ошибка загрузки изображения услуги:', err)
                                          }
                                        }
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                      Максимальный размер: 5MB для изображений, 50MB для видео. Форматы: JPEG, PNG, MP4, WebM
                                    </p>
                                    {editingService.video && editingService.video.trim() !== '' && (
                                      <div className="mt-2">
                                        {editingService.video.startsWith('data:video') || editingService.video.includes('.mp4') || editingService.video.includes('.webm') ? (
                                          <video 
                                            src={editingService.video} 
                                            controls
                                            className="h-48 w-full object-cover border border-gray-300 rounded"
                                            onError={(e) => {
                                              console.error('Ошибка загрузки видео услуги:', editingService.video)
                                              e.currentTarget.style.display = 'none'
                                            }}
                                          />
                                        ) : (
                                          <img 
                                            src={editingService.video} 
                                            alt="Превью видео" 
                                            className="h-32 w-32 object-cover border border-gray-300 rounded"
                                            onError={(e) => {
                                              console.error('Ошибка загрузки изображения видео услуги:', editingService.video)
                                              e.currentTarget.style.display = 'none'
                                            }}
                                          />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                  <button
                                    onClick={() => setEditingService(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                  >
                                    Отмена
                                  </button>
                                  <button
                                    onClick={saveServiceEdit}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                  >
                                    Сохранить
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contacts Tab */}
                  {activeTab === 'contacts' && (
                    <div className="space-y-2">
                      <h2 className="text-base font-semibold text-gray-900">Обратная связь</h2>

                      <div className="bg-white rounded-lg border overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Телефон</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Интересующие товары</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {contacts.length === 0 ? (
                                <tr>
                                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    Нет заявок
                                  </td>
                                </tr>
                              ) : (
                                contacts.map((contact) => (
                                <tr key={contact.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString('ru-RU') : '-'}
                                    </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contact.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.email || '-'}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.phone}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{contact.message || '-'}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={contact.status || 'new'}
                                        onChange={(e) => {
                                          const newStatus = e.target.value as 'new' | 'in_progress' | 'completed'
                                          updateContact(String(contact.id), { status: newStatus })
                                        }}
                                        className={`text-xs font-semibold rounded px-2 py-1 border ${
                                          contact.status === 'new' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                          contact.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                          'bg-green-100 text-green-800 border-green-300'
                                      }`}
                                    >
                                      <option value="new">Новое</option>
                                      <option value="in_progress">В работе</option>
                                      <option value="completed">Завершено</option>
                                    </select>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => {
                                          if (confirm('Вы уверены, что хотите удалить эту заявку?')) {
                                            deleteContact(String(contact.id))
                                          }
                                        }}
                                        className="text-red-600 hover:text-red-900 transition-colors"
                                        title="Удалить заявку"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cooperation Tab */}
                  {activeTab === 'cooperation' && (
                    <div className="space-y-2">
                      <h2 className="text-base font-semibold text-gray-900">Заявки на сотрудничество</h2>

                      <div className="bg-white rounded-lg border overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Способы связи</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Предлагаемые позиции/услуги</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {cooperation.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    Нет заявок на сотрудничество
                                  </td>
                                </tr>
                              ) : (
                                cooperation.map((request) => (
                                  <tr key={request.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {request.createdAt ? new Date(request.createdAt).toLocaleDateString('ru-RU') : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.contact || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{request.positions || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <select
                                        value={request.status || 'new'}
                                        onChange={(e) => {
                                          const newStatus = e.target.value as 'new' | 'in_progress' | 'completed'
                                          updateCooperation(String(request.id), { status: newStatus })
                                        }}
                                        className={`text-xs font-semibold rounded px-2 py-1 border ${
                                          request.status === 'new' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                          request.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                          'bg-green-100 text-green-800 border-green-300'
                                        }`}
                                      >
                                        <option value="new">Новое</option>
                                        <option value="in_progress">В работе</option>
                                        <option value="completed">Завершено</option>
                                      </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                      <button
                                        onClick={() => {
                                          if (confirm('Вы уверены, что хотите удалить эту заявку?')) {
                                            deleteCooperation(String(request.id))
                                          }
                                        }}
                                        className="text-red-600 hover:text-red-900 transition-colors"
                                        title="Удалить заявку"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Settings Tab */}
                  {activeTab === 'settings' && (
                    <div className="space-y-2">
                      <h2 className="text-base font-semibold text-gray-900">Настройки сайта</h2>
                      
                      {!siteSettings ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-gray-600">Загрузка настроек...</p>
                        </div>
                      ) : !siteSettings.contacts ? (
                        <div className="text-center py-8">
                          <p className="text-red-600">Ошибка загрузки контактной информации</p>
                        </div>
                      ) : (
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <h3 className="text-sm font-medium text-gray-900 mb-2">Контактная информация</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                              <input
                                type="text"
                                value={siteSettings.contacts.phone}
                                onChange={(e) => setSiteSettings(prev => prev ? {
                                  ...prev,
                                  contacts: { ...prev.contacts, phone: e.target.value }
                                } : null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                              <input
                                type="email"
                                value={siteSettings.contacts.email}
                                onChange={(e) => setSiteSettings(prev => prev ? {
                                  ...prev,
                                  contacts: { ...prev.contacts, email: e.target.value }
                                } : null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
                              <input
                                type="text"
                                value={siteSettings.contacts.address}
                                onChange={(e) => setSiteSettings(prev => prev ? {
                                  ...prev,
                                  contacts: { ...prev.contacts, address: e.target.value }
                                } : null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Режим работы</label>
                              <input
                                type="text"
                                value={siteSettings.contacts.workingHours}
                                onChange={(e) => setSiteSettings(prev => prev ? {
                                  ...prev,
                                  contacts: { ...prev.contacts, workingHours: e.target.value }
                                } : null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Местоположение</label>
                              <input
                                type="text"
                                value={siteSettings.contacts.location}
                                onChange={(e) => setSiteSettings(prev => prev ? {
                                  ...prev,
                                  contacts: { ...prev.contacts, location: e.target.value }
                                } : null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Telegram</label>
                              <input
                                type="text"
                                value={siteSettings.contacts.telegram}
                                onChange={(e) => setSiteSettings(prev => prev ? {
                                  ...prev,
                                  contacts: { ...prev.contacts, telegram: e.target.value }
                                } : null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                                placeholder="@username или ссылка на Telegram"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                              <input
                                type="text"
                                value={siteSettings.contacts.whatsapp}
                                onChange={(e) => setSiteSettings(prev => prev ? {
                                  ...prev,
                                  contacts: { ...prev.contacts, whatsapp: e.target.value }
                                } : null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                                placeholder="+7 (999) 123-45-67"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Другие способы связи</label>
                              <input
                                type="text"
                                value={siteSettings.contacts.otherContacts}
                                onChange={(e) => setSiteSettings(prev => prev ? {
                                  ...prev,
                                  contacts: { ...prev.contacts, otherContacts: e.target.value }
                                } : null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                                placeholder="Дополнительные способы связи"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => saveContacts(siteSettings.contacts)}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Сохранить контакты
                          </button>
                        </div>
                      )}

                      {/* Заголовки и подзаголовки страниц */}
                      {siteSettings && (
                        <div className="bg-white p-3 rounded-lg border mt-3">
                          <h3 className="text-sm font-medium text-gray-900 mb-2">Заголовки и подзаголовки страниц</h3>
                          <div className="space-y-2">
                            {/* Все товары */}
                            <div className="border-b pb-4">
                              <h4 className="text-md font-semibold text-gray-800 mb-3">Все товары</h4>
                              <div className="space-y-2">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
                                  <input
                                    type="text"
                                    value={siteSettings.pageTitles?.products?.title || 'Наши товары'}
                                  onChange={(e) => setSiteSettings(prev => prev ? {
                                    ...prev,
                                    pageTitles: {
                                      ...prev.pageTitles,
                                      products: {
                                        ...(prev.pageTitles?.products || { title: 'Наши товары', subtitle: '' }),
                                        title: e.target.value
                                      }
                                    }
                                  } : null)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Подзаголовок</label>
                                <textarea
                                  value={siteSettings.pageTitles?.products?.subtitle || ''}
                                  onChange={(e) => setSiteSettings(prev => prev ? {
                                    ...prev,
                                    pageTitles: {
                                      ...prev.pageTitles,
                                      products: {
                                        ...(prev.pageTitles?.products || { title: 'Наши товары', subtitle: '' }),
                                        subtitle: e.target.value
                                      }
                                    }
                                  } : null)}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Судовые запчасти */}
                          <div className="border-b pb-4">
                            <h4 className="text-md font-semibold text-gray-800 mb-3">Судовые запчасти</h4>
                            <div className="space-y-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
                                <input
                                  type="text"
                                  value={siteSettings.pageTitles?.shipParts?.title || 'Судовые запчасти'}
                                  onChange={(e) => setSiteSettings(prev => prev ? {
                                    ...prev,
                                    pageTitles: {
                                      ...prev.pageTitles,
                                      shipParts: {
                                        ...(prev.pageTitles?.shipParts || { title: 'Судовые запчасти', subtitle: '' }),
                                        title: e.target.value
                                      }
                                    }
                                  } : null)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Подзаголовок</label>
                                <textarea
                                  value={siteSettings.pageTitles?.shipParts?.subtitle || ''}
                                  onChange={(e) => setSiteSettings(prev => prev ? {
                                    ...prev,
                                    pageTitles: {
                                      ...prev.pageTitles,
                                      shipParts: {
                                        ...(prev.pageTitles?.shipParts || { title: 'Судовые запчасти', subtitle: '' }),
                                        subtitle: e.target.value
                                      }
                                    }
                                  } : null)}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Арматура */}
                          <div className="border-b pb-4">
                            <h4 className="text-md font-semibold text-gray-800 mb-3">Арматура</h4>
                            <div className="space-y-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
                                <input
                                  type="text"
                                  value={siteSettings.pageTitles?.fittings?.title || 'Арматура'}
                                  onChange={(e) => setSiteSettings(prev => prev ? {
                                    ...prev,
                                    pageTitles: {
                                      ...prev.pageTitles,
                                      fittings: {
                                        ...(prev.pageTitles?.fittings || { title: 'Арматура', subtitle: '' }),
                                        title: e.target.value
                                      }
                                    }
                                  } : null)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Подзаголовок</label>
                                <textarea
                                  value={siteSettings.pageTitles?.fittings?.subtitle || ''}
                                  onChange={(e) => setSiteSettings(prev => prev ? {
                                    ...prev,
                                    pageTitles: {
                                      ...prev.pageTitles,
                                      fittings: {
                                        ...(prev.pageTitles?.fittings || { title: 'Арматура', subtitle: '' }),
                                        subtitle: e.target.value
                                      }
                                    }
                                  } : null)}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Теплообменники */}
                          <div className="border-b pb-4">
                            <h4 className="text-md font-semibold text-gray-800 mb-3">Теплообменники</h4>
                            <div className="space-y-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
                                <input
                                  type="text"
                                  value={siteSettings.pageTitles?.heatExchangers?.title || 'Теплообменники'}
                                  onChange={(e) => setSiteSettings(prev => prev ? {
                                    ...prev,
                                    pageTitles: {
                                      ...prev.pageTitles,
                                      heatExchangers: {
                                        ...(prev.pageTitles?.heatExchangers || { title: 'Теплообменники', subtitle: '' }),
                                        title: e.target.value
                                      }
                                    }
                                  } : null)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Подзаголовок</label>
                                <textarea
                                  value={siteSettings.pageTitles?.heatExchangers?.subtitle || ''}
                                  onChange={(e) => setSiteSettings(prev => prev ? {
                                    ...prev,
                                    pageTitles: {
                                      ...prev.pageTitles,
                                      heatExchangers: {
                                        ...(prev.pageTitles?.heatExchangers || { title: 'Теплообменники', subtitle: '' }),
                                        subtitle: e.target.value
                                      }
                                    }
                                  } : null)}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Услуги */}
                          <div className="border-b pb-4">
                            <h4 className="text-md font-semibold text-gray-800 mb-3">Услуги</h4>
                            <div className="space-y-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
                                <input
                                  type="text"
                                  value={siteSettings.pageTitles?.services?.title || 'Наши услуги'}
                                  onChange={(e) => setSiteSettings(prev => prev ? {
                                    ...prev,
                                    pageTitles: {
                                      ...prev.pageTitles,
                                      services: {
                                        ...(prev.pageTitles?.services || { title: 'Наши услуги', subtitle: '' }),
                                        title: e.target.value
                                      }
                                    }
                                  } : null)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Подзаголовок</label>
                                <textarea
                                  value={siteSettings.pageTitles?.services?.subtitle || ''}
                                  onChange={(e) => setSiteSettings(prev => prev ? {
                                    ...prev,
                                    pageTitles: {
                                      ...prev.pageTitles,
                                      services: {
                                        ...(prev.pageTitles?.services || { title: 'Наши услуги', subtitle: '' }),
                                        subtitle: e.target.value
                                      }
                                    }
                                  } : null)}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Контакты */}
                          <div className="pb-4">
                            <h4 className="text-md font-semibold text-gray-800 mb-3">Контакты</h4>
                            <div className="space-y-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
                                <input
                                  type="text"
                                  value={siteSettings.pageTitles?.contact?.title || 'Контакты'}
                                  onChange={(e) => setSiteSettings(prev => prev ? {
                                    ...prev,
                                    pageTitles: {
                                      ...prev.pageTitles,
                                      contact: {
                                        ...(prev.pageTitles?.contact || { title: 'Контакты', subtitle: '' }),
                                        title: e.target.value
                                      }
                                    }
                                  } : null)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Подзаголовок</label>
                                <textarea
                                  value={siteSettings.pageTitles?.contact?.subtitle || ''}
                                  onChange={(e) => setSiteSettings(prev => prev ? {
                                    ...prev,
                                    pageTitles: {
                                      ...prev.pageTitles,
                                      contact: {
                                        ...(prev.pageTitles?.contact || { title: 'Контакты', subtitle: '' }),
                                        subtitle: e.target.value
                                      }
                                    }
                                  } : null)}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                              </div>
                            </div>
                          </div>

                            <button
                              onClick={() => saveSiteSettings(siteSettings)}
                              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Сохранить заголовки страниц
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Homepage Tab */}
                  {activeTab === 'homepage' && (
                    <div className="space-y-2">
                      <h2 className="text-base font-semibold text-gray-900">Главная страница</h2>
                      
                      {!siteSettings ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-gray-600">Загрузка настроек...</p>
                        </div>
                      ) : !siteSettings.siteInfo ? (
                        <div className="text-center py-8">
                          <p className="text-red-600">Ошибка загрузки информации о компании</p>
                        </div>
                      ) : (
                        <>
                        {/* Настройки компании */}
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <h3 className="text-sm font-medium text-gray-900 mb-2">Настройки компании</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Название компании</label>
                              <input
                                type="text"
                                value={siteSettings.company?.name || ''}
                                onChange={(e) => setSiteSettings(prev => prev ? {
                                  ...prev,
                                  company: { 
                                    ...(prev.company || { name: '', logo: '', tagline: '' }),
                                    name: e.target.value
                                  }
                                } : null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                                placeholder="Название компании"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Слоган</label>
                              <input
                                type="text"
                                value={siteSettings.company?.tagline || ''}
                                onChange={(e) => setSiteSettings(prev => prev ? {
                                  ...prev,
                                  company: { 
                                    ...(prev.company || { name: '', logo: '', tagline: '' }),
                                    tagline: e.target.value
                                  }
                                } : null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                                placeholder="Слоган компании"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Логотип</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0]
                                  if (!file) return
                                  
                                  if (!file.type.startsWith('image/')) {
                                    setError('Пожалуйста, выберите файл изображения')
                                    return
                                  }
                                  
                                  if (file.size > 5 * 1024 * 1024) {
                                    setError('Размер файла не должен превышать 5MB')
                                    return
                                  }
                                  
                                  const formData = new FormData()
                                  formData.append('image', file)
                                  
                                  try {
                                    const res = await fetch(apiUrl('/upload/image'), {
                                      method: 'POST',
                                      body: formData
                                    })
                                    
                                    if (res.ok) {
                                      const data = await res.json()
                                      // Сохраняем относительный путь для использования через Next.js proxy
                                      const logoUrl = data.url // Используем относительный путь /uploads/images/...
                                      console.log('Логотип загружен, URL:', logoUrl)
                                      
                                      const updatedSettings = siteSettings ? {
                                        ...siteSettings,
                                        company: { 
                                          ...(siteSettings.company || { name: '', logo: '', tagline: '' }),
                                          logo: logoUrl
                                        }
                                      } : null
                                      
                                      setSiteSettings(updatedSettings)
                                      setError('')
                                      
                                      // Автоматически сохраняем настройки после загрузки логотипа
                                      if (updatedSettings) {
                                        try {
                                          const saveRes = await fetch(apiUrl('/settings'), {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(updatedSettings)
                                          })
                                          
                                          if (saveRes.ok) {
                                            console.log('Настройки с логотипом сохранены')
                                            alert('Логотип загружен и сохранен! Страница будет перезагружена.')
                                            // Перезагружаем страницу для обновления логотипа
                                            setTimeout(() => {
                                              window.location.reload()
                                            }, 500)
                                          } else {
                                            const errorData = await saveRes.json()
                                            setError(errorData.error || 'Ошибка сохранения настроек')
                                          }
                                        } catch (saveErr) {
                                          console.error('Ошибка сохранения настроек:', saveErr)
                                          setError('Ошибка сохранения настроек')
                                        }
                                      }
                                    } else {
                                      const errorData = await res.json()
                                      setError(errorData.error || 'Ошибка загрузки изображения')
                                    }
                                  } catch (err) {
                                    setError('Ошибка загрузки изображения')
                                    console.error('Ошибка загрузки логотипа:', err)
                                  }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
                              />
                              <p className="mt-1 text-xs text-gray-500">
                                Максимальный размер: 5MB. Форматы: JPG, PNG, GIF, WebP
                              </p>
                              {siteSettings.company?.logo && (
                                <div className="mt-2">
                                  <img 
                                    src={siteSettings.company.logo} 
                                    alt="Логотип" 
                                    className="h-16 w-16 object-contain border border-gray-300 rounded"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              if (siteSettings.company) {
                                console.log('Сохранение настроек компании:', siteSettings.company)
                                const res = await fetch(apiUrl('/settings'), {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    ...siteSettings,
                                    company: siteSettings.company
                                  })
                                })
                                if (res.ok) {
                                  const savedData = await res.json()
                                  console.log('Настройки сохранены, ответ сервера:', savedData)
                                  alert('Настройки компании сохранены! Страница будет перезагружена.')
                                  // Перезагружаем настройки для обновления на сайте
                                  setTimeout(() => {
                                    window.location.reload()
                                  }, 500)
                                } else {
                                  const errorData = await res.json()
                                  console.error('Ошибка сохранения настроек:', errorData)
                                  setError(errorData.error || 'Ошибка сохранения настроек')
                                }
                              }
                            }}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Сохранить настройки компании
                          </button>
                        </div>

                        {/* Информация о главной странице */}
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <h3 className="text-sm font-medium text-gray-900 mb-2">Информация о компании</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
                              <input
                                type="text"
                                value={siteSettings.siteInfo.title}
                                onChange={(e) => setSiteSettings(prev => prev ? {
                                  ...prev,
                                  siteInfo: { ...prev.siteInfo, title: e.target.value }
                                } : null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                              <textarea
                                value={siteSettings.siteInfo.description || ''}
                                onChange={(e) => setSiteSettings(prev => prev ? {
                                  ...prev,
                                  siteInfo: { ...prev.siteInfo, description: e.target.value }
                                } : null)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                                placeholder="Подробное описание компании и услуг"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Статистика (каждая строка - отдельный пункт)</label>
                              <textarea
                                value={Array.isArray(siteSettings.siteInfo.statistics) 
                                  ? siteSettings.siteInfo.statistics.join('\n') 
                                  : ''}
                                onChange={(e) => {
                                  const lines = e.target.value.split('\n')
                                  setSiteSettings(prev => prev ? {
                                  ...prev,
                                  siteInfo: { 
                                    ...prev.siteInfo, 
                                      statistics: lines
                                  }
                                  } : null)
                                }}
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 resize-y whitespace-pre-wrap"
                                placeholder="Более 1000 товаров в каталоге&#10;10 лет опыта на рынке&#10;500+ выполненных проектов&#10;200+ довольных клиентов"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => saveSiteInfo(siteSettings.siteInfo)}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Сохранить информацию
                          </button>
                        </div>

                        {/* Настройки страницы сотрудничества */}
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <h3 className="text-sm font-medium text-gray-900 mb-2">Страница сотрудничества</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
                              <input
                                type="text"
                                value={siteSettings.cooperation?.title || ''}
                                onChange={(e) => setSiteSettings(prev => prev ? {
                                  ...prev,
                                  cooperation: { 
                                    ...(prev.cooperation || { title: '', description: '', benefits: [] }),
                                    title: e.target.value
                                  }
                                } : null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                                placeholder="Заголовок страницы сотрудничества"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                              <textarea
                                value={siteSettings.cooperation?.description || ''}
                                onChange={(e) => setSiteSettings(prev => prev ? {
                                  ...prev,
                                  cooperation: { 
                                    ...(prev.cooperation || { title: '', description: '', benefits: [] }),
                                    description: e.target.value
                                  }
                                } : null)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                                placeholder="Описание страницы сотрудничества"
                              />
                            </div>
                            
                            {/* Преимущества сотрудничества */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Преимущества сотрудничества (каждое преимущество на новой строке в формате: иконка|заголовок|описание)
                              </label>
                              <textarea
                                value={
                                  siteSettings.cooperation?.benefits 
                                    ? siteSettings.cooperation.benefits.map(b => `${b.icon}|${b.title}|${b.description}`).join('\n')
                                    : ''
                                }
                                onChange={(e) => {
                                  const lines = e.target.value.split('\n').filter(line => line.trim())
                                  const benefits = lines.map(line => {
                                    const parts = line.split('|').map(p => p.trim())
                                    return {
                                      icon: parts[0] || '🤝',
                                      title: parts[1] || '',
                                      description: parts[2] || ''
                                    }
                                  })
                                  setSiteSettings(prev => prev ? {
                                    ...prev,
                                    cooperation: { 
                                      ...(prev.cooperation || { title: '', description: '', benefits: [] }),
                                      benefits: benefits
                                    }
                                  } : null)
                                }}
                                rows={8}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 resize-y whitespace-pre-wrap"
                                placeholder="🤝|Надежное партнерство|Мы ценим долгосрочные отношения и всегда выполняем свои обязательства&#10;📈|Растущий рынок|Мы работаем на динамично развивающемся рынке морского оборудования&#10;💼|Профессиональная команда|Наша команда имеет многолетний опыт в морской индустрии&#10;🌐|Широкая клиентская база|Мы работаем с множеством клиентов по всей стране"
                              />
                              <p className="mt-1 text-xs text-gray-500">
                                Формат: иконка|заголовок|описание (каждая строка - отдельное преимущество)
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              if (siteSettings.cooperation) {
                                const res = await fetch(apiUrl('/settings'), {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    ...siteSettings,
                                    cooperation: siteSettings.cooperation
                                  })
                                })
                                if (res.ok) {
                                  alert('Настройки страницы сотрудничества сохранены!')
                                }
                              }
                            }}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Сохранить настройки сотрудничества
                          </button>
                        </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Excel Preview Modal */}
      {showExcelUpload && excelPreview && (
        <div className="fixed inset-0 z-60 overflow-hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowExcelUpload(false)} />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div 
              className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Предварительный просмотр Excel</h3>
                  <button
                    onClick={() => setShowExcelUpload(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Статистика импорта</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-600">Листов обработано</p>
                      <p className="text-lg font-semibold text-blue-900">{excelPreview.sheetsProcessed || 0}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-600">Товаров найдено</p>
                      <p className="text-lg font-semibold text-green-900">{excelPreview.totalProducts || 0}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm text-purple-600">Категорий</p>
                      <p className="text-lg font-semibold text-purple-900">{excelPreview.totalCategories || 0}</p>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      <p className="text-sm text-indigo-600">Подкатегорий</p>
                      <p className="text-lg font-semibold text-indigo-900">{excelPreview.totalSubcategories || 0}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm text-yellow-600">В наличии</p>
                      <p className="text-lg font-semibold text-yellow-900">{excelPreview.inStock || 0}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-red-600">Нет в наличии</p>
                      <p className="text-lg font-semibold text-red-900">{excelPreview.outOfStock || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Категория</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Подкатегория</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Цена</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Количество</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Лист</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {excelPreview.products?.slice(0, 50).map((product: any, index: number) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{product.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{product.category}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{product.subcategory || '-'}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{product.price} ₽</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{product.quantity} {product.unit}</td>
                          <td className="px-4 py-2 text-sm">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {product.inStock ? 'В наличии' : 'Нет в наличии'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">{product.sheetName || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {excelPreview.products?.length > 50 && (
                    <p className="mt-2 text-sm text-gray-500 text-center">
                      Показано 50 из {excelPreview.products.length} товаров
                    </p>
                  )}
                </div>
              </div>
              
              <div className="p-6 border-t bg-gray-50">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowExcelUpload(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleExcelImport}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Импортировать товары
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  )
}