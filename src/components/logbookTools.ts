// Helpers for the Daily Logbook, Reflective Logbook and Internship Report draft.
// Everything here is plain TypeScript (no React) so it is easy to test.

export const DAILY_KEY = 'mujtaba-internship-daily-logbook';
export const REFLECTION_KEY = 'mujtaba-internship-reflective-logbook';
export const REPORT_KEY = 'mujtaba-internship-report-draft';
export const LAST_BACKUP_KEY = 'mujtaba-internship-last-backup';
export const IMPORT_EVENT = 'mujtaba-logbook-imported';

/** Planned internship duration (hours). Change here if the requirement changes. */
export const PLANNED_HOURS = { min: 60, max: 80 };

/** Placement people, written once and used by the Journey page and the printable PDFs. */
export const PLACEMENT_PEOPLE = {
  supervisor: 'Gohar Masroor, Assistant Commissioner',
  coSupervisor: 'Junaid Qazi, Mukhtiarkar (UT)',
  coordinator: 'Madam Bakhtawar Jaleel',
};

export type InternshipComponent = 'Teaching' | 'Non-Teaching/Institutional';

export const VERIFICATION_OPTIONS: string[] = ['Not yet verified', 'Sent for supervisor signature', 'Signed by supervisor'];

export type DailyEntry = {
  id: string;
  date: string;
  hours: string;
  component: InternshipComponent;
  tasks: string;
  observations: string;
  concepts: string;
  evidence: string;
  verification: string;
};

export type ReflectionEntry = {
  id: string;
  date: string;
  dayNumber: string;
  reflection: string;
};

export type ReportDraft = Record<string, string>;

// These labels are also the storage keys of the saved report draft. Do not rename them.
export const reportFields = [
  'Introduction and placement context',
  'Aims and objectives',
  'Internship structure and methodology/activities',
  'Teaching component',
  'Non-Teaching/Institutional component',
  'Applied Linguistics analysis',
  'Multilingualism and communication',
  'Learning outcomes',
  'Conclusion and recommendations',
];

export const emptyDaily: Omit<DailyEntry, 'id'> = {
  date: '',
  hours: '',
  component: 'Teaching',
  tasks: '',
  observations: '',
  concepts: '',
  evidence: '',
  verification: 'Not yet verified',
};

export const emptyReflection: Omit<ReflectionEntry, 'id'> = {
  date: '',
  dayNumber: '',
  reflection: '',
};

const str = (value: unknown): string => (typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '');

export function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function normalizeDaily(raw: unknown): DailyEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  return {
    id: str(r.id) || newId(),
    date: str(r.date).trim(),
    hours: str(r.hours),
    component: r.component === 'Non-Teaching/Institutional' ? 'Non-Teaching/Institutional' : 'Teaching',
    tasks: str(r.tasks),
    observations: str(r.observations),
    concepts: str(r.concepts),
    evidence: str(r.evidence),
    verification: str(r.verification) || 'Not yet verified',
  };
}

export function normalizeReflection(raw: unknown): ReflectionEntry | null {
  if (!raw || typeof raw !== 'object') return null;

  const r = raw as Record<string, unknown>;

  const oldFields = [
    ['Experience or situation', str(r.experience)],
    ['What I observed', str(r.observed)],
    ['Connection to linguistic theory', str(r.theory)],
    ['What I learned', str(r.learned)],
    ['Challenge or question', str(r.challenge)],
    ['What I would improve or do next', str(r.action)],
  ];

  const legacyReflection = oldFields
    .filter(([, value]) => value.trim() !== '')
    .map(([label, value]) => `${label}:\n${value}`)
    .join('\n\n');

  return {
    id: str(r.id) || newId(),
    date: str(r.date).trim(),
    dayNumber: str(r.dayNumber),
    reflection: str(r.reflection) || legacyReflection,
  };
}
function keepUnreadableCopy(key: string, raw: string) {
  try {
    localStorage.setItem(`${key}-unreadable-copy`, raw);
  } catch {
    /* nothing more we can do */
  }
}

