import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { education, experience, internshipStages, profile } from '../data/portfolio';
import { EASE, SectionHeading } from './fx';
import {
  PLACEMENT_PEOPLE,
  PLANNED_HOURS,
  formatHours,
  hoursSummary,
  normalizeDaily,
  normalizeReflection,
  parseHours,
  sortByDate,
  type DailyEntry,
  type ReflectionEntry,
} from './logbookTools';
   import logbookData from '../data/logbook-data.json';

const secondaryButton = 'min-h-11 rounded-md border border-white/20 px-4 text-sm font-semibold text-bone transition hover:border-bone disabled:cursor-not-allowed disabled:opacity-40';
   const PUBLIC_DAILY: DailyEntry[] = (logbookData.dailyLogbook as unknown[]).map(normalizeDaily).filter((e): e is DailyEntry => e !== null);
   const PUBLIC_REFLECTIONS: ReflectionEntry[] = (logbookData.reflectiveLogbook as unknown[]).map(normalizeReflection).filter((e): e is ReflectionEntry => e !== null);

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


// ---------- sections ----------

export function InternshipAims() {
  return (
    <>
      <SectionHeading kicker="Planning document" title="Internship Aims and Objectives" aside={<p className="max-w-sm text-sm text-mist">Purpose and expected learning outcomes for the internship.</p>} />
      <div className="gutter grid gap-4 lg:grid-cols-2">
        <InfoBlock title="Internship purpose">To connect English Applied Linguistics with teaching, multilingual communication, and language use in public administration and education.</InfoBlock>
        <InfoBlock title="General aim">To observe and apply relevant Applied Linguistics concepts in a supervised institutional placement.</InfoBlock>
        <InfoBlock title="Specific objectives"><ol className="list-decimal space-y-2 pl-5"><li>Observe language use, language choice, and multilingual communication.</li><li>Relate language teaching principles to classroom and professional communication.</li><li>Develop a theory-to-practice reflection habit through documented internship work.</li><li>Maintain accurate records of activities, observations, and verification.</li></ol></InfoBlock>
        <InfoBlock title="Expected learning outcomes"><ol className="list-decimal space-y-2 pl-5"><li>Clearer understanding of institutional and professional communication.</li><li>Improved ability to connect sociolinguistics with observed practice.</li><li>More careful reflection on multilingualism and language teaching.</li><li>A structured internship report supported by authentic records.</li></ol></InfoBlock>
      </div>
    </>
  );
}

