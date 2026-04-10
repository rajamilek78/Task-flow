# 🚀 TaskFlow — Kanban Project Management

A full-stack, production-ready Kanban board with 16 custom workflow stages, JWT auth, drag-and-drop, and team collaboration.

---

## 🧱 Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18 + Vite + TypeScript + Tailwind |
| Backend   | Node.js + Express + TypeScript          |
| Database  | MongoDB + Mongoose                      |
| Auth      | JWT (access token, 7d expiry)           |
| State     | Zustand                                 |
| DnD       | @hello-pangea/dnd (Trello-style)        |
| UI fonts  | Syne (display) + DM Sans (body)         |

---

## 📂 Project Structure

```
taskflow/
├── backend/
│   ├── src/
│   │   ├── controllers/      # authController, taskController, notificationController
│   │   ├── middleware/        # auth.ts (JWT), errorHandler.ts
│   │   ├── models/            # User, Task, ActivityLog, Notification
│   │   ├── routes/            # auth, tasks, notifications, columns
│   │   ├── types/             # TypeScript interfaces
│   │   ├── utils/
│   │   │   ├── columns.ts     # 16 workflow stages (exact order)
│   │   │   └── seed.ts        # Seed script with demo data
│   │   └── index.ts           # Express app entry
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/          # ProtectedRoute
    │   │   ├── board/         # KanbanColumn, TaskCard, BoardFilters
    │   │   ├── layout/        # Sidebar, AppLayout
    │   │   ├── task/          # TaskFormModal, TaskDetailModal
    │   │   └── ui/            # Avatar, Badge, Modal
    │   ├── pages/             # BoardPage, DashboardPage, NotificationsPage, TeamPage, SettingsPage
    │   ├── services/          # api.ts (Axios instance + all API calls)
    │   ├── store/             # authStore.ts, taskStore.ts (Zustand)
    │   ├── types/             # index.ts
    │   ├── utils/             # helpers.ts
    │   ├── App.tsx            # Routes
    │   ├── main.tsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

---

### 1. Backend Setup

```bash
cd backend
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET

npm run dev
# Server runs on http://localhost:5000
```

### 2. Seed Database (optional but recommended)

```bash
cd backend
npm run seed
```

This creates 4 users and 16 sample tasks (one per column):
| User         | Email                    | Password     | Role   |
|--------------|--------------------------|--------------|--------|
| Admin User   | admin@taskflow.com       | password123  | admin  |
| Krish        | krish@taskflow.com       | password123  | member |
| Raj          | raj@taskflow.com         | password123  | member |
| UI/UX Team   | uiux@taskflow.com        | password123  | member |

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

Open your browser → `http://localhost:5173`

---

## 🗂️ Workflow Stages (All 16)

| # | Column ID                     | Title                            |
|---|-------------------------------|----------------------------------|
| 1 | uiux-design-todo              | UI/UX Design To Do               |
| 2 | uiux-design-done              | UI/UX Design Done                |
| 3 | design-start                  | Design Start                     |
| 4 | design-done                   | Design Done                      |
| 5 | testing-local-krish           | Testing by Local Krish           |
| 6 | testing-local-uiux-team       | Testing by Local UI/UX Team      |
| 7 | testing-local-raj             | Testing by Local Raj             |
| 8 | development-start             | Development Start                |
| 9 | development-done              | Development Done                 |
|10 | testing-krish                 | Testing by Krish                 |
|11 | testing-raj                   | Testing by Raj                   |
|12 | ready-for-deployment          | Ready for Deployment             |
|13 | deployed                      | Deployed                         |
|14 | post-deploy-testing-krish     | Post-Deploy Testing by Krish     |
|15 | post-deploy-testing-raj       | Post-Deploy Testing by Raj       |
|16 | completed                     | Completed                        |

---

## 🔌 API Reference

