import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ArrowRight, 
  Code2, 
  Check, 
  Zap, 
  Copy,
  Layers,
  Terminal
} from 'lucide-react';

export default function CopilotDrawer() {
  const { 
    currentMode, 
    activeItemForm, 
    updateFormAndSyncCode, 
    files, 
    setFiles, 
    activeTab, 
    addTerminalLog,
    currentPlatform,
    currentLoader
  } = useWorkspace();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hello! I am your mcIDE Copilot Vector Assistant. \n• In **Simple Mode**, tell me what item you'd like to construct (e.g. "Create a Frostmourne blade with 18 damage and freeze potion effect").\n• In **Advanced Mode**, ask me for Mixins, Fabric callbacks, Paper listeners, or Datapack functions to insert directly into your file.`,
      timestamp: 'Just now'
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const quickPrompts = [
    { label: '⚡ Thunder Katana', prompt: 'Create a Thunder Katana with 16.5 attack damage, 2.2 attack speed, fire resistance, and lightning on right click' },
    { label: '🛡️ Netherite Aegis Armor', prompt: 'Create a Netherite Aegis Armor piece with 12 defense, 4 toughness, and speed potion boost' },
    { label: '💉 Fabric Fall Damage Mixin', prompt: 'Generate a Fabric Mixin targeting ServerPlayerEntity to cancel fall damage' },
    { label: '📜 Paper Inventory GUI', prompt: 'Generate a Paper event listener for a custom 27-slot administrative GUI' }
  ];

  const handleSend = (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg = { role: 'user', text: query, timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsProcessing(true);

    setTimeout(() => {
      processAiQuery(query);
      setIsProcessing(false);
    }, 600);
  };

  const processAiQuery = (query) => {
    const lower = query.toLowerCase();

    if (currentMode === 'SIMPLE_FORM' || lower.includes('katana') || lower.includes('armor') || lower.includes('sword') || lower.includes('damage')) {
      // Alter visual block forms directly
      let newDmg = activeItemForm.attackDamage;
      let newSpeed = activeItemForm.attackSpeed;
      let newName = activeItemForm.name;
      let newId = activeItemForm.id;
      let newType = activeItemForm.itemType;
      let newDefense = activeItemForm.armorDefense;
      let newTough = activeItemForm.armorToughness;

      const dmgMatch = query.match(/([0-9.]+)\s*(?:damage|dmg|attack damage)/i);
      if (dmgMatch) newDmg = parseFloat(dmgMatch[1]);

      const speedMatch = query.match(/([0-9.]+)\s*(?:speed|attack speed)/i);
      if (speedMatch) newSpeed = parseFloat(speedMatch[1]);

      if (lower.includes('katana') || lower.includes('thunder')) {
        newName = 'Thunder Katana';
        newId = 'thunder_katana';
        newType = 'WEAPON';
        newDmg = newDmg || 16.5;
        newSpeed = newSpeed || 2.2;
      } else if (lower.includes('armor') || lower.includes('aegis')) {
        newName = 'Netherite Aegis Chestplate';
        newId = 'aegis_chestplate';
        newType = 'ARMOR';
        newDefense = 12;
        newTough = 4.0;
      }

      // Add scratch block
      const blocks = [...activeItemForm.scratchBlocks];
      if (lower.includes('lightning') && !blocks.some(b => b.actionId === 'strike_lightning')) {
        blocks.push({ id: `ai-sb-${Date.now()}`, type: 'action', label: 'Strike Lightning at Target', actionId: 'strike_lightning' });
      }
      if (lower.includes('freeze') || lower.includes('speed') || lower.includes('potion')) {
        blocks.push({ id: `ai-sb-${Date.now() + 1}`, type: 'action', label: 'Apply Potion Effect (Speed & Resistance)', actionId: 'potion_effect', param: 'SPEED' });
      }

      updateFormAndSyncCode({
        name: newName,
        id: newId,
        itemType: newType,
        attackDamage: newDmg,
        attackSpeed: newSpeed,
        armorDefense: newDefense,
        armorToughness: newTough,
        fireResistant: true,
        lore: `Imbued with celestial elemental energy via Copilot AI.`,
        scratchBlocks: blocks
      });

      addTerminalLog('success', `[COPILOT AI] Altered visual block form parameters: ${newName} (DMG: ${newDmg}, SPD: ${newSpeed})`);

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `✨ **Form Specification Updated!**\n• Configured **${newName}** (ID: \`${newId}\`)\n• Attack Damage: \`${newDmg}\`\n• Attack Speed: \`${newSpeed}\`\n• Injected logic blocks into your Scratch Workspace.\n\nAll modifications have been mirrored into your project source files.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } else {
      // Advanced Code Generation
      let generatedSnippet = '';
      if (lower.includes('mixin') || lower.includes('fall')) {
        generatedSnippet = `package com.mcide.studio.mixin;

import net.minecraft.server.network.ServerPlayerEntity;
import net.minecraft.entity.damage.DamageSource;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

@Mixin(ServerPlayerEntity.class)
public class FallDamageNegationMixin {
    @Inject(method = "handleFall", at = @At("HEAD"), cancellable = true)
    private void mcide$cancelFallDamage(double heightDifference, boolean onGround, CallbackInfoReturnable<Boolean> cir) {
        // Negate fall damage completely if holding custom weapon
        ServerPlayerEntity player = (ServerPlayerEntity) (Object) this;
        if (player.getMainHandStack().getName().getString().contains("Katana")) {
            cir.setReturnValue(false);
        }
    }
}`;
      } else if (lower.includes('gui') || lower.includes('inventory')) {
        generatedSnippet = `package com.mcide.studio.gui;

import org.bukkit.Bukkit;
import org.bukkit.Material;
import org.bukkit.entity.Player;
import org.bukkit.inventory.Inventory;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;
import org.bukkit.ChatColor;

public class AdminMenuGUI {
    public static void openMenu(Player player) {
        Inventory inv = Bukkit.createInventory(null, 27, ChatColor.DARK_GRAY + "mcIDE Studio Control Center");
        
        ItemStack executeItem = new ItemStack(Material.NETHER_STAR);
        ItemMeta meta = executeItem.getItemMeta();
        if (meta != null) {
            meta.setDisplayName(ChatColor.GREEN + "Deploy Mod Artifact");
            executeItem.setItemMeta(meta);
        }
        inv.setItem(13, executeItem);
        player.openInventory(inv);
    }
}`;
      } else {
        generatedSnippet = `// Custom mcIDE Injection
@EventHandler
public void onCustomAction(PlayerInteractEvent event) {
    if (event.getAction().isRightClick()) {
        event.getPlayer().sendMessage(ChatColor.GOLD + "[mcIDE] Action Dispatched!");
    }
}`;
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `Here is the production-ready code snippet tailored for **${currentLoader}**:\n\`\`\`java\n${generatedSnippet}\n\`\`\``,
          code: generatedSnippet,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }
  };

  const handleInsertCode = (code) => {
    if (!activeTab) {
      addTerminalLog('stderr', '[COPILOT] No open file to insert code into.');
      return;
    }
    const current = files[activeTab] || '';
    const updated = current + '\n\n' + code;
    setFiles(prev => ({
      ...prev,
      [activeTab]: updated
    }));
    addTerminalLog('success', `[COPILOT] Injected code snippet into active file: ${activeTab}`);
  };

  return (
    <div className="flex flex-col h-full text-xs overflow-hidden select-none">
      {/* Header */}
      <div className="h-10 bg-[#18191c] border-b border-subtle px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="font-semibold text-xs text-slate-200 uppercase tracking-wider">
            Copilot AI Vector Assistant
          </span>
        </div>
        <span className="text-[10px] font-mono text-purple-300 bg-purple-950/50 border border-purple-800/60 px-1.5 py-0.5 rounded">
          {currentMode === 'SIMPLE_FORM' ? 'Form Mutator' : 'Code Injector'}
        </span>
      </div>

      {/* Quick Prompt Chips */}
      <div className="p-2 border-b border-subtle bg-[#141517] flex gap-1.5 overflow-x-auto no-scrollbar">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp.prompt)}
            className="px-2 py-1 rounded bg-[#1e2024] hover:bg-[#282a30] text-[10px] text-slate-300 border border-subtle whitespace-nowrap transition-colors"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-full bg-purple-950 border border-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-purple-300" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-lg p-2.5 text-xs select-text ${
                  isUser
                    ? 'bg-purple-600 text-white rounded-tr-none'
                    : 'bg-[#18191c] text-slate-200 border border-subtle rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>

                {/* If code snippet returned */}
                {m.code && (
                  <div className="mt-2 pt-2 border-t border-subtle flex justify-end gap-2">
                    <button
                      onClick={() => handleInsertCode(m.code)}
                      className="px-2.5 py-1 rounded bg-signal hover:bg-green-400 text-black font-semibold text-[11px] flex items-center gap-1 shadow-sm"
                    >
                      <Code2 className="w-3 h-3" />
                      <span>Insert into {activeTab ? activeTab.split('/').pop() : 'File'}</span>
                    </button>
                  </div>
                )}

                <div className="text-[9px] text-slate-400 mt-1 text-right">
                  {m.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-slate-200" />
                </div>
              )}
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-2 text-muted text-xs p-2 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
            <span>Analyzing workspace vectors and AST...</span>
          </div>
        )}
      </div>

      {/* Query Input Bar */}
      <div className="p-2 border-t border-subtle bg-[#141517] flex gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={
            currentMode === 'SIMPLE_FORM'
              ? 'Ask Copilot to customize weapon/armor attributes...'
              : 'Ask for Mixins, Paper listeners, or Datapack functions...'
          }
          className="flex-1 bg-[#1c1d1f] border border-subtle px-3 py-1.5 text-slate-100 rounded text-xs outline-none focus:border-signal"
        />
        <button
          onClick={() => handleSend()}
          className="p-2 rounded bg-purple-600 hover:bg-purple-500 text-white font-medium flex items-center justify-center"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
