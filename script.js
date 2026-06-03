const body = document.body;
const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const revealItems = document.querySelectorAll("[data-reveal]");
const galleryItems = document.querySelectorAll(".gallery-item");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
const reelCards = document.querySelectorAll(".reel-card");

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 10);
}, { passive: true });

menuToggle.addEventListener("click", () => {
  const isOpen = body.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 20, 100)}ms`;
  revealObserver.observe(item);
});

galleryItems.forEach((item) => {
  item.addEventListener("click", () => {
    lightboxImage.src = item.dataset.full;
    lightboxImage.alt = "";
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    body.classList.add("lightbox-open");
  });
});

const closeLightbox = () => {
  lightbox.classList.remove("active");
  lightbox.setAttribute("aria-hidden", "true");
  body.classList.remove("lightbox-open");
  window.setTimeout(() => {
    if (!lightbox.classList.contains("active")) {
      lightboxImage.src = "";
    }
  }, 200);
};

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox || event.target.classList.contains("lightbox-close")) {
    closeLightbox();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    if (lightbox.classList.contains("active")) closeLightbox();
  }
});

reelCards.forEach((card) => {
  const video = card.querySelector("video");
  const soundToggle = card.querySelector(".sound-toggle");
  const fullscreenToggle = card.querySelector(".fullscreen-toggle");

  card.addEventListener("mouseenter", () => video.play().catch(() => {}));
  card.addEventListener("mouseleave", () => {
    video.pause();
    video.currentTime = 0;
  });

  soundToggle.addEventListener("click", () => {
    video.muted = !video.muted;
    soundToggle.textContent = video.muted ? "Sound" : "Mute";
    soundToggle.setAttribute("aria-label", video.muted ? "Unmute reel" : "Mute reel");
    video.play().catch(() => {});
  });

  fullscreenToggle.addEventListener("click", () => {
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
    }
    video.play().catch(() => {});
  });
});
