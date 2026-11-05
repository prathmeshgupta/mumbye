# MUMBYE: MAXIMUM CITY - DLC & Modding Creation Guide

Welcome to the **Mumbye Modding SDK**. *MUMBYE: MAXIMUM CITY* is built from the ground up with a modular, extensible architecture that enables players, creators, and developers to craft and install full Downloadable Content (DLC) packs.

---

## 1. Architecture Overview

Every DLC is a self-contained definition object registered with `MumbyeAPI.registerDLC(definition)`.

### Lifecycle Hooks:
* `onEnable(ctx)`: Executed when the player toggles the DLC to **ON** in the in-game DLC Manager (`M` key) or Smartphone.
* `onDisable(ctx)`: Executed when the player turns the DLC **OFF**.
* `onUpdate(delta, ctx)`: Executed on every animation frame for custom physics, animations, or event tracking.

### Context Object (`ctx`):
When your hooks run, they receive a rich API context:
* `ctx.game`: Master engine reference.
* `ctx.player`: Kabir player entity (health, armor, cash, weapons, driving state).
* `ctx.scene`: Three.js scene graph.
* `ctx.physics`: Collision & raycasting engine.
* `ctx.audioEngine`: Web Audio synthesizer (engine, horns, sfx, radio).
* `ctx.weather`: Time-of-day clock (0-24h) and weather states ('clear', 'sunset', 'night', 'monsoon').
* `ctx.trafficManager`: Vehicle spawning and traffic AI.
* `ctx.missionManager`: Objective and checkpoint engine.
* `ctx.cameraManager`: Third-person and cinematic camera.
* `ctx.showMessage(text)`: Displays in-game Bambaiya notification subtitles.

---

## 2. DLC Schema Specification

```javascript
MumbyeAPI.registerDLC({
  id: "dlc_unique_identifier",     // Unique string ID
  title: "My Mumbai Expansion Pack", // Display name
  version: "1.0.0",                 // Semantic version
  author: "Creator Name",           // Author credit
  description: "Description of vehicles, missions, and features...",
  badge: "EXPANSION",               // Card badge tag

  // 1. Custom Weapons
  weapons: [
    {
      id: "my_custom_gun",
      name: "Custom Blaster",
      type: "gun",                  // 'melee' or 'gun'
      damage: 75,
      rate: 0.2,
      ammo: 60,
      maxAmmo: 200
    }
  ],

  // 2. Custom Smartphone Cheats
  cheats: {
    "MYCHEAT": (ctx) => {
      ctx.player.cash += 5000;
      ctx.showMessage("CHEAT ACTIVATED: +₹5,000 Cash!");
    }
  },

  // 3. Custom Story / Side Missions
  missions: [
    {
      id: "m_custom_mission_1",
      title: "DLC: The Midnight Heist",
      contact: "Underworld Boss",
      introDialog: [
        { speaker: "Boss", text: "Aye Kabir! Ek zaroori kaam hai!" },
        { speaker: "Kabir", text: "Bolo Boss, kya karna hai?" }
      ],
      checkpoints: [
        {
          text: "Drive to the Gateway Plaza target",
          target: { x: -20, y: 0, z: 140 },
          radius: 6.0,
          type: "reach",
          timer: 60
        }
      ],
      rewardCash: 4000,
      rewardWeapon: "ak47",
      successMessage: "MISSION PASSED! You earned ₹4,000!"
    }
  ],

  // 4. Lifecycle Hooks
  onEnable: (ctx) => {
    ctx.showMessage("My Expansion Pack Enabled!");
  },

  onDisable: (ctx) => {
    ctx.showMessage("My Expansion Pack Disabled.");
  },

  onUpdate: (delta, ctx) => {
    // Custom per-frame logic
  }
});
```

---

## 3. How to Test & Install DLCs in the Game

1. Launch **MUMBYE: MAXIMUM CITY** in any modern web browser.
2. Press **`M`** (or click the **🧩 DLCs** button in the top-right HUD or on Kabir's Smartphone).
3. Click the **"Create / Install Custom DLC"** tab.
4. Paste your DLC script or click **"Insert Boilerplate Template"**.
5. Click **"⚡ Install & Activate DLC Mod"**.
6. Your mod is now compiled, registered, and active **live in the game** with zero browser reload required!

---

## 4. Built-in DLC Reference

The game ships with 3 pre-bundled DLCs that demonstrate the full power of the system:
1. **Bandra Nitro Drifters Pack (`dlc_bandra_drift`)**:
   - Nitrous oxide boost (press Shift in car).
   - Neon Cyber Auto Rickshaw.
   - Midnight Bandra-Worli Sea Link Grand Prix drift circuit.
2. **Bollywood Action Hero Pack (`dlc_bollywood_hero`)**:
   - "Bhai Time" / Bullet Time cinematic slow-mo (press `B` key).
   - Golden Desert Eagle with explosive rounds.
   - Film City Studio Heist mission.
3. **Monsoon Madness Pack (`dlc_monsoon_madness`)**:
   - Dynamic Mumbai torrential rainstorm with puddles & lightning.
   - Amphibious Tuk-Tuk that cruises over the Arabian Sea waves!
