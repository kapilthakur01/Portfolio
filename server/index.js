import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { PortfolioData, Message } from './models.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ── MongoDB Connection ────────────────────────────────────────────────────
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    await seedInitialData();
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
}

// ── Seed initial portfolio data if the collection is empty ───────────────
async function seedInitialData() {
  const existing = await PortfolioData.findById('portfolio_v1');
  if (existing) {
    console.log('📦 Portfolio data already seeded.');
    return;
  }

  const initialData = {
    _id: 'portfolio_v1',
    profile: {
      _id: 'kapil_001',
      name: 'Kapil Thakur',
      role: 'MERN Stack Developer',
      tagline: 'Full-stack CS Engineering student skilled in the MERN stack, DSA (C++/Java), OOP, and core CS fundamentals, with hands-on experience to build full-stack and ML-integrated projects.',
      bio: 'Computer Science Engineering student at Chitkara University (CGPA 9.0+). I build full-stack web platforms and Android apps, with a focus on real-time networking and data structures.',
      phone: '+91 7831970301',
      email: 'thakurkapil2007@gmail.com',
      location: 'Parwanoo, Himachal Pradesh, India',
      photo: '/img/Me.jpeg',
      resume_pdf: '/img/Resume.pdf',
      links: {
        github: 'https://github.com/kapilthakur01',
        linkedin: 'https://www.linkedin.com/in/kapilthakur1/',
      },
    },
    socials: [
      { _id: 'social_github',   label: 'GitHub',   url: 'https://github.com/kapilthakur01',                                      icon: 'Github'   },
      { _id: 'social_linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/kapilthakur1/',                              icon: 'Linkedin' },
      { _id: 'social_email',    label: 'Gmail',    url: 'https://mail.google.com/mail/?view=cm&fs=1&to=thakurkapil2007@gmail.com', icon: 'Mail'     },
      { _id: 'social_leetcode', label: 'LeetCode', url: 'https://leetcode.com/u/EJtucT1f8w/',                                     icon: 'Code2'    },
    ],
    gui: {
      wallpaper: 'gradient',
      welcomeText: 'Welcome. Feel free to open apps, check out my recent projects, or run commands from the dock and desktop widgets.',
      menuBarName: 'Kapil Thakur',
    },
    widgets: {
      weather: {
        location: 'Parwanoo',
        temperature: '18°', condition: 'Partly Cloudy', high: '22°', low: '11°',
        hourly: [
          { time: '10 AM', temp: '18°', icon: 'CloudSun' },
          { time: '11 AM', temp: '19°', icon: 'Sun'      },
          { time: '12 PM', temp: '21°', icon: 'Sun'      },
          { time: '1 PM',  temp: '22°', icon: 'CloudSun' },
          { time: '2 PM',  temp: '20°', icon: 'CloudRain'},
        ],
      },
      dsaFocus: {
        badge: 'DSA FOCUS', stat: '600+', label: 'LeetCode Solved',
        sub: 'Arrays · Trees · Graphs', url: 'https://leetcode.com/u/EJtucT1f8w/',
      },
      status: {
        badge: 'STATUS', headline: 'Open to Roles',
        label: 'Full-stack / MERN', sub: 'Chitkara · CGPA 9.0+', appTarget: 'contact',
      },
    },
    skills: [
      { _id: 'skill_001', category: 'Languages',      items: ['C', 'C++', 'Java', 'Python', 'JavaScript (ES6+)'] },
      { _id: 'skill_002', category: 'Frontend',       items: ['React.js', 'HTML5', 'CSS3', 'DOM Manipulation', 'Responsive Web Design'] },
      { _id: 'skill_003', category: 'Backend',        items: ['Node.js', 'Express.js', 'REST API Design & Integration'] },
      { _id: 'skill_004', category: 'Databases',      items: ['MongoDB', 'Basic SQL'] },
      { _id: 'skill_005', category: 'CS Fundamentals', items: ['Data Structures & Algorithms', 'Object-Oriented Programming', 'Operating Systems', 'Computer Networks', 'DBMS'] },
      { _id: 'skill_006', category: 'Tools & Platforms', items: ['Git', 'GitHub', 'Linux (Basic)', 'Postman', 'Domain & Hosting', 'Docker', 'Kubernetes (Basic)'] },
    ],
    projects: [
      {
        _id: 'proj_001', slug: 'quick-pull', name: 'Quick Pull',
        subtitle: 'Real-Time Peer-to-Peer Ride-Sharing System',
        team: 'Team of 4', role: 'Lead Contributor',
        stack: ['JavaScript', 'Node.js', 'Express.js', 'MongoDB', 'Socket.IO', 'OSRM', 'H3', 'Turf.js'],
        highlights: [
          'MERN-based ride-sharing platform with JWT authentication and live ride tracking.',
          'Route-aware matching and real-time ride updates via OSRM, H3, and Socket.IO.',
        ],
        github: 'https://github.com/kapilthakur01',
        live: null,
      },
      {
        _id: 'proj_002', slug: 'skillxchange', name: 'SkillXchange',
        subtitle: 'Mutual Mentoring Learning Platform',
        team: 'Team of 4', role: 'Lead Contributor',
        stack: ['Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'Jitsi Meet API'],
        highlights: [
          'Full-stack skill exchange platform with authentication and skill matching.',
          'Integrated Jitsi Meet API for mentoring sessions. Deployed on GitHub Pages and Render.',
        ],
        github: 'https://github.com/kapilthakur01',
        live: null,
      },
      {
        _id: 'proj_003', slug: 'perfectxams', name: 'PerfectXams',
        subtitle: 'Blockchain-Based Secure Examination Platform',
        team: 'Team of 4', role: 'Lead Contributor',
        stack: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Solidity', 'Hardhat', 'AES Encryption', 'JWT'],
        highlights: [
          'Developed a blockchain-based secure examination platform with encrypted and time-locked exam papers.',
          'Implemented blockchain notarization using Solidity and Hardhat, with AES encryption and SHA-256 integrity verification.',
          'Built JWT-based authentication and responsive dashboards for Exam Authorities and Institution Organizers.',
        ],
        github: 'https://github.com/kapilthakur01',
        live: null,
      },
    ],
    experience: [],
    education: [
      {
        _id: 'edu_001',
        institution: 'Chitkara University',
        location: 'Himachal Pradesh, India',
        degree: 'B.E. in Computer Science Engineering',
        period: '2024 – 2028 (Expected)',
        cgpa: '9.0+ / 10',
      },
    ],
    achievements: [
      {
        _id: 'ach_001',
        title: 'LeetCode Problem Solving',
        badge: '600+ Solved',
        tag: 'DSA & Algorithms',
        detail: 'Solved 600+ problems on LeetCode across data structures and algorithms, strengthening core problem-solving and coding efficiency.',
      },
      {
        _id: 'ach_002',
        title: 'AI & Emerging Technologies',
        badge: '100 / 100',
        tag: 'Academic Excellence',
        detail: 'Scored 100/100 in the AI Masterclass examination on ChatGPT, DeepSeek, and Metaverse conducted at Chitkara University.',
      },
      {
        _id: 'ach_003',
        title: 'HackIndia Hackathon',
        badge: '100+ Teams',
        tag: 'Hackathon Demo',
        detail: 'Competed among 100+ teams at Chitkara University, collaborating under time constraints to build a functional prototype.',
      },
    ],
    contact: {
      _id: 'contact_001',
      email: 'thakurkapil2007@gmail.com',
      phone: '+91 7831970301',
      github: 'https://github.com/kapilthakur01',
      linkedin: 'https://www.linkedin.com/in/kapilthakur1/',
      location: 'Parwanoo, Himachal Pradesh, India',
    },
  };

  await PortfolioData.create(initialData);
  console.log('🌱 Initial portfolio data seeded to MongoDB.');
}

// ── Routes ───────────────────────────────────────────────────────────────

// GET all portfolio data
app.get('/api/portfolio', async (req, res) => {
  try {
    const data = await PortfolioData.findById('portfolio_v1').lean();
    if (!data) return res.status(404).json({ error: 'Portfolio data not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET individual sections
app.get('/api/profile',      async (req, res) => { try { const d = await PortfolioData.findById('portfolio_v1', 'profile').lean(); res.json(d?.profile || {}); } catch (e) { res.status(500).json({ error: e.message }); } });
app.get('/api/skills',       async (req, res) => { try { const d = await PortfolioData.findById('portfolio_v1', 'skills').lean(); res.json(d?.skills || []); } catch (e) { res.status(500).json({ error: e.message }); } });
app.get('/api/projects',     async (req, res) => { try { const d = await PortfolioData.findById('portfolio_v1', 'projects').lean(); res.json(d?.projects || []); } catch (e) { res.status(500).json({ error: e.message }); } });
app.get('/api/experience',   async (req, res) => { try { const d = await PortfolioData.findById('portfolio_v1', 'experience').lean(); res.json(d?.experience || []); } catch (e) { res.status(500).json({ error: e.message }); } });
app.get('/api/education',    async (req, res) => { try { const d = await PortfolioData.findById('portfolio_v1', 'education').lean(); res.json(d?.education || []); } catch (e) { res.status(500).json({ error: e.message }); } });
app.get('/api/achievements', async (req, res) => { try { const d = await PortfolioData.findById('portfolio_v1', 'achievements').lean(); res.json(d?.achievements || []); } catch (e) { res.status(500).json({ error: e.message }); } });
app.get('/api/contact',      async (req, res) => { try { const d = await PortfolioData.findById('portfolio_v1', 'contact').lean(); res.json(d?.contact || {}); } catch (e) { res.status(500).json({ error: e.message }); } });
app.get('/api/socials',      async (req, res) => { try { const d = await PortfolioData.findById('portfolio_v1', 'socials').lean(); res.json(d?.socials || []); } catch (e) { res.status(500).json({ error: e.message }); } });
app.get('/api/gui',          async (req, res) => { try { const d = await PortfolioData.findById('portfolio_v1', 'gui widgets').lean(); res.json({ gui: d?.gui || {}, widgets: d?.widgets || {} }); } catch (e) { res.status(500).json({ error: e.message }); } });

// GET single project by id or slug
app.get('/api/projects/:id', async (req, res) => {
  try {
    const d = await PortfolioData.findById('portfolio_v1', 'projects').lean();
    const project = d?.projects?.find(p => p._id === req.params.id || p.slug === req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST contact message
app.post('/api/contact/message', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email, and message are required' });
    }
    const msg = await Message.create({ name, email, message });
    res.status(201).json({ success: true, id: msg._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update portfolio data (admin use)
app.put('/api/portfolio', async (req, res) => {
  try {
    const updated = await PortfolioData.findByIdAndUpdate(
      'portfolio_v1',
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// ── Start ─────────────────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Portfolio API running on http://localhost:${PORT}`);
  });
});

