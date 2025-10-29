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
            .select(`
              *,
              categories (
                name,
                emoji
              ),
              recipe_ratings (
                rating,
                review,
                created_at,
                user_id
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (error) {
            console.error('Error fetching recipes:', error)
            setRecipes([])
          } else {
            console.log('✅ Successfully fetched recipes:', data?.length || 0, 'recipes')
            // Process recipes to include rating data
            const processedRecipes = (data || []).map(recipe => {
              const ratings = recipe.recipe_ratings || []
              const average_rating = ratings.length > 0 
                ? ratings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / ratings.length 
                : null
              const total_ratings = ratings.length
              const recent_review = ratings.length > 0 
                ? ratings.sort((a: { created_at: string }, b: { created_at: string }) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
                : null

              return {
                ...recipe,
                average_rating,
                total_ratings,
                recent_review
              }
            })
            
            setRecipes(processedRecipes)
          }
        } catch (error) {
          console.error('Unexpected error:', error)
        } finally {
          setLoading(false)
        }
      } else {
        console.log('❌ No user found, redirecting to login')
        setLoading(false)
        router.push('/')
      }
    }

    fetchMyRecipes()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-white text-lg">🍳</span>
          </div>
          <p className="text-sm text-gray-700">Loading your recipes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg font-bold">🍳</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">RecipeShare</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/create-recipe"
                className="inline-flex items-center bg-emerald-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm"
              >
                <span className="text-sm mr-2">➕</span>
                Create Recipe
              </a>
              <a 
                href="/dashboard"
                className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
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
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-white text-lg">📝</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            My <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Recipes</span>
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Manage and share your culinary creations
          </p>
        </div>
      </div>


      {/* Recipes Display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {recipes.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-lg">🍳</span>
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-2">No recipes created yet</h3>
            <p className="text-gray-500 mb-4 text-sm">Start sharing your culinary masterpieces with the world!</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/create-recipe"
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-sm"
              >
                Create Recipe
              </a>
              <a
                href="/dashboard"
                className="border-2 border-emerald-600 text-emerald-600 px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600 hover:text-white transition-colors text-sm"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden"
              >
                {/* Recipe Image */}
                <div className="h-40 relative">
                  {recipe.image_url ? (
                    <img
                      src={recipe.image_url}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                      <span className="text-3xl">🍳</span>
                    </div>
                  )}
                </div>

                {/* Recipe Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base font-bold text-gray-900 line-clamp-2">{recipe.title}</h3>
                    {recipe.difficulty && (
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 ${
                        recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {recipe.difficulty}
                      </span>
                    )}
                  </div>

                  {recipe.description && (
                    <p className="text-gray-600 mb-3 line-clamp-2 text-xs">{recipe.description}</p>
                  )}

                  {/* Recipe Meta */}
                  <div className="flex items-center space-x-3 mb-3 text-xs text-gray-500">
                    {recipe.prep_time && (
                      <span className="flex items-center">
                        <span className="mr-1">⏱️</span>
                        {recipe.prep_time} min
                      </span>
                    )}
                    {recipe.servings && (
                      <span className="flex items-center">
                        <span className="mr-1">👥</span>
                        {recipe.servings} servings
                      </span>
                    )}
                  </div>

                  {/* View Recipe Button */}
                  <a
                    href={`/recipes/${recipe.id}`}
                    className="inline-flex items-center px-3 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-xs"
                  >
                    View Recipe
                    <span className="ml-1">→</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}