/** Reads a saved list. If the saved text is damaged, a copy is kept under "<key>-unreadable-copy". */
export function readList<T>(key: string, normalize: (raw: unknown) => T | null): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      keepUnreadableCopy(key, raw);
      return [];
    }
    if (!Array.isArray(parsed)) {
      keepUnreadableCopy(key, raw);
      return [];
    }
    return parsed.map(normalize).filter((item): item is T => item !== null);
  } catch {
    return [];
  }
}

export function readReport(): ReportDraft {
  const base: ReportDraft = Object.fromEntries(reportFields.map((field) => [field, '']));
  try {
    const raw = localStorage.getItem(REPORT_KEY);
    if (!raw) return base;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      keepUnreadableCopy(REPORT_KEY, raw);
      return base;
    }
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      for (const field of reportFields) base[field] = str((parsed as Record<string, unknown>)[field]);
    }
  } catch {
    /* use the empty draft */
  }
  return base;
}

/** Saves to the browser. Returns false if the browser refused (storage full or blocked). */
export function writeJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// ---------- hours ----------

const sane = (n: number): number | null => (Number.isFinite(n) && n > 0 && n <= 24 ? Math.round(n * 100) / 100 : null);

const toMinutes = (hour: number, minute: number, ampm?: string): number | null => {
  if (hour > 23 || minute > 59) return null;
  let h = hour;
  if (ampm === 'pm' && h < 12) h += 12;
  if (ampm === 'am' && h === 12) h = 0;
  if (ampm && hour > 12) return null;
  return h * 60 + minute;
};

/**
 * Understands: "3", "2.5", "3 hours", "90 min", "09:00-12:30", "9am - 12pm".
 * Returns null when the text cannot be counted as hours.
 */
export function parseHours(input: string): number | null {
  const s = input.trim().toLowerCase();
  if (!s) return null;

  let m = s.match(/^(\d+(?:[.,]\d+)?)\s*(?:h|hr|hrs|hour|hours)?$/);
  if (m) return sane(parseFloat(m[1].replace(',', '.')));

  m = s.match(/^(\d+(?:[.,]\d+)?)\s*(?:m|min|mins|minute|minutes)$/);
  if (m) return sane(parseFloat(m[1].replace(',', '.')) / 60);

  m = s.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?\s*(?:-|–|—|to|until)\s*(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?$/);
  if (m) {
    const looksLikeClock = /[:.]\d{2}/.test(s) || Boolean(m[3]) || Boolean(m[6]);
    if (!looksLikeClock) return null;
    const start = toMinutes(Number(m[1]), Number(m[2] ?? 0), m[3]);
    const end = toMinutes(Number(m[4]), Number(m[5] ?? 0), m[6]);
    if (start === null || end === null || end <= start) return null;
    return sane((end - start) / 60);
  }
  return null;
}

export function formatHours(n: number): string {
  return `${Number(n.toFixed(2))}`;
}

export type HoursSummary = { total: number; teaching: number; nonTeaching: number; uncounted: number };

export function hoursSummary(entries: DailyEntry[]): HoursSummary {
  const out: HoursSummary = { total: 0, teaching: 0, nonTeaching: 0, uncounted: 0 };
  for (const entry of entries) {
    const hours = parseHours(entry.hours);
    if (hours === null) {
      out.uncounted += 1;
      continue;
    }
    out.total += hours;
    if (entry.component === 'Teaching') out.teaching += hours;
    else out.nonTeaching += hours;
  }
  out.total = Math.round(out.total * 100) / 100;
  out.teaching = Math.round(out.teaching * 100) / 100;
  out.nonTeaching = Math.round(out.nonTeaching * 100) / 100;
  return out;
}

/** Oldest date first. Entries without a date go last and keep their order. */
export function sortByDate<T extends { date: string }>(entries: T[]): T[] {
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => {
      const da = a.entry.date;
      const db = b.entry.date;
      if (da && db && da !== db) return da < db ? -1 : 1;
      if (da && !db) return -1;
      if (!da && db) return 1;
      return a.index - b.index;
    })
    .map((item) => item.entry);
}

// ---------- backup and restore ----------

export type BackupFile = {
  app: 'mujtaba-internship-portfolio';
  kind: 'logbook-backup';
  version: 1;
  exportedAt: string;
  dailyLogbook: DailyEntry[];
  reflectiveLogbook: ReflectionEntry[];
  reportDraft: ReportDraft;
};

