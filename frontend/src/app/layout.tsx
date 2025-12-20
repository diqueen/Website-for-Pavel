import type { Metadata, Viewport } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/contexts/CartContext'

const nunito = Nunito({ subsets: ['latin', 'cyrillic'], weight: ['300', '400', '500', '600', '700', '800'] })

export const metadata: Metadata = {
  title: 'Marine Company - Морские решения и оборудование',
  description: 'Профессиональные морские решения, оборудование и услуги. Каталог товаров, галерея проектов, консультации специалистов.',
  keywords: 'морское оборудование, водонагреватели, морские решения, судовое оборудование',
  authors: [{ name: 'Marine Company' }],
  openGraph: {
    title: 'Marine Company - Морские решения и оборудование',
    description: 'Профессиональные морские решения, оборудование и услуги',
    type: 'website',
    locale: 'ru_RU',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={nunito.className}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
