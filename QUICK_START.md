# Quick Start - Studio Eighty7

## 🚀 Start Frontend (Required)

```bash
npm run dev
```

Access at: **http://localhost:3000**

## 🔌 Backend Server (Optional)

The backend is only needed for:
- AI Oracle (Gemini API)  
- Contact Form submissions

To start backend (in separate terminal):
```bash
cd server
npm install
npm start
```

## ⚠️ About WordPress API 404 Errors

If you see errors like:
- `404 (Not Found)` for `/wp-json/wp/v2/album`
- `404 (Not Found)` for `/wp-json/wp/v2/track`
- `404 (Not Found)` for `/wp-json/wp/v2/service`

**This is EXPECTED** if your WordPress site doesn't have these custom post types registered.

### Options:

**Option 1: Set up WordPress Custom Post Types**
Add these to your WordPress theme's `functions.php`:
```php
// Register Album post type
register_post_type('album', [
  'label' => 'Albums',
  'public' => true,
  'show_in_rest' => true,
  'supports' => ['title', 'thumbnail', 'custom-fields']
]);

// Register Track post type  
register_post_type('track', [
  'label' => 'Tracks',
  'public' => true,
  'show_in_rest' => true,
  'supports' => ['title', 'thumbnail', 'custom-fields']
]);

// Register Service post type
register_post_type('service', [
  'label' => 'Services',
  'public' => true,
  'show_in_rest' => true,
  'supports' => ['title', 'editor', 'excerpt']
]);
```

**Option 2: Use Mock Data for Development**
Create mock data to test UI without WordPress.

**Option 3: Disable WordPress Features**
Remove components that depend on WordPress API until it's set up.

## ✅ Site Should Work Even Without WordPress

The following features work WITHOUT WordPress:
- ✅ Navigation
- ✅ Hero section  
- ✅ AI Oracle (if backend running)
- ✅ Contact Form (if backend running)
- ✅ All styling and layout

These features NEED WordPress:
- ❌ Albums section
- ❌ Track Player
- ❌ Services section
- ❌ About page content
