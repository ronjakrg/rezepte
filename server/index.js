import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

const DATA_DIR = path.join(__dirname, "data");
const MEALPLANS_DIR = path.join(DATA_DIR, "mealplans");
const RECIPES_FILE = path.join(DATA_DIR, "recipes", "recipes.json");
const IMAGES_DIR = path.join(DATA_DIR, "images");

app.use(express.json({ limit: "10mb" }));
app.use("/data", express.static(DATA_DIR));

function toDisplayName(stem) {
  return stem.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
// Filename only needs to be unique and filesystem-safe; the real title is
// stored inside the file as `displayName`.
function toFileStem(displayName) {
  const stem = displayName
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
  return stem || "mealplan";
}
function uniqueStem(base, dir = MEALPLANS_DIR, ext = ".json", sep = "_") {
  let stem = base;
  for (let i = 2; fs.existsSync(path.join(dir, `${stem}${ext}`)); i++) {
    stem = `${base}${sep}${i}`;
  }
  return stem;
}
// "Gemüse-Pfanne mit Reis" -> "gemuese-pfanne-mit-reis"
function toImageStem(title) {
  const umlauts = { ä: "ae", ö: "oe", ü: "ue", ß: "ss" };
  const stem = title
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => umlauts[c])
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return stem || "rezept";
}
// Files are either a legacy array of days or { displayName, days }.
function readPlanFile(file) {
  const data = JSON.parse(fs.readFileSync(file, "utf-8"));
  return Array.isArray(data)
    ? { displayName: null, days: data }
    : { displayName: data.displayName ?? null, days: data.days ?? [] };
}

const readRecipes = () => JSON.parse(fs.readFileSync(RECIPES_FILE, "utf-8"));
const writeRecipes = (recipes) =>
  fs.writeFileSync(RECIPES_FILE, JSON.stringify(recipes, null, 2), "utf-8");

// image: JPEG data URL, already cropped to a square by the client.
// Returns the saved filename, or null if there is no new image.
function saveImage(title, image) {
  const base64 = image?.match(/^data:image\/jpeg;base64,(.+)$/)?.[1];
  if (!base64) return null;
  const stem = uniqueStem(toImageStem(title), IMAGES_DIR, ".jpg", "-");
  fs.writeFileSync(path.join(IMAGES_DIR, `${stem}.jpg`), Buffer.from(base64, "base64"));
  return `${stem}.jpg`;
}

// Mealplans reference recipes by title, so follow a rename there too
function renameInMealplans(oldTitle, newTitle) {
  for (const f of fs.readdirSync(MEALPLANS_DIR).filter((f) => f.endsWith(".json"))) {
    const file = path.join(MEALPLANS_DIR, f);
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    const days = Array.isArray(data) ? data : data.days ?? [];
    let changed = false;
    for (const day of days) {
      for (const entry of Object.values(day)) {
        if (entry?.isRecipe && entry.title === oldTitle) {
          entry.title = newTitle;
          changed = true;
        }
      }
    }
    if (changed) fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
  }
}

app.post("/api/recipes", (req, res) => {
  const { recipe, image } = req.body;
  if (!recipe?.title?.trim()) return res.status(400).json({ error: "title required" });

  const recipes = readRecipes();
  if (recipes.some((r) => r.title === recipe.title)) {
    return res.status(409).json({ error: "Already exists" });
  }

  recipe.image = saveImage(recipe.title, image) ?? recipe.image ?? "";
  recipes.push(recipe);
  writeRecipes(recipes);
  res.json(recipe);
});

app.put("/api/recipes", (req, res) => {
  const { originalTitle, recipe, image } = req.body;
  if (!recipe?.title?.trim()) return res.status(400).json({ error: "title required" });

  const recipes = readRecipes();
  const index = recipes.findIndex((r) => r.title === originalTitle);
  if (index === -1) return res.status(404).json({ error: "Not found" });
  if (recipe.title !== originalTitle && recipes.some((r) => r.title === recipe.title)) {
    return res.status(409).json({ error: "Already exists" });
  }

  // A new photo replaces the old file (deleted first, so the name can be reused)
  const oldImage = recipes[index].image;
  const oldImagePath = oldImage && path.join(IMAGES_DIR, oldImage);
  if (image && oldImagePath && fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
  recipe.image = saveImage(recipe.title, image) ?? oldImage ?? "";

  recipes[index] = recipe;
  writeRecipes(recipes);
  if (recipe.title !== originalTitle) renameInMealplans(originalTitle, recipe.title);
  res.json(recipe);
});

app.get("/api/mealplans", (req, res) => {
  const files = fs.readdirSync(MEALPLANS_DIR).filter(
    (f) => f.endsWith(".json") && f !== "example.json"
  );
  const plans = files.map((f) => {
    const stem = f.replace(/\.json$/, "");
    const { displayName } = readPlanFile(path.join(MEALPLANS_DIR, f));
    return { name: stem, displayName: displayName || toDisplayName(stem) };
  });
  res.json(plans);
});

app.get("/api/mealplans/:name", (req, res) => {
  const file = path.join(MEALPLANS_DIR, `${req.params.name}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: "Not found" });
  res.json(readPlanFile(file).days);
});

app.post("/api/mealplans", (req, res) => {
  const displayName = (req.body.displayName ?? "").trim();
  if (!displayName) return res.status(400).json({ error: "displayName required" });

  const stem = uniqueStem(toFileStem(displayName));
  const file = path.join(MEALPLANS_DIR, `${stem}.json`);

  fs.writeFileSync(file, JSON.stringify({ displayName, days: [] }, null, 2), "utf-8");
  res.json({ name: stem, displayName });
});

app.put("/api/mealplans/:name", (req, res) => {
  const file = path.join(MEALPLANS_DIR, `${req.params.name}.json`);
  const displayName = fs.existsSync(file) ? readPlanFile(file).displayName : null;
  const out = displayName ? { displayName, days: req.body } : req.body;
  fs.writeFileSync(file, JSON.stringify(out, null, 2), "utf-8");
  res.json({ ok: true });
});

app.delete("/api/mealplans/:name", (req, res) => {
  const file = path.join(MEALPLANS_DIR, `${req.params.name}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: "Not found" });
  fs.unlinkSync(file);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});