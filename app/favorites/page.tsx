'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import RecipeNavigation from '@/components/recipe-navigation'
import RecipeCard from '@/components/recipe-card'

interface FavoriteRecipe {
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
}

export default function FavoritesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [favoriteRecipes, setFavoriteRecipes] = useState<FavoriteRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [filterBy, setFilterBy] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Helper functions for list view
  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'Hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatTime = (minutes: number | null) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
    if (hours > 0) return `${hours}h`
    return `${mins}m`
  }

  // Function to refresh favorites
  const refreshFavorites = async () => {
    if (!user) return

    setLoading(true)
    
    try {
      // First, get the favorite recipe IDs
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('recipe_favorites')
        .select('recipe_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (favoritesError) {
        console.error('Error fetching favorites:', favoritesError)
        setLoading(false)
        return
      }

      if (!favoritesData || favoritesData.length === 0) {
        setFavoriteRecipes([])
        setLoading(false)
        return
      }

      // Then fetch the actual recipe data
      const recipeIds = favoritesData.map(fav => fav.recipe_id)
      
      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes')
        .select(`
          *,
          categories (
            name,
            emoji
          )
        `)
        .in('id', recipeIds)
        .order('created_at', { ascending: false })

      if (recipesError) {
        console.error('Error fetching recipe details:', recipesError)
      } else {
        setFavoriteRecipes(recipesData || [])
      }
    } catch (error) {
      console.error('Unexpected error in refreshFavorites:', error)
    } finally {
      setLoading(false)
    }
  }

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  // Fetch favorite recipes
  useEffect(() => {
    if (user) {
      refreshFavorites()
    }
  }, [user])

  // Auto-refresh favorites when user returns to the page
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        refreshFavorites()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user])

  // Filter and sort favorites
  const filteredAndSortedFavorites = favoriteRecipes
    .filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           recipe.ingredients.some(ingredient => 
                             ingredient.toLowerCase().includes(searchTerm.toLowerCase())
                           )
      
      const matchesFilter = filterBy === 'all' || 
                           (filterBy === 'easy' && recipe.difficulty === 'Easy') ||
                           (filterBy === 'medium' && recipe.difficulty === 'Medium') ||
                           (filterBy === 'hard' && recipe.difficulty === 'Hard') ||
                           (filterBy === 'quick' && (recipe.prep_time || 0) <= 30) ||
                           (filterBy === 'my-recipes' && recipe.user_id === user?.id)

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        case 'prep_time':
          return (a.prep_time || 0) - (b.prep_time || 0)
        case 'difficulty':
          const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 }
          return (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0) - 
                 (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0)
        default:
          return 0
      }
    })

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <RecipeNavigation 
        title="My Favorites" 
        subtitle={`${favoriteRecipes.length} favorite recipe${favoriteRecipes.length !== 1 ? 's' : ''}`}
        backButtonText="← Back to Dashboard"
        backButtonPath="/dashboard"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-100/20 to-rose-100/20 rounded-3xl"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white text-2xl">❤️</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                My <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Favorites</span>
              </h1>
              <p className="text-gray-600 text-xl mb-6">Your collection of beloved recipes</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-pink-600">{favoriteRecipes.length}</div>
                  <div className="text-sm text-gray-600">Total Favorites</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {favoriteRecipes.filter(r => r.difficulty === 'Easy').length}
                  </div>
                  <div className="text-sm text-gray-600">Easy Recipes</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {favoriteRecipes.filter(r => (r.prep_time || 0) <= 30).length}
                  </div>
                  <div className="text-sm text-gray-600">Quick Meals</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {favoriteRecipes.filter(r => r.user_id === user?.id).length}
                  </div>
                  <div className="text-sm text-gray-600">Your Recipes</div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-pink-500 rounded-full mr-2 animate-pulse"></span>
                  {loading ? 'Loading...' : `${filteredAndSortedFavorites.length} showing`}
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-rose-500 rounded-full mr-2 animate-pulse"></span>
                  Personal collection
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filter Section */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 mb-12 border border-white/30">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🔍</span>
                </span>
                Search Favorites
              </label>
              <input
                type="text"
                placeholder="Search by title, description, or ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg hover:shadow-xl"
              />
            </div>

            {/* Filter */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🏷️</span>
                </span>
                Filter By
              </label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 shadow-lg hover:shadow-xl"
              >
                <option value="all">All Favorites</option>
                <option value="easy">Easy Recipes</option>
                <option value="medium">Medium Difficulty</option>
                <option value="hard">Hard Recipes</option>
                <option value="quick">Quick Meals (≤30min)</option>
                <option value="my-recipes">My Own Recipes</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🔄</span>
                </span>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 shadow-lg hover:shadow-xl"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
                <option value="prep_time">Prep Time</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </div>
          </div>

          {/* View Mode and Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <span className="text-lg font-semibold text-gray-700">View:</span>
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-pink-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-pink-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  List
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-emerald-600 hover:text-emerald-700 transition-all duration-300 hover:bg-emerald-50 px-4 py-2 rounded-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              
              <button
                onClick={() => router.push('/recipes')}
                className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-700 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center"
              >
                <span className="mr-2">🔍</span>
                Discover More
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                <span className="text-white text-2xl">❤️</span>
              </div>
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            </div>
            <p className="mt-6 text-gray-600 text-lg">Loading your favorite recipes...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && favoriteRecipes.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">💔</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No favorites yet</h3>
            <p className="text-gray-600 mb-8 text-lg">Start exploring recipes and add them to your favorites!</p>
            <button
              onClick={() => router.push('/recipes')}
              className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-pink-700 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Discover Recipes
            </button>
          </div>
        )}

        {/* Results Count */}
        {!loading && favoriteRecipes.length > 0 && (
          <div className="mb-8">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/30">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full animate-pulse"></div>
                <p className="text-gray-800 font-bold text-lg">
                  Showing {filteredAndSortedFavorites.length} of {favoriteRecipes.length} favorites
                  {searchTerm && ` for "${searchTerm}"`}
                </p>
                <div className="w-3 h-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full animate-pulse delay-500"></div>
              </div>
            </div>
          </div>
        )}

        {/* Empty Search Results */}
        {!loading && favoriteRecipes.length > 0 && filteredAndSortedFavorites.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No matches found</h3>
            <p className="text-gray-600 mb-8 text-lg">
              Try adjusting your search or filter criteria to find more recipes.
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterBy('all')
                setSortBy('newest')
              }}
              className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-pink-700 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Favorites Grid/List */}
        {!loading && filteredAndSortedFavorites.length > 0 && (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
            : "space-y-4"
          }>
            {filteredAndSortedFavorites.map(recipe => (
              viewMode === 'grid' ? (
                <RecipeCard 
                  key={recipe.id} 
                  recipe={recipe}
                  showAuthor={false}
                  showCategory={true}
                />
              ) : (
                <div 
                  key={recipe.id}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-white/20 cursor-pointer"
                  onClick={() => router.push(`/recipes/${recipe.id}`)}
                >
                  <div className="flex items-center space-x-6 p-6">
                    {/* Recipe Image - Smaller for list view */}
                    <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-xl overflow-hidden flex-shrink-0">
                      {recipe.image_url ? (
                        <img 
                          src={recipe.image_url} 
                          alt={recipe.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl">🍽️</span>
                        </div>
                      )}
                      
                      {/* Difficulty Badge - Smaller */}
                      {recipe.difficulty && (
                        <div className="absolute -top-1 -right-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                            {recipe.difficulty}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Recipe Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-300 line-clamp-1">
                          {recipe.title}
                        </h3>
                        {recipe.categories && (
                          <div className="flex items-center px-2 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700 ml-2 flex-shrink-0">
                            <span className="mr-1">{recipe.categories.emoji}</span>
                            {recipe.categories.name}
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {recipe.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                          {recipe.description}
                        </p>
                      )}

                      {/* Recipe Meta - Horizontal layout */}
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                          <span className="text-gray-800">{formatTime(recipe.prep_time)} prep</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                          <span className="text-gray-800">{formatTime(recipe.cook_time)} cook</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                          <span className="text-gray-800">{recipe.servings || 'N/A'} servings</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(recipe.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Arrow Icon */}
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-emerald-500/10 transition-all duration-300 rounded-2xl"></div>
                </div>
              )
            ))}
          </div>
        )}
      </main>
    </div>
  )
}