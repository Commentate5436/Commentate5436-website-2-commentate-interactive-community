# Commentate for GitHub

A self-contained, script-controlled neon community feed prototype. The visual design is intentionally kept as-is.

## Run it
Install the project's npm dependencies (there are currently none):
- `npm install`

Start the local server:
- `npm start`
- Then visit `http://localhost:8000`

## Easy customization

### Accounts — one file per account
Edit `profiles/viewer.js` or `profiles/morning.js`. Each file has clearly separated sections for identity, avatar, profile background, badge, music/artist details, permissions, and limits. To add an account, duplicate a profile file, edit its values, then add its import and profile entry near the top of `app.js`.

- `profileBackground`: optional image URL or path, such as `assets/my-profile-bg.jpg`.
- `badge` and `badgeImage`: badge text and icon shown beside the account name and on its comments. Set `badge: ""` to hide it. Set `verified: true` to show the verification image from `assets/verified.png`.
- `musicName`: the artist / music owner label used by the music player.
- `usernameEffect`: set `enabled: true` to animate the username through the listed color shades. It is disabled on every account by default.

### Vibe color
Edit the `name` and `color` values at the top of `vibe.js` to change the site's Vibe. The script applies it automatically when the page loads; there is no website setting or extra button. For an immediate change in the browser console, call `applyVibe("NEON BLUE", "#168bff")` with your own name and 3- or 6-digit hex color.

### Posts — each post has its own settings
Edit `data/content.js`. Each post contains its own text, media, reactions, comments, and a `settings` section:
- `visibleComments`: number of comments shown to spectators.
- `commentsEnabled`: set to `false` to turn comments off for that post.
- `reactionsEnabled`: reserved per-post switch for post reactions.

Each comment has its own `profileId`, text, optional image, and `reactions` object. Use the plus reaction buttons on posts or comments to pick a GIF or image from `reacts/`; existing reaction totals remain visible. Add new image filenames to `reacts/reactions.js` to make them selectable.

Posts created in the local `npm start` preview are added to the top of `data/content.js`. New comments and reactions are saved in `data/activity.json`. Commit and publish both files to include them on the public static website; the public static site cannot save new activity itself.

### Clubs
Club names, background and profile images, verification, members, following, likes, and reaction totals are configured in `clubs/clubs.js`. The images are in `clubs png/`. Following and other large counts display in compact form (for example `890K` or `9.8B`).

Feed videos include seeking, rewind, stop/reset, playback speed, and fullscreen controls.

### General feed settings
At the bottom of `data/content.js`, change the default feed limits, admin PIN, site name, and other feed settings.

## Spectator and admin access
- Visitors have no account and are spectators: they can view the feed and profiles but cannot post or comment.
- The People navigation option is locked until admin access is unlocked.
- After unlocking admin access, use the rotating-arrow button beside the star to choose an account. The star posts as that account, and new comments use it too; the plus button still posts as the site owner.
- Admin PIN: `723X`.

## Important security note
This is a front-end prototype. The PIN and content are shipped to the browser, so this is not secure authentication. For a public GitHub Pages deployment, use a backend (for example Supabase/Firebase) with server-side authorization before allowing real users to post, edit, follow, or moderate.
Keep the `npm start` preview port private: its local save endpoint uses the same PIN that is visible in the site source.

## Music
The music owner / artist name comes from `profiles/viewer.js` (`musicName`). Track files and titles are listed in `app.js` in the `tracks` array.

Posts, new comments, and emoji reactions are saved when using `npm start`. Editing or deleting existing posts or comments, and post likes, still last only for the current browser session.


## Publishing an update notice
Whenever you publish a new website update, change the `version` value in
`version.json` (for example, from `1.0.1` to `1.0.2`) before committing to GitHub.
Visitors who already have Commentate open are checked every 60 seconds and see
the blue-and-white update notice when the version changes. They can click
**REFRESH WEBSITE** to load the newest version. The website never forces a
refresh without their consent.

 {
    id: "p1795288136126",
    profileId: "geekbar",
    text: "JIP JIP SANWITCH",
    date: "2026-11-21T20:00:00.000Z",
    image: "memes/JIPPOST.jpeg",
    video: "",
    likes: 9800000000,
    reactions: { "💀": 3400000000, "😂": 2300000000, "🔥": 1800000000, "😭": 1200000000, "😳": 1100000000 },
    settings: { visibleComments: 20, commentsEnabled: true, reactionsEnabled: true },
    comments: [
      { id: "c145", profileId: "kuya", text: "WTF IS GOING ON IN COMMENTATE.", image: "", likes: 980000000, reactions: { "💀": 620000000, "😂": 240000000 } },
    ]
  },
