const modules = import.meta.glob<string>(
  "../../data/images/*.{jpg,jpeg,png,webp}",
  {
    eager: true,
    import: "default",
  },
);

const images: Record<string, string> = {};
for (const path in modules) {
  const key = path.replace("../../data/images/", "").replace(/\.[^.]+$/, "");
  images[key] = modules[path];
}

export default images;
