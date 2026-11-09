 
/** Central portfolio data for Mujtaba Hussain Bhatti. */

export type Palette = {
  from: string;
  via: string;
  to: string;
  accent: string;
};
export const profile = {
  fullName: 'Mujtaba Hussain Bhatti',
  displayName: 'Mujtaba Hussain Bhatti',
  firstName: 'MUJTABA',
  hasPortrait: true,
  portrait: {
  src: `${import.meta.env.BASE_URL}assets/portrait-720.webp`,
  srcSet: `${import.meta.env.BASE_URL}assets/portrait-420.webp 420w, ${import.meta.env.BASE_URL}assets/portrait-720.webp 720w, ${import.meta.env.BASE_URL}assets/portrait-1100.webp 1100w`,
  alt: 'Mujtaba Hussain Bhatti',
} as { src: string; alt: string; srcSet?: string },
  seriesTag: 'APPLIED LINGUISTICS PORTFOLIO',
  originalLabel: 'APPLIED LINGUISTICS INTERNSHIP PORTFOLIO',
  role: 'English Applied Linguistics Undergraduate',
  tagline: ['Applied Linguistics', 'Sociolinguistics', 'Language Teaching'],
  intro: 'I am Mujtaba Hussain Bhatti, an undergraduate student pursuing a bachelor\'s degree in English Applied Linguistics at the University of Sindh, Jamshoro. My keen interests include sociolinguistics, multilingualism, and language teaching, particularly understanding the relationship between language, society, and education. I have always been fascinated by how language connects with power, identity, gender norms, psychology, and other aspects of human life.',
  location: 'Hyderabad, Sindh, Pakistan',
  email: '2k24-al-84@usindh.edu.pk',
  phone: '0312 7030065',
  phoneLink: '+923127030065',
  links: {
  linkedin: '',
  github: 'https://github.com/mujtaba2k24',
},

  interests: ['Sociolinguistics', 'Multilingualism', 'Language Teaching', 'Language and Society', 'Language and Power', 'Identity', 'Gender', 'Psychology'],
};

export const education = [
  {
    school: 'University of Sindh',
    place: 'Jamshoro, Sindh, Pakistan',
    degree: 'BS English Applied Linguistics — Institute of English Language & Literature (IELL)',
    period: 'Current student · 6th semester',
    score: 'Reported CGPA 3.36 through second-year marksheet',
  },
  {
    school: 'Aga Khan University Examination Board',
    place: 'Pakistan',
    degree: 'Intermediate',
    period: 'Completed',
    score: '87.4% · Reported A1',
  },
  {
    school: 'Matriculation',
    place: 'Pakistan',
    degree: 'Secondary education',
    period: 'Completed',
    score: 'B grade',
  },
];

export const experience = [
  {
    company: 'Revenue Administration, Hyderabad Rural',
    role: 'Applied Linguistics in Public Administration and Education',
    place: 'Hyderabad Rural, Sindh, Pakistan',
    period: 'COMPLETED · 90 hours logged (planned 60–80 hours)',
    points: [
      'Subtitle: An Applied Linguistics Internship with the Revenue Administration of Hyderabad Rural.',
      'Placement: Revenue Administration, Hyderabad Rural. Status: COMPLETED.',
      'Supervised by Gohar Masroor, Assistant Commissioner, and Junaid Qazi, Mukhtiarkar (UT). University coordinator: Madam Bakhtawar Jaleel.',
      'Components: Teaching and Non-Teaching/Institutional, with a focus on applied linguistics, sociolinguistics, multilingualism, language choice, professional communication, and language teaching.',
    ],
  },
];

export type Metric = { value: string; label: string };

export type Project = {
  id: string;
  title: string;
  year: string;
  genre: string;
  logline: string;
  stack: string[];
  build: string[];
  features: string[];
  metrics: Metric[];
  /** Omit when the repository isn't public — the GitHub button is hidden instead of linking to a 404. */
  github?: string;
  palette: Palette;
  motif: 'shield' | 'flow' | 'tenants';
};

