# Che Story - 3 language blog

English, Urdu and Roman Urdu. Visitors only read. Only the admin can post, edit, upload and delete.

## Run on your computer

1. Install Node.js (nodejs.org, LTS version).
2. Open a terminal in this folder and run:

```
npm install
ADMIN_PASSWORD="your-strong-password" npm start
```

On Windows PowerShell:

```
$env:ADMIN_PASSWORD="your-strong-password"; npm start
```

3. Open http://localhost:3000
4. Admin panel: http://localhost:3000/admin.html

If you do not set ADMIN_PASSWORD, the default is `admin12345`. Always change it before putting the site online.

## Folder map (good for learning)

- `server.js`: the backend (login, posts API, image upload)
- `data/posts.json`: where posts are stored
- `public/`: everything visitors see
  - `index.html`, `about.html`, `blog.html`, `post.html`: pages
  - `css/style.css`: design
  - `js/app.js`: languages + shared code
  - `admin.html` + `js/admin.js`: admin panel
  - `uploads/`: uploaded images

## Before going online

- Use HTTPS (Render, Railway or a VPS all give this) and set `NODE_ENV=production`.
- Set a strong ADMIN_PASSWORD as an environment variable.
- Back up `data/posts.json` and `public/uploads/` regularly. Some free hosts erase files on restart, so use a host with a persistent disk, or later move posts to a database.
- Use only images you own or that are copyright free.

## Learning next steps

1. Change colors in `style.css` (the `:root` variables at the top).
2. Add a new page by copying `about.html`.
3. Later: move posts from JSON to a real database (SQLite or MongoDB), add SEO and a sitemap.
