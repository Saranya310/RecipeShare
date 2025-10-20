export default function MyReviewsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl font-bold">🍳</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">RecipeShare</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="/dashboard"
                className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <span className="text-white text-3xl">💬</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            My <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Reviews</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Reviews you've written for community recipes
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
            <div className="text-gray-600">Reviews Written</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">0</div>
            <div className="text-gray-600">5-Star Given</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">0</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
            <div className="text-gray-600">Recipes Reviewed</div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">💬</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No reviews written yet</h3>
          <p className="text-gray-500 mb-6">Start exploring recipes and share your thoughts with the community!</p>
          <a
            href="/recipes"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors mr-4 inline-block"
          >
            Browse Recipes
          </a>
          <a
            href="/dashboard"
            className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-colors inline-block"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}