'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface SaleItem {
  quantity: number
  price_per_item: number
  items: {
    name: string
    cost_price: number
  }
}

interface FinanceData {
  totalRevenue: number
  totalCost: number
  profit: number
  salesCount: number
  salesByDate: { date: string; revenue: number; cost: number; profit: number; sales: number }[]
  topItems: { name: string; quantity: number; revenue: number }[]
}

interface FinanceModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function FinanceModal({ isOpen, onClose }: FinanceModalProps) {
  const [financeData, setFinanceData] = useState<FinanceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')

  const getDateRange = useCallback(() => {
    const now = new Date()
    const start = new Date()
    
    switch (timeRange) {
      case 'week':
        start.setDate(now.getDate() - 7)
        break
      case 'month':
        start.setMonth(now.getMonth() - 1)
        break
      case 'year':
        start.setFullYear(now.getFullYear() - 1)
        break
    }
    
    return start.toISOString()
  }, [timeRange])

  const fetchFinanceData = useCallback(async () => {
    setLoading(true)
    try {
      const startDate = getDateRange()

      // Fetch sales with items
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            quantity,
            price_per_item,
            items (
              name,
              cost_price
            )
          )
        `)
        .gte('created_at', startDate)
        .order('created_at', { ascending: true })

      if (salesError) throw salesError

      // Process the data
      let totalRevenue = 0
      let totalCost = 0
      const salesByDate: { [key: string]: { revenue: number; cost: number; sales: number } } = {}
      const itemStats: { [key: string]: { quantity: number; revenue: number } } = {}

      salesData?.forEach(sale => {
        const saleDate = new Date(sale.created_at).toLocaleDateString('nl-NL')
        
        if (!salesByDate[saleDate]) {
          salesByDate[saleDate] = { revenue: 0, cost: 0, sales: 0 }
        }
        
        salesByDate[saleDate].revenue += sale.total_amount
        salesByDate[saleDate].sales += 1
        
        sale.sale_items.forEach((item: SaleItem) => {
          const itemRevenue = item.quantity * item.price_per_item
          const itemCost = item.quantity * item.items.cost_price
          
          totalRevenue += itemRevenue
          totalCost += itemCost
          salesByDate[saleDate].cost += itemCost
          
          if (!itemStats[item.items.name]) {
            itemStats[item.items.name] = { quantity: 0, revenue: 0 }
          }
          itemStats[item.items.name].quantity += item.quantity
          itemStats[item.items.name].revenue += itemRevenue
        })
      })

      // Convert to arrays and sort
      const salesByDateArray = Object.entries(salesByDate).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        cost: data.cost,
        profit: data.revenue - data.cost,
        sales: data.sales
      }))

      const topItems = Object.entries(itemStats)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)

      setFinanceData({
        totalRevenue,
        totalCost,
        profit: totalRevenue - totalCost,
        salesCount: salesData?.length || 0,
        salesByDate: salesByDateArray,
        topItems
      })
    } catch (error) {
      console.error('Error fetching finance data:', error)
    } finally {
      setLoading(false)
    }
  }, [getDateRange])

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      fetchFinanceData()
    }
  }, [isOpen, timeRange, fetchFinanceData])

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
        className={`bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden transition-all duration-200 ease-out transform ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">Financiële Analytics</h2>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="week">Afgelopen week</option>
                <option value="month">Afgelopen maand</option>
                <option value="year">Afgelopen jaar</option>
              </select>
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
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-xl text-gray-500">Laden...</div>
            </div>
          ) : !financeData ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <p className="text-xl text-gray-500">Geen data beschikbaar</p>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Totale Omzet</h3>
                  <p className="text-3xl font-bold text-blue-900">€{financeData.totalRevenue.toFixed(2)}</p>
                </div>
                
                <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Totale Kosten</h3>
                  <p className="text-3xl font-bold text-red-900">€{financeData.totalCost.toFixed(2)}</p>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Nettowinst</h3>
                  <p className="text-3xl font-bold text-green-900">€{financeData.profit.toFixed(2)}</p>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">Aantal Verkopen</h3>
                  <p className="text-3xl font-bold text-purple-900">{financeData.salesCount}</p>
                </div>
              </div>

              {/* Daily Sales Timeline */}
              {financeData.salesByDate.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Dagelijkse Verkopen</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-left p-2 rounded-l">Datum</th>
                          <th className="text-right p-2">Verkopen</th>
                          <th className="text-right p-2">Omzet</th>
                          <th className="text-right p-2">Kosten</th>
                          <th className="text-right p-2 rounded-r">Winst</th>
                        </tr>
                      </thead>
                      <tbody>
                        {financeData.salesByDate.map((day, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2 font-medium">{day.date}</td>
                            <td className="p-2 text-right">{day.sales}</td>
                            <td className="p-2 text-right">€{day.revenue.toFixed(2)}</td>
                            <td className="p-2 text-right">€{day.cost.toFixed(2)}</td>
                            <td className={`p-2 text-right font-semibold ${day.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                              €{day.profit.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Top Selling Items */}
              {financeData.topItems.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Best Verkopende Items</h3>
                  <div className="space-y-3">
                    {financeData.topItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
                        <div>
                          <span className="font-medium text-gray-900">{item.name}</span>
                          <span className="text-sm text-gray-500 ml-2">({item.quantity} verkocht)</span>
                        </div>
                        <span className="font-semibold text-green-700">€{item.revenue.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
