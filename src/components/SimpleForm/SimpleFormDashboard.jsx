import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import ScratchWorkspace from './ScratchWorkspace';
import { 
  Sword, 
  Shield, 
  Pickaxe, 
  Box, 
  Flame, 
  Zap, 
  Sliders, 
  Layers, 
  Heart,
  Gauge
} from 'lucide-react';

export default function SimpleFormDashboard() {
  const { activeItemForm, updateFormAndSyncCode, setCurrentMode } = useWorkspace();

  const isWeaponOrArmor = activeItemForm.itemType === 'WEAPON' || activeItemForm.itemType === 'ARMOR';

  const itemTypes = [
    { id: 'WEAPON', label: 'Weapon', icon: Sword },
    { id: 'ARMOR', label: 'Armor Piece', icon: Shield },
    { id: 'TOOL', label: 'Utility Tool', icon: Pickaxe },
    { id: 'ITEM', label: 'Generic Item', icon: Box }
  ];

  return (
    <div className="flex-1 h-full flex flex-col md:flex-row bg-[#0f1011] overflow-hidden p-4 gap-4">
      {/* Left Column: Item Configuration Card Grid (#1c1d1f) */}
      <div className="w-full md:w-[480px] bg-[#1c1d1f] rounded-lg border border-subtle flex flex-col overflow-hidden shrink-0 shadow-lg">
        {/* Card Header */}
        <div className="h-10 bg-[#161719] border-b border-subtle px-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-signal" />
            <span className="font-semibold text-xs text-heading uppercase tracking-wider">
              Item Specification Profile
            </span>
          </div>
          <span className="text-[10px] font-mono text-signal bg-green-950/40 border border-green-800/60 px-1.5 py-0.5 rounded">
            Live Synchronized
          </span>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {/* Item Identifier & Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Item Name
              </label>
              <input
                type="text"
                value={activeItemForm.name}
                onChange={(e) => updateFormAndSyncCode({ name: e.target.value })}
                className="w-full bg-[#141517] border border-subtle px-2.5 py-1.5 text-slate-100 rounded text-xs outline-none focus:border-signal"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Resource Identifier (ID)
              </label>
              <input
                type="text"
                value={activeItemForm.id}
                onChange={(e) => updateFormAndSyncCode({ id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                className="w-full bg-[#141517] border border-subtle px-2.5 py-1.5 text-slate-100 rounded text-xs font-mono outline-none focus:border-signal"
              />
            </div>
          </div>

          {/* Item Type Selector */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {itemTypes.map(t => {
                const Icon = t.icon;
                const isSelected = activeItemForm.itemType === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => updateFormAndSyncCode({ itemType: t.id })}
                    className={`py-2 px-1 rounded flex flex-col items-center gap-1 border transition-all ${
                      isSelected
                        ? 'bg-[#22242a] border-signal text-signal shadow-sm'
                        : 'bg-[#141517] border-subtle text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] font-medium">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional Sliders for Weapon / Armor (Section 3.2) */}
          {isWeaponOrArmor && (
            <div className="p-3 rounded-lg bg-[#141517] border border-subtle space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200 border-b border-subtle pb-1.5">
                <span className="flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-signal" />
                  <span>Combat & Defense Attributes</span>
                </span>
                <span className="text-[10px] text-muted">Tier: Netherite Class</span>
              </div>

              {/* Attack Damage Slider (0.0 to 50.0) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Attack Damage</span>
                  <span className="font-mono text-signal font-bold">{activeItemForm.attackDamage.toFixed(1)} ❤</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="0.5"
                  value={activeItemForm.attackDamage}
                  onChange={(e) => updateFormAndSyncCode({ attackDamage: parseFloat(e.target.value) })}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-muted mt-0.5 font-mono">
                  <span>0 (Fist)</span>
                  <span>14 (Katana)</span>
                  <span>50 (God Weapon)</span>
                </div>
              </div>

              {/* Attack Speed Slider (0.5 to 4.0) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Attack Speed Modifier</span>
                  <span className="font-mono text-blue-400 font-bold">{activeItemForm.attackSpeed.toFixed(1)} /s</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.1"
                  value={activeItemForm.attackSpeed}
                  onChange={(e) => updateFormAndSyncCode({ attackSpeed: parseFloat(e.target.value) })}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-muted mt-0.5 font-mono">
                  <span>0.5 (Heavy Axe)</span>
                  <span>1.6 (Sword)</span>
                  <span>4.0 (Dagger Rapid)</span>
                </div>
              </div>

              {/* Knockback Slider (0.0 to 10.0) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Knockback Bonus</span>
                  <span className="font-mono text-purple-400 font-bold">+{activeItemForm.knockback.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={activeItemForm.knockback}
                  onChange={(e) => updateFormAndSyncCode({ knockback: parseFloat(e.target.value) })}
                  className="w-full cursor-pointer"
                />
              </div>

              {/* Durability Traits (1 to 5000) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Max Durability</span>
                  <span className="font-mono text-amber-400 font-bold">{activeItemForm.durability} uses</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="5000"
                  step="50"
                  value={activeItemForm.durability}
                  onChange={(e) => updateFormAndSyncCode({ durability: parseInt(e.target.value, 10) })}
                  className="w-full cursor-pointer"
                />
              </div>

              {/* Armor Defense (if Armor) */}
              {activeItemForm.itemType === 'ARMOR' && (
                <>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">Armor Defense</span>
                      <span className="font-mono text-emerald-400 font-bold">{activeItemForm.armorDefense} 🛡</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="1"
                      value={activeItemForm.armorDefense}
                      onChange={(e) => updateFormAndSyncCode({ armorDefense: parseInt(e.target.value, 10) })}
                      className="w-full cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">Armor Toughness</span>
                      <span className="font-mono text-cyan-400 font-bold">+{activeItemForm.armorToughness.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={activeItemForm.armorToughness}
                      onChange={(e) => updateFormAndSyncCode({ armorToughness: parseFloat(e.target.value) })}
                      className="w-full cursor-pointer"
                    />
                  </div>
                </>
              )}

              {/* Fire-resistant toggle */}
              <div className="flex items-center justify-between pt-1 border-t border-subtle">
                <span className="text-xs text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Fire / Lava Resistant (Netherite Property)</span>
                </span>
                <input
                  type="checkbox"
                  checked={activeItemForm.fireResistant}
                  onChange={(e) => updateFormAndSyncCode({ fireResistant: e.target.checked })}
                  className="accent-signal w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Lore / Description */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Item Lore & Flavor Text
            </label>
            <textarea
              rows="2"
              value={activeItemForm.lore}
              onChange={(e) => updateFormAndSyncCode({ lore: e.target.value })}
              className="w-full bg-[#141517] border border-subtle px-2.5 py-1.5 text-slate-100 rounded text-xs outline-none focus:border-signal resize-none"
            />
          </div>
        </div>
      </div>

      {/* Right Column: Adjacent Visual "Scratch-style" Drag-and-Drop Workspace Container */}
      <ScratchWorkspace />
    </div>
  );
}
