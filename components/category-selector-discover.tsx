'use client'

interface Category {
  id: string
  name: string
  emoji: string
}

interface CategorySelectorProps {
  categories: Category[]
  selectedCategory: string
  onCategorySelect: (categoryId: string) => void
}

export default function CategorySelector({ 
  categories, 
  selectedCategory, 
  onCategorySelect 
}: CategorySelectorProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-gray-700 mb-1">Categories</div>
      <div className="flex flex-wrap gap-1 w-full">
        {/* All Categories Option */}
        <button
          onClick={() => onCategorySelect('all')}
          className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all duration-200 text-xs font-medium ${
            selectedCategory === 'all'
              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
              : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
          }`}
        >
          <div className="flex items-center justify-center space-x-1">
            <span className="text-sm">🍽️</span>
            <span>All</span>
          </div>
        </button>

        {/* Category Options */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all duration-200 text-xs font-medium ${
              selectedCategory === category.id
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-1">
              <span className="text-sm">{category.emoji}</span>
              <span className="truncate">{category.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
