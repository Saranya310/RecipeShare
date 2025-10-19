'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import CategoryFilter from '@/components/category-filter'

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

interface Category {
  id: string
  name: string
  emoji: string | null
}

export default function RecipesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  // Fetch recipes and categories
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (categoriesData) {
        setCategories(categoriesData)
      }

      // Fetch recipes with category information
      const { data: recipesData, error } = await supabase
        .from('recipes')
        .select(`
          *,
          categories (
            name,
            emoji
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching recipes:', error)
      } else {
        setRecipes(recipesData || [])
      }
      
      setLoading(false)
    }

    if (user) {
      fetchData()
    }
  }, [user])

  // Filter and search recipes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.ingredients.some(ingredient => 
                           ingredient.toLowerCase().includes(searchTerm.toLowerCase())
                         )
    
    const matchesCategory = !selectedCategory || recipe.category_id === selectedCategory
    const matchesDifficulty = !selectedDifficulty || recipe.difficulty === selectedDifficulty

    return matchesSearch && matchesCategory && matchesDifficulty
  })

  // Sort recipes
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'title':
        return a.title.localeCompare(b.title)
      case 'prep_time':
        return (a.prep_time || 0) - (b.prep_time || 0)
      default:
        return 0
    }
  })

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
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Enhanced Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-xl border-b border-emerald-100/50 sticky top-0 z-50">
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
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>Discover amazing recipes</span>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stunning Hero Header */}
        <div className="relative text-center mb-20">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/40 to-teal-200/40 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-200/40 to-cyan-200/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 rounded-full blur-2xl"></div>
          </div>
          
          <div className="relative bg-white/70 backdrop-blur-md rounded-3xl p-12 shadow-2xl border border-white/30">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl">
                  <span className="text-white text-3xl">🔍</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✨</span>
                </div>
              </div>
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Discover <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Recipes</span>
            </h1>
            <p className="text-gray-600 text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              Explore amazing recipes from our community of passionate home cooks and culinary enthusiasts.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center bg-white/50 rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                <span className="font-medium">{loading ? 'Loading...' : `${recipes.length} amazing recipe${recipes.length !== 1 ? 's' : ''}`}</span>
              </div>
              <div className="flex items-center bg-white/50 rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-teal-500 rounded-full mr-2 animate-pulse"></span>
                <span className="font-medium">From our community</span>
              </div>
              <div className="flex items-center bg-white/50 rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2 animate-pulse"></span>
                <span className="font-medium">Fresh & delicious</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-10 mb-16 border border-white/30">
          {/* Animated background decorations */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full -translate-y-20 translate-x-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-teal-200/30 to-cyan-200/30 rounded-full translate-y-16 -translate-x-16 animate-pulse delay-500"></div>
          
          <div className="relative space-y-10">
            {/* Enhanced Search */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🔍</span>
                </span>
                Search Recipes
              </label>
              <input
                type="text"
                placeholder="Search recipes, ingredients, or cooking methods..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg hover:shadow-xl"
              />
            </div>

            {/* Enhanced Category Filter */}
            <CategoryFilter
              selectedCategoryId={selectedCategory}
              onCategoryChange={setSelectedCategory}
              recipeCount={sortedRecipes.length}
            />

            {/* Enhanced Additional Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Enhanced Difficulty Filter */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm">⚡</span>
                  </span>
                  Difficulty Level
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 shadow-lg hover:shadow-xl"
                >
                  <option value="">All Levels</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              {/* Enhanced Sort */}
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
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 shadow-lg hover:shadow-xl"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title A-Z</option>
                  <option value="prep_time">Prep Time</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Results Count */}
        <div className="mb-12">
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse"></div>
              <p className="text-gray-800 font-bold text-lg">
                Showing {sortedRecipes.length} amazing recipe{sortedRecipes.length !== 1 ? 's' : ''}
                {searchTerm && ` for "${searchTerm}"`}
              </p>
              <div className="w-3 h-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full animate-pulse delay-500"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse">
                <span className="text-white text-3xl">🔍</span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
              </div>
            </div>
            <p className="mt-8 text-gray-700 text-xl font-semibold">Discovering amazing recipes...</p>
            <p className="mt-2 text-gray-500">Please wait while we fetch the latest culinary delights</p>
          </div>
        )}

        {/* Enhanced Empty State */}
        {!loading && sortedRecipes.length === 0 && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/50 via-teal-100/50 to-cyan-100/50 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/80 backdrop-blur-md rounded-3xl p-20 shadow-2xl border border-white/30 text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl">
                <span className="text-white text-5xl">🍽️</span>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-6">No Recipes Found</h3>
              <p className="text-gray-600 mb-12 text-xl max-w-lg mx-auto leading-relaxed">
                {searchTerm || selectedCategory || selectedDifficulty 
                  ? 'Try adjusting your search or filters to find more amazing recipes!'
                  : 'Be the first to share a recipe with our amazing community!'
                }
              </p>
              <button
                onClick={() => router.push('/create-recipe')}
                className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white px-12 py-6 rounded-3xl font-bold hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 text-xl relative overflow-hidden"
              >
                <span className="mr-3 text-2xl">✨</span>
                Create Recipe
                <span className="ml-3 text-2xl">🚀</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Recipes Grid */}
        {!loading && sortedRecipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {sortedRecipes.map(recipe => (
              <div key={recipe.id} className="group relative bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 hover:-translate-y-4 overflow-hidden border border-white/30">
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-teal-50/60 to-cyan-50/60 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                {/* Enhanced Recipe Image */}
                <div className="h-64 bg-gradient-to-br from-emerald-200 via-teal-200 to-cyan-200 flex items-center justify-center relative overflow-hidden rounded-t-3xl">
                  {recipe.image_url ? (
                    <img 
                      src={recipe.image_url} 
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <span className="text-7xl group-hover:scale-110 transition-transform duration-700">🍽️</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  {/* Floating action button */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <button
                      onClick={() => router.push(`/recipes/${recipe.id}`)}
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <span className="text-emerald-600 text-lg">👁️</span>
                    </button>
                  </div>
                </div>

                {/* Enhanced Recipe Content */}
                <div className="relative p-8">
                  <div className="flex items-start justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors duration-500 leading-tight">
                      {recipe.title}
                    </h3>
                    {recipe.difficulty && (
                      <span className={`px-4 py-2 rounded-2xl text-sm font-bold ml-4 ${getDifficultyColor(recipe.difficulty)} shadow-lg`}>
                        {recipe.difficulty}
                      </span>
                    )}
                  </div>

                  {recipe.description && (
                    <p className="text-gray-600 text-base mb-6 line-clamp-2 leading-relaxed">
                      {recipe.description}
                    </p>
                  )}

                  {/* Enhanced Category Display */}
                  {recipe.categories && (
                    <div className="mb-6">
                      <span className="inline-flex items-center px-4 py-2 rounded-2xl text-sm font-bold bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200 shadow-lg">
                        <span className="mr-2 text-lg">{recipe.categories.emoji}</span>
                        {recipe.categories.name}
                      </span>
                    </div>
                  )}

                  {/* Enhanced Recipe Meta */}
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="flex items-center bg-gradient-to-r from-emerald-50 to-emerald-100 px-4 py-3 rounded-2xl shadow-md">
                      <span className="mr-2 text-emerald-600 text-lg">⏱️</span>
                      <span className="font-bold text-gray-800">{formatTime(recipe.prep_time)} prep</span>
                    </div>
                    <div className="flex items-center bg-gradient-to-r from-teal-50 to-teal-100 px-4 py-3 rounded-2xl shadow-md">
                      <span className="mr-2 text-teal-600 text-lg">👥</span>
                      <span className="font-bold text-gray-800">{recipe.servings || 'N/A'} servings</span>
                    </div>
                  </div>

                  {/* Enhanced View Recipe Button */}
                  <button
                    onClick={() => router.push(`/recipes/${recipe.id}`)}
                    className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white py-4 px-6 rounded-2xl font-bold hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center text-lg relative overflow-hidden"
                  >
                    <span className="mr-2">👁️</span>
                    View Recipe
                    <span className="ml-2">🚀</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
