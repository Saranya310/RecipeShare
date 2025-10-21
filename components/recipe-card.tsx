'use client'

import { useRouter } from 'next/navigation'

interface Recipe {
  id: string
  title: string
  description: string | null
  prep_time: number | null
  cook_time: number | null
  servings: number | null
  difficulty: 'Easy' | 'Medium' | 'Hard' | null
  image_url: string | null
  categories?: {
    name: string
    emoji: string | null
  }
  profiles?: {
    username: string | null
    full_name: string | null
  }
  created_at: string
  // Rating and review data
  average_rating?: number
  total_ratings?: number
  recent_review?: {
    rating: number
    review: string | null
    user_id: string
  }
}

interface RecipeCardProps {
  recipe: Recipe
  showAuthor?: boolean
  showCategory?: boolean
  className?: string
  compact?: boolean
}

export default function RecipeCard({ 
  recipe, 
  showAuthor = true, 
  showCategory = true,
  className = "",
  compact = false
}: RecipeCardProps) {
  const router = useRouter()

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

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)

  const handleClick = () => {
    router.push(`/recipes/${recipe.id}`)
  }

  return (
    <div 
      className={`group relative bg-white/80 backdrop-blur-sm ${compact ? 'rounded-xl shadow-lg hover:shadow-xl' : 'rounded-3xl shadow-xl hover:shadow-2xl'} transition-all duration-500 ${compact ? 'hover:-translate-y-1' : 'hover:-translate-y-3'} overflow-hidden border border-white/20 cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {/* Recipe Image */}
      <div className={`relative ${compact ? 'h-32' : 'h-48'} bg-gradient-to-br from-emerald-200 to-teal-200 overflow-hidden`}>
        {recipe.image_url ? (
          <img 
            src={recipe.image_url} 
            alt={recipe.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">🍽️</span>
          </div>
        )}
        
        {/* Difficulty Badge */}
        {recipe.difficulty && (
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(recipe.difficulty)}`}>
              {recipe.difficulty}
            </span>
          </div>
        )}

        {/* Category Badge */}
        {showCategory && recipe.categories && (
          <div className="absolute top-4 left-4">
            <div className="flex items-center px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-sm font-medium text-gray-700">
              <span className="mr-2">{recipe.categories.emoji}</span>
              {recipe.categories.name}
            </div>
          </div>
        )}
      </div>

      {/* Recipe Content */}
      <div className={compact ? 'p-4' : 'p-6'}>
        {/* Title */}
        <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-bold text-gray-900 ${compact ? 'mb-2' : 'mb-3'} line-clamp-2 group-hover:text-emerald-600 transition-colors duration-300`}>
          {recipe.title}
        </h3>

        {/* Description */}
        {recipe.description && (
          <p className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'} ${compact ? 'mb-3' : 'mb-4'} line-clamp-2 leading-relaxed`}>
            {recipe.description}
          </p>
        )}

        {/* Recipe Meta */}
        <div className={`flex items-center justify-between ${compact ? 'text-xs' : 'text-sm'} text-gray-500 ${compact ? 'mb-3' : 'mb-4'}`}>
          <div className={`flex items-center ${compact ? 'space-x-2' : 'space-x-4'}`}>
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
          </div>
        </div>

        {/* Rating Display */}
        {recipe.average_rating && recipe.total_ratings && (
          <div className={`${compact ? 'mb-3' : 'mb-4'} flex items-center justify-between`}>
            <div className="flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`${compact ? 'text-xs' : 'text-sm'} ${
                      i < Math.round(recipe.average_rating!) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <span className={`${compact ? 'text-xs' : 'text-sm'} text-gray-600 ml-2`}>
                {recipe.average_rating.toFixed(1)} ({recipe.total_ratings} review{recipe.total_ratings !== 1 ? 's' : ''})
              </span>
            </div>
          </div>
        )}

        {/* Recent Review Preview */}
        {recipe.recent_review && recipe.recent_review.review && (
          <div className={`${compact ? 'mb-3' : 'mb-4'} bg-gray-50 rounded-lg p-3`}>
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`${compact ? 'text-xs' : 'text-sm'} ${
                      i < recipe.recent_review!.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <span className={`${compact ? 'text-xs' : 'text-sm'} text-gray-600 ml-2`}>
                User {recipe.recent_review.user_id.slice(0, 8)}...
              </span>
            </div>
            <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-700 line-clamp-2`}>
              "{recipe.recent_review.review}"
            </p>
          </div>
        )}

        {/* Author */}
        {showAuthor && recipe.profiles && (
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                {recipe.profiles.username?.charAt(0) || recipe.profiles.full_name?.charAt(0) || 'U'}
              </span>
              <span>By {recipe.profiles.username || recipe.profiles.full_name || 'Unknown'}</span>
            </div>
            <div className="text-xs text-gray-500">
              {new Date(recipe.created_at).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-emerald-500/10 transition-all duration-500 rounded-3xl"></div>
    </div>
  )
}
