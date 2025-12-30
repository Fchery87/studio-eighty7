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
 * Description: Complete registration of post types (with reordering), ACF fields, and audio metadata handling.
 * Version: 3.1.0
 * Author: Studio Eighty7
 */

if (!defined('ABSPATH')) exit;

/**
 * 1. REGISTER POST TYPES
 */
add_action('init', function() {
    $common_args = array(
        'public'             => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'show_in_rest'       => true,
        'has_archive'        => false,
        'supports'           => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
    );

    if (!post_type_exists('album')) {
        register_post_type('album', array_merge($common_args, array(
            'labels' => array('name' => 'Albums', 'singular_name' => 'Album', 'add_new_item' => 'Add New Album'),
            'menu_icon' => 'dashicons-album',
            'menu_position' => 20,
        )));
    }

    if (!post_type_exists('track')) {
        register_post_type('track', array_merge($common_args, array(
            'labels' => array('name' => 'Tracks', 'singular_name' => 'Track', 'add_new_item' => 'Add New Track'),
            'menu_icon' => 'dashicons-media-audio',
            'menu_position' => 21,
            'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields', 'page-attributes'), // Added page-attributes for ordering
        )));
    }

    if (!post_type_exists('service')) {
        register_post_type('service', array_merge($common_args, array(
            'labels' => array('name' => 'Services', 'singular_name' => 'Service', 'add_new_item' => 'Add New Service'),
            'menu_icon' => 'dashicons-admin-tools',
            'menu_position' => 22,
        )));
    }
}, 0);

/**
 * 2. REGISTER ACF FIELD GROUPS (requires ACF plugin)
 */
add_action('acf/init', function() {
    if (!function_exists('acf_add_local_field_group')) return;

    // ALBUM FIELDS
    acf_add_local_field_group(array(
        'key' => 'group_se87_album',
        'title' => 'Album Details',
        'fields' => array(
            array('key' => 'field_album_subtitle', 'label' => 'Subtitle', 'name' => 'subtitle', 'type' => 'text'),
            array('key' => 'field_album_year', 'label' => 'Release Year', 'name' => 'year', 'type' => 'number'),
            array('key' => 'field_album_tracks', 'label' => 'Number of Tracks', 'name' => 'tracks', 'type' => 'number'),
            array('key' => 'field_album_art', 'label' => 'Album Art URL', 'name' => 'album_art', 'type' => 'image', 'return_format' => 'url'),
            array('key' => 'field_album_spotify', 'label' => 'Spotify URL', 'name' => 'spotify_url', 'type' => 'url'),
            array('key' => 'field_album_apple', 'label' => 'Apple Music URL', 'name' => 'apple_music_url', 'type' => 'url'),
        ),
        'location' => array(array(array('param' => 'post_type', 'operator' => '==', 'value' => 'album'))),
        'position' => 'normal',
        'style' => 'default',
    ));

    // TRACK FIELDS
    acf_add_local_field_group(array(
        'key' => 'group_se87_track',
        'title' => 'Track Details',
        'fields' => array(
            array('key' => 'field_track_artist', 'label' => 'Artist', 'name' => 'artist', 'type' => 'text', 'default_value' => 'Tek-Domain'),
            array('key' => 'field_track_duration', 'label' => 'Duration', 'name' => 'duration', 'type' => 'text', 'instructions' => 'Auto-detected on save if left empty'),
            array('key' => 'field_track_genre', 'label' => 'Genre', 'name' => 'genre', 'type' => 'select', 'choices' => array(
                'hip-hop' => 'Hip-Hop',
                'trap' => 'Trap',
                'rnb' => 'R&B',
                'kompa' => 'Kompa',
                'afro' => 'Afro',
            )),
            array('key' => 'field_track_audio', 'label' => 'Audio File', 'name' => 'audio_url', 'type' => 'file', 'return_format' => 'url', 'mime_types' => 'mp3,wav,m4a,ogg'),
            array('key' => 'field_track_album', 'label' => 'Album', 'name' => 'album_id', 'type' => 'post_object', 'post_type' => array('album'), 'return_format' => 'id'),
        ),
        'location' => array(array(array('param' => 'post_type', 'operator' => '==', 'value' => 'track'))),
        'position' => 'normal',
        'style' => 'default',
    ));

    // SERVICE FIELDS (minimal)
    acf_add_local_field_group(array(
        'key' => 'group_se87_service',
        'title' => 'Service Details',
        'fields' => array(
            array('key' => 'field_service_icon', 'label' => 'Icon', 'name' => 'icon', 'type' => 'select', 'choices' => array(
                'music' => 'Music',
                'sliders' => 'Sliders',
                'headphones' => 'Headphones',
                'mic' => 'Microphone',
            )),
            array('key' => 'field_service_price', 'label' => 'Starting Price', 'name' => 'price', 'type' => 'text'),
        ),
        'location' => array(array(array('param' => 'post_type', 'operator' => '==', 'value' => 'service'))),
        'position' => 'normal',
        'style' => 'default',
    ));
});

