# ProfitPulse Admin Dashboard 🚀
**A Professional eCommerce Management Suite**

ProfitPulse is a modern, secure, and robust administrative dashboard built for full-scale eCommerce operations. It features a high-performance React frontend and a scalable Node.js/PostgreSQL backend.

---

## 📦 Version 1.0.0 — Release Notes (April 2026)
**Build Info:** `git-v2.53.0` | **Commit:** `f74bb1d`

### 🔐 Security & Authentication
- **Dual-Mode Registration**: Admins can now toggle "Required Email Verification" in settings. 
- **Auto-Verification**: When disabled, users are marked verified with a **blue checkmark** instantly.
- **OTP Password Recovery**: Secure password resets via 6-digit email OTPs.
- **Verification Popup**: High-visibility UI prompt for unverified users with integrated resend functionality.
- **JWT Protection**: Full session management with protected routes for sensitive admin areas.

### 🛡️ Administrative Controls
- **Audit Logging Dashboard**: Full transparency into system actions. Admins can filter logs by **Date Range** and **User ID**.
- **Role-Based Access (RBAC)**: 
  - `ADMIN`: Full access to all masters, settings, and logs.
  - `VIEWER/EDITOR`: Access to dashboard and profile, with restricted access to sensitive configurations.
- **General Settings**: Centralized control panel for system-wide behaviors.

### 🎨 User Experience & Design
- **Collapsible Glassmorphism Sidebar**: Dynamic navigation that saves space with smooth animations.
- **Profile Management**: Complete user profile system with **Avatar Uploads** and detailed bio management.
- **MUI v9 Integration**: Clean, modern UI components using the latest Material-UI standards.
- **Responsive Layout**: Fully adaptive design for mobile, tablet, and desktop views.

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Material UI (MUI) v9, Tailwind CSS
- **Backend**: Node.js, Express, PostgreSQL
- **Auth**: JWT, Bcrypt, Crypto
- **Mail**: Nodemailer (Gmail App Password integration)

---

## 🚀 Quick Setup

### 1. Backend Configuration
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
DATABASE_URL=your_postgres_url
JWT_SECRET=your_long_secret_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
```

### 2. Frontend Configuration
Ensure your `frontend/vite.config.js` is set to port 3000 (or update the `.env` above to match).

### 3. Installation
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

---

## 📈 Roadmap
- [ ] Multi-currency support
- [ ] Real-time sales analytics with Recharts
- [ ] Bulk product CSV import/export
- [ ] Advanced SEO management suite

---
*Developed with ❤️ for professional commerce management.*
