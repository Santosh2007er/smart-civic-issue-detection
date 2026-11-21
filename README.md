# AI-Powered Smart Civic Issue Detection
### Designathon 2.0 2026 | Rajalakshmi Institute of Technology
**Supporting UN Sustainable Development Goal 11: Sustainable Cities and Communities**

---

## 📌 Project Overview
**SmartCivic AI** is an intelligent, full-stack municipal civic issue detection and resolution platform. It allows citizens to photograph urban infrastructure problems (such as road potholes, garbage heaps, broken streetlights, and damaged roads). The application employs pre-trained Computer Vision models to automatically classify the issue, calculate confidence scores, assess severity levels, capture precise GPS coordinates on interactive OpenStreetMap tiles, and track the entire 4-stage resolution pipeline in real-time.

---

## 👥 Team & Institution Details
- **Team Name:** DYNAMIC TRIO
- **Institution:** Rajalakshmi Institute of Technology (RIT), Chennai
- **Department:** Computer Science and Business Systems (CSBS)
- **Institution's Innovation Council (IIC) - Ministry of HRD Initiative**
- **Mentor:** Mrs. R. Sharmathi, Assistant Professor, Department of CSBS

### Team Members:
1. **Nisanthan S** – CSBS / B (Team Lead & Full-Stack Developer)
2. **Santosh G** – CSBS / B (Backend & Database Architecture)
3. **Sooriya Vigneshwaran R** – CSBS / B (AI Model Integration & Geospatial GIS)

---

## 🚀 Key Modules & Capabilities

| Module | Feature Description |
| :--- | :--- |
| **Module 1: Home Page** | Modern smart-city responsive UI, live statistics, 4-step workflow overview, interactive live civic issue map preview, and UN SDG 11 alignment banner. |
| **Module 2: Citizen Login & Registration** | Secure JWT authentication with bcrypt password encryption. Includes 1-Click Evaluation profiles for immediate demo testing. |
| **Module 3: Report a Civic Issue** | Image upload with drag & drop, 1-click sample test buttons, automatic AI issue recognition, HTML5 GPS geolocation capture, and Leaflet pin dropper. |
| **Module 4: AI Issue Detection** | Identifies Potholes, Garbage Accumulation, Damaged Roads, and Broken Streetlights. Displays confidence percentage, severity ranking, and allows user corrections. |
| **Module 5: Location Tracking** | Leaflet & OpenStreetMap interactive GIS integration, colored status pins, popup details, and spatial distribution across Chennai / Poonamallee. |
| **Module 6: Complaint Tracking** | Search by Complaint Tracking ID (e.g., `CIVIC-2026-1001`), 4-stage visual progress stepper (`Submitted` &rarr; `Under Review` &rarr; `Work in Progress` &rarr; `Resolved`), and officer notes. |
| **Module 7: Admin Dashboard** | KPI cards (Total, Pending, Resolved, High Priority), interactive Chart.js reports (Category doughnut, Status bar, Severity pie), and instant inline status updates. |

---

## 🛠️ Technology Stack
- **Frontend:** HTML5, CSS3 (Smart City Theme: Deep Blue `#1a56db`, White, Light Grey), Vanilla JavaScript (ES6+)
- **Backend:** Node.js, Express.js (REST APIs, CORS, Multer)
- **Database:** MySQL (`smart_civic_db`) with `mysql2/promise` connection pooling
- **AI / Computer Vision:** Pre-trained Computer Vision classifier with feature extraction heuristics and confidence metrics
- **Mapping & GIS:** Leaflet.js, OpenStreetMap
- **Visual Analytics:** Chart.js

---

## 📂 Project Directory Structure

```text
smart-civic-issue-detection/
├── frontend/
│   ├── index.html          # Module 1: Smart City Home Page
│   ├── login.html          # Module 2: Citizen & Admin Authentication
│   ├── register.html       # Module 2: Citizen Registration
│   ├── report.html         # Module 3 & 4: Photo Upload, AI Detection & GPS Pin Dropper
│   ├── track.html          # Module 6: 4-Stage Complaint Progress Stepper
│   ├── dashboard.html      # Module 7: Municipal Dashboard & Chart.js Visualizations
│   ├── css/
│   │   └── style.css       # Responsive smart-city theme styling
│   └── js/
│       ├── main.js         # Navigation, auth tokens & toast notifications
│       ├── auth.js         # Login, register & demo accounts
│       ├── report.js       # Drag & drop upload, AI inference, Leaflet picker
│       ├── track.js        # ID query & 4-step progress stepper
│       └── dashboard.js    # Chart.js graphs, admin GIS map & inline status update
├── backend/
│   ├── server.js           # Express.js server entry point & static file hosting
│   ├── config/
│   │   └── db.js           # MySQL connection pool + resilient fallback store
│   ├── routes/
│   │   ├── authRoutes.js   # /api/auth/register, /login, /me
│   │   ├── complaintRoutes.js # /api/complaints, /:id, /:id/status, /stats
│   │   └── aiRoutes.js     # /api/detect
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── complaintController.js
│   │   └── aiController.js
│   ├── models/
│   │   ├── userModel.js
│   │   └── complaintModel.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   └── uploads/
│       └── samples/        # Sample images (Potholes, Garbage, Roads, Lights)
├── database/
│   ├── schema.sql          # Complete MySQL database DDL schema
│   └── seed.sql            # Sample data for Chennai & RIT vicinity
├── .env.example            # Environment variables template
├── .env                    # Active environment variables
├── package.json            # Node.js dependencies and scripts
└── README.md               # Documentation & execution guide
```

