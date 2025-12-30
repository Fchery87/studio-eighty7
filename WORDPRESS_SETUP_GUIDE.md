# WordPress Setup Guide for React Site

This guide shows you how to connect your WordPress backend to your React frontend.

## Prerequisites

- WordPress installed on your shared hosting
- Advanced Custom Fields (ACF) plugin
- Custom Post Type UI plugin (optional, but recommended)

## Step 1: Install Required Plugins

1.  **Advanced Custom Fields (ACF)** - Required for data points like Release Year and Audio URLs.

---

## Method A: Use the WordPress Interface (Manual)

_Follow Step 2 through Step 6 below to click through the menus._

---

## Method B: Use PHP Code (Fastest) 🚀

If you want to skip all the clicking, copy the code block below and paste it into your theme's **`functions.php`** file (or use the **"Code Snippets"** plugin).

This one block will create all the Post Types and all the Fields for you automatically.

```php
<?php
/**
 * Plugin Name: Studio Eighty7 - Headless Audio Core
 * Description: Robust Custom Post Types, Metadata Extraction, and REST API optimization for Studio Eighty7.
 * Version: 1.1.0
 */

if (!defined('ABSPATH')) exit;

/**
 * 1. REGISTER POST TYPES (Albums, Tracks, Services)
 */
add_action('init', function() {
    $common_args = array(
        'public' => true,
        'show_in_rest' => true,
        'has_archive' => false,
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
    );

    register_post_type('album', array_merge($common_args, array(
        'labels' => array('name' => 'Albums', 'singular_name' => 'Album'),
        'menu_icon' => 'dashicons-album',
    )));

    register_post_type('track', array_merge($common_args, array(
        'labels' => array('name' => 'Tracks', 'singular_name' => 'Track'),
        'menu_icon' => 'dashicons-media-audio',
    )));

    register_post_type('service', array_merge($common_args, array(
        'labels' => array('name' => 'Services', 'singular_name' => 'Service'),
        'menu_icon' => 'dashicons-admin-tools',
    )));
});

/**
 * 2. REGISTER NATIVE METADATA
 * This exposes the fields directly under the 'meta' key in the REST API.
 */
add_action('init', function() {
    $meta_fields = array(
        'audio_url' => 'esc_url_raw',
        'duration'  => 'sanitize_text_field',
        'artist'    => 'sanitize_text_field',
        'genre'     => 'sanitize_text_field',
        'album_id'  => 'absint'
    );

    foreach ($meta_fields as $meta_key => $sanitize_cb) {
        register_post_meta('track', $meta_key, array(
            'type' => ($meta_key === 'album_id' ? 'integer' : 'string'),
            'single' => true,
            'show_in_rest' => true,
            'sanitize_callback' => $sanitize_cb,
        ));
    }
});

/**
 * 3. HELPER: EXTRACT AUDIO URL FROM BLOCKS OR CONTENT
 */
function se87_extract_audio_url($content) {
    // Try Gutenberg blocks first
    if (function_exists('parse_blocks')) {
        $blocks = parse_blocks($content);
        foreach ($blocks as $block) {
            if ($block['blockName'] === 'core/audio' || $block['blockName'] === 'core/file') {
                if (!empty($block['attrs']['id'])) {
                    $url = wp_get_attachment_url((int)$block['attrs']['id']);
                    if ($url) return $url;
                }
                if (!empty($block['attrs']['src'])) return $block['attrs']['src'];
                if (!empty($block['attrs']['href'])) return $block['attrs']['href'];
            }
        }
    }

    // Fallback to Regex for Classic Editor / HTML
    if (preg_match('/<audio[^>]*src=["\']([^"']+)["\']/i', $content, $m)) return $m[1];
    if (preg_match('/<source[^>]*src=["\']([^"']+)["\']/i', $content, $m)) return $m[1];
    if (preg_match('/href=["\']([^"']+\.(mp3|wav|m4a|ogg)(\?[^"']*)?)["\']/i', $content, $m)) return $m[1];

    return '';
}

/**
 * 4. SYNC METADATA & AUTO-DETECT DURATION
 * Runs whenever a track is saved.
 */
add_action('save_post_track', function($post_id, $post) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (wp_is_post_revision($post_id)) return;

    $audio_url = get_post_meta($post_id, 'audio_url', true);

    // A. Resolve ID to URL if stored as ID
    if (is_numeric($audio_url) && $audio_url > 0) {
        $url = wp_get_attachment_url((int)$audio_url);
        if ($url) {
            update_post_meta($post_id, 'audio_url', esc_url_raw($url));
            $audio_url = $url;
        }
    }

    // B. Auto-extract from content if meta is empty
    if (empty($audio_url)) {
        $extracted = se87_extract_audio_url($post->post_content);
        if ($extracted) {
            update_post_meta($post_id, 'audio_url', esc_url_raw($extracted));
            $audio_url = $extracted;
        }
    }

    // C. Detect duration from files in Media Library
    $duration = get_post_meta($post_id, 'duration', true);
    if (empty($duration) && !empty($audio_url)) {
        $attachment_id = attachment_url_to_postid($audio_url);
        if ($attachment_id) {
            $metadata = wp_get_attachment_metadata($attachment_id);
            if (!empty($metadata['length_formatted'])) {
                update_post_meta($post_id, 'duration', $metadata['length_formatted']);
            }
        }
    }
}, 10, 2);

/**
 * 5. REST API OPTIMIZATION
 * Ensures audio_url is ALWAYS a URL in the API, never an ID.
 */
add_filter('rest_prepare_track', function($response, $post, $request) {
    $data = $response->get_data();

    // Check 'meta' field (native)
    if (!empty($data['meta']['audio_url']) && is_numeric($data['meta']['audio_url'])) {
        $url = wp_get_attachment_url((int)$data['meta']['audio_url']);
        if ($url) $data['meta']['audio_url'] = $url;
    }

    // Check 'acf' field (if still using ACF)
    if (!empty($data['acf']['audio_url']) && is_numeric($data['acf']['audio_url'])) {
        $url = wp_get_attachment_url((int)$data['acf']['audio_url']);
        if ($url) $data['acf']['audio_url'] = $url;
    }

    $response->set_data($data);
    return $response;
}, 10, 3);
```

