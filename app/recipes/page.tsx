'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import CategorySelector from '@/components/category-selector-discover'
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
  category_id: string | null
  // Rating and review data
  average_rating?: number
  total_ratings?: number
  recent_review?: {
    rating: number
    review: string | null
    user_id: string
  }
}

export default function DiscoverRecipesPage() {
  const router = useRouter()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [categories, setCategories] = useState<any[]>([])

  // Fetch recipes and categories from database
  useEffect(() => {
    async function fetchData() {
      try {
        console.log('🍳 Starting to fetch recipes and categories...')
        
        // Fetch recipes with rating data
        const { data: recipesData, error: recipesError } = await supabase
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
          .order('created_at', { ascending: false })

        if (recipesError) {
          console.error('❌ Error fetching recipes:', recipesError)
          setRecipes([])
        } else {
          console.log('✅ Successfully fetched', recipesData?.length || 0, 'recipes from database')
          
          // Process recipes to include rating data
          const processedRecipes = (recipesData || []).map(recipe => {
            const ratings = recipe.recipe_ratings || []
            const average_rating = ratings.length > 0 
              ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length 
              : null
            const total_ratings = ratings.length
            const recent_review = ratings.length > 0 
              ? ratings.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg font-bold">🍳</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">RecipeShare</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="/dashboard"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
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
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-white text-lg">🔍</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            Discover <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Amazing Recipes</span>
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Explore delicious recipes from our community of home cooks
          </p>
        </div>
      </div>

      {/* Compact Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-white/20">
          <div className="text-center mb-4">
            <h2 className="text-base font-bold text-gray-900 mb-1">Find Your Perfect Recipe</h2>
            <p className="text-xs text-gray-600">Use filters to discover recipes that match your taste</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                🔍 Search Recipes
              </label>
              <input
                type="text"
                placeholder="Search by title, description, or ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white text-gray-900 placeholder-gray-500 text-sm"
              />
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                🏷️ Difficulty
              </label>
              <select 
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full h-10 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white text-gray-900 text-sm"
              >
                <option value="all">All Recipes</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                🔄 Sort
              </label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full h-10 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white text-gray-900 text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
                <option value="prep_time">Prep Time</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </div>
          </div>


          {/* Categories as List */}
          <div className="mb-3">
            <CategorySelector
              categories={categories}
              selectedCategory={filterCategory}
              onCategorySelect={setFilterCategory}
            />
          </div>
        </div>
      </div>

      {/* Recipes Display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {sortedRecipes.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-lg">🍳</span>
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-2">No recipes found</h3>
            <p className="text-gray-500 mb-4 text-sm">Start by creating your first recipe!</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/create-recipe"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
              >
                Create Recipe
              </a>
              <a
                href="/dashboard"
                className="border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors text-sm"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}