import { promises as fs } from "fs";
import path from "path";

const ROOT = process.cwd();
const IMAGES_DIR = path.join(ROOT, "images");
const CATEGORIES = [
  "wedding-stories",
  "wedding",
  "events",
  "portrait",
  "food",
  "street",
  "fashion",
  "landscape",
  "product",
];
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"]);

const manifest = {};

for (const category of CATEGORIES) {
  const categoryPath = path.join(IMAGES_DIR, category);
  let entries = [];
  try {
    entries = await fs.readdir(categoryPath, { withFileTypes: true });
  } catch {
    manifest[category] = [];
    continue;
  }

  manifest[category] = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b));
}

const manifestPath = path.join(IMAGES_DIR, "manifest.json");
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Updated ${manifestPath}`);
