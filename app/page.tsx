'use client'

import Image from "next/image";
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import Dashboard from '@/components/dashboard'
import AuthModal from '@/components/auth-modal'

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const { user, signOut } = useAuth()

  // Supabase connection test state
  const [supabaseOk, setSupabaseOk] = useState<boolean | null>(null)
  const [supabaseMsg, setSupabaseMsg] = useState<string>('')

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const start = performance.now()
        const { error, count } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true })
        if (!isMounted) return
        if (error) {
          setSupabaseOk(false)
          setSupabaseMsg(error.message)
        } else {
          const ms = Math.max(1, Math.round(performance.now() - start))
          setSupabaseOk(true)
          setSupabaseMsg(`Connected • categories: ${count ?? 0} • ${ms} ms`)
        }
      } catch (err: any) {
        if (!isMounted) return
        setSupabaseOk(false)
        setSupabaseMsg(err?.message ?? 'Unknown error')
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  const handleSignIn = () => {
    setAuthMode('signin')
    setAuthModalOpen(true)
  }

  const handleSignUp = () => {
    setAuthMode('signup')
    setAuthModalOpen(true)
  }

  // If user is logged in, show dashboard
  if (user) {
    return <Dashboard />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 relative overflow-hidden">
      {/* Cooking-themed Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-orange-300/10 to-red-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Enhanced Navigation */}
      <nav className="relative bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">👨‍🍳</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  RecipeShare
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 font-medium">Welcome back!</span>
                  <button 
                    onClick={signOut}
                    className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 text-orange-700 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Supabase connection test badge */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-3">
        <div className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium shadow ${
          supabaseOk === null
            ? 'bg-gray-100 text-gray-700'
            : supabaseOk
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          <span className="inline-block h-2 w-2 rounded-full bg-current"></span>
          {supabaseOk === null ? 'Testing Supabase connection…' : supabaseMsg}
        </div>
      </div>

      {/* Recipe-Focused Hero Section */}
      <main className="relative min-h-screen py-16">
        {/* Cooking-themed background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-orange-300/20 to-red-300/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-20 h-20 bg-gradient-to-br from-yellow-300/20 to-orange-300/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-to-br from-green-300/20 to-emerald-300/20 rounded-full blur-2xl animate-pulse delay-500"></div>
          <div className="absolute bottom-40 right-1/3 w-12 h-12 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-2xl animate-pulse delay-1500"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Content */}
          <div className="text-center mb-16">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-xl mb-4">
                <span className="text-2xl">👨‍🍳</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Welcome to <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">RecipeShare</span>
            </h1>
            <p className="text-base text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover, create, and share amazing recipes with a community of passionate home cooks. From family favorites to gourmet creations, find your next culinary adventure.
            </p>
          </div>

          {/* Recipe Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300">
              <div className="text-2xl mb-2">🍝</div>
              <div className="text-sm font-semibold text-gray-800">Pasta</div>
              <div className="text-xs text-gray-500">45 recipes</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-yellow-100 hover:shadow-xl transition-all duration-300">
              <div className="text-2xl mb-2">🍰</div>
              <div className="text-sm font-semibold text-gray-800">Desserts</div>
              <div className="text-xs text-gray-500">32 recipes</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300">
              <div className="text-2xl mb-2">🥗</div>
              <div className="text-sm font-semibold text-gray-800">Salads</div>
              <div className="text-xs text-gray-500">28 recipes</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-red-100 hover:shadow-xl transition-all duration-300">
              <div className="text-2xl mb-2">🍖</div>
              <div className="text-sm font-semibold text-gray-800">Meat</div>
              <div className="text-xs text-gray-500">41 recipes</div>
            </div>
          </div>

          {/* Featured Recipe Preview */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Today's Featured Recipe</h2>
              <span className="text-sm text-gray-500">⭐ 4.8</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-400 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🍝</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Grandma's Spaghetti Carbonara</h3>
                <p className="text-sm text-gray-600">Classic Italian pasta with eggs, cheese, and pancetta</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>⏱️ 25 min</span>
                  <span>👥 4 servings</span>
                  <span>👨‍🍳 by Maria</span>
                </div>
              </div>
            </div>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 text-center border border-orange-100">
              <div className="text-2xl font-bold text-orange-600">500+</div>
              <div className="text-xs text-gray-600">Recipes</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 text-center border border-yellow-100">
              <div className="text-2xl font-bold text-yellow-600">1.2k+</div>
              <div className="text-xs text-gray-600">Home Cooks</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center border border-green-100">
              <div className="text-2xl font-bold text-green-600">4.8★</div>
              <div className="text-xs text-gray-600">Rating</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleSignUp}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">👨‍🍳</span>
                Start Cooking
              </span>
            </button>
            <button 
              onClick={handleSignIn}
              className="w-full sm:w-auto bg-white/80 backdrop-blur-sm text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">🔑</span>
                Sign In
              </span>
            </button>
          </div>
          
          <p className="mt-6 text-xs text-gray-500 text-center">Free to join • No credit card required • Start sharing in seconds</p>
        </div>
      </main>


      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        mode={authMode} 
      />
    </div>
  );
}
