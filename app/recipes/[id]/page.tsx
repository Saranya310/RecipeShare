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
}

interface RecipeDetailsPageProps {
  params: Promise<{
    id: string
  }>
}

export default function RecipeDetailsPage({ params }: RecipeDetailsPageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Unwrap the params Promise
  const resolvedParams = use(params)

  useEffect(() => {
    async function fetchRecipe() {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('recipes')
        .select(`
          *,
          categories (
            name,
            emoji
          )
        `)
        .eq('id', resolvedParams.id)
        .single()

      if (fetchError) {
        console.error('Error fetching recipe:', fetchError)
        console.error('Recipe ID:', resolvedParams.id)
        setError('Recipe not found')
      } else {
        setRecipe(data)
        
        // Fetch user profile information
        if (data?.user_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', data.user_id)
            .single()
          
          if (profileData) {
            setRecipe(prev => prev ? ({
              ...prev,
              profiles: profileData
            }) : null)
          }
        }
      }
      
      setLoading(false)
    }

    fetchRecipe()
  }, [resolvedParams.id])

  const handleDeleteRecipe = async () => {
    if (!user || !recipe) return

    setDeleting(true)
    try {
      // Delete the recipe
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipe.id)
        .eq('user_id', user.id) // Ensure only the owner can delete

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
    if (minutes < 60) return `${minutes} minutes`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours} hour${hours !== 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} minutes` : ''}`
  }

  const totalTime = (recipe?.prep_time || 0) + (recipe?.cook_time || 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading recipe...</p>
        </div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20">
          <p className="text-2xl font-bold text-red-600 mb-4">Error</p>
          <p className="text-lg text-gray-700 mb-6">{error || 'Recipe not found.'}</p>
          <button
            onClick={() => router.push('/recipes')}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Back to Recipes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 font-zilla-slab">
      {/* Navigation (simplified for recipe view) */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">🍳 RecipeShare</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Back to Dashboard
              </button>
              {user?.id === recipe.user_id && (
                <button
                  onClick={() => router.push(`/recipes/${recipe.id}/edit`)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 text-sm"
                >
                  Edit Recipe
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Consistent Recipe Image */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="relative h-full min-h-[400px] bg-gradient-to-br from-emerald-200 to-teal-200 flex items-center justify-center">
              {recipe.image_url ? (
                <img 
                  src={recipe.image_url} 
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <span className="text-6xl mb-4 block">🍽️</span>
                  <p className="text-gray-600 text-base">No image available</p>
                </div>
              )}
            </div>
          </div>

          {/* Consistent Recipe Info */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1 mr-4">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  {recipe.title}
                </h1>
                {recipe.categories && (
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200">
                    <span className="text-lg mr-2">{recipe.categories.emoji}</span>
                    <span className="text-sm font-semibold text-purple-700">{recipe.categories.name}</span>
                  </div>
                )}
              </div>
              <FavoriteButton recipeId={recipe.id} size="lg" />
            </div>
            
            {recipe.description && (
              <p className="text-gray-700 text-lg leading-relaxed mb-6">{recipe.description}</p>
            )}

            {/* Compact Recipe Meta */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100 mb-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-lg">⚡</span>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">Difficulty</div>
                  {recipe.difficulty && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                      {recipe.difficulty}
                    </span>
                  )}
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-lg">👥</span>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">Servings</div>
                  <div className="text-sm font-bold text-gray-900">{recipe.servings || 'N/A'}</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-lg">⏱️</span>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">Prep Time</div>
                  <div className="text-sm font-bold text-gray-900">{formatTime(recipe.prep_time)}</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-lg">🔥</span>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">Cook Time</div>
                  <div className="text-sm font-bold text-gray-900">{formatTime(recipe.cook_time)}</div>
                </div>
              </div>
            </div>

            {/* Compact Author Section */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {recipe.profiles?.username?.charAt(0) || recipe.profiles?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {recipe.profiles?.username || recipe.profiles?.full_name || 'Recipe Author'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(recipe.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  👨‍🍳 Chef
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Recipe Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Compact Ingredients */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white text-xs">🥘</span>
              </span>
              Ingredients
            </h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start bg-gray-50 rounded-lg p-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-800 text-sm leading-relaxed">{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Compact Instructions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white text-xs">📋</span>
              </span>
              Instructions
            </h2>
            <ol className="space-y-3">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start bg-gray-50 rounded-lg p-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-gray-800 text-sm leading-relaxed">{instruction}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Compact Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => router.push('/recipes')}
            className="border-2 border-emerald-600 text-emerald-600 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Browse More Recipes
          </button>
          {user && user.id === recipe.user_id && (
            <>
              <button
                onClick={() => router.push(`/recipes/${recipe.id}/edit`)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Edit Recipe
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Delete Recipe
              </button>
            </>
          )}
        </div>

        {/* Ratings and Reviews */}
        <div className="mt-8">
          <RecipeRating recipeId={recipe.id} recipeOwnerId={recipe.user_id} />
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/30 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white text-2xl">🗑️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Delete Recipe</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Are you sure you want to delete "<span className="font-semibold text-gray-800">{recipe?.title}</span>"? 
                This action cannot be undone and will permanently remove the recipe from the platform.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRecipe}
                  disabled={deleting}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-2xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </div>
                  ) : (
                    'Delete Recipe'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}