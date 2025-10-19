'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/image-upload'
import CategorySelector from '@/components/category-selector'

interface Recipe {
  id: string
  title: string
  description: string | null
  ingredients: string[]
  instructions: string[]
  prep_time: number | null
  cook_time: number | null
  servings: number | null
  difficulty: 'Easy' | 'Medium' | 'Hard' | null
  image_url: string | null
  category_id: string | null
  user_id: string
}

interface EditRecipePageProps {
  params: {
    id: string
  }
}

export default function EditRecipePage({ params }: EditRecipePageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
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

  // Fetch recipe data
  useEffect(() => {
    async function fetchRecipe() {
      if (!user) {
        router.push('/')
        return
      }

      setFetching(true)
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id) // Ensure user owns the recipe
        .single()

      if (error) {
        console.error('Error fetching recipe:', error)
        alert('Recipe not found or you do not have permission to edit it.')
        router.push('/dashboard')
        return
      }

      if (data) {
        setFormData({
          title: data.title || '',
          description: data.description || '',
          ingredients: data.ingredients && data.ingredients.length > 0 ? data.ingredients : [''],
          instructions: data.instructions && data.instructions.length > 0 ? data.instructions : [''],
          prep_time: data.prep_time ? data.prep_time.toString() : '',
          cook_time: data.cook_time ? data.cook_time.toString() : '',
          servings: data.servings ? data.servings.toString() : '',
          difficulty: data.difficulty || 'Easy',
          image_url: data.image_url || '',
          category_id: data.category_id
        })
      }
      setFetching(false)
    }

    fetchRecipe()
  }, [user, params.id, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...formData.ingredients]
    newIngredients[index] = value
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }))
  }

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }))
  }

  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        ingredients: newIngredients
      }))
    }
  }

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...formData.instructions]
    newInstructions[index] = value
    setFormData(prev => ({
      ...prev,
      instructions: newInstructions
    }))
  }

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }))
  }

  const removeInstruction = (index: number) => {
    if (formData.instructions.length > 1) {
      const newInstructions = formData.instructions.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        instructions: newInstructions
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      // Filter out empty ingredients and instructions
      const filteredIngredients = formData.ingredients.filter(ingredient => ingredient.trim() !== '')
      const filteredInstructions = formData.instructions.filter(instruction => instruction.trim() !== '')

      const { error } = await supabase
        .from('recipes')
        .update({
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
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating recipe:', error)
        alert('Error updating recipe. Please try again.')
      } else {
        alert('Recipe updated successfully!')
        router.push(`/recipes/${params.id}`)
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

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <p className="text-lg text-gray-700">Loading recipe...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Enhanced Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-emerald-100 sticky top-0 z-50">
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
                <span>Edit your recipe</span>
              </div>
              <button
                onClick={() => router.push(`/recipes/${params.id}`)}
                className="text-gray-600 hover:text-emerald-600 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-50"
              >
                ← Back to Recipe
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Header */}
        <div className="relative text-center mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/30 to-teal-100/30 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">✏️</span>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Edit Your <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Recipe</span>
            </h1>
            <p className="text-gray-600 text-xl mb-6">Update your culinary creation</p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                <span>Make improvements</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                <span>Update details</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Form Container */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100/20 to-teal-100/20 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-teal-100/20 to-emerald-100/20 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Recipe Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
              placeholder="e.g., Grandma's Chocolate Chip Cookies"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
              placeholder="Describe your recipe..."
            />
          </div>

          <CategorySelector
            selectedCategoryId={formData.category_id}
            onCategoryChange={(categoryId) => setFormData(prev => ({ ...prev, category_id: categoryId }))}
            disabled={loading}
          />

          {/* Recipe Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label htmlFor="prep_time" className="block text-sm font-medium text-gray-700 mb-2">
                Prep Time (minutes)
              </label>
              <input
                type="number"
                id="prep_time"
                name="prep_time"
                value={formData.prep_time}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
              />
            </div>

            <div>
              <label htmlFor="cook_time" className="block text-sm font-medium text-gray-700 mb-2">
                Cook Time (minutes)
              </label>
              <input
                type="number"
                id="cook_time"
                name="cook_time"
                value={formData.cook_time}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
              />
            </div>

            <div>
              <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-2">
                Servings
              </label>
              <input
                type="number"
                id="servings"
                name="servings"
                value={formData.servings}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
              />
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipe Image (optional)
            </label>
            <ImageUpload
              onImageUpload={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
              currentImageUrl={formData.image_url}
              disabled={loading}
            />
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Ingredients *
              </label>
              <button
                type="button"
                onClick={addIngredient}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                + Add Ingredient
              </button>
            </div>
            <div className="space-y-3">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    placeholder={`Ingredient ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
                  />
                  {formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="text-red-600 hover:text-red-700 px-2 py-1"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Instructions *
              </label>
              <button
                type="button"
                onClick={addInstruction}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                + Add Step
              </button>
            </div>
            <div className="space-y-3">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-medium mt-1">
                    {index + 1}
                  </div>
                  <textarea
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                    rows={2}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
                  />
                  {formData.instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="text-red-600 hover:text-red-700 px-2 py-1 mt-1"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => router.push(`/recipes/${params.id}`)}
              className="border-2 border-emerald-600 text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating Recipe...' : 'Update Recipe'}
            </button>
          </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
