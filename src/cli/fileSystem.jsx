/**
 * fileSystem.js — fake in-memory filesystem for ls/cd/cat/pwd.
 *
 * Structure mirrors a real Linux home directory.
 * "content" is what `cat` displays for a file.
 * Directories have "children" (array of node names).
 */

export const FS = {
  '/': {
    type: 'dir',
    children: ['home'],
  },
  '/home': {
    type: 'dir',
    children: ['kapil'],
  },
  '/home/kapil': {
    type: 'dir',
    children: ['about.txt', 'skills.txt', 'contact.txt', 'projects', 'resume.txt'],
  },
  '/home/kapil/about.txt': {
    type: 'file',
    content: `Name    : Kapil Thakur
Role    : MERN Stack Developer
Email   : thakurkapil2007@gmail.com
Phone   : +91 7831970301
Location: Parwanoo, Himachal Pradesh, India

I'm a full-stack CS Engineering student at Chitkara University.
Strong with MERN, DSA (C++/Java), and building real projects.
CGPA: 9.0+/10

Type 'about' for the full interactive version.`,
  },
  '/home/kapil/skills.txt': {
    type: 'file',
    content: `Languages  : C, C++, Java, Python, JavaScript (ES6+)
Frontend   : React.js, HTML5, CSS3, DOM, Responsive Design
Backend    : Node.js, Express.js, REST APIs
Databases  : MongoDB, Basic SQL
CS Core    : DSA, OOP, OS, Computer Networks, DBMS
Tools      : Git, GitHub, Linux, Postman, Docker, Kubernetes

Type 'skills' for the full interactive view.`,
  },
  '/home/kapil/contact.txt': {
    type: 'file',
    content: `Email   : thakurkapil2007@gmail.com
Phone   : +91 7831970301
GitHub  : https://github.com/kapilthakur01
LinkedIn: https://www.linkedin.com/in/kapilthakur1/

Type 'contact' to see clickable links.`,
  },
  '/home/kapil/resume.txt': {
    type: 'file',
    content: `KAPIL THAKUR — MERN STACK DEVELOPER
Resume available as PDF.

Run 'resume' to view it here.
Run 'resume --download' to download the PDF.`,
  },
  '/home/kapil/projects': {
    type: 'dir',
    children: ['quick-pull.txt', 'skillxchange.txt', 'perfectxams.txt'],
  },
  '/home/kapil/projects/quick-pull.txt': {
    type: 'file',
    content: `Quick Pull — Real-Time Peer-to-Peer Ride-Sharing System
Team : 4 members | Role: Lead Contributor
Stack: JavaScript, Node.js, Express.js, MongoDB, Socket.IO, OSRM, H3, Turf.js

- MERN ride-sharing platform with JWT auth and live tracking.
- Route-aware matching via OSRM, H3, and Socket.IO.

Run 'project quick-pull' for the full view.`,
  },
  '/home/kapil/projects/skillxchange.txt': {
    type: 'file',
    content: `SkillXchange — Mutual Mentoring Learning Platform
Team : 4 members | Role: Lead Contributor
Stack: Node.js, Express.js, MongoDB, JavaScript, Jitsi Meet API

- Full-stack skill exchange with auth and skill matching.
- Jitsi Meet integration for live mentoring sessions.

Run 'project skillxchange' for the full view.`,
  },
  '/home/kapil/projects/perfectxams.txt': {
    type: 'file',
    content: `PerfectXams — Blockchain-Based Secure Examination Platform
Team : 4 members | Role: Lead Contributor
Stack: React.js, Node.js, Express.js, MongoDB, Solidity, Hardhat, AES Encryption, JWT

- Blockchain-based secure examination platform with encrypted and time-locked exam papers.
- Blockchain notarization using Solidity and Hardhat, with AES encryption and SHA-256 integrity verification.
- JWT-based authentication and responsive dashboards for Exam Authorities and Institution Organizers.

Run 'project perfectxams' for the full view.`,
  },
};

// Starting directory for the session.
export const HOME_DIR = '/home/kapil';

/**
 * Resolves a path relative to cwd. Handles "..", ".", and absolute paths.
 * Returns the resolved absolute path string, or null if invalid.
 */
export function resolvePath(cwd, target) {
  if (!target || target === '~') return HOME_DIR;
  if (target === '/') return '/';

  // Replace leading ~ with home dir
  const expanded = target.startsWith('~/')
    ? HOME_DIR + target.slice(1)
    : target;

  // Build segments
  const base = expanded.startsWith('/') ? [] : cwd.split('/').filter(Boolean);
  const parts = expanded.startsWith('/') ? expanded.split('/').filter(Boolean) : expanded.split('/').filter(Boolean);

  for (const part of parts) {
    if (part === '..') {
      base.pop();
    } else if (part !== '.') {
      base.push(part);
    }
  }

  return '/' + base.join('/');
}

/**
 * List children of a directory path. Returns array of { name, type } or null.
 */
export function listDir(path) {
  const node = FS[path];
  if (!node || node.type !== 'dir') return null;
  return node.children.map((child) => {
    const childPath = path === '/' ? '/' + child : path + '/' + child;
    const childNode = FS[childPath];
    return { name: child, type: childNode ? childNode.type : 'unknown' };
  });
}

/**
 * Read a file. Returns content string or null.
 */
export function readFile(path) {
  const node = FS[path];
  if (!node || node.type !== 'file') return null;
  return node.content;
}

/**
 * Check if a path exists and what type it is. Returns 'file', 'dir', or null.
 */
export function statPath(path) {
  const node = FS[path];
  if (!node) return null;
  return node.type;
}

/**
 * Get all file names (not dirs) under a given directory (non-recursive).
 * Used for tab-autocomplete on cd/cat.
 */
export function getChildNames(cwd) {
  const node = FS[cwd];
  if (!node || node.type !== 'dir') return [];
  return node.children;
}