---

Since you have **Advanced Custom Fields (ACF)** installed, you can create the post types directly in ACF. This is the recommended way.

1. Go to **ACF > Post Types > Add New**
2. Fill in the basic settings (as seen in your screenshot):
   - **Plural Label:** `Albums`
   - **Singular Label:** `Album`
   - **Post Type Key:** `album` (Must be lowercase and exactly `album`)
3. **Crucial Step: Enable REST API**
   - Toggle **"Advanced Configuration"** to ON.
   - Click the **"REST API"** tab that appears.
   - Ensure **"Show in REST API"** is toggle to **ON**. (This is what allows the React site to see the data).
4. Click **"Save Changes"** at the top right.

## Step 3: Create ACF Fields for Albums

1. Go to **ACF > Field Groups > Add New**
2. **Field Group Title:** `Album Details`
3. Add the following fields using the **"+ Add Field"** button:

| Field Label      | Field Name        | Field Type                |
| :--------------- | :---------------- | :------------------------ |
| Subtitle         | `subtitle`        | Text                      |
| Release Year     | `year`            | Number                    |
| Number of Tracks | `tracks`          | Number                    |
| Album Art        | `album_art`       | Image (Return: Image URL) |
| Spotify URL      | `spotify_url`     | URL                       |
| Apple Music URL  | `apple_music_url` | URL                       |

4. **Settings (at the bottom):**
   - **Location Rules:** Show this field group if: **Post Type** is equal to **Album**.
5. Click **"Save Changes"** at the top right.

## Step 4: Create Custom Post Type for Tracks (Using ACF)

1. Go to **ACF > Post Types > Add New**
2. Fill in:
   - **Plural Label:** `Tracks`
   - **Singular Label:** `Track`
   - **Post Type Key:** `track` (Must be lowercase)
3. **Crucial Step: Enable REST API**
   - Toggle **"Advanced Configuration"** to ON.
   - Click the **"REST API"** tab.
   - Ensure **"Show in REST API"** is toggle to **ON**.
4. Click **"Save Changes"**.

## Step 5: Create ACF Fields for Tracks

1. Go to **ACF > Field Groups > Add New**
2. **Field Group Title:** `Track Details`
3. Add the following fields:

| Field Label | Field Name  | Field Type | Choices / Instructions                                                                   |
| :---------- | :---------- | :--------- | :--------------------------------------------------------------------------------------- |
| Artist      | `artist`    | Text       | Default: "Tek-Domain"                                                                    |
| Duration    | `duration`  | Text       | Format: "3:42"                                                                           |
| Genre       | `genre`     | Select     | Choices: `hip-hop : Hip-Hop`, `trap : Trap`, `rnb : R&B`, `kompa : Kompa`, `afro : Afro` |
| Audio URL   | `audio_url` | URL        | Link to .mp3 or SoundCloud                                                               |

4. **Settings:**
   - **Location Rules:** Show this field group if: **Post Type** is equal to **Track**.
5. Click **"Save Changes"**.

## Step 6: Create Custom Post Type for Services (Using ACF)

1. Go to **ACF > Post Types > Add New**
2. Fill in:
   - **Plural Label:** `Services`
   - **Singular Label:** `Service`
   - **Post Type Key:** `service`
3. **Crucial Step: Enable REST API**
   - Toggle **"Advanced Configuration"** to ON.
   - Under the **"REST API"** tab, ensure **"Show in REST API"** is **ON**.
4. Click **"Save Changes"**.

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
