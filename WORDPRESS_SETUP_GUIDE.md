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
/**
 * Studio Eighty7 - Full Automation Script
 * This registers Albums, Tracks, Services, and all ACF Fields
 */
add_action('init', function() {
    // 1. REGISTER POST TYPES
    $types = array(
        'album' => 'Albums',
        'track' => 'Tracks',
        'service' => 'Services'
    );
    foreach ($types as $slug => $label) {
        register_post_type($slug, array(
            'labels' => array('name' => $label, 'singular_name' => substr($label, 0, -1)),
            'public' => true,
            'show_in_rest' => true,
            'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
            'menu_icon' => ($slug == 'album' ? 'dashicons-album' : ($slug == 'track' ? 'dashicons-media-audio' : 'dashicons-admin-tools')),
        ));
    }

    // 2. REGISTER ACF FIELDS (Works if ACF is installed)
    if(function_exists('acf_add_local_field_group')) {

        // Album Details
        acf_add_local_field_group(array(
            'key' => 'group_album_details',
            'title' => 'Album Details',
            'fields' => array(
                array('key' => 'field_subtitle', 'label' => 'Subtitle', 'name' => 'subtitle', 'type' => 'text'),
                array('key' => 'field_year', 'label' => 'Release Year', 'name' => 'year', 'type' => 'text'),
                array('key' => 'field_tracks', 'label' => 'Number of Tracks', 'name' => 'tracks', 'type' => 'number'),
                array('key' => 'field_album_art', 'label' => 'Album Art', 'name' => 'album_art', 'type' => 'image', 'return_format' => 'url'),
                array('key' => 'field_spotify', 'label' => 'Spotify URL', 'name' => 'spotify_url', 'type' => 'url'),
                array('key' => 'field_apple', 'label' => 'Apple Music URL', 'name' => 'apple_music_url', 'type' => 'url'),
            ),
            'location' => array(array(array('param' => 'post_type', 'operator' => '==', 'value' => 'album'))),
        ));

        // Track Details
        acf_add_local_field_group(array(
            'key' => 'group_track_details',
            'title' => 'Track Details',
            'fields' => array(
                array('key' => 'field_artist', 'label' => 'Artist', 'name' => 'artist', 'type' => 'text', 'default_value' => 'Tek-Domain'),
                array('key' => 'field_duration', 'label' => 'Duration (Optional)', 'name' => 'duration', 'type' => 'text', 'instructions' => 'Leave blank to auto-detect from audio file.'),
                array('key' => 'field_genre', 'label' => 'Genre', 'name' => 'genre', 'type' => 'select',
                    'choices' => array('hip-hop'=>'Hip-Hop', 'trap'=>'Trap', 'rnb'=>'R&B', 'kompa'=>'Kompa', 'afro'=>'Afro')),
                array('key' => 'field_audio_url', 'label' => 'Audio File', 'name' => 'audio_url', 'type' => 'file', 'return_format' => 'url'),
            ),
            'location' => array(array(array('param' => 'post_type', 'operator' => '==', 'value' => 'track'))),
        ));
    }
});

/**
 * Robust Auto-detect duration from audio file
 * This runs AFTER the post is saved to ensure all fields are ready
 */
add_action('acf/save_post', function($post_id) {
    // Only run for the 'track' post type
    if (get_post_type($post_id) !== 'track') return;

    // Check if duration is already set. If not, try to auto-detect.
    $duration = get_field('duration', $post_id);

    if (empty($duration)) {
        // Get the audio file URL
        $audio_url = get_field('audio_url', $post_id);

        if ($audio_url) {
            // Convert URL to ID
            $attachment_id = attachment_url_to_postid($audio_url);

            if ($attachment_id) {
                // Get WordPress's own audio metadata
                $metadata = wp_get_attachment_metadata($attachment_id);

                if (!empty($metadata['length_formatted'])) {
                    // Save the formatted length (e.g. "3:42") back to the field
                    update_field('duration', $metadata['length_formatted'], $post_id);
                }
            }
        }
    }
}, 20);
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
