/**
 * Full-Stack API Cookbook - Standalone Vanilla Frontend Controller
 * 
 * This script wires up the interactive dashboard in index.html to communicate with the Node/Express backend.
 * It isolates and explains key front-end mechanics of a modern full-stack web application:
 * 
 * 1. Making fetch() calls using various RESTful HTTP methods.
 * 2. Assembling request URI components (Query Strings and Path Parameters).
 * 3. Checking Response Headers, Parsing JSON Bodies, and Handling Status Codes.
 * 4. Capturing Cors preflight boundaries.
 * 5. Appending state credentials to Headers via 'Bearer <token>' standards.
 */

// ==========================================
// API BASE CONFIGURATION
// ==========================================
// When running in our live AI Studio container, we target the current origin.
// In a local development setup (e.g. backend on port 3001), update this to "http://localhost:3001".
const API_BASE = window.location.origin;

// Local storage key for preserving session tokens
const AUTH_TOKEN_KEY = "api_cookbook_auth_token";

// ==========================================
// STATE MANAGEMENT & DOM SELECTION
// ==========================================
const DOM = {
  // Console logging targets
  consoleLogger: document.getElementById('consoleLogger'),
  btnClearConsole: document.getElementById('btnClearConsole'),
  statCode: document.getElementById('statCode'),
  statLatency: document.getElementById('statLatency'),
  
  // Auth indicators
  authStatus: document.getElementById('authStatus'),
  authIndicator: document.getElementById('authIndicator'),
  authLabel: document.getElementById('authLabel'),
  
  // HTTP Methods sandbox controls
  btnGetItems: document.getElementById('btnGetItems'),
  btnResetItems: document.getElementById('btnResetItems'),
  createForm: document.getElementById('createForm'),
  postName: document.getElementById('postName'),
  postCategory: document.getElementById('postCategory'),
  postDifficulty: document.getElementById('postDifficulty'),
  
  // Modifying targets
  crudTargetId: document.getElementById('crudTargetId'),
  btnGetSingle: document.getElementById('btnGetSingle'),
  putName: document.getElementById('putName'),
  putCategory: document.getElementById('putCategory'),
  putDifficulty: document.getElementById('putDifficulty'),
  btnPutItem: document.getElementById('btnPutItem'),
  btnDeleteItem: document.getElementById('btnDeleteItem'),
  
  // Request Anatomy elements
  querySearch: document.getElementById('querySearch'),
  btnSearchFilter: document.getElementById('btnSearchFilter'),
  pathParamId: document.getElementById('pathParamId'),
  btnPathParam: document.getElementById('btnPathParam'),
  
  // Status Code buttons
  btnStatusCodes: document.querySelectorAll('.btnStatusCode'),
  
  // CORS buttons
  btnCorsSuccess: document.getElementById('btnCorsSuccess'),
  btnCorsFail: document.getElementById('btnCorsFail'),
  
  // Auth panels
  loginForm: document.getElementById('loginForm'),
  loginUsername: document.getElementById('loginUsername'),
  loginPassword: document.getElementById('loginPassword'),
  btnAccessProtected: document.getElementById('btnAccessProtected'),
  btnClearToken: document.getElementById('btnClearToken'),
};

// Initialize active local token
let activeToken = localStorage.getItem(AUTH_TOKEN_KEY) || null;

// ==========================================
// CUSTOM NETWORK CONSOLE LOGGER WORKSPACE
// ==========================================
function clearLogs() {
  DOM.consoleLogger.innerHTML = `
    <div class="text-slate-500 border-b border-slate-900 pb-2">
      <div>&gt; System logs cleared. Active connection path: ${API_BASE}</div>
    </div>
  `;
  DOM.statCode.textContent = "-";
  DOM.statCode.className = "text-slate-400 font-bold text-xs";
  DOM.statLatency.textContent = "-";
}

