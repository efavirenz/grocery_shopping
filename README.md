# Grocery Receipt PWA (v10.3)

**Version**: v10.3 (matches the scoped CACHE_NAME version suffix in sw.js)

A shopping list app for tracking grocery items while shopping. Calculates itemized subtotals (price × quantity) and the grand total in real time. Stores history for each trip locally in browser localStorage and can be installed as a PWA on an iPhone home screen.

## Key Features & Recent Updates

### Version: v10.3

- **Recovery Is Now a Real Backup Gate**: Corrupt History or Draft data still pauses every write, but "Continue after backup" is only enabled after the user actually confirms a backup — either a resolved Web Share sheet or the explicit "I saved the backup file" checkbox. The `grocery_recovery_<key>_v1` copy is a durability aid, not authorisation, because it lives in the same storage being recovered.
- **Install Resilience**: The Service Worker precaches the app shell (`./`, `./index.html`) sequentially and fails install only if the shell itself fails; icons and the manifest are best-effort, so one renamed asset can no longer discard the whole install.
- **Bounded, Truthful Update Check**: The manual update check now resolves within 12 seconds even if the worker stalls. The badge always reports the version of the page that is executing; the worker's version is shown only in the button tooltip. Messages no longer claim an update "will reload" before it exists.
- **Strict Historical Dates**: A historical date must be a finite epoch number or an ISO-shaped `YYYY-MM-DD[T…]` string whose components round-trip through the calendar. Garbage (`"1"`, `"March"`, `"2026/11/09"`) and impossible dates (`"2026-02-31"`) become `date: null` / Unknown date, and the trip is kept.
- **History Ordering & Save Idempotency**: Every History mutation goes through one `commitSessions()` chokepoint that sorts, persists and invalidates the autocomplete cache, so a newly saved trip lands in newest-first order immediately. The pending-session marker is decided by comparing saved content, so ordinary draft edits no longer disable the idempotent retry.
- **Offline Fonts via Runtime Caching**: The font stylesheet is requested with `crossorigin`, so its response (and the WOFF2 files) are ordinary CORS responses. The Service Worker now caches same-origin and validated cross-origin GET responses at runtime and refuses opaque responses, so the receipt typography survives a second visit offline without self-hosting.
- **Content Security Policy**: A `meta`-delivered CSP locks `default-src` to `'self'`, names the two Google Fonts hosts explicitly, and blocks `<base>` hijack and form submission. `'unsafe-inline'` is still required by the single-file design, so this is a containment/networking control, not an XSS control (see Security Notes).
- **Contrast, Touch Targets & ARIA**: `--ink-soft` was darkened and the placeholder opacity removed to clear AA in all ten themes; remaining sub-44px controls (undo, edit, history actions, theme close, recovery buttons) were raised to a 44px hit area; the menu button gained `aria-label`/`aria-expanded`/`aria-controls`; the toast is a polite live region; invalid price/quantity inputs get `aria-invalid`; the drawer respects `env(safe-area-inset-*)` and stops scroll chaining.
- **Single-Slot Undo Snackbar**: One pending action at a time (edit, item delete, trip delete) with explicit dismissal on save, delete, load and clear, replacing the boolean/`lastEditedSnapshot` pair that could restore stale items.
- **Storage & Cross-Tab Hardening**: A whole-store `localStorage.clear()` in another tab now resets history, draft and theme instead of being written back; imported ids are length- and charset-sanitised; `Intl` is feature-detected with ES5 number/date fallbacks so a missing ECMA-402 add-on cannot abort startup; a debounced location edit is flushed on `pagehide`/`blur`/`visibilitychange`; the Today date refreshes at midnight; export/import cancellation and `FileReader` errors are reported honestly.
- **Manifest Identity**: Added `"id": "./index.html"`, which matches the identity already derived from `start_url`, so existing installs are not duplicated.

### Version: v10.2


- **Native System UI Typography**: Replaced IBM Plex Sans with the platform-native system font stack (San Francisco on Apple platforms, Segoe UI on Windows, Roboto on Android, then Helvetica/Arial fallbacks). IBM Plex Mono remains for receipt and numeric text.

### Version: v10.1

- **Version Badge Cleanup**: Removed the refresh symbol from the Home screen version badge while preserving its update-check button behavior; version labels now correctly display major.minor versions such as v10.1.
- **Location Field Visibility**: Matched the Location input background to the + Add Item accent color, with theme-aware foreground and placeholder colors for clearer visibility.

