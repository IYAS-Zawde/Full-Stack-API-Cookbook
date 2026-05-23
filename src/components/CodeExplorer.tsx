import React, { useState } from 'react';
import { REPOSITORY_FILES, CodeFile } from '../data/repoFiles';
import { Folder, FolderOpen, FileCode, Copy, Check, Info, FileText } from 'lucide-react';

export const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(REPOSITORY_FILES[0]);
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Group repository files into simple directory trees
  const backendFiles = REPOSITORY_FILES.filter(f => f.path.startsWith('backend/'));
  const frontendFiles = REPOSITORY_FILES.filter(f => f.path.startsWith('frontend/'));

  return (
    <div id="repository-code-explorer" className="bg-white border border-slate-200 rounded-xl grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-[580px] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      
      {/* Directory structure tree layout panel (4 Columns) */}
      <div className="lg:col-span-3 border-r border-slate-200 bg-slate-50 p-4 space-y-5 select-none text-slate-800">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Repository Root</span>
          <h4 className="text-sm font-bold text-slate-800 mt-0.5">fullstack-api-cookbook/</h4>
        </div>

        {/* Tree listings content */}
        <div className="space-y-4 text-xs font-mono">
          
          {/* Backend Folder Section */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-600 font-bold">
              <FolderOpen size={14} className="text-blue-500" />
              <span>backend/</span>
            </div>
            
            <div className="pl-4 space-y-0.5">
              {backendFiles.map(file => {
                const isActive = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => { setSelectedFile(file); setCopied(false); }}
                    className={`flex items-center gap-1.5 w-full text-left py-1 px-2 rounded-lg transition cursor-pointer ${
                      isActive 
                        ? 'bg-white text-blue-600 font-bold border-l-2 border-blue-500 pl-1.5 shadow-xs'
                        : 'text-slate-550 hover:text-slate-850 hover:bg-white/60'
                    }`}
                  >
                    {file.name.endsWith('.md') ? <FileText size={12} className="text-slate-400" /> : <FileCode size={12} className="text-blue-400" />}
                    <span className="truncate">{file.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Frontend Folder Section */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 font-bold">
              <FolderOpen size={14} className="text-emerald-500" />
              <span>frontend/</span>
            </div>

            <div className="pl-4 space-y-0.5">
              {frontendFiles.map(file => {
                const isActive = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => { setSelectedFile(file); setCopied(false); }}
                    className={`flex items-center gap-1.5 w-full text-left py-1 px-2 rounded-lg transition cursor-pointer ${
                      isActive 
                        ? 'bg-white text-emerald-600 font-bold border-l-2 border-emerald-500 pl-1.5 shadow-xs'
                        : 'text-slate-550 hover:text-slate-850 hover:bg-white/60'
                    }`}
                  >
                    {file.name.endsWith('.md') ? <FileText size={12} className="text-slate-400" /> : <FileCode size={12} className="text-emerald-400" />}
                    <span className="truncate">{file.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Quick Help box */}
        <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg space-y-1 text-[11px] sm:text-xs">
          <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
            <Info size={12} className="shrink-0 text-blue-500" />
            <span>GitHub Export Ready</span>
          </div>
          <p className="text-slate-600 leading-normal font-sans">
            These folders match what is saved on the virtual disk workspace. Clicking **"Settings &gt; Export ZIP"** downloads this standalone cookbook perfectly!
          </p>
        </div>
      </div>

      {/* Code viewer display block (9 Columns) */}
      <div className="lg:col-span-9 bg-slate-50/50 flex flex-col h-full text-slate-800">
        {/* Code header bar details */}
        <div className="bg-slate-100/50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-450 font-mono font-bold">Live Path:</span>
            <code className="text-xs text-blue-600 bg-white px-2 py-0.5 rounded font-mono border border-slate-200">
              {selectedFile.path}
            </code>
          </div>
          <button
            onClick={copyCode}
            className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-705 border border-slate-200 rounded-lg flex items-center gap-1.5 select-none transition cursor-pointer shadow-xs"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy size={13} className="text-slate-500" />
                Copy File
              </>
            )}
          </button>
        </div>

        {/* Code viewing pre blocks */}
        <div className="flex-1 p-5 min-h-0">
          <pre className="bg-white text-slate-800 p-4 rounded-xl border border-slate-200 text-[11px] leading-relaxed font-mono overflow-auto max-h-[500px] select-all whitespace-pre shadow-inner">
            {selectedFile.content}
          </pre>
        </div>
      </div>

    </div>
  );
};
