'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Review {
  id: string
  recipe_id: string
  user_id: string
  rating: number
  review: string | null
  created_at: string
  username?: string | null
  recipes: {
    id: string
    title: string
    image_url: string | null
  }
}

export default function RecipeReviewsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    async function fetchRecipeReviews() {
      setLoading(true)
      
      try {
        // Get user's recipes first
        const { data: userRecipes, error: recipesError } = await supabase
          .from('recipes')
          .select('id, title')
          .eq('user_id', user.id)

        if (recipesError) {
          console.error('Error fetching user recipes:', recipesError)
          setReviews([])
          setLoading(false)
          return
        }

        if (userRecipes && userRecipes.length > 0) {
          const recipeIds = userRecipes.map(recipe => recipe.id)
          
          // Get reviews for user's recipes
          const { data, error } = await supabase
            .from('recipe_ratings')
            .select(`
              *,
              recipes!inner (
                id,
                title,
                image_url
              )
            `)
            .in('recipe_id', recipeIds)
            .order('created_at', { ascending: false })

          if (error) {
            console.error('Error fetching recipe reviews:', error)
            setReviews([])
          } else {
            setReviews(data || [])
          }
        } else {
          setReviews([])
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        setReviews([])
      }
      
      setLoading(false)
    }

    fetchRecipeReviews()
  }, [user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-white text-lg">🍳</span>
          </div>
          <p className="text-sm text-gray-700">Loading recipe reviews...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg font-bold">🍳</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">RecipeShare</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/create-recipe"
                className="inline-flex items-center bg-yellow-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm"
              >
                <span className="text-sm mr-2">➕</span>
                Create Recipe
              </a>
              <a 
                href="/dashboard"
                className="text-gray-700 hover:text-yellow-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
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
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-white text-lg">⭐</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            Recipe <span className="bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">Reviews</span>
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Reviews and feedback on your recipes
          </p>
        </div>
      </div>

      {/* Reviews Display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {reviews.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-lg">⭐</span>
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-2">No reviews yet</h3>
            <p className="text-gray-500 mb-4 text-sm">Share your recipes to start receiving reviews from the community!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                {/* Recipe Info */}
                <div className="flex items-center mb-4">
                  {review.recipes.image_url ? (
                    <img 
                      src={review.recipes.image_url} 
                      alt={review.recipes.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">🍳</span>
                    </div>
                  )}
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{review.recipes.title}</h3>
                    <p className="text-xs text-gray-500">Your Recipe</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="ml-2 text-xs text-gray-600">{review.rating}/5</span>
                </div>

                {/* Review Text */}
                {review.review && (
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">{review.review}</p>
                )}

                {/* Reviewer Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {review.user_id.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="ml-2 text-xs text-gray-600">
                      {review.username || `User ${review.user_id.slice(0, 8)}...`}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}