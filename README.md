# Ethara — Team Task Manager

Full-stack project & task management app with role-based access control, Kanban boards, and overdue tracking.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| Styling | Vanilla CSS (dark mode) |

## Features

- JWT authentication (signup/login)
- Role-based access: Admin creates projects, Members update assigned tasks
- Project CRUD with team assignment
- Kanban task board (To Do → In Progress → Done)
- Priority levels, due dates, overdue detection
- Dashboard with task/project analytics
- Team management page
- Responsive dark UI

## Project Structure

```
├── client/          React + Vite frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       └── utils/
├── server/          Express API backend
│   └── src/
│       ├── routes/
│       ├── middleware/
│       └── prisma/
└── README.md
```

## Setup

```bash
# Backend
cd server
npm install
npx prisma generate
npx prisma db push
npm run dev

# Frontend (separate terminal)
cd client
npm install
npm run dev
```

Open http://localhost:5173 — API proxied to :5000

## Deployment

Backend deployed on Railway with PostgreSQL. Frontend built and served statically by Express.

```bash
cd client && npm run build    # builds to client/dist
cd server && npm start        # serves API + static files
```

## Environment Variables (server/.env)

```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PORT=5000
```

## RBAC

| Action | Admin | Member |
|---|---|---|
| Create/Delete Projects | ✅ | ❌ |
| Create/Assign Tasks | ✅ | ❌ |
| Update Task Status | ✅ | ✅ (own) |
| View Team | ✅ | ✅ |