function printLogSegment({ title, sub, method, url, status, headers, reqBody, resBody, isError = false }) {
  const timestamp = new Date().toLocaleTimeString();
  const cardId = 'log_' + Math.random().toString(36).substr(2, 9);
  
  // Compute color accents based on HTTP success or failures
  let statusColor = "text-emerald-400 border-emerald-500/20 bg-emerald-500/10";
  if (isError || (status && status >= 400)) {
    statusColor = "text-rose-400 border-rose-500/20 bg-rose-500/10";
  } else if (status && status >= 300) {
    statusColor = "text-amber-400 border-amber-500/20 bg-amber-500/10";
  }

  // Formatting Method Pills
  let methodColor = "bg-slate-800 text-slate-300";
  if (method === "GET") methodColor = "bg-sky-500 text-slate-950 font-bold";
  if (method === "POST") methodColor = "bg-emerald-500 text-slate-950 font-bold";
  if (method === "PUT") methodColor = "bg-amber-500 text-slate-950 font-bold";
  if (method === "DELETE") methodColor = "bg-rose-600 text-white font-bold";

  const logHTML = `
    <div id="${cardId}" class="p-4 rounded-xl border border-slate-850 bg-slate-900/40 relative space-y-3 transition group hover:bg-slate-900/60">
      
      <!-- Metadata Line -->
      <div class="flex items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="px-2 py-0.5 rounded text-[9px] uppercase tracking-wide ${methodColor}">${method}</span>
          <span class="text-slate-400 font-bold text-[10px] truncate max-w-[150px] sm:max-w-xs" title="${url}">${url.replace(API_BASE, '')}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-[9px] text-slate-500">${timestamp}</span>
        </div>
      </div>

      <!-- Execution Context Context -->
      <div class="text-xs">
        <span class="text-teal-400 font-semibold font-sans">${title}</span>
        <p class="text-slate-400 text-[10px] mt-0.5 leading-relaxed">${sub}</p>
      </div>

      <!-- Live Payload Anatomy Details Toggle Trigger -->
      <div class="space-y-2 text-[10px]">
        
        <!-- Toggle button to save visual sidebar densities -->
        <button onclick="document.getElementById('${cardId}_specs').classList.toggle('hidden')" class="text-indigo-400 hover:text-indigo-300 font-bold underline select-none cursor-pointer">
          Toggle Full Headers & Payloads
        </button>

        <div id="${cardId}_specs" class="hidden space-y-2 border-t border-slate-800/40 pt-2 animate-fade-in">
          <!-- Request Headers -->
          <div>
            <div class="text-slate-505 font-bold font-sans uppercase">Outbound Request Headers:</div>
            <pre class="bg-slate-950/80 p-2 rounded text-[10px] text-slate-400 overflow-x-auto">${JSON.stringify(headers || {}, null, 2)}</pre>
          </div>

          <!-- Payload Body -->
          ${reqBody ? `
          <div>
            <div class="text-slate-505 font-bold font-sans uppercase">JSON Request Body Payload:</div>
            <pre class="bg-slate-950/80 p-2 rounded text-[10px] text-slate-350 overflow-x-auto">${JSON.stringify(reqBody, null, 2)}</pre>
          </div>` : ''}

          <!-- Response Body -->
          <div>
            <div class="text-slate-505 font-bold font-sans uppercase">API Server Response Body:</div>
            <pre class="bg-slate-950/80 p-2 rounded text-[10px] text-slate-200 overflow-x-auto">${JSON.stringify(resBody || {}, null, 2)}</pre>
          </div>
        </div>

      </div>

      <!-- Status Code Badge -->
      <div class="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/40">
        <span class="text-slate-500 font-bold">HTTP Code:</span>
        <span class="px-2.5 py-0.5 rounded border ${statusColor} font-bold">${status || 'CORS ERR'}</span>
      </div>

    </div>
  `;

  // Prepend log to console
  DOM.consoleLogger.insertAdjacentHTML('afterbegin', logHTML);
}


