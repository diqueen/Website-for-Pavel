/**
 * Утилита для получения базового URL API
 * Использует переменную окружения NEXT_PUBLIC_API_URL или fallback на localhost
 */
export function getApiUrl(): string {
  // В браузере используем переменную окружения или fallback
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  }
  // На сервере (SSR) также используем переменную окружения
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
}

/**
 * Создает полный URL для API endpoint
 * @param endpoint - путь API (например: '/products' или '/admin/services')
 */
export function apiUrl(endpoint: string): string {
  const baseUrl = getApiUrl()
  // Убираем начальный слэш, если есть
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  // Убираем дублирующийся /api, если endpoint уже начинается с /api
  if (cleanEndpoint.startsWith('/api')) {
    return `${baseUrl}${cleanEndpoint}`
  }
  // Добавляем /api перед endpoint
  return `${baseUrl}/api${cleanEndpoint}`
}

