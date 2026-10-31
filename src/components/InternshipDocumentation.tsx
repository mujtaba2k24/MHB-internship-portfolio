import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { education, experience, internshipStages, profile } from '../data/portfolio';
import { EASE, SectionHeading } from './fx';
import {
  DAILY_KEY,
  IMPORT_EVENT,
  PLACEMENT_PEOPLE,
  PLANNED_HOURS,
  REFLECTION_KEY,
  REPORT_KEY,
  VERIFICATION_OPTIONS,
  applyImport,
  downloadBackup,
  emptyDaily,
  emptyReflection,
  formatHours,
  hoursSummary,
  newId,
  normalizeDaily,
  normalizeReflection,
  parseBackup,
  parseHours,
  planImport,
  readLastBackup,
  readList,
  readReport,
  reportFields,
  sortByDate,
  writeJson,
  type DailyEntry,
  type InternshipComponent,
  type ReflectionEntry,
} from './logbookTools';

const inputClass = 'mt-1 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-bone outline-none transition placeholder:text-smoke focus:border-crimson-2';
const secondaryButton = 'min-h-11 rounded-md border border-white/20 px-4 text-sm font-semibold text-bone transition hover:border-bone disabled:cursor-not-allowed disabled:opacity-40';

function Field({ label, value, onChange, multiline = false, placeholder }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; placeholder: string }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-smoke">
      {label}
      {multiline ? <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} /> : <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} />}
    </label>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const isIso = value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value);
  return (
    <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-smoke">
      {label}
      {isIso ? (
        <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className={`${inputClass} [color-scheme:dark]`} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="YYYY-MM-DD" className={inputClass} />
      )}
      {!isIso && <span className="mt-1 block text-[11px] normal-case tracking-normal text-crimson-2">Use the format YYYY-MM-DD so entries sort correctly.</span>}
    </label>
  );
}

function LocalNote({ failed = false }: { failed?: boolean }) {
  return (
    <>
      {failed && (
        <p role="alert" className="mt-4 text-xs font-semibold leading-relaxed text-crimson-2">
          This browser could not save your latest change (storage may be full or blocked). Export a backup now so nothing is lost.
        </p>
      )}
      <p className="mt-4 text-xs leading-relaxed text-smoke">These drafts are stored only in this browser. They are not submitted to the university or supervisors. Export a backup regularly.</p>
    </>
  );
}

// ---------- printing (Download PDF) ----------

/** Opens the browser's print window with the printable sheet. Choose "Save as PDF" as the destination. */
function usePrintSheet() {
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!active) return;
    const finish = () => {
      document.body.classList.remove('printing-logbook');
      setActive(false);
    };
    document.body.classList.add('printing-logbook');
    window.addEventListener('afterprint', finish, { once: true });
    const timer = window.setTimeout(() => window.print(), 200);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('afterprint', finish);
      document.body.classList.remove('printing-logbook');
    };
  }, [active]);
  return [active, () => setActive(true)] as const;
}

const PRINT_CSS = `
#logbook-print-root { display: none; }
@media print {
  html { background: #fff !important; }
  body.printing-logbook { background: #fff !important; }
  body.printing-logbook #root { display: none !important; }
  body.printing-logbook #logbook-print-root { display: block !important; }
}
#logbook-print-root { font-family: 'Segoe UI', Arial, 'Noto Naskh Arabic', sans-serif; color: #111; font-size: 10pt; line-height: 1.35; }
#logbook-print-root h1 { font-size: 16pt; margin: 0; font-weight: 700; }
#logbook-print-root h2 { font-size: 11pt; margin: 0 0 1.5mm; font-weight: 700; }
#logbook-print-root .lp-sub { margin: 1.5mm 0 4mm; font-size: 10pt; color: #333; }
#logbook-print-root table { width: 100%; border-collapse: collapse; }
#logbook-print-root .lp-meta { margin-bottom: 4mm; }
#logbook-print-root .lp-meta td { border: 0.4pt solid #888; padding: 1mm 2mm; vertical-align: top; font-size: 9pt; }
#logbook-print-root .lp-meta td.k { width: 34mm; font-weight: 600; }
#logbook-print-root .lp-table { table-layout: fixed; }
#logbook-print-root .lp-table th, #logbook-print-root .lp-table td { border: 0.5pt solid #333; padding: 1.5mm; vertical-align: top; font-size: 8.5pt; overflow-wrap: anywhere; white-space: pre-wrap; }
#logbook-print-root .lp-table th { background: #eee; text-align: left; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
#logbook-print-root .lp-table thead { display: table-header-group; }
#logbook-print-root .lp-table tr { break-inside: avoid; page-break-inside: avoid; }
#logbook-print-root .lp-table td.row { height: 16mm; }
#logbook-print-root .lp-total { margin: 4mm 0 0; font-size: 10pt; font-weight: 600; }
#logbook-print-root .lp-sign { display: flex; gap: 10mm; margin-top: 12mm; break-inside: avoid; page-break-inside: avoid; }
#logbook-print-root .lp-sign div { flex: 1; border-top: 0.6pt solid #111; padding-top: 1mm; font-size: 9pt; }
#logbook-print-root .lp-refl { margin-bottom: 6mm; break-inside: avoid; page-break-inside: avoid; }
#logbook-print-root .lp-refl td.k { width: 40mm; font-weight: 600; background: #f3f3f3; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
#logbook-print-root .lp-foot { margin-top: 6mm; font-size: 8.5pt; color: #444; }
`;

