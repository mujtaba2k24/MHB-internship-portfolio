
import { roadmapPhases, statusFramework } from "./content-data.js";
import { logbookTemplate } from "./logbook.js";
import { journalTemplate } from "./journal.js";
import { evidenceTemplate } from "./evidence.js";
import { initHero3D } from "./three-hero.js";
import { initRoadmap3D } from "./three-roadmap.js";

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

function renderStatusFramework() {
  const container = document.getElementById("status-framework-grid");
  if (!container) return;

  container.innerHTML = statusFramework
    .map(
      (item) => `
        <article>
          <h3>${item.code}</h3>
          <p><strong>${item.label}</strong></p>
          <p>${item.description}</p>
        </article>
      `
    )
    .join("");
}

function renderRoadmapList() {
  const list = document.getElementById("roadmap-phase-list");
  if (!list) return;

  list.innerHTML = roadmapPhases
    .map(
      (phase) => `
        <li>
          <h3>${phase.number} ${phase.title}</h3>
          <p>${phase.explanation}</p>
          <span class="status-tag planned">${phase.status}</span>
        </li>
      `
    )
    .join("");
}

function renderLogbook() {
  const body = document.getElementById("logbook-body");
  if (!body) return;

  body.innerHTML = logbookTemplate
    .map(
      (entry) => `
        <tr>
          <td>${entry.date || "To be recorded"}</td>
          <td>${entry.actualActivity || entry.plannedActivity || "To be recorded"}</td>
          <td>${entry.component || "To be specified"}</td>
          <td>${entry.hours ?? "To be recorded"}</td>
          <td>${entry.observation || entry.reflection || "To be recorded"}</td>
          <td>${entry.evidence || "To be added when available"}</td>
          <td>
            <span class="status-tag planned">
              ${entry.verification || "PLANNED"}
            </span>
          </td>
        </tr>
      `
    )
    .join("");
}

function renderJournal() {
  const grid = document.getElementById("journal-grid");
  if (!grid) return;

  grid.innerHTML = journalTemplate
    .map(
      (entry) => `
        <article class="journal-card">
          <h3>${entry.title}</h3>
          <ul>
            ${entry.prompts
              .map((prompt) => `<li>${prompt}</li>`)
              .join("")}
          </ul>
          <span class="status-tag planned">${entry.status}</span>
        </article>
      `
    )
    .join("");
}

function renderEvidence() {
  const grid = document.getElementById("evidence-grid");
  if (!grid) return;

  grid.innerHTML = evidenceTemplate
    .map(
      (entry) => `
        <article>
          <h3>${entry.category}</h3>
          <ul class="evidence-meta">
            <li><strong>Type:</strong> ${entry.type}</li>
            <li><strong>Date:</strong> ${entry.date}</li>
            <li><strong>Context:</strong> ${entry.context}</li>
            <li><strong>Confidentiality:</strong> ${entry.confidentiality}</li>
            <li><strong>Anonymization:</strong> ${entry.anonymization}</li>
            <li>
              <strong>Verification:</strong>
              <span class="status-tag planned">${entry.verification}</span>
            </li>
          </ul>
        </article>
      `
    )
    .join("");
}

function setupContentsPanel() {
  const toggle = document.getElementById("menu-toggle");
  const panel = document.getElementById("contents-panel");
  const close = document.getElementById("menu-close");

  if (!toggle || !panel || !close) return;

  function openPanel() {
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    close.focus();
  }

  function closePanel() {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  }

  toggle.addEventListener("click", () => {
    if (panel.hidden) {
      openPanel();
    } else {
      closePanel();
    }
  });

  close.addEventListener("click", closePanel);

  panel.addEventListener("click", (event) => {
    if (event.target === panel) {
      closePanel();
    }
  });

  panel.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      closePanel();
    }
  });
}

function setupActiveNavigation() {
  const links = [
    ...document.querySelectorAll('.quick-nav a[href^="#"]'),
  ];

  if (!links.length || !("IntersectionObserver" in window)) return;

  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        links.forEach((link) => {
          const isActive =
            link.getAttribute("href") === `#${entry.target.id}`;

          link.classList.toggle("active", isActive);

          if (isActive) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    },
    {
      rootMargin: "-35% 0px -55% 0px",
      threshold: 0,
    }
  );

  sections.forEach((section) => observer.observe(section));
}

function setupScrollProgress() {
  const progress = document.getElementById("scroll-progress");
  if (!progress) return;

  const update = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const scrolled = doc.scrollTop;
    const percentage =
      max > 0 ? Math.min(100, Math.max(0, (scrolled / max) * 100)) : 0;

    progress.style.width = `${percentage}%`;
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

function setupReveal() {
  const elements = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1 }
  );

  elements.forEach((element) => observer.observe(element));
}

function init3D() {
  const heroCanvas = document.getElementById("hero-canvas");
  const roadmapCanvas = document.getElementById("roadmap-canvas");

  if (heroCanvas) initHero3D("hero-canvas");
  if (roadmapCanvas) initRoadmap3D(roadmapCanvas);
}

function init() {
  renderStatusFramework();
  renderRoadmapList();
  renderLogbook();
  renderJournal();
  renderEvidence();

  setupContentsPanel();
  setupActiveNavigation();
  setupScrollProgress();
  setupReveal();
  init3D();
}

init();
