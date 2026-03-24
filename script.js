const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"];
const MANIFEST_PATH = "images/manifest.json";
const PRODUCT_FOLDER = "images/product";
const PRODUCT_FILE_LIMIT = 50;

const CATEGORY_ORDER = [
  { key: "portrait", title: "Portrait", page: "portrait.html" },
  { key: "food", title: "Food", page: "food.html" },
  { key: "fashion", title: "Fashion", page: "fashion.html" },
  { key: "product", title: "Product", page: "product.html" },
];

const siteHeader = document.querySelector(".site-header");
const genreCards = document.getElementById("genreCards");

init();

async function init() {
  window.addEventListener("scroll", handleHeaderBorder, { passive: true });

  const manifest = await loadManifest();
  await renderGenreCards(manifest);
}

async function loadManifest() {
  try {
    const response = await fetch(MANIFEST_PATH, { cache: "no-cache" });
    if (!response.ok) throw new Error("Manifest not found");
    return await response.json();
  } catch {
    return {
      portrait: ["placeholder-01.svg", "placeholder-02.svg", "placeholder-03.svg"],
      food: ["placeholder-01.svg", "placeholder-02.svg", "placeholder-03.svg"],
      fashion: ["placeholder-01.svg", "placeholder-02.svg", "placeholder-03.svg"],
      product: ["placeholder-01.svg", "placeholder-02.svg", "placeholder-03.svg"],
    };
  }
}

async function renderGenreCards(manifest) {
  if (!genreCards) return;
  genreCards.innerHTML = "";

  for (const { key, title, page } of CATEGORY_ORDER) {
    const source = key === "product"
      ? await resolveAutoProductSource()
      : resolveCategorySource(manifest, key);
    const validFiles = source.files.filter((file) => isImageFile(file));
    const cover = validFiles[0] || "placeholder-01.svg";

    const card = document.createElement("a");
    card.className = "genre-card";
    card.href = page;
    card.setAttribute("aria-label", `Open ${title} gallery`);

    const label = document.createElement("span");
    label.textContent = title;

    const image = document.createElement("img");
    image.src = `${source.folder}/${encodeURIComponent(cover)}`;
    image.alt = `${title} cover image`;
    image.loading = "lazy";
    image.decoding = "async";

    card.append(label, image);
    genreCards.append(card);
  }
}

function resolveCategorySource(manifest, key) {
  return { folder: `images/${key}`, files: manifest[key] || [] };
}

function handleHeaderBorder() {
  siteHeader?.classList.toggle("scrolled", window.scrollY > 10);
}

function isImageFile(fileName) {
  const lower = fileName.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

async function resolveAutoProductSource() {
  const files = await loadSequentialProductImages();
  return { folder: PRODUCT_FOLDER, files };
}

async function loadSequentialProductImages() {
  const probes = [];
  for (let index = 1; index <= PRODUCT_FILE_LIMIT; index += 1) {
    const fileName = `img${index}.jpg`;
    probes.push(probeImage(`${PRODUCT_FOLDER}/${fileName}`).then((exists) => (exists ? fileName : null)));
  }

  const results = await Promise.all(probes);
  return results.filter(Boolean);
}

function probeImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = src;
  });
}
