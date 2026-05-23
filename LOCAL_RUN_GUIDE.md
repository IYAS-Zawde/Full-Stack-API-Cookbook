# Local Run Guide: Full-Stack API Cookbook

This guide details how to set up and run the **Full-Stack API Cookbook** workspace on your local machine.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18.x or above recommended)
- **npm** (v9.x or above) or **yarn**

---

## 📦 Option A: Running the Integrated Full-Stack Demo
This is the unified setup used in our development dashboard which bundles the React/Vite frontend with the Express backend using unified Vite developer middleware.

### 1. Extract and Install Root Dependencies
Navigate to the root directory where `package.json` is located:
```bash
# Install dependencies for both build tools and the server engine
npm install
```

### 2. Run the Unified Development Server
Spin up the Express/Vite full-stack application layer:
```bash
npm run dev
```
- The Express backend server starts running.
- Vite mounts as a developer middleware layer directly on top of Express.
- Open your browser to **`http://localhost:3000`** to view the interactive testbed.

### 3. Build & Run for Production
To simulate the optimized Cloud production container locally:
```bash
# Compile client-side Vue/React static build and bundle server
npm run build

# Boot compiled bundle
npm start
```

---

## 📁 Option B: Running the Isolated Sub-projects (GitHub Style)
If you exported the subfolders to deploy them separately or to practice using standard isolated client-server architecture, follow these steps.

### 🔌 Part 1: Booting the Backend (Express API Server)
1. Open a terminal and navigate to the isolated `/backend` directory:
   ```bash
   cd backend
   ```
2. Install the necessary lightweight dependencies (`express`, `cors`):
   ```bash
   npm install
   ```
3. Boot the standalone server:
   ```bash
   npm start
   ```
   *Note: This starts an independent Express instance on port **`3001`** (`http://localhost:3001`).*

---

### 🌐 Part 2: Booting the Frontend (Vanilla HTML/JS)
The isolated client is constructed purely with native web APIs (`fetch`, modern Tailwind CDN integration) under `/frontend`.

1. Open `/frontend/app.js` and verify that `API_BASE` points directly to your independent Express backend instance:
   ```javascript
   const API_BASE = "http://localhost:3001";
   ```
2. Because of CORS security constraints in local filesystems, **opening `index.html` by double-clicking it directly might trigger browser blocks** when running fetch requests.
3. Instead, run a lightweight HTTP server in the frontend directory to serve the file:
   ```bash
   cd frontend
   
   # Use npx to spin up a quick, zero-config server
   npx serve .
   ```
4. Access the server in your browser (typically `http://localhost:3000` or the port displayed on screen).

---

## ⚠️ Troubleshooting Tips

### 🚫 CORS Errors
- **Symptom:** Logs in browser DevTools show: *"Access to fetch at ... has been blocked by CORS policy..."*
- **Solution:** Verify that the `cors` package is successfully loaded and used in `backend/server.js`. In production, remember to change `origin: '*'` to your specific frontend URL domain to maintain network isolation security!

### 🔒 Port Occupation Conflics
- **Symptom:** Server crashes immediately on boot with `Error: listen EADDRINUSE: address already in use :::3000`.
- **Solution:** Another program is using port 3000. You can change the target environment variable dynamically when booting:
  ```bash
  PORT=3002 npm run dev
  ```
