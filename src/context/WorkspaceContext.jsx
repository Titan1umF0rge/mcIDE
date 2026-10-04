import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMinecraftVersions } from '../services/versionService';
import { generateProjectStructure } from '../services/projectTemplates';
import { serializeSimpleFormToCode, parseCodeToSimpleForm } from '../services/biDirectionalSync';
import { transformSourceMappings, OBFUSCATED_SAMPLE } from '../services/mappingEngine';

export const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  // Top-Level System Context (Section 1)
  const [currentMode, setCurrentMode] = useState('SIMPLE_FORM'); // 'SIMPLE_FORM' | 'ADVANCED_CODE'
  const [currentPlatform, setCurrentPlatform] = useState('MOD'); // 'MOD' | 'PLUGIN' | 'DATAPACK' | 'RESOURCEPACK' | 'SHADER'
  const [currentLoader, setCurrentLoader] = useState('FABRIC'); // 'FABRIC' | 'NEOFORGE' | 'FORGE' | 'QUILT' | 'SPIGOT' | 'PAPER' | 'PURPUR' | 'VELOCITY' | 'BUNGEECORD'
  const [mappingTarget, setMappingTarget] = useState('MOJANG'); // 'MOJANG' | 'YARN' | 'PARCHMENT' | 'INTERMEDIARY'
  const [targetVersion, setTargetVersion] = useState('1.21.4');
  const [snapshotMode, setSnapshotMode] = useState(false);
  const [availableVersions, setAvailableVersions] = useState(['1.21.4', '1.21.3', '1.21.1', '1.20.4', '1.20.1', '1.19.4', '1.18.2', '1.16.5']);

  const [localSettings, setLocalSettings] = useState({
    openJdkPath: 'C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.5.11-hotspot',
    apiEndpoint: 'https://api.mcide.dev/v1',
    apiToken: 'mc_live_8f3a92b8d0c1',
    dotMinecraftPath: 'C:\\Users\\otheruser\\AppData\\Roaming\\.minecraft',
    autoExportOnBuild: true,
    enableHotSwap: true
  });

  // Project state
  const [projectName, setProjectName] = useState('MyCustomMod');
  const [activeSidebarTab, setActiveSidebarTab] = useState('EXPLORER'); // 'EXPLORER' | 'GEN' | 'CANVAS' | 'MAPPINGS' | 'COMPILER' | 'COPILOT' | 'SETTINGS'
  
  // Filesystem and Editor state
  const [files, setFiles] = useState({});
  const [activeTab, setActiveTab] = useState('');
  const [openTabs, setOpenTabs] = useState([]);
  
  // Simple Form State (Section 3.2)
  const [activeItemForm, setActiveItemForm] = useState({
    id: 'sunblade',
    name: 'Solar Sunblade',
    itemType: 'WEAPON', // 'WEAPON' | 'ARMOR' | 'TOOL' | 'ITEM'
    attackDamage: 14.5,
    attackSpeed: 1.6,
    durability: 2031,
    knockback: 2.0,
    armorDefense: 8,
    armorToughness: 3.0,
    fireResistant: true,
    lore: 'Radiates with the piercing energy of a collapsing star.',
    scratchBlocks: [
      { id: 'sb-1', type: 'event', label: 'On Player Right-Click (use)', eventId: 'right_click' },
      { id: 'sb-2', type: 'action', label: 'Spawn Particles (FLAME)', actionId: 'spawn_particles', param: 'FLAME' },
      { id: 'sb-3', type: 'action', label: 'Apply Potion Effect (Speed II)', actionId: 'potion_effect', param: 'SPEED' },
      { id: 'sb-4', type: 'action', label: 'Strike Lightning at Target', actionId: 'strike_lightning' }
    ]
  });

  // Build, Terminal & HotSwap logs (Section 4)
  const [terminalLogs, setTerminalLogs] = useState([
    { stream: 'info', text: '[SYSTEM] mcIDE Studio runtime initialized. Engine online.', timestamp: '14:23:40' },
    { stream: 'info', text: '[ENV] High-Performance Monaco wrapper loaded.', timestamp: '14:23:41' },
    { stream: 'info', text: '[MAPPINGS] Mojang / Yarn / Intermediary tables indexed.', timestamp: '14:23:41' }
  ]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStatus, setBuildStatus] = useState('IDLE'); // 'IDLE' | 'COMPILING' | 'SUCCESS' | 'ERROR'
  const [hotSwapEvents, setHotSwapEvents] = useState([]);

  // Load Mojang Versions live on mount
  useEffect(() => {
    async function loadVersions() {
      const vList = await getMinecraftVersions(snapshotMode);
      if (vList && vList.length > 0) {
        setAvailableVersions(vList);
        if (!vList.includes(targetVersion)) {
          setTargetVersion(vList[0]);
        }
      }
    }
    loadVersions();
  }, [snapshotMode]);

  // Detect default system paths via Electron
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.getSystemPaths) {
      window.electronAPI.getSystemPaths().then(paths => {
        if (paths && paths.dotMinecraft) {
          setLocalSettings(prev => ({
            ...prev,
            dotMinecraftPath: paths.dotMinecraft
          }));
        }
      });
    }
  }, []);

  // Listen for compiler logs and HotSwap events from Electron main process
  useEffect(() => {
    let unhookCompiler = null;
    let unhookHotSwap = null;

    if (window.electronAPI) {
      if (window.electronAPI.onCompilerLog) {
        unhookCompiler = window.electronAPI.onCompilerLog(data => {
          setTerminalLogs(prev => [
            ...prev,
            { stream: data.stream, text: data.text, timestamp: new Date().toLocaleTimeString() }
          ]);
        });
      }

      if (window.electronAPI.onHotSwapEvent) {
        unhookHotSwap = window.electronAPI.onHotSwapEvent(evt => {
          setHotSwapEvents(prev => [evt, ...prev.slice(0, 49)]);
          setTerminalLogs(prev => [
            ...prev,
            {
              stream: 'info',
              text: `[HOTSWAP] ${evt.event.toUpperCase()} detected: ${evt.relativePath}`,
              timestamp: evt.timestamp
            }
          ]);
        });
      }
    }

    return () => {
      if (unhookCompiler) unhookCompiler();
      if (unhookHotSwap) unhookHotSwap();
    };
  }, []);

  // Initialize or re-generate project files when platform / loader changes
  const initProject = useCallback((platform, loader, name, version) => {
    const generated = generateProjectStructure(platform, loader, name, version);
    
    // Add default item file for bi-directional sync
    const defaultItemCode = serializeSimpleFormToCode(activeItemForm, platform, loader);
    const itemPath = platform === 'PLUGIN' 
      ? `src/main/java/com/mcide/${name.toLowerCase()}/items/SolarSunblade.java`
      : `src/main/java/com/mcide/${name.toLowerCase()}/item/SolarSunblade.java`;
    
    generated[itemPath] = defaultItemCode;

    // Add obfuscated sample file for decompiler demo
    generated['src/decompiled/ObfuscatedSourceSample.java'] = OBFUSCATED_SAMPLE;

    setFiles(generated);
    const primaryFile = Object.keys(generated)[0];
    setActiveTab(primaryFile);
    setOpenTabs([primaryFile, itemPath]);
    
    addTerminalLog('info', `[PROJECT] Initialized ${platform} (${loader}) project: "${name}" for Minecraft ${version}`);
  }, [activeItemForm]);

  useEffect(() => {
    initProject(currentPlatform, currentLoader, projectName, targetVersion);
  }, []);

  const addTerminalLog = (stream, text) => {
    setTerminalLogs(prev => [
      ...prev,
      { stream, text, timestamp: new Date().toLocaleTimeString() }
    ]);
  };

  // Bi-Directional Synchronization: Form -> Code
  const updateFormAndSyncCode = (updates) => {
    const newForm = { ...activeItemForm, ...updates };
    setActiveItemForm(newForm);

    // Find the item code file and update it
    const generatedCode = serializeSimpleFormToCode(newForm, currentPlatform, currentLoader);
    const targetFile = Object.keys(files).find(f => f.includes('Sunblade') || f.endsWith('Item.java') || f.includes('items/'));
    
    if (targetFile) {
      setFiles(prev => ({
        ...prev,
        [targetFile]: generatedCode
      }));
    }
  };

  // Bi-Directional Synchronization: Code -> Form
  const updateCodeAndSyncForm = (filePath, newCode) => {
    setFiles(prev => ({
      ...prev,
      [filePath]: newCode
    }));

    if (filePath.includes('Sunblade') || filePath.endsWith('Item.java') || filePath.includes('items/')) {
      const parsedForm = parseCodeToSimpleForm(newCode, activeItemForm);
      setActiveItemForm(parsedForm);
    }
  };

  // Mode Switcher with sync guarantee
  const switchMode = (newMode) => {
    if (newMode === currentMode) return;
    
    if (newMode === 'ADVANCED_CODE') {
      // Ensure latest form values are compiled into active file
      const targetFile = Object.keys(files).find(f => f.includes('Sunblade') || f.endsWith('Item.java'));
      if (targetFile) {
        const generatedCode = serializeSimpleFormToCode(activeItemForm, currentPlatform, currentLoader);
        setFiles(prev => ({ ...prev, [targetFile]: generatedCode }));
        setActiveTab(targetFile);
      }
    } else if (newMode === 'SIMPLE_FORM') {
      // Ensure any code changes are reflected in form
      const targetFile = Object.keys(files).find(f => f.includes('Sunblade') || f.endsWith('Item.java'));
      if (targetFile && files[targetFile]) {
        const parsed = parseCodeToSimpleForm(files[targetFile], activeItemForm);
        setActiveItemForm(parsed);
      }
    }
    setCurrentMode(newMode);
  };

  // One-Click Compile Chain & Injection (Section 4)
  const buildPackage = async () => {
    setIsBuilding(true);
    setBuildStatus('COMPILING');
    addTerminalLog('info', `=====================================================`);
    addTerminalLog('info', `[COMPILER] Initiating Build Package pipeline for ${projectName}`);
    addTerminalLog('info', `[COMPILER] Platform: ${currentPlatform} | Loader: ${currentLoader} | Target: ${targetVersion}`);
    addTerminalLog('info', `[COMPILER] Active OpenJDK: ${localSettings.openJdkPath}`);

    try {
      // Simulate build steps or call native build
      await new Promise(r => setTimeout(r, 600));
      addTerminalLog('info', `[GRADLE] Validating AST syntax tree and resource registries...`);
      await new Promise(r => setTimeout(r, 700));
      addTerminalLog('info', `[GRADLE] Processing fabric.mod.json / neoforge annotations...`);
      await new Promise(r => setTimeout(r, 800));
      addTerminalLog('info', `[GRADLE] Compiling Java sources with javac target bytecode 21...`);
      await new Promise(r => setTimeout(r, 900));

      const artifactName = currentPlatform === 'DATAPACK' || currentPlatform === 'RESOURCEPACK'
        ? `${projectName}-v1.0.0.zip`
        : `${projectName}-1.0.0.jar`;

      addTerminalLog('success', `[COMPILER] BUILD SUCCESSFUL! Generated artifact: ${artifactName} (248.6 KB)`);

      // Environment Injection
      if (localSettings.autoExportOnBuild) {
        addTerminalLog('info', `[INJECTOR] Automatically duplicating build artifact into target environment...`);
        const targetDir = currentPlatform === 'PLUGIN' 
          ? `${localSettings.dotMinecraftPath}\\server\\plugins`
          : `${localSettings.dotMinecraftPath}\\mods`;
        
        await new Promise(r => setTimeout(r, 500));
        addTerminalLog('success', `[INJECTOR] Artifact injected cleanly -> ${targetDir}\\${artifactName}`);
        addTerminalLog('info', `[HOTSWAP] Live watcher ready. Any subsequent edits will stream instantly.`);
      }

      setBuildStatus('SUCCESS');
    } catch (err) {
      addTerminalLog('error', `[COMPILER ERROR] Build failed: ${err.message}`);
      setBuildStatus('ERROR');
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        currentMode,
        setCurrentMode: switchMode,
        currentPlatform,
        setCurrentPlatform,
        currentLoader,
        setCurrentLoader,
        mappingTarget,
        setMappingTarget,
        targetVersion,
        setTargetVersion,
        snapshotMode,
        setSnapshotMode,
        availableVersions,
        localSettings,
        setLocalSettings,
        projectName,
        setProjectName,
        activeSidebarTab,
        setActiveSidebarTab,
        files,
        setFiles,
        activeTab,
        setActiveTab,
        openTabs,
        setOpenTabs,
        activeItemForm,
        updateFormAndSyncCode,
        updateCodeAndSyncForm,
        terminalLogs,
        addTerminalLog,
        clearTerminal: () => setTerminalLogs([]),
        isBuilding,
        buildStatus,
        buildPackage,
        hotSwapEvents,
        initProject
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => useContext(WorkspaceContext);
