# BridgeX

**Tagline: Connecting Students. Bridging Doubts. Empowering Faculty.**

BridgeX is a modern, production-grade EdTech SaaS platform designed to eliminate chaotic academic communication. It centralizes doubt submissions, enforces automated 48-hour response SLAs, enables duplicate detection to protect faculty time, and allows seamless office-hour consultation booking.

---

## 🚀 Key Features

1. **Role-Based Portals (4 Personas)**:
   - **Student**: Submit structured academic doubts with attachments & urgency; real-time duplicate suggestions as you type; track full visual lifecycle; search verified solutions; book 1-on-1 consultation slots.
   - **Faculty**: Prioritized queue management with multi-parameter filtering; mark queries as *Seen* or *Queued*; post verified answers with 1-click publishing to the Solved Repository; merge duplicate queries while preserving student history; set recurring consultation availability.
   - **Class Representative (CR)**: Section-level doubt analytics; identify recurring midterm topics; endorse and forward student doubts directly to designated faculty; generate weekly summaries.
   - **Administrator / HOD**: Comprehensive department KPIs; faculty response-time leaderboards; 48-hour SLA breach escalation monitoring; user role management and academic course-to-faculty routing mappings.

2. **Core Intelligent Engines**:
   - **Lexical Duplicate Detection**: Tokenization and academic term matching against existing questions within the same subject. Proactively suggests resolved solutions in real-time on the student submission form.
   - **Automated 48-Hour Escalation**: Background monitoring engine that checks for unanswered doubts older than 48 hours, marks them as escalated, records timeline audit logs, and alerts departmental administration.
   - **Conflict-Free Office-Hour Scheduling**: Concurrency-safe slot validation preventing overlapping or double-booked consultations.
   - **Solved Questions Knowledge Base**: Searchable repository of faculty-verified explanations with 5-star helpfulness ratings and community upvotes.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, React Router v6, TanStack Query, React Hook Form, Zod.
- **Backend**: Python 3.14, FastAPI, SQLAlchemy 2.0 ORM, Pydantic v2, native Bcrypt, Python-JOSE JWT authentication.
- **Database**: SQLite (friction-free local development) & PostgreSQL / Supabase ready (`DATABASE_URL`).
- **Testing**: Pytest (backend automated test suite), Vitest & TypeScript build verification.

---

## 🏃 Local Quickstart

### 1. Unified Launch
To start both backend and frontend concurrently:
```bash
cd /Users/soumadeeppatra/.gemini/antigravity/scratch/bridgex
./run.sh
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Interactive Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Manual Launch

**Backend**:
```bash
cd backend
source venv/bin/activate
python -m app.seed.seed_data
uvicorn app.main:app --reload --port 8000
```

**Frontend**:
```bash
cd frontend
npm run dev -- --port 3000
```

---

## 👥 Demo Accounts (Seed Data)

The system comes pre-seeded with realistic institutional accounts. You can sign in using password `password123` or use the **1-Click Live Persona Switcher** on the login page:

| Role | Name | Email | Password | Details |
|---|---|---|---|---|
| **Student** | Aarav Sharma | `student@bridgex.edu` | `password123` | B.Tech CSE, Roll `CS-2023-042`, Sec A |
| **Faculty** | Dr. Priya Raman | `faculty@bridgex.edu` | `password123` | Associate Prof, Room 304 (DSA & OS) |
| **Faculty** | Prof. Rajesh Nair | `faculty2@bridgex.edu` | `password123` | Assistant Prof, Room 310 (DBMS & Networks) |
| **Class Rep (CR)** | Tanya Verma | `cr@bridgex.edu` | `password123` | B.Tech CSE, Roll `CS-2023-001`, Sec A |
| **Admin / HOD** | Dr. K. Venkat | `admin@bridgex.edu` | `password123` | HOD Computer Science & Engineering |

---

## 🧪 Running Automated Tests

Run backend pytest suite:
```bash
cd backend
./venv/bin/pytest -v
```
All 6 test suites verify:
- Doubt creation & automated faculty subject routing
- Status transitions and timeline audit history
- Duplicate text similarity matching & academic stemming
- 48-Hour automated SLA breach escalation logic & admin alerts
- Concurrency-safe office-hour booking and double-booking rejection

Run frontend TypeScript & production build check:
```bash
cd frontend
npm run build
```