export function collectBackup(): BackupFile {
  return {
    app: 'mujtaba-internship-portfolio',
    kind: 'logbook-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    dailyLogbook: readList(DAILY_KEY, normalizeDaily),
    reflectiveLogbook: readList(REFLECTION_KEY, normalizeReflection),
    reportDraft: readReport(),
  };
}

export type ParsedBackup = { ok: true; data: BackupFile } | { ok: false; error: string };

export function parseBackup(text: string): ParsedBackup {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'This file could not be read. Please choose a backup file that was exported from this portfolio.' };
  }
  if (!parsed || typeof parsed !== 'object') return { ok: false, error: 'This is not a backup file from this portfolio.' };
  const p = parsed as Record<string, unknown>;
  if (p.app !== 'mujtaba-internship-portfolio' || p.kind !== 'logbook-backup') {
    return { ok: false, error: 'This is not a backup file from this portfolio.' };
  }
  const list = <T,>(value: unknown, normalize: (raw: unknown) => T | null): T[] =>
    Array.isArray(value) ? value.map(normalize).filter((item): item is T => item !== null) : [];
  const report: ReportDraft = Object.fromEntries(reportFields.map((field) => [field, '']));
  if (p.reportDraft && typeof p.reportDraft === 'object' && !Array.isArray(p.reportDraft)) {
    for (const field of reportFields) report[field] = str((p.reportDraft as Record<string, unknown>)[field]);
  }
  return {
    ok: true,
    data: {
      app: 'mujtaba-internship-portfolio',
      kind: 'logbook-backup',
      version: 1,
      exportedAt: str(p.exportedAt),
      dailyLogbook: list(p.dailyLogbook, normalizeDaily),
      reflectiveLogbook: list(p.reflectiveLogbook, normalizeReflection),
      reportDraft: report,
    },
  };
}

export type ImportPlan = {
  newDaily: DailyEntry[];
  newReflections: ReflectionEntry[];
  reportFieldsToFill: string[];
};

const uniqueNew = <T extends { id: string }>(incoming: T[], existing: T[]): T[] => {
  const seen = new Set(existing.map((item) => item.id));
  const out: T[] = [];
  for (const item of incoming) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
};

/** Works out what an import would add. Nothing already in this browser is replaced or deleted. */
export function planImport(data: BackupFile): ImportPlan {
  const currentDaily = readList(DAILY_KEY, normalizeDaily);
  const currentReflections = readList(REFLECTION_KEY, normalizeReflection);
  const currentReport = readReport();
  return {
    newDaily: uniqueNew(data.dailyLogbook, currentDaily),
    newReflections: uniqueNew(data.reflectiveLogbook, currentReflections),
    reportFieldsToFill: reportFields.filter((field) => currentReport[field].trim() === '' && data.reportDraft[field].trim() !== ''),
  };
}

export function applyImport(data: BackupFile, plan: ImportPlan): boolean {
  const currentDaily = readList(DAILY_KEY, normalizeDaily);
  const currentReflections = readList(REFLECTION_KEY, normalizeReflection);
  const currentReport = readReport();
  const mergedReport: ReportDraft = { ...currentReport };
  for (const field of plan.reportFieldsToFill) mergedReport[field] = data.reportDraft[field];
  const ok =
    writeJson(DAILY_KEY, [...currentDaily, ...plan.newDaily]) &&
    writeJson(REFLECTION_KEY, [...currentReflections, ...plan.newReflections]) &&
    writeJson(REPORT_KEY, mergedReport);
  window.dispatchEvent(new Event(IMPORT_EVENT));
  return ok;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function todayStamp(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function readLastBackup(): string | null {
  try {
    return localStorage.getItem(LAST_BACKUP_KEY);
  } catch {
    return null;
  }
}

/** Downloads one backup file with the daily logbook, reflective logbook and report draft. */
export function downloadBackup(): void {
  const backup = collectBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mujtaba-internship-backup-${todayStamp()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  try {
    localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
  } catch {
    /* the backup file was still downloaded */
  }
}
