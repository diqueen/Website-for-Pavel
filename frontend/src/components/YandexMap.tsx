'use client'

import { useEffect, useRef, useState } from 'react'
import { useSiteSettings } from '@/hooks/useSiteSettings'

interface YandexMapProps {
  height?: string
  className?: string
}

declare global {
  interface Window {
    ymaps: any
  }
}

const YandexMap = ({ height = '400px', className = '' }: YandexMapProps) => {
  const { settings, loading: settingsLoading } = useSiteSettings()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const API_KEY = 'a18f9c9d-feff-410a-80e3-3366c64ef5e7'

  // Intersection Observer для определения видимости карты (важно для мобильных)
  useEffect(() => {
    if (!containerRef.current) {
      // Если контейнер еще не создан, считаем что элемент виден (для немедленной загрузки)
      setIsVisible(true)
      return
    }

    // Проверяем, виден ли элемент сразу (например, на главной странице)
    const rect = containerRef.current.getBoundingClientRect()
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0
    
    if (isInViewport) {
      setIsVisible(true)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      {
        rootMargin: '100px', // Начинаем загрузку за 100px до появления на экране
        threshold: 0.01 // Даже если видна 1% элемента
      }
    )

    observer.observe(containerRef.current)

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [])

  // Ждем загрузки настроек
  useEffect(() => {
    if (settingsLoading) {
      return
    }
    
    const address = settings.contacts?.address || settings.contacts?.location || ''
    console.log('Настройки загружены:', {
      hasContacts: !!settings.contacts,
      address: address,
      fullContacts: settings.contacts
    })
  }, [settings, settingsLoading])

  useEffect(() => {
    // Ждем загрузки настроек и видимости элемента
    if (settingsLoading || !isVisible) {
      return
    }

    const address = settings.contacts?.address || settings.contacts?.location || ''
    
    // Проверяем наличие адреса
    if (!address || address.trim() === '') {
      setError('Адрес не указан в настройках. Пожалуйста, укажите адрес в разделе "Настройки сайта" -> "Контакты"')
      setLoading(false)
      return
    }

    // Проверяем наличие DOM элемента с таймаутом и размерами
    let attempts = 0
    const maxAttempts = 50 // 5 секунд максимум для мобильных устройств
    
    const checkAndLoad = () => {
      attempts++
      
      if (!mapRef.current) {
        if (attempts < maxAttempts) {
          setTimeout(checkAndLoad, 100)
          return
        } else {
          setError('Ошибка инициализации: элемент карты не найден')
          setLoading(false)
          return
        }
      }

      // Проверяем, что контейнер имеет размеры (важно для мобильных)
      const rect = mapRef.current.getBoundingClientRect()
      const hasSize = rect.width > 0 && rect.height > 0
      
      if (!hasSize && attempts < maxAttempts) {
        // Ждем, пока контейнер получит размеры
        setTimeout(checkAndLoad, 100)
        return
      }

      // Элемент найден и имеет размеры, загружаем карту
      loadYandexMaps()
    }

    // Начинаем проверку с небольшой задержкой (больше для мобильных)
    const timeoutId = setTimeout(checkAndLoad, 100)

    function loadYandexMaps() {
      if (!mapRef.current) {
        setError('Ошибка инициализации: элемент карты не найден')
        setLoading(false)
        return
      }
      
      // Проверяем, загружен ли уже скрипт Яндекс Карт
      if (window.ymaps) {
        window.ymaps.ready(() => {
          if (mapRef.current) {
            initMap()
          } else {
            setError('Ошибка инициализации: элемент карты не найден')
            setLoading(false)
          }
        })
        return
      }

      // Загружаем скрипт Яндекс Карт
      const existingScript = document.querySelector(`script[src*="api-maps.yandex.ru"]`)
      if (existingScript) {
        // Скрипт уже загружается, ждем его
        let checkAttempts = 0
        const maxCheckAttempts = 100 // 10 секунд максимум
        
        const checkInterval = setInterval(() => {
          checkAttempts++
          
          if (window.ymaps) {
            clearInterval(checkInterval)
            window.ymaps.ready(() => {
              if (mapRef.current) {
                initMap()
              } else {
                setError('Ошибка инициализации: элемент карты не найден')
                setLoading(false)
              }
            })
          } else if (checkAttempts >= maxCheckAttempts) {
            clearInterval(checkInterval)
            setError('Таймаут загрузки библиотеки Яндекс Карт')
            setLoading(false)
          }
        }, 100)
        
        return () => clearInterval(checkInterval)
      }

      // Создаем новый скрипт
      const script = document.createElement('script')
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${API_KEY}&lang=ru_RU`
      script.async = true
      
      script.onload = () => {
        if (window.ymaps) {
          window.ymaps.ready(() => {
            if (mapRef.current) {
              initMap()
            } else {
              setError('Ошибка инициализации: элемент карты не найден')
              setLoading(false)
            }
          })
        } else {
          setError('Ошибка загрузки библиотеки Яндекс Карт')
          setLoading(false)
        }
      }
      
      script.onerror = () => {
        setError('Не удалось загрузить Яндекс Карты. Проверьте подключение к интернету.')
        setLoading(false)
      }
      
      document.head.appendChild(script)
    }

    // Обработчик изменения размера окна для обновления карты
    const handleResize = () => {
      if (mapInstanceRef.current && mapRef.current) {
        try {
          setTimeout(() => {
            if (mapInstanceRef.current && mapInstanceRef.current.container) {
              mapInstanceRef.current.container.fitToViewport()
              console.log('Размер карты обновлен при изменении размера окна')
            }
          }, 100)
        } catch (e) {
          console.warn('Ошибка при обновлении размера карты при resize:', e)
        }
      }
    }

    window.addEventListener('resize', handleResize)
    // Также слушаем событие orientationchange для мобильных устройств
    window.addEventListener('orientationchange', handleResize)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy()
        } catch (e) {
          // Игнорируем ошибки при уничтожении
        }
        mapInstanceRef.current = null
      }
    }
  }, [settings.contacts?.address, settings.contacts?.location, settingsLoading, isVisible])

  const initMap = () => {
    if (!mapRef.current) {
      console.error('mapRef.current is null')
      setError('Ошибка инициализации карты: элемент не найден')
      setLoading(false)
      return
    }

    if (!window.ymaps) {
      console.error('window.ymaps is not available')
      setError('Ошибка инициализации карты: библиотека не загружена')
      setLoading(false)
      return
    }

    const address = settings.contacts?.address || settings.contacts?.location || ''
    
    if (!address || address.trim() === '') {
      console.log('Адрес не найден в настройках:', settings.contacts)
      setError('Адрес не указан в настройках. Пожалуйста, укажите адрес в разделе "Настройки сайта" -> "Контакты"')
      setLoading(false)
      return
    }

    try {
      // Уничтожаем предыдущую карту, если она существует
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy()
        } catch (e) {
          console.warn('Ошибка при уничтожении предыдущей карты:', e)
        }
        mapInstanceRef.current = null
      }

      // Геокодирование адреса
      console.log('Геокодирование адреса:', address)
      window.ymaps.geocode(address, {
        results: 1
      }).then((res: any) => {
        const firstGeoObject = res.geoObjects.get(0)
        
        if (!firstGeoObject) {
          setError('Адрес не найден на карте')
          setLoading(false)
          return
        }

        const coordinates = firstGeoObject.geometry.getCoordinates()
        const bounds = firstGeoObject.properties.get('boundedBy')

        console.log('Создание карты с координатами:', coordinates)
        console.log('Размер контейнера:', mapRef.current?.offsetWidth, mapRef.current?.offsetHeight)
        
        // Создаем карту
        const map = new window.ymaps.Map(mapRef.current, {
          center: coordinates,
          zoom: 15,
          controls: ['zoomControl', 'fullscreenControl', 'typeSelector']
        }, {
          suppressMapOpenBlock: true
        })

        console.log('Карта создана:', map)

        // Добавляем маркер
        const placemark = new window.ymaps.Placemark(
          coordinates,
          {
            balloonContentHeader: settings.company?.name || 'Наша компания',
            balloonContentBody: `
              <div style="padding: 10px;">
                <p style="margin: 5px 0;"><strong>Адрес:</strong> ${address}</p>
                ${settings.contacts?.phone ? `<p style="margin: 5px 0;"><strong>Телефон:</strong> ${settings.contacts.phone}</p>` : ''}
                ${settings.contacts?.email ? `<p style="margin: 5px 0;"><strong>Email:</strong> ${settings.contacts.email}</p>` : ''}
              </div>
            `,
            balloonContentFooter: settings.contacts.workingHours || ''
          },
          {
            preset: 'islands#blueIcon'
          }
        )

        map.geoObjects.add(placemark)
        console.log('Маркер добавлен')
        
        // Устанавливаем границы карты
        if (bounds) {
          map.setBounds(bounds, {
            checkZoomRange: true
          })
        }

        mapInstanceRef.current = map
        
        // Обработчик события загрузки карты
        map.events.add('load', () => {
          console.log('Карта загружена')
          setLoading(false)
          setError(null)
          
          // Принудительно обновляем размер карты после загрузки
          setTimeout(() => {
            try {
              if (map && map.container) {
                map.container.fitToViewport()
                console.log('Размер карты обновлен после загрузки')
              }
            } catch (e) {
              console.warn('Ошибка при обновлении размера карты:', e)
            }
          }, 100)
        })
        
        // Принудительно обновляем размер карты после небольшой задержки (для мобильных)
        setTimeout(() => {
          try {
            if (map && map.container) {
              map.container.fitToViewport()
              console.log('Размер карты обновлен (первая попытка)')
            }
            // Принудительно обновляем карту
            if (map && map.behaviors) {
              map.behaviors.enable('scrollZoom')
            }
          } catch (e) {
            console.warn('Ошибка при обновлении размера карты:', e)
          }
        }, 500)
        
        // Дополнительное обновление для мобильных устройств
        setTimeout(() => {
          try {
            if (map && map.container) {
              map.container.fitToViewport()
              console.log('Размер карты обновлен (вторая попытка для мобильных)')
            }
          } catch (e) {
            console.warn('Ошибка при обновлении размера карты:', e)
          }
        }, 1000)
        
        // Устанавливаем loading в false через небольшую задержку, если событие load не сработало
        setTimeout(() => {
          setLoading(false)
          setError(null)
          console.log('Карта успешно инициализирована')
        }, 1500)
      }).catch((err: any) => {
        console.error('Ошибка геокодинга:', err)
        setError('Не удалось найти адрес на карте')
        setLoading(false)
      })
    } catch (err) {
      console.error('Ошибка инициализации карты:', err)
      setError('Не удалось загрузить карту')
      setLoading(false)
    }
  }

  const address = settings.contacts?.address || settings.contacts?.location || ''

  return (
    <div 
      ref={containerRef}
      className={`rounded-xl overflow-hidden shadow-lg ${className}`}
      style={{ 
        height, 
        minHeight: height, 
        position: 'relative',
        width: '100%'
      }}
    >
      {/* Элемент карты всегда в DOM, даже если скрыт */}
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          minHeight: height,
          minWidth: '100%',
          display: error ? 'none' : 'block',
          position: 'relative'
        }} 
      />
      
      {/* Индикатор загрузки */}
      {(settingsLoading || loading) && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center z-10"
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка карты...</p>
          </div>
        </div>
      )}

      {/* Сообщение об ошибке */}
      {error && !loading && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center z-10"
        >
          <div className="text-center p-4">
            <p className="text-gray-600 mb-2 font-medium">{error}</p>
            {address && (
              <p className="text-sm text-gray-500 mt-2">Текущий адрес: {address}</p>
            )}
            <p className="text-xs text-gray-400 mt-4">
              Укажите адрес в разделе "Настройки сайта" → "Контакты" → "Адрес"
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default YandexMap

