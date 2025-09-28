'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { Item } from '@/lib/supabase'

export interface CartItem {
  item: Item
  quantity: number
}

interface CartState {
  items: CartItem[]
  total: number
  customAmount: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Item }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: number; quantity: number } }
  | { type: 'SET_CUSTOM_AMOUNT'; payload: number }
  | { type: 'CLEAR_CART' }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
} | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.item.id === action.payload.id)
      
      if (existingItem) {
        // Controleer of we één meer kunnen toevoegen zonder voorraad overschreden
        if (existingItem.quantity >= action.payload.inventory_count) {
          // Cannot add more, inventory limit reached
          return state
        }
        
        const updatedItems = state.items.map(item =>
          item.item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
        const total = updatedItems.reduce((sum, item) => sum + (item.item.sell_price * item.quantity), 0)
        return {
          ...state,
          items: updatedItems,
          total,
          customAmount: total
        }
      } else {
        // Controleer of item voorraad beschikbaar is
        if (action.payload.inventory_count <= 0) {
          // Kan item niet toevoegen, geen voorraad beschikbaar
          return state
        }
        
        const newItems = [...state.items, { item: action.payload, quantity: 1 }]
        const total = newItems.reduce((sum, item) => sum + (item.item.sell_price * item.quantity), 0)
        return {
          ...state,
          items: newItems,
          total,
          customAmount: total
        }
      }
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.item.id !== action.payload)
      const total = newItems.reduce((sum, item) => sum + (item.item.sell_price * item.quantity), 0)
      return {
        ...state,
        items: newItems,
        total,
        customAmount: total
      }
    }
    
    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item => {
        if (item.item.id === action.payload.itemId) {
          // Controleer of nieuwe hoeveelheid voorraad overschreden
          const newQuantity = Math.min(action.payload.quantity, item.item.inventory_count)
          return { ...item, quantity: Math.max(0, newQuantity) }
        }
        return item
      }).filter(item => item.quantity > 0)
      
      const total = updatedItems.reduce((sum, item) => sum + (item.item.sell_price * item.quantity), 0)
      return {
        ...state,
        items: updatedItems,
        total,
        customAmount: total
      }
    }
    
    case 'SET_CUSTOM_AMOUNT':
      return {
        ...state,
        customAmount: action.payload
      }
    
    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
        customAmount: 0
      }
    
    default:
      return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    customAmount: 0
  })

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart moet worden gebruikt binnen een CartProvider')
  }
  return context
}
