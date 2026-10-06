# DAYNEST CAFÉ — WEBWAI Demo #01

Static 5-page demo website for a café/restaurant SME template.

## Pages
- `index.html` — Home
- `menu.html` — Menu
- `about.html` — About
- `gallery.html` — Gallery
- `contact.html` — Contact

## Edit client information
Open `data/site.js` and update:
- name
- tagline
- city
- address
- phone
- LINE
- Instagram / Facebook
- map URL
- opening hours

## Brand styling
Main design tokens are at the top of `assets/css/style.css`:
- `--cream`
- `--espresso`
- `--ink`
- `--green`
- `--white`
- `--line`

## Preview locally
Open `index.html` directly, or run a simple local server from this folder:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Notes
- Demo photos from Unsplash are bundled in assets/images and served locally.
- The map area is a visual placeholder linked to Google Maps.
- Replace all demo content/photos before delivering to a real client.

## WEBWAI update
- Added menu category filters.
- Improved keyboard navigation, mobile menu accessibility, reduced motion and image loading.
- Added a clear demo notice and GitHub Pages instructions in `GITHUB-PAGES-TH.md`.
- Use `main` / `root` as the GitHub Pages publishing source.

## Image fix
ภาพทั้งหมดเก็บใน assets/images และอ้างอิงด้วย relative paths รองรับ GitHub Pages ทั้งที่ root และใต้ชื่อ repository
