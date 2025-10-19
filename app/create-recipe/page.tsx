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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validate required fields
    if (!formData.title.trim()) {
      alert('Please enter a recipe title.')
      return
    }

    // Filter out empty ingredients and instructions
    const filteredIngredients = formData.ingredients.filter(ingredient => ingredient.trim() !== '')
    const filteredInstructions = formData.instructions.filter(instruction => instruction.trim() !== '')

    // Validate ingredients and instructions
    if (filteredIngredients.length === 0) {
      alert('Please add at least one ingredient.')
      return
    }

    if (filteredInstructions.length === 0) {
      alert('Please add at least one instruction.')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('recipes')
        .insert({
          title: formData.title,
          description: formData.description || null,
          ingredients: filteredIngredients,
          instructions: filteredInstructions,
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <RecipeNavigation 
        title="Create Recipe" 
        subtitle="Share your culinary masterpiece with the world"
        backButtonText="← Back to Dashboard"
        backButtonPath="/dashboard"
      />

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
                  <span className="text-white text-3xl">✨</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🔥</span>
                </div>
              </div>
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Create Your <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Masterpiece</span>
            </h1>
            <p className="text-gray-600 text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              Share your culinary creativity with the world. Every great recipe starts with a single idea.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center bg-white/50 rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                <span className="font-medium">Step-by-step guide</span>
              </div>
              <div className="flex items-center bg-white/50 rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-teal-500 rounded-full mr-2 animate-pulse"></span>
                <span className="font-medium">Share with community</span>
              </div>
              <div className="flex items-center bg-white/50 rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2 animate-pulse"></span>
                <span className="font-medium">Get feedback</span>
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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Enhanced Basic Information */}
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl p-8 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <div className="relative">
                  <span className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <span className="text-white text-lg">📝</span>
                  </span>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✨</span>
                  </div>
                </div>
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Basic Information</span>
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-3">
                    Recipe Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg hover:shadow-xl"
                    placeholder="e.g., Grandma's Chocolate Chip Cookies"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-3">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg hover:shadow-xl resize-none"
                    placeholder="Tell us about this recipe..."
                  />
                </div>

                <CategorySelector
                  selectedCategoryId={formData.category_id}
                  onCategoryChange={(categoryId) => setFormData(prev => ({ ...prev, category_id: categoryId }))}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Enhanced Recipe Details */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">⏱️</span>
                </span>
                Recipe Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="prep_time" className="block text-sm font-semibold text-gray-700 mb-3">
                    Prep Time (minutes)
                  </label>
                  <input
                    type="number"
                    id="prep_time"
                    name="prep_time"
                    value={formData.prep_time}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label htmlFor="cook_time" className="block text-sm font-semibold text-gray-700 mb-3">
                    Cook Time (minutes)
                  </label>
                  <input
                    type="number"
                    id="cook_time"
                    name="cook_time"
                    value={formData.cook_time}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label htmlFor="servings" className="block text-sm font-semibold text-gray-700 mb-3">
                    Servings
                  </label>
                  <input
                    type="number"
                    id="servings"
                    name="servings"
                    value={formData.servings}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Difficulty Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">⚡</span>
                </span>
                Difficulty Level
              </h3>
              
              <div>
                <label htmlFor="difficulty" className="block text-sm font-semibold text-gray-700 mb-3">
                  Choose Difficulty
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Enhanced Ingredients */}
            <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 rounded-3xl p-8 border border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <div className="relative">
                  <span className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <span className="text-white text-lg">🥘</span>
                  </span>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✨</span>
                  </div>
                </div>
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Ingredients</span>
                <span className="ml-2 text-red-500 text-lg">*</span>
              </h3>
              
              <div className="space-y-4">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => handleArrayInputChange('ingredients', index, e.target.value)}
                      placeholder={`Ingredient ${index + 1}`}
                      className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg hover:shadow-xl"
                    />
                    {formData.ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('ingredients', index)}
                        className="w-10 h-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl flex items-center justify-center transition-all duration-300"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('ingredients')}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-6 rounded-2xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 flex items-center justify-center space-x-2"
                >
                  <span className="text-xl">+</span>
                  <span>Add Ingredient</span>
                </button>
              </div>
            </div>

            {/* Enhanced Instructions */}
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl p-8 border border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <div className="relative">
                  <span className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <span className="text-white text-lg">📋</span>
                  </span>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✨</span>
                  </div>
                </div>
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Instructions</span>
                <span className="ml-2 text-red-500 text-lg">*</span>
              </h3>
              
              <div className="space-y-6">
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-green-200">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={instruction}
                          onChange={(e) => handleArrayInputChange('instructions', index, e.target.value)}
                          placeholder={`Step ${index + 1} - Describe what to do...`}
                          rows={3}
                          className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg hover:shadow-xl resize-none"
                        />
                      </div>
                      {formData.instructions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('instructions', index)}
                          className="w-10 h-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('instructions')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 flex items-center justify-center space-x-2"
                >
                  <span className="text-xl">+</span>
                  <span>Add Step</span>
                </button>
              </div>
            </div>

            {/* Enhanced Image Upload */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">📸</span>
                </span>
                Recipe Image (optional)
              </h3>
              
              <ImageUpload
                onImageUpload={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                currentImageUrl={formData.image_url}
                disabled={loading}
              />
            </div>

            {/* Enhanced Submit Button */}
            <div className="flex justify-center pt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white px-12 py-6 rounded-3xl text-2xl font-bold hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-4 relative overflow-hidden"
              >
                {loading ? (
                  <>
                    <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Recipe...</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl">✨</span>
                    <span>Create Recipe</span>
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
