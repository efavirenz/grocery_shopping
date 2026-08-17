# Grocery Receipt PWA

A shopping list app for tracking grocery items while shopping. Calculates itemized subtotals (price × quantity) and the grand total in real time. Stores history for each trip locally (`localStorage`) and can be installed as a PWA on an iPhone home screen.

## File Structure

```
grocery-pwa/
├── index.html      ← Main application page (HTML + CSS + JS all in this file)
├── manifest.json    ← PWA manifest (name, icons, theme color)
├── sw.js             ← Service Worker for offline caching
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-512-maskable.png
│   └── apple-touch-icon.png
└── README.md
```

## How to Deploy to GitHub Pages

1. Create a new repository on GitHub (e.g. `grocery-receipt`).
2. Upload all files from this folder to the root of the repo (preserve the `icons/` folder structure).
3. Go to **Settings → Pages**.
4. Select **Source: Deploy from a branch**, choose the `main` branch and `/ (root)` folder.
5. Wait a few moments, then open the URL provided by GitHub (format: `https://<username>.github.io/<repo-name>/`).

## How to Install on iPhone

1. Open the GitHub Pages link using **Safari** (must be Safari; Chrome on iOS does not support this feature).
2. Tap the **Share** button (square icon with an arrow pointing up).
3. Select **Add to Home Screen**.
4. The app icon will appear on your Home Screen. It launches in full-screen mode like a native app and works offline.

## Where Data is Stored

- Everything is stored strictly in `localStorage` of the browser/PWA on that specific device; no data is synced to the cloud.
- Clearing Safari data or deleting the app from the Home Screen will erase stored data — if backup is needed, consider adding an export feature in a future version.
- Items currently being entered in the "Today" tab are automatically saved as a draft before tapping "Save Today's List", preventing data loss if the app is closed unexpectedly.

## Future App Updates

Whenever you modify `index.html`, `manifest.json`, or files inside `icons/`, bump the version number in `sw.js` (at `CACHE_NAME`), e.g., `grocery-receipt-v1` → `grocery-receipt-v2`, so Safari on iPhone fetches the new version instead of serving the cached version.