### Version: v10

- **Storage Integrity & Recovery**: Failed draft/history writes preserve the previous in-memory state. Malformed stored JSON is backed up where possible; writes pause until recovery is acknowledged. An optional pending-session marker makes partial Save Today's List retries idempotent without adding a storage key.
- **Validation & Import Safety**: Strict finite price/whole-quantity parsing, no arbitrary quantity or record-count cap (the 5 MB import-file limit remains), overflow-safe totals, unique imported item IDs, and missing/invalid historical dates retained as null and displayed as Unknown date.
- **PWA Cache Isolation**: Cache cleanup is limited to this app and its registration path; navigation cache writes are awaited safely and unrelated origin caches are retained.
- **Accessibility & Theme Contrast**: Complete tab/accordion ARIA relationships, keyboard tab navigation, larger mobile touch targets, and theme-aware action-button foreground colors.
- **Cache Invalidation**: Service Worker cache name is grocery-receipt-{scopeKey}-{version}, where scopeKey is derived from the encoded registration path and {version} was v10 for that release. Activation removes only older caches for this app scope plus the exact legacy global v9 cache.
- **Carrier-Grade Offline Fallback**: Service Worker navigation intercepts HTTP 5xx server/gateway errors and seamlessly serves the cached offline application shell.
- **Exact Half-Cent Rounding**: Replaced naive decimal math with exponential decimal rounding (`Number(Math.round(Number(Math.abs(num) + "e+2")) + "e-2")`, sign reapplied), ensuring exact half-cent rounding across arbitrary price totals.
- **Storage Quota & Import Write Safety**: Imports are staged in a candidate collection and committed to memory only after the localStorage write succeeds, preventing phantom unpersisted data on quota failure.
- **State & Undo Isolation**: Automatically dismisses edit undo popup on trip completion, item deletion, or trip loading to prevent stale items from being restored into new drafts.
- **WAI-ARIA & Mobile Autocomplete Polish**: Fixed ArrowUp initial modulo math, added aria-activedescendant screen reader tracking, and implemented touch-safe pointerdown selection on iOS Safari.
- **Accessibility & Modal Focus Trap**: Implemented keyboard focus trap inside the side drawer menu, cycling focus between the close button and theme options.
- **Strict Legacy Mobile ES5**: Uses indexed loops for NodeList/HTMLCollection traversal in the History accordion for older mobile WebViews.
- **iOS Safari PWA Contrast Polish**: Uses the default Apple status-bar style for clear dark status-bar text and icons on bright theme backgrounds.
- **Performance & Defense-in-Depth**: Debounced location input draft persistence by 250 ms, added a 5 MB JSON import size limit, finite price checks, and input character limits (150 for items, 100 for locations).
- **Legacy Cache Cleanup**: v10 activation removes the exact grocery-receipt-v9 cache left by the previous release while retaining unrelated origin caches.

### Version: v9

- **Carrier-Grade Offline Fallback**: Service Worker navigation intercepts HTTP 5xx server/gateway errors and serves the cached offline application shell.
- **Exact Half-Cent Rounding**: Replaced naive decimal math with exponential decimal rounding for consistent cent calculations.
- **Storage Quota & Import Write Safety**: Import persistence is staged before in-memory state is committed, avoiding phantom unpersisted data after quota failures.
- **State & Undo Isolation**: Dismisses the edit undo popup on trip completion, item deletion, or trip loading.
- **WAI-ARIA & Mobile Autocomplete Polish**: Added aria-activedescendant tracking and touch-safe pointerdown selection.
- **Accessibility & Modal Focus Trap**: Added keyboard focus trapping inside the side drawer.
- **Strict Legacy Mobile ES5**: Uses indexed loops for NodeList/HTMLCollection traversal in the History accordion.
- **iOS Safari PWA Contrast Polish**: Updated Apple status-bar styling.
- **Performance & Defense-in-Depth**: Added debounced location persistence, a 5 MB import file-size limit, finite price checks, and input character limits.
- **Cache Invalidation**: Used the legacy global cache name grocery-receipt-v9.

### Version: v8

- **Expanded Themes (10 Total)**: Added 4 new dark themes for a balanced suite of 5 bright themes (Forest, Ocean, Sakura, Sunset, Grape) and 5 dark themes (Dark, Nordic, Mocha, Amethyst, Cyber).
- **Categorized Theme Picker**: Structured menu swatches with dedicated Bright and Dark section groupings.
- **Auto-Close Hamburger Menu**: Menu drawer automatically dismisses when a theme swatch is selected.
- **Cache Invalidation**: Updated Service Worker cache name to grocery-receipt-v8.

