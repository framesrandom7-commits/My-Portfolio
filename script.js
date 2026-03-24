const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"];
const MANIFEST_PATH = "images/manifest.json";
const PRODUCT_FOLDER = "images/product";
const PRODUCT_FILE_LIMIT = 50;
const REELS_FOLDER = "videos/reels";
const REEL_FILE_LIMIT = 12;
const REEL_EXTENSIONS = [".mp4", ".webm", ".mov"];

const CATEGORY_ORDER = [
  {
    key: "product",
    title: "Product Photography",
    description: "Clean, detail-driven visuals for modern brands",
    page: "product.html",
  },
  {
    key: "fashion",
    title: "Fashion Photography",
    description: "Editorial and campaign-focused storytelling",
    page: "fashion.html",
  },
  {
    key: "food",
    title: "Food & Beverage",
    description: "Stylized compositions crafted for visual appeal",
    page: "food.html",
  },
];

const siteHeader = document.querySelector(".site-header");
const genreCards = document.getElementById("genreCards");
const reelsSection = document.getElementById("reelsSection");
const reelsRail = document.getElementById("reelsRail");
const reelModal = document.getElementById("reelModal");
const reelModalVideo = document.getElementById("reelModalVideo");
const reelModalClose = document.getElementById("reelModalClose");

const reelState = {
  observer: null,
  cards: [],
  videos: [],
  activeIndex: -1,
  modalOpen: false,
};

init();

async function init() {
  window.addEventListener("scroll", handleHeaderBorder, { passive: true });

  const manifest = await loadManifest();
  await renderGenreCards(manifest);
  await initReels();
}

async function loadManifest() {
  try {
    const response = await fetch(MANIFEST_PATH, { cache: "no-cache" });
    if (!response.ok) throw new Error("Manifest not found");
    return await response.json();
  } catch {
    return {
      product: ["placeholder-01.svg", "placeholder-02.svg", "placeholder-03.svg"],
      fashion: ["placeholder-01.svg", "placeholder-02.svg", "placeholder-03.svg"],
      food: ["placeholder-01.svg", "placeholder-02.svg", "placeholder-03.svg"],
    };
  }
}

