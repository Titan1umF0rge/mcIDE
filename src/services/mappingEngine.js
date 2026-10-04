/**
 * Minecraft Mapping Engine & Decompiler Transformer
 * Supports: MOJANG (Official), YARN (Fabric), INTERMEDIARY, PARCHMENT, and NOTCH (Obfuscated)
 */

export const MAPPING_DICTIONARY = {
  classes: [
    {
      notch: 'a',
      intermediary: 'net.minecraft.class_310',
      yarn: 'net.minecraft.client.MinecraftClient',
      mojang: 'net.minecraft.client.Minecraft',
      description: 'Main game client controller'
    },
    {
      notch: 'b',
      intermediary: 'net.minecraft.class_3218',
      yarn: 'net.minecraft.server.world.ServerWorld',
      mojang: 'net.minecraft.server.level.ServerLevel',
      description: 'Server dimension and block world instance'
    },
    {
      notch: 'c',
      intermediary: 'net.minecraft.class_3222',
      yarn: 'net.minecraft.server.network.ServerPlayerEntity',
      mojang: 'net.minecraft.server.level.ServerPlayer',
      description: 'Connected player entity on server'
    },
    {
      notch: 'd',
      intermediary: 'net.minecraft.class_1799',
      yarn: 'net.minecraft.item.ItemStack',
      mojang: 'net.minecraft.world.item.ItemStack',
      description: 'Instance of an item stack with count and components'
    },
    {
      notch: 'e',
      intermediary: 'net.minecraft.class_2338',
      yarn: 'net.minecraft.util.math.BlockPos',
      mojang: 'net.minecraft.core.BlockPos',
      description: 'Immutable 3D coordinate representing block location'
    },
    {
      notch: 'f',
      intermediary: 'net.minecraft.class_1297',
      yarn: 'net.minecraft.entity.Entity',
      mojang: 'net.minecraft.world.entity.Entity',
      description: 'Root base class for all game entities'
    },
    {
      notch: 'g',
      intermediary: 'net.minecraft.class_1309',
      yarn: 'net.minecraft.entity.LivingEntity',
      mojang: 'net.minecraft.world.entity.LivingEntity',
      description: 'Entities with health, armor, and status effects'
    },
    {
      notch: 'h',
      intermediary: 'net.minecraft.class_2680',
      yarn: 'net.minecraft.block.BlockState',
      mojang: 'net.minecraft.world.level.block.state.BlockState',
      description: 'Immutable block state with properties'
    },
    {
      notch: 'i',
      intermediary: 'net.minecraft.class_2561',
      yarn: 'net.minecraft.text.Text',
      mojang: 'net.minecraft.network.chat.Component',
      description: 'Rich text component for chat, lore and titles'
    },
    {
      notch: 'j',
      intermediary: 'net.minecraft.class_1268',
      yarn: 'net.minecraft.util.Hand',
      mojang: 'net.minecraft.world.InteractionHand',
      description: 'Player hand enum (MAIN_HAND, OFF_HAND)'
    },
    {
      notch: 'k',
      intermediary: 'net.minecraft.class_1269',
      yarn: 'net.minecraft.util.ActionResult',
      mojang: 'net.minecraft.world.InteractionResult',
      description: 'Result returned from item and block interactions'
    }
  ],
  methods: [
    {
      notch: 'm_a',
      intermediary: 'method_1508',
      yarn: 'getInstance',
      mojang: 'getInstance',
      owner: 'MinecraftClient',
      signature: '()Lnet/minecraft/client/MinecraftClient;'
    },
    {
      notch: 'm_b',
      intermediary: 'method_14237',
      yarn: 'sendMessage',
      mojang: 'sendSystemMessage',
      owner: 'ServerPlayerEntity',
      signature: '(Lnet/minecraft/text/Text;)V'
    },
    {
      notch: 'm_c',
      intermediary: 'method_7909',
      yarn: 'getItem',
      mojang: 'getItem',
      owner: 'ItemStack',
      signature: '()Lnet/minecraft/item/Item;'
    },
    {
      notch: 'm_d',
      intermediary: 'method_7933',
      yarn: 'setCount',
      mojang: 'setCount',
      owner: 'ItemStack',
      signature: '(I)V'
    },
    {
      notch: 'm_e',
      intermediary: 'method_8389',
      yarn: 'getBlockPos',
      mojang: 'blockPosition',
      owner: 'Entity',
      signature: '()Lnet/minecraft/util/math/BlockPos;'
    },
    {
      notch: 'm_f',
      intermediary: 'method_6078',
      yarn: 'damage',
      mojang: 'hurt',
      owner: 'LivingEntity',
      signature: '(Lnet/minecraft/entity/damage/DamageSource;F)Z'
    },
    {
      notch: 'm_g',
      intermediary: 'method_7854',
      yarn: 'use',
      mojang: 'use',
      owner: 'Item',
      signature: '(Lnet/minecraft/world/World;Lnet/minecraft/entity/player/PlayerEntity;Lnet/minecraft/util/Hand;)Lnet/minecraft/util/TypedActionResult;'
    },
    {
      notch: 'm_h',
      intermediary: 'method_8435',
      yarn: 'spawnEntity',
      mojang: 'addFreshEntity',
      owner: 'ServerWorld',
      signature: '(Lnet/minecraft/entity/Entity;)Z'
    },
    {
      notch: 'm_i',
      intermediary: 'method_7876',
      yarn: 'postHit',
      mojang: 'hurtEnemy',
      owner: 'Item',
      signature: '(Lnet/minecraft/item/ItemStack;Lnet/minecraft/entity/LivingEntity;Lnet/minecraft/entity/LivingEntity;)Z'
    }
  ],
  fields: [
    {
      notch: 'f_a',
      intermediary: 'field_1724',
      yarn: 'player',
      mojang: 'player',
      owner: 'MinecraftClient'
    },
    {
      notch: 'f_b',
      intermediary: 'field_1687',
      yarn: 'world',
      mojang: 'level',
      owner: 'MinecraftClient'
    },
    {
      notch: 'f_c',
      intermediary: 'field_7402',
      yarn: 'AIR',
      mojang: 'AIR',
      owner: 'Items'
    },
    {
      notch: 'f_d',
      intermediary: 'field_6012',
      yarn: 'ATTACK_DAMAGE_MODIFIER_ID',
      mojang: 'BASE_ATTACK_DAMAGE_ID',
      owner: 'Item'
    }
  ]
};

