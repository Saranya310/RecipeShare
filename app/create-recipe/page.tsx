'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/image-upload'
import CategorySelector from '@/components/category-selector'
import RecipeNavigation from '@/components/recipe-navigation'

export default function CreateRecipe() {
  const { user } = useAuth()
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

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

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
    setFormData(prev => ({
      ...prev,
      image_url: url
    }))
  }

  const handleCategorySelect = (categoryId: string | null) => {
    setFormData(prev => ({
      ...prev,
      category_id: categoryId
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('recipes')
        .insert({
          title: formData.title,
          description: formData.description,
          ingredients: formData.ingredients.filter(item => item.trim() !== ''),
          instructions: formData.instructions.filter(item => item.trim() !== ''),
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
        alert('Error creating recipe. Please try again.')
      } else {
        alert('Recipe created successfully!')
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <RecipeNavigation 
        title="Create Recipe" 
        subtitle="Share your culinary masterpiece with the world"
        backButtonText="← Back to Dashboard"
        backButtonPath="/dashboard"
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Recipe</h1>
            <p className="text-gray-600">Share your culinary creativity with the community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Recipe Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900"
                  placeholder="Enter recipe title"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Category</label>
                <CategorySelector
                  onCategorySelect={handleCategorySelect}
                  selectedCategoryId={formData.category_id}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900 resize-none"
                placeholder="Describe your recipe..."
              />
            </div>

            {/* Recipe Image */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Recipe Image</label>
              <ImageUpload
                onImageUpload={handleImageUpload}
                currentImageUrl={formData.image_url}
                uploadText="Upload Recipe Image"
                bucketName="recipe-images"
                folderPath="recipe-images"
              />
            </div>

            {/* Recipe Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Prep Time (minutes)</label>
                <input
                  type="number"
                  name="prep_time"
                  value={formData.prep_time}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900"
                  placeholder="15"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Cook Time (minutes)</label>
                <input
                  type="number"
                  name="cook_time"
                  value={formData.cook_time}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Servings</label>
                <input
                  type="number"
                  name="servings"
                  value={formData.servings}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900"
                  placeholder="4"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Difficulty</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Ingredients */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Ingredients *</label>
              <div className="space-y-3">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => handleArrayInputChange('ingredients', index, e.target.value)}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900"
                      placeholder={`Ingredient ${index + 1}`}
                    />
                    {formData.ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('ingredients', index)}
                        className="px-3 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('ingredients')}
                  className="w-full px-4 py-3 border-2 border-dashed border-emerald-300 text-emerald-600 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300"
                >
                  + Add Ingredient
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Instructions *</label>
              <div className="space-y-3">
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">
                      {index + 1}
                    </span>
                    <textarea
                      value={instruction}
                      onChange={(e) => handleArrayInputChange('instructions', index, e.target.value)}
                      rows={2}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900 resize-none"
                      placeholder={`Step ${index + 1}`}
                    />
                    {formData.instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('instructions', index)}
                        className="px-3 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors mt-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('instructions')}
                  className="w-full px-4 py-3 border-2 border-dashed border-emerald-300 text-emerald-600 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300"
                >
                  + Add Step
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Recipe...' : 'Create Recipe'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}