async function renderGenreCards(manifest) {
  if (!genreCards) return;
  genreCards.innerHTML = "";

  for (const { key, title, description, page } of CATEGORY_ORDER) {
    const source = key === "product"
      ? await resolveAutoProductSource()
      : resolveCategorySource(manifest, key);
    const validFiles = source.files.filter((file) => isImageFile(file));
    const cover = validFiles[0] || "placeholder-01.svg";

    const card = document.createElement("a");
    card.className = "genre-card";
    card.href = page;
    card.setAttribute("aria-label", `Open ${title} gallery`);

    const copy = document.createElement("div");
    copy.className = "genre-card-copy";

    const label = document.createElement("span");
    label.textContent = title;

    const meta = document.createElement("p");
    meta.textContent = description;

    const media = document.createElement("div");
    media.className = "genre-card-media";

    const image = document.createElement("img");
    image.src = `${source.folder}/${encodeURIComponent(cover)}`;
    image.alt = `${title} cover image`;
    image.loading = "lazy";
    image.decoding = "async";

    copy.append(label, meta);
    media.append(image);
    card.append(copy, media);
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

async function initReels() {
  if (!reelsSection || !reelsRail || !reelModal || !reelModalVideo || !reelModalClose) return;

  const reelEntries = await loadSequentialReels();
  if (!reelEntries.length) {
    reelsSection.hidden = true;
    return;
  }

  reelsSection.hidden = false;
  renderReels(reelEntries);
  setupReelObserver();
  bindReelModalEvents();
}

async function loadSequentialReels() {
  const entries = [];

  for (let index = 1; index <= REEL_FILE_LIMIT; index += 1) {
    let matched = null;

    for (const extension of REEL_EXTENSIONS) {
      const fileName = `reel${index}${extension}`;
      const src = `${REELS_FOLDER}/${fileName}`;
      const exists = await probeVideo(src);
      if (exists) {
        matched = { src, fileName };
        break;
      }
    }

    if (matched) {
      entries.push(matched);
    }
  }

  return entries;
}

function renderReels(entries) {
  reelsRail.innerHTML = "";
  reelState.cards = [];
  reelState.videos = [];

  entries.forEach((entry, index) => {
    const card = document.createElement("article");
    card.className = "reel-card";
    card.dataset.index = String(index);

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.setAttribute("aria-label", `Open reel ${index + 1}`);

    const frame = document.createElement("div");
    frame.className = "reel-frame";

    const video = document.createElement("video");
    video.className = "reel-video";
    video.src = entry.src;
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("muted", "");
    video.setAttribute("loop", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");

    const badge = document.createElement("span");
    badge.className = "reel-badge";
    badge.innerHTML = '<i class="fa-solid fa-expand" aria-hidden="true"></i>';

    trigger.addEventListener("click", () => openReelModal(entry.src));

    frame.append(video, badge);
    trigger.append(frame);
    card.append(trigger);
    reelsRail.append(card);
    reelState.cards.push(card);
    reelState.videos.push(video);
  });
}

function setupReelObserver() {
  reelState.observer?.disconnect();

  reelState.observer = new IntersectionObserver(handleReelIntersections, {
    threshold: [0.6],
    rootMargin: "0px",
  });

  reelState.cards.forEach((card) => {
    reelState.observer.observe(card);
  });
}

function handleReelIntersections(entries) {
  if (reelState.modalOpen) return;

  let bestIndex = -1;
  let bestRatio = 0;

  entries.forEach((entry) => {
    if (entry.isIntersecting && entry.intersectionRatio >= 0.6 && entry.intersectionRatio > bestRatio) {
      bestIndex = Number(entry.target.dataset.index);
      bestRatio = entry.intersectionRatio;
    }
  });

  reelState.activeIndex = bestIndex;

  reelState.videos.forEach((video, index) => {
    if (index === bestIndex) {
      playMuted(video);
    } else {
      video.pause();
    }
  });
}

function bindReelModalEvents() {
  reelModalClose.addEventListener("click", closeReelModal);
  reelModal.addEventListener("click", (event) => {
    if (event.target === reelModal) {
      closeReelModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && reelState.modalOpen) {
      closeReelModal();
    }
  });

  reelModalVideo.addEventListener("click", () => {
    if (reelModalVideo.muted) {
      reelModalVideo.muted = false;
    }
  });
}

function openReelModal(src) {
  reelState.modalOpen = true;
  reelState.videos.forEach((video) => video.pause());

  reelModalVideo.src = src;
  reelModalVideo.currentTime = 0;
  reelModalVideo.muted = true;
  reelModalVideo.controls = true;
  reelModal.classList.add("open");
  reelModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  const playPromise = reelModalVideo.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {});
  }
}

function closeReelModal() {
  reelState.modalOpen = false;
  reelModalVideo.pause();
  reelModalVideo.removeAttribute("src");
  reelModalVideo.load();
  reelModal.classList.remove("open");
  reelModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  resumeVisibleReel();
}

function resumeVisibleReel() {
  const firstVisibleIndex = reelState.cards.findIndex((card) => {
    const rect = card.getBoundingClientRect();
    const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
    return visibleHeight > rect.height * 0.6;
  });

  reelState.activeIndex = firstVisibleIndex;

  reelState.videos.forEach((video, index) => {
    if (index === firstVisibleIndex) {
      playMuted(video);
    } else {
      video.pause();
    }
  });
}

function playMuted(video) {
  video.muted = true;
  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {});
  }
}

function probeVideo(src) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const done = (result) => {
      video.removeAttribute("src");
      video.load();
      resolve(result);
    };

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.onloadeddata = () => done(true);
    video.onerror = () => done(false);
    video.src = src;
  });
}
