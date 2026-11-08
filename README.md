# Commentate

A self-hosted, Node.js-powered social feed starter built around your black/red neon concept and supplied room/music media.

## Run on Windows

1. Install Node.js 18 or newer.
2. Extract this ZIP.
3. Open the `Commentate` folder.
4. Copy `.env.example` to a new file named `.env`.
5. Open a terminal in this folder and run:

   ```bash
   npm install
   npm start
   ```

6. Visit **http://localhost:3000**.

The initial local admin PIN is `723X`. Change `ADMIN_PIN` in `.env` before making the server reachable by anyone else. Do not upload `.env` to GitHub.

## What is included

- Animated welcome/loading screen and first-visit patch notes.
- Responsive black/red feed with the supplied room image as a background.
- Two starter profiles and two starter posts.
- Newest-first feed. Visitors see the first two posts and up to two comments per post.
- Admin PIN login unlocks the archive and owner console.
- Owner console can publish text/image/video posts, edit profile fields, adjust post like counts, add/delete comments, and delete posts/comments.
- Click profile names to open a profile card.
- Draggable/resizable music player using the two supplied MP4 files (their audio tracks play; their tiny video visuals appear in the album window).
- JSON persistence in `data/db.json`; uploaded media is stored in `uploads/`.

## Important architecture notes

- GitHub Pages only serves static files; it cannot run this Node server or store private persistent data. For a public site, host this Node backend on a server/VPS or another Node-capable host, and point the frontend to it with a carefully configured API URL/CORS setup. This starter is configured for same-origin hosting.
- A PC-hosted server is only reachable while the PC and server process are running. `localhost` is only accessible from that PC. Do not expose your home PC directly to the public internet without an adult/experienced administrator helping with firewall, router, TLS, backups, and security.
- The PIN is server-checked, not placed in frontend JavaScript. The default is for local testing only.
- This is a starter build, not a production social network: visitor accounts, real user registration, secure password recovery, moderation queues, anti-spam, and true per-user likes/follows are not implemented. Visitors are view-only; all content management is owner-only.
- Profiles have separate stored settings and are rendered through a shared safe profile component. They do not execute arbitrary per-profile JS files; that would let profile settings run unsafe code on the site.
- Uploaded media limit is 50 MB. Only common image/video MIME types are accepted.
