import { useState } from 'react';
import { ConceptSandbox } from './components/ConceptSandbox';
import { CodeExplorer } from './components/CodeExplorer';
import { ConsoleMonitor } from './components/ConsoleMonitor';
import { LogEntry } from './types';
import { Laptop, Database, Globe, PlayCircle, BookOpen, Check } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'sandbox' | 'explorer'>('sandbox');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const handleAddLog = (newLog: LogEntry) => {
    setLogs(prev => [newLog, ...prev]);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  // Host URL Base setup
  const API_BASE = window.location.origin;

  return (
    <div className="bg-[#f8fafc] text-slate-800 min-h-screen font-sans antialiased selection:bg-blue-500 selection:text-white flex flex-col">
      
      {/* Visual Workspace Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 shadow-[0_1px_3px_rgba(59,130,246,0.1)] text-lg">
              🍳
            </div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-tight text-slate-900 flex items-center gap-2">
                Full-Stack API Cookbook <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono border border-slate-250">STABLE</span>
              </h1>
              <p className="text-xs text-slate-550 font-normal">Standard REST Architectures Sandbox & Portfolio Boilerplate</p>
            </div>
          </div>
          
          {/* Main sandbox vs codebase Explorer navigator */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition select-none cursor-pointer ${
                activeTab === 'sandbox'
                  ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <PlayCircle size={14} className="text-blue-500" />
              Interactive Testbed
            </button>
            <button
              onClick={() => setActiveTab('explorer')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition select-none cursor-pointer ${
                activeTab === 'explorer'
                  ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <BookOpen size={14} className="text-indigo-500" />
              Repository Code Explorer
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        {activeTab === 'sandbox' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sandbox panel controls (8 Columns) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Introduction Card */}
              <section className="bg-white border border-slate-200 p-5 rounded-xl flex items-start gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                <div className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Globe size={18} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold font-display text-slate-900 leading-normal">
                    Real-time Fullstack Endpoints Interaction Simulator
                  </h3>
                  <p className="text-xs text-slate-550 leading-relaxed max-w-4xl font-normal">
                    This playground sends **real** HTTP requests to the active Node.js server mounting on port 3000. Interact with the panels to populate database elements, test anatomies, and inspect corresponding transmission results in the live side terminal!
                  </p>
                </div>
              </section>

              {/* Concept components */}
              <ConceptSandbox onAddLog={handleAddLog} apiBase={API_BASE} />

              {/* Features architecture card */}
              <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-xs pt-2">
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                  <div className="text-blue-600 font-bold tracking-wider uppercase text-[10px]">1. Isolated Modules</div>
                  <p className="text-slate-550 leading-relaxed">
                    Designed with pristine separation, matching standalone `/backend` and `/frontend` specifications exactly.
                  </p>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                  <div className="text-blue-600 font-bold tracking-wider uppercase text-[10px]">2. Clean JSON Bodies</div>
                  <p className="text-slate-555 leading-relaxed font-sans">
                    Demonstrates deep parsing of JSON bodies, query attributes, path segments, and security parameters.
                  </p>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                  <div className="text-blue-600 font-bold tracking-wider uppercase text-[10px]">3. CORS Handshakes</div>
                  <p className="text-slate-555 leading-relaxed">
                    Guides developer configuration requirements to bypass local browser preflight blocking.
                  </p>
                </div>
              </section>

            </div>

            {/* Network transmissions log console (4 Columns) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
              <ConsoleMonitor logs={logs} onClear={handleClearLogs} />
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Explorer Introductions Header */}
            <div className="space-y-2">
              <h2 className="text-lg font-bold font-display text-slate-900"> Boilerplate Code Explorer (GitHub-Ready)</h2>
              <p className="text-xs text-slate-550 max-w-3xl leading-relaxed">
                This explorer displays the standalone files included in your simulated portfolio repository `/backend` and `/frontend`. They are structured cleanly without React compilation, allowing anyone to download, inspect, or copy blocks immediately.
              </p>
            </div>

            {/* Explorer component panel */}
            <CodeExplorer />
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 mt-16 py-8 text-center text-xs text-slate-500 font-medium bg-white">
        <div className="max-w-7xl mx-auto px-6 font-mono text-[11px] text-slate-400">
          Fullstack API Integration Cookbook Boilerplate Sandbox • Senior Portfolio Project
        </div>
      </footer>

    </div>
  );
}
