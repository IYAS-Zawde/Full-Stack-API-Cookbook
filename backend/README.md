# Full-Stack API Cookbook - Backend Developer Reference

This directory contains a clean, production-ready Node.js & Express API boilerplate. It isolates and demonstrates key standard server-side design choices required to ace a Senior Full-Stack technical review.

## 🛠️ Core Architectural Concepts Demonstrated

### 1. HTTP Methods (RESTful CRUD)
HTTP Methods indicate the semantic action intended on a remote server resource inventory:
- **`GET /api/items`**: Retrieves all cookbook resource records. Supports query-string search filtering.
- **`GET /api/items/:id`**: Locates and serves a specific cookbook record using path parameters.
- **`POST /api/items`**: Inserts a new resource item by reading the incoming request's body parser payload.
- **`PUT /api/items/:id`**: Replaces the full inventory properties of an existing item by its route ID.
- **`DELETE /api/items/:id`**: Deletes the resource from memory.

### 2. Request Anatomy (Extracting Client Data)
Express server routes show how to cleanly decouple parameters depending on context:
- **Route Params (`req.params`)**: Used for resource IDs (e.g. `/api/items/:id`).
- **Query Strings (`req.query`)**: Used for optional filters, pagination, or search words (e.g. `/api/items?search=async`).
- **JSON Body payloads (`req.body`)**: Used for structurally complex arguments in POST and PUT operations, requiring serialization mapping.
- **Headers (`req.headers`)**: Used for transmission metadata (e.g., content types, authentication payload).

### 3. HTTP Status Codes
HTTP Status Codes are integers conveying the categorical result of an operation. Our routes explicitly return:
- **`200 OK`**: General success. Return with fetched values or basic updates.
- **`210 Created` (or standard `201 Created`)**: Successful resource storage.
- **`400 Bad Request`**: Malformed incoming strings, validation rules exceptions, or data typing errors.
- **`401 Unauthorized`**: Mission-critical paths lack valid or active session identifiers.
- **`404 Not Found`**: Request paths or database primary keys do not match current registers.
- **`500 Internal Error`**: Uncaptured program exceptions or database outages.

### 4. CORS Configuration
CORS (Cross-Origin Resource Sharing) protects client browsers from executing malicious code loaded from another domain.
The Express app configures the `cors` middleware to explicitly manage incoming origins:
```javascript
const corsOptions = {
  origin: 'http://localhost:3000', // Allow dev client origin access
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
```

### 5. Bearer Token Auth flow & Guard Middleware
Demonstrates stateful Authorization Headers:
1. Client calls `POST /api/login` with their username/password keys.
2. Server validates credentials and responds with a Mock JWT Token string.
3. Client stores this signature locally.
4. For every subsequent request to `/api/protected`, the client injects the token into standard HTTP headers:
   `Authorization: Bearer <token>`
5. Middleware on the server extracts and authorizes the credential token before routing process logic.

---

## 🚀 How to Run Standalone

1. Navigate to this folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Boot the development system with reload watch:
   ```bash
   npm run start
   ```
