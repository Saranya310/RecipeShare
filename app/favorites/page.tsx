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
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white text-2xl">❤️</span>
          </div>
          <p className="text-lg text-gray-700">Loading your favorites...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <RecipeNavigation 
        title="My Favorites" 
        subtitle="Your saved recipes and culinary inspirations"
        backButtonText="← Back to Dashboard"
        backButtonPath="/dashboard"
      />

      {/* Enhanced Hero Section */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-rose-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-300/10 to-rose-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <span className="text-white text-3xl">❤️</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            My <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 bg-clip-text text-transparent">Favorites</span>
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Your saved recipes and culinary inspirations
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-white/20">
              <div className="text-2xl font-bold text-pink-600">{recipes.length}</div>
              <div className="text-sm text-gray-600">Saved Recipes</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-white/20">
              <div className="text-2xl font-bold text-rose-600">{recipes.filter(r => r.difficulty === 'Easy').length}</div>
              <div className="text-sm text-gray-600">Easy Recipes</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-white/20">
              <div className="text-2xl font-bold text-red-600">Loved</div>
              <div className="text-sm text-gray-600">By You</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your Favorite Collection</h2>
            <p className="text-gray-600">Discover insights about your saved recipes</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-pink-50 to-rose-100 rounded-2xl p-6 shadow-lg text-center border border-pink-200">
              <div className="text-4xl font-bold text-pink-600 mb-2">{recipes.length}</div>
              <div className="text-gray-600 font-semibold">Total Favorites</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl p-6 shadow-lg text-center border border-emerald-200">
              <div className="text-4xl font-bold text-emerald-600 mb-2">{recipes.filter(r => r.difficulty === 'Easy').length}</div>
              <div className="text-gray-600 font-semibold">Easy Recipes</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl p-6 shadow-lg text-center border border-blue-200">
              <div className="text-4xl font-bold text-blue-600 mb-2">{recipes.filter(r => r.prep_time && r.prep_time <= 30).length}</div>
              <div className="text-gray-600 font-semibold">Quick Meals</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl p-6 shadow-lg text-center border border-purple-200">
              <div className="text-4xl font-bold text-purple-600 mb-2">0</div>
              <div className="text-gray-600 font-semibold">Desserts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Browse Recipes Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="text-center">
          <a
            href="/recipes"
            className="inline-flex items-center bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-pink-700 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <span className="text-2xl mr-3">🔍</span>
            Browse All Recipes
          </a>
        </div>
      </div>

      {/* Recipes Display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {recipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">❤️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No favorites yet</h3>
            <p className="text-gray-500 mb-6">Start exploring recipes and save your favorites!</p>
            <a
              href="/recipes"
              className="bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-700 transition-colors mr-4 inline-block"
            >
              Browse Recipes
            </a>
            <a
              href="/dashboard"
              className="border-2 border-pink-600 text-pink-600 px-6 py-3 rounded-xl font-semibold hover:bg-pink-600 hover:text-white transition-colors inline-block"
            >
              Back to Dashboard
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} showAuthor={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}