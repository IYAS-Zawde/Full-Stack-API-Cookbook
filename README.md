# Project Tutorial: Core RESTful API Engineering Concepts

Welcome to the **Full-Stack API Cookbook Tutorial**! This project serves as a modular sandbox designed to teach you the foundational pillars of modern web developer interactions. 

Below is an elegant, step-by-step breakdown of key web transmission concepts, including how they are designed, implemented on backends, and handled on frontends.

---

## 🍳 Concept 1: HTTP Methods (CRUD Operations)
**CRUD** represents the four fundamental operations of persistent storage: Create, Read, Update, and Delete. REST (Representational State Transfer) architectures map these database verbs directly to standard HTTP methods.

| Operation | HTTP Method | Database Event | REST Endpoint | Success Code |
| :--- | :--- | :--- | :--- | :--- |
| **Create** | `POST` | `INSERT` | `/api/items` | `201 Created` |
| **Read** | `GET` | `SELECT` | `/api/items` | `200 OK` |
| **Update** | `PUT` | `UPDATE` | `/api/items/:id` | `200 OK` |
| **Delete** | `DELETE` | `DELETE` | `/api/items/:id` | `200 OK` |

### Express Code Snippet:
```javascript
// POST creates a new entry on the server
app.post('/api/items', (req, res) => {
  const { name } = req.body;
  const newItem = { id: Date.now(), name };
  database.push(newItem);
  res.status(201).json(newItem); // status code 210 signalizes creation success
});
```

---

## 🔬 Concept 2: Request Anatomy
When a client contacts a server, it packs distinct parameters containing parameters that determine route behaviors. Understanding where to place these attributes is essential:

```
GET /api/items/1024?fields=name,category HTTP/1.1
Host: api.cookbook.com
Authorization: Bearer <token>
```

### 1. Route Path Parameters (`/api/items/:id`)
- **What they are:** Hard wildcards embedded directly in the URL structure.
- **When to use:** To locate and target unique, individual records (e.g., matching a Primary Key `id` in SQL).
- **In Express:** Accessible via **`req.params`**.
  ```javascript
  // GET /api/items/4092 matches this route definition
  app.get('/api/items/:id', (req, res) => {
    const targetId = req.params.id; // Target value is extracts as "4092"
  });
  ```

### 2. Query String Parameters (`?search=term&limit=10`)
- **What they are:** Key-value pairs separated by `&` tags appended to the URL after a `?` delimiter.
- **When to use:** To filter, paginate, sort, or search collections of data.
- **In Express:** Accessible via **`req.query`**.
  ```javascript
  // GET /api/items?search=Async matches this
  app.get('/api/items', (req, res) => {
    const searchToken = req.query.search; // Target value extracts as "Async"
  });
  ```

### 3. JSON Payload Body
- **What it is:** The active body payload sent inside `POST` or `PUT` requests, usually serialized as native JSON objects.
- **When to use:** To transfer complex, nested data records safely.
- **In Express:** REQUIRES `app.use(express.json())` middleware first, then accessible via **`req.body`**.

---

## 🏷️ Concept 3: HTTP Status Codes
HTTP status codes are standard numerical codes returned by a server indicating whether an HTTP request was successfully completed.

### 🟢 2xx: Success
- **`200 OK`** - The standard, default response for successful operations.
- **`201 Created`** - Returned when a transaction successfully inserts a brand new resource.

### 🟡 4xx: Client Failures
- **`400 Bad Request`** - The request input structure failed validation checks (e.g., missing required fields).
- **`401 Unauthorized`** - The action requires authentication keys, or the active bearer token has expired/failed validation.
- **`404 Not Found`** - The specified URL pathway or unique record identity was not found in database records.

### 🔴 5xx: Server Failures
- **`500 Internal Server Error`** - An unhandled error occurred in the server-side controller codebase (e.g., database connection crashes, division by zero, null pointer reference).

---

## 🛡️ Concept 4: CORS (Cross-Origin Resource Sharing)
CORS is an essential browser-enforced security mechanism designed to prevent malicious websites from reading sensitive browser resources belonging to a third-party domain.

### 📍 The origin equation:
An "Origin" is composed of: **Scheme + Host + Port**
- `http://localhost:3000` is **mismatched** with `http://localhost:3001` (different port!).
- `https://my-app.com` is **mismatched** with `http://my-app.com` (different scheme!).

### ⚙️ The Preflight Handshake (`OPTIONS`)
Before sending write payloads (`POST`/`PUT`/`DELETE`), the client browser sends a quick preflight check using the **`OPTIONS`** method. The server must reply with headers establishing consent:
- `Access-Control-Allow-Origin: *` or specific matched origin.
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE`.

### In Express:
```javascript
const cors = require('cors');

// Enable standard preflight mapping for all CORS requests
app.use(cors({
  origin: 'https://allowed-trusted-frontend.com',
  methods: ['GET', 'POST']
}));
```

---

## 🔑 Concept 5: Bearer Token Authentication (Authorization Headers)
Bearer authentication (also called token-based authentication) is an HTTP authentication scheme that involves security tokens called Bearer tokens.

### 🔄 The Standard Lifecycle Sequence:
1. **The Client Logs In:** Sends credit elements in a payload body to `/api/login` via `POST`.
2. **The Server Validates:** Checks credentials against encryption. If accurate, it signs a stateless JWT token.
3. **The Token Returns:** A JSON response of `{ token: "..." }` is saved client-side (e.g., in `localStorage`).
4. **Subsequent Header Authorization:** For every subsequent request to protected resources, the frontend serializes the token into the standard request header:
   ```http
   Authorization: Bearer api_cookbook_super_secret_session_token_123456
   ```
5. **The Guard Middleware:** The server intercepts headers, slices out the bearer key, decodes it, and yields access if verified!
