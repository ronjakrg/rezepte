# 🥘 Rezepte

A minimal recipe app built with React, Vite and TypeScript.

## ⚙️ Setup

```bash
npm install
npm run dev
```

To access the app from other devices on your network:

```bash
npm run dev:host
```

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
