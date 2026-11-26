# Che Story: a 3-language blog about Che Guevara

English, Urdu (right-to-left) and Roman Urdu. Visitors can read, search and subscribe. Only the admin can post, edit, upload and delete.

## What is inside

**For readers**
- Home, Blog, Timeline and About pages, in 3 languages with a language switch
- Search (any word, in any of the 3 languages) and topic tags on the Blog page
- Timeline page: Che's life from 1928 to 1997, event by event
- Reading progress bar, light and dark theme button, share buttons (WhatsApp, Facebook, X, copy link)
- "In his own words" quotes box and a numbered Sources list at the end of each story
- Next/previous story and "You may also like"
- Newsletter sign-up box (collects emails)

**For you (admin panel at `/admin`)**
- Write, edit, delete, save as draft, publish
- Title, summary, article and quotes in each of the 3 languages
- Topics, sources, and a cover image
- Views counter for every post
- Newsletter list with CSV download

**For Google and social media**
- Every story has its own title, description and preview image when shared on WhatsApp or Facebook
- `sitemap.xml`, `robots.txt` and structured data are made automatically

The first story, "Che Guevara: The Real Story", is already written (about 10 minutes of reading, in all 3 languages, with 11 sources).

## Run on your computer

1. Install Node.js (nodejs.org, LTS version).
2. In this folder: `npm install`
3. Start it.
   - Windows PowerShell: `$env:ADMIN_PASSWORD="your-strong-password"; npm start`
   - Mac/Linux: `ADMIN_PASSWORD="your-strong-password" npm start`
4. Open http://localhost:3000 and the admin panel at http://localhost:3000/admin

On your computer everything is saved in the `data/` folder and images in `public/uploads/`. No database is needed.
Your subscribers and view counts are in `data/subscribers.json` and `data/views.json`. They are listed in `.gitignore` so they never go to GitHub.

## Put it online with Vercel (free Hobby plan)

Vercel does not keep files on disk, so online the site saves posts in a database (Upstash Redis) and images in Vercel Blob. The code switches automatically when it finds their environment variables.

1. Push this code to GitHub, with these files at the **top level** of the repo (`server.js`, `package.json`, `views/`, `public/` and so on are not inside another folder).
2. On vercel.com: Add New, Project, import the repo. Framework Preset: **Other**. Root Directory: leave empty. Build Command: leave empty.
3. Add Environment Variables:
   - `ADMIN_PASSWORD`: a strong password (required, login stays locked without it)
   - `SESSION_SECRET`: any long random text (recommended)
   - `SITE_URL`: your address, for example `https://che-story.vercel.app` (recommended, makes share previews and the sitemap exact)
4. Press **Deploy**.
5. In the project, open the **Storage** tab:
   - Create a **Blob** store and connect it to the project (adds `BLOB_READ_WRITE_TOKEN`)
   - Add **Upstash Redis** from the Marketplace and connect it (adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`, or `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`; both are supported)
6. **Redeploy** (Deployments tab, three dots, Redeploy). New variables only work on a new deployment.
7. Open `your-site.vercel.app/admin`, log in, and write.

### First thing to check after deploying
Open `your-site/post/che-guevara-the-real-story`. If it opens, everything is wired correctly. If you get a 404, check that `vercel.json` is at the top level of the repo.

### Updating the starter story later
The first story lives in two places: in the code (`data/posts.json`) and, once Redis is connected, in the database. If you change the code version and want the database to follow, log in to the admin panel and press **Update starter story**. This replaces that one story in the database with the code version. Your other posts are not touched.

### Getting found on Google
1. Open Google Search Console, add your site, and submit `https://your-site/sitemap.xml`.
2. Test a share: paste a story link into WhatsApp. You should see the title, summary and the preview image.

## Writing a post (formatting)

In the article box:

```
## A heading
A paragraph. **bold** and *italic* work.

- a bullet point
- another one

> a quote that stands out
```

Blank line between paragraphs. In the **Sources** box, one per line: `Title | https://link` (only https links are accepted). In the **Quotes** box, one per line: `Quote text | Who said it`.

If a story is missing in one language, visitors see the English text with a small note.

## Editing the timeline
Open `public/js/timeline-data.js`. Each event has a date label (`y`), a title (`t`) and a description (`d`) in the 3 languages. Copy an existing block to add a new one.

## Folder map

- `server.js`: the backend (login, posts, search, views, newsletter, sitemap, share tags)
- `lib/store.js`: where data is saved (files on your computer, Redis online)
- `views/`: the HTML pages
- `public/`: CSS, JavaScript, images (`js/app.js` holds all translations)
- `data/posts.json`: the starter story
- `api/index.js` and `vercel.json`: let Vercel run the server

## Good to know

- **Images** up to 3MB (Vercel limits request size). Use your own images or copyright-free ones. The famous Korda photograph of Che is copyrighted.
- **Newsletter:** the site only collects emails. To send a newsletter, download the CSV and use an email service. Keep the list private and add a short privacy line on your About page.
- **View counts** count one view per visitor per 30 minutes. Search engine bots can add a few.
- **Admin login** lasts 8 hours. Changing `ADMIN_PASSWORD` or `SESSION_SECRET` logs everyone out.
- **Free database plans have limits.** For a growing blog, check the provider's limits.

## Live site

- Site: https://cheblog-rho.vercel.app
- Admin panel: https://cheblog-rho.vercel.app/admin (password only, never share it)

## Updating the code later (from a phone with Termux, or a laptop)

Every `git push` to `main` makes Vercel deploy the new version by itself.

    cd ~/che
    git pull
    git add -A
    git commit -m "Describe your change"
    git push

Posts you write in the admin panel are stored in the database, not in the code, so pushing new code never deletes them.

## If something breaks

- **Deploy has a red cross on GitHub:** open the project on vercel.com, Deployments, click the failed one, read Build Logs.
- **/admin says saving is not set up:** the Upstash Redis store is not connected yet (Storage tab, then Redeploy).
- **Image upload fails online:** the Blob store is not connected yet (Storage tab, then Redeploy).
- **Old story still shows:** log in to /admin and press "Update starter story".
- **Environment variables changed but nothing happened:** Redeploy, they only apply to new deployments.