export function InternshipJourney() {
  return (
    <>
      <SectionHeading kicker="Placement overview" title="Internship Placement" aside={<p className="max-w-sm text-sm text-mist">A timeline of the completed placement stages.</p>} />
      <div className="gutter grid gap-4 lg:grid-cols-4">
        {internshipStages.map((stage, index) => <motion.article key={stage.title} className="rounded-2xl bg-ink-2 p-5 ring-1 ring-white/10" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08, duration: 0.6, ease: EASE }}><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-crimson-2">0{index + 1} · {stage.status}</p><h3 className="mt-5 font-display text-3xl leading-none text-bone">{stage.title}</h3><p className="mt-3 text-sm leading-relaxed text-mist">{stage.detail}</p></motion.article>)}
      </div>
      <div className="gutter mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-mist"><strong className="text-bone">Placement:</strong> {experience[0].company}. <strong className="text-bone">Supervisor:</strong> {PLACEMENT_PEOPLE.supervisor}. <strong className="text-bone">Co-supervisor:</strong> {PLACEMENT_PEOPLE.coSupervisor}. <strong className="text-bone">Coordinator:</strong> {PLACEMENT_PEOPLE.coordinator}. <strong className="text-bone">Status:</strong> COMPLETED. Planned duration: {PLANNED_HOURS.min}-{PLANNED_HOURS.max} hours.</div>
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
  const [printing, startPrint] = usePrintSheet();
  const shown = sortByDate(PUBLIC_DAILY);

  return (
    <>
      <SectionHeading kicker="Field record" title="Daily Internship Logbook" aside={<p className="max-w-sm text-sm text-mist">A read-only record of the internship activities, hours and supervisor verification status.</p>} />
      <div className="gutter mb-5">
        <button type="button" onClick={startPrint} className={secondaryButton}>Download PDF</button>
        <p className="mt-3 text-xs leading-relaxed text-smoke">For the PDF, choose "Save as PDF" as the printer in the window that opens, and turn off "Headers and footers".</p>
      </div>
      <div className="gutter space-y-3">
        <HoursPanel entries={PUBLIC_DAILY} />
        {shown.map((entry) => {
          const counted = parseHours(entry.hours);
          return (
            <article key={entry.id} className="rounded-2xl bg-ink-2 p-5 ring-1 ring-white/10">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-crimson-2">{entry.date || 'Date not supplied'} · {entry.component}</p>
              <p className="mt-3 text-base leading-relaxed text-bone" dir="auto">{entry.tasks || 'Activity entry'}</p>
              <p className="mt-3 text-xs text-smoke">{entry.hours ? `${entry.hours}${counted === null ? ' (not counted)' : ''}` : 'Hours not supplied'} · Skills: {entry.concepts || 'Not added'}</p>
              <p className="mt-1 text-xs text-smoke">Verification: {entry.verification}</p>
            </article>
          );
        })}
      </div>
      {printing && <DailyPrintSheet entries={PUBLIC_DAILY} />}
    </>
  );
}

export function ReflectiveLogbook() {
  const [printing, startPrint] = usePrintSheet();
  const shown = sortByDate(PUBLIC_REFLECTIONS);

  return (
    <>
      <SectionHeading
        kicker="Theory-to-practice"
        title="Reflective Logbook"
        aside={<p className="max-w-sm text-sm text-mist">A read-only record of the reflections written during the internship, connecting daily experience with Applied Linguistics concepts.</p>}
      />
      <div className="gutter mb-5">
        <button type="button" onClick={startPrint} className={secondaryButton}>Download PDF</button>
        <p className="mt-3 text-xs leading-relaxed text-smoke">For the PDF, choose "Save as PDF" as the printer in the window that opens, and turn off "Headers and footers".</p>
      </div>
      <div className="gutter space-y-3">
        {shown.map((entry) => (
          <article key={entry.id} className="rounded-2xl bg-ink-2 p-5 ring-1 ring-white/10">
            {entry.date && <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-crimson-2">{entry.date}</p>}
            <h3 className="mt-1 font-display text-2xl text-bone">{entry.dayNumber || 'Reflection'}</h3>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-mist" dir="auto">{entry.reflection}</p>
          </article>
        ))}
      </div>
      {printing && <ReflectionPrintSheet entries={PUBLIC_REFLECTIONS} />}
    </>
  );
}

export function InternshipReport() { return <DocumentPlaceholder title="Internship Report" description="The final internship report will appear here once it is completed and ready to be shared." />; }
function DocumentPlaceholder({ title, description }: { title: string; description: string }) {
  return <><SectionHeading kicker="Document record" title={title} aside={<p className="max-w-sm text-sm text-mist">Only authentic documents supplied by the university or supervisor will be shown here.</p>} /><div className="gutter"><div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-6 text-center"><div className="font-display text-6xl text-bone/20">MHB</div><h3 className="mt-4 font-display text-3xl text-bone">Document not provided</h3><p className="mt-3 max-w-xl text-sm leading-relaxed text-mist">{description}</p><p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-crimson-2">Placeholder · not an official document</p></div></div></>;
}

export function SupervisorFeedback() { return <DocumentPlaceholder title="Supervisor Feedback Form" description="The actual supervisor feedback form, comments, marks, signatures, and verification will appear here only after the real document is supplied." />; }
export function AcceptanceLetter() {
  const pdf = `${import.meta.env.BASE_URL}documents/acceptance-letter.pdf`;
  return (
    <>
      <SectionHeading
        kicker="Document record"
        title="Internship Acceptance Letter"
        aside={<p className="max-w-sm text-sm text-mist">The official acceptance letter for the placement with the Revenue Administration of Hyderabad Rural.</p>}
      />
      <div className="gutter">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <p className="max-w-2xl text-sm leading-relaxed text-mist sm:text-base">
            Open the letter in a new tab, or download a copy.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-11 rounded-md bg-bone px-5 py-3 text-sm font-bold text-ink"
            >
              Open PDF
            </a>
            <a
              href={pdf}
              download="acceptance-letter.pdf"
              className="min-h-11 rounded-md border border-white/20 px-5 py-3 text-sm font-semibold text-bone transition hover:border-bone"
            >
              Download PDF
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

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
