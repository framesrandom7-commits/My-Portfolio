const body = document.body;
const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const revealItems = document.querySelectorAll("[data-reveal]");
const galleryItems = document.querySelectorAll(".gallery-item");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxCaption = lightbox.querySelector("figcaption");
const reelCards = document.querySelectorAll(".reel-card");

const updateHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 18);
};

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

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

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -70px 0px"
  }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 42, 260)}ms`;
  revealObserver.observe(item);
});

galleryItems.forEach((item) => {
  item.addEventListener("click", () => {
    const image = item.dataset.full;
    const title = item.dataset.title || item.querySelector("img").alt;

    lightboxImage.src = image;
    lightboxImage.alt = title;
    lightboxCaption.textContent = title;
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
      lightboxCaption.textContent = "";
    }
  }, 280);
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

    if (lightbox.classList.contains("active")) {
      closeLightbox();
    }
  }
});

reelCards.forEach((card) => {
  const video = card.querySelector("video");
  const soundToggle = card.querySelector(".sound-toggle");

  const playVideo = () => {
    video.play().catch(() => {});
  };

  const pauseVideo = () => {
    video.pause();
    video.currentTime = 0;
  };

  card.addEventListener("mouseenter", playVideo);
  card.addEventListener("mouseleave", pauseVideo);
  card.addEventListener("focusin", playVideo);
  card.addEventListener("focusout", pauseVideo);

  const mobileObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (window.matchMedia("(hover: none)").matches) {
          if (entry.isIntersecting) {
            playVideo();
          } else {
            video.pause();
          }
        }
      });
    },
    { threshold: 0.55 }
  );

  mobileObserver.observe(card);

  soundToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    video.muted = !video.muted;
    soundToggle.textContent = video.muted ? "Sound" : "Mute";
    soundToggle.setAttribute("aria-label", video.muted ? "Unmute reel" : "Mute reel");
    playVideo();
  });
});