// ==========================================
// AUTHENTICATION VISUAL REFLECTOR STATE
// ==========================================
function refreshAuthIndicator() {
  if (activeToken) {
    DOM.authIndicator.className = "w-2 h-2 rounded-full bg-teal-400 inline-block ring-4 ring-teal-405/20";
    DOM.authLabel.textContent = "Authorized • Bearer JWT Token loaded";
    DOM.authStatus.className = "flex items-center gap-3 bg-teal-950/30 border border-teal-500/20 rounded-lg px-3 py-1.5 text-xs text-teal-300";
  } else {
    DOM.authIndicator.className = "w-2 h-2 rounded-full bg-rose-500 inline-block";
    DOM.authLabel.textContent = "Unauthenticated • Bearer token missing";
    DOM.authStatus.className = "flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300";
  }
}


// ==========================================
// CORE network FETCH ENGINE (WRAPPER)
// ==========================================
async function performRequest(method, endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const startTime = performance.now();
  
  DOM.statCode.textContent = "WAIT...";
  DOM.statCode.className = "text-slate-400 font-mono text-xs";
  DOM.statLatency.textContent = "...";

  // Build standard custom headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // If client loaded a token locally, pass inside HTTP Authorization headers structure
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }

  // Package body payload
  let bodyPayload = options.body ? JSON.stringify(options.body) : null;

  try {
    const fetchOptions = {
      method,
      headers,
    };
    if (bodyPayload) {
      fetchOptions.body = bodyPayload;
    }

    const response = await fetch(url, fetchOptions);
    const latency = Math.round(performance.now() - startTime);
    DOM.statLatency.textContent = `${latency}ms`;
    
    // Parse response data safely
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { text: await response.text() };
    }

    // Set Dashboard Stats
    DOM.statCode.textContent = response.status;
    if (response.ok) {
      DOM.statCode.className = "text-teal-400 font-bold font-mono text-xs";
    } else {
      DOM.statCode.className = "text-rose-500 font-bold font-mono text-xs";
    }

    // Capture standard payload structures for logging
    printLogSegment({
      title: options.logTitle || `Executed HTTP ${method} Method`,
      sub: options.logSub || `Request dispatched to remote database router API path.`,
      method,
      url,
      status: response.status,
      headers,
      reqBody: options.body,
      resBody: data
    });

    return { ok: response.ok, status: response.status, data };

  } catch (error) {
    const latency = Math.round(performance.now() - startTime);
    DOM.statLatency.textContent = `${latency}ms`;
    DOM.statCode.textContent = "ERR";
    DOM.statCode.className = "text-rose-600 font-bold font-mono text-xs";

    // Trace standard network or CORS error parameters
    printLogSegment({
      title: "Network Connection Timeout / Exception",
      sub: `The request was blocked or dropped. This typically indicates a CORS barrier, network drop, or server offline. Message: "${error.message}"`,
      method,
      url,
      status: 0,
      headers,
      reqBody: options.body,
      resBody: { error: error.toString(), tip: "Check modern console logs or verify network server is running." },
      isError: true
    });

    return { ok: false, status: 0, data: { error: error.message } };
  }
}


// ==========================================
// 1. RESTFUL CRUD INTEGRATIONS (HTTP Methods)
// ==========================================

// GET Items List
async function fetchItems() {
  const result = await performRequest('GET', '/api/items', {
    logTitle: "Read Resource List (GET)",
    logSub: "Retrieves complete repository list arrays. Supports querying structures."
  });

  if (result.ok && result.data && result.data.data) {
    // Populate dropdowns IDs
    updateDropdownIds(result.data.data);
  }
}

// Helper to populate ID dropdown selectors statically
function updateDropdownIds(itemsList) {
  if (!itemsList || !Array.isArray(itemsList)) return;
  DOM.crudTargetId.innerHTML = "";
  itemsList.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = `ID: ${item.id} - ${item.name} (${item.category})`;
    DOM.crudTargetId.appendChild(opt);
  });
}

