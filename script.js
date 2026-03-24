const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"];
const MANIFEST_PATH = "images/manifest.json";

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
  renderGenreCards(manifest);
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

function renderGenreCards(manifest) {
  if (!genreCards) return;
  genreCards.innerHTML = "";

  CATEGORY_ORDER.forEach(({ key, title, page }) => {
    const { folder, files } = resolveCategorySource(manifest, key);
    const validFiles = files.filter((file) => isImageFile(file));
    const cover = validFiles[0] || "placeholder-01.svg";

    const card = document.createElement("a");
    card.className = "genre-card";
    card.href = page;
    card.setAttribute("aria-label", `Open ${title} gallery`);

    const label = document.createElement("span");
    label.textContent = title;

    const image = document.createElement("img");
    image.src = `images/${folder}/${encodeURIComponent(cover)}`;
    image.alt = `${title} cover image`;
    image.loading = "lazy";
    image.decoding = "async";

    card.append(label, image);
    genreCards.append(card);
  });
}

function resolveCategorySource(manifest, key) {
  return { folder: key, files: manifest[key] || [] };
}

function handleHeaderBorder() {
  siteHeader?.classList.toggle("scrolled", window.scrollY > 10);
}

function isImageFile(fileName) {
  const lower = fileName.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}
