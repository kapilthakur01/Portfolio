# Kapil Thakur — Interactive Dual-Mode Portfolio

> A developer portfolio that works two ways: a **macOS-style GUI desktop** and a **fully interactive CLI terminal** — pick your interface.

---

## 🔗 Live Deployment

Coming soon

---

## ✨ Features at a Glance

| Feature | Description |
|---------|-------------|
| **Dual-mode UI** | Choose between a visual GUI desktop and a hacker-style terminal |
| **macOS-style Desktop** | Draggable windows, dock, menu bar, widgets, Spotlight search |
| **Interactive CLI** | Real shell with 15+ commands, tab completion, filesystem, piping |
| **MongoDB Backend** | Portfolio data served from MongoDB Atlas via Express API |
| **Live LeetCode Stats** | Real-time problem count from LeetCode API |
| **Responsive** | Fully responsive — mobile-optimized views for both modes |
| **No frameworks overhead** | Pure React + CSS Modules — no Tailwind, no UI libraries |

---

## 🖥️ GUI Mode

A faithful macOS-inspired desktop environment:

- **Menu bar** with live clock
- **Desktop icons** for each app (About, Projects, Skills, Resume, etc.)
- **Dock** with app launchers and tooltips
- **Draggable, resizable windows** (react-rnd)
- **Widgets layer** — weather, world clocks, DSA focus, status
- **Spotlight search** (⌘K) — fuzzy-search apps, commands, and links

### Apps

| App | What it shows |
|-----|---------------|
| About | Photo, bio, role, links |
| Projects | Card grid → detail view with stack pills and highlights |
| Skills | Categorized skill list with tech icons |
| Experience | Education, work (if any), achievements timeline |
| Resume | PDF viewer with download button |
| Contact | Email (copy + Gmail compose), GitHub, LinkedIn, location |
| Terminal | Full CLI inside a GUI window |

---

## ⌨️ CLI Mode

A real interactive terminal with:

- 15+ built-in commands
- Tab auto-completion
- In-memory Linux-like filesystem (`ls`, `cd`, `cat`, `pwd`)
- Easter eggs (`sudo hire kapil`, `matrix`, `neofetch`)
- Command history (↑/↓)
- `gui` command to switch modes

### Commands

```
help          Show all commands
about         Display background and bio
skills        List technical skills
projects      Browse all projects
project <id>  View a specific project
experience    Education & achievements
contact       Contact information
resume        View resume / --download
whoami        Quick profile card
socials       Social media links
clear         Clear terminal
neofetch      System info (fun)
gui           Switch to GUI mode
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite 6, CSS Modules, Framer Motion |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB Atlas |
| State | Zustand (window manager), React hooks |
| Layout | react-rnd (drag/resize), CSS Grid/Flexbox |
| Icons | Lucide React (tree-shakeable) |
| Fonts | Fira Code, IBM Plex Sans, JetBrains Mono |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/kapilthakur01/Portfolio.git
cd Portfolio
npm install
cd server
npm install
cd ..
```

### Running (Development)

**Terminal 1 — Backend:**
```bash
cd server
npm start
```

**Terminal 2 — Frontend:**
```bash
npm run dev
```

Open `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
Portfolio/
├── index.html
├── package.json
├── vite.config.js
├── .env                     # VITE_API_URL
├── server/                  # Node/Express backend
│   ├── index.js             # API server + seed
│   ├── models.js            # Mongoose schemas
│   ├── updatePortfolio.js   # Data update script
│   ├── .env                 # MongoDB connection string
│   └── package.json
├── public/
│   └── img/                 # Static images
├── src/
│   ├── App.jsx              # Mode router (landing → GUI / CLI)
│   ├── main.jsx
│   ├── data/
│   │   └── demoData.json    # Local fallback data
│   ├── services/
│   │   ├── dataService.js   # MongoDB API + local fallback
│   │   └── leetcodeService.js
│   ├── cli/                 # Terminal mode
│   │   ├── Terminal.jsx
│   │   ├── WelcomeBanner.jsx
│   │   ├── fileSystem.jsx
│   │   └── commands/
│   ├── gui/                 # Desktop mode
│   │   ├── Desktop.jsx
│   │   ├── Dock.jsx
│   │   ├── MenuBar.jsx
│   │   ├── Window.jsx
│   │   ├── apps/
│   │   └── widgets/
│   ├── modes/
│   └── styles/
```

---

## 📬 Contact

- **Name**: Kapil Thakur
- **Email**: [thakurkapil2007@gmail.com](mailto:thakurkapil2007@gmail.com)
- **GitHub**: [github.com/kapilthakur01](https://github.com/kapilthakur01)
- **LinkedIn**: [linkedin.com/in/kapilthakur1](https://www.linkedin.com/in/kapilthakur1/)
- **LeetCode**: [leetcode.com/u/EJtucT1f8w](https://leetcode.com/u/EJtucT1f8w/)

---

© 2026 Kapil Thakur. Built with React and Vite.
