# Flowboard brand assets

- `logo-mark.svg`: app icon (gradient, for sidebar / README / large use)
- `logo-wordmark.svg`: mark + "Flowboard" (text uses Inter; falls back to system sans)
- `favicon.svg`: simplified flat version that stays legible at 16px
- `favicon.ico`, `favicon-16/32/48.png`, `apple-touch-icon.png` (180), `icon-192/512.png`

Colors: brand #7B68EE, gradient #8B7BF2 -> #6554D9, ink #0F172A.

## Vite + React usage
Copy files into `public/`, then in `index.html`:
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<meta name="theme-color" content="#7B68EE" />
```
In the sidebar, import the SVG as a React component or use `<img src="/logo-mark.svg" className="h-6 w-6" alt="Flowboard" />`.
