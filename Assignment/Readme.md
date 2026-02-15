# Activity Tracking & Analytics Platform

## Project Overview

This project is a full-stack **Activity Tracking and Analytics** application built as part of an assignment submission. The goal of the project is to provide a simple but well-structured system where users can log their activities and view meaningful insights based on that data.

The application follows a clear **client–server architecture**:

* A **React (Vite)** frontend that focuses on usability and clean and responsive UI
* A **Node.js + Express** backend that handles authentication, data storage, and analytics
* **MongoDB** as the database, using Mongoose for schema management and MongoDB Atlas account (cloud database)

The emphasis of this project is not just functionality, but also code organization, scalability, and clarity, making it easy for others to understand and extend.

---

## Tech Stack Used

### Frontend

* **React (Vite)** – UI framework
* **Redux Toolkit** – Global state management
* **React Router** – Client‑side routing
* **Tailwind CSS** – Styling
* **Axios** – API communication
* **Framer Motion** – UI animations
* **Three.js** – 3D / visualization support 

### Backend

* **Node.js** – Runtime
* **Express.js** – REST API framework
* **MongoDB** – NoSQL database (MongoDB Atlas account for cloud database)
* **Mongoose** – ODM for MongoDB
* **JWT and OAuth2 (Google)** – Authentication with OTP verification
* **Multer** – File handling middleware
* **Cloudinary** – Media storage
* **NodeMailer** - To send OTP to emails 

### Tooling

* **ESLint** – Linting
* **Vite** – Frontend build tool
* **npm** – Package management

---

## Setup Instructions

### Prerequisites

* Node.js (v18+ recommended)
* npm
* MongoDB (local or cloud instance)

### Backend Setup

```bash
cd Assignment/server
npm install
```

Create a `.env` file in the `server` directory with the following variables:

```
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=frontend_url
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CLIENT_ID=your_id
GOOGLE_REDIRECT_URI=URL
EMAIL_USER=your_mail
EMAIL_Pass=your_pass
```

Start the server:

```bash
npm run dev
```

### Frontend Setup

```bash
cd Assignment/client
npm install
npm run dev
```

The application will be available at `http://localhost:5173` by default.

---

## Data Model / Schema

### User Model

* `fullname` – String
* `email` – String (unique)
* `password` – Hashed string
* `avatar` – Cloudinary URL
* `isEmailVerified` – Boolean
* `provider` - String
* `googleId` - String
* `emailOTP` - String
* `emailOTPExpires` - Date

### Activity Model

* `user` – Reference to User
* `name` – String
* `category` – Activity category (e.g., walking, coding, exercise)
* `duration` – Number (minutes)
* `date` – Activity date

The models are defined using **Mongoose schemas** and enforce validation at the database layer.

---

## Analytics Logic

Weekly Activity Summary:
The backend calculates a 7-day activity summary for each user. Activities are filtered by the past 7 days and sorted by date, providing a ready-to-use dataset for frontend display.

Example logic (simplified):
-startDate = 6 days before today
-endDate = today
-Filter Activity documents where user = req.user._id and date is between startDate and endDate
-Sort by date and createdAt for consistent ordering

Activity-type breakdowns: Allows the frontend to visualize time spent on categories like Work, Study, Exercise, and Break.

Trends over time: Weekly data can be used to show patterns or consistency in user behavior.

This ensures that analytics logic is efficiently computed on the backend, so the frontend only needs to display the data.

---

## Three.js Mapping Logic

The frontend includes Three.js to provide an interactive 3D bar chart for activity analytics.

Key features:

* 3D weekly activity chart:
    * Each day of the week is represented on the X-axis.
    * Activity categories (Work, Study, Exercise, Break) are stacked vertically as bars.
    * Bar heights correspond to activity duration (minutes).

* Interactive tooltips:
    * Hovering over a bar shows a tooltip with the day, category, and time spent.

* Smooth animations:
    * Bars grow from zero to their actual height on load.
    * Emissive highlights indicate which bar is being hovered.

* Implementation details:
    * Uses THREE.Scene, THREE.PerspectiveCamera, and THREE.WebGLRenderer.
    * Bars are created as THREE.Mesh objects with BoxGeometry and MeshStandardMaterial.
    * Raycasting (THREE.Raycaster) detects mouse hover for interactive tooltips.

This visualization demonstrates a practical use of Three.js for analytics, making activity trends more intuitive and visually appealing.

---


## Assumptions & Decisions

* The application uses a REST-based API, as it keeps the system simple and easy to debug
* JWT authentication was chosen to avoid server-side session storage with OTP verification 
* OAuth2 (Google) Authentication
* MongoDB (MongoDB Atlas) was selected for its flexibility and strong aggregation support
* Analytics are calculated on the backend to reduce duplication of logic on the frontend
* Tailwind CSS was used to speed up UI development and maintain consistent styling
* Three.js was included as a future-facing dependency, even though it is not actively used in the current implementation

## Final Notes

This project was built with clarity and maintainability in mind. While the feature set is intentionally focused, the structure allows room for future improvements such as richer analytics, advanced visualizations, or additional activity types.

All documentation here reflects what is actually present in the submitted zip file, without overstating features or assumptions.