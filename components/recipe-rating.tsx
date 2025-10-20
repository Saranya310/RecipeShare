'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

interface Rating {
  id: string
  recipe_id: string
  user_id: string
  rating: number
  review: string | null
  created_at: string
  updated_at: string
  profiles?: {
    username: string | null
    full_name: string | null
  }
}

interface RecipeRatingProps {
  recipeId: string
  recipeOwnerId: string
}

export default function RecipeRating({ recipeId, recipeOwnerId }: RecipeRatingProps) {
  const { user } = useAuth()
  const [ratings, setRatings] = useState<Rating[]>([])
  const [userRating, setUserRating] = useState<Rating | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newRating, setNewRating] = useState(0)
  const [newReview, setNewReview] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)

  // Fetch ratings and user's rating
  useEffect(() => {
    async function fetchRatings() {
      setLoading(true)
      
      // Fetch all ratings for this recipe
      const { data: ratingsData } = await supabase
        .from('recipe_ratings')
        .select(`
          *,
          profiles (
            username,
            full_name
          )
        `)
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false })

      if (ratingsData) {
        setRatings(ratingsData)
      }

      // Fetch user's rating if logged in
      if (user) {
        const { data: userRatingData } = await supabase
          .from('recipe_ratings')
          .select('*')
          .eq('recipe_id', recipeId)
          .eq('user_id', user.id)
          .single()

        if (userRatingData) {
          setUserRating(userRatingData)
          setNewRating(userRatingData.rating)
          setNewReview(userRatingData.review || '')
        }
      }
      
      setLoading(false)
    }

    fetchRatings()
  }, [recipeId, user])

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || newRating === 0) return

    setSubmitting(true)

    try {
      if (userRating) {
        // Update existing rating
        const { error } = await supabase
          .from('recipe_ratings')
          .update({
            rating: newRating,
            review: newReview.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', userRating.id)

        if (error) {
          console.error('Error updating rating:', error)
          alert('Error updating rating. Please try again.')
          return
        }
      } else {
        // Create new rating
        const { error } = await supabase
          .from('recipe_ratings')
          .insert({
            recipe_id: recipeId,
            user_id: user.id,
            rating: newRating,
            review: newReview.trim() || null
          })

        if (error) {
          console.error('Error creating rating:', error)
          alert('Error submitting rating. Please try again.')
          return
        }
      }

      // Refresh ratings
      const { data: ratingsData } = await supabase
        .from('recipe_ratings')
        .select(`
          *,
          profiles (
            username,
            full_name
          )
        `)
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false })

      if (ratingsData) {
        setRatings(ratingsData)
      }

      // Update user rating
      const { data: userRatingData } = await supabase
        .from('recipe_ratings')
        .select('*')
        .eq('recipe_id', recipeId)
        .eq('user_id', user.id)
        .single()

      if (userRatingData) {
        setUserRating(userRatingData)
      }

      setShowReviewForm(false)
      alert(userRating ? 'Rating updated successfully!' : 'Rating submitted successfully!')
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const calculateAverageRating = () => {
    if (ratings.length === 0) return 0
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0)
    return Number((sum / ratings.length).toFixed(1))
  }

  const renderStars = (rating: number, interactive: boolean = false, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8'
    }
    
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => setNewRating(star) : undefined}
            className={`
              ${interactive ? 'cursor-pointer hover:scale-125 active:scale-95' : 'cursor-default'}
              transition-all duration-200 ease-in-out
              ${interactive ? 'hover:drop-shadow-lg' : ''}
            `}
          >
            <svg
              className={`${sizeClasses[size]} ${
                star <= rating
                  ? 'text-yellow-400 drop-shadow-sm'
                  : 'text-gray-300'
              } transition-all duration-200`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-center text-gray-600">Loading ratings...</p>
      </div>
    )
  }

  const averageRating = calculateAverageRating()

  return (
    <div className="space-y-8">
      {/* Enhanced Rating Summary */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/30">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-bold text-gray-900 flex items-center">
            <span className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
              <span className="text-white text-lg">⭐</span>
            </span>
            Ratings & Reviews
          </h3>
          <div className="text-right">
            <div className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {averageRating}
            </div>
            <div className="text-sm text-gray-500 font-medium">out of 5</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-8 mb-8">
          <div className="flex items-center space-x-2">
            {renderStars(averageRating, false, 'lg')}
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold text-gray-800">
              Based on {ratings.length} review{ratings.length !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-gray-600">
              {ratings.length > 0 ? 'Community feedback from fellow cooks' : 'Be the first to review this recipe!'}
            </p>
          </div>
        </div>

        {/* Rating Distribution */}
        {ratings.length > 0 && (
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Rating Breakdown</h4>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratings.filter(r => r.rating === star).length
                const percentage = ratings.length > 0 ? (count / ratings.length) * 100 : 0
                return (
                  <div key={star} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 w-16">
                      <span className="text-sm font-medium text-gray-700">{star}</span>
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-orange-400 h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-right">
                      <span className="text-sm font-medium text-gray-700">{count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Enhanced User Rating Form */}
        {user && user.id !== recipeOwnerId && (
          <div className="border-t border-gray-200 pt-8">
            {!userRating ? (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm">⭐</span>
                  </span>
                  Rate this recipe
                </h4>
                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-lg font-semibold text-gray-700">Your rating:</span>
                  {renderStars(newRating, true, 'lg')}
                  <span className="text-lg font-bold text-gray-800 bg-white px-3 py-1 rounded-full shadow-sm">
                    {newRating}/5
                  </span>
                </div>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {showReviewForm ? 'Hide review form' : 'Add a written review'}
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm">✅</span>
                  </span>
                  Your rating
                </h4>
                <div className="flex items-center space-x-4 mb-4">
                  {renderStars(userRating.rating, false, 'lg')}
                  <span className="text-lg font-bold text-gray-800 bg-white px-3 py-1 rounded-full shadow-sm">
                    {userRating.rating}/5
                  </span>
                </div>
                {userRating.review && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/30">
                    <p className="text-gray-800 leading-relaxed">{userRating.review}</p>
                  </div>
                )}
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {showReviewForm ? 'Cancel' : 'Update your review'}
                </button>
              </div>
            )}

            {/* Enhanced Review Form */}
            {showReviewForm && (
              <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
                <form onSubmit={handleSubmitRating} className="space-y-6">
                  <div>
                    <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mr-2">
                        <span className="text-white text-xs">⭐</span>
                      </span>
                      Your rating: {newRating}/5
                    </label>
                    <div className="flex items-center space-x-2">
                      {renderStars(newRating, true, 'lg')}
                      <span className="text-lg font-bold text-gray-800 bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-1 rounded-full">
                        {newRating} out of 5 stars
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="review" className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-2">
                        <span className="text-white text-xs">📝</span>
                      </span>
                      Share your experience (optional)
                    </label>
                    <textarea
                      id="review"
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      rows={4}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg hover:shadow-xl resize-none"
                      placeholder="Tell us about your experience with this recipe... What did you like? Any tips for others?"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Help other cooks by sharing your experience and any helpful tips!
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={submitting || newRating === 0}
                      className="flex-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg relative overflow-hidden"
                    >
                      {submitting ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Submitting...
                        </div>
                      ) : (
                        <>
                          <span className="mr-2">✨</span>
                          {userRating ? 'Update Rating' : 'Submit Rating'}
                          <span className="ml-2">🚀</span>
                        </>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {!user && (
          <div className="border-t border-gray-200 pt-8 text-center">
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white text-2xl">🔐</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Join the Community</h4>
              <p className="text-gray-600 mb-6">Please log in to rate and review recipes</p>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Log In to Review
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Reviews List */}
      {ratings.length > 0 && (
        <div className="space-y-6">
          <h4 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-sm">💬</span>
            </span>
            Community Reviews
          </h4>
          <div className="grid gap-6">
            {ratings.map((rating) => (
              <div key={rating.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {(rating.profiles?.username || rating.profiles?.full_name || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h5 className="font-bold text-gray-900 text-lg">
                          {rating.profiles?.username || rating.profiles?.full_name || 'Anonymous'}
                        </h5>
                        <p className="text-sm text-gray-500">
                          {new Date(rating.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {renderStars(rating.rating, false, 'sm')}
                        <span className="text-sm font-bold text-gray-700 bg-gradient-to-r from-yellow-100 to-orange-100 px-2 py-1 rounded-full">
                          {rating.rating}/5
                        </span>
                      </div>
                    </div>
                    {rating.review && (
                      <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-gray-800 leading-relaxed">{rating.review}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
