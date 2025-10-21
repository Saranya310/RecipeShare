# RecipeShare - Recipe Sharing Platform

A modern, full-stack recipe sharing platform built with Next.js 15, React 19, Supabase, and Tailwind CSS.

## 🌟 Features

### Core Functionality
- **User Authentication** - Secure sign-up, sign-in, and sign-out with Supabase Auth
- **Recipe Management** - Create, read, update, and delete (CRUD) operations for recipes
- **Recipe Discovery** - Browse and search recipes with filters by category, difficulty, and sorting options
- **User Profiles** - Customizable user profiles with personal information
- **Favorites System** - Save and manage favorite recipes
- **Reviews & Ratings** - Rate and review recipes (1-5 stars with comments)
- **Image Upload** - Upload recipe images to Supabase Storage
- **Categories** - Organize recipes by categories (Breakfast, Lunch, Dinner, Desserts, Snacks, Beverages)

### User Interface
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Modern UI** - Beautiful emerald/teal color scheme with gradient backgrounds
- **Grid & List Views** - Toggle between different recipe viewing layouts
- **Real-time Updates** - Dynamic content updates
- **Toast Notifications** - User feedback for actions
- **Loading States** - Smooth loading indicators
- **Error Handling** - Graceful error messages and fallbacks

### Technical Features
- **Server Components** - React Server Components for optimal performance
- **Client Components** - Interactive UI with React hooks
- **TypeScript** - Full type safety throughout the application
- **Row Level Security** - Supabase RLS policies for data security
- **Optimistic Updates** - Fast, responsive user experience
- **SEO Optimized** - Meta tags and proper HTML structure

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18.17 or later
- npm or yarn
- Supabase account
- Git

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd recipe_sharing
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up Supabase**

Run the following SQL in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  emoji TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipes table
CREATE TABLE recipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  ingredients TEXT[] NOT NULL,
  instructions TEXT[] NOT NULL,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  image_url TEXT,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipe_favorites table
CREATE TABLE recipe_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Create recipe_ratings table
CREATE TABLE recipe_ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for recipes
CREATE POLICY "Recipes are viewable by everyone"
  ON recipes FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for recipe_favorites
CREATE POLICY "Favorites are viewable by owner"
  ON recipe_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON recipe_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
  ON recipe_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for recipe_ratings
CREATE POLICY "Ratings are viewable by everyone"
  ON recipe_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can create ratings"
  ON recipe_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON recipe_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON recipe_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- Insert default categories
INSERT INTO categories (name, description, emoji) VALUES
  ('Breakfast', 'Morning meals and brunch recipes', '🍳'),
  ('Lunch', 'Midday meals and light dishes', '🥗'),
  ('Dinner', 'Evening meals and main courses', '🍽️'),
  ('Desserts', 'Sweet treats and desserts', '🍰'),
  ('Snacks', 'Quick bites and appetizers', '🍿'),
  ('Beverages', 'Drinks and refreshments', '🥤');
```

5. **Set up Supabase Storage**

Create a storage bucket named `recipe-images`:
- Go to Storage in Supabase Dashboard
- Create new bucket: `recipe-images`
- Make it public
- Set up RLS policies for the bucket

6. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
recipe_sharing/
├── app/                      # Next.js app directory
│   ├── create-recipe/       # Create recipe page
│   ├── favorites/           # Favorites page
│   ├── my-recipes/          # User's recipes page
│   ├── my-reviews/          # User's reviews page
│   ├── profile/             # User profile page
│   ├── recipe-reviews/      # Recipe reviews page
│   ├── recipes/             # Recipe pages
│   │   ├── [id]/           # Recipe detail page
│   │   │   └── edit/       # Edit recipe page
│   │   └── page.tsx        # Discover recipes page
│   ├── dashboard/           # User dashboard
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── components/              # Reusable components
│   ├── auth-modal.tsx      # Authentication modal
│   ├── category-selector.tsx
│   ├── dashboard.tsx        # Dashboard component
│   ├── image-upload.tsx     # Image upload component
│   ├── recipe-card.tsx      # Recipe card component
│   ├── recipe-navigation.tsx
│   └── recipe-rating.tsx    # Rating component
├── lib/                     # Utility libraries
│   ├── auth-context.tsx    # Authentication context
│   └── supabase.ts         # Supabase client
├── public/                  # Static assets
├── .env.local              # Environment variables (not in git)
├── .gitignore              # Git ignore file
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies
├── tailwind.config.ts      # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Add environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Deploy!

### Environment Variables

Make sure to add these environment variables in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## 🎯 Features Roadmap

- [ ] Social sharing
- [ ] Recipe collections
- [ ] Advanced search filters
- [ ] Ingredient-based search
- [ ] Meal planning
- [ ] Shopping lists
- [ ] Recipe scaling
- [ ] Nutritional information
- [ ] Print-friendly recipe cards
- [ ] Recipe import from URLs

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

Your Name

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- Tailwind CSS for the styling system
- Vercel for hosting

---

Made with ❤️ and React
