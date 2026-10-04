import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { 
  Folder, 
  FolderOpen, 
  FileCode, 
  FileJson, 
  FileText, 
  Plus, 
  Trash2, 
  File, 
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';

export default function FileExplorer() {
  const { files, setFiles, activeTab, setActiveTab, openTabs, setOpenTabs, projectName } = useWorkspace();
  const [newFileName, setNewFileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const getFileIcon = (filePath) => {
    if (filePath.endsWith('.java')) return <FileCode className="w-4 h-4 text-amber-400 shrink-0" />;
    if (filePath.endsWith('.json') || filePath.endsWith('.mcmeta')) return <FileJson className="w-4 h-4 text-emerald-400 shrink-0" />;
    if (filePath.endsWith('.toml') || filePath.endsWith('.yml') || filePath.endsWith('.xml')) return <FileText className="w-4 h-4 text-blue-400 shrink-0" />;
    if (filePath.endsWith('.mcfunction')) return <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />;
    if (filePath.endsWith('.vsh') || filePath.endsWith('.fsh')) return <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />;
    if (filePath.endsWith('.png')) return <ImageIcon className="w-4 h-4 text-pink-400 shrink-0" />;
    return <File className="w-4 h-4 text-slate-400 shrink-0" />;
  };

  const handleOpenFile = (path) => {
    setActiveTab(path);
    if (!openTabs.includes(path)) {
      setOpenTabs([...openTabs, path]);
    }
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    const path = newFileName.trim();
    setFiles(prev => ({
      ...prev,
      [path]: '// New file created in mcIDE Studio\n'
    }));
    handleOpenFile(path);
    setNewFileName('');
    setIsCreating(false);
  };

  const fileList = Object.keys(files).sort();

  return (
    <div className="flex flex-col h-full text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-subtle">
        <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
          Explorer: {projectName}
        </span>
        <button
          onClick={() => setIsCreating(!isCreating)}
          title="New File"
          className="p-1 rounded hover:bg-[#22242a] text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* New file input prompt */}
      {isCreating && (
        <div className="p-2 border-b border-subtle bg-[#141517]">
          <input
            type="text"
            placeholder="src/main/.../MyItem.java"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
            autoFocus
            className="w-full bg-[#1e2024] border border-subtle px-2 py-1 text-slate-200 rounded outline-none focus:border-signal text-xs"
          />
          <div className="flex justify-end gap-1 mt-1.5">
            <button
              onClick={() => setIsCreating(false)}
              className="px-2 py-0.5 rounded text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateFile}
              className="px-2.5 py-0.5 rounded bg-signal text-black font-medium"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto py-1">
        {fileList.length === 0 ? (
          <div className="p-4 text-center text-muted">No files in project</div>
        ) : (
          fileList.map((filePath) => {
            const isActive = activeTab === filePath;
            const parts = filePath.split('/');
            const fileName = parts.pop();
            const dir = parts.join('/');

            return (
              <div
                key={filePath}
                onClick={() => handleOpenFile(filePath)}
                className={`group flex items-center justify-between px-3 py-1.5 cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-[#222428] text-slate-100 font-medium'
                    : 'text-slate-300 hover:bg-[#1a1b1e]'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {getFileIcon(filePath)}
                  <div className="truncate">
                    <span className="text-slate-100">{fileName}</span>
                    {dir && (
                      <span className="text-[10px] text-muted ml-1.5 truncate">
                        {dir}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete action */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newFiles = { ...files };
                    delete newFiles[filePath];
                    setFiles(newFiles);
                    setOpenTabs(openTabs.filter(t => t !== filePath));
                    if (activeTab === filePath) {
                      setActiveTab(openTabs[0] || '');
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 text-slate-500 transition-opacity"
                  title="Delete file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
