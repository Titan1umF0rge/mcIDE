import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { 
  Palette, 
  Paintbrush, 
  Eraser, 
  PaintBucket, 
  Pipette, 
  Download, 
  Check, 
  RotateCcw,
  Sparkles,
  Box,
  Eye
} from 'lucide-react';

export default function TexturePainterCanvas() {
  const { activeItemForm, setFiles, addTerminalLog, projectName } = useWorkspace();
  const [resolution, setResolution] = useState(16); // 16x16, 32x32, 64x64
  const [currentColor, setCurrentColor] = useState('#4dedf0'); // Default diamond cyan
  const [currentAlpha, setCurrentAlpha] = useState(1.0); // 0.0 to 1.0
  const [activeTool, setActiveTool] = useState('PENCIL'); // 'PENCIL' | 'ERASER' | 'BUCKET' | 'PICKER'
  const [isDrawing, setIsDrawing] = useState(false);
  const [hoverCoord, setHoverCoord] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // 2D pixel grid data: 2D array of { r, g, b, a }
  const [pixels, setPixels] = useState(() => {
    const grid = [];
    for (let y = 0; y < 16; y++) {
      const row = [];
      for (let x = 0; x < 16; x++) {
        // Generate sword outline sample default
        if ((x === y && x >= 4 && x <= 12) || (x === y + 1 && x >= 4 && x <= 12)) {
          row.push('rgba(77, 237, 240, 0.95)'); // Cyan blade
        } else if ((x === 3 && y === 13) || (x === 2 && y === 14) || (x === 1 && y === 15)) {
          row.push('rgba(143, 104, 58, 1.0)'); // Wooden hilt
        } else if ((x === 4 && y === 12) || (x === 3 && y === 11) || (x === 5 && y === 13)) {
          row.push('rgba(252, 238, 75, 1.0)'); // Gold crossguard
        } else {
          row.push('rgba(0,0,0,0)'); // Transparent
        }
      }
      grid.push(row);
    }
    return grid;
  });

  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const isometricCanvasRef = useRef(null);

  // Curated Minecraft Material Palette
  const mcPalette = [
    { name: 'Diamond Cyan', color: '#4dedf0' },
    { name: 'Netherite Slate', color: '#3a3536' },
    { name: 'Gold Ingot', color: '#fcee4b' },
    { name: 'Emerald Green', color: '#17dd62' },
    { name: 'Redstone Crimson', color: '#ff2200' },
    { name: 'Iron Silver', color: '#d8d8d8' },
    { name: 'Amethyst Violet', color: '#a678f2' },
    { name: 'Lapis Azure', color: '#2349a1' },
    { name: 'Oak Wood', color: '#8f683a' },
    { name: 'Obsidian Deep', color: '#1a1429' },
    { name: 'Ender Teal', color: '#135c55' },
    { name: 'Blaze Flame', color: '#ff8800' },
    { name: 'Sculk Dark', color: '#03252c' },
    { name: 'Bone White', color: '#e3dccb' },
    { name: 'Coal Charcoal', color: '#262626' },
    { name: 'Ruby Glow', color: '#dc2626' }
  ];

  // Helper to convert hex + alpha to rgba string
  const getRgbaString = (hex, alpha) => {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Re-render main 2D grid canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cellSize = width / resolution;

    ctx.clearRect(0, 0, width, height);

    // Render checkered transparency background
    const checkSize = 10;
    for (let y = 0; y < height; y += checkSize) {
      for (let x = 0; x < width; x += checkSize) {
        ctx.fillStyle = ((x / checkSize + y / checkSize) % 2 === 0) ? '#18191c' : '#141517';
        ctx.fillRect(x, y, checkSize, checkSize);
      }
    }

    // Render painted pixels
    for (let r = 0; r < resolution; r++) {
      for (let c = 0; c < resolution; c++) {
        const color = pixels[r] && pixels[r][c] ? pixels[r][c] : 'rgba(0,0,0,0)';
        if (color !== 'rgba(0,0,0,0)') {
          ctx.fillStyle = color;
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
      }
    }

    // Render grid lines
    ctx.strokeStyle = '#27282b88';
    ctx.lineWidth = 1;
    for (let i = 0; i <= resolution; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(width, i * cellSize);
      ctx.stroke();
    }

    // Render 1x 16px thumbnail preview
    renderThumbnail();
    renderIsometricPreview();
  }, [pixels, resolution]);

  // Render 1:1 pixel thumbnail
  const renderThumbnail = () => {
    const preview = previewCanvasRef.current;
    if (!preview) return;
    const ctx = preview.getContext('2d');
    ctx.clearRect(0, 0, resolution, resolution);
    for (let r = 0; r < resolution; r++) {
      for (let c = 0; c < resolution; c++) {
        ctx.fillStyle = pixels[r] && pixels[r][c] ? pixels[r][c] : 'rgba(0,0,0,0)';
        ctx.fillRect(c, r, 1, 1);
      }
    }
  };

  // Render Live 3D Isometric Voxel Cube Preview
  const renderIsometricPreview = () => {
    const isoCanvas = isometricCanvasRef.current;
    if (!isoCanvas) return;
    const ctx = isoCanvas.getContext('2d');
    const w = isoCanvas.width;
    const h = isoCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw isometric cube center coordinates
    const cx = w / 2;
    const cy = h / 2 - 10;
    const size = 55;

    // Top face
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.lineTo(cx + size * 1.732 * 0.5, cy - size * 0.5);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx - size * 1.732 * 0.5, cy - size * 0.5);
    ctx.closePath();
    ctx.fillStyle = currentColor;
    ctx.fill();
    ctx.strokeStyle = '#383a40';
    ctx.stroke();

    // Left face (shaded darker)
    ctx.beginPath();
    ctx.moveTo(cx - size * 1.732 * 0.5, cy - size * 0.5);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + size);
    ctx.lineTo(cx - size * 1.732 * 0.5, cy + size * 0.5);
    ctx.closePath();
    ctx.fillStyle = '#1c1d1f';
    ctx.fill();
    ctx.strokeStyle = '#383a40';
    ctx.stroke();

    // Right face
    ctx.beginPath();
    ctx.moveTo(cx + size * 1.732 * 0.5, cy - size * 0.5);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + size);
    ctx.lineTo(cx + size * 1.732 * 0.5, cy + size * 0.5);
    ctx.closePath();
    ctx.fillStyle = '#26272b';
    ctx.fill();
    ctx.strokeStyle = '#383a40';
    ctx.stroke();

    // Draw active item floating icon in front of cube
    if (previewCanvasRef.current) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(previewCanvasRef.current, cx - 32, cy - 25, 64, 64);
    }
  };

  // Handle cell click / drag
  const applyToolToCell = useCallback((col, row) => {
    if (col < 0 || col >= resolution || row < 0 || row >= resolution) return;

    if (activeTool === 'PICKER') {
      const picked = pixels[row][col];
      if (picked && picked !== 'rgba(0,0,0,0)') {
        // extract hex or rgb
        setCurrentColor(picked);
      }
      return;
    }

    if (activeTool === 'BUCKET') {
      const targetColor = pixels[row][col];
      const fillColor = getRgbaString(currentColor, currentAlpha);
      if (targetColor === fillColor) return;

      const newGrid = pixels.map(r => [...r]);
      const queue = [[col, row]];
      const visited = new Set();

      while (queue.length > 0) {
        const [x, y] = queue.pop();
        const key = `${x},${y}`;
        if (visited.has(key)) continue;
        visited.add(key);

        if (x >= 0 && x < resolution && y >= 0 && y < resolution) {
          if (newGrid[y][x] === targetColor) {
            newGrid[y][x] = fillColor;
            queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
          }
        }
      }
      setPixels(newGrid);
      return;
    }

    const newColor = activeTool === 'ERASER' ? 'rgba(0,0,0,0)' : getRgbaString(currentColor, currentAlpha);
    if (pixels[row] && pixels[row][col] === newColor) return;

    const newGrid = pixels.map((r, rIdx) => {
      if (rIdx !== row) return r;
      const newRow = [...r];
      newRow[col] = newColor;
      return newRow;
    });
    setPixels(newGrid);
  }, [activeTool, currentColor, currentAlpha, resolution, pixels]);

  const handlePointerDown = (e) => {
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cellSize = rect.width / resolution;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    applyToolToCell(col, row);
  };

  const handlePointerMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cellSize = rect.width / resolution;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (col >= 0 && col < resolution && row >= 0 && row < resolution) {
      setHoverCoord({ x: col, y: row });
      if (isDrawing && activeTool !== 'BUCKET' && activeTool !== 'PICKER') {
        applyToolToCell(col, row);
      }
    } else {
      setHoverCoord(null);
    }
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  // Save texture into active project files
  const handleSaveToProject = () => {
    const preview = previewCanvasRef.current;
    if (!preview) return;
    const dataUrl = preview.toDataURL('image/png');
    
    const texturePath = `assets/${projectName.toLowerCase()}/textures/item/${activeItemForm.id}.png`;
    setFiles(prev => ({
      ...prev,
      [texturePath]: dataUrl
    }));

    addTerminalLog('success', `[ASSET STUDIO] Registered custom texture: ${texturePath}`);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Clear Canvas
  const handleClear = () => {
    const emptyGrid = Array.from({ length: resolution }, () =>
      Array.from({ length: resolution }, () => 'rgba(0,0,0,0)')
    );
    setPixels(emptyGrid);
  };

  return (
    <div className="flex-1 h-full flex flex-col md:flex-row bg-[#0f1011] overflow-hidden p-4 gap-4">
      {/* Left: Tools, Palette & Canvas */}
      <div className="flex-1 bg-[#1c1d1f] rounded-lg border border-subtle flex flex-col overflow-hidden shadow-lg">
        {/* Canvas Header Bar */}
        <div className="h-10 bg-[#161719] border-b border-subtle px-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-pink-400" />
            <span className="font-semibold text-xs text-heading uppercase tracking-wider">
              2D Pixel Asset Painter
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Resolution Selector */}
            <div className="flex bg-[#121315] rounded border border-subtle p-0.5 text-[10px] font-mono">
              {[16, 32].map(res => (
                <button
                  key={res}
                  onClick={() => {
                    setResolution(res);
                    const newGrid = Array.from({ length: res }, () =>
                      Array.from({ length: res }, () => 'rgba(0,0,0,0)')
                    );
                    setPixels(newGrid);
                  }}
                  className={`px-2 py-0.5 rounded font-bold ${
                    resolution === res ? 'bg-signal text-black' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {res}x{res}
                </button>
              ))}
            </div>

            <button
              onClick={handleClear}
              className="p-1 rounded bg-[#202226] hover:bg-[#282a30] text-slate-300 text-xs flex items-center gap-1 border border-subtle"
              title="Clear Canvas"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Canvas Workspace & Tools */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Tool Column */}
          <div className="w-14 bg-[#141517] border-r border-subtle p-2 flex flex-col items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTool('PENCIL')}
              title="Pencil Tool"
              className={`w-9 h-9 rounded flex items-center justify-center transition-all ${
                activeTool === 'PENCIL' ? 'bg-signal text-black shadow-sm' : 'text-slate-400 hover:bg-[#1e2024] hover:text-slate-200'
              }`}
            >
              <Paintbrush className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTool('ERASER')}
              title="Eraser Tool"
              className={`w-9 h-9 rounded flex items-center justify-center transition-all ${
                activeTool === 'ERASER' ? 'bg-signal text-black shadow-sm' : 'text-slate-400 hover:bg-[#1e2024] hover:text-slate-200'
              }`}
            >
              <Eraser className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTool('BUCKET')}
              title="Flood Fill Bucket"
              className={`w-9 h-9 rounded flex items-center justify-center transition-all ${
                activeTool === 'BUCKET' ? 'bg-signal text-black shadow-sm' : 'text-slate-400 hover:bg-[#1e2024] hover:text-slate-200'
              }`}
            >
              <PaintBucket className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTool('PICKER')}
              title="Color Eyedropper"
              className={`w-9 h-9 rounded flex items-center justify-center transition-all ${
                activeTool === 'PICKER' ? 'bg-signal text-black shadow-sm' : 'text-slate-400 hover:bg-[#1e2024] hover:text-slate-200'
              }`}
            >
              <Pipette className="w-4 h-4" />
            </button>

            <div className="w-8 h-px bg-subtle my-1" />

            {/* Current Active Color Swatch */}
            <div
              className="w-7 h-7 rounded border border-white/40 shadow-inner cursor-pointer"
              style={{ backgroundColor: currentColor }}
              title="Current Color"
            />
          </div>

          {/* Interactive HTML5 Drawing Canvas */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 bg-[#0d0e10] overflow-hidden relative">
            <div className="relative shadow-2xl rounded border border-[#383a40] overflow-hidden">
              <canvas
                ref={canvasRef}
                width={384}
                height={384}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                className="cursor-crosshair block"
              />
            </div>

            {/* Hover Coordinate Status */}
            <div className="absolute bottom-2 left-4 text-[10px] font-mono text-muted">
              {hoverCoord ? `Pixel: (${hoverCoord.x}, ${hoverCoord.y}) | Tool: ${activeTool}` : `Grid: ${resolution}x${resolution}`}
            </div>
          </div>
        </div>

        {/* Bottom Palette & Opacity Bar */}
        <div className="p-3 bg-[#161719] border-t border-subtle flex flex-wrap items-center justify-between gap-3">
          {/* Minecraft Curated Palette */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-medium text-slate-400 mr-1">Palette:</span>
            {mcPalette.map(item => (
              <button
                key={item.name}
                onClick={() => {
                  setCurrentColor(item.color);
                  if (activeTool === 'ERASER') setActiveTool('PENCIL');
                }}
                className={`w-5 h-5 rounded-sm border transition-transform hover:scale-125 ${
                  currentColor === item.color ? 'border-white scale-110 shadow-sm' : 'border-black/50'
                }`}
                style={{ backgroundColor: item.color }}
                title={item.name}
              />
            ))}
          </div>

          {/* Alpha Slider */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-slate-400">Opacity:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={currentAlpha}
              onChange={(e) => setCurrentAlpha(parseFloat(e.target.value))}
              className="w-20 cursor-pointer"
            />
            <span className="font-mono text-[10px] text-slate-300 w-8">
              {Math.round(currentAlpha * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Right: Live 3D Voxel / Isometric Block Preview & Save */}
      <div className="w-full md:w-80 bg-[#1c1d1f] rounded-lg border border-subtle flex flex-col overflow-hidden shrink-0 shadow-lg">
        <div className="h-10 bg-[#161719] border-b border-subtle px-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-xs text-heading uppercase tracking-wider">
              3D Live Voxel View
            </span>
          </div>
          <span className="text-[10px] font-mono text-signal bg-green-950/40 border border-green-800/60 px-1.5 py-0.5 rounded">
            Realtime
          </span>
        </div>

        <div className="flex-1 p-4 flex flex-col items-center justify-center bg-[#111214]">
          {/* Isometric preview canvas */}
          <div className="relative w-48 h-48 rounded-lg bg-[#0d0e10] border border-subtle flex items-center justify-center overflow-hidden shadow-inner">
            <canvas
              ref={isometricCanvasRef}
              width={192}
              height={192}
              className="block"
            />
          </div>

          {/* 1:1 Pixel Hidden Canvas for PNG Data Export */}
          <canvas
            ref={previewCanvasRef}
            width={resolution}
            height={resolution}
            className="hidden"
          />

          <div className="text-[11px] text-slate-400 text-center mt-3">
            Realtime sprite mapped onto isometric rendering. Updates live as you paint.
          </div>
        </div>

        {/* Save & Apply Action Buttons */}
        <div className="p-3 bg-[#161719] border-t border-subtle space-y-2">
          <button
            onClick={handleSaveToProject}
            className="w-full py-2 rounded bg-signal hover:bg-green-400 text-black font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md glow-compiler-sm transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Apply Texture to {activeItemForm.id}.png</span>
          </button>

          {savedSuccess && (
            <div className="p-2 rounded bg-green-950/60 border border-green-700/60 text-green-300 text-center text-xs flex items-center justify-center gap-1 animate-fadeIn">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Texture saved into project assets!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
