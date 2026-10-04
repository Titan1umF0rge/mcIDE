import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import FileExplorer from './FileExplorer';
import ProjectGenerator from './ProjectGenerator';
import MappingEngineView from './MappingEngineView';
import CompilerRunner from './CompilerRunner';
import SettingsView from './SettingsView';
import CopilotDrawer from '../Copilot/CopilotDrawer';

export default function SidebarDrawer() {
  const { activeSidebarTab } = useWorkspace();

  if (!activeSidebarTab) return null;

  return (
    <div className="w-80 bg-sidebar border-r border-subtle flex flex-col h-full overflow-hidden select-none shrink-0 z-10">
      {activeSidebarTab === 'EXPLORER' && <FileExplorer />}
      {activeSidebarTab === 'PROJECT_GEN' && <ProjectGenerator />}
      {activeSidebarTab === 'MAPPINGS' && <MappingEngineView />}
      {activeSidebarTab === 'COMPILER' && <CompilerRunner />}
      {activeSidebarTab === 'SETTINGS' && <SettingsView />}
      {activeSidebarTab === 'COPILOT' && <CopilotDrawer />}
    </div>
  );
}
