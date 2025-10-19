'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import AuthModal from '@/components/auth-modal'
import Dashboard from '@/components/dashboard'
import { supabase } from '@/lib/supabase'

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
    <div className="h-screen bg-gradient-to-br from-emerald-50 to-teal-50 overflow-hidden">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">🍳 RecipeShare</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Welcome</span>
                  <button 
                    onClick={signOut}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
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

      {/* Hero Section */}
      <main className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 h-screen flex items-center justify-center relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-300 rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-teal-300 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-cyan-300 rounded-full"></div>
          <div className="absolute bottom-32 right-1/3 w-8 h-8 bg-emerald-400 rounded-full"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Share Your
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"> Favorite Recipes</span>
            </h1>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Discover amazing recipes from home cooks around the world. Upload your own creations and inspire others with your culinary skills.
            </p>
            
            {/* Social Proof */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-semibold">👨‍🍳</div>
                <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-semibold">👩‍🍳</div>
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-semibold">🧑‍🍳</div>
              </div>
              <span className="ml-3 text-sm text-gray-500">Join home cooks around the world</span>
            </div>

            {/* Action Button */}
            <div className="flex flex-col items-center">
              <button 
                onClick={handleSignUp}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 active:scale-95"
              >
                <span className="flex items-center">
                  Start Sharing
                  <span className="ml-2 text-xl animate-bounce">👨‍🍳</span>
                </span>
              </button>
            </div>
          </div>
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
