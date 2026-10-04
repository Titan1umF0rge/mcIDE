const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // File System
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('fs:writeFile', { filePath, content }),
  readDir: (dirPath) => ipcRenderer.invoke('fs:readDir', dirPath),
  exists: (path) => ipcRenderer.invoke('fs:exists', path),
  selectDirectory: () => ipcRenderer.invoke('fs:selectDirectory'),

  // Build & Compilation
  packageZip: (sourceDir, outputZipPath) => ipcRenderer.invoke('build:packageZip', { sourceDir, outputZipPath }),
  executeCommand: (command, args, cwd, env) => ipcRenderer.invoke('build:executeCommand', { command, args, cwd, env }),
  injectArtifact: (sourceArtifact, destinationFolder) => ipcRenderer.invoke('build:inject', { sourceArtifact, destinationFolder }),

  // Hot Swap
  startHotSwap: (watchPath, targetInjectPath, enabled) => ipcRenderer.invoke('hotswap:start', { watchPath, targetInjectPath, enabled }),
  stopHotSwap: () => ipcRenderer.invoke('hotswap:stop'),

  // Mojang Versions & System
  fetchMojangVersions: () => ipcRenderer.invoke('mojang:fetchVersions'),
  getSystemPaths: () => ipcRenderer.invoke('system:getPaths'),

  // Event Listeners
  onCompilerLog: (callback) => {
    const handler = (_, data) => callback(data);
    ipcRenderer.on('compiler:log', handler);
    return () => ipcRenderer.removeListener('compiler:log', handler);
  },
  onHotSwapEvent: (callback) => {
    const handler = (_, data) => callback(data);
    ipcRenderer.on('hotswap:event', handler);
    return () => ipcRenderer.removeListener('hotswap:event', handler);
  }
});
