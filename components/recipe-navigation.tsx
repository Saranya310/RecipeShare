'use client'

import { useRouter } from 'next/navigation'

interface RecipeNavigationProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
  backButtonText?: string
  backButtonPath?: string
}

export default function RecipeNavigation({ 
  title, 
  subtitle, 
  showBackButton = true, 
  backButtonText = "← Back to Dashboard",
  backButtonPath = "/dashboard"
}: RecipeNavigationProps) {
  const router = useRouter()

  return (
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
            <div className="ml-6">
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>Recipe Collection</span>
            </div>
            {showBackButton && (
              <button
                onClick={() => router.push(backButtonPath)}
                className="text-gray-600 hover:text-emerald-600 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-50"
              >
                {backButtonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
