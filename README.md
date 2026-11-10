# Commentate for GitHub

A self-contained, script-controlled neon community feed prototype. The visual design is intentionally kept as-is.

## Run it
Because the site uses JavaScript modules, open this folder with a local static server:
- `python -m http.server 8000`
- Then visit `http://localhost:8000`

## Easy customization

### Accounts — one file per account
Edit `profiles/owner.js` or `profiles/morning.js`. Each file has clearly separated sections for identity, avatar, profile background, badge, music/artist details, permissions, and limits. To add an account, duplicate a profile file, edit its values, then add its import and profile entry near the top of `app.js`.

- `profileBackground`: optional image URL or path, such as `assets/my-profile-bg.jpg`.
- `badge` and `badgeImage`: badge text and icon shown beside the account name and on its comments. Set `badge: ""` to hide it. Set `verified: true` to show the verification image from `assets/verified.png`.
- `musicName`: the artist / music owner label used by the music player.

### Posts — each post has its own settings
Edit `data/content.js`. Each post contains its own text, media, reactions, comments, and a `settings` section:
- `visibleComments`: number of comments shown to spectators.
- `commentsEnabled`: set to `false` to turn comments off for that post.
- `reactionsEnabled`: reserved per-post switch for post reactions.

Each comment has its own `profileId`, text, optional image, and `reactions` object. The comment reaction chips are controlled globally by `settings.commentReactionChoices`.

### General feed settings
At the bottom of `data/content.js`, change the default feed limits, admin PIN, site name, and available comment reaction emojis.

## Spectator and admin access
- Visitors have no account and are spectators: they can view the feed and profiles but cannot post or comment.
- The People navigation option is locked until admin access is unlocked.
- Admin PIN: `723X`.

## Important security note
This is a front-end prototype. The PIN and content are shipped to the browser, so this is not secure authentication. For a public GitHub Pages deployment, use a backend (for example Supabase/Firebase) with server-side authorization before allowing real users to post, edit, follow, or moderate.

## Music
The music owner / artist name comes from `profiles/owner.js` (`musicName`). Track files and titles are listed in `app.js` in the `tracks` array.

Edits made in the quick post editor only last for the current browser session. To make content permanent, edit `data/content.js` or the profile files and reload.


## Publishing an update notice
Whenever you publish a new website update, change the `version` value in
`version.json` (for example, from `1.0.1` to `1.0.2`) before committing to GitHub.
Visitors who already have Commentate open are checked every 60 seconds and see
the blue-and-white update notice when the version changes. They can click
**REFRESH WEBSITE** to load the newest version. The website never forces a
refresh without their consent.
