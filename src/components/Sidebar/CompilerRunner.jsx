import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { 
  Cpu, 
  Play, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Package, 
  FolderDown, 
  FolderGit2, 
  Radio 
} from 'lucide-react';

export default function CompilerRunner() {
  const {
    projectName,
    currentPlatform,
    currentLoader,
    targetVersion,
    isBuilding,
    buildStatus,
    buildPackage,
    localSettings,
    setLocalSettings,
    hotSwapEvents
  } = useWorkspace();

  const isZipTarget = currentPlatform === 'DATAPACK' || currentPlatform === 'RESOURCEPACK';
  const buildCommand = isZipTarget 
    ? 'adm-zip archiver --compression-level 9' 
    : currentLoader === 'PAPER' || currentLoader === 'SPIGOT' 
    ? 'mvn clean package -DskipTests'
    : './gradlew build --stacktrace';

  return (
    <div className="flex flex-col h-full text-xs p-3 overflow-y-auto">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-subtle">
        <Cpu className="w-4 h-4 text-signal" />
        <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
          Compiler & Native Injection
        </span>
      </div>

      {/* Target Spec Summary Card */}
      <div className="p-2.5 rounded bg-[#18191c] border border-subtle mb-3">
        <div className="text-[10px] uppercase font-semibold text-muted tracking-wider mb-1">
          Active Build Target
        </div>
        <div className="font-semibold text-slate-100 text-sm">
          {projectName}
        </div>
        <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px]">
          <span className="px-1.5 py-0.5 rounded bg-green-950/60 text-signal border border-green-800/60">
            {currentPlatform}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/60">
            {currentLoader}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/60">
            MC {targetVersion}
          </span>
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        onClick={buildPackage}
        disabled={isBuilding}
        className={`w-full py-2.5 rounded text-black font-semibold flex items-center justify-center gap-2 tracking-wide shadow-md transition-all mb-4 ${
          isBuilding
            ? 'bg-emerald-600 opacity-80 cursor-wait'
            : 'bg-[#22c55e] hover:bg-green-400 glow-compiler'
        }`}
      >
        {isBuilding ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-black" />
            <span>Executing Build Pipeline...</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-black" />
            <span>Build & Inject Package</span>
          </>
        )}
      </button>

      {/* Compiler Command Preview */}
      <div className="mb-4">
        <label className="block text-[11px] font-medium text-slate-400 mb-1">
          Native Invocation Command
        </label>
        <div className="p-2 rounded bg-[#101113] border border-subtle font-mono text-[11px] text-green-400 break-all select-text">
          $ {buildCommand}
        </div>
      </div>

      {/* Injection Pipeline Config */}
      <div className="p-3 rounded bg-[#18191c] border border-subtle mb-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300 text-[11px] flex items-center gap-1.5">
            <FolderDown className="w-3.5 h-3.5 text-blue-400" />
            <span>Environment Auto-Injection</span>
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.autoExportOnBuild}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, autoExportOnBuild: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:width-3 after:w-3 after:transition-all peer-checked:bg-signal"></div>
          </label>
        </div>

        <div>
          <div className="text-[10px] text-muted mb-0.5">Target Destination Folder</div>
          <div className="font-mono text-[10px] text-slate-300 truncate bg-[#121315] p-1.5 rounded border border-subtle select-text">
            {localSettings.dotMinecraftPath}\{currentPlatform === 'PLUGIN' ? 'server\\plugins' : 'mods'}
          </div>
        </div>

        <div className="text-[10px] text-slate-400">
          When active, built .jar / .zip artifacts copy directly into game directory upon compilation.
        </div>
      </div>

      {/* Hot-Swap Live Monitor Feed */}
      <div className="flex-1 flex flex-col min-h-0 border-t border-subtle pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-slate-300 text-[11px] flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-signal" />
            <span>Live Hot-Swap Events</span>
          </span>
          <span className="text-[10px] text-signal font-mono">
            {hotSwapEvents.length} events
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {hotSwapEvents.length === 0 ? (
            <div className="p-3 text-center text-muted bg-[#141517] rounded border border-dashed border-subtle text-[11px]">
              Chokidar file watcher listening on workspace directory.
            </div>
          ) : (
            hotSwapEvents.slice(0, 10).map((evt, idx) => (
              <div key={idx} className="p-1.5 rounded bg-[#141517] border border-subtle font-mono text-[10px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-signal uppercase">{evt.event}</span>
                  <span>{evt.timestamp}</span>
                </div>
                <div className="text-slate-200 truncate mt-0.5">{evt.relativePath}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
