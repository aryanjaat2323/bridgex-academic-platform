# Contributing to BridgeX

Thank you for your interest in contributing to BridgeX — an open academic communication platform.

---

## 🛠️ Development Setup

### Prerequisites

- **Node.js** ≥ 18.x and **npm** ≥ 9.x
- **Python** ≥ 3.11
- **Git**

### 1. Fork & Clone

```bash
git clone https://github.com/aryanjaat2323/bridgex-academic-platform.git
cd bridgex-academic-platform
```

### 2. Backend

```bash
cd backend
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
python -m app.seed.seed_data
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev -- --port 3000
```

---

## 🌿 Branch Naming Conventions

| Type | Pattern | Example |
|---|---|---|
| Feature | `feat/<short-name>` | `feat/cr-analytics-export` |
| Bug fix | `fix/<short-name>` | `fix/booking-double-submit` |
| Documentation | `docs/<short-name>` | `docs/api-reference` |
| Chore | `chore/<short-name>` | `chore/update-deps` |
| Hotfix | `hotfix/<short-name>` | `hotfix/jwt-expiry` |

**Always branch from `main`.**

---

## ✍️ Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <short summary>

[optional body]

[optional footer: Closes #<issue-number>]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`

**Examples:**
```
feat(student): add real-time duplicate detection on submit form
fix(auth): resolve JWT expiry not refreshing session
docs(readme): add screenshots to landing page section
chore(deps): upgrade fastapi to 0.115.0
```

---

## 🔁 Pull Request Guidelines

1. **Open an issue first** for substantial changes.
2. **One feature or fix per PR** — keep changes focused.
3. **Fill out the PR template** completely.
4. **All CI checks must pass** before review.
5. **Add or update tests** for any new functionality.
6. **Update documentation** if behavior changes.
7. **Request a review** — maintainers aim to review within 48 hours.

---

## 🧪 Testing Requirements

### Backend

```bash
cd backend
source venv/bin/activate   # or venv\Scripts\activate on Windows
pytest -v
```

All 4 test modules must pass:
- `test_doubts.py` — Doubt creation, routing, status transitions
- `test_duplicates.py` — Similarity matching
- `test_escalation.py` — 48-hour SLA logic
- `test_office_hours.py` — Concurrency-safe booking

### Frontend

```bash
cd frontend
npm run build   # TypeScript compilation + production build must succeed
```

---

## 🔒 Security

- **Never commit `.env` files or secrets.**
- Always use `.env.example` as a template.
- If you discover a security issue, please email the maintainer privately rather than opening a public issue.

---

## 📋 Code Style

- **Python**: PEP 8, type hints encouraged, docstrings on public functions.
- **TypeScript**: Strict mode, no `any` where avoidable.
- **Git**: Atomic commits, no merge commits in PRs (rebase preferred).