### Version: v7

- **Edit Banner Fix**: Resolved CSS specificity issue so the Editing banner properly disappears when Cancel is clicked.
- **Edit Undo Popup**: Added a five-second snackbar notification after saving an edited item with an instant Undo option.
- **Clear All Today**: Added a Clear button to wipe Today items and reset form inputs with confirmation protection.
- **Cache Invalidation**: Updated Service Worker cache name to grocery-receipt-v7.

### Version: v6

- **Strict ES5 & Mobile Safari Fix**: Replaced ES6 Object.assign() with vanilla object cloning for legacy iOS Safari and Android WebViews.
- **Service Worker Reliability**: Guarded offline cache from HTTP 4xx/5xx navigation errors and added fallbacks for offline asset requests.
- **Storage Fault-Tolerance**: Sanitized and validated corrupted localStorage records on boot; added state rollback on storage quota exhaustion.
- **Dynamic Status Bar & Dark Theme Polish**: Synchronized the theme-color meta tag with the active theme.
- **WAI-ARIA Autocomplete**: Added keyboard navigation, ARIA roles, and automatic focusout dismissal.
- **Data Protection**: Documented same-origin storage isolation requirements for shared hosting deployments.

### Version: v5

- **Security Hardening**: Uses safe DOM textContent rendering and strict JSON import schema validation.
- **Data Loss Prevention**: Added non-destructive Load to Today history reuse and QuotaExceededError notifications.
- **Calculation Precision**: Standardized two-decimal arithmetic rounding for item subtotals and grand totals.
- **Web Share API**: Added native iOS/Android share sheet for JSON export with graceful download fallback.
- **Performance & UI Polish**: Added memoized autocomplete, adaptive bottom-bar gradients, and cross-tab synchronization.
- **Accessibility**: Added keyboard navigation and ARIA dialog modal roles.

### Version: v4

- **English Interface**: Complete UI localization in English.
- **Slide-in Drawer Menu**: Added navigation menu for settings and backup tools.
- **JSON Export & Import**: Added backup and restore for shopping history.
- **Custom Color Themes**: Added six selectable color themes.
- **Top Running Total**: Displays the live total above the location field.
- **Mobile Responsive Layout**: Added proportional Price/Quantity inputs and Flexbox overflow protection.

### Version: v3

- **Mobile UI Sizing Fix**: Fixed horizontal overflow on iPhone screens for Price and Quantity inputs.
- **Flexbox Optimization**: Added min-width, width, and 2:1 flex sizing for input fields.
- **Cache Invalidation**: Updated Service Worker cache to grocery-receipt-v3.

### Version: v2

- **GitHub Pages Deployment**: Configured repository structure for hosting on GitHub Pages.
- **PWA Asset Suite**: Added app icons (icon-192, icon-512, icon-512-maskable, apple-touch-icon).
- **PWA Manifest & Service Worker**: Added manifest.json and sw.js for offline capability.
- **Version Indicator**: Added a manual update/version check badge in the header.

### Version: v1

- **Initial Release**: Core Grocery Receipt PWA functionality.
- **Real-time Calculations**: Computes itemized subtotals (price × quantity) and grand total live.
- **Local History**: Stores trip history in browser localStorage.
- **Item Autocomplete**: Suggests items based on previous shopping entries.
- **Draft Persistence**: Automatically saves unsubmitted Today items.

## File Structure

- index.html — Main application page (HTML, CSS, and JavaScript).
- manifest.json — PWA manifest (name, icons, theme color). `"id"` is pinned to `"./index.html"` to match the identity already derived from `start_url`, so upgrading from v10.2 does not create a second install. `"orientation": "portrait"` is a deliberate decision: the list is used one-handed in a store, and removing it would enable iPad landscape.
- sw.js — Service Worker for offline caching.
- icons/ — PWA and Apple touch icon assets.
- README.md — Project overview and release history.

## Where Data is Stored

