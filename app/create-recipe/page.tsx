'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/image-upload'
import CategorySelector from '@/components/category-selector'
import RecipeNavigation from '@/components/recipe-navigation'

export default function CreateRecipe() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    prep_time: '',
    cook_time: '',
    servings: '',
    difficulty: 'Easy',
    image_url: '',
    category_id: null as string | null
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

  // Redirect if not authenticated (only after auth loading is complete)
  useEffect(() => {
    if (!authLoading && user === null) {
      // User is not authenticated, redirect to home
      router.push('/')
    }
  }, [user, authLoading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleArrayInputChange = (field: 'ingredients' | 'instructions', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayItem = (field: 'ingredients' | 'instructions') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayItem = (field: 'ingredients' | 'instructions', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }))
  }

  const handleCategorySelect = (categoryId: string | null) => {
    setFormData(prev => ({ ...prev, category_id: categoryId }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      showToastNotification('You must be logged in to create a recipe.', 'error')
      return
    }

    setLoading(true)

    // Basic validation
    if (!formData.title.trim()) {
      showToastNotification('Recipe title is required.', 'error')
      setLoading(false)
      return
    }
    if (formData.ingredients.filter(i => i.trim() !== '').length === 0) {
      showToastNotification('At least one ingredient is required.', 'error')
      setLoading(false)
      return
    }
    if (formData.instructions.filter(i => i.trim() !== '').length === 0) {
      showToastNotification('At least one instruction is required.', 'error')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('recipes')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          ingredients: formData.ingredients.filter(i => i.trim() !== ''),
          instructions: formData.instructions.filter(i => i.trim() !== ''),
          prep_time: formData.prep_time ? parseInt(formData.prep_time) : null,
          cook_time: formData.cook_time ? parseInt(formData.cook_time) : null,
          servings: formData.servings ? parseInt(formData.servings) : null,
          difficulty: formData.difficulty as 'Easy' | 'Medium' | 'Hard',
          image_url: formData.image_url || null,
          category_id: formData.category_id,
          user_id: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating recipe:', error)
        showToastNotification('Error creating recipe. Please try again.', 'error')
      } else {
        showToastNotification('Recipe created successfully!', 'success')
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      showToastNotification('An unexpected error occurred. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-white text-lg">🍳</span>
          </div>
          <p className="text-sm text-gray-700">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if user is not authenticated (only after auth loading is complete)
  if (!authLoading && user === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-lg">🔒</span>
          </div>
          <p className="text-sm text-gray-700">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 ios-safe-area">
      <RecipeNavigation 
        title="Create Recipe" 
        subtitle="Share your culinary masterpiece with the world"
        backButtonText="← Back to Dashboard"
        backButtonPath="/dashboard"
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 mobile-padding">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
              Create Your <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Recipe</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">Share your culinary creativity with the community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Recipe Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Recipe Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900 text-base mobile-touch-target"
                placeholder="Enter recipe title"
                autoComplete="off"
                autoCapitalize="words"
              />
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1"></label>
              <CategorySelector
                onCategorySelect={handleCategorySelect}
                selectedCategoryId={formData.category_id}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900 resize-none text-base mobile-touch-target"
                placeholder="Describe your recipe..."
                autoComplete="off"
                autoCapitalize="sentences"
              />
            </div>

            {/* Recipe Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Recipe Image</label>
              <ImageUpload
                onImageUpload={handleImageUpload}
                currentImageUrl={formData.image_url}
                uploadText="Upload Recipe Image"
                bucketName="recipe-images"
                folderPath="recipe-images"
              />
            </div>

            {/* Recipe Details */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Prep Time (min)</label>
                <input
                  type="number"
                  name="prep_time"
                  value={formData.prep_time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900 text-base mobile-touch-target"
                  placeholder="15"
                  min="0"
                  inputMode="numeric"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Cook Time (min)</label>
                <input
                  type="number"
                  name="cook_time"
                  value={formData.cook_time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900 text-base mobile-touch-target"
                  placeholder="30"
                  min="0"
                  inputMode="numeric"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Servings</label>
                <input
                  type="number"
                  name="servings"
                  value={formData.servings}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900 text-base mobile-touch-target"
                  placeholder="4"
                  min="1"
                  inputMode="numeric"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Difficulty</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900 text-base mobile-touch-target"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ingredients</label>
              <div className="space-y-3">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-gray-500 text-sm w-6 flex-shrink-0">{index + 1}.</span>
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => handleArrayInputChange('ingredients', index, e.target.value)}
                      className="flex-1 px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900 text-base mobile-touch-target"
                      placeholder={`Ingredient ${index + 1}`}
                      required={index === 0}
                      autoComplete="off"
                      autoCapitalize="words"
                    />
                    {formData.ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('ingredients', index)}
                        className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors mobile-touch-target flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('ingredients')}
                  className="text-emerald-600 hover:text-emerald-800 flex items-center space-x-2 text-sm font-medium mobile-touch-target w-full justify-center py-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Ingredient</span>
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Instructions</label>
              <div className="space-y-3">
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xs mt-1">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={instruction}
                        onChange={(e) => handleArrayInputChange('instructions', index, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900 resize-none text-base mobile-touch-target"
                        placeholder={`Step ${index + 1}`}
                        required={index === 0}
                        autoComplete="off"
                        autoCapitalize="sentences"
                      />
                    </div>
                    {formData.instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('instructions', index)}
                        className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors mt-1 mobile-touch-target flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('instructions')}
                  className="text-emerald-600 hover:text-emerald-800 flex items-center space-x-2 text-sm font-medium mobile-touch-target w-full justify-center py-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Step</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 sm:py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mobile-touch-target w-full sm:w-auto"
              >
                {loading ? 'Creating Recipe...' : 'Create Recipe'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Toast Notifications */}
      {showToast && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto z-50">
          <div className={`px-4 py-3 rounded-lg shadow-lg border-l-4 ${
            toastType === 'success'
              ? 'bg-green-50 border-green-500 text-green-800'
              : 'bg-red-50 border-red-500 text-red-800'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {toastType === 'success' ? (
                  <span className="text-green-500 text-lg">✅</span>
                ) : (
                  <span className="text-red-500 text-lg">❌</span>
                )}
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium">{toastMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}