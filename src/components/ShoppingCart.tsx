'use client'

import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface ShoppingCartProps {
  onSaleComplete: () => void
}

export default function ShoppingCart({ onSaleComplete }: ShoppingCartProps) {
  const { state, dispatch } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleQuantityInputChange = (itemId: number, value: string, maxInventory: number) => {
    // Allow empty input (user is typing)
    if (value === '') {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity: 1 } })
      return
    }

    const numValue = parseInt(value, 10)
    
    // Only process if it's a valid number
    if (!isNaN(numValue)) {
      // Ensure quantity doesn't exceed inventory
      const clampedQuantity = Math.max(1, Math.min(numValue, maxInventory))
      dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity: clampedQuantity } })
    }
  }

  const handleCustomAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0
    dispatch({ type: 'SET_CUSTOM_AMOUNT', payload: amount })
  }

  const handleCompleteSale = async () => {
    if (state.items.length === 0) return

    setIsProcessing(true)
    
    try {
      // Start a transaction by creating the sale record
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([
          {
            total_amount: state.total,
            amount_paid: state.customAmount
          }
        ])
        .select()
        .single()

      if (saleError) throw saleError

      // Create sale items records
      const saleItems = state.items.map(cartItem => ({
        sale_id: sale.id,
        item_id: cartItem.item.id,
        quantity: cartItem.quantity,
        price_per_item: cartItem.item.sell_price
      }))

      const { error: saleItemsError } = await supabase
        .from('sale_items')
        .insert(saleItems)

      if (saleItemsError) throw saleItemsError

      // Update inventory counts
      for (const cartItem of state.items) {
        const { error: updateError } = await supabase
          .from('items')
          .update({ 
            inventory_count: cartItem.item.inventory_count - cartItem.quantity 
          })
          .eq('id', cartItem.item.id)

        if (updateError) throw updateError
      }

      // Clear the cart and refresh items
      dispatch({ type: 'CLEAR_CART' })
      onSaleComplete()
      
      toast.success('Verkoop voltooid!', {
        icon: '🎉',
      })
    } catch (error) {
      console.error('Error bij voltooien van verkoop:', error)
      toast.error('Error bij voltooien van verkoop. Probeer het opnieuw.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Winkelwagen</h2>
      
      {state.items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">Uw winkelwagen is leeg</p>
          <p className="text-base text-gray-400 mt-3">
            Klik op items om ze toe te voegen aan uw winkelwagen
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cart Items */}
          <div className="space-y-4">
            {state.items.map((cartItem) => (
              <div key={cartItem.item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900">{cartItem.item.name}</h4>
                  <p className="text-base text-gray-600">
                    €{cartItem.item.sell_price.toFixed(2)} each
                  </p>
                  <p className="text-sm text-gray-500">
                    {cartItem.item.inventory_count} beschikbaar
                  </p>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    max={cartItem.item.inventory_count}
                    value={cartItem.quantity}
                    onChange={(e) => handleQuantityInputChange(cartItem.item.id, e.target.value, cartItem.item.inventory_count)}
                    className="w-20 text-center font-bold text-2xl text-gray-900 bg-purple-50 border-2 border-purple-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500"
                  />
                </div>
                
                <div className="ml-6 text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    €{(cartItem.item.sell_price * cartItem.quantity).toFixed(2)}
                  </p>
                </div>
                
                <button
                  onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: cartItem.item.id })}
                  className="ml-3 text-red-500 hover:text-red-700 text-xl font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t-2 border-gray-200 pt-6 space-y-6">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
              <span className="text-xl font-semibold text-gray-900">Subtotaal:</span>
              <span className="text-3xl font-bold text-gray-900">
                €{state.total.toFixed(2)}
              </span>
            </div>
            
            {/* Custom Amount Input */}
            <div className="space-y-4 bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
              <label className="block text-lg font-semibold text-gray-800">
                Bedrag betaald:
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={state.customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className="w-full px-6 py-4 text-2xl font-bold border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-purple-400 focus:border-purple-500 bg-white shadow-sm"
                placeholder="0.00"
              />
              {state.customAmount !== state.total && (
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-lg font-semibold text-gray-800">
                    {state.customAmount > state.total 
                      ? `Wisselgeld: €${(state.customAmount - state.total).toFixed(2)}`
                      : `Resterend: €${(state.total - state.customAmount).toFixed(2)}`
                    }
                  </p>
                </div>
              )}
            </div>
            
            {/* Complete Sale Button */}
            <button
              onClick={handleCompleteSale}
              disabled={isProcessing || state.customAmount <= 0}
              className={`w-full py-4 px-6 rounded-lg text-lg font-medium ${
                isProcessing || state.customAmount <= 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isProcessing ? 'Verwerken...' : 'Verkoop voltooien'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
