/**
 * Single source for site-wide facts. `null` means "not provided yet" and renders a visible placeholder.
 * Never invent values here: personal details come from the owner.
 */
export const site = {
  name: 'Atiqur Rahman',
  first: 'Atiqur',
  last: 'Rahman',
  // Domain confirmed by the owner on 2026-10-09.
  url: import.meta.env.SITE ?? 'https://atiqur-rahman.me',
  // DRAFT positioning line derived from the public repositories. Owner to confirm or rewrite.
  // Role headline requested by the owner on 2026-10-10 (Java and Spring Boot backends, Angular web, Flutter mobile).
  role: 'Full-Stack Developer',
  tagline: 'I design and build reliable full-stack business applications with Java, Spring Boot, Angular and Flutter.',
  description:
    'Portfolio of Atiqur Rahman, a full-stack developer building business systems with Java, Spring Boot, Angular and Flutter.',
  github: 'https://github.com/atiqurrahmansojib',
  githubHandle: 'atiqurrahmansojib',
  email: 'atiqur.ruphysics@gmail.com' as string | null,
  linkedin: 'https://www.linkedin.com/in/atiqurrahmanphy' as string | null,
  // Owner-provided 2026-10-10.
  facebook: 'https://www.facebook.com/imarsojib' as string | null,
  instagram: 'https://www.instagram.com/imarsojib' as string | null,
  location: 'Dhaka, Bangladesh' as string | null,
};

export const nav = [
  { href: '#home', id: 'home', label: 'Home' },
  { href: '#projects', id: 'projects', label: 'Work' },
  { href: '#skills', id: 'skills', label: 'Skills' },
  { href: '#about', id: 'about', label: 'About' },
  { href: '#experience', id: 'experience', label: 'Training' },
  { href: '#contact', id: 'contact', label: 'Contact' },
];

/**
 * Technologies seen in the owner's repositories (verified 2026-10-09). `icon` is a simple-icons key.
 * `used` says where each was verified.
 */
export const skills = [
  { name: 'Java', icon: 'siOpenjdk', used: ['RMGFlow', 'Tanabana', 'IsDB-BISEW training'] },
  { name: 'Spring Boot', icon: 'siSpringboot', used: ['RMGFlow', 'Tanabana', 'IsDB-BISEW training'] },
  { name: 'Hibernate', icon: 'siHibernate', used: ['IsDB-BISEW training'] },
  { name: 'Oracle Database', icon: 'custom-db', used: ['IsDB-BISEW training'] },
  { name: 'PostgreSQL', icon: 'siPostgresql', used: ['RMGFlow', 'Tanabana'] },
  { name: 'Flyway', icon: 'siFlyway', used: ['RMGFlow'] },
  { name: 'Flutter', icon: 'siFlutter', used: ['RMGFlow', 'IsDB-BISEW training'] },
  { name: 'Android', icon: 'siAndroid', used: ['IsDB-BISEW training'] },
  { name: 'Dart', icon: 'siDart', used: ['RMGFlow'] },
  { name: 'Angular', icon: 'siAngular', used: ['Tanabana', 'IsDB-BISEW training'] },
  { name: 'Bootstrap', icon: 'siBootstrap', used: ['IsDB-BISEW training'] },
  { name: 'UML', icon: 'siUml', used: ['IsDB-BISEW training'] },
  { name: 'XML', icon: 'siXml', used: ['IsDB-BISEW training'] },
  { name: 'TypeScript', icon: 'siTypescript', used: ['Tanabana'] },
  { name: 'Docker', icon: 'siDocker', used: ['Tanabana'] },
  { name: 'GitHub Actions', icon: 'siGithubactions', used: ['Tanabana'] },
  { name: 'Git', icon: 'siGit', used: ['All projects'] },
];

/**
 * Professional IT training supported by the IsDB-BISEW IT Scholarship Programme.
 * Course details verified against the official course page; completion confirmed by the owner (2026-10-09).
 * Completion date, certificate number, grades and any other qualifications were NOT provided: do not add or invent them.
 */
export const training = {
  programme: 'IsDB-BISEW IT Scholarship Programme',
  course: 'Web and Mobile App Development using Spring Boot, Android & Flutter',
  track: 'J2EE/JEE track',
  url: 'https://apply.idb-bisew.info/Home/CourseDeatils/1#jee',
  /** The official course modules, in order (official course page, checked 2026-10-09). Course content, not skill levels. */
  modules: [
    'Web Publishing & Bootstrap',
    'Database Development using Oracle 19c',
    'Object Oriented Programming using Java',
    'XML & O-O System Analysis and Design using UML',
    'Server-side Programming using Servlet, JSP, JSF, Hibernate, Angular',
    'Spring, Spring Boot & JasperReports',
    'Mobile Application using Android & Flutter',
  ],
  duration: '8.5 months',
  covers: ['Bootstrap', 'Oracle 19c', 'Java', 'XML', 'UML', 'Servlet', 'JSP', 'JSF', 'Hibernate', 'Angular', 'Spring', 'Spring Boot', 'JasperReports', 'Android', 'Flutter'],
  completed: true,
};

/** Owner-confirmed 2026-10-10. */
export const education = [
  { degree: 'M.Sc. in Physics', year: '2023', school: 'University of Rajshahi' },
  { degree: 'B.Sc. in Physics', year: '2022', school: 'University of Rajshahi' },
] as const;

/** Owner-confirmed 2026-10-10. */
export const languages = 'Bengali (native), English (professional)';
