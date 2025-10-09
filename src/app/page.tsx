'use client'

import { useEffect, useState } from 'react'
import { PlusIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
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
  const [isManageMode, setIsManageMode] = useState(false)
  const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set())
  const [isSelectAll, setIsSelectAll] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

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

  // Keep select-all in sync with filtered results
  useEffect(() => {
    if (!isManageMode) return
    const filteredIds = new Set(filteredItems.map(i => i.id))
    let allSelected = true
    for (const id of filteredIds) {
      if (!selectedItemIds.has(id)) {
        allSelected = false
        break
      }
    }
    setIsSelectAll(allSelected && filteredIds.size > 0)
  }, [filteredItems, selectedItemIds, isManageMode])

  const toggleSelect = (id: number) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    const filteredIds = filteredItems.map(i => i.id)
    setSelectedItemIds(prev => {
      if (isSelectAll) {
        const next = new Set(prev)
        for (const id of filteredIds) next.delete(id)
        return next
      } else {
        const next = new Set(prev)
        for (const id of filteredIds) next.add(id)
        return next
      }
    })
    setIsSelectAll(prev => !prev)
  }

  const handleBulkDelete = async () => {
    if (selectedItemIds.size === 0) return
    try {
      await supabase.from('items').delete().in('id', Array.from(selectedItemIds))
      setSelectedItemIds(new Set())
      fetchItems()
    } catch (error) {
      console.error('Error bulk deleting items:', error)
    }
  }

  const handleEditItem = (item: Item) => {
    setEditingItem(item)
    setIsAddModalOpen(true)
  }

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
                  {/* Mobile: collapsed search icon that expands to input */}
                  <div className="flex-1 relative lg:hidden">
                    <div className={`relative transition-all duration-300 ease-out ${isMobileSearchOpen ? 'w-full' : 'w-12'} h-12`}>
                      {/* Collapsed round search button */}
                      <button
                        type="button"
                        aria-label="Zoeken openen"
                        onClick={() => setIsMobileSearchOpen(true)}
                        className={`absolute inset-0 h-12 w-12 rounded-full bg-white border border-gray-300 shadow-sm flex items-center justify-center transition-all duration-300 ease-out ${isMobileSearchOpen ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'}`}
                      >
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>

                      {/* Expanded input */}
                      <div className={`absolute inset-0 transition-all duration-300 ease-out ${isMobileSearchOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'}`}>
                        <div className="relative h-12">
                          <input
                            type="text"
                            placeholder="Zoek items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') {
                                setIsMobileSearchOpen(false)
                              }
                            }}
                            autoFocus={isMobileSearchOpen}
                            className="w-full h-12 pl-12 pr-12 border border-gray-300 bg-white rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 text-2xl shadow-sm"
                          />
                          {/* Left search icon inside input */}
                          <svg
                            className="absolute left-4 top-3 h-6 w-6 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          {/* Close button */}
                          <button
                            type="button"
                            aria-label="Zoeken sluiten"
                            onClick={() => setIsMobileSearchOpen(false)}
                            className="absolute right-2 top-2 h-8 w-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop: keep existing search input */}
                  <div className="hidden lg:block flex-1 relative">
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
                    onClick={() => { setEditingItem(null); setIsAddModalOpen(true) }}
                    aria-label="Item toevoegen"
                    title="Item toevoegen"
                    className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center text-2xl"
                  >
                    <PlusIcon className="w-6 h-6" />
                  </button>

                  <button
                    onClick={() => { 
                      setIsManageMode(prev => !prev)
                      setSelectedItemIds(new Set())
                    }}
                    aria-label="Instellingen"
                    title="Instellingen"
                    className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center text-2xl"
                  >
                    <Cog6ToothIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
              {isManageMode && (
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 select-none">
                      <input
                        type="checkbox"
                        checked={isSelectAll}
                        onChange={toggleSelectAll}
                        className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 accent-purple-600"
                      />
                      <span className="text-base text-gray-700">Alles selecteren</span>
                    </label>
                    <span className="text-sm text-gray-500">{selectedItemIds.size} geselecteerd</span>
                  </div>
                  <button
                    disabled={selectedItemIds.size === 0}
                    onClick={handleBulkDelete}
                    className={`px-4 py-2 rounded-lg text-base ${selectedItemIds.size === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-red-400 text-white hover:bg-red-500'}`}
                  >
                    Verwijder geselecteerde
                  </button>
                </div>
              )}
              <ItemGrid 
                items={filteredItems} 
                isManageMode={isManageMode}
                selectedItemIds={selectedItemIds}
                onToggleSelect={toggleSelect}
                onEditItem={handleEditItem}
              />
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
          item={editingItem}
          onItemUpdated={() => { setEditingItem(null); fetchItems() }}
          onItemDeleted={() => { setEditingItem(null); fetchItems() }}
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