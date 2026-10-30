# Deploying BridgeX Frontend to GitHub Pages

The frontend is automatically deployed via GitHub Actions on every push to `main`.

---

## How It Works

1. **Trigger**: Any push to `main` that touches `frontend/` files.
2. **Build**: GitHub Actions runs `npm ci && npm run build` in the `frontend/` directory.
3. **Deploy**: The `dist/` folder is published to GitHub Pages.

## Live URL

```
https://aryanjaat2323.github.io/bridgex-academic-platform/
```

---

## Manual Trigger

You can also trigger deployment manually:

1. Go to **Actions** tab in the GitHub repository
2. Select **Deploy Frontend to GitHub Pages**
3. Click **Run workflow** → **Run workflow**

---

## GitHub Pages Configuration

In your repository:

1. Go to **Settings** → **Pages**
2. Set **Source** to **GitHub Actions**
3. Save

---

## Important Notes

> **GitHub Pages hosts only static assets.**
> The FastAPI backend is NOT hosted here.
> Backend-dependent features (login, doubts, etc.) require a separately deployed backend.
> See [render-backend.md](./render-backend.md) for backend deployment.

---

## Vite Configuration

The project uses `base: './'` in `vite.config.ts` and `HashRouter` in React,
ensuring all assets load correctly and client-side routing works without a server.
