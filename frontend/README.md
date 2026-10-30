# BridgeX — Frontend

React + TypeScript + Vite frontend for the BridgeX academic platform.

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev -- --port 3000
```

## Build for Production

```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components (layout, ui/)
│   ├── context/         # React Contexts (Auth, Notifications)
│   ├── pages/           # Role-scoped pages (student/, faculty/, cr/, admin/, shared/, public/)
│   ├── services/        # Axios API client
│   ├── types/           # TypeScript interfaces
│   ├── App.tsx          # Root router (HashRouter)
│   └── main.tsx         # Entry point
├── .env.example
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

## Routing

Uses `HashRouter` for full GitHub Pages compatibility — no server configuration needed.
