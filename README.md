# Grocery Receipt PWA (v5)

**Version**: `v5` (matches `CACHE_NAME` in `sw.js`)

A shopping list app for tracking grocery items while shopping. Calculates itemized subtotals (price × quantity) and the grand total in real time. Stores history for each trip locally (`localStorage`) and can be installed as a PWA on an iPhone home screen.

## Key Features & Recent Updates

### **Version**: `v5`
- **Security Hardening**: Elimination of XSS vectors via safe DOM `textContent` rendering and strict JSON import schema validation.
- **Data Loss Prevention**: Non-destructive "Load to Today" history reuse and `QuotaExceededError` monitoring with user toast alerts.
- **Calculation Precision**: Standardized 2-decimal arithmetic rounding (`roundMoney`) for item subtotals and grand totals.
- **Web Share API**: Native iOS/Android share sheet for JSON export with graceful download fallback.
- **Performance & UI Polish**: Memoized autocomplete index, adaptive bottom bar gradients across all 6 themes, and cross-tab multi-window synchronization.
- **Accessibility**: Keyboard navigation (`Escape` key for drawer & suggestions), WCAG-compliant viewport scaling, and ARIA dialog modal roles.

### **Version**: `v4`
- **English Interface**: Complete UI localization in English.
- **Slide-in Drawer Menu (☰)**: Convenient top-left navigation menu for settings and backup tools.
- **JSON Export & Import**: Backup and restore your complete shopping history using JSON files.
- **Custom Color Themes**: Choose from 6 color themes (*Forest*, *Ocean*, *Sakura*, *Sunset*, *Grape*, and *Dark*) saved across sessions.
- **Top Running Total**: Live running total displayed above the location field on the receipt for instant visibility while adding items.
- **Mobile Responsive Layout**: Proportional input sizing (`2:1` ratio for Price and Quantity) with Flexbox overflow protection optimized for mobile/iPhone screens.

### **Version**: `v3`
- **Mobile UI Sizing Fix**: Fixed horizontal overflow issue on iPhone screens for Price and Quantity input boxes.
- **Flexbox Optimization**: Added `min-width: 0`, `width: 100%`, and 2:1 flex ratio for input fields.
- **Cache Invalidation**: Updated Service Worker cache to `grocery-receipt-v3`.

### **Version**: `v2`
- **GitHub Pages Deployment**: Configured repository structure for hosting on GitHub Pages.
- **PWA Asset Suite**: Added app icons (`icon-192`, `icon-512`, `icon-512-maskable`, `apple-touch-icon`).
- **PWA Manifest & SW**: Added `manifest.json` and `sw.js` Service Worker for offline capability.
- **Version Indicator**: Added a manual update/version check badge in the header.

### **Version**: `v1`
- **Initial Release**: Core Grocery Receipt PWA functionality.
- **Real-time Calculations**: Itemized subtotals (price × quantity) and grand total computed live.
- **Local History**: Trip history stored locally in browser `localStorage`.
- **Item Autocomplete**: Smart item suggestions based on previous shopping entries.
- **Draft Persistence**: Automatic saving of unsubmitted items in the "Today" tab.

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

## Where Data is Stored

- Everything is stored strictly in `localStorage` of the browser/PWA on that specific device; no data is synced to the cloud.
- Use the **Export History (JSON)** option in the side menu to download a backup file of your shopping history.
- Items currently being entered in the "Today" tab are automatically saved as a draft before tapping "Save Today's List", preventing data loss if the app is closed unexpectedly.

## Future App Updates

Whenever you modify `index.html`, `manifest.json`, or files inside `icons/`, bump the version number in `sw.js` (at `CACHE_NAME`), e.g., `grocery-receipt-v3` → `grocery-receipt-v4`, so Safari on iPhone fetches the new version instead of serving the cached version.