/**
 * Transform text source between Notch/Obfuscated, Intermediary, Mojang, and Yarn
 */
export function transformSourceMappings(sourceCode, targetMapping = 'MOJANG') {
  if (!sourceCode) return '';
  let transformed = sourceCode;

  // Replace methods
  MAPPING_DICTIONARY.methods.forEach(item => {
    const targetName = targetMapping === 'YARN' ? item.yarn : item.mojang;
    // Match notch
    transformed = transformed.replace(new RegExp(`\\b${item.notch}\\b`, 'g'), targetName);
    // Match intermediary
    transformed = transformed.replace(new RegExp(`\\b${item.intermediary}\\b`, 'g'), targetName);
    // Cross transform if switching yarn <-> mojang
    if (targetMapping === 'MOJANG' && item.yarn !== item.mojang) {
      transformed = transformed.replace(new RegExp(`\\b${item.yarn}\\b`, 'g'), item.mojang);
    } else if (targetMapping === 'YARN' && item.yarn !== item.mojang) {
      transformed = transformed.replace(new RegExp(`\\b${item.mojang}\\b`, 'g'), item.yarn);
    }
  });

  // Replace fields
  MAPPING_DICTIONARY.fields.forEach(item => {
    const targetName = targetMapping === 'YARN' ? item.yarn : item.mojang;
    transformed = transformed.replace(new RegExp(`\\b${item.notch}\\b`, 'g'), targetName);
    transformed = transformed.replace(new RegExp(`\\b${item.intermediary}\\b`, 'g'), targetName);
    if (targetMapping === 'MOJANG' && item.yarn !== item.mojang) {
      transformed = transformed.replace(new RegExp(`\\b${item.yarn}\\b`, 'g'), item.mojang);
    } else if (targetMapping === 'YARN' && item.yarn !== item.mojang) {
      transformed = transformed.replace(new RegExp(`\\b${item.mojang}\\b`, 'g'), item.yarn);
    }
  });

  // Replace classes
  MAPPING_DICTIONARY.classes.forEach(item => {
    const targetClass = targetMapping === 'YARN' ? item.yarn : item.mojang;
    const simpleTarget = targetClass.split('.').pop();
    const simpleIntermediary = item.intermediary.split('.').pop();
    const simpleYarn = item.yarn.split('.').pop();
    const simpleMojang = item.mojang.split('.').pop();

    // Replace full and simple names
    transformed = transformed.replace(new RegExp(`\\b${item.intermediary.replace(/\./g, '\\.')}\\b`, 'g'), targetClass);
    transformed = transformed.replace(new RegExp(`\\b${simpleIntermediary}\\b`, 'g'), simpleTarget);
    
    // Obfuscated notch token check
    transformed = transformed.replace(new RegExp(`\\bnet\\.minecraft\\.${item.notch}\\b`, 'g'), targetClass);

    if (targetMapping === 'MOJANG') {
      transformed = transformed.replace(new RegExp(`\\b${item.yarn.replace(/\./g, '\\.')}\\b`, 'g'), item.mojang);
      transformed = transformed.replace(new RegExp(`\\b${simpleYarn}\\b`, 'g'), simpleMojang);
    } else if (targetMapping === 'YARN') {
      transformed = transformed.replace(new RegExp(`\\b${item.mojang.replace(/\./g, '\\.')}\\b`, 'g'), item.yarn);
      transformed = transformed.replace(new RegExp(`\\b${simpleMojang}\\b`, 'g'), simpleYarn);
    }
  });

  return transformed;
}

export const OBFUSCATED_SAMPLE = `package net.minecraft.decompiled;

import net.minecraft.class_3222; // ServerPlayerEntity
import net.minecraft.class_1799; // ItemStack
import net.minecraft.class_2338; // BlockPos
import net.minecraft.class_2561; // Text

/**
 * Raw decompiler output containing obfuscated notch/intermediary identifiers.
 */
public class DecompiledWeaponItem {
    private final float f_damage = 14.5f;
    private final float f_speed = 1.6f;

    public void m_g(net.minecraft.class_3218 b, class_3222 c, net.minecraft.class_1268 j) {
        class_1799 d = c.getMainHandStack();
        class_2338 e = c.m_e();
        
        // Obfuscated broadcast
        c.m_b(class_2561.of("Executing obfuscated sword technique!"));
        
        // Damage nearby entity
        c.m_f(null, this.f_damage);
    }
}
`;
