const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"];
const MANIFEST_PATH = "images/manifest.json";

const gallerySections = Array.from(document.querySelectorAll(".gallery-section"));
const sectionNav = document.getElementById("sectionNav");
const siteHeader = document.querySelector(".site-header");

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
  buildNavigation();
  observeSections();
  window.addEventListener("scroll", handleHeaderBorder, { passive: true });

  const manifest = await loadManifest();
  gallerySections.forEach((section) => {
    const category = section.dataset.category;
    const title = section.dataset.title;
    const files = manifest[category] || [];
    renderCategory(section, title, category, files);
  });

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
    // Fallback for first-time setup if manifest is missing.
    return {
      wedding: ["placeholder-01.svg", "placeholder-02.svg", "placeholder-03.svg"],
      portrait: ["placeholder-01.svg", "placeholder-02.svg", "placeholder-03.svg"],
      food: ["placeholder-01.svg", "placeholder-02.svg", "placeholder-03.svg"],
      street: ["placeholder-01.svg", "placeholder-02.svg", "placeholder-03.svg"],
      fashion: ["placeholder-01.svg", "placeholder-02.svg", "placeholder-03.svg"],
      landscape: ["placeholder-01.svg", "placeholder-02.svg", "placeholder-03.svg"],
      product: ["placeholder-01.svg", "placeholder-02.svg", "placeholder-03.svg"],
    };
  }
}

function renderCategory(section, title, category, files) {
  const grid = section.querySelector(".gallery-grid");
  const validFiles = files.filter((file) => isImageFile(file));

  if (!validFiles.length) {
    const message = document.createElement("p");
    message.className = "empty-note";
    message.textContent = `No images found in /images/${category}. Add files and push to GitHub.`;
    grid.append(message);
    return;
  }

  const imageEntries = validFiles.map((fileName, idx) => ({
    src: `images/${category}/${encodeURIComponent(fileName)}`,
    alt: `${title} photo ${idx + 1}`,
    caption: `${title} · ${cleanFileName(fileName)}`,
  }));

  imageEntries.forEach((entry, index) => {
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

    const caption = document.createElement("figcaption");
    caption.innerHTML = `<span>${entry.caption}</span><span>${String(index + 1).padStart(2, "0")}</span>`;

    button.addEventListener("click", () => {
      openLightbox(imageEntries, index);
    });

    wrap.append(image);
    button.append(wrap);
    figure.append(button, caption);
    grid.append(figure);
  });
}

function buildNavigation() {
  const fragment = document.createDocumentFragment();
  gallerySections.forEach((section) => {
    const link = document.createElement("a");
    link.href = `#${section.id}`;
    link.textContent = section.dataset.title;
    fragment.append(link);
  });
  sectionNav.append(fragment);
}

function observeSections() {
  const links = Array.from(sectionNav.querySelectorAll("a"));
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
        }
      });
    },
    { threshold: 0.12 }
  );

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        links.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      });
    },
    { threshold: 0.4 }
  );

  gallerySections.forEach((section) => {
    revealObserver.observe(section);
    navObserver.observe(section);
  });
}

function handleHeaderBorder() {
  siteHeader.classList.toggle("scrolled", window.scrollY > 10);
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
