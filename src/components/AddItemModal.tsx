'use client'

import { useState, useEffect } from 'react'
import { supabase, Item } from '@/lib/supabase'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  onItemAdded: () => void
  // When provided, the modal acts in "edit" mode for this item
  item?: Item | null
  onItemUpdated?: () => void
  onItemDeleted?: () => void
}

export default function AddItemModal({ isOpen, onClose, onItemAdded, item, onItemUpdated, onItemDeleted }: AddItemModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    cost_price: '',
    sell_price: '',
    inventory_count: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isClosing, setIsClosing] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Handle opening animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    }
  }, [isOpen])

  // Prefill in edit mode
  useEffect(() => {
    if (isOpen && item) {
      setFormData({
        name: item.name ?? '',
        cost_price: item.cost_price != null ? String(item.cost_price) : '',
        sell_price: item.sell_price != null ? String(item.sell_price) : '',
        inventory_count: item.inventory_count != null ? String(item.inventory_count) : ''
      })
      setErrors({})
    }
  }, [isOpen, item])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Naam is verplicht'
    }

    if (!formData.cost_price || parseFloat(formData.cost_price) <= 0) {
      newErrors.cost_price = 'Kostprijs moet groter dan 0 zijn'
    }

    if (!formData.sell_price || parseFloat(formData.sell_price) <= 0) {
      newErrors.sell_price = 'Verkoopprijs moet groter dan 0 zijn'
    }

    if (!formData.inventory_count || parseInt(formData.inventory_count) < 0) {
      newErrors.inventory_count = 'Voorraad moet 0 of meer zijn'
    }

    if (parseFloat(formData.sell_price) <= parseFloat(formData.cost_price)) {
      newErrors.sell_price = 'Verkoopprijs moet hoger zijn dan kostprijs'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (item) {
        const { error } = await supabase
          .from('items')
          .update({
            name: formData.name.trim(),
            cost_price: parseFloat(formData.cost_price),
            sell_price: parseFloat(formData.sell_price),
            inventory_count: parseInt(formData.inventory_count)
          })
          .eq('id', item.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('items')
          .insert([
            {
              name: formData.name.trim(),
              cost_price: parseFloat(formData.cost_price),
              sell_price: parseFloat(formData.sell_price),
              inventory_count: parseInt(formData.inventory_count)
            }
          ])

        if (error) throw error
      }

      // Reset form and close modal with transition
      setIsClosing(true)
      setTimeout(() => {
        setFormData({
          name: '',
          cost_price: '',
          sell_price: '',
          inventory_count: ''
        })
        setErrors({})
        setIsClosing(false)
        setIsVisible(false)
        if (item) {
          onItemUpdated && onItemUpdated()
        } else {
          onItemAdded()
        }
        onClose()
      }, 200)
    } catch (error) {
      console.error('Error saving item:', error)
      setErrors({ general: 'Er is een fout opgetreden bij het opslaan van het item' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!item || isSubmitting) return
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', item.id)

      if (error) throw error

      setIsClosing(true)
      setTimeout(() => {
        setFormData({
          name: '',
          cost_price: '',
          sell_price: '',
          inventory_count: ''
        })
        setErrors({})
        setIsClosing(false)
        setIsVisible(false)
        onItemDeleted && onItemDeleted()
        onClose()
      }, 200)
    } catch (error) {
      console.error('Error deleting item:', error)
      setErrors({ general: 'Er is een fout opgetreden bij het verwijderen van het item' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setIsClosing(true)
      setTimeout(() => {
        setFormData({
          name: '',
          cost_price: '',
          sell_price: '',
          inventory_count: ''
        })
        setErrors({})
        setIsClosing(false)
        setIsVisible(false)
        onClose()
      }, 200) // Match transition duration
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-[9999] p-4 transition-all duration-200 ease-out ${
        isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
      onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto transition-all duration-200 ease-out transform ${
          isVisible && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">{item ? 'Item bewerken' : 'Nieuw item toevoegen'}</h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-base font-medium text-gray-700 mb-1">
                Naam *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Bijv. Noveenkaars - Maria die de Knopen ontwart"
                disabled={isSubmitting}
              />
              {errors.name && <p className="mt-1 text-base text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="cost_price" className="block text-base font-medium text-gray-700 mb-1">
                Kostprijs (€) *
              </label>
              <input
                type="number"
                id="cost_price"
                step="0.01"
                min="0"
                value={formData.cost_price}
                onChange={(e) => handleChange('cost_price', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all ${
                  errors.cost_price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="8.50"
                disabled={isSubmitting}
              />
              {errors.cost_price && <p className="mt-1 text-base text-red-600">{errors.cost_price}</p>}
            </div>

            <div>
              <label htmlFor="sell_price" className="block text-base font-medium text-gray-700 mb-1">
                Verkoopprijs (€) *
              </label>
              <input
                type="number"
                id="sell_price"
                step="0.01"
                min="0"
                value={formData.sell_price}
                onChange={(e) => handleChange('sell_price', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all ${
                  errors.sell_price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="15.00"
                disabled={isSubmitting}
              />
              {errors.sell_price && <p className="mt-1 text-base text-red-600">{errors.sell_price}</p>}
            </div>

            <div>
              <label htmlFor="inventory_count" className="block text-base font-medium text-gray-700 mb-1">
                Voorraad *
              </label>
              <input
                type="number"
                id="inventory_count"
                min="0"
                value={formData.inventory_count}
                onChange={(e) => handleChange('inventory_count', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all ${
                  errors.inventory_count ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="25"
                disabled={isSubmitting}
              />
              {errors.inventory_count && <p className="mt-1 text-base text-red-600">{errors.inventory_count}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-base text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Annuleren
              </button>
              {item && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-base bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Bezig...' : 'Verwijderen'}
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Bezig...' : item ? 'Opslaan' : 'Toevoegen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
