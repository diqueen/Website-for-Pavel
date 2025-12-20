import { useState, useEffect } from 'react'
import { apiUrl } from '@/lib/api'

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

const defaultSettings: SiteSettings = {
  siteInfo: {
    title: "Профессиональное оборудование и услуги для морской индустрии",
    description: "Мы специализируемся на поставке высококачественного морского оборудования, запчастей и предоставлении профессиональных услуг для судоходной отрасли.",
    statistics: [
      "Более 1000 товаров в каталоге",
      "10 лет опыта на рынке", 
      "500+ выполненных проектов",
      "200+ довольных клиентов"
    ]
  },
  contacts: {
    phone: "+7 (999) 123-45-67",
    email: "info@marineservice.ru",
    address: "г. Санкт-Петербург, ул. Морская, д. 15",
    workingHours: "Пн-Пт: 9:00-18:00, Сб: 10:00-16:00",
    location: "Санкт-Петербург, Россия",
    telegram: "@marineservice",
    whatsapp: "+7 (999) 123-45-67",
    otherContacts: "Дополнительные способы связи"
  },
  seo: {
    metaTitle: "Морское оборудование и услуги | Marine Service",
    metaDescription: "Профессиональное морское оборудование, запчасти и услуги. Более 1000 товаров в каталоге. 10 лет опыта на рынке.",
    keywords: "морское оборудование, запчасти для судов, морские услуги, судоходство"
  },
  updatedAt: new Date().toISOString()
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSettings = async () => {
    try {
      // Добавляем timestamp для предотвращения кэширования
      const response = await fetch(`${apiUrl('/settings')}?t=${Date.now()}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Настройки загружены, логотип:', data.company?.logo)
        setSettings(data)
        setError(null)
      } else {
        console.warn('Не удалось загрузить настройки, используются значения по умолчанию')
        setError('Не удалось загрузить настройки')
      }
    } catch (err) {
      console.warn('Ошибка загрузки настроек, используются значения по умолчанию:', err)
      setError('Ошибка загрузки настроек')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  return { settings, loading, error, reloadSettings: loadSettings }
}

export default useSiteSettings

