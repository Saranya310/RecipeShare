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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-300/10 to-teal-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Enhanced Navigation */}
      <nav className="relative bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">🍳</span>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
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
                  className="bg-gradient-to-r from-emerald-100 to-teal-100 hover:from-emerald-200 hover:to-teal-200 text-emerald-700 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg"
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

      {/* Enhanced Hero Section */}
      <main className="relative flex items-center justify-center min-h-screen py-20">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-emerald-400/30 to-teal-400/30 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-teal-400/30 to-cyan-400/30 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-gradient-to-br from-cyan-400/30 to-blue-400/30 rounded-full blur-2xl animate-pulse delay-500"></div>
          <div className="absolute bottom-40 right-1/3 w-16 h-16 bg-gradient-to-br from-emerald-300/30 to-teal-300/30 rounded-full blur-2xl animate-pulse delay-1500"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Hero Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl shadow-2xl mb-6">
              <span className="text-4xl">🍳</span>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-white text-sm">✨</span>
            </div>
          </div>

          {/* Hero Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Share Your
            <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Favorite Recipes
            </span>
          </h1>

          {/* Hero Description */}
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover amazing recipes from home cooks around the world. Upload your own creations, 
            inspire others with your culinary skills, and build a community of passionate food lovers.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20">
              <span className="text-sm font-semibold text-gray-700">🍽️ Easy to Share</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20">
              <span className="text-sm font-semibold text-gray-700">👥 Community Driven</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20">
              <span className="text-sm font-semibold text-gray-700">⭐ Rate & Review</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20">
              <span className="text-sm font-semibold text-gray-700">❤️ Save Favorites</span>
            </div>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex -space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full border-4 border-white flex items-center justify-center text-white text-lg font-semibold shadow-lg">👨‍🍳</div>
              <div className="w-12 h-12 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full border-4 border-white flex items-center justify-center text-white text-lg font-semibold shadow-lg">👩‍🍳</div>
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full border-4 border-white flex items-center justify-center text-white text-lg font-semibold shadow-lg">🧑‍🍳</div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-4 border-white flex items-center justify-center text-white text-lg font-semibold shadow-lg">👨‍🍳</div>
            </div>
            <span className="ml-4 text-lg text-gray-600 font-medium">Join thousands of home cooks worldwide</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={handleSignUp}
              className="group relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 transition-all duration-500 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-105 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                Start Sharing
                <span className="ml-3 text-2xl group-hover:animate-bounce">🚀</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
            
            <button 
              onClick={handleSignIn}
              className="group bg-white/80 backdrop-blur-sm text-gray-700 px-10 py-5 rounded-2xl text-xl font-bold hover:bg-white/90 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 border border-white/20"
            >
              <span className="flex items-center">
                Sign In
                <span className="ml-3 text-xl group-hover:animate-pulse">👋</span>
              </span>
            </button>
          </div>

          {/* Additional Info */}
          <p className="mt-8 text-sm text-gray-500">
            Free to join • No credit card required • Start sharing in seconds
          </p>
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
