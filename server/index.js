import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

const DATA_DIR = path.join(__dirname, "data");
const MEALPLANS_DIR = path.join(DATA_DIR, "mealplans");

app.use(express.json());
app.use("/data", express.static(DATA_DIR));

function toDisplayName(stem) {
  return stem.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function toFileStem(displayName) {
  return displayName.trim().toLowerCase().replace(/\s+/g, "_");
}

app.get("/api/mealplans", (req, res) => {
  const files = fs.readdirSync(MEALPLANS_DIR).filter(
    (f) => f.endsWith(".json") && f !== "example.json"
  );
  const plans = files.map((f) => {
    const stem = f.replace(/\.json$/, "");
    return { name: stem, displayName: toDisplayName(stem) };
  });
  res.json(plans);
});

app.get("/api/mealplans/:name", (req, res) => {
  const file = path.join(MEALPLANS_DIR, `${req.params.name}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: "Not found" });
  res.json(JSON.parse(fs.readFileSync(file, "utf-8")));
});

app.post("/api/mealplans", (req, res) => {
  const { displayName } = req.body;
  if (!displayName) return res.status(400).json({ error: "displayName required" });

  const stem = toFileStem(displayName);
  const file = path.join(MEALPLANS_DIR, `${stem}.json`);

  if (fs.existsSync(file)) {
    return res.status(409).json({ error: "Already exists" });
  }

  fs.writeFileSync(file, JSON.stringify([], null, 2), "utf-8");
  res.json({ name: stem, displayName: toDisplayName(stem) });
});

app.put("/api/mealplans/:name", (req, res) => {
  const file = path.join(MEALPLANS_DIR, `${req.params.name}.json`);
  fs.writeFileSync(file, JSON.stringify(req.body, null, 2), "utf-8");
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