export const projects: Project[] = [
  {
    id: 'applied-linguistics-internship',
    title: 'Applied Linguistics Internship',
    year: '2026',
    genre: 'Applied Linguistics • Public Administration • Education',
    logline: 'A completed placement connecting applied linguistics with public administration and education.',
    stack: ['Sociolinguistics', 'Multilingualism', 'Professional Communication'],
    build: ['Teaching and institutional components completed with the Revenue Administration of Hyderabad Rural.', 'Activities are documented in the Daily and Reflective Logbooks.'],
    features: ['Teaching component', 'Non-teaching / institutional component', 'Language choice and multilingual communication', 'Language teaching and professional communication'],
    metrics: [{ value: 'COMPLETED', label: 'current status' }, { value: '90h', label: 'hours logged' }, { value: '2', label: 'components' }],
    palette: { from: '#2a0610', via: '#7a0f24', to: '#0b0710', accent: '#ff3d5a' },
    motif: 'shield',
  },
  {
    id: 'plantation-drive',
    title: 'IELL Plantation Drive',
    year: '2026',
    genre: 'Student Leadership • Coordination',
    logline: 'A university plantation drive organized through the Institute of English Language & Literature.',
    stack: ['Organization', 'Coordination', 'Student Leadership'],
    build: ['Served as Head Organizer for the IELL Plantation Drive in 2026.'],
    features: ['Head Organizer role', 'IELL student initiative', 'Plantation drive coordination'],
    metrics: [{ value: '2026', label: 'documented activity' }, { value: 'HEAD', label: 'organizer role' }],
    palette: { from: '#1a0d02', via: '#8a4a07', to: '#0a0806', accent: '#ffb547' },
    motif: 'flow',
  },
  {
    id: 'alumni-dinner',
    title: 'IELL Alumni Dinner',
    year: '2026',
    genre: 'Event Coordination • Administration',
    logline: 'A documented student coordination activity for the February 2026 IELL Alumni Dinner.',
    stack: ['Registration', 'Finances', 'Coordination'],
    build: ['Helped manage registration, finances, and coordination at the February 2026 Alumni Dinner.'],
    features: ['Registration management', 'Financial coordination', 'Event coordination'],
    metrics: [{ value: 'FEB', label: 'documented month' }, { value: '2026', label: 'documented year' }],
    palette: { from: '#04121f', via: '#0f4c6e', to: '#05080d', accent: '#4cc9ff' },
    motif: 'tenants',
  },
];

export type Achievement = {
  id: string;
  title: string;
  org: string;
  detail: string;
  laurel: string;
  link?: string;
};

export const achievements: Achievement[] = [
  {
    id: 'picture-interpretation',
    title: 'Second Position',
    org: 'Talent Hunt Program',
    detail: 'Second position in Picture Interpretation.',
    laurel: 'Talent Hunt',
  },
  {
    id: 'plantation-head-organizer',
    title: 'Head Organizer',
    org: 'IELL Plantation Drive',
    detail: 'Head Organizer of the IELL Plantation Drive in 2026.',
    laurel: 'Student Leadership',
  },
  {
    id: 'alumni-dinner-coordination',
    title: 'Event Coordinator',
    org: 'IELL Alumni Dinner',
    detail: 'Helped manage registration, finances, and coordination at the February 2026 Alumni Dinner.',
    laurel: 'Student Service',
  },
   {
    id: 'englican-sports-gala-volunteer',
    title: 'Head Volunteer',
    org: 'Englican Sports Gala 2026',
    detail: 'Assigned task to volunteers, Helped organizer to manage the eevnt at the Englican Sports Gala 2026.',
    laurel: 'Student Leadership',
  },
];

export type Certification = { issuer: string; name: string; link: string };

export const certifications: Certification[] = [];

export type Skill = { name: string; mono: string; note?: string };
export type SkillCategory = { id: string; title: string; subtitle: string; skills: Skill[] };

export const skillCategories: SkillCategory[] = [
  {
    id: 'linguistics',
    title: 'Linguistics',
    subtitle: 'The academic field of focus',
    skills: [
      { name: 'Applied Linguistics', mono: 'AL', note: 'Primary' },
      { name: 'Sociolinguistics', mono: 'SL' },
      { name: 'Multilingualism', mono: 'Mu' },
      { name: 'Language Teaching', mono: 'LT' },
    ],
  },
  {
    id: 'language-society',
    title: 'Language & Society',
    subtitle: 'Questions that guide the work',
    skills: [
      { name: 'Language and Society', mono: 'LS' },
      { name: 'Language and Power', mono: 'LP' },
      { name: 'Identity', mono: 'Id' },
      { name: 'Gender', mono: 'Ge' },
    ],
  },
  {
    id: 'communication',
    title: 'Communication',
    subtitle: 'Academic and professional practice',
    skills: [
      { name: 'Professional Communication', mono: 'PC' },
      { name: 'Institutional Communication', mono: 'IC' },
      { name: 'Language Choice', mono: 'LC' },
      { name: 'Classroom Communication', mono: 'CC' },
    ],
  },
  {
    id: 'practice',
    title: 'Academic Practice',
    subtitle: 'Applied work COMPLETED',
    skills: [
      { name: 'Language Teaching', mono: 'LT' },
      { name: 'Lesson Planning', mono: 'LP' },
      { name: 'Classroom Communication', mono: 'CC' },
      { name: 'Public Administration', mono: 'PA' },
    ],
  },
  {
    id: 'interests',
    title: 'Interests',
    subtitle: 'Questions for future study',
    skills: [
      { name: 'Psychology', mono: 'Ps' },
      { name: 'Language and Gender', mono: 'LG' },
      { name: 'Language and Identity', mono: 'LI' },
    ],
  },
];

