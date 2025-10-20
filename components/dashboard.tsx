'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [userRecipes, setUserRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [reviewsCount, setReviewsCount] = useState(0)
  const [myReviewsCount, setMyReviewsCount] = useState(0)
  const [profile, setProfile] = useState<any>(null)

  // Fetch user's recipes and favorites count
  useEffect(() => {
    async function fetchUserData() {
      if (user) {
        setLoading(true)
        
        try {
          // Fetch user's recipes
          const { data: recipesData, error: recipesError } = await supabase
            .from('recipes')
            .select('*')
            .eq('user_id', user.id)

          if (recipesError) {
            console.error('Error fetching user recipes:', recipesError)
            setUserRecipes([])
          } else {
            setUserRecipes(recipesData || [])
          }

          // Fetch favorites count
          const { count: favoritesCount, error: favoritesError } = await supabase
            .from('recipe_favorites')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

          if (favoritesError) {
            console.error('Error fetching favorites count:', favoritesError)
            setFavoritesCount(0)
          } else {
            setFavoritesCount(favoritesCount || 0)
          }

        // Fetch reviews received count (reviews on user's recipes)
        const { count: reviewsReceivedCount, error: reviewsReceivedError } = await supabase
          .from('recipe_ratings')
          .select('*', { count: 'exact', head: true })
          .in('recipe_id', userRecipes.map(r => r.id))

        if (reviewsReceivedError) {
          console.error('Error fetching reviews received count:', reviewsReceivedError)
          setReviewsCount(0)
        } else {
          setReviewsCount(reviewsReceivedCount || 0)
        }

        // Fetch reviews written count (reviews written by user)
        const { count: myReviewsCount, error: myReviewsError } = await supabase
          .from('recipe_ratings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        if (myReviewsError) {
          console.error('Error fetching my reviews count:', myReviewsError)
          setMyReviewsCount(0)
        } else {
          setMyReviewsCount(myReviewsCount || 0)
        }

        // Fetch user profile
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profileError) {
            console.error('Error fetching profile:', profileError)
            setProfile(null)
          } else {
            setProfile(profileData)
          }
        } catch (profileFetchError) {
          console.error('Unexpected error fetching profile:', profileFetchError)
          setProfile(null)
        }
        } catch (error) {
          console.error('Unexpected error:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchUserData()
  }, [user])


  // Refresh data when user returns to dashboard (e.g., after favoriting a recipe or updating profile)
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        // Refresh counts and profile when user returns to dashboard
        async function refreshData() {
          // Refresh favorites count
          const { count: favoritesCount, error: favoritesError } = await supabase
            .from('recipe_favorites')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user!.id)

          if (!favoritesError) {
            setFavoritesCount(favoritesCount || 0)
          }

          // Refresh reviews count
          const { count: reviewsCount, error: reviewsError } = await supabase
            .from('recipe_ratings')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user!.id)

          if (!reviewsError) {
            setReviewsCount(reviewsCount || 0)
          }

          // Refresh profile data
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user!.id)
              .single()

            if (profileError) {
              console.error('Error refreshing profile:', profileError)
              setProfile(null)
            } else {
              setProfile(profileData)
            }
          } catch (profileRefreshError) {
            console.error('Unexpected error refreshing profile:', profileRefreshError)
            setProfile(null)
          }
        }
        refreshData()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user])

  return (
    <div className="h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-300/10 to-teal-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Enhanced Navigation */}
      <nav className="relative bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">🍳</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  RecipeShare
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Enhanced User Avatar */}
              <div className="flex items-center space-x-2">
                {profile?.avatar_url ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-500 shadow-lg">
                    <img 
                      src={profile.avatar_url} 
                      alt="Profile Avatar" 
                      className="w-full h-full object-contain bg-gray-50"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {profile?.username?.charAt(0) || profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="text-gray-700 font-semibold text-sm">
                  Welcome, {profile?.username || profile?.full_name || user?.email?.split('@')[0] || 'Chef'}
                </span>
              </div>
              <button
                onClick={() => router.push('/profile')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Profile
              </button>
              <button 
                onClick={signOut}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Simplified Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-4 md:p-6 mb-4 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-2">
              {profile?.avatar_url ? (
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/30">
                  <img 
                    src={profile.avatar_url} 
                    alt="Profile Avatar" 
                    className="w-full h-full object-contain bg-white/20"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">👋</span>
                </div>
              )}
              <div>
                <h1 className="text-xl md:text-2xl font-bold">
                  Welcome back, {profile?.username || profile?.full_name || user?.email?.split('@')[0] || 'Chef'}!
                </h1>
                <p className="text-emerald-100 text-sm">
                  Ready to cook something amazing today?
                </p>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
        </div>


        {/* Enhanced Dashboard Stats */}
        <div className="relative mb-6">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/20 to-teal-100/20 rounded-2xl blur-3xl"></div>
          
          {/* Stats container */}
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-white/20">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Your Recipe Journey</h2>
              <p className="text-gray-600 text-sm">Track your culinary creations and community engagement</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* My Recipes Card */}
              <div 
                onClick={() => router.push('/my-recipes')}
                className="group relative bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-emerald-200 cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <span className="text-white text-lg">📝</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-700 mb-1 group-hover:text-emerald-800 transition-colors">
                        {loading ? '...' : userRecipes.length}
                      </div>
                      <div className="text-xs font-semibold text-emerald-600">Recipes</div>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm group-hover:text-emerald-700 transition-colors">My Recipes</h3>
                  <p className="text-xs text-gray-600 group-hover:text-emerald-600 transition-colors">Your culinary creations</p>
                </div>
              </div>

              {/* Recipe Reviews Card */}
              <div 
                onClick={() => router.push('/recipe-reviews')}
                className="group relative bg-gradient-to-br from-yellow-50 to-orange-100 rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-yellow-200 cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-orange-600/20 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <span className="text-white text-lg">⭐</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-700 mb-1 group-hover:text-yellow-800 transition-colors">
                        {loading ? '...' : reviewsCount}
                      </div>
                      <div className="text-xs font-semibold text-yellow-600">Reviews</div>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm group-hover:text-yellow-700 transition-colors">Recipe Reviews</h3>
                  <p className="text-xs text-gray-600 group-hover:text-yellow-600 transition-colors">Feedback on your recipes</p>
                </div>
              </div>

              {/* Favorites Card */}
              <div 
                onClick={() => router.push('/favorites')}
                className="group relative bg-gradient-to-br from-pink-50 to-rose-100 rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-pink-200 cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-400/20 to-rose-600/20 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <span className="text-white text-lg">❤️</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-pink-700 mb-1 group-hover:text-pink-800 transition-colors">
                        {loading ? '...' : favoritesCount}
                      </div>
                      <div className="text-xs font-semibold text-pink-600">Favorites</div>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm group-hover:text-pink-700 transition-colors">My Favorites</h3>
                  <p className="text-xs text-gray-600 group-hover:text-pink-600 transition-colors">Recipes you've saved</p>
                </div>
              </div>

              {/* My Reviews Card */}
              <div 
                onClick={() => router.push('/my-reviews')}
                className="group relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-blue-200 cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <span className="text-white text-lg">💬</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-700 mb-1 group-hover:text-blue-800 transition-colors">
                        {loading ? '...' : myReviewsCount}
                      </div>
                      <div className="text-xs font-semibold text-blue-600">Reviews</div>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm group-hover:text-blue-700 transition-colors">My Reviews</h3>
                  <p className="text-xs text-gray-600 group-hover:text-blue-600 transition-colors">Reviews you've written</p>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Quick Actions - Streamlined */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <div className="group bg-white rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-lg">➕</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Create Recipe</h3>
              <p className="text-gray-600 mb-3 text-xs leading-relaxed">
                Share your favorite recipes with the community and inspire other cooks
              </p>
              <button 
                onClick={() => router.push('/create-recipe')}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm"
              >
                Add Recipe
              </button>
            </div>

            <div className="group bg-white rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-lg">🔍</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Discover Recipes</h3>
              <p className="text-gray-600 mb-3 text-xs leading-relaxed">
                Explore amazing recipes from the community and find your next culinary adventure
              </p>
              <button 
                onClick={() => router.push('/recipes')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm"
              >
                Browse Recipes
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
