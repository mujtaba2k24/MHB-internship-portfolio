import { roadmapPhases, statusFramework } from "./content-data.js";
import { logbookTemplate } from "./logbook.js";
import { journalTemplate } from "./journal.js";
import { evidenceTemplate } from "./evidence.js";
import { initHero3D } from "./three-hero.js";
import { initRoadmap3D } from "./three-roadmap.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
        <td>${entry.day}</td>
        <td>${entry.date}</td>
        <td>${entry.hours}</td>
        <td>${entry.component}</td>
        <td>${entry.plannedActivity}</td>
        <td>${entry.actualActivity}</td>
        <td>${entry.observation}</td>
        <td>${entry.reflection}</td>
        <td>${entry.evidence}</td>
        <td><span class="status-tag planned">${entry.verification}</span></td>
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
          ${entry.prompts.map((prompt) => `<li>${prompt}</li>`).join("")}
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
          <li><strong>Verification:</strong> <span class="status-tag planned">${entry.verification}</span></li>
        </ul>
      </article>
    `
    )
    .join("");
}

function setupActiveNavigation() {
  const links = [...document.querySelectorAll('#nav-list a[href^="#"]')];
  if (!links.length) return;

  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.classList.remove("active"));
        const activeLink = links.find((link) => link.getAttribute("href") === `#${entry.target.id}`);
        if (activeLink) activeLink.classList.add("active");
      });
    },
    {
      rootMargin: "-45% 0px -50% 0px",
      threshold: 0.05,
    }
  );

  sections.forEach((section) => observer.observe(section));
}

function setupScrollProgress() {
  const progress = document.getElementById("scroll-progress");
  if (!progress) return;

  const update = () => {
    const doc = document.documentElement;
    const scrolled = doc.scrollTop;
    const max = doc.scrollHeight - doc.clientHeight;
    const width = max > 0 ? (scrolled / max) * 100 : 0;
    progress.style.width = `${width}%`;
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

function setupReveal() {
  if (reduceMotion) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

function init3D() {
  initHero3D("hero-canvas");
  initRoadmap3D(document.getElementById("roadmap-canvas"));
}

function init() {
  renderStatusFramework();
  renderRoadmapList();
  renderLogbook();
  renderJournal();
  renderEvidence();
  setupActiveNavigation();
  setupScrollProgress();
  setupReveal();
  init3D();
}

init();
