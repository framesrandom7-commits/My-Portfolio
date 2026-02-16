const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"];
const MANIFEST_PATH = "images/manifest.json";

const CATEGORY_ORDER = [
  { key: "wedding-stories", title: "Wedding Stories", page: "wedding-stories.html" },
  { key: "events", title: "Events", page: "events.html" },
  { key: "portrait", title: "Portrait", page: "portrait.html" },
  { key: "food", title: "Food", page: "food.html" },
  { key: "street", title: "Street", page: "street.html" },
  { key: "fashion", title: "Fashion", page: "fashion.html" },
  { key: "landscape", title: "Landscape", page: "landscape.html" },
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
      "wedding-stories": ["placeholder-01.svg", "placeholder-02.svg", "placeholder-03.svg"],
      events: ["placeholder-01.svg", "placeholder-02.svg", "placeholder-03.svg"],
      portrait: ["placeholder-01.svg", "placeholder-02.svg", "placeholder-03.svg"],
      food: ["placeholder-01.svg", "placeholder-02.svg", "placeholder-03.svg"],
      street: ["placeholder-01.svg", "placeholder-02.svg", "placeholder-03.svg"],
      fashion: ["placeholder-01.svg", "placeholder-02.svg", "placeholder-03.svg"],
      landscape: ["placeholder-01.svg", "placeholder-02.svg", "placeholder-03.svg"],
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
  if (key === "wedding-stories") {
    if (manifest["wedding-stories"]?.length) {
      return { folder: "wedding-stories", files: manifest["wedding-stories"] };
    }
    return { folder: "wedding", files: manifest.wedding || [] };
  }
  return { folder: key, files: manifest[key] || [] };
}

function handleHeaderBorder() {
  siteHeader?.classList.toggle("scrolled", window.scrollY > 10);
}

function isImageFile(fileName) {
  const lower = fileName.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}
