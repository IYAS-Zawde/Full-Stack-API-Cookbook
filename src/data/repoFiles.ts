/**
 * Standing file contents for the Repository Code Explorer
 */

export interface CodeFile {
  name: string;
  path: string;
  language: 'javascript' | 'html' | 'css' | 'markdown' | 'json';
  content: string;
}

export const REPOSITORY_FILES: CodeFile[] = [
  {
    name: "server.js",
    path: "backend/server.js",
    language: "javascript",
    content: `/**
 * Full-Stack API Cookbook - Standalone Backend Server (Express.js)
 * 
 * Demonstrates:
 * 1. HTTP Methods (GET, POST, PUT, DELETE for full CRUD on /api/items)
 * 2. Request Anatomy (Route Params vs Query Strings vs JSON Bodies vs Custom Headers)
 * 3. Status Codes (Graceful returning of 200, 201, 400, 401, 404, and 500)
 * 4. CORS Configuration (Allowing/blocking cross-origin calls via Middleware)
 * 5. Token Authentication (Demonstrating mock stateful login & bearer authorization headers)
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS Options allowing cross-origin calls
const corsOptions = {
  origin: '*', // Restrict to front-end origin in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json()); // Enable JSON body parsing

// ... Item Data storage ...
let items = [
  { id: 1, name: "Node.js Basics", category: "Backend", difficulty: "Beginner" },
  { id: 2, name: "Asynchronous JavaScript", category: "Core", difficulty: "Intermediate" }
];
let nextId = 3;

// HTTP GET: All items supporting Query filters (?search=...)
app.get('/api/items', (req, res) => {
  const { search } = req.query;
  let results = [...items];
  if (search) {
    results = results.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  }
  res.status(200).json({ success: true, data: results });
});

// HTTP POST: Create dynamic items from JSON bodies
app.post('/api/items', (req, res) => {
  const { name, category, difficulty } = req.body;
  if (!name || !category || !difficulty) {
    return res.status(400).json({ success: false, error: "Validation failure" });
  }
  const newItem = { id: nextId++, name, category, difficulty };
  items.push(newItem);
  res.status(201).json({ success: true, data: newItem });
});

// HTTP PUT: Update existing items matching path parameter id
app.put('/api/items/:id', (req, res) => {
  const itemId = parseInt(req.params.id);
  const { name, category, difficulty } = req.body;
  const index = items.findIndex(i => i.id === itemId);
  if (index === -1) {
    return res.status(404).json({ success: false, error: "Item not found" });
  }
  items[index] = { id: itemId, name, category, difficulty };
  res.status(200).json({ success: true, data: items[index] });
});

// HTTP DELETE: Delete standard item by id path parameter
app.delete('/api/items/:id', (req, res) => {
  const itemId = parseInt(req.params.id);
  const index = items.findIndex(i => i.id === itemId);
  if (index === -1) return res.status(404).json({ success: false });
  items.splice(index, 1);
  res.status(200).json({ success: true });
});

// Auth Routes Demo
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === "senior_engineer" && password === "password123") {
    res.status(200).json({ success: true, token: "api_cookbook_super_secret_session_token_123456" });
  } else {
    res.status(401).json({ success: false, error: "Authentication failed" });
  }
});

app.listen(PORT, () => console.log(\`Backend running on port \${PORT}\`));`
  },
  {
    name: "package.json",
    path: "backend/package.json",
    language: "json",
    content: `{
  "name": "fullstack-api-cookbook-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.21.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}`
  },
  {
    name: "README.md",
    path: "backend/README.md",
    language: "markdown",
    content: `# Backend API Cookbook

Contains standard express configuration implementing the 5 core RESTful API mechanics.

### Commands
- \`npm install\` to set up nodes libraries
- \`npm run start\` to start on port 3001`
  },
  {
    name: "index.html",
    path: "frontend/index.html",
    language: "html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Full-Stack API Cookbook</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-8">
  <h1 class="text-2xl font-bold mb-4">API Sandbox</h1>
  <button id="btnGet" class="bg-teal-500 text-slate-950 px-4 py-2 rounded">GET /api/items</button>
  <div id="output" class="bg-black p-4 mt-4 rounded font-mono"></div>
  <script src="app.js"></script>
</body>
</html>`
  },
  {
    name: "app.js",
    path: "frontend/app.js",
    language: "javascript",
    content: `/**
 * Standalone Vanilla Frontend logic mapping to REST API routes
 */
const API_BASE = "http://localhost:3001";
let activeToken = localStorage.getItem("token") || null;

// Async GET operation
async function fetchItems() {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (activeToken) headers['Authorization'] = \`Bearer \${activeToken}\`;

    const res = await fetch(\`\${API_BASE}/api/items\`, { method: 'GET', headers });
    const payload = await res.json();
    console.log("Response status:", res.status);
    document.getElementById('output').innerText = JSON.stringify(payload, null, 2);
  } catch (err) {
    console.error("Fetch dropped by CORS or offline:", err);
  }
}

document.getElementById('btnGet').addEventListener('click', fetchItems);`
  },
  {
    name: "style.css",
    path: "frontend/style.css",
    language: "css",
    content: `/* Baseline styling components */
body {
  font-family: system-ui, sans-serif;
  box-sizing: border-box;
}
code {
  font-family: monospace;
}`
  },
  {
    name: "LOCAL_RUN_GUIDE.md",
    path: "frontend/LOCAL_RUN_GUIDE.md",
    language: "markdown",
    content: `# Local Run Guide: Full-Stack API Cookbook

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
Navigate to the root directory where \`package.json\` is located:
\`\`\`bash
# Install dependencies for both build tools and the server engine
npm install
\`\`\`

### 2. Run the Unified Development Server
Spin up the Express/Vite full-stack application layer:
\`\`\`bash
npm run dev
\`\`\`
- The Express backend server starts running.
- Vite mounts as a developer middleware layer directly on top of Express.
- Open your browser to **\`http://localhost:3000\`** to view the interactive testbed.

### 3. Build & Run for Production
To simulate the optimized Cloud production container locally:
\`\`\`bash
# Compile client-side Vue/React static build and bundle server
npm run build

# Boot compiled bundle
npm start
\`\`\`

---

## 📁 Option B: Running the Isolated Sub-projects (GitHub Style)
If you exported the subfolders to deploy them separately or to practice using standard isolated client-server architecture, follow these steps.

### 🔌 Part 1: Booting the Backend (Express API Server)
1. Open a terminal and navigate to the isolated \`/backend\` directory:
   \`\`\`bash
   cd backend
   \`\`\`
2. Install the necessary lightweight dependencies (\`express\`, \`cors\`):
   \`\`\`bash
   npm install
   \`\`\`
3. Boot the standalone server:
   \`\`\`bash
   npm start
   \`\`\`
   *Note: This starts an independent Express instance on port **\`3001\`** (\`http://localhost:3001\`).*

---

### 🌐 Part 2: Booting the Frontend (Vanilla HTML/JS)
The isolated client is constructed purely with native web APIs (\`fetch\`, modern Tailwind CDN integration) under \`/frontend\`.

1. Open \`/frontend/app.js\` and verify that \`API_BASE\` points directly to your independent Express backend instance:
   \`\`\`javascript
   const API_BASE = "http://localhost:3001";
   \`\`\`
2. Because of CORS security constraints in local filesystems, **opening \`index.html\` by double-clicking it directly might trigger browser blocks** when running fetch requests.
3. Instead, run a lightweight HTTP server in the frontend directory to serve the file:
   \`\`\`bash
   cd frontend
   
   # Use npx to spin up a quick, zero-config server
   npx serve .
   \`\`\`
4. Access the server in your browser (typically \`http://localhost:3000\` or the port displayed on screen).

---

## ⚠️ Troubleshooting Tips

### 🚫 CORS Errors
- **Symptom:** Logs in browser DevTools show: *"Access to fetch at ... has been blocked by CORS policy..."*
- **Solution:** Verify that the \`cors\` package is successfully loaded and used in \`backend/server.js\`. In production, remember to change \`origin: '*'\` to your specific frontend URL domain to maintain network isolation security!

### 🔒 Port Occupation Conflics
- **Symptom:** Server crashes immediately on boot with \`Error: listen EADDRINUSE: address already in use :::3000\`.
- **Solution:** Another program is using port 3000. You can change the target environment variable dynamically when booting:
  \`\`\`bash
  PORT=3002 npm run dev
  \`\`\`
`
  },
  {
    name: "PROJECT_TUTORIAL.md",
    path: "backend/PROJECT_TUTORIAL.md",
    language: "markdown",
    content: `# Project Tutorial: Core RESTful API Engineering Concepts

Welcome to the **Full-Stack API Cookbook Tutorial**! This project serves as a modular sandbox designed to teach you the foundational pillars of modern web developer interactions. 

Below is an elegant, step-by-step breakdown of key web transmission concepts, including how they are designed, implemented on backends, and handled on frontends.

---

## 🍳 Concept 1: HTTP Methods (CRUD Operations)
**CRUD** represents the four fundamental operations of persistent storage: Create, Read, Update, and Delete. REST (Representational State Transfer) architectures map these database verbs directly to standard HTTP methods.

| Operation | HTTP Method | Database Event | REST Endpoint | Success Code |
| :--- | :--- | :--- | :--- | :--- |
| **Create**| \`POST\` | \`INSERT\` | \`/api/items\` | \`201 Created\` |
| **Read**  | \`GET\`  | \`SELECT\` | \`/api/items\` | \`200 OK\`      |
| **Update**| \`PUT\`  | \`UPDATE\` | \`/api/items/:id\` | \`200 OK\`  |
| **Delete**| \`DELETE\`| \`DELETE\`| \`/api/items/:id\` | \`200 OK\`  |

### Express Code Snippet:
\`\`\`javascript
// POST creates a new entry on the server
app.post('/api/items', (req, res) => {
  const { name } = req.body;
  const newItem = { id: Date.now(), name };
  database.push(newItem);
  res.status(201).json(newItem); // status code 210 signalizes creation success
});
\`\`\`

---

## 🔬 Concept 2: Request Anatomy
When a client contacts a server, it packs distinct parameters containing parameters that determine route behaviors. Understanding where to place these attributes is essential:

\`\`\`
GET /api/items/1024?fields=name,category HTTP/1.1
Host: api.cookbook.com
Authorization: Bearer <token>
\`\`\`

### 1. Route Path Parameters (\`/api/items/:id\`)
- **What they are:** Hard wildcards embedded directly in the URL structure.
- **When to use:** To locate and target unique, individual records (e.g., matching a Primary Key \`id\` in SQL).
- **In Express:** Accessible via **\`req.params\`**.
  \`\`\`javascript
  // GET /api/items/4092 matches this route definition
  app.get('/api/items/:id', (req, res) => {
    const targetId = req.params.id; // Target value is extracts as "4092"
  });
  \`\`\`

### 2. Query String Parameters (\`?search=term&limit=10\`)
- **What they are:** Key-value pairs separated by \`&\` tags appended to the URL after a \`?\` delimiter.
- **When to use:** To filter, paginate, sort, or search collections of data.
- **In Express:** Accessible via **\`req.query\`**.
  \`\`\`javascript
  // GET /api/items?search=Async matches this
  app.get('/api/items', (req, res) => {
    const searchToken = req.query.search; // Target value extracts as "Async"
  });
  \`\`\`

### 3. JSON Payload Body
- **What it is:** The active body payload sent inside \`POST\` or \`PUT\` requests, usually serialized as native JSON objects.
- **When to use:** To transfer complex, nested data records safely.
- **In Express:** REQUIRES \`app.use(express.json())\` middleware first, then accessible via **\`req.body\`**.

---

## 🏷️ Concept 3: HTTP Status Codes
HTTP status codes are standard numerical codes returned by a server indicating whether an HTTP request was successfully completed.

### 🟢 2xx: Success
- **\`200 OK\`** - The standard, default response for successful operations.
- **\`201 Created\`** - Returned when a transaction successfully inserts a brand new resource.

### 🟡 4xx: Client Failures
- **\`400 Bad Request\`** - The request input structure failed validation checks (e.g., missing required fields).
- **\`401 Unauthorized\`** - The action requires authentication keys, or the active bearer token has expired/failed validation.
- **\`404 Not Found\`** - The specified URL pathway or unique record identity was not found in database records.

### 🔴 5xx: Server Failures
- **\`500 Internal Server Error\`** - An unhandled error occurred in the server-side controller codebase (e.g., database connection crashes, division by zero, null pointer reference).

---

## 🛡️ Concept 4: CORS (Cross-Origin Resource Sharing)
CORS is an essential browser-enforced security mechanism designed to prevent malicious websites from reading sensitive browser resources belonging to a third-party domain.

### 📍 The origin equation:
An "Origin" is composed of: **Scheme + Host + Port**
- \`http://localhost:3000\` is **mismatched** with \`http://localhost:3001\` (different port!).
- \`https://my-app.com\` is **mismatched** with \`http://my-app.com\` (different scheme!).

### ⚙️ The Preflight Handshake (\`OPTIONS\`)
Before sending write payloads (\`POST\`/\`PUT\`/\`DELETE\`), the client browser sends a quick preflight check using the **\`OPTIONS\`** method. The server must reply with headers establishing consent:
- \`Access-Control-Allow-Origin: *\` or specific matched origin.
- \`Access-Control-Allow-Methods: GET, POST, PUT, DELETE\`.

### In Express:
\`\`\`javascript
const cors = require('cors');

// Enable standard preflight mapping for all CORS requests
app.use(cors({
  origin: 'https://allowed-trusted-frontend.com',
  methods: ['GET', 'POST']
}));
\`\`\`

---

## 🔑 Concept 5: Bearer Token Authentication (Authorization Headers)
Bearer authentication (also called token-based authentication) is an HTTP authentication scheme that involves security tokens called Bearer tokens.

### 🔄 The Standard Lifecycle Sequence:
1. **The Client Logs In:** Sends credit elements in a payload body to \`/api/login\` via \`POST\`.
2. **The Server Validates:** Checks credentials against encryption. If accurate, it signs a stateless JWT token.
3. **The Token Returns:** A JSON response of \`{ token: "..." }\` is saved client-side (e.g., in \`localStorage\`).
4. **Subsequent Header Authorization:** For every subsequent request to protected resources, the frontend serializes the token into the standard request header:
   \`\`\`http
   Authorization: Bearer api_cookbook_super_secret_session_token_123456
   \`\`\`
5. **The Guard Middleware:** The server intercepts headers, slices out the bearer key, decodes it, and yields access if verified!
`
  }
];
