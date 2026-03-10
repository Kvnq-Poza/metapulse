// Header and Navigation Logic
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".main-header");
  const menuToggle = document.querySelector("#menuToggle");
  if (!header || !menuToggle) return;

  // Mobile menu toggle
  menuToggle.addEventListener("click", () => {
    header.classList.toggle("nav-open");
    const isOpen = header.classList.contains("nav-open");
    menuToggle.setAttribute("aria-expanded", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  // Close nav when a link is clicked (especially for mobile)
  const navLinks = header.querySelectorAll(".nav-link, .btn-launch");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("nav-open");
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });

  // Header scroll effect
  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", handleScroll);
  handleScroll(); // Initial check

  // Docs TOC toggle (if exists)
  const docsTocToggle = document.querySelector("#docsTocToggle");
  const docsNav = document.querySelector("#docsNav");
  if (docsTocToggle && docsNav) {
    docsTocToggle.addEventListener("click", () => {
      docsTocToggle.classList.toggle("open");
      docsNav.classList.toggle("open");
      const isOpen = docsNav.classList.contains("open");
      docsTocToggle.setAttribute("aria-expanded", isOpen);
    });

    // Close TOC when a link is clicked
    docsNav.querySelectorAll(".docs-nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        docsTocToggle.classList.remove("open");
        docsNav.classList.remove("open");
        docsTocToggle.setAttribute("aria-expanded", "false");
      });
    });
  }
});
