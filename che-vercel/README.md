# Che Story - 3 language blog

English, Urdu and Roman Urdu. Visitors only read. Only the admin can post, edit, upload and delete.

## Run on your computer

1. Install Node.js (nodejs.org, LTS version).
2. In this folder:

```
npm install
```

3. Start (Windows PowerShell):

```
$env:ADMIN_PASSWORD="your-strong-password"; npm start
```

Mac/Linux: `ADMIN_PASSWORD="your-strong-password" npm start`

4. Open http://localhost:3000 and the admin panel at http://localhost:3000/admin.html

On your computer, posts are saved in `data/posts.json` and images in `public/uploads/`. No database needed.

## Put it online with Vercel (free Hobby plan)

Vercel does not keep files on disk, so online the site uses a database for posts (Upstash Redis) and Vercel Blob for images. The code switches automatically when it finds their environment variables.

1. Push this code to GitHub (repo `zyanshykh/che`).
2. vercel.com, then Add New, then Project, and import the repo. Framework Preset: **Other**. Leave Build Command empty.
3. Open **Environment Variables** and add:
   - `ADMIN_PASSWORD` = a strong password (required. Without it, login stays locked on purpose)
   - `SESSION_SECRET` = any long random text (optional but recommended)
4. Press **Deploy**. The site opens, with the first story showing.
5. In the project, open the **Storage** tab:
   - Create a **Blob** store and connect it to the project (adds `BLOB_READ_WRITE_TOKEN`)
   - Add **Upstash Redis** from the Marketplace and connect it to the project (adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`, or `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`, both are supported)
6. **Redeploy** (Deployments tab, three dots, Redeploy). New environment variables only apply to new deployments.
7. Open `your-site.vercel.app/admin.html`, log in and write your first post.

Troubleshooting:
- Home page shows 404: Project Settings, Build and Output, set **Output Directory** to `public`, then redeploy.
- "Database connect nahi hai" when saving: step 5 or 6 was missed.
- "Image storage connect nahi hai": the Blob store is not connected, or you did not redeploy.

## Folder map

- `server.js`: the backend (login, posts API, image upload)
- `lib/store.js`: where posts are saved (file on your computer, Redis online)
- `api/index.js` and `vercel.json`: let Vercel run the server
- `data/posts.json`: the first story (also used as the starting content online)
- `public/`: everything visitors see (`index.html`, `about.html`, `blog.html`, `post.html`, `admin.html`, `css/`, `js/`)

## Notes

- Images up to 3MB (Vercel limits request size). Use your own images or copyright-free ones.
- Admin login lasts 8 hours and uses a signed cookie. Change `ADMIN_PASSWORD` or `SESSION_SECRET` to log everyone out.
- Free database plans have limits. For a growing blog, check the provider's limits.
