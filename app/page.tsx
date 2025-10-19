'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import AuthModal from '@/components/auth-modal'

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const { user, signOut } = useAuth()

  const handleSignIn = () => {
    setAuthMode('signin')
    setAuthModalOpen(true)
  }

  const handleSignUp = () => {
    setAuthMode('signup')
    setAuthModalOpen(true)
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-orange-600">🍳 RecipeShare</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Welcome, {user.email}</span>
                  <button 
                    onClick={signOut}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={handleSignIn}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={handleSignUp}
                    className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Share Your
            <span className="text-orange-600"> Favorite Recipes</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover amazing recipes from home cooks around the world. Upload your own creations and inspire others with your culinary skills.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for recipes..."
                className="w-full px-6 py-4 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-lg"
              />
              <button className="absolute right-2 top-2 bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 transition-colors">
                Search
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-orange-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-orange-700 transition-colors shadow-lg">
              Browse Recipes
            </button>
            <button className="border-2 border-orange-600 text-orange-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-orange-600 hover:text-white transition-colors">
              Upload Recipe
            </button>
          </div>
        </div>

        {/* Featured Categories */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Popular Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Desserts", emoji: "🍰", count: "1,234 recipes" },
              { name: "Main Course", emoji: "🍖", count: "2,156 recipes" },
              { name: "Appetizers", emoji: "🥗", count: "856 recipes" },
              { name: "Beverages", emoji: "🥤", count: "432 recipes" }
            ].map((category) => (
              <div key={category.name} className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-4xl mb-3">{category.emoji}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm">{category.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Recipes Preview */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Recent Recipes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Classic Chocolate Chip Cookies",
                author: "Sarah Johnson",
                time: "30 min",
                difficulty: "Easy"
              },
              {
                title: "Homemade Pasta Carbonara",
                author: "Marco Rossi",
                time: "45 min",
                difficulty: "Medium"
              },
              {
                title: "Fresh Garden Salad",
                author: "Emma Green",
                time: "15 min",
                difficulty: "Easy"
              }
            ].map((recipe, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-orange-200 to-red-200 flex items-center justify-center">
                  <span className="text-6xl">🍽️</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{recipe.title}</h3>
                  <p className="text-gray-600 mb-4">by {recipe.author}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>⏱️ {recipe.time}</span>
                    <span>📊 {recipe.difficulty}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">🍳 RecipeShare</h3>
            <p className="text-gray-400 mb-6">
              Connecting food lovers through the joy of cooking
            </p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              © 2024 RecipeShare. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        mode={authMode} 
      />
    </div>
  );
}
