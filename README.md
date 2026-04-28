# ⚡ ServeEase Pro — India's Advanced Service Booking Platform

A complete, production-ready MERN stack service booking platform with AI-powered features, live tracking, trust scoring, and more.

---

## 🚀 Quick Start (3 Steps)

### Step 1 — Backend Setup
```bash
cd backend
npm install
cp .env.example .env       # Edit MONGO_URI if needed
node data/seeder.js        # Seeds 15 providers + 20 services + categories
npm run dev                # Runs on http://localhost:5000
```

### Step 2 — Frontend Setup
```bash
cd frontend
npm install
npm run dev                # Runs on http://localhost:5173
```

### Step 3 — Open Browser
Visit: **http://localhost:5173**

---

## 🔐 Demo Accounts

| Role     | Email                    | Password      |
|----------|--------------------------|---------------|
| 👑 Admin  | admin@servease.com        | admin123      |
| 👤 User 1 | rahul@example.com         | password123   |
| 👤 User 2 | priya@example.com         | password123   |
| 👨‍🔧 Provider | rajesh@provider.com    | provider123   |

---

## ✨ Features Implemented

### 🤖 AI Smart Match
- Algorithm ranks providers by rating (40%), trust score (25%), distance (20%), availability (10%), budget fit (5%)
- Urgency mode boosts online providers
- Student providers get budget-conscious boost

### 📍 Live Tracking
- Real-time provider location simulation
- Status flow: Pending → Accepted → Traveling → Started → In Progress → Completed
- Interactive map with animated provider dot
- Full status timeline history

### 💬 Problem Help Mode
- Choose "Ask About Problem" before booking
- Provider phone numbers visible
- Chat system with consultation message type
- Convert consultation to booking

### 📦 Bundle Booking
- Book multiple services together
- 10% discount for 1 addon, 15% for 2+ addons
- Auto calculated totals

### 🔒 Trust Score System
- Dynamic score from rating (40%) + job success (40%) + cancellation penalty (20%)
- Visual circular progress indicator
- Shown on every provider card and profile

### 🎓 Student / Local Talent Mode
- Student providers tagged with 🎓 badge
- Lower price multiplier (0.65–0.80)
- Boosted in budget AI matching

### 🧾 Auto Invoice
- Auto-generated after booking completion
- Full breakdown with discounts
- Printable format

### 📊 Smart Dashboard
- Spending by category (bar chart)
- Booking status counts
- Total spent, savings, completion rate
- Quick action shortcuts

---

## 📁 Project Structure

```
servease-v2/
├── backend/
│   ├── config/db.js
│   ├── controllers/        (auth, service, provider, booking, review, message, admin)
│   ├── data/seeder.js      (15 Indian providers, 20 services, 6 categories)
│   ├── middleware/auth.js
│   ├── models/             (User, Category, Service, Provider, Booking, Review, Message)
│   ├── routes/             (8 route files)
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/common/    (Navbar, Footer, ServiceCard, ProviderCard, TrustScore, StarRating)
        ├── context/AuthContext.jsx
        ├── pages/
        │   ├── HomePage.jsx
        │   ├── ServicesPage.jsx
        │   ├── ServiceDetailPage.jsx
        │   ├── ProvidersPage.jsx
        │   ├── ProviderProfilePage.jsx
        │   ├── BookingPage.jsx        (AI Match + Bundle + Consult)
        │   ├── TrackingPage.jsx       (Live simulation)
        │   ├── user/
        │   │   ├── DashboardPage.jsx
        │   │   ├── MyBookingsPage.jsx
        │   │   ├── ProfilePage.jsx
        │   │   ├── InvoicePage.jsx
        │   │   └── ChatPage.jsx
        │   └── admin/
        │       ├── AdminDashboard.jsx
        │       ├── AdminServices.jsx
        │       ├── AdminProviders.jsx
        │       ├── AdminBookings.jsx
        │       └── AdminUsers.jsx
        └── utils/api.js
```

---

## 🛠️ Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, React Router    |
| Backend    | Node.js, Express.js                           |
| Database   | MongoDB with Mongoose                         |
| Auth       | JWT + bcryptjs                                |
| HTTP       | Axios                                         |
| UI/Toast   | react-hot-toast, react-icons                  |

---

## 📡 API Endpoints

| Method | Route                          | Access  |
|--------|--------------------------------|---------|
| POST   | /api/auth/register             | Public  |
| POST   | /api/auth/login                | Public  |
| GET    | /api/services                  | Public  |
| GET    | /api/providers                 | Public  |
| POST   | /api/providers/smart-match     | User    |
| POST   | /api/bookings                  | User    |
| GET    | /api/bookings/my               | User    |
| PUT    | /api/bookings/:id/track        | User    |
| GET    | /api/bookings/:id/invoice      | User    |
| GET    | /api/messages/:bookingId       | User    |
| POST   | /api/messages/:bookingId       | User    |
| GET    | /api/admin/stats               | Admin   |
| POST   | /api/providers                 | Admin   |

---

## 🌱 Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/servease-pro
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

---

Built with 🧡 using MERN Stack · Made for India · Final Year Project Ready
