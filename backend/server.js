/**
 * Full-Stack API Cookbook - Standalone Backend Server (Express.js)
 * 
 * This file isolates and demonstrates the 5 core API mechanics of a Full-Stack developer portfolio:
 * 1. HTTP Methods (GET, POST, PUT, DELETE for full CRUD on /api/items)
 * 2. Request Anatomy (Route Params vs Query Strings vs JSON Bodies vs Custom Headers)
 * 3. Status Codes (Graceful returning of 200, 201, 400, 401, 404, and 500)
 * 4. CORS Configuration (Allowing/blocking cross-origin calls via Middleware)
 * 5. Token Authentication (Demonstrating mock stateful login & bearer authorization headers)
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001; // Port 3001 for standalone default

// ==========================================
// 4. CORS Configuration (Cross-Origin Resource Sharing)
// ==========================================
// In fullstack development, frontends and backends usually run on different host/port origins 
// (e.g., Frontend on localhost:3000 -> Backend on localhost:3001). 
// By default, modern browsers block cross-origin calls unless authorized by the backend server.
const corsOptions = {
  origin: '*', // In production, restrict this to ['http://localhost:3000', 'https://your-app.com']
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // For older browsers (IE11, smart TVs) compatibility
};

// Enable CORS middleware with options
app.use(cors(corsOptions));

// Enable built-in body parsing middleware to read JSON payloads in req.body
app.use(express.json());

// Logger Middleware to visually print Request Anatomy to the developer console
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Incoming Request Anatomy Details:`);
  console.log(` -> Method:   ${req.method}`);
  console.log(` -> Path:     ${req.path}`);
  console.log(` -> Query:    `, req.query);
  console.log(` -> Params:   `, req.params);
  console.log(` -> Headers:  Content-Type: "${req.headers['content-type']}", Authorization: "${req.headers['authorization'] || 'None'}"`);
  console.log(` -> Body:     `, req.body);
  console.log('---------------------------------------------------------');
  next();
});

// ==========================================
// In-Memory Database (Demo state for HTTP Methods CRUD)
// ==========================================
let items = [
  { id: 1, name: "Node.js Basics", category: "Backend", difficulty: "Beginner" },
  { id: 2, name: "Asynchronous JavaScript", category: "Core", difficulty: "Intermediate" },
  { id: 3, name: "Securing APIs with JWT", category: "Security", difficulty: "Advanced" }
];
let nextId = 4;

// Mock Secret Token key
const MOCK_JWT_SECRET_TOKEN = "api_cookbook_super_secret_session_token_123456";

// Helper function to inspect simple Authorization header
function validateToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.split(' ')[1];
  return token === MOCK_JWT_SECRET_TOKEN;
}


// ==========================================
// 1. HTTP Methods & 2. Request Anatomy (CRUD Endpoints)
// ==========================================

// GET ALL ITEMS (HTTP GET- Read)
// Demonstrates Query Parameters: Allows filtering items via query string (e.g. ?category=Backend)
app.get('/api/items', (req, res) => {
  const { category, search } = req.query;
  let filteredItems = [...items];

  // If a search term is specified via query string: ?search=Asynchronous
  if (search) {
    filteredItems = filteredItems.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  // If a category filter is specified: ?category=Backend
  if (category) {
    filteredItems = filteredItems.filter(item => 
      item.category.toLowerCase() === category.toLowerCase()
    );
  }

  // 3. Status Code: 200 OK (Standard dynamic payload read success)
  res.status(200).json({
    success: true,
    message: "Fetched items list successfully.",
    meta: {
      queryReceived: req.query,
      resultsCount: filteredItems.length
    },
    data: filteredItems
  });
});

// GET SINGLE ITEM BY ID (HTTP GET - Read Item)
// Demonstrates Route Path Parameters: Reading `req.params.id`
app.get('/api/items/:id', (req, res) => {
  const itemId = parseInt(req.params.id);
  
  if (isNaN(itemId)) {
    // 3. Status Code: 400 Bad Request (Invalid parameters format)
    return res.status(400).json({
      success: false,
      error: "Bad Request",
      message: "The requested item identifier must be a valid numerical integer."
    });
  }

  const item = items.find(i => i.id === itemId);

  if (!item) {
    // 3. Status Code: 404 Not Found (Missing Resource)
    return res.status(404).json({
      success: false,
      error: "Not Found",
      message: `No API cookbook item was discovered matching identifier: ID ${itemId}`
    });
  }

  res.status(200).json({
    success: true,
    message: `Discovered details for item ID ${itemId}`,
    data: item
  });
});

// CREATE NEW ITEM (HTTP POST - Create)
// Demonstrates JSON Request Body: Reading `req.body` payload objects
app.post('/api/items', (req, res) => {
  const { name, category, difficulty } = req.body;

  // Validation Check: ensure all necessary keys are present
  if (!name || !category || !difficulty) {
    // 3. Status Code: 400 Bad Request (Validation fails)
    return res.status(400).json({
      success: false,
      error: "Bad Request - Validation Failed",
      message: "Please include all body arguments: 'name', 'category', and 'difficulty'."
    });
  }

  const newItem = {
    id: nextId++,
    name,
    category,
    difficulty
  };

  items.push(newItem);

  // 3. Status Code: 201 Created (Perfect status for successfully inserting/creating resources)
  res.status(201).json({
    success: true,
    message: "New item created and stored in memory database.",
    data: newItem
  });
});

// REPLACE/UPDATE ITEM BY ID (HTTP PUT - Update)
// Demonstrates reading both Path Params AND JSON Body payloads
app.put('/api/items/:id', (req, res) => {
  const itemId = parseInt(req.params.id);
  const { name, category, difficulty } = req.body;

  if (isNaN(itemId)) {
    return res.status(400).json({
      success: false,
      error: "Bad Request",
      message: "Item identifier path parameter must be a numerical integer."
    });
  }

  const itemIndex = items.findIndex(i => i.id === itemId);

  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      error: "Not Found",
      message: `Cannot update resource. ID ${itemId} does not exist.`
    });
  }

  if (!name || !category || !difficulty) {
    return res.status(400).json({
      success: false,
      error: "Bad Request - Validation Failed",
      message: "Required dynamic body arguments missing. Check 'name', 'category', and 'difficulty'."
    });
  }

  // Update in state
  items[itemIndex] = {
    id: itemId,
    name,
    category,
    difficulty
  };

  // 3. Status Code: 200 OK (Standard success return with updated payload)
  res.status(200).json({
    success: true,
    message: `Cookbook Item index ID ${itemId} modified successfully.`,
    data: items[itemIndex]
  });
});

// DELETE ITEM BY ID (HTTP DELETE - Destroy)
// Demonstrates deleting standard resource elements
app.delete('/api/items/:id', (req, res) => {
  const itemId = parseInt(req.params.id);

  if (isNaN(itemId)) {
    return res.status(400).json({
      success: false,
      error: "Bad Request",
      message: "Invalid item ID provided in path parameters."
    });
  }

  const itemIndex = items.findIndex(i => i.id === itemId);

  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      error: "Not Found",
      message: `Failed to delete. Item with ID ${itemId} not found.`
    });
  }

  // Slice item from our list array
  const deletedItem = items.splice(itemIndex, 1)[0];

  res.status(200).json({
    success: true,
    message: `Cookbook Item index ID ${itemId} removed from server inventory.`,
    deletedResource: deletedItem
  });
});


// ==========================================
// 3. Status Codes Playground Trigger
// ==========================================
// A custom path designed to easily trigger various visual response codes
app.get('/api/status-demo/:code', (req, res) => {
  const mockCode = parseInt(req.params.code);

  switch (mockCode) {
    case 200:
      return res.status(200).json({ status: 200, success: true, message: "OK: The request succeeded. Typical response status for GET and PUT queries." });
    case 201:
      return res.status(201).json({ status: 201, success: true, message: "Created: Resource saved. Standard for POST requests creating databases elements." });
    case 400:
      return res.status(400).json({ status: 400, success: false, error: "Bad Request", message: "Client is sending unvalidated/scrambled dynamic formatting structure." });
    case 401:
      return res.status(401).json({ status: 401, success: false, error: "Unauthorized", message: "Client session needs authorization. Verify correct Bearer token header is appended." });
    case 404:
      return res.status(404).json({ status: 404, success: false, error: "Not Found", message: "Requested virtual path or resource does not exist on this backend." });
    case 500:
      return res.status(500).json({ status: 500, success: false, error: "Internal Server Error", message: "Crash event simulated on backend files. Unhandled node exception triggered." });
    default:
      return res.status(418).json({ status: 418, success: false, message: "I'm a teapot. Custom simulated error state requested." });
  }
});


// ==========================================
// 5. Authentication & JWT Bearer Token Header Demo
// ==========================================

// Mock user store
const MOCK_USER = {
  username: "senior_engineer",
  password: "password123"
};

// LOGIN ROUTE (HTTP POST - Returns a auth token)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Credentials missing. Pass both 'username' and 'password' in JSON payload body."
    });
  }

  // Perform mock verification
  if (username === MOCK_USER.username && password === MOCK_USER.password) {
    // Standard successful authorization
    res.status(200).json({
      success: true,
      message: "Authorization granted! Token issued successfully.",
      user: {
        username: MOCK_USER.username,
        role: "Developer"
      },
      token: MOCK_JWT_SECRET_TOKEN // Return mock Bearer session credentials
    });
  } else {
    // Authorization Denied
    res.status(401).json({
      success: false,
      error: "Unauthorized Access",
      message: "Incorrect security credentials username/password. Use 'senior_engineer' & 'password123'."
    });
  }
});

// PROTECTED PATH (Requires Bearer authorization token header)
app.get('/api/protected', (req, res) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
      message: "Access blocked. Missing necessary Bearer token inside 'Authorization' request header."
    });
  }

  const isAuthorized = validateToken(authHeader);

  if (!isAuthorized) {
    return res.status(401).json({
      success: false,
      error: "Invalid Credentials Token",
      message: "Access blocked. Bearer token in 'Authorization' header is incorrect, expired, or malformed."
    });
  }

  // Deliver highly confidential project design metrics
  res.status(200).json({
    success: true,
    message: "Access verified through Bearer JWT. Developer session live.",
    classifiedData: {
      teamName: "Senior Engineering Staff",
      currentProject: "Full-Stack API Cookbook Portfolio",
      codename: "Project Chef",
      serverLoadPercent: 12.8,
      secretsCount: 42
    }
  });
});

// Start the express cluster
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Standalone Portfolio API Cookbook Active!`);
  console.log(`📢 Backend is bound and listening on http://localhost:${PORT}`);
  console.log(`====================================================`);
});
