# Randomframes.com - Static Photography Portfolio

A modern, premium, single-page photography portfolio for **Savan Somaiah T P**, built with pure HTML, CSS, and JavaScript.

## Project Structure

```text
.
├── index.html
├── style.css
├── script.js
├── images/
│   ├── manifest.json
│   ├── wedding/
│   ├── portrait/
│   ├── food/
│   ├── street/
│   ├── fashion/
│   ├── landscape/
│   └── product/
├── scripts/
│   └── generate-manifest.mjs
└── .github/workflows/
    └── update-image-manifest.yml
```

## Run Locally

Use any static server from the project root:

```bash
# Python
python3 -m http.server 5500

# Or Node.js
npx serve .
```

Open: `http://localhost:5500`

## Deploy to GitHub Pages

1. Push this project to GitHub.
2. Go to **Settings > Pages**.
3. Select your branch (for example `main`) and root (`/`).
4. Save.

The same static project can also be deployed on Netlify or Vercel.

## Add or Remove Photos (GitHub only)

1. Upload/remove image files inside these folders:
  - `images/wedding-stories`
  - `images/events`
  - `images/portrait`
   - `images/food`
   - `images/street`
   - `images/fashion`
   - `images/landscape`
   - `images/product`
2. Commit and push.
3. GitHub Action automatically updates `images/manifest.json`.
4. On the next deploy, the site reflects your changes automatically.

No backend, no database, no admin panel.

## Why This Works

- The gallery loader in `script.js` reads `images/manifest.json`.
- `index.html` does not hardcode any image filenames.
- Manifest entries are generated from folder contents.

## Manual Manifest Regeneration (Optional)

If you want to update the manifest locally before push:

```bash
node scripts/generate-manifest.mjs
```

## Supported Image Types

- `.jpg`
- `.jpeg`
- `.png`
- `.webp`
- `.avif`
- `.gif`
- `.svg`
