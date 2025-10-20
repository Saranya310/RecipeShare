'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import RecipeNavigation from '@/components/recipe-navigation'

interface Profile {
  id: string
  username: string | null
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
    avatar_url: ''
  })
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [profileStats, setProfileStats] = useState({
    recipesCount: 0,
    favoritesCount: 0,
    reviewsCount: 0
  })

  const showToastNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (error) {
            console.error('Error fetching profile:', error)
          } else {
            setProfile(data)
            setFormData({
              username: data?.username || '',
              full_name: data?.full_name || '',
              bio: data?.bio || '',
              avatar_url: data?.avatar_url || ''
            })
          }

          // Fetch profile stats
          const [recipesResult, favoritesResult, reviewsResult] = await Promise.all([
            supabase.from('recipes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('recipe_favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('recipe_ratings').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
          ])

          setProfileStats({
            recipesCount: recipesResult.count || 0,
            favoritesCount: favoritesResult.count || 0,
            reviewsCount: reviewsResult.count || 0
          })
        } catch (error) {
          console.error('Unexpected error:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    try {
      // Convert file to base64 for now (since storage bucket doesn't exist)
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64String = e.target?.result as string
        
        // Update profile with base64 avatar URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: base64String })
          .eq('id', user.id)

        if (updateError) {
          console.error('Update error:', updateError)
          showToastNotification('Error uploading avatar. Please try again.', 'error')
        } else {
          setProfile(prev => prev ? { ...prev, avatar_url: base64String } : null)
          setFormData(prev => ({ ...prev, avatar_url: base64String }))
          showToastNotification('Avatar updated successfully!', 'success')
        }
        setUploading(false)
      }
      
      reader.onerror = () => {
        showToastNotification('Error reading file. Please try again.', 'error')
        setUploading(false)
      }
      
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Unexpected error:', error)
      showToastNotification('Error uploading avatar. Please try again.', 'error')
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    // Validation
    if (!formData.username.trim()) {
      showToastNotification('Username is required', 'error')
      return
    }

    if (formData.username.length < 3) {
      showToastNotification('Username must be at least 3 characters', 'error')
      return
    }

    if (formData.bio && formData.bio.length > 500) {
      showToastNotification('Bio must be less than 500 characters', 'error')
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          bio: formData.bio,
          avatar_url: formData.avatar_url
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating profile:', error)
        showToastNotification('Error updating profile. Please try again.', 'error')
      } else {
        setProfile(prev => prev ? { ...prev, ...formData } : null)
        setIsEditing(false)
        showToastNotification('Profile updated successfully!', 'success')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      showToastNotification('Error updating profile. Please try again.', 'error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white text-2xl">👤</span>
          </div>
          <p className="text-lg text-gray-700">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <RecipeNavigation 
        title="My Profile" 
        subtitle="Manage your account information and preferences"
        backButtonText="← Back to Dashboard"
        backButtonPath="/dashboard"
      />

      {/* Hero Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <span className="text-white text-2xl">👤</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            My <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">Profile</span>
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto mb-8">
            Manage your account information and preferences
          </p>
        </div>
      </div>

      {/* Profile Stats Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 text-center border border-emerald-200">
            <div className="text-3xl font-bold text-emerald-600 mb-2">{profileStats.recipesCount}</div>
            <div className="text-sm text-gray-600">Recipes Created</div>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 text-center border border-pink-200">
            <div className="text-3xl font-bold text-pink-600 mb-2">{profileStats.favoritesCount}</div>
            <div className="text-sm text-gray-600">Favorites Saved</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center border border-blue-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">{profileStats.reviewsCount}</div>
            <div className="text-sm text-gray-600">Reviews Written</div>
          </div>
        </div>
      </div>

      {/* Profile Details Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="relative inline-block">
              {profile?.avatar_url ? (
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500 shadow-lg mx-auto mb-4">
                  <img 
                    src={profile.avatar_url} 
                    alt="Profile Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white text-3xl">
                    {profile?.username?.charAt(0) || profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors shadow-lg"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  '📷'
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Preview:</div>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-lg mx-auto"
                  />
                  <div className="text-xs text-gray-500 mt-2">
                    Click save to confirm this image
                  </div>
                </div>
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {profile?.full_name || profile?.username || 'User'}
            </h2>
            <p className="text-gray-600">@{profile?.username || 'username'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-2">Username</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white text-gray-900"
                  placeholder="Enter username"
                />
              ) : (
                <div className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl bg-gray-50 text-gray-700">
                  {profile?.username || 'Not set'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-2">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white text-gray-900"
                  placeholder="Enter full name"
                />
              ) : (
                <div className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl bg-gray-50 text-gray-700">
                  {profile?.full_name || 'Not set'}
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-lg font-bold text-gray-800 mb-2">Email</label>
              <div className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl bg-gray-50 text-gray-700">
                {user?.email || 'Not available'}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-lg font-bold text-gray-800 mb-2">
                Bio
                {isEditing && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({formData.bio.length}/500 characters)
                  </span>
                )}
              </label>
              {isEditing ? (
                <div>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white text-gray-900 min-h-[100px]"
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {formData.bio.length > 450 && (
                      <span className="text-orange-600">Approaching character limit</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl bg-gray-50 text-gray-700 min-h-[100px]">
                  {profile?.bio || 'No bio available'}
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-lg font-bold text-gray-800 mb-2">Avatar URL</label>
              {isEditing ? (
                <input
                  type="url"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white text-gray-900"
                  placeholder="Enter image URL (or upload file above)"
                />
              ) : (
                <div className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl bg-gray-50 text-gray-700">
                  {profile?.avatar_url ? 'Avatar set' : 'No avatar set'}
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-lg font-bold text-gray-800 mb-2">Member Since</label>
              <div className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl bg-gray-50 text-gray-700">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            {isEditing ? (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleSave}
                  className="bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-purple-600 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Back to Dashboard */}
      <div className="text-center pb-16">
        <a
          href="/dashboard"
          className="border-2 border-emerald-600 text-emerald-600 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-600 hover:text-white transition-colors inline-block"
        >
          Back to Dashboard
        </a>
      </div>

      {/* Toast Notifications */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-6 py-4 rounded-xl shadow-lg border-l-4 ${
            toastType === 'success' 
              ? 'bg-green-50 border-green-500 text-green-800' 
              : 'bg-red-50 border-red-500 text-red-800'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {toastType === 'success' ? (
                  <span className="text-green-500 text-xl">✅</span>
                ) : (
                  <span className="text-red-500 text-xl">❌</span>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{toastMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}