/**
 * 3. REGISTER NATIVE META (for REST API)
 */
add_action('init', function() {
    $track_meta = array('audio_url', 'duration', 'artist', 'genre', 'album_id');
    foreach ($track_meta as $key) {
        register_post_meta('track', $key, array('single' => true, 'show_in_rest' => true));
    }
});

/**
 * 4. HELPER: EXTRACT AUDIO URL
 */
if (!function_exists('se87_extract_audio_url')) {
    function se87_extract_audio_url($content) {
        if (function_exists('parse_blocks')) {
            $blocks = parse_blocks($content);
            foreach ($blocks as $block) {
                if ($block['blockName'] === 'core/audio' || $block['blockName'] === 'core/file') {
                    if (!empty($block['attrs']['id'])) return wp_get_attachment_url((int)$block['attrs']['id']);
                    if (!empty($block['attrs']['src'])) return $block['attrs']['src'];
                }
            }
        }
        if (preg_match('/src=["\x27]([^"\x27]+\.(mp3|wav|m4a|ogg))["\x27]/i', $content, $m)) return $m[1];
        return '';
    }
}

/**
 * 5. AUTO-DETECT DURATION ON SAVE
 */
add_action('save_post_track', function($post_id, $post) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (wp_is_post_revision($post_id)) return;

    // Get audio URL from ACF or meta
    $audio_url = get_field('audio_url', $post_id);
    if (empty($audio_url)) $audio_url = get_post_meta($post_id, 'audio_url', true);

    // If it's an ID, convert to URL
    if (is_numeric($audio_url) && $audio_url > 0) {
        $url = wp_get_attachment_url((int)$audio_url);
        if ($url) {
            update_field('audio_url', $url, $post_id);
            update_post_meta($post_id, 'audio_url', $url);
            $audio_url = $url;
        }
    }

    // Auto-detect duration
    $duration = get_field('duration', $post_id);
    if (empty($duration) && !empty($audio_url)) {
        $attachment_id = attachment_url_to_postid($audio_url);
        if ($attachment_id) {
            $metadata = wp_get_attachment_metadata($attachment_id);
            if (!empty($metadata['length_formatted'])) {
                $duration = $metadata['length_formatted'];
            } elseif (!empty($metadata['length'])) {
                $seconds = round($metadata['length']);
                $duration = sprintf('%d:%02d', floor($seconds / 60), $seconds % 60);
            }
            if ($duration) {
                update_field('duration', $duration, $post_id);
                update_post_meta($post_id, 'duration', $duration);
            }
        }
    }
}, 10, 2);

/**
 * 6. REST API OPTIMIZATION
 */