/**
 * Factual cross-references shown when a skill card is hovered/tapped:
 * where the skill appears in the projects, certifications or achievements on the resume.
 */
export const skillEvidence: Record<string, string[]> = {
  'Applied Linguistics': ['University of Sindh · IELL', 'Internship focus'],
  Sociolinguistics: ['Academic interest', 'Internship focus'],
  Multilingualism: ['Academic interest', 'Internship focus'],
  'Language Teaching': ['Academic interest', 'Internship teaching component'],
  'Language and Society': ['Academic interest'],
  'Language and Power': ['Academic interest'],
  Identity: ['Academic interest'],
  Gender: ['Academic interest'],
  'Professional Communication': ['Internship focus'],
  'Institutional Communication': ['Internship focus'],
  'Language Choice': ['Internship focus'],
  'Classroom Communication': ['Internship focus'],
  'Lesson Planning': ['Internship teaching component'],
  'Public Administration': ['Revenue Administration placement (COMPLETED)'],
  Psychology: ['Academic interest'],
  'Language and Gender': ['Academic interest'],
  'Language and Identity': ['Academic interest'],
};

const crimson: Palette = { from: '#24060b', via: '#6e0d1d', to: '#09070a', accent: '#ff3d5a' };
const amber: Palette = { from: '#1c1003', via: '#6b3c06', to: '#0a0806', accent: '#ffb547' };
const ocean: Palette = { from: '#04121f', via: '#0f4c6e', to: '#05080d', accent: '#4cc9ff' };
const violet: Palette = { from: '#120822', via: '#3d1a6e', to: '#07060c', accent: '#b98bff' };
const jade: Palette = { from: '#03150f', via: '#0d5a40', to: '#050a08', accent: '#46e3a8' };

export const internshipStages = [
  { title: 'Placement context', detail: 'Revenue Administration, Hyderabad Rural · Applied Linguistics in Public Administration and Education', status: 'COMPLETED', palette: violet },
  { title: 'Teaching component', detail: 'Language teaching, lesson planning, teaching methods, and classroom communication.', status: 'Completed', palette: amber },
  { title: 'Non-Teaching / Institutional component', detail: 'Attention to language use, language choice, multilingualism, and professional communication.', status: 'Completed', palette: ocean },
  { title: 'Theory-to-practice reflection', detail: 'The logbooks connect field observations with Applied Linguistics concepts.', status: 'Documented in logbooks', palette: jade },
];

export type TopPick = { label: string; title: string; detail: string; palette: Palette };

export const topPicks: TopPick[] = [
  { label: 'Academic focus', title: 'Applied Linguistics', detail: 'BS undergraduate study at University of Sindh', palette: violet },
  { label: 'Research interest', title: 'Sociolinguistics', detail: 'Language, society, and education', palette: crimson },
  { label: 'Current semester', title: '6th Semester', detail: 'Institute of English Language & Literature', palette: ocean },
  { label: 'Reported record', title: 'CGPA 3.36', detail: 'Through second-year marksheet · not final CGPA', palette: amber },
  { label: 'Internship status', title: 'COMPLETED', detail: 'Revenue Administration, Hyderabad Rural', palette: jade },
  { label: 'Hours logged', title: '90 Hours', detail: 'Teaching and institutional components', palette: amber },
  { label: 'Student leadership', title: 'Head Organizer', detail: 'IELL Plantation Drive · 2026', palette: crimson },
  { label: 'Talent Hunt', title: 'Second Position', detail: 'Picture Interpretation', palette: ocean },
  { label: 'Student service', title: 'Alumni Dinner', detail: 'Registration, finances, and coordination', palette: jade },
  { label: 'Current interests', title: 'Language & Identity', detail: 'Power, gender, psychology, and society', palette: violet },
];

/** Slides for the "▶ Play Intro" cinematic sequence. */
export type IntroSlide = { kicker: string; title: string; lines: string[]; chips?: string[] };

