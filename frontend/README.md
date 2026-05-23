# Full-Stack API Cookbook - Frontend Developer Reference

This directory contains a clean, modern, single-page client interface built using vanilla HTML5, asynchronous JavaScript (`fetch`), and responsive CSS styles. It demonstrates standard API integration patterns without the complexity of frontend frameworks like React or Vue.

## 💻 Technical Capabilities Isolated & Demonstrated

### 1. Modern Async Fetch
Standard client requests utilize modern `async/await` syntax instead of old `XMLHttpRequest` loops:
```javascript
const response = await fetch('/api/items', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});
const result = await response.json();
```

### 2. Request Parameters Formatting
The frontend shows how to compose outbound request parameters of varying context specifications:
- **Path Parameters**: Interpolated directly into standard URL strings (e.g., `` `/api/items/${itemId}` ``).
- **Query Strings**: Appended securely using `encodeURIComponent` to enforce safe escape URL components (e.g., `` `/api/items?search=${encodeURIComponent(keyword)}` ``).
- **JSON Payloads**: Formatted via `JSON.stringify(payload)` combined with appropriate metadata parameters (`Content-Type: application/json`).

### 3. Graceful Status Code Error Checking
Uses modern browser properties like `response.ok` (mapping to status codes in range 200-299) to decide if processing logic should trigger secondary error warnings.

### 4. Stateful Token Auth Handling
- Stores retrieved credentials locally in memory and browser persistence stores `localStorage.setItem(AUTH_TOKEN_KEY, token)`.
- Restores active credentials upon window boot cycles to maintain persistent authenticated connections.
- Automatically injects local tokens into standard `Authorization` headers for protected paths.

---

## 🚀 How to Run Standalone

1. Ensure your backend server is active (defaulting on `http://localhost:3001`).
2. Inside `/frontend/app.js`, verify `API_BASE` points to your backend instance:
   ```javascript
   const API_BASE = "http://localhost:3001";
   ```
3. Boot a simple local web server of your choice!
   - For example using Node's basic serve module:
     ```bash
     npx serve .
     ```
   - Or Python standard libraries:
     ```bash
     python -m http.server 3000
     ```
4. Navigate your matching web browser to `http://localhost:3000` to interact!
