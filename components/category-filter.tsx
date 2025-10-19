'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Category {
  id: string
  name: string
  description: string
  emoji: string
}

interface CategoryFilterProps {
  selectedCategoryId: string | null
  onCategoryChange: (categoryId: string | null) => void
  recipeCount?: number
}

export default function CategoryFilter({ selectedCategoryId, onCategoryChange, recipeCount }: CategoryFilterProps) {
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
        <h3 className="text-lg font-semibold text-gray-800">Filter by Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-16 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Filter by Category</h3>
        {recipeCount !== undefined && (
          <span className="text-sm text-gray-500">
            {recipeCount} recipe{recipeCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* All Categories Option */}
        <button
          onClick={() => onCategoryChange(null)}
          className={`
            p-4 rounded-xl border-2 transition-all duration-200 text-left
            ${selectedCategoryId === null
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg'
              : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700'
            }
          `}
        >
          <div className="flex items-center space-x-2">
            <span className="text-xl">🍽️</span>
            <div>
              <div className="font-medium">All Recipes</div>
              <div className="text-xs opacity-75">Browse everything</div>
            </div>
          </div>
        </button>

        {/* Category Options */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`
              p-4 rounded-xl border-2 transition-all duration-200 text-left
              ${selectedCategoryId === category.id
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg'
                : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700'
              }
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
        ))}
      </div>
    </div>
  )
}
