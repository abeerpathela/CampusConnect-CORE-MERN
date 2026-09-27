# CampusConnect 🎓
### Centralized Campus Club & Event Management Portal

[![Vite](https://img.shields.io/badge/Vite-8.2.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Course Code:** 25CS022 – Back-end Engineering  
> **Evaluation:** Continuous Assessment-II (CA-II)  
> **Institution:** Chitkara University, Himachal Pradesh  


![Uploading image.png…]()

---

## 📌 Project Overview
**CampusConnect** is a full-stack web platform developed to unify and streamline extracurricular engagement across university campuses. It replaces fragmented communication channels (WhatsApp groups, static posters, manual spreadsheets) with a single, role-based digital operating hub.

### ✨ Key Features
- **Student Space**:
  - **Club Directory**: Browse campus organizations across Technical, Cultural, Sports, Arts, Social, and Literary categories with real-time membership subscription.
  - **Event Explorer**: Discover upcoming hackathons, fests, and workshops with real-time seat availability counters.
  - **Instant Digital QR Passes**: Register in one click to receive a verified admission e-ticket with a scannable QR code.
  - **Notice Board**: Chronological campus alerts with priority tagging (`Urgent`, `Event Alert`, `General`).
- **Faculty / Admin Portal**:
  - **Live Analytics & KPIs**: Real-time metrics for total clubs, active events, attendee count, and membership growth.
  - **Club CRUD Management**: Add, edit, and archive campus student clubs.
  - **Event Management & Attendee Rosters**: Schedule events with seat limits and inspect live attendee lists with **CSV export**.
  - **Campus Notice Broadcast**: Publish prioritized alerts directly to student dashboards.
- **Evaluator Convenience**:
  - **1-Click Demo Switcher**: Instantly toggle between **Student View** (`student@chitkara.edu.in`) and **Faculty/Admin View** (`admin@chitkara.edu.in`) from the navigation bar.

---

## 🛠️ Technology Stack
- **Frontend Core**: React 18 / 19 (Vite SPA)
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens
- **Icons & Motion**: Lucide React, Framer Motion, Canvas Confetti
- **State & Storage**: React Context API (`AuthContext`, `AlertContext`) + Persistent Mock LocalStorage Engine
- **HTTP Layer**: Axios with token interceptor architecture (Ready for Express/MongoDB REST API)

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18.x` or higher
- npm `v9.x` or higher

### Installation & Local Run
```bash
# 1. Clone the repository
git clone https://github.com/raodeepakyadav/temp-project.git

# 2. Navigate to client folder
cd client

# 3. Install dependencies
npm install

# 4. Launch development server
npm run dev
```
Open `http://localhost:5173` (or the port specified in terminal) in your browser.

---

## 📂 Project Structure
```text
client/
├── public/
├── src/
│   ├── components/
│   │   ├── common/         # Navbar, Footer, Sidebar, Button, Input, Modal, Badge, Card, Loader
│   │   ├── auth/           # LoginForm, RegisterForm
│   │   ├── clubs/          # ClubCard, ClubList, ClubDetailView, ClubFormModal
│   │   ├── events/         # EventCard, EventList, EventDetailModal, EventTicketModal, RegistrationTable, EventFormModal
│   │   ├── announcements/  # AnnouncementCard, AnnouncementList, AnnouncementFormModal
│   │   └── dashboard/      # StatsCard, RecentActivity, QuickActions
│   ├── context/            # AuthContext, AlertContext
│   ├── data/               # initialData.js (Realistic Campus Seed Data)
│   ├── hooks/              # useAuth, useAlert
│   ├── pages/              # Home, Login, Register, Clubs, ClubDetail, Events, Announcements, StudentDashboard, AdminDashboard, 404
│   ├── routes/             # AppRoutes, ProtectedRoute (RBAC Guard)
│   ├── services/           # api.js, authService, clubService, eventService, announcementService
│   └── utils/              # constants, formatDate, validators
├── index.html
├── package.json
└── vite.config.js
```

---

## 👥 Demo Credentials for Evaluation

| Role | Email | Details |
| :--- | :--- | :--- |
| **Student** | `student@chitkara.edu.in` | Roll: `2310990001` • CSE • 4th Sem |
| **Faculty / Admin** | `admin@chitkara.edu.in` | Dean of Student Affairs / Club Coordinator |
