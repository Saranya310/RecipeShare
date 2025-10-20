'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import RecipeNavigation from '@/components/recipe-navigation'

interface Profile {
  id: string
  username: string | null
  full_name: string | null
  bio: string | null
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: ''
  })
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

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
            if (error.code === 'PGRST116') {
              // Profile doesn't exist, create a default one
              console.log('No profile found, will create one when user saves')
              setProfile(null)
              setFormData({
                username: '',
                full_name: '',
                bio: ''
              })
            } else {
              console.error('Error fetching profile:', error)
              setProfile(null)
            }
          } else {
            setProfile(data)
            setFormData({
              username: data?.username || '',
              full_name: data?.full_name || '',
              bio: data?.bio || ''
            })
          }

        } catch (error) {
          console.error('Unexpected error:', error)
          setProfile(null)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    try {
      fetchProfile()
    } catch (error) {
      console.error('Error in fetchProfile:', error)
      setLoading(false)
    }
  }, [user])


  const handleSave = async () => {
    if (!user) {
      console.error('No user found')
      return
    }

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
      // First, check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking profile:', fetchError)
        showToastNotification('Error checking profile. Please try again.', 'error')
        return
      }

      let result
      if (existingProfile) {
        // Profile exists, update it
        result = await supabase
          .from('profiles')
          .update({
            username: formData.username.trim(),
            full_name: formData.full_name.trim(),
            bio: formData.bio.trim()
          })
          .eq('id', user.id)
      } else {
        // Profile doesn't exist, create it
        result = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: formData.username.trim(),
            full_name: formData.full_name.trim(),
            bio: formData.bio.trim()
          })
      }

      if (result.error) {
        console.error('Error saving profile:', result.error)
        showToastNotification('Error saving profile. Please try again.', 'error')
      } else {
        setProfile(prev => prev ? { ...prev, ...formData } : null)
        setIsEditing(false)
        showToastNotification('Profile saved successfully!', 'success')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      showToastNotification('Error saving profile. Please try again.', 'error')
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

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 border border-white/20">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <span className="text-white text-3xl">
                      {profile?.username?.charAt(0) || profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'User'}
                </h2>
                <p className="text-gray-600 mb-2">@{profile?.username || user?.email?.split('@')[0] || 'username'}</p>
                <p className="text-sm text-gray-500">
                  {profile?.created_at ? `Member since ${new Date(profile.created_at).toLocaleDateString()}` : 'New member'}
                </p>
              </div>
            </div>

          </div>

          {/* Right Column - Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/20">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Profile Information</h3>
                <p className="text-sm text-gray-600">Update your personal details and preferences</p>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-bold text-gray-800 mb-1">Username</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white text-gray-900"
                  placeholder="Enter username"
                />
              ) : (
                <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700">
                {profile?.username || 'No username set'}
              </div>
              )}
            </div>
            <div>
              <label className="block text-base font-bold text-gray-800 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white text-gray-900"
                  placeholder="Enter full name"
                />
              ) : (
                <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700">
                {profile?.full_name || 'No full name set'}
              </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-base font-bold text-gray-800 mb-1">Email</label>
                <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700">
                {user?.email || 'No email available'}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-base font-bold text-gray-800 mb-1">
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
                  {profile?.bio || 'No bio written yet'}
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-base font-bold text-gray-800 mb-1">Member Since</label>
                <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently joined'}
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            {isEditing ? (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleSave}
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-600 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg"
                >
                  Edit Profile
                </button>
            )}
            </div>
          </div>
        </div>
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
    </div>
  )
}