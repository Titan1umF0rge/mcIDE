/**
 * Project Structure and File Generation Engine
 * Generates verified file trees and boilerplates for:
 * FABRIC, NEOFORGE, FORGE, QUILT, PAPER, SPIGOT, PURPUR, VELOCITY, BUNGEECORD, DATAPACK, RESOURCEPACK, SHADER
 */

export function generateProjectStructure(platform, loader, projectName, targetVersion = '1.21.4') {
  const sanitizedId = projectName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const mainPackage = `com.mcide.${sanitizedId}`;
  const mainClassName = projectName.replace(/[^a-zA-Z0-9]/g, '') || 'StudioProject';

  const files = {};

  if (platform === 'MOD') {
    if (loader === 'FABRIC' || loader === 'QUILT') {
      files['fabric.mod.json'] = JSON.stringify({
        schemaVersion: 1,
        id: sanitizedId,
        version: "1.0.0",
        name: projectName,
        description: "Created with mcIDE Studio - Advanced Minecraft IDE",
        authors: ["mcIDE Developer"],
        contact: {
          homepage: "https://mcide.dev"
        },
        license: "MIT",
        icon: `assets/${sanitizedId}/icon.png`,
        environment: "*",
        entrypoints: {
          main: [`${mainPackage}.${mainClassName}`],
          client: [`${mainPackage}.client.${mainClassName}Client`]
        },
        mixins: [`${sanitizedId}.mixins.json`],
        depends: {
          fabricloader: ">=0.16.0",
          minecraft: `~${targetVersion}`,
          java: ">=21",
          "fabric-api": "*"
        }
      }, null, 2);

      files[`src/main/java/${mainPackage.replace(/\./g, '/')}/${mainClassName}.java`] = `package ${mainPackage};

import net.fabricmc.api.ModInitializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ${mainClassName} implements ModInitializer {
    public static final String MOD_ID = "${sanitizedId}";
    public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);

    @Override
    public void onInitialize() {
        LOGGER.info("[mcIDE] Initializing {} for Minecraft {}", MOD_ID, "${targetVersion}");
        // Register mod items, blocks, and listeners
        ModItems.registerModItems();
    }
}
`;

      files[`src/main/java/${mainPackage.replace(/\./g, '/')}/ModItems.java`] = `package ${mainPackage};

import net.fabricmc.fabric.api.itemgroup.v1.ItemGroupEvents;
import net.minecraft.item.Item;
import net.minecraft.item.ItemGroups;
import net.minecraft.item.SwordItem;
import net.minecraft.item.ToolMaterials;
import net.minecraft.registry.Registries;
import net.minecraft.registry.Registry;
import net.minecraft.util.Identifier;

public class ModItems {
    public static final Item CUSTOM_SUNBLADE = registerItem("sunblade",
        new SwordItem(ToolMaterials.NETHERITE, new Item.Settings().fireproof()));

    private static Item registerItem(String name, Item item) {
        return Registry.register(Registries.ITEM, Identifier.of(${mainClassName}.MOD_ID, name), item);
    }

    public static void registerModItems() {
        ${mainClassName}.LOGGER.info("Registering items for " + ${mainClassName}.MOD_ID);
        ItemGroupEvents.modifyEntriesEvent(ItemGroups.COMBAT).register(entries -> {
            entries.add(CUSTOM_SUNBLADE);
        });
    }
}
`;

      files[`src/main/resources/${sanitizedId}.mixins.json`] = JSON.stringify({
        required: true,
        package: `${mainPackage}.mixin`,
        compatibilityLevel: "JAVA_21",
        mixins: [],
        injectors: {
          defaultRequire: 1
        }
      }, null, 2);

      files['build.gradle'] = `plugins {
    id 'fabric-loom' version '1.8-SNAPSHOT'
    id 'maven-publish'
}

version = '1.0.0'
group = '${mainPackage}'

repositories {
    mavenCentral()
}

dependencies {
    minecraft "com.mojang:minecraft:${targetVersion}"
    mappings "net.fabricmc:yarn:${targetVersion}+build.1:v2"
    modImplementation "net.fabricmc:fabric-loader:0.16.9"
    modImplementation "net.fabricmc.fabric-api:fabric-api:0.110.0+${targetVersion}"
}

tasks.withType(JavaCompile).configureEach {
    it.options.release = 21
}
`;
    } else {
      // Forge / NeoForge
      files['src/main/resources/META-INF/neoforge.mods.toml'] = `modLoader="javafml"
loaderVersion="[1,)"
license="MIT"

[[mods]]
modId="${sanitizedId}"
version="1.0.0"
displayName="${projectName}"
description='''Engineered via mcIDE Studio'''

[[dependencies.${sanitizedId}]]
    modId="neoforge"
    type="required"
    versionRange="[21.1.0,)"
    ordering="NONE"
    side="BOTH"
`;

      files[`src/main/java/${mainPackage.replace(/\./g, '/')}/${mainClassName}.java`] = `package ${mainPackage};

import net.neoforged.bus.api.IEventBus;
import net.neoforged.fml.common.Mod;
import net.neoforged.fml.event.lifecycle.FMLCommonSetupEvent;
import org.slf4j.Logger;
import com.mojang.logging.LogUtils;

@Mod(${mainClassName}.MOD_ID)
public class ${mainClassName} {
    public static final String MOD_ID = "${sanitizedId}";
    private static final Logger LOGGER = LogUtils.getLogger();

    public ${mainClassName}(IEventBus modEventBus) {
        modEventBus.addListener(this::commonSetup);
        LOGGER.info("[mcIDE] NeoForge Mod Loaded: {}", MOD_ID);
    }

    private void commonSetup(final FMLCommonSetupEvent event) {
        LOGGER.info("[mcIDE] Pre-init complete on {}", "${targetVersion}");
    }
}
`;
    }
  } else if (platform === 'PLUGIN') {
    // Spigot / Paper / Purpur / Velocity / Bungee
    if (loader === 'VELOCITY') {
      files['src/main/resources/velocity-plugin.json'] = JSON.stringify({
        id: sanitizedId,
        name: projectName,
        version: "1.0.0",
        description: "Velocity proxy plugin generated by mcIDE Studio",
        authors: ["mcIDE Developer"],
        main: `${mainPackage}.${mainClassName}`
      }, null, 2);

      files[`src/main/java/${mainPackage.replace(/\./g, '/')}/${mainClassName}.java`] = `package ${mainPackage};

import com.google.inject.Inject;
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.proxy.ProxyInitializeEvent;
import com.velocitypowered.api.plugin.Plugin;
import com.velocitypowered.api.proxy.ProxyServer;
import org.slf4j.Logger;

@Plugin(id = "${sanitizedId}", name = "${projectName}", version = "1.0.0")
public class ${mainClassName} {
    private final ProxyServer server;
    private final Logger logger;

    @Inject
    public ${mainClassName}(ProxyServer server, Logger logger) {
        this.server = server;
        this.logger = logger;
    }

    @Subscribe
    public void onProxyInitialization(ProxyInitializeEvent event) {
        logger.info("[mcIDE] Velocity Proxy Plugin initialized!");
    }
}
`;
    } else {
      // Paper / Spigot / Purpur
      files['src/main/resources/plugin.yml'] = `name: ${projectName}
version: 1.0.0
main: ${mainPackage}.${mainClassName}
api-version: '1.21'
author: mcIDE
description: ${projectName} server plugin built with mcIDE Studio

commands:
  ${sanitizedId}:
    description: Primary command for ${projectName}
    permission: ${sanitizedId}.admin
    usage: /${sanitizedId} [reload|status]

permissions:
  ${sanitizedId}.admin:
    description: Grants administrative access to ${projectName}
    default: op
`;

      files[`src/main/java/${mainPackage.replace(/\./g, '/')}/${mainClassName}.java`] = `package ${mainPackage};

import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.ChatColor;
import java.util.logging.Logger;

public class ${mainClassName} extends JavaPlugin {
    private static ${mainClassName} instance;
    private Logger log;

    @Override
    public void onEnable() {
        instance = this;
        this.log = getLogger();
        
        log.info(ChatColor.GREEN + "========================================");
        log.info(ChatColor.GREEN + "  mcIDE Studio: " + getName() + " v" + getDescription().getVersion());
        log.info(ChatColor.GREEN + "  Status: ENABLED & READY FOR DISPATCH");
        log.info(ChatColor.GREEN + "========================================");

        // Register default events and listeners
        getServer().getPluginManager().registerEvents(new ModEventListener(), this);
    }

    @Override
    public void onDisable() {
        log.info(ChatColor.RED + "[mcIDE] " + getName() + " disabled cleanly. State saved.");
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (command.getName().equalsIgnoreCase("${sanitizedId}")) {
            sender.sendMessage(ChatColor.GOLD + "[mcIDE] " + getName() + " running active build.");
            return true;
        }
        return false;
    }

    public static ${mainClassName} getInstance() {
        return instance;
    }
}
`;

      files[`src/main/java/${mainPackage.replace(/\./g, '/')}/ModEventListener.java`] = `package ${mainPackage};

import org.bukkit.event.Listener;
import org.bukkit.event.EventHandler;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.ChatColor;

public class ModEventListener implements Listener {
    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        event.getPlayer().sendMessage(ChatColor.AQUA + "[mcIDE] Welcome to the server running custom plugins!");
    }
}
`;

      files['pom.xml'] = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>${mainPackage}</groupId>
    <artifactId>${sanitizedId}</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <properties>
        <java.version>21</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <repositories>
        <repository>
            <id>papermc</id>
            <url>https://repo.papermc.io/repository/maven-public/</url>
        </repository>
    </repositories>

    <dependencies>
        <dependency>
            <groupId>io.papermc.paper</groupId>
            <artifactId>paper-api</artifactId>
            <version>${targetVersion}-R0.1-SNAPSHOT</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.13.0</version>
                <configuration>
                    <source>21</source>
                    <target>21</target>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
`;
    }
  } else if (platform === 'DATAPACK') {
    files['pack.mcmeta'] = JSON.stringify({
      pack: {
        pack_format: 61, // 1.21.4 pack format
        description: `${projectName} - mcIDE Studio High-Speed Datapack`
      }
    }, null, 2);

    files['data/minecraft/tags/function/load.json'] = JSON.stringify({
      values: [`${sanitizedId}:init`]
    }, null, 2);

    files['data/minecraft/tags/function/tick.json'] = JSON.stringify({
      values: [`${sanitizedId}:tick`]
    }, null, 2);

    files[`data/${sanitizedId}/function/init.mcfunction`] = `# mcIDE Studio Init Function
tellraw @a [{"text":"[mcIDE] ","color":"green","bold":true},{"text":"${projectName} Datapack initialized!","color":"gold"}]
scoreboard objectives add mcide_timer dummy "mcIDE Studio Clock"
`;

    files[`data/${sanitizedId}/function/tick.mcfunction`] = `# mcIDE Studio Tick Function (Runs 20 times/sec)
# Add particle trails, passive spell timers or zone checks here
execute as @a[nbt={SelectedItem:{tag:{mcide_special:1b}}}] at @s run particle flame ~ ~1 ~ 0.2 0.2 0.2 0.02 5
`;
  } else if (platform === 'RESOURCEPACK') {
    files['pack.mcmeta'] = JSON.stringify({
      pack: {
        pack_format: 46, // 1.21.4 resourcepack format
        description: `${projectName} - High Definition Texture & Audio Pack`
      }
    }, null, 2);

    files['assets/minecraft/sounds.json'] = JSON.stringify({
      "custom.sword_slash": {
        category: "player",
        sounds: ["custom/sword_slash1", "custom/sword_slash2"]
      }
    }, null, 2);

    files[`assets/${sanitizedId}/models/item/sunblade.json`] = JSON.stringify({
      parent: "minecraft:item/handheld",
      textures: {
        layer0: `${sanitizedId}:item/sunblade`
      }
    }, null, 2);
  } else if (platform === 'SHADER') {
    files['pack.mcmeta'] = JSON.stringify({
      pack: {
        pack_format: 46,
        description: `${projectName} - NextGen Core Pipeline Shaders`
      }
    }, null, 2);

    files['assets/minecraft/shaders/post/bloom.json'] = JSON.stringify({
      targets: ["swap", "bloom_blur"],
      passes: [
        {
          name: "bloom_threshold",
          intarget: "minecraft:main",
          outtarget: "swap"
        }
      ]
    }, null, 2);

    files['assets/minecraft/shaders/program/bloom.vsh'] = `#version 150

in vec4 Position;
out vec2 texCoord;

void main() {
    gl_Position = vec4(Position.xy, 0.2, 1.0);
    texCoord = Position.xy * 0.5 + 0.5;
}
`;

    files['assets/minecraft/shaders/program/bloom.fsh'] = `#version 150

uniform sampler2D DiffuseSampler;
in vec2 texCoord;
out vec4 fragColor;

void main() {
    vec4 baseColor = texture(DiffuseSampler, texCoord);
    // Glow amplifier pass
    float brightness = dot(baseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
    if (brightness > 0.8) {
        fragColor = baseColor * 1.4;
    } else {
        fragColor = baseColor;
    }
}
`;
  }

  return files;
}