// GET Single specific item
async function fetchSingleItem() {
  const targetId = DOM.crudTargetId.value;
  if (!targetId) {
    alert("Please seed/fetch the database array list first to identify target items.");
    return;
  }
  
  await performRequest('GET', `/api/items/${targetId}`, {
    logTitle: "Read Single Resource details (GET /id)",
    logSub: "Extracts an individual data item mapping to the specified ID path parameter variable."
  });
}

// POST item
async function handleCreateItem(e) {
  e.preventDefault();
  const body = {
    name: DOM.postName.value.trim(),
    category: DOM.postCategory.value.trim(),
    difficulty: DOM.postDifficulty.value
  };

  const result = await performRequest('POST', '/api/items', {
    body,
    logTitle: "Create Item (POST)",
    logSub: "Sends a JSON object body payload. Express parses it to insert a new inventory record structure."
  });

  if (result.ok) {
    DOM.postName.value = "";
    DOM.postCategory.value = "";
    fetchItems(); // Refetch database array is update
  }
}

// PUT item
async function handleReplaceItem() {
  const targetId = DOM.crudTargetId.value;
  if (!targetId) {
    alert("Select a valid ID first.");
    return;
  }

  const body = {
    name: DOM.putName.value.trim() || `Course Version ${Math.floor(Math.random()*10)}`,
    category: DOM.putCategory.value.trim() || "Development",
    difficulty: DOM.putDifficulty.value
  };

  const result = await performRequest('PUT', `/api/items/${targetId}`, {
    body,
    logTitle: "Update / Replace Resource (PUT)",
    logSub: "Saves updated parameters mapping to the selected target ID path variable."
  });

  if (result.ok) {
    DOM.putName.value = "";
    DOM.putCategory.value = "";
    fetchItems();
  }
}

// DELETE item
async function handleDeleteItem() {
  const targetId = DOM.crudTargetId.value;
  if (!targetId) {
    alert("Select a target item to delete.");
    return;
  }

  const result = await performRequest('DELETE', `/api/items/${targetId}`, {
    logTitle: "Destroy Resource (DELETE)",
    logSub: "Requests deletion of a resource. The backend handles database extraction."
  });

  if (result.ok) {
    fetchItems();
  }
}


// ==========================================
// 2. PARSING REQUEST ANATOMY
// ==========================================

// GET items with Query string search
async function handleSearchQuery() {
  const keyword = DOM.querySearch.value.trim();
  const endpoint = keyword ? `/api/items?search=${encodeURIComponent(keyword)}` : '/api/items';

  await performRequest('GET', endpoint, {
    logTitle: "Query Parameters Extraction",
    logSub: `Dispatched search queries via standard ?search=${keyword} routing extensions.`
  });
}

// GET items via direct Path parameters
async function handlePathParamSearch() {
  const rawId = DOM.pathParamId.value.trim();
  if (!rawId) {
    alert("Enter a specific path parameter ID.");
    return;
  }

  await performRequest('GET', `/api/items/${rawId}`, {
    logTitle: "Path Parameter Anatomy Check",
    logSub: `Query directed to resource matching exactly ID raw pattern matching API path directories.`
  });
}


// ==========================================
// 3. PLAYGROUND STATUS CODES
// ==========================================
async function handleTriggerCode(code) {
  await performRequest('GET', `/api/status-demo/${code}`, {
    logTitle: `Response Status Code Playground: ${code}`,
    logSub: "Observes standard browser response states when receiving various HTTP response headers."
  });
}


// ==========================================
// 4. CORS PREFLIGHT SECURITY TESTS
// ==========================================
async function handleCorsSuccess() {
  // Access standard allowed original path
  await performRequest('GET', '/api/items', {
    logTitle: "Cors Success Pipeline",
    logSub: "Demonstrates standard allowed client requests utilizing appropriate allowed origin headers."
  });
}

