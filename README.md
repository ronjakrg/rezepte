# 🥘 Rezepte

A minimal recipe and mealplan app built with React, Vite, TypeScript, and Express.

## 🚀 Getting started

```bash
npm install
npm run dev
```

To access the app from other devices on your network:

```bash
npm run dev:host
```

You can install this app as a standalone web app on your mobile device. Open the app in your browser, tap the 'Share' button, select 'Add to Home Screen', and launch it from your home screen for a native app-like experience.

## 👩‍🍳 Custom Recipes

Place your recipe JSON files and images in the `server/data/` folder:

```
server/data/
├── recipes/
│   └── rezepte.json
└── images/
    └── rezept-bild.png
```

- Recipe files should follow the format in `server/data/recipes/example.json`.
- The `data/` folder is git-ignored, so your personal recipes stay local.
