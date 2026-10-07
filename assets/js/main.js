import { confidentialityNotice, internshipMeta, sections } from "./content-data.js";
import { logbookTemplate } from "./logbook.js";
import { journalTemplate } from "./journal.js";
import { evidenceTemplate } from "./evidence.js";
import { initHero3D } from "./three-hero.js";
import { initRoadmap3D } from "./three-roadmap.js";

const navList = document.getElementById("nav-list");
const main = document.getElementById("main-content");

const statusClass = {
  PLANNED: "status-planned",
  OBSERVED: "status-observed",
  COMPLETED: "status-completed",
  REFLECTED: "status-reflected",
  VERIFIED: "status-verified",
};

function makeBadge(status) {
  return `<span class="badge ${statusClass[status] || ""}">${status}</span>`;
}

function renderInternshipMeta() {
  const metaPanel = document.createElement("section");
  metaPanel.className = "panel";
  metaPanel.id = "internship-metadata";
  metaPanel.innerHTML = `
    <h2>Internship Metadata</h2>
    <ul class="meta-list">
      <li><strong>Title:</strong> ${internshipMeta.title}</li>
      <li><strong>Subtitle:</strong> ${internshipMeta.subtitle}</li>
      <li><strong>Placement:</strong> ${internshipMeta.placement}</li>
      <li><strong>Primary Supervisor:</strong> ${internshipMeta.supervisor}</li>
      <li><strong>Co-Supervisor:</strong> ${internshipMeta.coSupervisor}</li>
      <li><strong>Internship Coordinator:</strong> ${internshipMeta.coordinator}</li>
      <li><strong>Duration:</strong> ${internshipMeta.hours}</li>
    </ul>
    <p class="notice">All activity data must be evidence-based. Use placeholders until records are available.</p>
  `;
  main.appendChild(metaPanel);
}

function renderLogbookTemplate() {
  return `
    <div class="table-wrap" role="region" aria-label="Logbook template table">
      <table>
        <thead>
          <tr>
            <th>Day</th>
            <th>Planned</th>
            <th>Observed</th>
            <th>Completed</th>
            <th>Reflected</th>
            <th>Verified</th>
          </tr>
        </thead>
        <tbody>
          ${logbookTemplate
            .map(
              (entry) => `
            <tr>
              <td>${entry.day}</td>
              <td>${entry.planned}</td>
              <td>${entry.observed}</td>
              <td>${entry.completed}</td>
              <td>${entry.reflected}</td>
              <td>${entry.verified}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderJournalTemplate() {
  return `<div class="grid-two">${journalTemplate
    .map(
      (entry) => `
    <article class="panel">
      <h3>${entry.title}</h3>
      <p>${entry.prompt}</p>
      <div class="badges">${makeBadge(entry.status)}</div>
    </article>`
    )
    .join("")}</div>`;
}

function renderEvidenceTemplate() {
  return `
    <p class="notice">${confidentialityNotice}</p>
    <div class="table-wrap" role="region" aria-label="Evidence template table">
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Type</th>
            <th>Confidentiality</th>
            <th>Anonymized</th>
            <th>Verification</th>
          </tr>
        </thead>
        <tbody>
          ${evidenceTemplate
            .map(
              (entry) => `
            <tr>
              <td>${entry.item}</td>
              <td>${entry.type}</td>
              <td>${entry.confidentiality}</td>
              <td>${entry.anonymized}</td>
              <td>${entry.verification}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderSections() {
  sections.forEach((section) => {
    const navItem = document.createElement("li");
    navItem.innerHTML = `<a href="#${section.id}">${section.title.split(".")[0]}</a>`;
    navList.appendChild(navItem);

    const el = document.createElement("section");
    el.className = "panel";
    el.id = section.id;

    const badges = section.statuses.map((s) => makeBadge(s)).join("");
    let extra = `<p class="notice">Content status: ${badges}</p>`;

    if (section.includeRoadmapCanvas) {
      extra += `<div class="roadmap-canvas-wrap" id="roadmap-canvas" aria-hidden="true"></div>`;
      extra += `<p>Static roadmap notes: Orientation → Component Work → Observation → Documentation → Report/Viva.</p>`;
    }

    if (section.includeLogbook) {
      extra += renderLogbookTemplate();
    }

    if (section.includeJournal) {
      extra += renderJournalTemplate();
    }

    if (section.includeEvidence) {
      extra += renderEvidenceTemplate();
    }

    el.innerHTML = `
      <h2>${section.title}</h2>
      <p>${section.text}</p>
      ${extra}
    `;

    main.appendChild(el);
  });
}

function init() {
  renderInternshipMeta();
  renderSections();
  initHero3D("hero-canvas");
  const roadmapCanvas = document.getElementById("roadmap-canvas");
  initRoadmap3D(roadmapCanvas);
}

init();
