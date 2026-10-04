import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  FolderTree, 
  Boxes, 
  Palette, 
  FileCode2, 
  Cpu, 
  Sparkles, 
  Settings,
  HelpCircle
} from 'lucide-react';

export default function ActivityBar() {
  const { activeSidebarTab, setActiveSidebarTab } = useWorkspace();

  const navItems = [
    { id: 'EXPLORER', icon: FolderTree, title: 'Project Explorer' },
    { id: 'PROJECT_GEN', icon: Boxes, title: 'Mod & Plugin Pipelines' },
    { id: 'CANVAS', icon: Palette, title: '2D/3D Texture Asset Studio' },
    { id: 'MAPPINGS', icon: FileCode2, title: 'Decompiler & Mappings Transformer' },
    { id: 'COMPILER', icon: Cpu, title: 'Compilation & Injection Pipeline' },
    { id: 'COPILOT', icon: Sparkles, title: 'Copilot AI Vector Assistant', highlight: true }
  ];

  return (
    <div className="w-12 bg-activity border-r border-subtle flex flex-col justify-between items-center py-2 select-none z-10">
      {/* Top action icons */}
      <div className="flex flex-col items-center gap-1 w-full">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeSidebarTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSidebarTab(isActive ? '' : item.id)}
              title={item.title}
              className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                isActive
                  ? 'text-signal bg-[#1c1d1f]'
                  : item.highlight
                  ? 'text-purple-400 hover:text-purple-300 hover:bg-[#18191c]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#18191c]'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-signal rounded-r" />
              )}
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>

      {/* Bottom settings icon */}
      <div className="flex flex-col items-center gap-1 w-full">
        <button
          onClick={() => setActiveSidebarTab(activeSidebarTab === 'SETTINGS' ? '' : 'SETTINGS')}
          title="System Settings & JDK Config"
          className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
            activeSidebarTab === 'SETTINGS'
              ? 'text-signal bg-[#1c1d1f]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#18191c]'
          }`}
        >
          {activeSidebarTab === 'SETTINGS' && (
            <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-signal rounded-r" />
          )}
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
