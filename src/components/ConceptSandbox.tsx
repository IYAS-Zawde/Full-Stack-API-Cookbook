import React, { useState, useEffect } from 'react';
import { InventoryItem, LogEntry } from '../types';
import { Globe, ShieldAlert, Key, HelpCircle, ArrowRight, Settings, Plus, Check, RefreshCw } from 'lucide-react';

interface ConceptSandboxProps {
  onAddLog: (log: LogEntry) => void;
  apiBase: string;
}

export const ConceptSandbox: React.FC<ConceptSandboxProps> = ({ onAddLog, apiBase }) => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number>(1);
  
  // POST Item state
  const [postName, setPostName] = useState<string>('');
  const [postCategory, setPostCategory] = useState<string>('Backend');
  const [postDifficulty, setPostDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">('Beginner');

  // PUT Item state
  const [putName, setPutName] = useState<string>('');
  const [putCategory, setPutCategory] = useState<string>('');
  const [putDifficulty, setPutDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">('Beginner');

  // Request Anatomy state
  const [querySearch, setQuerySearch] = useState<string>('');
  const [pathParamId, setPathParamId] = useState<string>('');

  // Credentials Security stores
  const [username, setUsername] = useState<string>('senior_engineer');
  const [password, setPassword] = useState<string>('password123');
  const [activeToken, setActiveToken] = useState<string | null>(localStorage.getItem("token_sandbox"));

  // Trigger loading database entries
  const fetchItemsList = async (isSilent = false) => {
    const startTime = performance.now();
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (activeToken) {
        headers['Authorization'] = `Bearer ${activeToken}`;
      }

      const res = await fetch(`${apiBase}/api/items`);
      const payload = await res.json();
      const latency = Math.round(performance.now() - startTime);

      if (res.ok && payload.data) {
        setItems(payload.data);
      }

      if (!isSilent) {
        onAddLog({
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          method: 'GET',
          url: `${apiBase}/api/items`,
          status: res.status,
          title: "Read Resource List (GET)",
          sub: "Fetches collection arrays. Node backend delivers standard live in-memory inventory details.",
          headers,
          resBody: payload,
          latency
        });
      }
    } catch (e: any) {
      onAddLog({
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        method: 'GET',
        url: `${apiBase}/api/items`,
        status: "CORS_ERR",
        title: "GET Request Failed (CORS/Network)",
        sub: `Standard security protocols blocked browser response mapping: "${e.message}"`,
        headers: { 'Content-Type': 'application/json' },
        resBody: { error: e.toString() },
        isError: true
      });
    }
  };

  useEffect(() => {
    fetchItemsList(true);
  }, []);

  // Sync token to local storage
  const saveSandboxToken = (tok: string | null) => {
    setActiveToken(tok);
    if (tok) {
      localStorage.setItem("token_sandbox", tok);
    } else {
      localStorage.removeItem("token_sandbox");
    }
  };

  // Perform standalone actions wrapper
  const requestWrapper = async (
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    options: { title: string; sub: string; body?: any; customHeaders?: Record<string, string> }
  ) => {
    const url = `${apiBase}${endpoint}`;
    const startTime = performance.now();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.customHeaders
    };

    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      const latency = Math.round(performance.now() - startTime);
      let data;
      const cType = response.headers.get('content-type');
      if (cType && cType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { text: await response.text() };
      }

      onAddLog({
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        method,
        url,
        status: response.status,
        title: options.title,
        sub: options.sub,
        headers,
        reqBody: options.body,
        resBody: data,
        latency
      });

      return { ok: response.ok, status: response.status, data };
    } catch (error: any) {
      const latency = Math.round(performance.now() - startTime);
      onAddLog({
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        method,
        url,
        status: "BLOCKED",
        title: `${method} Connection Blocked`,
        sub: `CORS boundaries or broken pathways intervened standard networking: "${error.message}"`,
        headers,
        reqBody: options.body,
        resBody: { error: error.toString() },
        latency,
        isError: true
      });
      return { ok: false, status: 0, data: { error: error.message } };
    }
  };

  // Concept 1 Handlers: GET SINGLE, POST, PUT, DELETE
  const handleGetSingle = async () => {
    await requestWrapper('GET', `/api/items/${selectedItemId}`, {
      title: "Query Single Item Details (GET /id)",
      sub: "Extracts an individual data item mapping to the specify ID path variable."
    });
  };

  const handlePostItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postName.trim()) return;

    const payload = { name: postName, category: postCategory, difficulty: postDifficulty };
    const res = await requestWrapper('POST', '/api/items', {
      body: payload,
      title: "Create Resource Item (POST)",
      sub: "Package body elements into outbound JSON templates. Node serializes it into primary lists."
    });

    if (res.ok) {
      setPostName('');
      fetchItemsList(true);
    }
  };

  const handlePutItem = async () => {
    const payload = {
      name: putName || `Updated Version ${Math.floor(Math.random() * 100)}`,
      category: putCategory || 'Cloud Technologies',
      difficulty: putDifficulty
    };

    const res = await requestWrapper('PUT', `/api/items/${selectedItemId}`, {
      body: payload,
      title: "Replace / Update properties (PUT)",
      sub: "Entirely swaps parameters aligning with selected ID references."
    });

    if (res.ok) {
      setPutName('');
      setPutCategory('');
      fetchItemsList(true);
    }
  };

  const handleDeleteItem = async () => {
    const res = await requestWrapper('DELETE', `/api/items/${selectedItemId}`, {
      title: "Remove Resource (DELETE)",
      sub: "Emits state deletion prompts. Node ejects corresponding arrays index structures."
    });

    if (res.ok) {
      fetchItemsList(true);
    }
  };

  // Concept 2 Handlers: Query strings search
  const handleQuerySearch = async () => {
    const endpoint = querySearch.trim() 
      ? `/api/items?search=${encodeURIComponent(querySearch)}` 
      : '/api/items';

    await requestWrapper('GET', endpoint, {
      title: "Query Parameters Search",
      sub: `Appends custom parameters filters after the routing delimiter: "?search=${querySearch}"`
    });
  };

  const handlePathParamSearch = async () => {
    if (!pathParamId.trim()) return;
    await requestWrapper('GET', `/api/items/${pathParamId}`, {
      title: "Direct Path Routing Check",
      sub: `/api/items/${pathParamId} represents hierarchical routing address definitions mapping IDs.`
    });
  };

  // Concept 3 STATUS CODES Playground
  const handleTriggerStatus = async (code: number) => {
    await requestWrapper('GET', `/api/status-demo/${code}`, {
      title: `Response Code Simulator: HTTP ${code}`,
      sub: "Observes corresponding browser exceptions after hitting explicit server header values."
    });
  };

  // Concept 4 CORS controls
  const handleCorsSuccess = async () => {
    await requestWrapper('GET', '/api/items', {
      title: "CORS Success Pipeline",
      sub: "Standard request with origin alignment, verifying active response header permissions."
    });
  };

  const handleCorsFailSim = () => {
    onAddLog({
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString(),
      method: "GET",
      url: "http://localhost:9999/api/blocked-resource-path",
      status: "BLOCKED",
      title: "CORS Preflight Interruption Simulation",
      sub: "Simulating access to a restricted backend domain. Modern browsers block readability if standard matching 'Access-Control-Allow-Origin' matches are absent.",
      headers: { 'Content-Type': 'application/json' },
      resBody: { 
        error: "TypeError: Failed to fetch", 
        detail: "The cross-origin request was blocked because the CORS security header from the target server was missing or mismatched."
      },
      isError: true
    });
  };

  // Concept 5 AUTH CREDENTIALS
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { username, password };
    
    const res = await requestWrapper('POST', '/api/login', {
      body: payload,
      title: "Credential Authorization Handshake (POST)",
      sub: "Submits username/password hashes seeking live session allocation. The server issues our Authorization signature."
    });

    if (res.ok && res.data && res.data.token) {
      saveSandboxToken(res.data.token);
    }
  };

  const handleAccessProtected = async () => {
    await requestWrapper('GET', '/api/protected', {
      title: "Protected Endpoint Probe",
      sub: "Probes authorization constraints. Securely forwards Bearer Tokens within request headers."
    });
  };

  const handleLogout = () => {
    saveSandboxToken(null);
    onAddLog({
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString(),
      method: "RESET",
      url: "/api/logout",
      status: "OK",
      title: "Developer Credentials Flushed",
      sub: "Flashes and empties session Bearer signatures locally.",
      headers: {},
      resBody: { message: "Credentials erased from sandbox storage." }
    });
  };

  // Helper mapping info segments
  const conceptTabs = [
    { id: 1, label: "1. HTTP Methods" },
    { id: 2, label: "2. Request Anatomy" },
    { id: 3, label: "3. Status Codes" },
    { id: 4, label: "4. CORS Rules" },
    { id: 5, label: "5. Bearer Auth" }
  ];

  return (
    <div id="sandbox-card-wrapper" className="bg-white border border-slate-200 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition flex flex-col gap-6">
      
      {/* Concept select tabs line navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-3 flex-wrap">
        {conceptTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer select-none ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'text-slate-550 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabs panels render */}
      <div id="active-sandbox-panel" className="min-h-[300px]">
        {/* CONCEPT 1: REST METHODS */}
        {activeTab === 1 && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600">REST resource operations simulator</span>
              <h4 className="text-md font-bold font-display text-slate-900">Concept 1: HTTP Methods CRUD (Create, Read, Update, Delete)</h4>
              <p className="text-xs text-slate-500 leading-normal">
                HTTP methods map semantic protocols (GET, POST, PUT, DELETE) to database transactions in standard REST conventions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* CRUD Left pane: fetch list and create items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Resource Inventory (GET)</span>
                  <button
                    onClick={() => fetchItemsList()}
                    className="p-1 px-2.5 rounded-lg text-[10px] uppercase font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1.5 transition active:scale-95 duration-150 cursor-pointer"
                  >
                    <RefreshCw size={10} className="text-blue-500" /> Fetch Items
                  </button>
                </div>

                {/* Insertion Forms */}
                <form onSubmit={handlePostItem} className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-3 shadow-inner">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600">INSERT RESOURCE (POST)</span>
                  
                  <div className="space-y-2">
                    <input
                      required
                      type="text"
                      placeholder="Item Name (e.g. Redux Advanced)"
                      value={postName}
                      onChange={(e) => setPostName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        required
                        type="text"
                        placeholder="Category (e.g., UI)"
                        value={postCategory}
                        onChange={(e) => setPostCategory(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <select
                        value={postDifficulty}
                        onChange={(e: any) => setPostDifficulty(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-655 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus size={14} /> POST /api/items
                  </button>
                </form>
              </div>

              {/* CRUD Right pane: replace or delete records */}
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Modify Existing items (PUT / DELETE)</span>
                
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-4 shadow-inner">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Select Target Primary Key (ID)</label>
                    <div className="flex gap-2">
                      <select
                        value={selectedItemId}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setSelectedItemId(val);
                          const matched = items.find(i => i.id === val);
                          if (matched) {
                            setPutName(matched.name);
                            setPutCategory(matched.category);
                            setPutDifficulty(matched.difficulty);
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                      >
                        {items.length === 0 ? (
                          <option value="1">ID: 1 - Node.js Basics</option>
                        ) : (
                          items.map(i => (
                             <option key={i.id} value={i.id}>
                               ID: {i.id} - {i.name}
                             </option>
                          ))
                        )}
                      </select>
                      <button
                        onClick={handleGetSingle}
                        className="px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        GET BY ID
                      </button>
                    </div>
                  </div>

                  {/* Mutate items details Form elements */}
                  <div className="space-y-2 pt-3 border-t border-slate-200 font-sans">
                    <span className="text-[10px] uppercase font-bold text-amber-600 block">Replace Selected Item (PUT)</span>
                    <input
                      type="text"
                      placeholder="Updated Item Name"
                      value={putName}
                      onChange={(e) => setPutName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Updated Category"
                        value={putCategory}
                        onChange={(e) => setPutCategory(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <select
                        value={putDifficulty}
                        onChange={(e: any) => setPutDifficulty(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={handlePutItem}
                        className="py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg text-xs transition duration-150 cursor-pointer shadow-sm"
                      >
                        PUT Update
                      </button>
                      <button
                        onClick={handleDeleteItem}
                        className="py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg text-xs transition duration-150 cursor-pointer shadow-sm"
                      >
                        DELETE Destroy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONCEPT 2: REQUEST ANATOMY */}
        {activeTab === 2 && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600">Dissecting request configurations</span>
              <h4 className="text-md font-bold font-display text-slate-900">Concept 2: Query Strings vs Route Path Parameters</h4>
              <p className="text-xs text-slate-500 leading-normal">
                Backends decodes client credentials from different parameters of a request depending on intent. Search keywords are passed in query strings; specific, resource identifiers are mapped in URL paths.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Query Strings */}
              <div className="bg-slate-50 p-5 border border-slate-200 rounded-lg flex flex-col justify-between gap-4 shadow-sm">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 border border-blue-105 px-2.5 py-1 rounded-md inline-block">
                    Query Parameters (?search=...)
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans mt-2">
                    Appends dynamic search variables after a <code className="text-blue-600 font-bold">?</code> delimiter mapping filters inside <code className="text-slate-800 font-mono bg-slate-100 px-1 rounded">req.query</code> on Express servers.
                  </p>
                </div>
                
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <input
                    type="text"
                    placeholder="Search Keyword (e.g. Async)"
                    value={querySearch}
                    onChange={(e) => setQuerySearch(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 text-slate-805"
                  />
                  <button
                    onClick={handleQuerySearch}
                    className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition duration-100 cursor-pointer"
                  >
                    GET with Query String
                  </button>
                </div>
              </div>

              {/* Path parameters */}
              <div className="bg-slate-50 p-5 border border-slate-200 rounded-lg flex flex-col justify-between gap-4 shadow-sm">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 border border-amber-105 px-2.5 py-1 rounded-md inline-block">
                    Path Parameters (/:id)
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans mt-2">
                    Express extracts values inside the hierarchy path wildcard positions and exposes them inside <code className="text-slate-800 font-mono bg-slate-100 px-1 rounded">req.params</code> objects.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <input
                    type="text"
                    placeholder="Target Item raw route ID (e.g., 2)"
                    value={pathParamId}
                    onChange={(e) => setPathParamId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 text-slate-805"
                  />
                  <button
                    onClick={handlePathParamSearch}
                    className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition duration-100 cursor-pointer"
                  >
                    GET with Path Param
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONCEPT 3: STATUS CODES */}
        {activeTab === 3 && (
          <div className="space-y-5 animate-fade-in text-slate-800">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 font-sans">HTTP response headers codes</span>
              <h4 className="text-md font-bold font-display text-slate-900">Concept 3: Simulating HTTP Response Codes standard</h4>
              <p className="text-xs text-slate-500">
                HTTP Codes are standard categorical integers returning signals conveying operational completions or failures.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => handleTriggerStatus(200)}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition flex flex-col items-center gap-1 hover:border-slate-300 text-center cursor-pointer shadow-sm"
              >
                <code className="text-emerald-600 font-bold text-sm">200 OK</code>
                <span className="text-[10px] text-slate-500 font-sans">Read / Update successes</span>
              </button>
              <button
                onClick={() => handleTriggerStatus(201)}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition flex flex-col items-center gap-1 hover:border-slate-300 text-center cursor-pointer shadow-sm"
              >
                <code className="text-emerald-600 font-bold text-sm">201 Created</code>
                <span className="text-[10px] text-slate-500 font-sans">Successful Insertion</span>
              </button>
              <button
                onClick={() => handleTriggerStatus(400)}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition flex flex-col items-center gap-1 hover:border-slate-300 text-center cursor-pointer shadow-sm"
              >
                <code className="text-amber-500 font-bold text-sm">400 Bad Req</code>
                <span className="text-[10px] text-slate-500 font-sans">Validation exception error</span>
              </button>
              <button
                onClick={() => handleTriggerStatus(401)}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition flex flex-col items-center gap-1 hover:border-slate-300 text-center cursor-pointer shadow-sm"
              >
                <code className="text-amber-600 font-bold text-sm">401 Unauth</code>
                <span className="text-[10px] text-slate-500 font-sans">Session credential required</span>
              </button>
              <button
                onClick={() => handleTriggerStatus(404)}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition flex flex-col items-center gap-1 hover:border-slate-300 text-center cursor-pointer shadow-sm"
              >
                <code className="text-rose-500 font-bold text-sm">404 Absent</code>
                <span className="text-[10px] text-slate-500 font-sans">Target path does not exist</span>
              </button>
              <button
                onClick={() => handleTriggerStatus(500)}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition flex flex-col items-center gap-1 hover:border-slate-300 text-center cursor-pointer shadow-sm"
              >
                <code className="text-rose-600 font-bold text-sm">500 Server Err</code>
                <span className="text-[10px] text-slate-500 font-sans">Uncaptured internal failure</span>
              </button>
            </div>
          </div>
        )}

        {/* CONCEPT 4: CORS */}
        {activeTab === 4 && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600">Understanding sandbox security limits</span>
              <h4 className="text-md font-bold font-display text-slate-900">Concept 4: CORS (Cross-Origin Resource Sharing) Controls</h4>
              <p className="text-xs text-slate-500 leading-normal font-sans">
                Security systems block browser visibility when calling APIs located outside of matched domains without standard <code className="text-blue-600 font-mono bg-slate-100 px-1 rounded">Access-Control-Allow-Origin</code> backend handshakes.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-4 pt-4 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-display">
                    <Globe size={14} className="text-blue-500" />
                    Trigger CORS security simulators
                  </h5>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                    Observe how modern clients handle mismatched backend secure domains.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCorsSuccess}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition active:scale-95 duration-100 shadow-sm cursor-pointer"
                  >
                    Match Domain Origin
                  </button>
                  <button
                    onClick={handleCorsFailSim}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition active:scale-95 duration-100 shadow-sm cursor-pointer"
                  >
                    Mismatched Origin Err
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-550 border-l-2 border-blue-500 pl-3 leading-relaxed font-sans bg-white p-2.5 rounded border border-slate-100 shadow-sm">
                <span className="font-bold text-slate-805">Observation Check:</span> A blocked CORS request will often complete on the server, but the browser blocks JavaScript from reading the response body. Look at the console sidebar logs to see the preflight details.
              </div>
            </div>
          </div>
        )}

        {/* CONCEPT 5: BEARER AUTH */}
        {activeTab === 5 && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-blue-605 font-mono">Securing routes via Token headers</span>
              <h4 className="text-md font-bold font-display text-slate-900">Concept 5: Mock Authentication Login & Guard Protected Routings</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Clients request bearer authorization signatures on <code className="text-blue-600 font-mono">POST /api/login</code>. Future calls must serialize the tokens into HTTP headers: <code className="text-blue-600 font-mono">Authorization: Bearer &lt;token&gt;</code>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              {/* Login cred Form */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Step 1: Authenticate to gather Token</span>
                
                <form onSubmit={handleLogin} className="bg-slate-50 p-4 border border-slate-205 rounded-lg space-y-3 font-sans shadow-sm">
                  <div className="space-y-1">
                    <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-bold">Username</label>
                    <input
                      required
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 text-slate-850 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-bold">Password</label>
                    <input
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition shadow-sm cursor-pointer"
                  >
                    Submit credentials payload /login
                  </button>
                </form>
              </div>

              {/* Guard verification calls */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Step 2: Authenticated Access Routing Probe</span>
                
                <div className="bg-slate-50 p-4 border border-slate-205 rounded-lg space-y-3 h-[154px] flex flex-col justify-between shadow-sm">
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Query routes guarded with security protocols. Access blocks if bearer token mapping authentication header is omitted.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
                    <button
                      onClick={handleAccessProtected}
                      className="py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition cursor-pointer shadow-sm"
                    >
                      Access guarded route
                    </button>
                    <button
                      onClick={handleLogout}
                      className="py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition cursor-pointer shadow-xs"
                    >
                      Delete Saved token
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
