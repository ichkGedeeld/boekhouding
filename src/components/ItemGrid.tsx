'use client'

import { Item } from '@/lib/supabase'
import { useCart } from '@/contexts/CartContext'
import toast from 'react-hot-toast'

interface ItemGridProps {
  items: Item[]
  isManageMode?: boolean
  selectedItemIds?: Set<number>
  onToggleSelect?: (id: number) => void
  onEditItem?: (item: Item) => void
}

export default function ItemGrid({ items, isManageMode = false, selectedItemIds, onToggleSelect, onEditItem }: ItemGridProps) {
  const { dispatch } = useCart()

  const handleCardClick = (item: Item) => {
    if (isManageMode) {
      onEditItem && onEditItem(item)
      return
    }
    if (item.inventory_count > 0) {
      dispatch({ type: 'ADD_ITEM', payload: item })
    } else {
      toast.error('Dit product is uitverkocht!', {
        icon: '⚠️',
      })
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {items.map((item) => (
        <div
          key={item.id}
          className={`bg-white rounded-xl shadow-md p-6 transition-all duration-200 cursor-pointer relative ${
            item.inventory_count > 0
              ? 'hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-purple-200'
              : 'opacity-60 cursor-not-allowed'
          }`}
          onClick={() => handleCardClick(item)}
        >
          {isManageMode && (
            <button
              aria-label="Selecteer item"
              onClick={(e) => { e.stopPropagation(); onToggleSelect && onToggleSelect(item.id) }}
              className="absolute top-3 left-3"
            >
              <input
                type="checkbox"
                checked={selectedItemIds?.has(item.id) ?? false}
                readOnly
                className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 accent-purple-600"
              />
            </button>
          )}
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 leading-tight">
              {item.name}
            </h3>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                item.inventory_count > 0
                  ? item.inventory_count <= 5
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {item.inventory_count}
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-base text-gray-500">Prijs:</span>
              <span className="text-2xl font-bold text-purple-600">
                €{item.sell_price.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-base">
              <span className="text-gray-500">Kostprijs:</span>
              <span className="text-gray-600">
                €{item.cost_price.toFixed(2)}
              </span>
            </div>
          </div>

          {item.inventory_count === 0 && (
            <div className="mt-6 text-center">
              <span className="text-red-600 font-medium text-base">
                Uitverkocht
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
