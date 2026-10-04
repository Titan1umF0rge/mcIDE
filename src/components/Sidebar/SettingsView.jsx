import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { 
  Settings, 
  FolderOpen, 
  Key, 
  Terminal, 
  Save, 
  Check, 
  Sparkles,
  Flame
} from 'lucide-react';

export default function SettingsView() {
  const { localSettings, setLocalSettings, addTerminalLog } = useWorkspace();

  const handleUpdate = (field, val) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleBrowseMinecraft = async () => {
    if (window.electronAPI && window.electronAPI.selectDirectory) {
      const selected = await window.electronAPI.selectDirectory();
      if (selected) {
        handleUpdate('dotMinecraftPath', selected);
        addTerminalLog('info', `[SETTINGS] Updated .minecraft path: ${selected}`);
      }
    }
  };

  return (
    <div className="flex flex-col h-full text-xs p-3 overflow-y-auto">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-subtle">
        <Settings className="w-4 h-4 text-signal" />
        <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
          Workspace & Local Settings
        </span>
      </div>

      <div className="space-y-4">
        {/* OpenJDK Path */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            OpenJDK 21+ Routing Path (openJdkPath)
          </label>
          <input
            type="text"
            value={localSettings.openJdkPath}
            onChange={(e) => handleUpdate('openJdkPath', e.target.value)}
            className="w-full bg-[#1c1d1f] border border-subtle px-2.5 py-1.5 text-slate-200 rounded outline-none focus:border-signal text-xs font-mono"
          />
          <span className="text-[10px] text-muted mt-1 block">
            Used by Gradle & Maven to compile release bytecode
          </span>
        </div>

        {/* .minecraft Directory Path */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Target Game Directory (dotMinecraftPath)
          </label>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={localSettings.dotMinecraftPath}
              onChange={(e) => handleUpdate('dotMinecraftPath', e.target.value)}
              className="flex-1 bg-[#1c1d1f] border border-subtle px-2.5 py-1.5 text-slate-200 rounded outline-none focus:border-signal text-xs font-mono"
            />
            <button
              onClick={handleBrowseMinecraft}
              className="px-2.5 py-1 bg-[#23252a] hover:bg-[#2b2d33] border border-subtle text-slate-300 rounded flex items-center justify-center"
              title="Browse Directory"
            >
              <FolderOpen className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-[10px] text-muted mt-1 block">
            Location of mods / resourcepacks / test server plugins
          </span>
        </div>

        {/* API Endpoint & Token */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            mcIDE Cloud API Endpoint (apiEndpoint)
          </label>
          <input
            type="text"
            value={localSettings.apiEndpoint}
            onChange={(e) => handleUpdate('apiEndpoint', e.target.value)}
            className="w-full bg-[#1c1d1f] border border-subtle px-2.5 py-1.5 text-slate-200 rounded outline-none focus:border-signal text-xs font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            API Auth Token (apiToken)
          </label>
          <input
            type="password"
            value={localSettings.apiToken}
            onChange={(e) => handleUpdate('apiToken', e.target.value)}
            className="w-full bg-[#1c1d1f] border border-subtle px-2.5 py-1.5 text-slate-200 rounded outline-none focus:border-signal text-xs font-mono"
          />
        </div>

        {/* Toggles */}
        <div className="pt-2 border-t border-subtle space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-300">Auto-Export on Build</div>
              <div className="text-[10px] text-muted">Copy artifact to .minecraft automatically</div>
            </div>
            <input
              type="checkbox"
              checked={localSettings.autoExportOnBuild}
              onChange={(e) => handleUpdate('autoExportOnBuild', e.target.checked)}
              className="accent-signal w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-300">Enable Hot-Swap Watcher</div>
              <div className="text-[10px] text-muted">Stream file updates live via Chokidar</div>
            </div>
            <input
              type="checkbox"
              checked={localSettings.enableHotSwap}
              onChange={(e) => handleUpdate('enableHotSwap', e.target.checked)}
              className="accent-signal w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
