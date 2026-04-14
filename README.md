# ⚡ ServeEase — Service Booking Platform

ServeEase is a full-stack web application that allows users to browse and book local services such as home maintenance, technical support, health checkups, and more.

The platform supports three roles: **User, Provider, and Admin**, each with different permissions and functionalities.

---

## 🚀 Project Overview

This project is designed to simplify the process of finding and booking trusted service providers.

Users can explore services, view details, select time slots, and make bookings. Providers can manage their assigned work, and admins can control the overall system.

---

## 👥 Roles & Features

### 👤 User

* Register and login securely
* Browse services by category
* View service details and providers
* Book services with date and time
* View booking history and status
* Cancel bookings (before service starts)

---

### 👨‍🔧 Provider

* Login to provider dashboard
* View assigned bookings

---

### 👑 Admin

* Add, edit, and delete services
* Add and manage providers
* View all bookings
* Update booking status without restriction
* Monitor system data

---

## 🛠️ Tech Stack

* **Frontend:** React (Vite), Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose)
* **Authentication:** JWT + bcrypt

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone <your-repo-link>
cd servease
```

---

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

### 4. Open in Browser

```
http://localhost:5173
```

---

## 🔐 Environment Variables

Create a `.env` file in backend:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

---

## 📁 Project Structure

```
servease/
├── backend/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   └── server.js
│
└── frontend/
    ├── components/
    ├── pages/
    ├── context/
    └── main.jsx
```

---

## 📌 Key Functionalities

* Service-based booking system
* Role-based access control (User / Provider / Admin)
* Secure authentication
* Booking status management
* Admin service & provider management
* Clean and responsive UI

---

## 📈 Future Improvements

* Online payment integration
* Real-time notifications
* Advanced search and filtering
* Location-based provider matching

---

## 🙌 Conclusion

ServeEase demonstrates a complete MERN stack application with real-world features such as authentication, role management, and booking workflows.

This project was built as part of a practical learning experience in full-stack development.

---

**Built using MERN Stack**
