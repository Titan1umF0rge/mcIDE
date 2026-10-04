import React from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import TopBar from './components/TopBar';
import ActivityBar from './components/ActivityBar';
import SidebarDrawer from './components/Sidebar/SidebarDrawer';
import EditorTabBar from './components/Editor/EditorTabBar';
import Breadcrumbs from './components/Editor/Breadcrumbs';
import MonacoCodeEditor from './components/Editor/MonacoCodeEditor';
import SimpleFormDashboard from './components/SimpleForm/SimpleFormDashboard';
import TexturePainterCanvas from './components/AssetStudio/TexturePainterCanvas';
import BottomPanel from './components/Terminal/BottomPanel';
import StatusBar from './components/StatusBar';

function IDEWorkspace() {
  const { currentMode, activeSidebarTab } = useWorkspace();

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0f1011] overflow-hidden select-none">
      {/* Top Application Header */}
      <TopBar />

      {/* Main Center Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Activity Bar */}
        <ActivityBar />

        {/* Collapsible Sidebar Drawer (Explorer, Generators, Mappings, Settings, etc.) */}
        <SidebarDrawer />

        {/* Center Main Stage */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0f1011] overflow-hidden">
          {/* Main workspace view router */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {activeSidebarTab === 'CANVAS' ? (
              <TexturePainterCanvas />
            ) : currentMode === 'SIMPLE_FORM' ? (
              <SimpleFormDashboard />
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                <EditorTabBar />
                <Breadcrumbs />
                <MonacoCodeEditor />
              </div>
            )}
          </div>

          {/* Bottom Docked Panel (Terminal, HotSwap, Compiler) */}
          <BottomPanel />
        </div>
      </div>

      {/* Bottom Status Bar */}
      <StatusBar />
    </div>
  );
}

export default function App() {
  return (
    <WorkspaceProvider>
      <IDEWorkspace />
    </WorkspaceProvider>
  );
}
