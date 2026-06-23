const body = document.body;
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const revealItems = document.querySelectorAll("[data-reveal]");
const galleryItems = document.querySelectorAll(".gallery-item");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
const videoCards = document.querySelectorAll(".reel-card, .film-card");

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

if (mobileMenu) {
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      body.classList.remove("menu-open");
      if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 18, 90)}ms`;
  revealObserver.observe(item);
});

if (lightbox && lightboxImage) {
  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      lightboxImage.src = item.dataset.full;
      lightboxImage.alt = "";
      lightbox.classList.add("active");
      lightbox.setAttribute("aria-hidden", "false");
      body.classList.add("lightbox-open");
    });
  });
}

const closeLightbox = () => {
  lightbox.classList.remove("active");
  lightbox.setAttribute("aria-hidden", "true");
  body.classList.remove("lightbox-open");
  window.setTimeout(() => {
    if (!lightbox.classList.contains("active")) lightboxImage.src = "";
  }, 200);
};

if (lightbox) {
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox || event.target.classList.contains("lightbox-close")) closeLightbox();
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    body.classList.remove("menu-open");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
    if (lightbox && lightbox.classList.contains("active")) closeLightbox();
  }
});

const pauseOtherVideos = (activeVideo) => {
  videoCards.forEach((otherCard) => {
    const otherVideo = otherCard.querySelector("video");
    if (otherVideo && otherVideo !== activeVideo) otherVideo.pause();
  });
};

videoCards.forEach((card) => {
  const video = card.querySelector("video");
  const soundToggle = card.querySelector(".sound-toggle");
  const fullscreenToggle = card.querySelector(".fullscreen-toggle");

  if (!video) return;

  card.addEventListener("mouseenter", () => {
    pauseOtherVideos(video);
    video.play().catch(() => {});
  });

  card.addEventListener("mouseleave", () => {
    video.pause();
    video.currentTime = 0;
  });

  card.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    pauseOtherVideos(video);
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });

  if (soundToggle) {
    soundToggle.addEventListener("click", () => {
      video.muted = !video.muted;
      soundToggle.textContent = video.muted ? "Sound" : "Mute";
      pauseOtherVideos(video);
      video.play().catch(() => {});
    });
  }

  if (fullscreenToggle) {
    fullscreenToggle.addEventListener("click", () => {
      pauseOtherVideos(video);
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }
      video.play().catch(() => {});
    });
  }
});
