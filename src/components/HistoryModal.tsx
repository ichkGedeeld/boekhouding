'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Sale {
  id: number
  total_amount: number
  amount_paid: number
  created_at: string
  sale_items: {
    id: number
    quantity: number
    price_per_item: number
    items: {
      name: string
    }
  }[]
}

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      fetchSales()
    }
  }, [isOpen])

  const fetchSales = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            id,
            quantity,
            price_per_item,
            items (
              name
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setSales(data || [])
    } catch (error) {
      console.error('Error fetching sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 200)
  }

  if (!isOpen) return null

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-[9999] p-4 transition-all duration-200 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
      onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden transition-all duration-200 ease-out transform ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">Verkoopgeschiedenis</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-xl text-gray-500">Laden...</div>
            </div>
          ) : sales.length === 0 ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <p className="text-xl text-gray-500">Geen verkopen gevonden</p>
                <p className="text-gray-400 mt-2">Verkopen verschijnen hier zodra ze zijn voltooid</p>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {sales.map((sale) => (
                <div key={sale.id} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Verkoop #{sale.id}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(sale.created_at).toLocaleString('nl-NL')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        €{sale.total_amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Betaald: €{sale.amount_paid.toFixed(2)}
                      </p>
                      {sale.amount_paid !== sale.total_amount && (
                        <p className="text-sm text-blue-600">
                          {sale.amount_paid > sale.total_amount 
                            ? `Wisselgeld: €${(sale.amount_paid - sale.total_amount).toFixed(2)}`
                            : `Tekort: €${(sale.total_amount - sale.amount_paid).toFixed(2)}`
                          }
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Items:</h4>
                    {sale.sale_items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm bg-white p-2 rounded">
                        <span className="text-gray-700">{item.items.name}</span>
                        <div className="text-right">
                          <span className="text-gray-600">
                            {item.quantity}x €{item.price_per_item.toFixed(2)} = €{(item.quantity * item.price_per_item).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
