'use client'

import { useEffect, useState } from 'react'
import { supabase, Item } from '@/lib/supabase'
import { CartProvider } from '@/contexts/CartContext'
import ItemGrid from '@/components/ItemGrid'
import ShoppingCart from '@/components/ShoppingCart'
import AddItemModal from '@/components/AddItemModal'
import ActionButtons from '@/components/ActionButtons'
import HistoryModal from '@/components/HistoryModal'
import RequestModal from '@/components/RequestModal'
import FinanceModal from '@/components/FinanceModal'

export default function Home() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('name')

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter items based on search query
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Laden...</div>
      </div>
    )
  }

  return (
    <CartProvider>
      <div className="min-h-screen">
        {/* <header className="bg-white shadow-sm border-b">
          <div className="mx-auto px-2 sm:px-4 lg:px-6">
            <div className="flex items-center gap-4 py-6">
              <img 
                src="/boekhoudingLogo.png" 
                alt="Boekhouding Logo" 
                className="h-16 w-auto"
              />
              <h1 className="text-4xl font-bold text-gray-900">
                Boekhouding - Voorraadbeheer
              </h1>
            </div>
          </div>
        </header> */}

        <main className="mx-auto px-2 sm:px-4 lg:px-6 py-10">
          <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-3 gap-8">
            {/* Items Grid - Links */}
            <div className="xl:col-span-3 lg:col-span-2">
              <div className="flex flex-col gap-4 mb-8">
                {/* <h2 className="text-2xl font-semibold text-gray-900">
                  Beschikbare items
                </h2> */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Zoek items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 text-2xl"
                    />
                    <svg
                      className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 text-2xl"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 whitespace-nowrap text-2xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Item toevoegen
                  </button>
                </div>
              </div>
              <ItemGrid items={filteredItems} />
            </div>

            {/* Winkelwagen - Rechts */}
            <div className="xl:col-span-1 lg:col-span-1">
              <div className="sticky top-8">
                <ActionButtons
                  onHistoryClick={() => setIsHistoryModalOpen(true)}
                  onRequestClick={() => setIsRequestModalOpen(true)}
                  onFinanceClick={() => setIsFinanceModalOpen(true)}
                />
                <ShoppingCart onSaleComplete={fetchItems} />
              </div>
            </div>
          </div>
        </main>
        
        <AddItemModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onItemAdded={fetchItems}
        />
        
        <HistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
        />
        
        <RequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
        />
        
        <FinanceModal
          isOpen={isFinanceModalOpen}
          onClose={() => setIsFinanceModalOpen(false)}
        />
      </div>
    </CartProvider>
  )
}