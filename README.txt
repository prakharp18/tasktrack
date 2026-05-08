Ethara - Team Task Manager

A professional full-stack project and task management application built using React (Vite) and Node.js (Express), powered by Prisma and PostgreSQL.

=== TECH STACK ===
- Frontend: React 18, Vite, React Router, Lucide Icons
- Backend: Node.js, Express.js
- Database: PostgreSQL, SQLite (local)
- ORM: Prisma
- Auth: JWT (JSON Web Tokens), bcrypt hashing
- Styling: Custom Vanilla CSS (Premium Charcoal Dark Theme)

=== KEY FEATURES ===
1. Security & Authentication:
   - Secure user registration and login.
   - Secure passwords using bcrypt.
   - Route-level security using JSON Web Tokens.
   - Interactive password toggle (show/hide) on login and signup.

2. Project & Team Management:
   - Admins can create, update, and delete projects.
   - Admins can explicitly add members to projects, granting project visibility.
   - Members only see projects where they are assigned as owners, collaborators, or task assignees.

3. Interactive Kanban Board:
   - Visual progress columns: To Do -> In Progress -> Done.
   - Simple drag/click status updates.
   - High, Medium, Low task priorities.
   - Task due dates with visual overdue warning highlights.
   - Client-side board filters (All, High, Medium, Low) to keep tasks organized.

4. Modern Responsive Interface:
   - Fluid dashboard stats with colored metrics.
   - Top navigation bar featuring user greetings, mobile drawer layout.
   - Horizontally scrolling responsive data tables.

=== DIRECTORY STRUCTURE ===
- /client: Contains the React-Vite frontend application and CSS variables.
- /server: Contains the Express backend API and Prisma schemas.

=== LOCAL SETUP ===
Ensure Node.js is installed on your computer.

1. Backend Setup:
   - Navigate to the server folder: cd server
   - Install dependencies: npm install
   - Generate Prisma Client: npx prisma generate
   - Push schema to DB: npx prisma db push
   - Start development server: npm run dev

2. Frontend Setup:
   - Open a separate terminal and navigate to the client folder: cd client
   - Install dependencies: npm install
   - Start the Vite server: npm run dev

Open http://localhost:5173 to view the application.

=== ROLE-BASED ACCESS CONTROL (RBAC) ===
- Admin Roles:
  - Full CRUD on projects
  - Create and assign tasks
  - Manage project members
  - View full team list
- Member Roles:
  - View assigned projects
  - Update progress status of tasks assigned to them
  - View team list
