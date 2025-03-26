# 📦 eveligora_gulp_5_template

A fast and simple Gulp 5+ starter template for frontend development.

## 🚀 Features

- Gulp 5+ with ESModules and async/await
- SCSS compilation with dart-sass
- JS concatenation and minification
- HTML file includes
- Autoprefixer (browserslist: `> 1%, last 3 versions, not dead`)
- Image optimization (JPEG, PNG, SVG)
- Convert fonts .ttf to woff2
- LiveReload via BrowserSync
- HTML/SCSS/JS prettifying (Prettier)
- Production build with minified HTML/CSS/JS/images
- Error handling with plumber

---

## 📁 Folder Structure

```
├── app/            # Compiled files
├── src/            # Source files
│   ├── scss/       # SCSS files
│   ├── js/         # JS files
│   ├── imgs/       # Images
│   ├── fonts/      # Fonts
│   └── *.html      # HTML files
└── gulpfile.js     # Gulp config
```

---

## 🛠️ Setup & Usage

1. **Install Node.js** if not already installed: [https://nodejs.org/](https://nodejs.org/)

2. **Install dependencies**:

```bash
npm install
```

3. **Start development**:

```bash
gulp
```

This will:

- Compile SCSS
- Concatenate and minify JS
- Watch for changes
- Launch a local dev server

4. **Format your source files**:

```bash
gulp format
```

5. **Build for production**:

```bash
gulp build
```

This creates a clean build in the `/app/` folder with:

- Minified HTML
- Minified CSS and JS
- Optimized images
- Converted fonts

---

## 💻 Author

Evgeniy Veligora

GitHub: [@eveligora](https://github.com/eveligora)