async function handleCorsFailureSim() {
  // We trigger a demo showing what happens if CORS headers are missing.
  // To simulate this in our environment, we make a call to an external non-CORS endpoint or simulate it.
  // Let's call a fake endpoint representing a custom blocked CORS scheme or trigger a browser block.
  DOM.statCode.textContent = "CORS_ERR";
  DOM.statCode.className = "text-rose-500 font-mono text-xs font-bold";
  DOM.statLatency.textContent = "0ms";
  
  printLogSegment({
    title: "CORS Browser Block Simulation",
    sub: "Simulating access to http://localhost:9999/api/blocked without CORS headers allowed. Modern browsers catch lack of Access-Control-Allow-Origin: * and halt readable response.",
    method: "GET",
    url: "http://localhost:9999/api/blocked-resource-path",
    status: "BLOCKED",
    headers: { "Content-Type": "application/json" },
    reqBody: null,
    resBody: { 
      error: "TypeError: Failed to fetch", 
      reason: "No 'Access-Control-Allow-Origin' header is present on the requested resource." 
    },
    isError: true
  });
}


// ==========================================
// 5. BEARER AUTH CONTROL FLOWS
// ==========================================
async function handleLogin(e) {
  e.preventDefault();
  const body = {
    username: DOM.loginUsername.value,
    password: DOM.loginPassword.value
  };

  const result = await performRequest('POST', '/api/login', {
    body,
    logTitle: "Exchanging Credentials for JWT (POST /login)",
    logSub: "Verifies matching credentials and response payload distributes authorization Bearer Token."
  });

  if (result.ok && result.data && result.data.token) {
    activeToken = result.data.token;
    localStorage.setItem(AUTH_TOKEN_KEY, activeToken);
    refreshAuthIndicator();
  }
}

async function handleAccessProtected() {
  await performRequest('GET', '/api/protected', {
    logTitle: "Access Protected Resource",
    logSub: "Probe authorization protected parameters checking bearer local storage matches."
  });
}

function handleLogout() {
  activeToken = null;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  refreshAuthIndicator();
  
  // Log event
  printLogSegment({
    title: "Session Terminated (Logout)",
    sub: "Erased bearer connection tokens from localStorage.",
    method: "RESET",
    url: "/api/logout",
    status: "OK",
    headers: {},
    reqBody: null,
    resBody: { message: "Client authentication token state flushed successfully." }
  });
}


// ==========================================
// INITIAL SETUP LISTENERS
// ==========================================
function bindListeners() {
  DOM.btnClearConsole.addEventListener('click', clearLogs);
  
  // CRUD buttons
  DOM.btnGetItems.addEventListener('click', () => fetchItems());
  DOM.btnResetItems.addEventListener('click', () => fetchItems());
  DOM.createForm.addEventListener('submit', handleCreateItem);
  DOM.btnGetSingle.addEventListener('click', fetchSingleItem);
  DOM.btnPutItem.addEventListener('click', handleReplaceItem);
  DOM.btnDeleteItem.addEventListener('click', handleDeleteItem);

  // Anatomy buttons
  DOM.btnSearchFilter.addEventListener('click', handleSearchQuery);
  DOM.btnPathParam.addEventListener('click', handlePathParamSearch);
  
  // Status codes buttons
  DOM.btnStatusCodes.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetCode = btn.getAttribute('data-code');
      handleTriggerCode(targetCode);
    });
  });

  // CORS Simulator buttons
  DOM.btnCorsSuccess.addEventListener('click', handleCorsSuccess);
  DOM.btnCorsFail.addEventListener('click', handleCorsFailureSim);

  // Authorization Form buttons
  DOM.loginForm.addEventListener('submit', handleLogin);
  DOM.btnAccessProtected.addEventListener('click', handleAccessProtected);
  DOM.btnClearToken.addEventListener('click', handleLogout);
}

// Auto boot on load
document.addEventListener('DOMContentLoaded', () => {
  bindListeners();
  refreshAuthIndicator();
  // Fetch lists on start up
  fetchItems();
});
