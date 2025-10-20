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
  servings: number | null
  difficulty: string | null
  image_url: string | null
  created_at: string
  user_id: string
}

export default function MyRecipesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMyRecipes() {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('recipes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (error) {
            console.error('Error fetching recipes:', error)
          } else {
            setRecipes(data || [])
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

    fetchMyRecipes()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white text-2xl">🍳</span>
          </div>
          <p className="text-lg text-gray-700">Loading your recipes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <RecipeNavigation />

      {/* Hero Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <span className="text-white text-3xl">📝</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            My <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Recipes</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            All the delicious recipes you&apos;ve created and shared with the community
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-2">{recipes.length}</div>
            <div className="text-gray-600">Total Recipes</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{recipes.length}</div>
            <div className="text-gray-600">Published</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
            <div className="text-gray-600">Drafts</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">0</div>
            <div className="text-gray-600">Avg. Rating</div>
          </div>
        </div>
      </div>

      {/* Create Recipe Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="text-center">
          <a
            href="/create-recipe"
            className="inline-flex items-center bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <span className="text-2xl mr-3">➕</span>
            Create New Recipe
          </a>
        </div>
      </div>

      {/* Recipes Display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {recipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🍳</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No recipes created yet</h3>
            <p className="text-gray-500 mb-6">Start sharing your culinary masterpieces with the world!</p>
            <a
              href="/create-recipe"
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors mr-4 inline-block"
            >
              Create Recipe
            </a>
            <a
              href="/dashboard"
              className="border-2 border-emerald-600 text-emerald-600 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-600 hover:text-white transition-colors inline-block"
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