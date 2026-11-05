// MUMBYE: MAXIMUM CITY - Extensible DLC & Modding System
// Allows players, community developers, and modders to extend vehicles, weapons, missions, weather, and mechanics.

export class DLCManager {
  constructor(game) {
    this.game = game;
    this.installedDLCs = new Map(); // id -> dlc definition
    this.activeDLCs = new Set(); // set of active dlc IDs
    this.customCheats = new Map(); // cheatCode -> handler
  }

  // Register a DLC definition
  registerDLC(dlc) {
    if (!dlc.id || !dlc.title) {
      console.error("Invalid DLC definition: missing id or title", dlc);
      return false;
    }

    this.installedDLCs.set(dlc.id, {
      ...dlc,
      enabled: false
    });

    console.log(`[Mumbye DLCManager] Registered DLC: ${dlc.title} (${dlc.id}) v${dlc.version || '1.0'}`);
    return true;
  }

  // Enable a DLC
  enableDLC(id) {
    const dlc = this.installedDLCs.get(id);
    if (!dlc) {
      console.warn(`DLC not found: ${id}`);
      return false;
    }

    if (this.activeDLCs.has(id)) return true;

    try {
      if (dlc.onEnable) {
        dlc.onEnable(this.createContext(dlc));
      }

      // Register weapons
      if (dlc.weapons && this.game.player) {
        dlc.weapons.forEach(w => {
          if (!this.game.player.weapons.find(existing => existing.id === w.id)) {
            this.game.player.weapons.push(w);
          }
        });
      }

      // Register missions
      if (dlc.missions && this.game.missionManager) {
        dlc.missions.forEach(m => this.game.missionManager.registerCustomMission(m));
      }

      // Register custom cheats
      if (dlc.cheats) {
        Object.entries(dlc.cheats).forEach(([code, handler]) => {
          this.customCheats.set(code.toUpperCase(), handler);
        });
      }

      dlc.enabled = true;
      this.activeDLCs.add(id);

      window.dispatchEvent(new CustomEvent('mumbye_dlc_toggled', { detail: { id, enabled: true, dlc } }));
      return true;
    } catch (err) {
      console.error(`Failed to enable DLC ${id}:`, err);
      return false;
    }
  }

  // Disable a DLC
  disableDLC(id) {
    const dlc = this.installedDLCs.get(id);
    if (!dlc || !this.activeDLCs.has(id)) return false;

    try {
      if (dlc.onDisable) {
        dlc.onDisable(this.createContext(dlc));
      }

      // Unregister custom cheats
      if (dlc.cheats) {
        Object.keys(dlc.cheats).forEach(code => {
          this.customCheats.delete(code.toUpperCase());
        });
      }

      dlc.enabled = false;
      this.activeDLCs.delete(id);

      window.dispatchEvent(new CustomEvent('mumbye_dlc_toggled', { detail: { id, enabled: false, dlc } }));
      return true;
    } catch (err) {
      console.error(`Failed to disable DLC ${id}:`, err);
      return false;
    }
  }

  isDLCActive(id) {
    return this.activeDLCs.has(id);
  }

  getAllDLCs() {
    return Array.from(this.installedDLCs.values());
  }

  // Load custom DLC code directly in runtime from string (e.g. pasted into in-game UI)
  loadDLCFromScript(scriptContent) {
    try {
      const fn = new Function('MumbyeAPI', scriptContent);
      const api = {
        registerDLC: (def) => {
          this.registerDLC(def);
          this.enableDLC(def.id);
        }
      };
      fn(api);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Context passed to DLC lifecycle hooks
  createContext(dlc) {
    return {
      game: this.game,
      scene: this.game.scene,
      physics: this.game.physics,
      audioEngine: this.game.audioEngine,
      weather: this.game.weather,
      player: this.game.player,
      trafficManager: this.game.trafficManager,
      missionManager: this.game.missionManager,
      cameraManager: this.game.cameraManager,
      spawnVehicle: (type, x, z, config) => this.game.trafficManager.spawnTrafficVehicle(x, z, type),
      showMessage: (text) => {
        window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
          detail: { speaker: dlc.title, text }
        }));
      }
    };
  }

  update(delta) {
    this.activeDLCs.forEach(id => {
      const dlc = this.installedDLCs.get(id);
      if (dlc && dlc.onUpdate) {
        try {
          dlc.onUpdate(delta, this.createContext(dlc));
        } catch (e) {
          console.error(`Error in DLC update (${id}):`, e);
        }
      }
    });
  }

  // Check if a cheat code is handled by active DLCs
  executeCheat(code) {
    const handler = this.customCheats.get(code.toUpperCase());
    if (handler) {
      handler(this.createContext({ title: 'Cheat' }));
      return true;
    }
    return false;
  }

  // Export clean template for modders
  getBoilerplateTemplate() {
    return `// Mumbye Custom DLC Boilerplate Template
MumbyeAPI.registerDLC({
  id: "dlc_my_mumbai_mod",
  title: "My Custom Mumbai Expansion",
  version: "1.0.0",
  author: "Community Modder",
  description: "Adds custom neon sports cars, new street race missions, and a special weapon!",
  badge: "MOD",

  weapons: [
    {
      id: "coconut",
      name: "Coconut Bomb",
      type: "melee",
      damage: 100,
      rate: 0.5,
      ammo: 10
    }
  ],

  cheats: {
    "SUPERCAR": (ctx) => {
      ctx.trafficManager.spawnTrafficVehicle(ctx.player.position.x + 3, ctx.player.position.z + 3, 'supercar');
      ctx.showMessage("Bollywood Supercar spawned right beside you!");
    }
  },

  onEnable: (ctx) => {
    ctx.showMessage("My Custom Mumbai Expansion Enabled!");
  },

  onDisable: (ctx) => {
    ctx.showMessage("My Custom Mumbai Expansion Disabled.");
  },

  onUpdate: (delta, ctx) => {
    // Custom per-frame logic here
  }
});`;
  }
}
