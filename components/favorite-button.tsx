'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

interface FavoriteButtonProps {
  recipeId: string
  size?: 'sm' | 'md' | 'lg'
}

export default function FavoriteButton({ recipeId, size = 'md' }: FavoriteButtonProps) {
  const { user } = useAuth()
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  // Check if recipe is favorited
  useEffect(() => {
    async function checkFavorite() {
      if (!user) {
        setChecking(false)
        return
      }

      const { data } = await supabase
        .from('recipe_favorites')
        .select('id')
        .eq('recipe_id', recipeId)
        .eq('user_id', user.id)
        .single()

      setIsFavorited(!!data)
      setChecking(false)
    }

    checkFavorite()
  }, [user, recipeId])

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('Please sign in to add favorites')
      return
    }

    setLoading(true)

    try {
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('recipe_favorites')
          .delete()
          .eq('recipe_id', recipeId)
          .eq('user_id', user.id)

        if (error) {
          console.error('Error removing favorite:', error)
          alert('Error removing from favorites. Please try again.')
          return
        }

        setIsFavorited(false)
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('recipe_favorites')
          .insert({
            recipe_id: recipeId,
            user_id: user.id
          })

        if (error) {
          console.error('Error adding favorite:', error)
          alert('Error adding to favorites. Please try again.')
          return
        }

        setIsFavorited(true)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6'
      case 'lg':
        return 'w-8 h-8'
      default:
        return 'w-7 h-7'
    }
  }

  if (checking) {
    return (
      <div className={`${getSizeClasses()} animate-pulse bg-gray-200 rounded-full`} />
    )
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`
        ${getSizeClasses()} 
        ${isFavorited 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-400 hover:text-red-500'
        }
        transition-colors duration-200
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className="w-full h-full"
        fill={isFavorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  )
}