- Everything is stored in browser/PWA localStorage on that specific device; no data is synced to the cloud.
- grocery_sessions_v1 stores saved trips, grocery_draft_v1 stores the current draft, and grocery_theme_v1 stores the selected theme.
- The draft may contain an optional pendingSavedSessionId during a partially completed Save Today's List operation. A retry can clear an already-saved draft without creating a duplicate History record. This does not add a storage key or make the two-key write atomic.
- When malformed History or Draft data is detected, the app attempts a raw backup under a grocery_recovery_<original-key>_v1 key. Writes pause until recovery is acknowledged. That recovery key is a durability aid only: "Continue after backup" stays disabled until the user confirms they saved a copy (a resolved share sheet, or the "I saved the backup file" checkbox). If browser storage cannot be read at all, the app cannot export bytes it cannot access and refuses to overwrite the unknown source.
- Use Export History (JSON) in the side menu to download a backup of shopping history. The import file-size limit is 5 MB; there is no additional session-count or item-count limit.
- The Today draft is saved automatically. Prices must be finite and between ฿0 and ฿10,000,000. Quantity must be a finite whole number of at least 1; there is no arbitrary maximum quantity. Older imported trips with missing or invalid dates are retained with an unknown date and appear after trips with known dates.

## Security Notes

- All user-supplied values are rendered with `textContent`; `innerHTML` is only ever used for static structural skeletons. Imported JSON is validated field by field before use.
- The page ships a `meta`-delivered Content Security Policy: `default-src 'self'`, explicit Google Fonts origins for styles and fonts, `img-src 'self' data:`, `connect-src 'self'`, `manifest-src`/`worker-src 'self'`, `base-uri 'self'` and `form-action 'none'`. Because this is a single-file app, `script-src`/`style-src` necessarily include `'unsafe-inline'`, so the CSP is a containment and egress control rather than an XSS control.
- `frame-ancestors` is intentionally absent: it is ignored in `meta`-delivered policies and GitHub Pages cannot send response headers, so clickjacking protection is not available from this file.
- Service Worker cleanup only deletes caches belonging to this app's registration scope plus one exact legacy name; unrelated origin caches are never touched.

## Browser & CSS Baseline

- The app is written in ES5 syntax by policy, but ES5 syntax does not imply an ES5 runtime. Supported browsers are modern evergreen engines (current Safari/WebKit, Chrome, Edge, Firefox) and iOS/iPadOS 14.1 or later.
- The CSS baseline is custom properties, `env(safe-area-inset-*)`, `prefers-reduced-motion`, `:focus-visible` and `overscroll-behavior` — all of which require iOS 14.1+ / modern evergreen. Nothing is transpiled or polyfilled.
- `Intl` number/date formatting is optional: the app feature-detects it and falls back to ES5 formatting, so a missing ECMA-402 add-on cannot abort startup.
- IBM Plex Mono still comes from Google Fonts (an accepted, documented trade-off); there are no other third-party runtime dependencies.

## Theme Contrast Reference

`--ink-soft` is the muted token behind section labels, dates, hints, tab labels and disabled Save. Measured ratios after the v10.3 token change (WCAG AA body text needs 4.5:1):

| Theme | on paper | on surface | on tab bar | `--on-accent` on `--green` |
| --- | --- | --- | --- | --- |
| Forest (default) | 5.83 | 6.70 | 5.18 | 5.99 |
| Ocean | 5.99 | 6.70 | 5.33 | 5.17 |
| Sakura | 6.14 | 6.70 | 5.46 | 4.60 |
| Sunset | 6.31 | 6.70 | 5.62 | 4.62 |
| Grape | 6.11 | 6.70 | 5.43 | 5.70 |
| Dark | 6.66 | 5.92 | 5.32 | 9.44 |
| Nordic | 6.96 | 5.71 | 5.60 | 7.68 |
| Mocha | 6.70 | 5.93 | 5.38 | 7.66 |
| Amethyst | 7.01 | 6.23 | 5.70 | 6.23 |
| Cyber | 7.78 | 7.15 | 6.39 | 6.11 |

The Location placeholder now uses solid `--on-accent` (no opacity), so it inherits the accent ratios above. Recompute this table before shipping any new theme or token change.

## Future App Updates

When you modify index.html, manifest.json, or files inside icons/, bump the app release suffix (vMAJOR.MINOR) in CACHE_NAME in sw.js and update PAGE_VERSION in index.html plus the README version header. The cache name combines the app-specific prefix (derived from the encoded Service Worker registration path) with that version suffix. Do not delete unrelated Cache Storage entries.

`LEGACY_CACHE_NAME` currently names the exact pre-scoping global cache `grocery-receipt-v9` for one-time cleanup. It is kept for v10.3 only and is scheduled for removal in v10.4.
