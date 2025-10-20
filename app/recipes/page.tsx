'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

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

export default function DiscoverRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [categories, setCategories] = useState<any[]>([])

  // Fetch recipes and categories from database
  useEffect(() => {
    async function fetchData() {
      try {
        console.log('🍳 Starting to fetch recipes and categories...')
        
        // Fetch recipes
        const { data: recipesData, error: recipesError } = await supabase
          .from('recipes')
          .select('*')
          .order('created_at', { ascending: false })

        if (recipesError) {
          console.error('❌ Error fetching recipes:', recipesError)
          setRecipes([])
        } else {
          console.log('✅ Successfully fetched', recipesData?.length || 0, 'recipes from database')
          setRecipes(recipesData || [])
        }

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name')

        if (categoriesError) {
          console.error('❌ Error fetching categories:', categoriesError)
          setCategories([])
        } else {
          console.log('✅ Successfully fetched', categoriesData?.length || 0, 'categories')
          setCategories(categoriesData || [])
        }
      } catch (error) {
        console.error('❌ Unexpected error:', error)
        setRecipes([])
        setCategories([])
      }
    }

    fetchData()
  }, [])

  // Filter and sort recipes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDifficulty = filterDifficulty === 'all' || 
                             recipe.difficulty?.toLowerCase() === filterDifficulty.toLowerCase()
    
    const matchesCategory = filterCategory === 'all' || recipe.category_id === filterCategory
    
    return matchesSearch && matchesDifficulty && matchesCategory
  })

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
      case 'difficulty':
        const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 }
        return (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0) - 
               (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0)
      default:
        return 0
    }
  })


  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl font-bold">🍳</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">RecipeShare</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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

      {/* Enhanced Hero Section */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-300/10 to-teal-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <span className="text-white text-3xl">🔍</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Discover <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Amazing Recipes</span>
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Explore delicious recipes from our community of home cooks and find your next culinary adventure
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-white/20">
              <div className="text-2xl font-bold text-emerald-600">{recipes.length}</div>
              <div className="text-sm text-gray-600">Total Recipes</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-white/20">
              <div className="text-2xl font-bold text-teal-600">{categories.length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-white/20">
              <div className="text-2xl font-bold text-cyan-600">Community</div>
              <div className="text-sm text-gray-600">Driven</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Find Your Perfect Recipe</h2>
            <p className="text-gray-600">Use filters to discover recipes that match your taste and time</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-lg font-bold text-gray-800 mb-4">
                🔍 Search Recipes
              </label>
              <input
                type="text"
                placeholder="Search by title, description, or ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Filter */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-4">
                🏷️ Filter By
              </label>
              <select 
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white text-gray-900"
              >
                <option value="all">All Recipes</option>
                <option value="easy">Easy Recipes</option>
                <option value="medium">Medium Difficulty</option>
                <option value="hard">Hard Recipes</option>
                <option value="quick">Quick Meals (≤30min)</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-4">
                📂 Category
              </label>
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white text-gray-900"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.emoji} {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-4">
                🔄 Sort By
              </label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white text-gray-900"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
                <option value="prep_time">Prep Time</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <span className="text-lg font-semibold text-gray-700">View:</span>
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-emerald-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Grid
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-emerald-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                {sortedRecipes.length} recipes found
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                Community recipes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recipes Display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {sortedRecipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🍳</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No recipes found</h3>
            <p className="text-gray-500 mb-6">Start by creating your first recipe!</p>
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
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
            : 'space-y-6'
          }>
            {sortedRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden ${
                  viewMode === 'list' ? 'flex flex-row' : ''
                }`}
              >
                {/* Recipe Image */}
                <div className={`${viewMode === 'list' ? 'w-64 h-40 flex-shrink-0' : 'h-48'} relative`}>
                  {recipe.image_url ? (
                    <img
                      src={recipe.image_url}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                      <span className="text-4xl">🍳</span>
                    </div>
                  )}
                </div>

                {/* Recipe Content */}
                <div className={`p-6 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{recipe.title}</h3>
                    {recipe.difficulty && (
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ml-2 ${
                        recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {recipe.difficulty}
                      </span>
                    )}
                  </div>

                  {recipe.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
                  )}

                  {/* Recipe Meta */}
                  <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
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
                    className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    View Recipe
                    <span className="ml-2">→</span>
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