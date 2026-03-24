const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"];
const MANIFEST_PATH = "images/manifest.json";
const PRODUCT_FOLDER = "images/product";
const PRODUCT_FILE_LIMIT = 50;
const CATEGORY_META = {
  product: {
    subtitle: "Clean, detail-driven visuals for modern brands",
    labelSuffix: "Product Campaign",
    fallbackLabels: [
      "Beardo — Product Campaign",
      "Colgate — Commercial Shoot",
      "Studio Series — Visual Story",
      "Signature Launch — Product Campaign",
    ],
  },
  fashion: {
    subtitle: "Editorial and campaign-focused storytelling",
    labelSuffix: "Visual Story",
    fallbackLabels: [
      "Muse House — Campaign Story",
      "Editorial Frame — Visual Story",
      "Atelier Line — Campaign Story",
      "Motion Edit — Visual Story",
    ],
  },
  food: {
    subtitle: "Stylized compositions crafted for visual appeal",
    labelSuffix: "Beverage Campaign",
    fallbackLabels: [
      "Nescafe — Beverage Campaign",
      "Cafe Ritual — Visual Story",
      "Table Edit — Beverage Campaign",
      "Signature Pour — Visual Story",
    ],
  },
};

const genreTitle = document.getElementById("genreTitle");
const genreGallery = document.getElementById("genreGallery");
const categoryKey = document.body.dataset.category || "portrait";
const categoryTitle = document.body.dataset.title || "Gallery";

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const closeButton = lightbox.querySelector(".lightbox-close");
const prevButton = lightbox.querySelector(".lightbox-prev");
const nextButton = lightbox.querySelector(".lightbox-next");

const lightboxState = {
  images: [],
  index: 0,
};

init();

async function init() {
  const source = categoryKey === "product"
    ? await resolveAutoProductSource()
    : resolveCategorySource(await loadManifest(), categoryKey);

  renderCategory(categoryTitle, source.folder, source.files);

  closeButton.addEventListener("click", closeLightbox);
  prevButton.addEventListener("click", () => navigateLightbox(-1));
  nextButton.addEventListener("click", () => navigateLightbox(1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") navigateLightbox(-1);
    if (event.key === "ArrowRight") navigateLightbox(1);
  });
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

function resolveCategorySource(manifest, key) {
  if (key === "wedding-stories") {
    if (manifest["wedding-stories"]?.length) {
      return { folder: "images/wedding-stories", files: manifest["wedding-stories"] };
    }
    return { folder: "images/wedding", files: manifest.wedding || [] };
  }

  return { folder: `images/${key}`, files: manifest[key] || [] };
}

function renderCategory(title, folder, files) {
  genreTitle.textContent = title;
  document.title = `Randomframes — ${title}`;
  renderCategorySubtitle();

  const validFiles = files.filter((file) => isImageFile(file));
  const entries = validFiles.map((fileName, index) => ({
    src: `${folder}/${encodeURIComponent(fileName)}`,
    alt: `${title} photo ${index + 1}`,
    caption: formatProjectLabel(fileName, index),
  }));

  if (!entries.length) {
    const message = document.createElement("p");
    message.className = "empty-note";
    message.textContent = `No images found in /${folder}. Add files and push to GitHub.`;
    genreGallery.append(message);
    return;
  }

  entries.forEach((entry, index) => {
    const figure = document.createElement("figure");
    figure.className = "image-card";
    figure.setAttribute("role", "listitem");

    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Open ${entry.alt}`);

    const wrap = document.createElement("div");
    wrap.className = "image-wrap";

    const image = document.createElement("img");
    image.src = entry.src;
    image.alt = entry.alt;
    image.loading = "lazy";
    image.decoding = "async";

    image.addEventListener("load", () => {
      wrap.classList.add("loaded");
    });

    button.addEventListener("click", () => {
      openLightbox(entries, index);
    });

    wrap.append(image);
    button.append(wrap);
    figure.append(button);
    genreGallery.append(figure);
  });
}

function renderCategorySubtitle() {
  const meta = CATEGORY_META[categoryKey];
  if (!meta || genreTitle.nextElementSibling?.classList.contains("genre-page-subtitle")) {
    return;
  }

  const subtitle = document.createElement("p");
  subtitle.className = "genre-page-subtitle";
  subtitle.textContent = meta.subtitle;
  genreTitle.insertAdjacentElement("afterend", subtitle);
}

function openLightbox(images, index) {
  lightboxState.images = images;
  lightboxState.index = index;
  updateLightbox();
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function navigateLightbox(direction) {
  const total = lightboxState.images.length;
  if (!total) return;
  lightboxState.index = (lightboxState.index + direction + total) % total;
  updateLightbox();
}

function updateLightbox() {
  const current = lightboxState.images[lightboxState.index];
  if (!current) return;
  lightboxImage.src = current.src;
  lightboxImage.alt = current.alt;
  lightboxCaption.textContent = current.caption;
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  lightboxImage.src = "";
}

function isImageFile(fileName) {
  const lower = fileName.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function cleanFileName(fileName) {
  return fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

function formatProjectLabel(fileName, index) {
  const meta = CATEGORY_META[categoryKey];
  const cleaned = cleanFileName(fileName);

  if (!meta) {
    return toTitleCase(cleaned);
  }

  if (/^(placeholder|img)\s*\d*$/i.test(cleaned)) {
    return meta.fallbackLabels[index % meta.fallbackLabels.length];
  }

  if (cleaned.includes("—")) {
    return cleaned
      .split("—")
      .map((part) => toTitleCase(part))
      .join(" — ");
  }

  if (cleaned.includes(" - ")) {
    return cleaned
      .split(" - ")
      .map((part) => toTitleCase(part))
      .join(" — ");
  }

  return `${toTitleCase(cleaned)} — ${meta.labelSuffix}`;
}

function toTitleCase(text) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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
