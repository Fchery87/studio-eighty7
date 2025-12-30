# WordPress Setup Guide for React Site

This guide shows you how to connect your WordPress backend to your React frontend.

## Prerequisites

- WordPress installed on your shared hosting
- Advanced Custom Fields (ACF) plugin
- Custom Post Type UI plugin (optional, but recommended)

## Step 1: Install Required Plugins

### Install these WordPress plugins:
1. **Advanced Custom Fields (ACF)** - Free version is fine
2. **Custom Post Type UI** (optional) - Easier for managing custom post types
3. **WP REST API Controller** (if needed for custom post types)

### Install ACF:
- Go to Plugins > Add New
- Search "Advanced Custom Fields"
- Install and Activate

## Step 2: Create Custom Post Type for Albums

### Option A: Using Custom Post Type UI Plugin (Easier)

1. Go to **CPT UI > Add/Edit Post Types**
2. Fill in:
   - **Post Type Slug:** `album`
   - **Plural Label:** Albums
   - **Singular Label:** Album
   - **Public:** True
   - **Show in REST API:** True (Important!)
3. Click "Save Post Type"

### Option B: Using Code (functions.php)

Add this to your theme's `functions.php`:

```php
function create_album_post_type() {
    register_post_type('album',
        array(
            'labels' => array(
                'name' => __('Albums'),
                'singular_name' => __('Album')
            ),
            'public' => true,
            'has_archive' => true,
            'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
            'show_in_rest' => true,
        )
    );
}
add_action('init', 'create_album_post_type');
```

## Step 3: Create ACF Fields for Albums

1. Go to **Custom Fields > Add New**
2. Create Field Group: "Album Details"
3. Add these fields:

**Field 1:**
- Field Label: Subtitle
- Field Name: `subtitle`
- Field Type: Text

**Field 2:**
- Field Label: Release Year
- Field Name: `year`
- Field Type: Number

**Field 3:**
- Field Label: Number of Tracks
- Field Name: `tracks`
- Field Type: Number

**Field 4:**
- Field Label: Album Art (optional override)
- Field Name: `album_art`
- Field Type: Image
- Return Value: Image URL

**Field 5:**
- Field Label: Spotify URL
- Field Name: `spotify_url`
- Field Type: URL

**Field 6:**
- Field Label: Apple Music URL
- Field Name: `apple_music_url`
- Field Type: URL

4. **Location Settings:**
   - Show this field group if: Post Type is equal to Album

5. Click **Save**

## Step 4: Create Custom Post Type for Tracks

### Using Custom Post Type UI Plugin:

1. Go to **CPT UI > Add/Edit Post Types**
2. Fill in:
   - **Post Type Slug:** `track`
   - **Plural Label:** Tracks
   - **Singular Label:** Track
   - **Public:** True
   - **Show in REST API:** True (Important!)
3. Click "Save Post Type"

## Step 5: Create ACF Fields for Tracks

1. Go to **Custom Fields > Add New**
2. Create Field Group: "Track Details"
3. Add these fields:

**Field 1:**
- Field Label: Artist
- Field Name: `artist`
- Field Type: Text

**Field 2:**
- Field Label: Duration
- Field Name: `duration`
- Field Type: Text
- Instructions: Format: "3:42"

**Field 3:**
- Field Label: Genre
- Field Name: `genre`
- Field Type: Select
- Choices:
  ```
  hip-hop : Hip-Hop
  trap : Trap
  rnb : R&B
  kompa : Kompa
  afro : Afro
  ```

**Field 4:**
- Field Label: Audio URL
- Field Name: `audio_url`
- Field Type: URL

4. **Location Settings:**
   - Show this field group if: Post Type is equal to Track

5. Click **Save**

## Step 6: Create Custom Post Type for Services

### Using Custom Post Type UI:

1. Go to **CPT UI > Add/Edit Post Types**
2. Fill in:
   - **Post Type Slug:** `service`
   - **Plural Label:** Services
   - **Singular Label:** Service
   - **Public:** True
   - **Show in REST API:** True
3. Click "Save Post Type"

## Step 7: Add Your Content in WordPress

### Add Albums:
1. Go to **Albums > Add New**
2. Title: Album name (e.g., "Tek-Domain")
3. Content: Description/excerpt
4. Featured Image: Upload album artwork
5. Fill in ACF fields (subtitle, year, tracks, etc.)
6. Click "Publish"

### Add Tracks:
1. Go to **Tracks > Add New**
2. Title: Track name
3. Featured Image: Track artwork
4. Fill in ACF fields (artist, duration, genre, audio_url)
5. Click "Publish"

### Add Services:
1. Go to **Services > Add New**
2. Title: Service name
3. Content: Description
4. Click "Publish"

## Step 8: Test API Connection

Your API endpoints will be available at:

- Albums: `https://studioeighty7.com/wp-json/wp/v2/album?_embed`
- Tracks: `https://studioeighty7.com/wp-json/wp/v2/track?_embed`
- Services: `https://studioeighty7.com/wp-json/wp/v2/service`

Test in browser:
```
https://studioeighty7.com/wp-json/wp/v2/album?_embed
```

You should see JSON data returned!

## Step 9: Update Your React Site

Your React site is already configured to fetch from WordPress!

The `wordpressService.ts` file handles all API calls:
- `fetchAlbums()` - Gets albums
- `fetchTracks()` - Gets tracks
- `fetchServices()` - Gets services

## Step 10: Future Workflow

### To Add New Content:
1. Login to WordPress
2. Add/Edit Albums, Tracks, or Services
3. The changes appear instantly on your React site!

### To Update Existing Content:
1. Go to WordPress dashboard
2. Edit the Album/Track/Service
3. Update any fields
4. Save changes
5. React site updates automatically!

## Troubleshooting

### 404 Error on API:
- Make sure "Show in REST API" is checked in CPT UI
- Permalinks might need refreshing (Settings > Permalinks > Save)

### Fields Not Showing:
- Check ACF field group location settings
- Ensure post type matches exactly

### Images Not Loading:
- Make sure "Featured Image" support is enabled in CPT
- Check `_embed` parameter is in API call

## Security Tips

1. Keep WordPress updated
2. Use strong passwords
3. Install security plugins (Wordfence, etc.)
4. Use HTTPS (SSL certificate - Hostinger provides free)

## Next Steps

- Add more ACF fields as needed
- Create custom taxonomies (genres, tags)
- Add user authentication for admin panel
- Set up automatic backups

---

Your React site is now connected to WordPress! 🎉

Content management is easy through the WordPress admin panel you're already familiar with.
