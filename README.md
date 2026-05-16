# 🚗 Vehicle Rental Management System

A full-stack web application for managing vehicle rentals with customer, owner, and admin roles.

## Tech Stack

- **Frontend**: React.js, React Router v6, Axios, CSS3
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment Ready**: AWS / Vercel / Netlify

---

## Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) v16+
- [MongoDB](https://www.mongodb.com/try/download/community) (local) **or** a MongoDB Atlas connection string
- [VS Code](https://code.visualstudio.com/)

---

## Setup & Run in VS Code

### Step 1 — Install Dependencies

Open a terminal in VS Code and run:

```bash
# Install root (server) dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### Step 2 — Configure Environment

The `.env` file is already created. Edit it if needed:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/vehicle_rental
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

> For MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

### Step 3 — Seed the Database (Optional but Recommended)

```bash
node seed.js
```

This creates demo accounts and 6 sample vehicles.

**Demo Accounts:**
| Role     | Email               | Password |
|----------|---------------------|----------|
| Customer | customer@demo.com   | 123456   |
| Owner    | owner@demo.com      | 123456   |
| Admin    | admin@demo.com      | 123456   |

### Step 4 — Run the App

**Option A — Run both together (recommended):**
```bash
npm run dev
```

**Option B — Run separately:**
```bash
# Terminal 1 — Backend (port 5000)
npm run server

# Terminal 2 — Frontend (port 3000)
npm run client
```

### Step 5 — Open in Browser

- **App**: http://localhost:3000
- **API**: http://localhost:5000/api

---

## Project Structure

```
vehicle-rental/
├── server/
│   ├── index.js              # Express server entry
│   ├── models/
│   │   ├── User.js           # User schema
│   │   ├── Vehicle.js        # Vehicle schema
│   │   └── Booking.js        # Booking schema
│   ├── routes/
│   │   ├── auth.js           # Register/Login/Me
│   │   ├── vehicles.js       # Vehicle CRUD + filters
│   │   ├── bookings.js       # Booking management
│   │   └── admin.js          # Admin-only routes
│   └── middleware/
│       ├── auth.js           # JWT verification
│       └── role.js           # Role-based access
├── client/
│   └── src/
│       ├── context/
│       │   └── AuthContext.js
│       ├── pages/
│       │   ├── Home.js
│       │   ├── Login.js
│       │   ├── Register.js
│       │   ├── Vehicles.js
│       │   ├── VehicleDetail.js
│       │   ├── MyBookings.js
│       │   ├── OwnerDashboard.js
│       │   └── AdminDashboard.js
│       ├── components/
│       │   └── Navbar.js
│       └── App.js
├── seed.js                   # Database seeder
├── .env                      # Environment variables
└── package.json
```

---

## Features by Role

### 👤 Customer
- Register/Login
- Browse and filter vehicles (type, price, fuel, location)
- View vehicle details and pricing plans
- Book vehicles (daily/weekly/monthly)
- View booking history and status
- Cancel pending bookings

### 🏢 Owner / Rental Agency
- All customer features
- Add/Edit/Delete vehicles
- Set vehicle availability and maintenance status
- Approve or reject booking requests
- Track active rentals

### ⚙️ Admin
- Analytics dashboard (KPIs)
- Manage all users (activate/deactivate)
- Approve vehicle listings
- Monitor all bookings and conflicts
- View system-wide analytics and revenue

---

## API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Vehicles
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/vehicles | Get all available (with filters) |
| GET | /api/vehicles/:id | Get single vehicle |
| POST | /api/vehicles | Add vehicle (owner) |
| PUT | /api/vehicles/:id | Update vehicle (owner) |
| DELETE | /api/vehicles/:id | Delete vehicle (owner) |
| GET | /api/vehicles/owner/my | Owner's vehicles |

### Bookings
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/bookings | Create booking (customer) |
| GET | /api/bookings/my | My bookings |
| GET | /api/bookings/owner | Owner's bookings |
| PUT | /api/bookings/:id/status | Approve/Reject (owner) |
| PUT | /api/bookings/:id/cancel | Cancel (customer) |

### Admin
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/admin/analytics | Platform KPIs |
| GET | /api/admin/users | All users |
| PUT | /api/admin/users/:id | Update user |
| GET | /api/admin/vehicles | All vehicles |
| PUT | /api/admin/vehicles/:id/approve | Approve vehicle |
| GET | /api/admin/bookings | All bookings |

---

## KPIs Tracked
- Number of registered users
- Booking conversion rate
- Vehicle utilization rate
- Booking conflict rate
- Average rental duration
- Monthly active users
- Total revenue

---

## Notes
- No GPS tracking (out of scope)
- No native mobile app (web-responsive only)
- No insurance management
- Phase 1: Single-region focus
