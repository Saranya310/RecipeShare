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
  recipes: {
    id: string
    title: string
    image_url: string | null
  }
  profiles: {
    username: string | null
    full_name: string | null
  }
}

export default function AllReviewsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    async function fetchReviews() {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('recipe_ratings')
        .select(`
          *,
          recipes (
            id,
            title,
            image_url
          ),
          profiles!recipe_ratings_user_id_fkey (
            username,
            full_name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching reviews:', error)
      } else {
        setReviews(data || [])
      }
      
      setLoading(false)
    }

    fetchReviews()
  }, [user, router])

  const getRatingStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600'
    if (rating >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="text-white text-2xl">⭐</span>
          </div>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-6 text-gray-600 text-lg">Loading community reviews...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Enhanced Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-emerald-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent hover:from-emerald-700 hover:to-teal-700 transition-all duration-300"
              >
                🍳 RecipeShare
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>Community reviews</span>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-emerald-600 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-50"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Header */}
        <div className="relative text-center mb-16">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/30 to-orange-100/30 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">⭐</span>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Community <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">Reviews</span>
            </h1>
            <p className="text-gray-600 text-xl mb-6">See what our community thinks about recipes</p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                {loading ? 'Loading...' : `${reviews.length} review${reviews.length !== 1 ? 's' : ''}`}
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                From our community
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Reviews List */}
        {reviews.length === 0 ? (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/50 to-orange-100/50 rounded-3xl blur-2xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-16 shadow-2xl border border-white/20 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                <span className="text-white text-4xl">⭐</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">No Reviews Yet</h3>
              <p className="text-gray-600 mb-10 text-xl max-w-md mx-auto">Be the first to review a recipe and help our community!</p>
              <button
                onClick={() => router.push('/recipes')}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-10 py-5 rounded-2xl font-semibold hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg"
              >
                <span className="mr-2">🔍</span>
                Browse Recipes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {reviews.map(review => (
              <div key={review.id} className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-white/20">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative p-8">
                  {/* Review Header */}
                  <div className="flex items-start space-x-6 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      {review.recipes.image_url ? (
                        <img 
                          src={review.recipes.image_url} 
                          alt={review.recipes.title}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        <span className="text-3xl">🍽️</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-yellow-600 transition-colors duration-300">
                        {review.recipes.title}
                      </h3>
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`text-3xl font-bold ${getRatingColor(review.rating)}`}>
                          {getRatingStars(review.rating)}
                        </div>
                        <div className="bg-yellow-50 px-4 py-2 rounded-lg">
                          <span className="text-gray-700 font-semibold">
                            {review.rating} out of 5 stars
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  {review.review && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-6 border border-yellow-100">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">💬</span>
                        <p className="text-gray-700 leading-relaxed text-lg italic">
                          "{review.review}"
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Review Meta */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gray-50 px-4 py-2 rounded-lg">
                        <span className="text-gray-600 text-sm">
                          by {review.profiles?.username || review.profiles?.full_name || 'Anonymous'}
                        </span>
                      </div>
                      <div className="bg-gray-50 px-4 py-2 rounded-lg">
                        <span className="text-gray-600 text-sm">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/recipes/${review.recipe_id}`)}
                      className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center"
                    >
                      <span className="mr-2">👁️</span>
                      View Recipe
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
