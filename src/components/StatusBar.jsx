import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  GitBranch, 
  Radio, 
  Cpu, 
  Layers, 
  Check, 
  Sparkles,
  Coffee
} from 'lucide-react';

export default function StatusBar() {
  const {
    currentPlatform,
    currentLoader,
    mappingTarget,
    targetVersion,
    localSettings,
    buildStatus
  } = useWorkspace();

  return (
    <div className="h-6 bg-[#161719] border-t border-subtle flex items-center justify-between px-3 text-[11px] text-slate-400 select-none z-20">
      {/* Left indicators */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer">
          <GitBranch className="w-3.5 h-3.5 text-signal" />
          <span>main</span>
        </div>

        <div className="h-3 w-px bg-subtle" />

        <div className="flex items-center gap-1 font-mono text-purple-300">
          <span>{currentPlatform}</span>
          <span className="text-slate-500">/</span>
          <span>{currentLoader}</span>
        </div>

        <div className="h-3 w-px bg-subtle" />

        <div className="flex items-center gap-1 font-mono text-blue-300">
          <span>Maps: {mappingTarget}</span>
        </div>

        <div className="h-3 w-px bg-subtle" />

        <div className="flex items-center gap-1 font-mono text-signal">
          <span>MC {targetVersion}</span>
        </div>
      </div>

      {/* Right indicators */}
      <div className="flex items-center gap-3">
        {/* Hot-Swap State */}
        <div className="flex items-center gap-1 text-[10px]">
          <span className={`w-1.5 h-1.5 rounded-full ${localSettings.enableHotSwap ? 'bg-signal' : 'bg-slate-600'}`} />
          <span className={localSettings.enableHotSwap ? 'text-signal font-medium' : 'text-slate-500'}>
            HotSwap {localSettings.enableHotSwap ? 'ON' : 'OFF'}
          </span>
        </div>

        <div className="h-3 w-px bg-subtle" />

        {/* OpenJDK Status */}
        <div className="flex items-center gap-1 text-amber-300 font-mono text-[10px]" title={localSettings.openJdkPath}>
          <Coffee className="w-3 h-3" />
          <span>Java 21</span>
        </div>

        <div className="h-3 w-px bg-subtle" />

        <div className="text-[10px] text-slate-400">
          UTF-8
        </div>

        <div className="text-[10px] text-slate-400 font-mono">
          Spaces: 4
        </div>
      </div>
    </div>
  );
}
