# 🚨 Categories Setup Required 🚨

The categories dropdown is not showing because the `categories` table is empty. You need to populate it with the default categories.

## 🛠️ How to Fix This:

### **Option 1: Supabase Dashboard (Recommended)**

1. **Go to your Supabase Dashboard:**
   - Navigate to `https://app.supabase.com/project/<YOUR_PROJECT_REF>/sql`
   - Click **"New query"**

2. **Run this SQL script:**
   ```sql
   -- Insert default categories
   INSERT INTO categories (name, description, emoji) VALUES
     ('Appetizers', 'Start your meal with these delicious appetizers', '🥗'),
     ('Main Course', 'Hearty main dishes for any occasion', '🍖'),
     ('Desserts', 'Sweet treats to end your meal perfectly', '🍰'),
     ('Beverages', 'Refreshing drinks and beverages', '🥤'),
     ('Breakfast', 'Start your day with these morning meals', '🥞'),
     ('Lunch', 'Quick and satisfying midday meals', '🥪'),
     ('Dinner', 'Evening meals for the whole family', '🍽️'),
     ('Snacks', 'Quick bites and light treats', '🍿'),
     ('Soups', 'Warm and comforting soups', '🍲'),
     ('Salads', 'Fresh and healthy salad options', '🥙')
   ON CONFLICT (name) DO NOTHING;
   ```

3. **Click "Run" to execute the script**

### **Option 2: Table Editor**

1. **Go to Table Editor:**
   - Navigate to `https://app.supabase.com/project/<YOUR_PROJECT_REF>/editor`
   - Click on the `categories` table

2. **Add categories manually:**
   - Click **"Insert"** → **"Insert row"**
   - Add each category with:
     - `name`: e.g., "Breakfast"
     - `description`: e.g., "Start your day with these morning meals"
     - `emoji`: e.g., "🥞"

### **Option 3: Run Full Schema**

If you haven't run the full database schema yet:

1. **Go to SQL Editor:**
   - Navigate to `https://app.supabase.com/project/<YOUR_PROJECT_REF>/sql`

2. **Copy and paste the entire `supabase-schema.sql` file content**

3. **Click "Run" to execute the full schema**

---

## ✅ **After Setup:**

Once you've added the categories, the dropdown will show:
- 🥗 Appetizers
- 🍖 Main Course  
- 🍰 Desserts
- 🥤 Beverages
- 🥞 Breakfast
- 🥪 Lunch
- 🍽️ Dinner
- 🍿 Snacks
- 🍲 Soups
- 🥙 Salads

The category dropdown will work perfectly in both the **Create Recipe** and **Discover Recipes** pages!

---

## 🔍 **Verify It's Working:**

After adding categories, you can test by:
1. Going to `/create-recipe` - you should see category cards
2. Going to `/recipes` - you should see category filter buttons
3. Check the browser console for "Categories fetched: [...]" message
