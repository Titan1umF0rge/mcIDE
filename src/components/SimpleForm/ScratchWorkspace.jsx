import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { 
  Puzzle, 
  Plus, 
  Trash2, 
  MoveVertical, 
  Sparkles, 
  Zap, 
  ShieldAlert, 
  Volume2, 
  Flame,
  HelpCircle,
  Layers
} from 'lucide-react';

export default function ScratchWorkspace() {
  const { activeItemForm, updateFormAndSyncCode } = useWorkspace();
  const [showAddMenu, setShowAddMenu] = useState(false);

  const blocks = activeItemForm.scratchBlocks || [];

  const availableBlocks = [
    { type: 'event', label: 'When Entity Hit (postHit)', eventId: 'post_hit', icon: Zap },
    { type: 'action', label: 'Spawn Particles (SOUL_FIRE_FLAME)', actionId: 'spawn_particles', param: 'SOUL_FIRE_FLAME', icon: Flame },
    { type: 'action', label: 'Apply Potion Effect (Levitation IV)', actionId: 'potion_effect', param: 'LEVITATION', icon: Sparkles },
    { type: 'action', label: 'Strike Lightning at Target', actionId: 'strike_lightning', icon: Zap },
    { type: 'action', label: 'Play Sound (TRIDENT_THUNDER)', actionId: 'play_sound', param: 'ITEM_TRIDENT_THUNDER', icon: Volume2 },
    { type: 'condition', label: 'If Player is Sneaking (isSneaking)', conditionId: 'player_sneaking', icon: ShieldAlert }
  ];

  const handleAddBlock = (blockTemplate) => {
    const newBlock = {
      id: `block-${Date.now()}`,
      ...blockTemplate
    };
    const updated = [...blocks, newBlock];
    updateFormAndSyncCode({ scratchBlocks: updated });
    setShowAddMenu(false);
  };

  const handleDeleteBlock = (blockId) => {
    const updated = blocks.filter(b => b.id !== blockId);
    updateFormAndSyncCode({ scratchBlocks: updated });
  };

  const handleMoveBlock = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;
    const newBlocks = [...blocks];
    const [moved] = newBlocks.splice(index, 1);
    newBlocks.splice(targetIdx, 0, moved);
    updateFormAndSyncCode({ scratchBlocks: newBlocks });
  };

  const getBlockColorClass = (type) => {
    if (type === 'event') return 'border-l-amber-500 bg-[#241c10]';
    if (type === 'action') return 'border-l-blue-500 bg-[#121c2c]';
    if (type === 'condition') return 'border-l-purple-500 bg-[#22152e]';
    return 'border-l-emerald-500 bg-[#112419]';
  };

  return (
    <div className="flex-1 flex flex-col bg-[#141517] rounded-lg border border-subtle overflow-hidden">
      {/* Header */}
      <div className="h-10 bg-[#18191c] border-b border-subtle px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Puzzle className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-xs text-slate-200">
            Scratch-Style Logic Chain
          </span>
          <span className="text-[10px] text-muted px-1.5 py-0.5 rounded bg-[#202226] border border-subtle">
            {blocks.length} nodes connected
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#23252a] hover:bg-[#2e3037] text-slate-200 text-xs font-medium border border-subtle transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-signal" />
            <span>Add Node</span>
          </button>

          {/* Add Node Dropdown */}
          {showAddMenu && (
            <div className="absolute right-0 top-8 w-64 bg-[#1c1d1f] border border-[#383a40] rounded-lg shadow-xl p-1 z-30 space-y-1">
              <div className="px-2 py-1 text-[10px] uppercase font-bold text-muted tracking-wider">
                Select Logic Node
              </div>
              {availableBlocks.map((b, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddBlock(b)}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-[#282a30] text-slate-200 text-xs flex items-center gap-2"
                >
                  <b.icon className="w-3.5 h-3.5 text-signal shrink-0" />
                  <span className="truncate">{b.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Visual Workspace Canvas */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#111214] pixel-canvas-grid">
        <div className="text-[11px] text-muted flex items-center gap-1.5 mb-1">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Execution Flow: Top-to-Bottom. Evaluated during player item use/hit.</span>
        </div>

        {blocks.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-subtle rounded-lg text-muted text-xs">
            No logic blocks connected yet. Click "+ Add Node" to inject custom particle bursts, lightning, or potion effects.
          </div>
        ) : (
          blocks.map((block, idx) => (
            <div
              key={block.id}
              className={`relative rounded-md border-l-4 border-r border-t border-b border-subtle p-3 shadow-md scratch-block ${getBlockColorClass(block.type)}`}
            >
              {/* Connector tab notch on top */}
              {idx > 0 && (
                <div className="absolute -top-2 left-6 w-4 h-2 bg-[#27282b] rounded-t-sm" />
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded bg-black/40 flex items-center justify-center font-mono text-[10px] font-bold text-slate-400">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-100 flex items-center gap-1.5">
                      <span>{block.label}</span>
                      <span className="text-[9px] uppercase px-1 rounded bg-black/30 text-slate-400 font-mono">
                        {block.type}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      {block.actionId || block.eventId || block.conditionId}
                    </div>
                  </div>
                </div>

                {/* Block Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveBlock(idx, -1)}
                    disabled={idx === 0}
                    className="p-1 rounded text-slate-400 hover:text-slate-200 disabled:opacity-30"
                    title="Move Up"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => handleMoveBlock(idx, 1)}
                    disabled={idx === blocks.length - 1}
                    className="p-1 rounded text-slate-400 hover:text-slate-200 disabled:opacity-30"
                    title="Move Down"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => handleDeleteBlock(block.id)}
                    className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-950/40"
                    title="Remove Node"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
