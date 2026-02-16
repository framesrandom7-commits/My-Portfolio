const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"];
const MANIFEST_PATH = "images/manifest.json";

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
  const manifest = await loadManifest();
  const { folder, files } = resolveCategorySource(manifest, categoryKey);

  renderCategory(categoryTitle, folder, files);

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
      return { folder: "wedding-stories", files: manifest["wedding-stories"] };
    }
    return { folder: "wedding", files: manifest.wedding || [] };
  }

  return { folder: key, files: manifest[key] || [] };
}

function renderCategory(title, folder, files) {
  genreTitle.textContent = title;
  document.title = `Randomframes — ${title}`;

  const validFiles = files.filter((file) => isImageFile(file));
  const entries = validFiles.map((fileName, index) => ({
    src: `images/${folder}/${encodeURIComponent(fileName)}`,
    alt: `${title} photo ${index + 1}`,
    caption: `${title} · ${cleanFileName(fileName)}`,
  }));

  if (!entries.length) {
    const message = document.createElement("p");
    message.className = "empty-note";
    message.textContent = `No images found in /images/${folder}. Add files and push to GitHub.`;
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