add_filter('rest_prepare_track', function($response, $post) {
    if (is_wp_error($response)) return $response;
    $data = $response->get_data();

    // Ensure audio_url is always a URL
    foreach (array('meta', 'acf') as $section) {
        if (!empty($data[$section]['audio_url']) && is_numeric($data[$section]['audio_url'])) {
            $url = wp_get_attachment_url((int)$data[$section]['audio_url']);
            if ($url) $data[$section]['audio_url'] = $url;
        }
    }

    $response->set_data($data);
    return $response;
}, 10, 2);
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

### Step 5: How to Reorder Tracks

To move tracks from top to bottom (or anywhere else), you should use a reordering plugin for the best experience:

1.  **Install Plugin**: Go to **Plugins > Add New** and search for **"Post Types Order"**. Install and Activate it.
2.  **Reorder**: Go to **Tracks > Re-Order**.
3.  **Drag & Drop**: Simply drag the tracks to your desired order.
4.  **Save**: Click the **"Update"** button at the bottom.
5.  **React Site**: Your React site will automatically fetch tracks in this exact order!

## Step 6: Create ACF Fields for Tracks

1. Go to **ACF > Field Groups > Add New**
2. **Field Group Title:** `Track Details`
3. Add the following fields:

| Artist | `artist` | Text | Default: "Tek-Domain" |
| Duration | `duration` | Text | Format: "3:42" (Auto-detected if empty) |
| Genre | `genre` | Select | Choices: `hip-hop : Hip-Hop`, `trap : Trap`, `rnb : R&B`, `kompa : Kompa`, `afro : Afro` |
| Audio File | `audio_url` | File (Return: File URL) | MP3 or WAV file |
| Album ID | `album_id` | Post Object (Return: ID) | Select the Album this track belongs to |

4. **Settings:**
   - **Location Rules:** Show this field group if: **Post Type** is equal to **Track**.
5. Click **"Save Changes"**.

## Step 7: Create Custom Post Type for Services (Using ACF)

1. Go to **ACF > Post Types > Add New**
2. Fill in:
   - **Plural Label:** `Services`
   - **Singular Label:** `Service`
   - **Post Type Key:** `service`
3. **Crucial Step: Enable REST API**
   - Toggle **"Advanced Configuration"** to ON.
   - Under the **"REST API"** tab, ensure **"Show in REST API"** is **ON**.
4. Click **"Save Changes"**.

## Step 7: Create ACF Fields for Services

1. Go to **ACF > Field Groups > Add New**
2. **Field Group Title:** `Service Details`
3. Add the following fields:

| Field Label    | Field Name | Field Type | Choices / Instructions                                                                       |
| :------------- | :--------- | :--------- | :------------------------------------------------------------------------------------------- |
| Icon           | `icon`     | Select     | Choices: `music : Music`, `sliders : Sliders`, `headphones : Headphones`, `mic : Microphone` |
| Starting Price | `price`    | Text       | Example: "$50"                                                                               |

4. **Settings:**
   - **Location Rules:** Show this field group if: **Post Type** is equal to **Service**.
5. Click **"Save Changes"**.

## Step 8: Add Your Content in WordPress

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
4. Fill in ACF fields (artist, duration, genre, audio_url, album_id)
5. Click "Publish"

### Add Services:

1. Go to **Services > Add New**
2. Title: Service name
3. Content: Description
4. Fill in ACF fields (icon, price)
5. Click "Publish"

## Step 9: Test API Connection

Your API endpoints will be available at:

- Albums: `https://studioeighty7.com/wp-json/wp/v2/album?_embed`
- Tracks: `https://studioeighty7.com/wp-json/wp/v2/track?_embed`
- Services: `https://studioeighty7.com/wp-json/wp/v2/service`

Test in browser:

```
https://studioeighty7.com/wp-json/wp/v2/album?_embed
```

You should see JSON data returned!

## Step 10: Update Your React Site

Your React site is already configured to fetch from WordPress!

The `wordpressService.ts` file handles all API calls:

- `fetchAlbums()` - Gets albums
- `fetchTracks()` - Gets tracks
- `fetchServices()` - Gets services

## Step 11: Future Workflow

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