function today() {
  return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function PrintHeader({ title }: { title: string }) {
  return (
    <>
      <h1>{title}</h1>
      <p className="lp-sub">{experience[0].role}</p>
      <table className="lp-meta">
        <tbody>
          <tr><td className="k">Student</td><td>{profile.fullName}</td></tr>
          <tr><td className="k">Degree</td><td>{education[0].degree}, {education[0].school}</td></tr>
          <tr><td className="k">Placement</td><td>{experience[0].company}</td></tr>
          <tr><td className="k">Supervisor</td><td>{PLACEMENT_PEOPLE.supervisor}</td></tr>
          <tr><td className="k">Co-supervisor</td><td>{PLACEMENT_PEOPLE.coSupervisor}</td></tr>
          <tr><td className="k">Coordinator</td><td>{PLACEMENT_PEOPLE.coordinator}</td></tr>
          <tr><td className="k">Planned duration</td><td>{PLANNED_HOURS.min}–{PLANNED_HOURS.max} hours</td></tr>
        </tbody>
      </table>
    </>
  );
}

function DailyPrintSheet({ entries }: { entries: DailyEntry[] }) {
  const sorted = sortByDate(entries);
  const sum = hoursSummary(entries);
  return createPortal(
    <div id="logbook-print-root">
      <style>{`${PRINT_CSS} @page { size: A4 landscape; margin: 12mm; }`}</style>
      <PrintHeader title="Internship Daily Logbook" />
      <table className="lp-table">
        <colgroup>
          <col style={{ width: '6%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '45%' }} />
          <col style={{ width: '18%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '12%' }} />
        </colgroup>
        <thead>
          <tr>
            <th>Day</th>
            <th>Date</th>
            <th>Activities performed</th>
            <th>Skills developed</th>
            <th>Hours logged</th>
            <th>Signature</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((entry, index) => (
            <tr key={entry.id}>
              <td className="row">{index + 1}</td>
              <td>{entry.date}</td>
              <td dir="auto">{entry.tasks}</td>
              <td dir="auto">{entry.concepts}</td>
              <td dir="auto">{entry.hours}</td>
              <td />
            </tr>
          ))}
        </tbody>
      </table>
      <p className="lp-total">
        Total hours recorded: {formatHours(sum.total)} h (planned {PLANNED_HOURS.min}–{PLANNED_HOURS.max} h)
        {sum.uncounted > 0 ? ` · ${sum.uncounted} ${sum.uncounted === 1 ? 'entry has' : 'entries have'} hours that could not be counted` : ''}
      </p>
      <div className="lp-sign">
        <div>Student signature: {profile.fullName}<br />Date:</div>
        <div>Supervisor signature: {PLACEMENT_PEOPLE.supervisor}<br />Date:</div>
        <div>Co-supervisor signature: {PLACEMENT_PEOPLE.coSupervisor}<br />Date:</div>
      </div>
      <p className="lp-foot">Printed on {today()}. Signatures are added by hand after printing.</p>
    </div>,
    document.body,
  );
}


function ReflectionPrintSheet({ entries }: { entries: ReflectionEntry[] }) {
  const sorted = sortByDate(entries);

  return createPortal(
    <div id="logbook-print-root">
      <style>{`${PRINT_CSS} @page { size: A4 portrait; margin: 14mm; }`}</style>

      <PrintHeader title="Internship Reflective Logbook" />

      {sorted.map((entry, index) => (
        <section key={entry.id} className="lp-refl">
          <h2>
            {entry.dayNumber || `Reflection ${index + 1}`}
            {entry.date ? ` · ${entry.date}` : ''}
          </h2>

          <table className="lp-table">
            <tbody>
              <tr>
                <td className="k">Reflective Log</td>
                <td dir="auto" style={{ whiteSpace: 'pre-wrap' }}>
                  {entry.reflection}
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      ))}

      <p className="lp-foot">
        Prepared by {profile.fullName}. Printed on {today()}.
      </p>
    </div>,
    document.body,
  );
}


// ---------- backup bar ----------

function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function BackupBar({ onPdf, pdfDisabled = false }: { onPdf?: () => void; pdfDisabled?: boolean }) {
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [lastBackup, setLastBackup] = useState<string | null>(() => readLastBackup());
  const fileRef = useRef<HTMLInputElement>(null);

  const doExport = () => {
    downloadBackup();
    setLastBackup(readLastBackup());
    setMessage({ ok: true, text: 'Backup file downloaded. Keep a copy somewhere safe, such as Google Drive or your email.' });
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = parseBackup(await readFileText(file));
      if (!parsed.ok) {
        setMessage({ ok: false, text: parsed.error });
        return;
      }
      const plan = planImport(parsed.data);
      const reportCount = plan.reportFieldsToFill.length;
      if (plan.newDaily.length === 0 && plan.newReflections.length === 0 && reportCount === 0) {
        setMessage({ ok: true, text: 'Nothing to add. Everything in this backup is already in this browser.' });
        return;
      }
      const summary = `Add ${plan.newDaily.length} daily ${plan.newDaily.length === 1 ? 'entry' : 'entries'}, ${plan.newReflections.length} ${plan.newReflections.length === 1 ? 'reflection' : 'reflections'} and ${reportCount} empty report ${reportCount === 1 ? 'section' : 'sections'} from this backup?\n\nNothing already in this browser will be replaced or deleted.`;
      if (!window.confirm(summary)) {
        setMessage({ ok: true, text: 'Import cancelled. Nothing was changed.' });
        return;
      }
      const saved = applyImport(parsed.data, plan);
      setMessage(saved ? { ok: true, text: 'Backup imported.' } : { ok: false, text: 'The backup was read, but this browser could not save all of it.' });
    } catch {
      setMessage({ ok: false, text: 'This file could not be read.' });
    }
  };

  return (
    <div className="gutter mb-5">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={doExport} className={secondaryButton}>Export backup</button>
          <button type="button" onClick={() => fileRef.current?.click()} className={secondaryButton}>Import backup</button>
          {onPdf && <button type="button" onClick={onPdf} disabled={pdfDisabled} className={secondaryButton}>Download PDF</button>}
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            aria-label="Choose a backup file to import"
            onChange={(e) => {
              void onFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-smoke">
          {lastBackup ? `Last backup from this browser: ${new Date(lastBackup).toLocaleString()}.` : 'No backup has been exported from this browser yet.'} One backup file holds the daily logbook, the reflective logbook and the report draft together.
          {onPdf ? ' For the PDF, choose "Save as PDF" as the printer in the window that opens, and turn off "Headers and footers".' : ''}
        </p>
        {message && (
          <p role="status" className={`mt-2 text-xs font-semibold ${message.ok ? 'text-mist' : 'text-crimson-2'}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}

// ---------- sections ----------

export function InternshipAims() {
  return (
    <>
      <SectionHeading kicker="Planning document" title="Internship Aims and Objectives" aside={<p className="max-w-sm text-sm text-mist">Planned purpose and expected learning outcomes for the internship.</p>} />
      <div className="gutter grid gap-4 lg:grid-cols-2">
        <InfoBlock title="Internship purpose">To connect English Applied Linguistics with teaching, multilingual communication, and language use in public administration and education.</InfoBlock>
        <InfoBlock title="General aim">To observe and apply relevant Applied Linguistics concepts in a supervised institutional placement.</InfoBlock>
        <InfoBlock title="Specific objectives"><ul className="space-y-2"><li>Observe language use, language choice, and multilingual communication.</li><li>Relate language teaching principles to classroom and professional communication.</li><li>Develop a theory-to-practice reflection habit through documented internship work.</li><li>Maintain accurate records of activities, observations, and verification.</li></ul></InfoBlock>
        <InfoBlock title="Expected learning outcomes"><ul className="space-y-2"><li>Expected: clearer understanding of institutional and professional communication.</li><li>Expected: improved ability to connect sociolinguistics with observed practice.</li><li>Expected: more careful reflection on multilingualism and language teaching.</li><li>Expected: a structured internship report supported by authentic records.</li></ul></InfoBlock>
      </div>
    </>
  );
}

export function InternshipJourney() {
  return (
    <>
      <SectionHeading kicker="Placement overview" title="Internship Journey" aside={<p className="max-w-sm text-sm text-mist">A placement timeline. Planned stages are clearly marked and will be updated as evidence becomes available.</p>} />
      <div className="gutter grid gap-4 lg:grid-cols-4">
        {internshipStages.map((stage, index) => <motion.article key={stage.title} className="rounded-2xl bg-ink-2 p-5 ring-1 ring-white/10" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08, duration: 0.6, ease: EASE }}><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-crimson-2">0{index + 1} · {stage.status}</p><h3 className="mt-5 font-display text-3xl leading-none text-bone">{stage.title}</h3><p className="mt-3 text-sm leading-relaxed text-mist">{stage.detail}</p></motion.article>)}
      </div>
      <div className="gutter mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-mist"><strong className="text-bone">Placement:</strong> {experience[0].company}. <strong className="text-bone">Supervisor:</strong> {PLACEMENT_PEOPLE.supervisor}. <strong className="text-bone">Co-supervisor:</strong> {PLACEMENT_PEOPLE.coSupervisor}. <strong className="text-bone">Coordinator:</strong> {PLACEMENT_PEOPLE.coordinator}. <strong className="text-bone">Status:</strong> IN PROGRESS. Planned duration: {PLANNED_HOURS.min}-{PLANNED_HOURS.max} hours.</div>
    </>
  );
}

function HoursPanel({ entries }: { entries: DailyEntry[] }) {
  const sum = hoursSummary(entries);
  const percent = Math.min(100, (sum.total / PLANNED_HOURS.max) * 100);
  return (
    <div className="rounded-2xl bg-ink-2 p-5 ring-1 ring-white/10" aria-label="Hours summary">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-crimson-2">Hours recorded</p>
      <p className="mt-2 font-display text-3xl text-bone">{formatHours(sum.total)} h <span className="text-base text-mist">of {PLANNED_HOURS.min}–{PLANNED_HOURS.max} h planned</span></p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-crimson-2" style={{ width: `${percent}%` }} /></div>
      <p className="mt-3 text-xs text-smoke">Teaching: {formatHours(sum.teaching)} h · Non-Teaching/Institutional: {formatHours(sum.nonTeaching)} h</p>
      {sum.uncounted > 0 && <p className="mt-1 text-xs text-smoke">{sum.uncounted} {sum.uncounted === 1 ? 'entry has' : 'entries have'} hours that could not be counted. Write hours like 3, 2.5 or 09:00-12:30.</p>}
    </div>
  );
}

export function DailyLogbook() {
  const [entries, setEntries] = useState<DailyEntry[]>(() => readList(DAILY_KEY, normalizeDaily));
  const [draft, setDraft] = useState<Omit<DailyEntry, 'id'>>({ ...emptyDaily });
  const [editing, setEditing] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [saveFailed, setSaveFailed] = useState(false);
  const [printing, startPrint] = usePrintSheet();
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSaveFailed(!writeJson(DAILY_KEY, entries));
  }, [entries]);

  useEffect(() => {
    const reload = () => setEntries(readList(DAILY_KEY, normalizeDaily));
    window.addEventListener(IMPORT_EVENT, reload);
    return () => window.removeEventListener(IMPORT_EVENT, reload);
  }, []);

  const update = (key: keyof Omit<DailyEntry, 'id' | 'component'>, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const clearForm = () => {
    setDraft({ ...emptyDaily });
    setEditing(null);
    setFormError('');
  };

  const save = () => {
    if (!draft.tasks.trim()) {
      setFormError('Add the tasks you performed before saving.');
      return;
    }
    const entry: DailyEntry = { ...draft, id: editing ?? newId() };
    setEntries((current) => (editing ? current.map((item) => (item.id === editing ? entry : item)) : [...current, entry]));
    clearForm();
  };

  const edit = (entry: DailyEntry) => {
    const { id, ...rest } = entry;
    setDraft(rest);
    setEditing(id);
    setFormError('');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const remove = (entry: DailyEntry) => {
    if (!window.confirm('Delete this daily entry? This cannot be undone.\n\nTip: export a backup first if you are not sure.')) return;
    setEntries((current) => current.filter((item) => item.id !== entry.id));
    if (editing === entry.id) clearForm();
  };

  const hoursNow = draft.hours.trim() ? parseHours(draft.hours) : null;
  const verificationOptions = VERIFICATION_OPTIONS.includes(draft.verification) ? VERIFICATION_OPTIONS : [...VERIFICATION_OPTIONS, draft.verification];
  const shown = sortByDate(entries);

  return (
    <>
      <SectionHeading kicker="Field record" title="Daily Internship Logbook" aside={<p className="max-w-sm text-sm text-mist">Start with a blank template. Add only activities, hours, and evidence that actually happened.</p>} />
      <BackupBar onPdf={startPrint} pdfDisabled={entries.length === 0} />
      <div className="gutter grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <div ref={formRef} className="scroll-mt-24 rounded-2xl bg-ink-2 p-5 ring-1 ring-white/10">
          <h3 className="font-display text-3xl text-bone">{editing ? 'Edit entry' : 'Entry template'}</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <DateField label="Date" value={draft.date} onChange={(v) => update('date', v)} />
            <div>
              <Field label="Start/end time or hours" value={draft.hours} onChange={(v) => update('hours', v)} placeholder="e.g. 3, 2.5 or 09:00-12:00" />
              {draft.hours.trim() !== '' && (
                <p className="mt-1 text-[11px] text-smoke">{hoursNow !== null ? `Counts as ${formatHours(hoursNow)} h.` : 'Not counted yet. Write hours like 3, 2.5 or 09:00-12:30.'}</p>
              )}
            </div>
          </div>
          <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.16em] text-smoke">
            Internship component
            <select
              value={draft.component}
              onChange={(e) => {
                const component: InternshipComponent = e.target.value === 'Non-Teaching/Institutional' ? 'Non-Teaching/Institutional' : 'Teaching';
                setDraft((current) => ({ ...current, component }));
              }}
              className="mt-1 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm font-normal text-bone"
            >
              <option>Teaching</option>
              <option>Non-Teaching/Institutional</option>
            </select>
          </label>
          <div className="mt-4 grid gap-4">
            <Field label="Tasks performed" value={draft.tasks} onChange={(v) => update('tasks', v)} multiline placeholder="Add only verified tasks." />
            <Field label="Skills or concepts applied" value={draft.concepts} onChange={(v) => update('concepts', v)} multiline placeholder="For example: language choice, multilingualism." />
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-smoke">
              Supervisor verification/status
              <select value={draft.verification} onChange={(e) => update('verification', e.target.value)} className="mt-1 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm font-normal text-bone">
                {verificationOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
              <span className="mt-1 block text-[11px] normal-case tracking-normal text-smoke">Choose "Signed by supervisor" only after your supervisor has really signed your printed logbook.</span>
            </label>
          </div>
          {formError && <p role="alert" className="mt-4 text-xs font-semibold text-crimson-2">{formError}</p>}
          <button type="button" onClick={save} className="mt-5 min-h-11 rounded-md bg-bone px-5 text-sm font-bold text-ink">{editing ? 'Update entry' : 'Save entry'}</button>
          {editing && <button type="button" onClick={clearForm} className="ml-2 min-h-11 rounded-md border border-white/20 px-5 text-sm font-semibold text-bone">Cancel</button>}
          <LocalNote failed={saveFailed} />
        </div>
        <div className="space-y-3">
          <HoursPanel entries={entries} />
          {entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 p-6 text-sm leading-relaxed text-mist">No daily entries yet. This is intentionally blank so you can record the internship accurately.</div>
          ) : (
            shown.map((entry) => {
              const counted = parseHours(entry.hours);
              return (
                <article key={entry.id} className="rounded-2xl bg-ink-2 p-5 ring-1 ring-white/10">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-crimson-2">{entry.date || 'Date not supplied'} · {entry.component}</p>
                    <div>
                      <button type="button" onClick={() => edit(entry)} className="mr-2 text-xs font-semibold text-bone underline">Edit</button>
                      <button type="button" onClick={() => remove(entry)} className="text-xs font-semibold text-crimson-2 underline">Delete</button>
                    </div>
                  </div>
                  <p className="mt-3 text-base leading-relaxed text-bone" dir="auto">{entry.tasks || 'Activity entry'}</p>
                  <p className="mt-3 text-xs text-smoke">{entry.hours ? `${entry.hours}${counted === null ? ' (not counted)' : ''}` : 'Hours not supplied'} · Skills: {entry.concepts || 'Not added'}</p>
                  <p className="mt-1 text-xs text-smoke">Verification: {entry.verification}</p>
                </article>
              );
            })
          )}
        </div>
      </div>
      {printing && <DailyPrintSheet entries={entries} />}
    </>
  );
}


export function ReflectiveLogbook() {
  const [entries, setEntries] = useState<ReflectionEntry[]>(() =>
    readList(REFLECTION_KEY, normalizeReflection)
  );
  const [draft, setDraft] = useState<Omit<ReflectionEntry, 'id'>>({
    ...emptyReflection,
  });
  const [editing, setEditing] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [saveFailed, setSaveFailed] = useState(false);
  const [printing, startPrint] = usePrintSheet();
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSaveFailed(!writeJson(REFLECTION_KEY, entries));
  }, [entries]);

  useEffect(() => {
    const reload = () =>
      setEntries(readList(REFLECTION_KEY, normalizeReflection));

    window.addEventListener(IMPORT_EVENT, reload);
    return () => window.removeEventListener(IMPORT_EVENT, reload);
  }, []);

  const update = (
    key: keyof Omit<ReflectionEntry, 'id'>,
    value: string
  ) => setDraft((current) => ({ ...current, [key]: value }));

  const clearForm = () => {
    setDraft({ ...emptyReflection });
    setEditing(null);
    setFormError('');
  };

  const save = () => {
    if (!draft.reflection.trim()) {
      setFormError('Write your reflection before saving.');
      return;
    }

    const entry: ReflectionEntry = {
      ...draft,
      id: editing ?? newId(),
    };

    setEntries((current) =>
      editing
        ? current.map((item) => (item.id === editing ? entry : item))
        : [...current, entry]
    );

    clearForm();
  };

  const edit = (entry: ReflectionEntry) => {
    const { id, ...rest } = entry;
    setDraft(rest);
    setEditing(id);
    setFormError('');
    formRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const remove = (entry: ReflectionEntry) => {
    if (
      !window.confirm(
        'Delete this reflection? This cannot be undone.\n\nTip: export a backup first if you are not sure.'
      )
    ) {
      return;
    }

    setEntries((current) =>
      current.filter((item) => item.id !== entry.id)
    );

    if (editing === entry.id) clearForm();
  };

  const shown = sortByDate(entries);

  return (
    <>
      <SectionHeading
        kicker="Theory-to-practice"
        title="Reflective Logbook"
        aside={
          <p className="max-w-sm text-sm text-mist">
            Record your actual internship experiences, observations,
            learning and reflections in your own words.
          </p>
        }
      />

      <BackupBar onPdf={startPrint} pdfDisabled={entries.length === 0} />

      <div className="gutter grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div
          ref={formRef}
          className="scroll-mt-24 rounded-2xl bg-ink-2 p-5 ring-1 ring-white/10"
        >
          <h3 className="font-display text-3xl text-bone">
            {editing ? 'Edit reflection' : 'New reflection'}
          </h3>

          <div className="mt-5 grid gap-4">
            <DateField
              label="Date"
              value={draft.date}
              onChange={(v) => update('date', v)}
            />

            <Field
              label="Day Number"
              value={draft.dayNumber}
              onChange={(v) => update('dayNumber', v)}
              placeholder="e.g. Day 1"
            />

            <Field
              label="Reflective Log"
              value={draft.reflection}
              onChange={(v) => update('reflection', v)}
              multiline
              placeholder="Write your complete reflection here. Describe what happened, what you observed, what you learned, and how it connects to your academic understanding."
            />
          </div>

          {formError && (
            <p
              role="alert"
              className="mt-4 text-xs font-semibold text-crimson-2"
            >
              {formError}
            </p>
          )}

          <button
            type="button"
            onClick={save}
            className="mt-5 min-h-11 rounded-md bg-bone px-5 text-sm font-bold text-ink"
          >
            {editing ? 'Update reflection' : 'Save reflection'}
          </button>

          {editing && (
            <button
              type="button"
              onClick={clearForm}
              className="ml-2 min-h-11 rounded-md border border-white/20 px-5 text-sm font-semibold text-bone"
            >
              Cancel
            </button>
          )}

          <LocalNote failed={saveFailed} />
        </div>

        <div className="space-y-3">
          {entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 p-6 text-sm leading-relaxed text-mist">
              No reflections yet. Add a reflection after an actual
              internship experience.
            </div>
          ) : (
            shown.map((entry) => (
              <article
                key={entry.id}
                className="rounded-2xl bg-ink-2 p-5 ring-1 ring-white/10"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    {entry.date && (
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-crimson-2">
                        {entry.date}
                      </p>
                    )}

                    <h3 className="mt-1 font-display text-2xl text-bone">
                      {entry.dayNumber || 'Reflection'}
                    </h3>
                  </div>

                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={() => edit(entry)}
                      className="mr-2 text-xs font-semibold text-bone underline"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => remove(entry)}
                      className="text-xs font-semibold text-crimson-2 underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p
                  className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-mist"
                  dir="auto"
                >
                  {entry.reflection}
                </p>
              </article>
            ))
          )}
        </div>
      </div>

      {printing && <ReflectionPrintSheet entries={entries} />}
    </>
  );
}


export function InternshipReport() {
  const [values, setValues] = useState<Record<string, string>>(() => readReport());
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    setSaveFailed(!writeJson(REPORT_KEY, values));
  }, [values]);

  useEffect(() => {
    const reload = () => setValues(readReport());
    window.addEventListener(IMPORT_EVENT, reload);
    return () => window.removeEventListener(IMPORT_EVENT, reload);
  }, []);

  return (
    <>
      <SectionHeading kicker="Document draft" title="Internship Report" aside={<p className="max-w-sm text-sm text-mist">A structured editable draft. This is not a completed report and contains no invented findings.</p>} />
      <BackupBar />
      <div className="gutter grid gap-4 lg:grid-cols-2">
        {reportFields.map((field) => <Field key={field} label={field} value={values[field] ?? ''} onChange={(value) => setValues((current) => ({ ...current, [field]: value }))} multiline placeholder="Draft this section after the relevant information is available." />)}
      </div>
      <div className="gutter"><LocalNote failed={saveFailed} /></div>
    </>
  );
}

function DocumentPlaceholder({ title, description }: { title: string; description: string }) {
  return <><SectionHeading kicker="Document record" title={title} aside={<p className="max-w-sm text-sm text-mist">Only authentic documents supplied by the university or supervisor will be shown here.</p>} /><div className="gutter"><div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-6 text-center"><div className="font-display text-6xl text-bone/20">MHB</div><h3 className="mt-4 font-display text-3xl text-bone">Document not provided</h3><p className="mt-3 max-w-xl text-sm leading-relaxed text-mist">{description}</p><p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-crimson-2">Placeholder · not an official document</p></div></div></>;
}

export function SupervisorFeedback() { return <DocumentPlaceholder title="Supervisor Feedback Form" description="The actual supervisor feedback form, comments, marks, signatures, and verification will appear here only after the real document is supplied." />; }
export function AcceptanceLetter() { return <DocumentPlaceholder title="Internship Acceptance Letter" description={`The official acceptance letter for ${profile.fullName}'s placement is not present in this workspace. Add the authentic letter before displaying it here.`} />; }

function InfoBlock({ title, children }: { title: string; children: ReactNode }) {
  return <article className="rounded-2xl bg-ink-2 p-5 ring-1 ring-white/10"><h3 className="font-display text-3xl text-bone">{title}</h3><div className="mt-3 text-sm leading-relaxed text-mist">{children}</div></article>;
}


export function EvidenceGallery() {
  return (
    <>
      <SectionHeading
        kicker="Internship Documentation"
        title="Evidence Gallery"
        aside={
          <p className="max-w-sm text-sm text-mist">
            Authentic photographs and supporting evidence from the teaching and
            non-teaching components of the internship.
          </p>
        }
      />

      <div className="gutter">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="font-display text-3xl text-bone">
            Evidence will appear here
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-mist">
            Only genuine records of the internship will be shown in this
            gallery. Photographs are added only with permission, and
            confidential government records and students' personal details
            are never displayed.
          </p>
          <p className="mt-4 text-sm text-smoke">
            No evidence has been added yet.
          </p>
        </div>
      </div>
    </>
  );
}
