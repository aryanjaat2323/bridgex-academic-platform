# BridgeX — Frontend

React + TypeScript + Vite frontend for the BridgeX academic platform.

## Quick Start

```bash
npm install
cp .env.example .env.local   # VITE_API_URL can remain empty for local dev
npm run dev -- --port 3000
```

App: http://localhost:3000

## Build for Production

```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/      # AppLayout, Navbar, Sidebar
│   │   └── ui/          # BrandLogo, StatusBadge, UrgencyBadge
│   ├── context/         # AuthContext, NotificationContext
│   ├── pages/
│   │   ├── admin/       # AdminDashboard, Escalations, Users, Mappings
│   │   ├── cr/          # CRDashboard, CRQueriesPage
│   │   ├── faculty/     # FacultyDashboard, Queue, OfficeHours, Analytics
│   │   ├── public/      # LandingPage, LoginPage, RegisterPage
│   │   ├── shared/      # DoubtDetail, SolvedRepository, Notifications, Profile
│   │   └── student/     # StudentDashboard, SubmitDoubt, MyDoubts, OfficeHourBooking
│   ├── services/
│   │   └── api.ts       # Typed Axios API client
│   ├── types/
│   │   └── index.ts     # TypeScript interfaces
│   ├── App.tsx          # Root router (HashRouter — GitHub Pages compatible)
│   └── main.tsx         # Entry point
├── .env.example
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

## Routing

Uses `HashRouter` for full GitHub Pages compatibility — all routes work without server configuration.

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL for production (e.g. `https://bridgex-backend.onrender.com`). Leave empty locally. |

See [`.env.example`](.env.example) for the template.
