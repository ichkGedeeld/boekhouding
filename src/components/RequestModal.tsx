'use client'

import { useState, useEffect } from 'react'
import { supabase, Item } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface Request {
  id: number
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
  custom_item_name: string | null
  created_at: string
  items: {
    name: string
  } | null
}

interface RequestModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function RequestModal({ isOpen, onClose }: RequestModalProps) {
  const [requests, setRequests] = useState<Request[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    item_id: '',
    custom_item_name: '',
    customer_name: '',
    customer_phone: '',
    customer_email: ''
  })
  const [useCustomItem, setUseCustomItem] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      fetchRequests()
      fetchItems()
    }
  }, [isOpen])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          items (
            name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('name')

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!useCustomItem && !formData.item_id) {
      toast.error('Selecteer een item')
      return
    }
    
    if (useCustomItem && !formData.custom_item_name.trim()) {
      toast.error('Voer een item naam in')
      return
    }

    setIsSubmitting(true)
    
    try {
      let requestData: any = {
        customer_name: formData.customer_name || null,
        customer_phone: formData.customer_phone || null,
        customer_email: formData.customer_email || null
      }

      if (useCustomItem) {
        // For custom items, we'll store the name in a new field and set item_id to null
        requestData.item_id = null
        requestData.custom_item_name = formData.custom_item_name.trim()
      } else {
        requestData.item_id = parseInt(formData.item_id)
        requestData.custom_item_name = null
      }

      const { error } = await supabase
        .from('requests')
        .insert([requestData])

      if (error) throw error

      // Reset form
      setFormData({
        item_id: '',
        custom_item_name: '',
        customer_name: '',
        customer_phone: '',
        customer_email: ''
      })
      setUseCustomItem(false)
      setShowAddForm(false)
      
      // Refresh requests
      fetchRequests()
      
      toast.success('Verzoek toegevoegd!', {
        icon: '✅',
      })
    } catch (error) {
      console.error('Error adding request:', error)
      toast.error('Fout bij toevoegen van verzoek')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRequest = async (requestId: number) => {
    try {
      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', requestId)

      if (error) throw error
      
      // Refresh requests
      fetchRequests()
      
      toast.success('Verzoek gemarkeerd als vervuld!', {
        icon: '✅',
      })
    } catch (error) {
      console.error('Error deleting request:', error)
      toast.error('Fout bij verwijderen van verzoek')
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      setShowAddForm(false)
      setUseCustomItem(false)
      setFormData({
        item_id: '',
        custom_item_name: '',
        customer_name: '',
        customer_phone: '',
        customer_email: ''
      })
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
            <h2 className="text-3xl font-bold text-gray-900">Verzoeken beheren</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {showAddForm ? 'Annuleren' : 'Nieuw verzoek'}
              </button>
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
          {showAddForm && (
            <div className="p-6 border-b bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Nieuw verzoek toevoegen</h3>
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item *
                  </label>
                  
                  {/* Toggle between existing item and custom item */}
                  <div className="flex gap-4 mb-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!useCustomItem}
                        onChange={() => setUseCustomItem(false)}
                        className="mr-2"
                      />
                      <span className="text-sm">Bestaand item</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={useCustomItem}
                        onChange={() => setUseCustomItem(true)}
                        className="mr-2"
                      />
                      <span className="text-sm">Nieuw item (nog niet in voorraad)</span>
                    </label>
                  </div>

                  {useCustomItem ? (
                    <input
                      type="text"
                      value={formData.custom_item_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, custom_item_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Bijv. Nieuwe kaarsenhouder - gouden kleur"
                      required={useCustomItem}
                    />
                  ) : (
                    <select
                      value={formData.item_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, item_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required={!useCustomItem}
                    >
                      <option value="">Selecteer een item</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Klant naam
                    </label>
                    <input
                      type="text"
                      value={formData.customer_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Naam van klant"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefoon
                    </label>
                    <input
                      type="tel"
                      value={formData.customer_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Telefoonnummer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Email adres"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Bezig...' : 'Verzoek toevoegen'}
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-xl text-gray-500">Laden...</div>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <p className="text-xl text-gray-500">Geen openstaande verzoeken</p>
                <p className="text-gray-400 mt-2">Voeg een nieuw verzoek toe met de knop hierboven</p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Openstaande verzoeken ({requests.length})
              </h3>
              <div className="space-y-3">
                {requests.map((request) => (
                  <div key={request.id} className="bg-gray-50 rounded-lg p-4 border flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {request.custom_item_name || request.items?.name}
                        {request.custom_item_name && (
                          <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                            Nieuw item
                          </span>
                        )}
                      </h4>
                      <div className="text-sm text-gray-600 mt-1">
                        {request.customer_name && <span>Klant: {request.customer_name} | </span>}
                        {request.customer_phone && <span>Tel: {request.customer_phone} | </span>}
                        {request.customer_email && <span>Email: {request.customer_email} | </span>}
                        <span>Aangevraagd: {new Date(request.created_at).toLocaleString('nl-NL')}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteRequest(request.id)}
                      className="ml-4 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                    >
                      Vervuld
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
