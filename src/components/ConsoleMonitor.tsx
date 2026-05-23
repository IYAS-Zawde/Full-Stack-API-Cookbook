import React, { useState } from 'react';
import { LogEntry } from '../types';
import { Trash2, Radio, Terminal, Server, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface ConsoleMonitorProps {
  logs: LogEntry[];
  onClear: () => void;
  latencyAvg?: string;
  successRate?: string;
}

export const ConsoleMonitor: React.FC<ConsoleMonitorProps> = ({
  logs,
  onClear,
  latencyAvg = "0ms",
}) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const lastLog = logs[0] || null;
  const lastStatus = lastLog ? lastLog.status : "-";

  return (
    <div id="visual-console-sidebar" className="bg-[#0f172a] border border-[#1e293b] rounded-xl overflow-hidden shadow-lg flex flex-col h-full">
      
      {/* Header telemetry area */}
      <div className="bg-[#0f172a] border-b border-[#1e293b] py-3.5 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <Terminal size={14} className="text-blue-400" />
          <span className="text-xs font-bold tracking-wider text-slate-200 font-mono">LIVE API TRANSMISSIONS</span>
        </div>
        <button
          onClick={onClear}
          id="btn-clear-logs"
          className="text-[10px] text-slate-400 hover:text-white font-bold flex items-center gap-1 transition cursor-pointer"
        >
          <Trash2 size={12} />
          CLEAR
        </button>
      </div>

      {/* Response telemetry tags cards */}
      <div className="p-4 grid grid-cols-2 gap-2 text-center text-[10px] font-mono tracking-wider border-b border-[#1e293b] bg-[#0f172a]">
        <div className="bg-[#1e293b]/40 p-2.5 rounded-lg border border-[#1e293b]">
          <div className="text-slate-400 mb-0.5 font-semibold">LAST HTTP STATUS</div>
          <div
            id="status-stat-badge"
            className={`text-sm font-bold ${
              typeof lastStatus === 'number' && lastStatus >= 200 && lastStatus < 300
                ? 'text-emerald-400'
                : lastStatus === '-'
                ? 'text-slate-400'
                : 'text-rose-400'
            }`}
          >
            {lastStatus}
          </div>
        </div>
        <div className="bg-[#1e293b]/40 p-2.5 rounded-lg border border-[#1e293b]">
          <div className="text-slate-400 mb-0.5 font-semibold">AVG RESPONSE TIME</div>
          <div className="text-slate-200 text-sm font-bold">{lastLog && lastLog.latency ? `${lastLog.latency} ms` : latencyAvg}</div>
        </div>
      </div>

      {/* Scrollable logs register container */}
      <div id="dynamic-log-list" className="h-[520px] overflow-y-auto px-4 py-4 space-y-4 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="text-slate-400 py-8 text-center space-y-2">
            <Radio size={24} className="mx-auto text-slate-500 animate-pulse" />
            <p className="text-[11px] font-semibold">No active transmissions loaded.</p>
            <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs mx-auto">Click any method or interact with options in the left sandbox panel to trigger network telemetry events.</p>
          </div>
        ) : (
          logs.map((log) => {
            const isLogExpanded = expandedLogId === log.id;
            let statusStyles = "text-emerald-400 border-emerald-500/20 bg-emerald-500/10";
            if (log.isError || (typeof log.status === 'number' && log.status >= 400)) {
              statusStyles = "text-rose-400 border-rose-500/20 bg-rose-500/10";
            } else if (typeof log.status === 'number' && log.status >= 300) {
              statusStyles = "text-amber-450 border-amber-500/20 bg-amber-500/10";
            }

            let methodBadgeColor = "bg-slate-800 text-slate-300";
            if (log.method === "GET") methodBadgeColor = "bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30";
            if (log.method === "POST") methodBadgeColor = "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30";
            if (log.method === "PUT") methodBadgeColor = "bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30";
            if (log.method === "DELETE") methodBadgeColor = "bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30";
            if (log.method === "RESET") methodBadgeColor = "bg-slate-700/50 text-slate-300 border border-slate-600/30";

            return (
              <div
                key={log.id}
                id={`network-log-card-${log.id}`}
                className="border border-[#1e293b] bg-[#1e293b]/10 p-3.5 rounded-lg hover:bg-[#1e293b]/20 transition group space-y-3"
              >
                {/* Method / Origin details Row */}
                <div className="flex items-center justify-between gap-1 border-b border-[#1e293b] pb-2">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wide ${methodBadgeColor}`}>
                      {log.method}
                    </span>
                    <span className="text-slate-200 font-bold text-[10px] truncate max-w-[150px] sm:max-w-xs" title={log.url}>
                      {log.url.startsWith("http") ? log.url.replace(window.location.origin, "") : log.url}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-450 shrink-0 whitespace-nowrap">{log.timestamp}</span>
                </div>

                {/* Concept and Subtitle text */}
                <div className="text-xs leading-normal">
                  <div className="text-blue-400 font-semibold font-sans">{log.title}</div>
                  <div className="text-slate-300 text-[10px] mt-0.5 font-sans">{log.sub}</div>
                </div>

                {/* JSON specs code expansions */}
                {isLogExpanded && (
                  <div className="space-y-3 pt-3 border-t border-[#1e293b] text-[10px] leading-relaxed select-text">
                    
                    {/* Headers segment */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-350 font-semibold uppercase">Outbound HTTP Request Headers:</span>
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(log.headers, null, 2), `hdr_${log.id}`)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {copiedId === `hdr_${log.id}` ? <Check size={10} /> : <Copy size={10} />}
                        </button>
                      </div>
                      <pre className="bg-[#0b121f] p-2 rounded-lg border border-[#1e293b] text-blue-200 max-h-24 overflow-y-auto overflow-x-auto whitespace-pre-wrap select-all">
                        {JSON.stringify(log.headers, null, 2)}
                      </pre>
                    </div>

                    {/* Bodies segment */}
                    {log.reqBody && (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-355 font-semibold uppercase">JSON Request Body Payload:</span>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(log.reqBody, null, 2), `req_${log.id}`)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            {copiedId === `req_${log.id}` ? <Check size={10} /> : <Copy size={10} />}
                          </button>
                        </div>
                        <pre className="bg-[#0b121f] p-2 rounded-lg border border-[#1e293b] text-slate-200 max-h-32 overflow-y-auto overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(log.reqBody, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Response segment */}
                    {log.resBody && (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-355 font-semibold uppercase">API Server Response Body:</span>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(log.resBody, null, 2), `res_${log.id}`)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            {copiedId === `res_${log.id}` ? <Check size={10} /> : <Copy size={10} />}
                          </button>
                        </div>
                        <pre className="bg-[#0b121f] p-2 rounded-lg border border-[#1e293b] text-slate-100 max-h-48 overflow-y-auto overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(log.resBody, null, 2)}
                        </pre>
                      </div>
                    )}

                  </div>
                )}

                {/* Status bar and trigger down button Row */}
                <div className="flex justify-between items-center text-[10px] pt-2 border-t border-[#1e293b]">
                  <button
                    onClick={() => toggleExpand(log.id)}
                    className="text-blue-300 hover:text-blue-200 hover:underline flex items-center gap-1 cursor-pointer select-none"
                  >
                    {isLogExpanded ? (
                      <>
                        <ChevronUp size={11} /> Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown size={11} /> View Headers & Payloads
                      </>
                    )}
                  </button>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-slate-400 font-normal">HTTP Status:</span>
                    <span className={`px-2 py-0.5 rounded border ${statusStyles}`}>{log.status}</span>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
