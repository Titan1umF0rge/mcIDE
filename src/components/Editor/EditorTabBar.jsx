import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { X, FileCode, FileJson, FileText, Sparkles, Image as ImageIcon, File } from 'lucide-react';

export default function EditorTabBar() {
  const { openTabs, setOpenTabs, activeTab, setActiveTab } = useWorkspace();

  const getTabIcon = (path) => {
    if (path.endsWith('.java')) return <FileCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    if (path.endsWith('.json') || path.endsWith('.mcmeta')) return <FileJson className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    if (path.endsWith('.toml') || path.endsWith('.yml') || path.endsWith('.xml')) return <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    if (path.endsWith('.mcfunction')) return <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
    return <File className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  const handleCloseTab = (e, tabPath) => {
    e.stopPropagation();
    const remaining = openTabs.filter(t => t !== tabPath);
    setOpenTabs(remaining);
    if (activeTab === tabPath) {
      setActiveTab(remaining[remaining.length - 1] || '');
    }
  };

  return (
    <div className="h-9 bg-[#121315] border-b border-subtle flex items-center overflow-x-auto select-none no-scrollbar">
      {openTabs.map(tabPath => {
        const isActive = activeTab === tabPath;
        const fileName = tabPath.split('/').pop();

        return (
          <div
            key={tabPath}
            onClick={() => setActiveTab(tabPath)}
            className={`group h-full flex items-center gap-2 px-3 border-r border-subtle cursor-pointer text-xs transition-colors shrink-0 ${
              isActive
                ? 'bg-master text-slate-100 border-t-2 border-t-signal font-medium'
                : 'bg-[#141517] text-slate-400 hover:bg-[#181a1d] hover:text-slate-200'
            }`}
          >
            {getTabIcon(tabPath)}
            <span className="truncate max-w-[150px]">{fileName}</span>
            <button
              onClick={(e) => handleCloseTab(e, tabPath)}
              className="p-0.5 rounded hover:bg-[#2c2d33] text-slate-500 hover:text-slate-200 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
