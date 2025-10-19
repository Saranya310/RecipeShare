'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/image-upload'

interface Profile {
  id: string
  username: string | null
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
    avatar_url: ''
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return

      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.email?.split('@')[0] || 'user',
            full_name: user.user_metadata?.full_name || '',
            bio: ''
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating profile:', createError)
        } else {
          setProfile(newProfile)
          setFormData({
            username: newProfile.username || '',
            full_name: newProfile.full_name || '',
            bio: newProfile.bio || '',
            avatar_url: newProfile.avatar_url || ''
          })
        }
      } else {
        setProfile(data)
      setFormData({
        username: data.username || '',
        full_name: data.full_name || '',
        bio: data.bio || '',
        avatar_url: data.avatar_url || ''
      })
      }
      setLoading(false)
    }

    fetchProfile()
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username.trim() || null,
          full_name: formData.full_name.trim() || null,
          bio: formData.bio.trim() || null,
          avatar_url: formData.avatar_url.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating profile:', error)
        alert('Error updating profile. Please try again.')
      } else {
        alert('Profile updated successfully!')
        // Refresh profile data
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (data) {
          setProfile(data)
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <p className="text-lg text-gray-700">Loading profile...</p>
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
                <span>Manage your profile</span>
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

      {/* Enhanced Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stunning Hero Header */}
        <div className="relative text-center mb-16">
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
                  <span className="text-white text-3xl">👤</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✨</span>
                </div>
              </div>
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Profile</span>
            </h1>
            <p className="text-gray-600 text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              Customize your personal information and make your profile uniquely yours.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center bg-white/50 rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                <span className="font-medium">Personal details</span>
              </div>
              <div className="flex items-center bg-white/50 rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-teal-500 rounded-full mr-2 animate-pulse"></span>
                <span className="font-medium">Account settings</span>
              </div>
              <div className="flex items-center bg-white/50 rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2 animate-pulse"></span>
                <span className="font-medium">Preferences</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Form Container */}
        <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
          {/* Animated background decorations */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full -translate-y-20 translate-x-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-teal-200/30 to-cyan-200/30 rounded-full translate-y-16 -translate-x-16 animate-pulse delay-500"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-emerald-100/20 to-teal-100/20 rounded-full blur-3xl"></div>
          
          <div className="relative p-10">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Stunning Profile Picture Section */}
              <div className="text-center mb-12">
                <div className="relative inline-block group">
                  {formData.avatar_url ? (
                    <div className="w-40 h-40 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gray-50 group-hover:scale-105 transition-transform duration-300">
                      <img 
                        src={formData.avatar_url} 
                        alt="Profile Avatar" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-40 h-40 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl flex items-center justify-center text-white font-bold text-5xl shadow-2xl border-4 border-white group-hover:scale-105 transition-transform duration-300">
                      {profile?.username?.charAt(0) || profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white text-lg shadow-xl">
                    ✨
                  </div>
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white text-xs shadow-lg">
                    👤
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-6 font-medium">Your profile avatar</p>
              </div>

              {/* Enhanced Basic Information */}
              <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl p-8 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                  <div className="relative">
                    <span className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                      <span className="text-white text-lg">👤</span>
                    </span>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✨</span>
                    </div>
                  </div>
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Basic Information</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="username" className="block text-sm font-semibold text-gray-800 mb-3">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg hover:shadow-xl"
                      placeholder="Enter your username"
                    />
                  </div>

                  <div>
                    <label htmlFor="full_name" className="block text-sm font-semibold text-gray-800 mb-3">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg hover:shadow-xl"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
              </div>

              {/* Enhanced Avatar Upload Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm">📸</span>
                  </span>
                  Profile Picture
                </h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Upload Avatar Image
                  </label>
                  <ImageUpload
                    onImageUpload={(url) => setFormData(prev => ({ ...prev, avatar_url: url }))}
                    currentImageUrl={formData.avatar_url}
                    disabled={saving}
                    uploadText="Upload Avatar Image"
                    bucketName="avatars"
                    folderPath="profile-pictures"
                  />
                  <p className="text-sm text-gray-600 mt-3">
                    Upload a profile picture to personalize your account. If no image is uploaded, we'll use your initials.
                  </p>
                </div>
              </div>

              {/* Enhanced Bio Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm">📝</span>
                  </span>
                  About You
                </h3>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-semibold text-gray-800 mb-3">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>


              {/* Enhanced Account Info */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-br from-gray-500 to-slate-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm">🔒</span>
                  </span>
                  Account Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">📧</span>
                      </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-800">{user.email}</p>
                  </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">📅</span>
                      </div>
                  <div>
                    <p className="text-sm text-gray-600">Member since</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(profile?.created_at || user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Submit Button */}
              <div className="flex justify-center pt-10">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white px-12 py-6 rounded-3xl text-2xl font-bold hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-4 relative overflow-hidden"
                >
                  {saving ? (
                    <>
                      <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl">✨</span>
                      <span>Update Profile</span>
                      <span className="text-3xl">🚀</span>
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
