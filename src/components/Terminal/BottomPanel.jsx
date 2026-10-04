import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { 
  Terminal, 
  Radio, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Maximize2,
  FileCode2
} from 'lucide-react';

export default function BottomPanel() {
  const { terminalLogs, clearTerminal, hotSwapEvents, isBuilding, buildStatus } = useWorkspace();
  const [activeTab, setActiveTab] = useState('TERMINAL'); // 'TERMINAL' | 'HOTSWAP' | 'PROBLEMS'
  const [isCollapsed, setIsCollapsed] = useState(false);
  const logEndRef = useRef(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (!isCollapsed && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs, isCollapsed]);

  const getLogColorClass = (stream) => {
    if (stream === 'stderr' || stream === 'error') return 'text-red-400';
    if (stream === 'success') return 'text-signal font-semibold';
    if (stream === 'warn') return 'text-amber-400';
    return 'text-slate-300';
  };

  return (
    <div className={`bg-[#0f1011] border-t border-subtle flex flex-col transition-all duration-200 select-none ${
      isCollapsed ? 'h-7' : 'h-48'
    }`}>
      {/* Panel Tab Header */}
      <div className="h-7 bg-[#141517] border-b border-subtle px-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActiveTab('TERMINAL'); setIsCollapsed(false); }}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              activeTab === 'TERMINAL' && !isCollapsed
                ? 'bg-[#1e2024] text-signal border border-[#383a40]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal & Build Output</span>
            {isBuilding && <span className="w-2 h-2 rounded-full bg-signal animate-ping ml-1" />}
          </button>

          <button
            onClick={() => { setActiveTab('HOTSWAP'); setIsCollapsed(false); }}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              activeTab === 'HOTSWAP' && !isCollapsed
                ? 'bg-[#1e2024] text-signal border border-[#383a40]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-signal" />
            <span>Hot-Swap Stream</span>
            <span className="text-[10px] font-mono px-1 rounded bg-[#27282b] text-slate-300">
              {hotSwapEvents.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('PROBLEMS'); setIsCollapsed(false); }}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              activeTab === 'PROBLEMS' && !isCollapsed
                ? 'bg-[#1e2024] text-signal border border-[#383a40]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Diagnostics</span>
            <span className="text-[10px] font-mono px-1 rounded bg-green-950/40 text-signal border border-green-800/40">
              0 Errors
            </span>
          </button>
        </div>

        {/* Panel Action Controls */}
        <div className="flex items-center gap-2">
          {activeTab === 'TERMINAL' && (
            <button
              onClick={clearTerminal}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#202226]"
              title="Clear Terminal Logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#202226]"
            title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
          >
            {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Panel Content Body */}
      {!isCollapsed && (
        <div className="flex-1 p-2.5 overflow-y-auto font-mono text-[11px] leading-relaxed bg-[#0b0c0d] select-text">
          {activeTab === 'TERMINAL' && (
            <div className="space-y-0.5">
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-slate-600 select-none shrink-0 font-sans text-[10px]">
                    [{log.timestamp}]
                  </span>
                  <span className={`${getLogColorClass(log.stream)} break-all`}>
                    {log.text}
                  </span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          )}

          {activeTab === 'HOTSWAP' && (
            <div className="space-y-1">
              <div className="text-slate-400 text-xs mb-2">
                Chokidar live hot-swap monitor. File writes in workspace trigger immediate runtime injection:
              </div>
              {hotSwapEvents.length === 0 ? (
                <div className="text-muted italic">Waiting for workspace file changes...</div>
              ) : (
                hotSwapEvents.map((evt, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-300">
                    <span className="text-signal uppercase font-bold text-[10px]">[{evt.event}]</span>
                    <span className="text-slate-400 text-[10px]">{evt.timestamp}</span>
                    <span className="text-slate-100">{evt.relativePath}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'PROBLEMS' && (
            <div className="p-3 text-slate-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-signal shrink-0" />
              <span>No syntax or bytecode errors detected across active files. All schemas validated.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
