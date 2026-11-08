# Commentate — GitHub Pages starter

A neon-styled, static front-end starter for your Commentate community website. It includes:
- Animated welcome/loading screen and first-visit update popup
- Responsive feed with a ten-post preview and an end-of-feed message
- Profile cards with bio, banner/avatar fields, follower/friend/following counts, tags, and optional verified badge
- Post and comment UI, image attachments, and private-by-default timestamps
- Music player using the two MP4 files you supplied; track owners link to their profile

## Put it on GitHub Pages
1. Create a GitHub repository named `commentate`.
2. Upload **everything inside this folder** (keep the `assets` folder).
3. In the repository, open **Settings → Pages**.
4. Under Build and deployment, choose **Deploy from a branch**, select `main` and `/ (root)`, then Save.
5. Wait for GitHub Pages to publish the site.

## Easy customization

### Profiles
Edit `profiles.js`. Each profile has an ID, username, handle, verified flag, bio, banner, avatar, counts, tags, and music.
- Use `verified: true` to show `assets/verified.png`.
- Put an image path in `avatar` or `banner`, for example `assets/neko-avatar.png`.
- Keep IDs unique.

### Posts
Edit `posts.js`. Set `authorId` to an existing profile ID; the username and verified badge are filled in automatically.
- `attachment: "assets/my-photo.jpg"` adds an image.
- `music: "Love Gaze"` adds a music label.
- `showDate: false` keeps date/time private (the starter does not display timestamps).

### Music
Edit the `tracks` array near the top of `app.js`. Add another `{title, src, ownerId}` entry and place its audio file in `assets/`. The supplied MP4s are already wired in.

## Important limitations before going public
This is a **static demo**. New posts and comments are held in the visitor's browser memory and are not shared with other visitors or saved permanently. For a real multi-user community, connect a backend such as Supabase or Firebase and add authentication, database rules, image storage, moderation, and server-side profile permissions.

A normal website **cannot reliably block screenshots**, detect every screenshot tool, prevent a visitor from switching browsers/tabs, or force them to stay on the site. Browsers intentionally keep those controls with the visitor and operating system. This starter therefore does not claim to enforce screenshot protection or lock the browser. It only shows a small courtesy notice when the visitor returns to the tab. Do not put an admin PIN or other secret in front-end JavaScript: anyone can inspect files delivered to their browser. If you later need admin-only actions, verify permissions on a server.

## Files
- `index.html` — page structure
- `styles.css` — neon visual design and responsive layout
- `app.js` — feed, profiles, comments, audio player, modals
- `profiles.js` — profile data
- `posts.js` — starter posts
- `assets/` — your reference images and music files