export const introSlides: IntroSlide[] = [
  {
    kicker: 'Education',
    title: 'BS English Applied Linguistics',
    lines: ['University of Sindh, Jamshoro · IELL', 'Currently in the 6th semester'],
    chips: ['Reported CGPA 3.36'],
  },
  {
    kicker: 'Skills',
    title: 'Language and society.',
    lines: ['Sociolinguistics · Multilingualism · Language teaching', 'Language, power, identity, gender, and psychology'],
    chips: ['Sociolinguistics', 'Multilingualism', 'Language Teaching'],
  },
  {
    kicker: 'Training',
    title: 'The Internship Arc',
    lines: ['Applied Linguistics in Public Administration and Education', 'Revenue Administration, Hyderabad Rural · COMPLETED', 'Teaching · Institutional communication · Language choice'],
  },
  {
    kicker: 'Projects',
    title: 'Three Activities',
    lines: ['IELL Plantation Drive — Head Organizer · 2026', 'IELL Alumni Dinner — registration, finances, coordination', 'Talent Hunt — second position in Picture Interpretation'],
  },
  {
    kicker: 'Achievements',
    title: 'Top Moments',
    lines: ['Second position — Talent Hunt Picture Interpretation', 'Head Organizer — IELL Plantation Drive', 'Event coordination — IELL Alumni Dinner'],
  },
  {
    kicker: 'Credentials',
    title: 'CV available as PDF',
    lines: ['Certification details will be added when verified.', 'No unsupported credentials are displayed.'],
  },
  {
    kicker: 'Current mission',
    title: 'Now exploring',
    lines: ['Sociolinguistics · Multilingualism · Language teaching', 'Language and society · Power · Identity · Gender · Psychology'],
  },
];

export type ProfileId = 'mujtaba' | 'recruiter' | 'developer' | 'creative';
export type SectionId = 'about' | 'aims' | 'journey' | 'logbook' | 'reflection' | 'evidence' | 'report' | 'feedback' | 'acceptance' | 'originals' | 'picks' | 'skills' | 'moments' | 'story';

export const viewerProfiles: {
  id: ProfileId;
  name: string;
  blurb: string;
  color: string;
  order: SectionId[];
}[] = [
  {
    id: 'mujtaba',
    name: 'Mujtaba',
    blurb: 'The complete internship portfolio',
    color: '#e5132b',
    order: ['about', 'aims', 'journey', 'acceptance', 'logbook', 'reflection', 'evidence', 'feedback', 'report', 'originals', 'picks', 'skills', 'moments', 'story'],
  },
  {
    id: 'recruiter',
    name: 'Recruiter',
    blurb: 'Overview, report documents & evidence',
    color: '#4cc9ff',
    order: ['about', 'aims', 'report', 'feedback', 'acceptance', 'logbook', 'reflection', 'evidence', 'journey', 'moments', 'skills', 'originals', 'picks', 'story'],
  },
  {
    id: 'developer',
    name: 'Developer',
    blurb: 'Internship records, competencies & activities first',
    color: '#46e3a8',
    order: ['journey', 'logbook', 'reflection', 'evidence', 'skills', 'originals', 'moments', 'about', 'aims', 'report', 'feedback', 'acceptance', 'picks', 'story'],
  },
  {
    id: 'creative',
    name: 'Creative',
    blurb: 'Themes, learning highlights & reflection',
    color: '#ffb547',
    order: ['picks', 'about', 'journey', 'aims', 'reflection', 'evidence', 'moments', 'skills', 'originals', 'report', 'feedback', 'acceptance', 'logbook', 'story'],
  },
];

export const sectionMeta: Record<SectionId, { nav: string; card: string; meta: string; palette: Palette }> = {
  about: { nav: 'About the Intern', card: 'About the Intern', meta: 'Profile • education • context', palette: violet },
  aims: { nav: 'Aims & Objectives', card: 'Internship Aims', meta: 'Purpose • objectives • expected outcomes', palette: amber },
  journey: { nav: 'Internship Placement', card: 'Internship Placement', meta: `${internshipStages.length} Placement stages`, palette: amber },
  logbook: { nav: 'Daily Logbook', card: 'Daily Logbook', meta: 'Read-only activity record', palette: ocean },
  reflection: { nav: 'Reflective Logbook', card: 'Reflective Logbook', meta: 'Experience • analysis • action', palette: jade },
  evidence: { nav: 'Evidence Gallery', card: 'Evidence Gallery', meta: 'Internship photographs and supporting evidence', palette: violet },
  report: { nav: 'Internship Report', card: 'Internship Report', meta: 'Final report to be added', palette: crimson },
  feedback: { nav: 'Supervisor Feedback', card: 'Supervisor Feedback', meta: 'Placeholder until supplied', palette: violet },
  acceptance: { nav: 'Acceptance Letter', card: 'Acceptance Letter', meta: 'Official placement letter • PDF', palette: amber },
  originals: { nav: 'Academic & Internship Work', card: 'Academic Work', meta: `${projects.length} documented activities`, palette: crimson },
  picks: { nav: 'Key Learning Highlights', card: 'Learning Highlights', meta: 'Themes and records', palette: jade },
  skills: { nav: 'Applied Linguistics Competencies', card: 'Competencies', meta: `${skillCategories.length} areas of focus`, palette: ocean },
  moments: { nav: 'Academic Activities', card: 'Academic Activities', meta: `${achievements.length} documented activities`, palette: crimson },
  story: { nav: 'CV Status', card: 'CV Status', meta: 'CV available as PDF', palette: violet },
};
