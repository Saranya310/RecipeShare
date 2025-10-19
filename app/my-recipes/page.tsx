'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import RecipeNavigation from '@/components/recipe-navigation'
import RecipeCard from '@/components/recipe-card'

interface Recipe {
  id: string
  title: string
  description: string | null
  prep_time: number | null
  cook_time: number | null
  servings: number | null
  difficulty: 'Easy' | 'Medium' | 'Hard' | null
  image_url: string | null
  category_id: string | null
  user_id: string
  created_at: string
  updated_at: string
  categories?: {
    name: string
    emoji: string | null
  }
  profiles?: {
    username: string | null
    full_name: string | null
  }
}

export default function MyRecipes() {
  const { user } = useAuth()
  const router = useRouter()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchMyRecipes()
    }
  }, [user])

  const fetchMyRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          categories (
            name,
            emoji
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching recipes:', error)
        return
      }

      setRecipes(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your recipes</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <RecipeNavigation 
        title="My Recipes" 
        subtitle={`${recipes.length} recipe${recipes.length !== 1 ? 's' : ''} created`}
        backButtonText="← Back to Dashboard"
        backButtonPath="/dashboard"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/20 to-teal-100/20 rounded-3xl"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white text-2xl">👨‍🍳</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                My <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Recipes</span>
              </h1>
              <p className="text-gray-600 text-xl mb-6">Manage and showcase your culinary masterpieces</p>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  {loading ? 'Loading...' : `${recipes.length} recipe${recipes.length !== 1 ? 's' : ''}`}
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                  Created by you
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-12 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-emerald-600 hover:text-emerald-700 transition-all duration-300 hover:bg-emerald-50 px-4 py-2 rounded-lg mb-4 sm:mb-0"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          
          <button
            onClick={() => router.push('/create-recipe')}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center"
          >
            <span className="mr-2">✨</span>
            Create New Recipe
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                <span className="text-white text-2xl">👨‍🍳</span>
              </div>
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
            <p className="mt-6 text-gray-600 text-lg">Loading your culinary creations...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && recipes.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🍽️</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No recipes yet</h3>
            <p className="text-gray-600 mb-8 text-lg">Start your culinary journey by creating your first recipe!</p>
            <button
              onClick={() => router.push('/create-recipe')}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Create Your First Recipe
            </button>
          </div>
        )}

        {/* Recipes Grid */}
        {!loading && recipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map(recipe => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe}
                showAuthor={false}
                showCategory={true}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}