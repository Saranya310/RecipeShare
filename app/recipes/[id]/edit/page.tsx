'use client'

import { useState, useEffect, use } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/image-upload'
import CategorySelector from '@/components/category-selector'
import RecipeNavigation from '@/components/recipe-navigation'

interface EditRecipePageProps {
  params: Promise<{ id: string }>
}

export default function EditRecipePage({ params }: EditRecipePageProps) {
  const { id: recipeId } = use(params)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
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

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && user === null) {
      router.push('/')
    }
  }, [user, authLoading, router])

  // Fetch recipe data for editing
  useEffect(() => {
    async function fetchRecipe() {
      if (!recipeId || !user) return

      try {
        const { data: recipe, error } = await supabase
          .from('recipes')
          .select(`
            *,
            categories (
              id,
              name,
              emoji
            )
          `)
          .eq('id', recipeId)
          .eq('user_id', user.id)
          .single()

        if (error) {
          console.error('Error fetching recipe:', error)
          showToastNotification('Recipe not found or you do not have permission to edit it', 'error')
          router.push('/my-recipes')
          return
        }

        if (recipe) {
          setFormData({
            title: recipe.title || '',
            description: recipe.description || '',
            ingredients: recipe.ingredients || [''],
            instructions: recipe.instructions || [''],
            prep_time: recipe.prep_time?.toString() || '',
            cook_time: recipe.cook_time?.toString() || '',
            servings: recipe.servings?.toString() || '',
            difficulty: recipe.difficulty || 'Easy',
            image_url: recipe.image_url || '',
            category_id: recipe.category_id
          })
        }
      } catch (error) {
        console.error('Error fetching recipe:', error)
        showToastNotification('Error loading recipe', 'error')
        router.push('/my-recipes')
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [recipeId, user, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleArrayChange = (field: 'ingredients' | 'instructions', index: number, value: string) => {
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
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }))
    }
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
    if (!user || !recipeId) return

    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('recipes')
        .update({
          title: formData.title,
          description: formData.description,
          ingredients: formData.ingredients.filter(ing => ing.trim() !== ''),
          instructions: formData.instructions.filter(inst => inst.trim() !== ''),
          prep_time: parseInt(formData.prep_time) || 0,
          cook_time: parseInt(formData.cook_time) || 0,
          servings: parseInt(formData.servings) || 1,
          difficulty: formData.difficulty,
          image_url: formData.image_url,
          category_id: formData.category_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', recipeId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating recipe:', error)
        showToastNotification('Failed to update recipe. Please try again.', 'error')
        return
      }

      showToastNotification('Recipe updated successfully!', 'success')
      setTimeout(() => {
        router.push(`/recipes/${recipeId}`)
      }, 1500)
    } catch (error) {
      console.error('Error updating recipe:', error)
      showToastNotification('Failed to update recipe. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-white text-lg">🍳</span>
          </div>
          <p className="text-sm text-gray-700">Loading recipe...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <RecipeNavigation 
        title="Edit Recipe"
        subtitle="Update your recipe details"
        showBackButton={true}
        backButtonText="Back to Recipe"
        backButtonPath={`/recipes/${recipeId}`}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-2xl">✏️</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Edit Recipe</h1>
            <p className="text-gray-600 text-sm">Update your recipe details and share with the community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recipe Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                Recipe Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                placeholder="Enter your recipe title"
              />
            </div>

            {/* Recipe Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900 placeholder-gray-500 resize-none"
                placeholder="Describe your recipe..."
              />
            </div>

            {/* Recipe Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Recipe Image
              </label>
              <ImageUpload
                onImageUpload={handleImageUpload}
                currentImageUrl={formData.image_url}
              />
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <CategorySelector
                selectedCategoryId={formData.category_id}
                onCategorySelect={handleCategorySelect}
              />
            </div>

            {/* Recipe Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="prep_time" className="block text-sm font-semibold text-gray-700 mb-2">
                  Prep Time (min) *
                </label>
                <input
                  type="number"
                  id="prep_time"
                  name="prep_time"
                  value={formData.prep_time}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="cook_time" className="block text-sm font-semibold text-gray-700 mb-2">
                  Cook Time (min) *
                </label>
                <input
                  type="number"
                  id="cook_time"
                  name="cook_time"
                  value={formData.cook_time}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="servings" className="block text-sm font-semibold text-gray-700 mb-2">
                  Servings *
                </label>
                <input
                  type="number"
                  id="servings"
                  name="servings"
                  value={formData.servings}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm font-semibold text-gray-700 mb-2">
                  Difficulty *
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ingredients *
              </label>
              <div className="space-y-2">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => handleArrayChange('ingredients', index, e.target.value)}
                      placeholder={`Ingredient ${index + 1}`}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                    />
                    {formData.ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('ingredients', index)}
                        className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('ingredients')}
                  className="w-full py-3 border-2 border-dashed border-emerald-300 rounded-xl text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300"
                >
                  + Add Ingredient
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Instructions *
              </label>
              <div className="space-y-2">
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2">
                    <textarea
                      value={instruction}
                      onChange={(e) => handleArrayChange('instructions', index, e.target.value)}
                      placeholder={`Step ${index + 1}`}
                      rows={2}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white text-gray-900 placeholder-gray-500 resize-none"
                    />
                    {formData.instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('instructions', index)}
                        className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('instructions')}
                  className="w-full py-3 border-2 border-dashed border-emerald-300 rounded-xl text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300"
                >
                  + Add Step
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Updating Recipe...' : 'Update Recipe'}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/recipes/${recipeId}`)}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-6 py-4 rounded-xl shadow-lg ${
            toastType === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  )
}
