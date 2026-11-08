# Commentate for GitHub

A self-contained, script-controlled neon community feed prototype.

## Run it
Because the site uses JavaScript modules, open this folder with a local static server:
- Python: `python -m http.server 8000`
- Then visit `http://localhost:8000`

## Control the content in code
- `data/content.js`: seed posts, comments, reactions, and feed limits.
- `profiles/owner.js`, `profiles/guest.js`: each profile's identity, badge, artist metadata, permissions and limits. Duplicate a profile file and import it in `app.js` to add another profile.
- `app.js`: front-end behavior and music player.

## Admin key
The demo admin pin is `723X`. This is intentionally a front-end prototype: the key and all content are shipped to the browser. It is NOT secure authentication and does not protect data from a visitor who inspects source code. For a public GitHub Pages deployment, add a backend (for example Supabase/Firebase with server-side authorization) before allowing real users to post, edit, follow or moderate.

## Current behavior
- Loading animation, update-log popup, black/red neon UI and supplied room background.
- Two starter posts and two starter comments per post.
- Newest-first feed, likes, emoji reactions, comment likes and admin edit/delete controls.
- Admin pin unlocks post creation, comments and older feed items.
- Profile cards with badge, ID, artist metadata and copyable profile ID.
- Draggable/resizable music player using the two supplied MP4 files.
- Post editor accepts an image OR video path/URL.

Changes made in the quick editor exist in the current browser session only. To make them permanent, edit `data/content.js` / profile scripts and reload. This keeps the project script-driven as requested.
