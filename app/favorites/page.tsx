'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
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
  created_at: string
  user_id: string
}

export default function FavoritesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFavorites() {
      if (user) {
        try {
          // First get the favorite recipe IDs
          const { data: favoritesData, error: favoritesError } = await supabase
            .from('recipe_favorites')
            .select('recipe_id')
            .eq('user_id', user.id)

          if (favoritesError) {
            console.error('Error fetching favorites:', favoritesError)
            setRecipes([])
            return
          }

          if (favoritesData && favoritesData.length > 0) {
            const recipeIds = favoritesData.map(fav => fav.recipe_id)
            
            // Then fetch the actual recipes
            const { data: recipesData, error: recipesError } = await supabase
              .from('recipes')
              .select('*')
              .in('id', recipeIds)
              .order('created_at', { ascending: false })

            if (recipesError) {
              console.error('Error fetching recipe details:', recipesError)
            } else {
              setRecipes(recipesData || [])
            }
          } else {
            setRecipes([])
          }
        } catch (error) {
          console.error('Unexpected error:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-white text-lg">🍳</span>
          </div>
          <p className="text-sm text-gray-700">Loading your favorites...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg font-bold">🍳</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">RecipeShare</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/recipes"
                className="inline-flex items-center bg-pink-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm"
              >
                <span className="text-sm mr-2">🔍</span>
                Browse Recipes
              </Link>
              <a 
                href="/dashboard"
                className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Compact Hero Section */}
      <div className="relative py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-white text-lg">❤️</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            My <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 bg-clip-text text-transparent">Favorites</span>
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Your saved recipes and culinary inspirations
          </p>
        </div>
      </div>

      {/* Recipes Display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {recipes.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-lg">❤️</span>
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-2">No favorites yet</h3>
            <p className="text-gray-500 mb-4 text-sm">Start exploring and saving recipes you love!</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/recipes"
                className="bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-pink-700 transition-colors text-sm"
              >
                Browse Recipes
              </a>
              <a
                href="/dashboard"
                className="border-2 border-pink-600 text-pink-600 px-4 py-2 rounded-lg font-semibold hover:bg-pink-600 hover:text-white transition-colors text-sm"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} compact={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}