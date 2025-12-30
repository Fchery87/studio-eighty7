# 🎯 FIX: Broken Localhost Site

## Problem Identified
You're accessing the site on the **wrong port**.

### ❌ WRONG (what you're doing):
```
http://localhost:3001  ← This is the backend API server
```

### ✅ CORRECT (what you should do):
```
http://localhost:3000  ← This is the frontend dev server
```

---

## 🚀 Quick Fix - 3 Steps

### Step 1: Stop Current Server
1. Go to terminal where server is running
2. Press **Ctrl+C** to stop

### Step 2: Start Frontend on Correct Port
```bash
cd "/home/nochaserz/Documents/Coding Projects/studio-eighty7"
npm run dev
```

### Step 3: Open Correct URL
In browser, go to: **http://localhost:3000**

---

## 📊 What's Fixed Now

| Issue | Status |
|--------|----------|
| Wrong port access | ✅ Instructions provided |
| WordPress API 404 errors | ✅ Mock data fallback added |
| Tailwind CSS not loading | ✅ Will load on port 3000 |
| CORS errors | ✅ Resolved by correct port |

---

## 🧪 After Fixing, You'll See

### ✅ Working Features
- ✅ Full styling (Tailwind CSS)
- ✅ Navigation menu
- ✅ Hero section
- ✅ Albums section (with mock data)
- ✅ Track Player (with mock data)
- ✅ Services section (with mock data)
- ✅ About section (with mock data)
- ✅ Contact Form (UI only, needs backend for submission)
- ✅ AI Oracle (needs backend for AI features)

### ❌ Features Requiring Backend
- ❌ Contact form submissions (needs backend running)
- ❌ AI Oracle AI responses (needs backend + API key)

---

## 🔌 Optional: Start Backend Server

If you want AI Oracle and Contact Form to work:

### Terminal 1 - Start Backend
```bash
cd "/home/nochaserz/Documents/Coding Projects/studio-eighty7/server"
npm install
npm start
```

### Terminal 2 - Start Frontend
```bash
cd "/home/nochaserz/Documents/Coding Projects/studio-eighty7"
npm run dev
```

Then access: **http://localhost:3000**

---

## 🎨 WordPress API Explained

### Why Were You Seeing 404 Errors?

Your WordPress site (`studioeighty7.com`) doesn't have these **custom post types** registered:
- `album` (custom post type)
- `track` (custom post type)
- `service` (custom post type)

### Solution Added

I've added **mock data fallback** so your site works even without WordPress!

When WordPress API returns 404:
- ✅ Site automatically uses mock data
- ✅ You can test all UI features
- ✅ No broken appearance

### To Use Real WordPress Data

Add this to your WordPress theme's `functions.php`:

```php
// Register Album custom post type
function register_album_post_type() {
    register_post_type('album', [
        'label' => 'Albums',
        'public' => true,
        'show_in_rest' => true,
        'supports' => ['title', 'thumbnail', 'excerpt', 'custom-fields'],
        'rewrite' => ['slug' => 'album'],
        'has_archive' => true,
    ]);
}
add_action('init', 'register_album_post_type');

// Register Track custom post type
function register_track_post_type() {
    register_post_type('track', [
        'label' => 'Tracks',
        'public' => true,
        'show_in_rest' => true,
        'supports' => ['title', 'thumbnail', 'custom-fields'],
        'rewrite' => ['slug' => 'track'],
        'has_archive' => true,
    ]);
}
add_action('init', 'register_track_post_type');

// Register Service custom post type
function register_service_post_type() {
    register_post_type('service', [
        'label' => 'Services',
        'public' => true,
        'show_in_rest' => true,
        'supports' => ['title', 'editor', 'excerpt'],
        'rewrite' => ['slug' => 'service'],
        'has_archive' => true,
    ]);
}
add_action('init', 'register_service_post_type');
```

Then save a few albums/tracks/services in WordPress with:
- Title
- Featured Image
- Custom Fields (ACF):
  - Albums: `subtitle`, `year`, `tracks`, `apple_music_url`
  - Tracks: `artist`, `duration`, `genre`, `audio_url`

---

## ✅ Verification Checklist

After fixing port, check:

- [ ] Browser shows **http://localhost:3000** (not 3001)
- [ ] Page has styling (black background, red accents)
- [ ] Album images display (even if placeholder)
- [ ] Track list is visible
- [ ] Services section shows 3 items
- [ ] No console errors about Tailwind
- [ ] Site looks like the design

---

## 🎉 You're All Set!

Just remember:
1. **Frontend = port 3000**
2. **Backend = port 3001** (optional)
3. **Mock data** makes site work without WordPress

Happy developing! 🚀
