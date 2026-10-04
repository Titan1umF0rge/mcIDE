import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  Play, 
  Layers, 
  Code, 
  FileText, 
  Flame, 
  Cpu, 
  Radio, 
  RefreshCw,
  FolderOpen,
  Settings as SettingsIcon,
  Sparkles
} from 'lucide-react';

export default function TopBar() {
  const {
    projectName,
    currentMode,
    setCurrentMode,
    currentPlatform,
    currentLoader,
    targetVersion,
    mappingTarget,
    isBuilding,
    buildPackage,
    localSettings
  } = useWorkspace();

  return (
    <div className="h-11 bg-sidebar border-b border-subtle flex items-center justify-between px-3 select-none z-20">
      {/* Left: Branding & Project */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-bold text-sm tracking-wide text-heading">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-md">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-100">mcIDE<span className="text-signal font-normal">.Studio</span></span>
        </div>

        <div className="h-4 w-px bg-[#27282b]" />

        {/* Current Active Project & Version */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-300 px-2 py-0.5 rounded bg-card border border-subtle">
            {projectName}
          </span>
          <span className="text-[11px] font-mono text-signal bg-green-950/40 border border-green-800/60 px-1.5 py-0.5 rounded">
            MC {targetVersion}
          </span>
          <span className="text-[11px] font-mono text-purple-400 bg-purple-950/40 border border-purple-800/60 px-1.5 py-0.5 rounded">
            {currentLoader}
          </span>
          <span className="text-[11px] font-mono text-blue-400 bg-blue-950/40 border border-blue-800/60 px-1.5 py-0.5 rounded">
            {mappingTarget}
          </span>
        </div>
      </div>

      {/* Center: Mode Switcher (Simple Form <-> Advanced Code) */}
      <div className="flex items-center bg-[#0d0e10] p-1 rounded-lg border border-subtle">
        <button
          onClick={() => setCurrentMode('SIMPLE_FORM')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
            currentMode === 'SIMPLE_FORM'
              ? 'bg-card text-heading shadow-sm border border-[#383a40]'
              : 'text-muted hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Simple Form</span>
        </button>

        <button
          onClick={() => setCurrentMode('ADVANCED_CODE')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
            currentMode === 'ADVANCED_CODE'
              ? 'bg-card text-heading shadow-sm border border-[#383a40]'
              : 'text-muted hover:text-slate-200'
          }`}
        >
          <Code className="w-3.5 h-3.5 text-blue-400" />
          <span>Advanced Code</span>
        </button>
      </div>

      {/* Right: Actions, Hot-Swap status & Primary Compile Button */}
      <div className="flex items-center gap-3">
        {/* Hot-Swap live indicator */}
        <div className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded bg-[#121315] border border-subtle text-slate-300">
          <span className={`w-2 h-2 rounded-full ${localSettings.enableHotSwap ? 'bg-signal animate-pulse-subtle' : 'bg-slate-600'}`} />
          <span className="hidden sm:inline">{localSettings.enableHotSwap ? 'Hot-Swap Active' : 'Hot-Swap Paused'}</span>
        </div>

        {/* Primary Build Package Button (#22c55e) */}
        <button
          onClick={buildPackage}
          disabled={isBuilding}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold tracking-wide text-black transition-all ${
            isBuilding
              ? 'bg-emerald-600 opacity-80 cursor-not-allowed'
              : 'bg-[#22c55e] hover:bg-green-400 shadow-md glow-compiler cursor-pointer'
          }`}
        >
          {isBuilding ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Compiling...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Build Package</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
