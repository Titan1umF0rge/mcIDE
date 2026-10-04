import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { 
  Boxes, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  FolderPlus,
  RefreshCw
} from 'lucide-react';

export default function ProjectGenerator() {
  const {
    currentPlatform,
    setCurrentPlatform,
    currentLoader,
    setCurrentLoader,
    targetVersion,
    setTargetVersion,
    snapshotMode,
    setSnapshotMode,
    availableVersions,
    projectName,
    setProjectName,
    initProject
  } = useWorkspace();

  const [inputName, setInputName] = useState(projectName);
  const [successMsg, setSuccessMsg] = useState('');

  const platforms = [
    { id: 'MOD', label: 'Modding Pipeline', desc: 'Fabric, NeoForge, Forge, Quilt' },
    { id: 'PLUGIN', label: 'Server Plugin', desc: 'Paper, Spigot, Purpur, Velocity' },
    { id: 'DATAPACK', label: 'Datapack', desc: 'Functions, Loot Tables, Tags' },
    { id: 'RESOURCEPACK', label: 'Resource Pack', desc: 'Models, Textures, Sounds' },
    { id: 'SHADER', label: 'Core / Post Shader', desc: 'GLSL Post-processing Shaders' }
  ];

  const loadersByPlatform = {
    MOD: ['FABRIC', 'NEOFORGE', 'FORGE', 'QUILT'],
    PLUGIN: ['PAPER', 'SPIGOT', 'PURPUR', 'VELOCITY', 'BUNGEECORD'],
    DATAPACK: ['VANILLA'],
    RESOURCEPACK: ['VANILLA'],
    SHADER: ['CORE']
  };

  const handleScaffold = () => {
    const finalName = inputName.trim() || 'CustomProject';
    setProjectName(finalName);
    initProject(currentPlatform, currentLoader, finalName, targetVersion);
    setSuccessMsg(`Generated ${currentPlatform} (${currentLoader}) project!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="flex flex-col h-full text-xs p-3 overflow-y-auto">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-subtle">
        <Boxes className="w-4 h-4 text-signal" />
        <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
          Mod & Plugin Pipelines
        </span>
      </div>

      {/* Project Name Input */}
      <div className="mb-4">
        <label className="block text-[11px] font-medium text-slate-400 mb-1">
          Project Name / Identifier
        </label>
        <input
          type="text"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          placeholder="MyCustomMod"
          className="w-full bg-[#1c1d1f] border border-subtle px-2.5 py-1.5 text-slate-200 rounded outline-none focus:border-signal text-xs"
        />
      </div>

      {/* Target Platform */}
      <div className="mb-4">
        <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
          Platform Architecture
        </label>
        <div className="space-y-1.5">
          {platforms.map(p => (
            <div
              key={p.id}
              onClick={() => {
                setCurrentPlatform(p.id);
                setCurrentLoader(loadersByPlatform[p.id][0]);
              }}
              className={`p-2 rounded border cursor-pointer transition-all ${
                currentPlatform === p.id
                  ? 'bg-[#1e2024] border-signal text-slate-100'
                  : 'bg-[#141517] border-subtle text-slate-400 hover:border-[#383a40]'
              }`}
            >
              <div className="font-semibold text-slate-200">{p.label}</div>
              <div className="text-[10px] text-muted">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Loader Selector (if applicable) */}
      {loadersByPlatform[currentPlatform].length > 1 && (
        <div className="mb-4">
          <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
            Target Loader / Framework
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {loadersByPlatform[currentPlatform].map(loader => (
              <button
                key={loader}
                onClick={() => setCurrentLoader(loader)}
                className={`py-1.5 px-2 rounded text-center font-medium transition-all ${
                  currentLoader === loader
                    ? 'bg-purple-950/60 border border-purple-500 text-purple-200 shadow-sm'
                    : 'bg-[#18191c] border border-subtle text-slate-400 hover:text-slate-200'
                }`}
              >
                {loader}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Minecraft Version (Mojang dynamic list) */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-medium text-slate-400">
            Target Minecraft Version
          </label>
          <label className="flex items-center gap-1 cursor-pointer text-[10px] text-muted">
            <input
              type="checkbox"
              checked={snapshotMode}
              onChange={(e) => setSnapshotMode(e.target.checked)}
              className="accent-signal"
            />
            Snapshots
          </label>
        </div>
        <select
          value={targetVersion}
          onChange={(e) => setTargetVersion(e.target.value)}
          className="w-full bg-[#1c1d1f] border border-subtle px-2.5 py-1.5 text-slate-200 rounded outline-none focus:border-signal text-xs"
        >
          {availableVersions.map(v => (
            <option key={v} value={v}>
              Minecraft {v}
            </option>
          ))}
        </select>
      </div>

      {/* Generate Action Button */}
      <button
        onClick={handleScaffold}
        className="w-full mt-2 py-2 rounded bg-[#22c55e] hover:bg-green-400 text-black font-semibold flex items-center justify-center gap-2 shadow-md glow-compiler-sm transition-all"
      >
        <FolderPlus className="w-4 h-4" />
        <span>Scaffold Pipeline Assets</span>
      </button>

      {successMsg && (
        <div className="mt-3 p-2 rounded bg-green-950/60 border border-green-700/60 text-green-300 text-center flex items-center justify-center gap-1.5 animate-fadeIn">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
}
