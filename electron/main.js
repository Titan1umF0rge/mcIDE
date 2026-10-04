const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');
const AdmZip = require('adm-zip');
const chokidar = require('chokidar');
const axios = require('axios');
const log = require('electron-log');

log.info('Starting mcIDE Studio Main Process...');

let mainWindow = null;
let fileWatcher = null;
let currentWatchedPath = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1480,
    height: 940,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: '#0f1011',
    frame: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#161719',
      symbolColor: '#cbd5e1',
      height: 38
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
    icon: path.join(__dirname, '../public/icon.png')
  });

  const devUrl = 'http://localhost:5173';
  const prodPath = path.join(__dirname, '../dist/index.html');

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL(devUrl).catch(() => {
      // If dev server not yet ready, retry or load dist
      setTimeout(() => mainWindow.loadURL(devUrl), 1500);
    });
  } else {
    mainWindow.loadFile(prodPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (fileWatcher) {
      fileWatcher.close();
    }
  });
}

app.whenReady().then(() => {
  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Setup IPC Communications
function setupIpcHandlers() {
  // File System Operations
  ipcMain.handle('fs:readFile', async (_, filePath) => {
    try {
      return await fs.promises.readFile(filePath, 'utf-8');
    } catch (err) {
      log.error(`fs:readFile error for ${filePath}:`, err);
      throw err;
    }
  });

  ipcMain.handle('fs:writeFile', async (_, { filePath, content }) => {
    try {
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(filePath, content, 'utf-8');
      return { success: true };
    } catch (err) {
      log.error(`fs:writeFile error for ${filePath}:`, err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('fs:readDir', async (_, dirPath) => {
    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      return entries.map(entry => ({
        name: entry.name,
        isDirectory: entry.isDirectory(),
        path: path.join(dirPath, entry.name)
      }));
    } catch (err) {
      log.error(`fs:readDir error for ${dirPath}:`, err);
      return [];
    }
  });

  ipcMain.handle('fs:exists', async (_, checkPath) => {
    return fs.existsSync(checkPath);
  });

  ipcMain.handle('fs:selectDirectory', async () => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory', 'createDirectory']
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  // Adm-Zip Package Builder (Datapacks, Resourcepacks, Mod zips)
  ipcMain.handle('build:packageZip', async (_, { sourceDir, outputZipPath }) => {
    try {
      log.info(`Packaging zip from ${sourceDir} -> ${outputZipPath}`);
      const zip = new AdmZip();

      // Ensure target directory exists
      await fs.promises.mkdir(path.dirname(outputZipPath), { recursive: true });

      // Add local folder recursively
      zip.addLocalFolder(sourceDir);
      zip.writeZip(outputZipPath);

      const stats = await fs.promises.stat(outputZipPath);
      return {
        success: true,
        outputZipPath,
        sizeBytes: stats.size,
        fileCount: zip.getEntries().length
      };
    } catch (err) {
      log.error('Zip packaging error:', err);
      return { success: false, error: err.message };
    }
  });

  // Gradle / Maven / CLI Command Runner with live streaming logs
  ipcMain.handle('build:executeCommand', async (event, { command, args, cwd, env = {} }) => {
    return new Promise((resolve) => {
      log.info(`Executing compilation command: ${command} ${args.join(' ')} in ${cwd}`);

      const mergedEnv = {
        ...process.env,
        ...env
      };

      const proc = spawn(command, args, {
        cwd: cwd || process.cwd(),
        shell: true,
        env: mergedEnv
      });

      let fullStdout = '';
      let fullStderr = '';

      proc.stdout.on('data', (data) => {
        const text = data.toString();
        fullStdout += text;
        if (mainWindow) {
          mainWindow.webContents.send('compiler:log', { stream: 'stdout', text });
        }
      });

      proc.stderr.on('data', (data) => {
        const text = data.toString();
        fullStderr += text;
        if (mainWindow) {
          mainWindow.webContents.send('compiler:log', { stream: 'stderr', text });
        }
      });

      proc.on('close', (code) => {
        log.info(`Process finished with exit code: ${code}`);
        resolve({
          exitCode: code,
          stdout: fullStdout,
          stderr: fullStderr,
          success: code === 0
        });
      });

      proc.on('error', (err) => {
        log.error('Process spawn error:', err);
        if (mainWindow) {
          mainWindow.webContents.send('compiler:log', { stream: 'stderr', text: `Spawn Error: ${err.message}\n` });
        }
        resolve({
          exitCode: -1,
          stdout: fullStdout,
          stderr: err.message,
          success: false
        });
      });
    });
  });

  // Game Environment Injection (Copies .jar / .zip to .minecraft/mods or test server)
  ipcMain.handle('build:inject', async (_, { sourceArtifact, destinationFolder }) => {
    try {
      if (!fs.existsSync(sourceArtifact)) {
        return { success: false, error: `Source artifact not found: ${sourceArtifact}` };
      }

      await fs.promises.mkdir(destinationFolder, { recursive: true });
      const fileName = path.basename(sourceArtifact);
      const destinationFile = path.join(destinationFolder, fileName);

      await fs.promises.copyFile(sourceArtifact, destinationFile);
      const stats = await fs.promises.stat(destinationFile);

      log.info(`Artifact successfully injected into: ${destinationFile}`);
      return {
        success: true,
        destinationFile,
        sizeBytes: stats.size,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      log.error('Injection error:', err);
      return { success: false, error: err.message };
    }
  });

  // Chokidar Hot-Swap File System Watcher
  ipcMain.handle('hotswap:start', async (_, { watchPath, targetInjectPath, enabled }) => {
    try {
      if (fileWatcher) {
        fileWatcher.close();
      }

      currentWatchedPath = watchPath;
      log.info(`Starting Hot-Swap watcher on: ${watchPath}`);

      fileWatcher = chokidar.watch(watchPath, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
        ignoreInitial: true,
        depth: 5
      });

      fileWatcher.on('all', async (event, changedFilePath) => {
        const relativePath = path.relative(watchPath, changedFilePath);
        log.info(`HotSwap detected ${event} on: ${relativePath}`);

        if (mainWindow) {
          mainWindow.webContents.send('hotswap:event', {
            event,
            relativePath,
            fullPath: changedFilePath,
            timestamp: new Date().toLocaleTimeString()
          });
        }

        // If enabled and target folder provided, live copy changed assets
        if (enabled && targetInjectPath && fs.existsSync(targetInjectPath)) {
          try {
            const destPath = path.join(targetInjectPath, relativePath);
            if (event === 'add' || event === 'change') {
              await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
              await fs.promises.copyFile(changedFilePath, destPath);
              if (mainWindow) {
                mainWindow.webContents.send('compiler:log', {
                  stream: 'stdout',
                  text: `[HOTSWAP] Live mirrored: ${relativePath} -> target runtime\n`
                });
              }
            }
          } catch (copyErr) {
            log.warn('HotSwap auto-copy warning:', copyErr);
          }
        }
      });

      return { success: true };
    } catch (err) {
      log.error('HotSwap start failed:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('hotswap:stop', async () => {
    if (fileWatcher) {
      await fileWatcher.close();
      fileWatcher = null;
      log.info('HotSwap watcher stopped.');
    }
    return { success: true };
  });

  // Mojang Versions Fetcher (using live launchermeta with fallback)
  ipcMain.handle('mojang:fetchVersions', async () => {
    try {
      const response = await axios.get('https://launchermeta.mojang.com/mc/game/version_manifest_v2.json', {
        timeout: 5000
      });
      return {
        success: true,
        latest: response.data.latest,
        versions: response.data.versions.slice(0, 40).map(v => ({
          id: v.id,
          type: v.type,
          releaseTime: v.releaseTime
        }))
      };
    } catch (err) {
      log.warn('Failed to fetch live Mojang versions, returning offline cached list:', err.message);
      return {
        success: false,
        latest: { release: '1.21.4', snapshot: '24w50a' },
        versions: [
          { id: '1.21.4', type: 'release', releaseTime: '2024-12-03' },
          { id: '1.21.3', type: 'release', releaseTime: '2024-10-23' },
          { id: '1.21.1', type: 'release', releaseTime: '2024-08-08' },
          { id: '1.21', type: 'release', releaseTime: '2024-06-13' },
          { id: '1.20.4', type: 'release', releaseTime: '2023-12-07' },
          { id: '1.20.2', type: 'release', releaseTime: '2023-09-21' },
          { id: '1.20.1', type: 'release', releaseTime: '2023-06-12' },
          { id: '1.19.4', type: 'release', releaseTime: '2023-03-14' },
          { id: '1.18.2', type: 'release', releaseTime: '2022-02-28' },
          { id: '1.16.5', type: 'release', releaseTime: '2021-01-15' }
        ]
      };
    }
  });

  // Default system paths detection
  ipcMain.handle('system:getPaths', async () => {
    const isWin = process.platform === 'win32';
    const homeDir = app.getPath('home');
    let dotMinecraft = path.join(homeDir, '.minecraft');

    if (isWin && process.env.APPDATA) {
      dotMinecraft = path.join(process.env.APPDATA, '.minecraft');
    }

    return {
      dotMinecraft,
      home: homeDir,
      appData: app.getPath('appData')
    };
  });
}
