import React from 'react';
import { ChevronRight, FileCode, Folder } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export default function Breadcrumbs() {
  const { activeTab, projectName } = useWorkspace();

  if (!activeTab) return null;

  const segments = [projectName, ...activeTab.split('/')];

  return (
    <div className="h-6 bg-master border-b border-subtle flex items-center px-3 text-[11px] text-muted font-mono select-none overflow-x-auto no-scrollbar">
      {segments.map((seg, idx) => {
        const isLast = idx === segments.length - 1;
        return (
          <React.Fragment key={idx}>
            <span className={`hover:text-slate-200 cursor-pointer ${isLast ? 'text-slate-300 font-medium' : ''}`}>
              {seg}
            </span>
            {!isLast && <ChevronRight className="w-3 h-3 mx-1 text-slate-600 shrink-0" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
