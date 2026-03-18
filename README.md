# 📚 EduWallet - Students Note Sharing Portal

A full-stack web application for centralized student note management.

---

## 🗂️ Project Structure

```
eduwallet/
├── backend/
│   ├── config/
│   │   ├── database.js          # MySQL connection pool
│   │   └── database.sql         # SQL schema (run this first!)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── notesController.js
│   │   └── groupController.js
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   ├── roleMiddleware.js    # Role-based access
│   │   └── errorMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── notesRoutes.js
│   │   └── groupRoutes.js
│   ├── uploads/                 # File storage (auto-created)
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── NoteCard.jsx
    │   │   ├── NotesGrid.jsx
    │   │   ├── UploadModal.jsx
    │   │   └── FilterDropdown.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── SavedNotes.jsx
    │   │   ├── TrashNotes.jsx
    │   │   ├── GroupPage.jsx
    │   │   ├── Settings.jsx
    │   │   ├── HelpSupport.jsx
    │   │   └── DownloadNotes.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── ThemeContext.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## ⚙️ Setup Instructions

### Step 1: Database Setup
```sql
-- Connect to MySQL and run:
SOURCE backend/config/database.sql;
```

### Step 2: Backend Setup
```bash
cd backend

# Create .env file
cp .env.example .env
# Edit .env with your MySQL credentials and JWT secret

# Install dependencies
npm install

# Create uploads directory
mkdir -p uploads

# Start server
npm run dev
# Server runs at http://localhost:5000
```

### Step 3: Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# App runs at http://localhost:5173
```

---

## 🌐 API Reference

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | /api/auth/register | Public | Register user |
| POST | /api/auth/login | Public | Login |
| GET | /api/auth/profile | All | Get profile |
| GET | /api/auth/users | Admin | List all users |
| PATCH | /api/auth/users/:id/grant-admin | Admin | Grant admin |

### Notes
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | /api/notes/upload | Admin | Upload note (multipart) |
| GET | /api/notes | All | List notes (search/filter/paginate) |
| GET | /api/notes/saved | All | Get saved notes |
| GET | /api/notes/trash | Admin | Trashed notes |
| GET | /api/notes/:id | All | Get note + comments |
| DELETE | /api/notes/:id | Admin/Owner | Move to trash |
| PATCH | /api/notes/:id/restore | Admin | Restore from trash |
| GET | /api/notes/:id/download | All | Download file |
| POST | /api/notes/save | All | Save/unsave note |
| POST | /api/notes/comment | All | Add comment |
| GET | /api/notes/notifications | All | Get notifications |
| PATCH | /api/notes/notifications/read | All | Mark read |

### Groups
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | /api/groups/create | Admin | Create group |
| POST | /api/groups/join | All | Join via invite code |
| GET | /api/groups | All | List groups |
| GET | /api/groups/:id | All | Group details + members |
| DELETE | /api/groups/:id | Admin | Delete group |
| DELETE | /api/groups/:gid/members/:uid | Admin | Remove member |

---

## 🎨 Features

- **Dark/Light Theme** — Toggle in sidebar bottom
- **Role-Based Access** — Admin vs Student views
- **Note Cards** — Title, publisher, description, unit tags, file type badge
- **Actions** — Comment, Share, Download, Save on every card
- **Skeleton Loading** — Smooth UX while fetching
- **Pagination** — 12 notes per page
- **Search** — Full-text search across title/description/subject
- **Filter** — Filter by subject
- **Groups** — Invite-code based group system
- **Trash** — Soft-delete with restore capability
- **Notifications** — Real-time group activity notifications
- **Responsive** — Collapsible sidebar, mobile-friendly

---

## 🔐 Environment Variables

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=eduwallet_db
JWT_SECRET=change_this_to_random_string
PORT=5000
CLIENT_URL=http://localhost:5173
```
