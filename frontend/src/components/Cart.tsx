'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Plus, Minus } from 'lucide-react'
import { useCart, CartItem } from '@/contexts/CartContext'
import Link from 'next/link'

interface CartProps {
  isOpen: boolean
  onClose: () => void
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { items, removeFromCart, updateQuantity, totalItems } = useCart()

  const totalPrice = items.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
    return sum + price * item.quantity
  }, 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />

          {/* Cart Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Корзина</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg font-medium">Корзина пуста</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Добавьте товары из каталога
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                    >
                      <div className="flex gap-4">
                        {/* Изображение товара */}
                        <Link
                          href={`/products/${item.id}`}
                          onClick={onClose}
                          className="flex-shrink-0"
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                              </svg>
                            </div>
                          )}
                        </Link>

                        {/* Информация о товаре */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.id}`}
                            onClick={onClose}
                            className="block"
                          >
                            <h3 className="font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-lg font-bold text-gray-800 mt-1">
                            {item.price} ₽
                          </p>

                          {/* Управление количеством */}
                          <div className="flex items-center gap-3 mt-3">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="p-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="w-4 h-4 text-gray-600" />
                            </button>
                            <span className="text-gray-700 font-medium min-w-[2rem] text-center">
                              {item.quantity} {item.unit}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="p-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>

                        {/* Кнопка удаления */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="flex-shrink-0 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Удалить из корзины"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer с итоговой суммой */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-700">
                    Итого:
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {totalPrice.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="text-sm text-gray-500 text-center">
                  Товаров в корзине: {totalItems}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}











