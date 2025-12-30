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

## Step 2: Create Custom Post Type for Albums (Using ACF)

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
