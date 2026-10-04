import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { 
  transformSourceMappings, 
  MAPPING_DICTIONARY, 
  OBFUSCATED_SAMPLE 
} from '../../services/mappingEngine';
import { 
  FileCode2, 
  Search, 
  ArrowRightLeft, 
  CheckCircle, 
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function MappingEngineView() {
  const {
    mappingTarget,
    setMappingTarget,
    files,
    setFiles,
    activeTab,
    setActiveTab,
    openTabs,
    setOpenTabs,
    addTerminalLog
  } = useWorkspace();

  const [searchQuery, setSearchQuery] = useState('');
  const [statsMsg, setStatsMsg] = useState('');

  const mappingTargets = ['MOJANG', 'YARN', 'PARCHMENT', 'INTERMEDIARY'];

  // Handle transformation of the currently active editor file
  const handleDeobfuscateActiveFile = () => {
    if (!activeTab || !files[activeTab]) {
      addTerminalLog('stderr', '[MAPPINGS] No active file selected in editor to transform.');
      return;
    }

    const currentCode = files[activeTab];
    const transformed = transformSourceMappings(currentCode, mappingTarget);
    
    setFiles(prev => ({
      ...prev,
      [activeTab]: transformed
    }));

    addTerminalLog('info', `[MAPPINGS] Successfully transformed "${activeTab}" into ${mappingTarget} mappings.`);
    setStatsMsg(`Transformed into ${mappingTarget} nomenclature.`);
    setTimeout(() => setStatsMsg(''), 4000);
  };

  // Load sample obfuscated decompiled file into editor
  const handleLoadSample = () => {
    const samplePath = 'src/decompiled/ObfuscatedSourceSample.java';
    setFiles(prev => ({
      ...prev,
      [samplePath]: OBFUSCATED_SAMPLE
    }));
    setActiveTab(samplePath);
    if (!openTabs.includes(samplePath)) {
      setOpenTabs([...openTabs, samplePath]);
    }
    addTerminalLog('info', `[DECOMPILER] Loaded obfuscated Notch bytecode archive sample: "${samplePath}"`);
  };

  // Filter dictionary entries based on search
  const filteredClasses = MAPPING_DICTIONARY.classes.filter(c => 
    c.mojang.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.yarn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.notch.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.intermediary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMethods = MAPPING_DICTIONARY.methods.filter(m =>
    m.mojang.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.yarn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.notch.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.intermediary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full text-xs p-3 overflow-y-auto">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-subtle">
        <FileCode2 className="w-4 h-4 text-blue-400" />
        <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
          Decompiler & Mappings
        </span>
      </div>

      {/* Target Mapping Selector */}
      <div className="mb-4">
        <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
          Active Mapping Target
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {mappingTargets.map(target => (
            <button
              key={target}
              onClick={() => setMappingTarget(target)}
              className={`py-1.5 px-2 rounded text-center font-medium transition-all ${
                mappingTarget === target
                  ? 'bg-blue-950/60 border border-blue-500 text-blue-200 shadow-sm'
                  : 'bg-[#18191c] border border-subtle text-slate-400 hover:text-slate-200'
              }`}
            >
              {target}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 mb-4">
        <button
          onClick={handleDeobfuscateActiveFile}
          className="w-full py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Transform Active File ({mappingTarget})</span>
        </button>

        <button
          onClick={handleLoadSample}
          className="w-full py-1.5 rounded bg-[#1c1d1f] hover:bg-[#23252a] border border-subtle text-slate-300 font-medium flex items-center justify-center gap-2 transition-all"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Load Obfuscated Source Sample</span>
        </button>
      </div>

      {statsMsg && (
        <div className="mb-4 p-2 rounded bg-blue-950/60 border border-blue-800/60 text-blue-300 text-center flex items-center justify-center gap-1.5 animate-fadeIn">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{statsMsg}</span>
        </div>
      )}

      {/* Dictionary Search */}
      <div className="flex-1 flex flex-col min-h-0 border-t border-subtle pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-300">
            Mapping Dictionary Index
          </span>
          <span className="text-[10px] text-muted">
            {filteredClasses.length + filteredMethods.length} entries
          </span>
        </div>

        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search class, method, or notch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1c1d1f] border border-subtle pl-8 pr-2 py-1.5 text-slate-200 rounded outline-none focus:border-signal text-xs"
          />
        </div>

        {/* Dictionary List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredClasses.map((item, idx) => (
            <div key={idx} className="p-2 rounded bg-[#18191c] border border-subtle">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-amber-400 font-semibold">{item.mojang.split('.').pop()}</span>
                <span className="text-red-400 bg-red-950/30 px-1 rounded text-[10px]">notch: {item.notch}</span>
              </div>
              <div className="text-[10px] text-purple-300 truncate mt-0.5">
                Yarn: {item.yarn}
              </div>
              <div className="text-[10px] text-muted mt-1">
                {item.description}
              </div>
            </div>
          ))}

          {filteredMethods.map((m, idx) => (
            <div key={`m-${idx}`} className="p-2 rounded bg-[#18191c] border border-subtle">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-signal font-semibold">{m.mojang}()</span>
                <span className="text-red-400 bg-red-950/30 px-1 rounded text-[10px]">{m.notch}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                Owner: {m.owner} | Yarn: {m.yarn}()
              </div>
              <div className="text-[9px] text-muted font-mono truncate mt-0.5">
                {m.signature}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
