# Portfolio Backend (MongoDB API)

A Node.js + Express backend that serves portfolio data from MongoDB Atlas.

## Setup

```bash
cd server
npm install
```

## Configuration

The `.env` file is already configured with your MongoDB Atlas connection string.

## Running the Backend

```bash
# Start the server (from the server/ directory)
npm start

# Dev mode with auto-restart
npm run dev
```

The API will be available at `http://localhost:5000`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portfolio` | Full portfolio data |
| GET | `/api/profile` | Profile info |
| GET | `/api/skills` | Skills list |
| GET | `/api/projects` | All projects |
| GET | `/api/projects/:id` | Single project |
| GET | `/api/experience` | Work experience |
| GET | `/api/education` | Education |
| GET | `/api/achievements` | Achievements |
| GET | `/api/contact` | Contact info |
| GET | `/api/socials` | Social links |
| GET | `/api/gui` | GUI config & widgets |
| POST | `/api/contact/message` | Save a contact message |
| PUT | `/api/portfolio` | Update portfolio data |
| GET | `/api/health` | Health check |

## Running Frontend + Backend Together

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd server
npm start
```

**Terminal 2 — Frontend:**
```bash
# From the Portfolio root
npm run dev
```

The frontend will proxy `/api` calls to the backend automatically.

## Updating Your Portfolio Data

You can either:
1. **Edit `src/data/demoData.json`** — the fallback if the API is down.
2. **Use the PUT `/api/portfolio`** endpoint to update MongoDB directly.
3. **Use MongoDB Compass** or Atlas UI to edit the `portfoliodata` collection.

