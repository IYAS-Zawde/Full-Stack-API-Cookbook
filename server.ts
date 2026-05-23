/**
 * Full-Stack API Cookbook - Live Application Server (server.ts)
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Mock database structures mimicking backend/server.js
interface Item {
  id: number;
  name: string;
  category: string;
  difficulty: string;
}

let items: Item[] = [
  { id: 1, name: "Node.js Basics", category: "Backend", difficulty: "Beginner" },
  { id: 2, name: "Asynchronous JavaScript", category: "Core", difficulty: "Intermediate" },
  { id: 3, name: "Securing APIs with JWT", category: "Security", difficulty: "Advanced" }
];
let nextId = 4;

const MOCK_JWT_SECRET_TOKEN = "api_cookbook_super_secret_session_token_123456";

function validateToken(authHeader?: string): boolean {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.split(' ')[1];
  return token === MOCK_JWT_SECRET_TOKEN;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 4. CORS Setup
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));

  app.use(express.json());

  // Simple Request Inspector Logs Middleware
  app.use((req, res, next) => {
    console.log(`[API CALL] ${req.method} ${req.path}`);
    next();
  });

  // REST API: GET ALL OR FILTERED (1. HTTP Methods, 2. Request Anatomy)
  app.get('/api/items', (req: Request, res: Response) => {
    const { category, search } = req.query;
    let filteredItems = [...items];

    if (search) {
      const q = String(search).toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(q)
      );
    }

    if (category) {
      const cat = String(category).toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.category.toLowerCase() === cat
      );
    }

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

  // REST API: GET SINGLE ITEM BY ID (2. Path Parameters)
  app.get('/api/items/:id', (req: Request, res: Response) => {
    const itemId = parseInt(req.params.id);
    
    if (isNaN(itemId)) {
      return res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "The requested item identifier must be a valid numerical integer."
      });
    }

    const item = items.find(i => i.id === itemId);

    if (!item) {
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

  // REST API: CREATE NEW ITEM (1. Post Method, 2. JSON Body parsing)
  app.post('/api/items', (req: Request, res: Response) => {
    const { name, category, difficulty } = req.body;

    if (!name || !category || !difficulty) {
      return res.status(400).json({
        success: false,
        error: "Bad Request - Validation Failed",
        message: "Please include all body arguments: 'name', 'category', and 'difficulty'."
      });
    }

    const newItem: Item = {
      id: nextId++,
      name: String(name),
      category: String(category),
      difficulty: String(difficulty)
    };

    items.push(newItem);

    res.status(201).json({
      success: true,
      message: "New item created and stored in memory database.",
      data: newItem
    });
  });

  // REST API: REPLACE/UPDATE (PUT)
  app.put('/api/items/:id', (req: Request, res: Response) => {
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

    items[itemIndex] = {
      id: itemId,
      name: String(name),
      category: String(category),
      difficulty: String(difficulty)
    };

    res.status(200).json({
      success: true,
      message: `Cookbook Item index ID ${itemId} modified successfully.`,
      data: items[itemIndex]
    });
  });

  // REST API: DELETE (DELETE)
  app.delete('/api/items/:id', (req: Request, res: Response) => {
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

    const deletedItem = items.splice(itemIndex, 1)[0];

    res.status(200).json({
      success: true,
      message: `Cookbook Item index ID ${itemId} removed from server inventory.`,
      deletedResource: deletedItem
    });
  });

  // 3. Status Codes Playground Trigger
  app.get('/api/status-demo/:code', (req: Request, res: Response) => {
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

  // 5. Auth Mock Login endpoint
  app.post('/api/login', (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Credentials missing. Pass both 'username' and 'password' in JSON payload body."
      });
    }

    if (username === "senior_engineer" && password === "password123") {
      res.status(200).json({
        success: true,
        message: "Authorization granted! Token issued successfully.",
        user: {
          username: "senior_engineer",
          role: "Developer"
        },
        token: MOCK_JWT_SECRET_TOKEN
      });
    } else {
      res.status(401).json({
        success: false,
        error: "Unauthorized Access",
        message: "Incorrect security credentials username/password. Use 'senior_engineer' & 'password123'."
      });
    }
  });

  // 5. Auth Protected router
  app.get('/api/protected', (req: Request, res: Response) => {
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

  // Serve static files from `/frontend/` directly if hit explicitly!
  // This allows serving the raw vanilla frontend in index.html, index.html can be viewed at /frontend/index.html
  app.use('/raw-frontend', express.static(path.join(process.cwd(), 'frontend')));

  // Setup Vite Dev server middleware or serve built resources
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`========================================================`);
    console.log(`🚀 Live fullstack server sandbox initialized`);
    console.log(`👉 Running on http://localhost:${PORT}`);
    console.log(`========================================================`);
  });
}

startServer();
