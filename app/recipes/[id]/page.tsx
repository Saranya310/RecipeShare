'use client'

import { useState, useEffect, use } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import RecipeRating from '@/components/recipe-rating'
import FavoriteButton from '@/components/favorite-button'

interface Recipe {
  id: string
  title: string
  description: string | null
  ingredients: string[]
  instructions: string[]
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
  // Rating data
  average_rating?: number
  total_ratings?: number
  recipe_ratings?: Array<{
    rating: number
    review: string | null
    created_at: string
    user_id: string
  }>
}

interface RecipeDetailsPageProps {
  params: Promise<{
    id: string
  }>
}

export default function RecipeDetailsPage({ params }: RecipeDetailsPageProps) {
  const { id: recipeId } = use(params)
  const { user } = useAuth()
  const router = useRouter()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    async function fetchRecipe() {
      if (!recipeId) {
        setError('Recipe ID is required')
        setLoading(false)
        return
      }

      try {
        // First try with basic recipe data
        let { data, error } = await supabase
          .from('recipes')
          .select(`
            *,
            categories (
              name,
              emoji
            )
          `)
          .eq('id', recipeId)
          .single()

        // If that fails, try without joins
        if (error) {
          const simpleResult = await supabase
            .from('recipes')
            .select('*')
            .eq('id', recipeId)
            .single()
          
          if (simpleResult.error) {
            data = null
            error = simpleResult.error
          } else {
            data = simpleResult.data
            error = null
          }
        }
        
        // Fetch ratings separately if we have recipe data
        if (data && !error) {
          const [profileResult, ratingsResult] = await Promise.all([
            supabase
              .from('profiles')
              .select('username, full_name')
              .eq('id', data.user_id)
              .single(),
            supabase
              .from('recipe_ratings')
              .select(`
                rating,
                review,
                created_at,
                user_id
              `)
              .eq('recipe_id', recipeId)
          ])
          
          data = {
            ...data,
            profiles: profileResult.data,
            recipe_ratings: ratingsResult.data || []
          }
        }

        if (error) {
          console.error('Error fetching recipe:', error)
          setError(`Recipe not found: ${error.message}`)
        } else {
          // Process rating data
          const ratings = data.recipe_ratings || []
          const average_rating = ratings.length > 0 
            ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length 
            : 0
          const total_ratings = ratings.length

          const processedRecipe = {
            ...data,
            average_rating,
            total_ratings
          }
          
          setRecipe(processedRecipe)
        }
      } catch (err: any) {
        console.error('Unexpected error:', err)
        setError(`Failed to load recipe: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [recipeId])

  const handleDeleteRecipe = async () => {
    if (!user || !recipe) return

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipe.id)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      alert('Recipe deleted successfully!')
      router.push('/my-recipes')
    } catch (err: any) {
      console.error('Error deleting recipe:', err)
      alert(`Error deleting recipe: ${err.message}`)
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'Hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatTime = (minutes: number | null) => {
    if (minutes === null || minutes === 0) return 'N/A'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ''}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-white text-lg">🍳</span>
          </div>
          <p className="text-sm text-gray-700">Loading recipe...</p>
          <p className="text-xs text-gray-500 mt-2">Recipe ID: {recipeId}</p>
        </div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-lg">❌</span>
          </div>
          <p className="text-base font-semibold text-gray-700 mb-2">Error</p>
          <p className="text-sm text-gray-500 mb-4">{error || 'Recipe not found.'}</p>
          <a
            href="/recipes"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-sm"
          >
            Back to Recipes
          </a>
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
                href="/dashboard"
                className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </a>
              {user?.id === recipe.user_id && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center bg-red-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm"
                >
                  <span className="text-sm mr-2">🗑️</span>
                  Delete Recipe
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Compact Hero Section */}
      <div className="relative py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-white text-lg">🍽️</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            {recipe.title}
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            {recipe.description || 'Delicious recipe to try'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recipe Image */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="relative aspect-[4/3] bg-gradient-to-br from-emerald-200 to-teal-200 flex items-center justify-center">
              {recipe.image_url ? (
                <img 
                  src={recipe.image_url} 
                  alt={recipe.title}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              ) : (
                <div className="text-center z-10 relative">
                  <span className="text-4xl mb-2 block">🍽️</span>
                  <p className="text-gray-600 text-sm">No image available</p>
                </div>
              )}
            </div>
          </div>

          {/* Recipe Info */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 mr-4">
                {recipe.categories && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 mb-3">
                    <span className="text-sm mr-2">{recipe.categories.emoji}</span>
                    <span className="text-xs font-semibold text-purple-700">{recipe.categories.name}</span>
                  </div>
                )}
              </div>
              <FavoriteButton recipeId={recipe.id} size="sm" />
            </div>

            {/* Recipe Meta */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="text-sm mb-1">⚡</div>
                  <div className="text-xs text-gray-600 mb-1">Difficulty</div>
                  {recipe.difficulty && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                      {recipe.difficulty}
                    </span>
                  )}
                </div>
                
                <div className="text-center">
                  <div className="text-sm mb-1">👥</div>
                  <div className="text-xs text-gray-600 mb-1">Servings</div>
                  <div className="text-sm font-bold text-gray-900">{recipe.servings || 'N/A'}</div>
                </div>

                <div className="text-center">
                  <div className="text-sm mb-1">⏱️</div>
                  <div className="text-xs text-gray-600 mb-1">Prep Time</div>
                  <div className="text-sm font-bold text-gray-900">{formatTime(recipe.prep_time)}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm mb-1">🔥</div>
                  <div className="text-xs text-gray-600 mb-1">Cook Time</div>
                  <div className="text-sm font-bold text-gray-900">{formatTime(recipe.cook_time)}</div>
                </div>
              </div>
            </div>

            {/* Author Section */}
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {recipe.profiles?.username?.charAt(0) || recipe.profiles?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="ml-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {recipe.profiles?.username || recipe.profiles?.full_name || 'Recipe Author'}
                  </p>
                </div>
              </div>
              <RecipeRating recipeId={recipe.id} recipeOwnerId={recipe.user_id} />
            </div>
          </div>
        </div>

        {/* Recipe Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Ingredients */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white text-xs">🥘</span>
              </span>
              Ingredients
            </h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white text-xs">📝</span>
              </span>
              Instructions
            </h2>
            <ol className="space-y-3">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start text-sm text-gray-700">
                  <span className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Recipe</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete "{recipe.title}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRecipe}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}