### Auth
| Method | Endpoint            | Access | Description          |
|--------|---------------------|--------|----------------------|
| POST   | /api/auth/signup    | Public | Register new user    |
| POST   | /api/auth/login     | Public | Login + get token    |
| GET    | /api/auth/me        | Auth   | Current user profile |
| GET    | /api/auth/team      | Auth   | List all team members|
| POST   | /api/auth/invite    | Admin  | Add team member      |
| PUT    | /api/auth/profile   | Auth   | Update profile       |

### Tasks
| Method | Endpoint                    | Description                  |
|--------|-----------------------------|------------------------------|
| GET    | /api/tasks                  | All tasks (filterable)        |
| POST   | /api/tasks                  | Create task                  |
| GET    | /api/tasks/:id              | Single task                  |
| PUT    | /api/tasks/:id              | Update task                  |
| PUT    | /api/tasks/:id/move         | Move task (drag-and-drop)    |
| DELETE | /api/tasks/:id              | Archive task                 |
| POST   | /api/tasks/:id/comments     | Add comment                  |
| GET    | /api/tasks/:id/activity     | Activity log for task        |
| GET    | /api/tasks/stats/dashboard  | Stats for dashboard          |

### Other
| Method | Endpoint                          | Description             |
|--------|-----------------------------------|-------------------------|
| GET    | /api/columns                      | All 16 columns          |
| GET    | /api/notifications                | User notifications      |
| PUT    | /api/notifications/mark-read      | Mark all as read        |
| PUT    | /api/notifications/:id/read       | Mark one as read        |

---

## 🎨 UI Features

- **Dark theme**: Deep navy `#0f1117` base, electric indigo accent
- **Fonts**: Syne (headings) + DM Sans (body)
- **Kanban**: Horizontally scrollable, color-coded columns, each with unique accent
- **Drag & drop**: Trello-style with rotation animation while dragging
- **Task cards**: Priority badge, assignee avatars, deadline status, tag chips
- **Task detail**: Tabbed modal with details, comments, and activity timeline
- **Responsive**: Sidebar layout, mobile-friendly forms

---

## 🔐 Role-Based Access

| Feature            | Admin | Member |
|--------------------|-------|--------|
| View board         | ✅    | ✅     |
| Create tasks       | ✅    | ✅     |
| Edit any task      | ✅    | ✅     |
| Delete own tasks   | ✅    | ✅     |
| Delete any task    | ✅    | ❌     |
| Invite team members| ✅    | ❌     |
| View team          | ✅    | ✅     |

---

## 📈 Scalability & Future Improvements

### Immediate
- **WebSockets** (Socket.io) for real-time board updates across users
- **Redis** caching for frequently-accessed task lists
- **File uploads** with cloud storage (AWS S3 / Cloudinary)
- **Email notifications** via Nodemailer/SendGrid for invitations

### Short-term
- **Multiple boards/projects** per workspace
- **Sprint planning** with time-boxed sprints and velocity tracking
- **Labels/custom fields** configurable per project
- **Due date reminders** via cron jobs (node-cron)
- **CSV export** of tasks

### Long-term
- **Multi-tenancy** — isolated workspaces per company
- **GraphQL API** for flexible frontend queries
- **Mobile app** (React Native sharing API layer)
- **Analytics** — burndown charts, cycle time, throughput
- **Integrations** — GitHub PRs, Slack, Jira import

---

## 🐳 Docker (optional)

```yaml
# docker-compose.yml (add to root)
version: '3.8'
services:
  mongo:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: [mongo_data:/data/db]

  backend:
    build: ./backend
    ports: ["5000:5000"]
    environment:
      MONGODB_URI: mongodb://mongo:27017/taskflow
      JWT_SECRET: your_secret_here
    depends_on: [mongo]

  frontend:
    build: ./frontend
    ports: ["5173:5173"]
    depends_on: [backend]

volumes:
  mongo_data:
```

---

## 📄 License
MIT — free to use and modify for personal or commercial projects.