---

## 💻 Step-by-Step Execution Guide (Windows 11)

### 1. Install Node.js
1. Visit the official Node.js download page: [https://nodejs.org](https://nodejs.org).
2. Download the **LTS (Long Term Support)** Windows Installer (`.msi`).
3. Run the installer and click **Next** through the setup wizard (make sure **"Add to PATH"** is checked).
4. Verify installation by opening PowerShell or Command Prompt:
   ```powershell
   node -v
   npm -v
   ```

---

### 2. Install Project Dependencies
Open PowerShell or Command Prompt inside the `smart-civic-issue-detection` directory:
```powershell
cd c:\Users\nisan\OneDrive\Desktop\smartcivic\smart-civic-issue-detection
npm install
```

---

### 3. Configure MySQL
You can use **MySQL Server** (Standalone) or **XAMPP / WampServer**:
- **Option A (XAMPP - Recommended for Quick Setup):**
  1. Download and install [XAMPP for Windows](https://www.apachefriends.org/).
  2. Open the **XAMPP Control Panel** and click **Start** next to **MySQL**.
- **Option B (MySQL Community Server):**
  1. Ensure the MySQL Windows service is started.
  2. Default port: `3306`, User: `root`, Password: `` (or your custom password).

---

### 4. Create Database and Import Schema
Open your MySQL terminal or phpMyAdmin (`http://localhost/phpmyadmin`):
```sql
-- Step 4.1: Create database
CREATE DATABASE smart_civic_db;

-- Step 4.2: Import Schema & Seed Data
USE smart_civic_db;
SOURCE database/schema.sql;
SOURCE database/seed.sql;
```
*(Note: If MySQL is not currently running, the server automatically starts in resilient demonstration mode, so you can still test all frontend and backend features immediately without errors!)*

---

### 5. Configure `.env` File
Ensure `smart-civic-issue-detection/.env` contains your settings:
```ini
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smart_civic_db
DB_PORT=3306

JWT_SECRET=super_secure_smart_civic_jwt_secret_token_2026
JWT_EXPIRES_IN=7d
```

---

### 6. Start the Express Server
Run the start command from PowerShell:
```powershell
npm start
```
You will see the console banner:
```text
================================================================
  AI-POWERED SMART CIVIC ISSUE DETECTION - PROTOTYPE SERVER    
  Designathon 2.0 2026 | Rajalakshmi Institute of Technology     
  Team: DYNAMIC TRIO (Nisanthan S, Santosh G, Sooriya Vigneshwaran R)
  Supporting UN SDG 11: Sustainable Cities and Communities       
================================================================
  * Web Application:  http://localhost:5000
  * API Base:         http://localhost:5000/api
  * Citizen Portal:   http://localhost:5000/report.html
  * Admin Dashboard:  http://localhost:5000/dashboard.html
================================================================
```

---

### 7. Open the Application in Your Browser
Open Chrome, Edge, or Firefox and navigate to:
- **Home Page:** [http://localhost:5000](http://localhost:5000)
- **Report an Issue:** [http://localhost:5000/report.html](http://localhost:5000/report.html)
- **Track Complaint:** [http://localhost:5000/track.html](http://localhost:5000/track.html)
- **Admin Dashboard:** [http://localhost:5000/dashboard.html](http://localhost:5000/dashboard.html)
- **Login:** [http://localhost:5000/login.html](http://localhost:5000/login.html)

#### 🔑 Pre-Configured Demo Credentials for Evaluators:
- **Admin Portal:**
  - Email: `admin@smartcivic.gov.in`
  - Password: `admin123` *(or click the "Login as Municipal Admin" 1-click button on login page)*
- **Citizen Portal:**
  - Email: `nisanthan@ritchennai.edu.in`
  - Password: `admin123` *(or click "Login as Citizen" button)*

---

## 🎯 Evaluation Checklist & Features
- [x] **Strict Tech Stack Adherence:** HTML5, CSS3, Vanilla JavaScript, Node.js, Express.js, MySQL, Leaflet, OpenStreetMap, Chart.js. (No Python backend).
- [x] **Pre-trained AI Vision Detection:** Automatically identifies Potholes, Garbage Accumulation, Damaged Roads, and Broken Streetlights with confidence scores & suggested severity.
- [x] **User Correction Option:** Citizens can manually adjust predictions if needed.
- [x] **GPS Location & Leaflet Pin Dropper:** Captures browser GPS with one click and allows interactive map pin dragging.
- [x] **4-Stage Progress Stepper:** `Submitted` &rarr; `Under Review` &rarr; `Work in Progress` &rarr; `Resolved`.
- [x] **Full Admin Dashboard:** Real-time KPI counters, Chart.js visual graphs, interactive GIS incident map, and inline status updates.
- [x] **Professional Smart-City UI:** Built in Blue, White, and Light Grey colors with high visual polish.

---

## 📜 License
Developed for educational and competition purposes for **Designathon 2.0 2026** by Team **DYNAMIC TRIO**, Rajalakshmi Institute of Technology.
All rights reserved under the MIT License.
