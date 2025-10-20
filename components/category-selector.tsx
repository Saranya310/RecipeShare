'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Category {
  id: string
  name: string
  description: string
  emoji: string
}

interface CategorySelectorProps {
  selectedCategoryId?: string | null
  onCategorySelect: (categoryId: string | null) => void
  disabled?: boolean
}

export default function CategorySelector({ selectedCategoryId, onCategorySelect, disabled }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching categories:', error)
      } else {
        setCategories(data || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-700">
          Category (optional)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700">
        Category (optional)
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* All Categories Option */}
        <button
          onClick={() => onCategorySelect(null)}
          disabled={disabled}
          className={`
            p-4 rounded-xl border-2 transition-all duration-200 text-left
            ${!selectedCategoryId 
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg' 
              : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex items-center space-x-2">
            <span className="text-xl">🍽️</span>
            <div>
              <div className="font-medium">All Categories</div>
              <div className="text-xs opacity-75">Browse everything</div>
            </div>
          </div>
        </button>

        {/* Category Options */}
        {categories.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No categories available. Please contact support.</p>
          </div>
        ) : (
          categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              disabled={disabled}
              className={`
                p-4 rounded-xl border-2 transition-all duration-200 text-left
                ${selectedCategoryId === category.id 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg' 
                  : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center space-x-2">
                <span className="text-xl">{category.emoji}</span>
                <div>
                  <div className="font-medium">{category.name}</div>
                  <div className="text-xs opacity-75">{category.description}</div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
