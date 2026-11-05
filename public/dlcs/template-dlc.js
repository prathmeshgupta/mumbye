// MUMBYE: MAXIMUM CITY - Official Community DLC Template
// Copy this file or paste its contents into the in-game DLC Manager (M) to install your custom mod!

MumbyeAPI.registerDLC({
  id: "dlc_community_expansion",
  title: "Marine Drive Speed & Chaos Pack",
  version: "1.0.0",
  author: "Community Modder",
  description: "Adds custom Golden Sports Auto Rickshaw, explosive Coconut Bombs, and midnight sprint missions!",
  badge: "COMMUNITY DLC",

  // Custom Weapons
  weapons: [
    {
      id: "coconut",
      name: "Explosive Coconut",
      type: "melee",
      damage: 150,
      rate: 0.6,
      ammo: 15,
      maxAmmo: 30
    }
  ],

  // Custom Smartphone Cheats
  cheats: {
    "GOLDENAUTO": (ctx) => {
      const p = ctx.player.position;
      const auto = ctx.game.factory.createAutoRickshaw({ bodyColor: 0xffd700, roofColor: 0xffaa00 });
      auto.position.set(p.x + 3, 0, p.z + 3);
      ctx.scene.add(auto);

      import('./entities/Vehicle.js').then(({ Vehicle }) => {
        const v = new Vehicle(auto, { type: 'auto', maxSpeed: 35, hasNitro: true }, ctx.audioEngine, ctx.game.particleSystem, ctx.physics);
        ctx.trafficManager.vehicles.push(v);
      });

      ctx.showMessage("Golden Auto Rickshaw spawned right beside you!");
    },
    "BOMB": (ctx) => {
      const wIdx = ctx.player.weapons.findIndex(w => w.id === 'coconut');
      if (wIdx >= 0) {
        ctx.player.weapons[wIdx].ammo = 30;
        ctx.player.equipWeapon(wIdx);
        ctx.showMessage("Explosive Coconuts loaded!");
      }
    }
  },

  // Custom Missions
  missions: [
    {
      id: "m_community_speed_run",
      title: "Community: Queen's Necklace Sprint",
      contact: "Street Racer Vicky",
      introDialog: [
        { speaker: "Vicky", text: "Aye bhai! Marine Drive pe full speed sprint race lagaya hai!" },
        { speaker: "Kabir", text: "Rasta khali kara lo, Kabir aa raha hai!" }
      ],
      checkpoints: [
        {
          text: "Sprint along Marine Drive towards the Gateway of India",
          target: { x: -20, y: 0, z: 140 },
          radius: 8.0,
          type: "reach",
          timer: 45
        }
      ],
      rewardCash: 4500,
      rewardWeapon: "coconut",
      successMessage: "COMMUNITY MISSION WON! ₹4,500 awarded + Coconut Bombs unlocked!"
    }
  ],

  // Lifecycle Hooks
  onEnable: (ctx) => {
    ctx.showMessage("Marine Drive Speed & Chaos Pack Enabled! Check your phone for cheats GOLDENAUTO & BOMB!");
  },

  onDisable: (ctx) => {
    ctx.showMessage("Marine Drive Speed & Chaos Pack Disabled.");
  },

  onUpdate: (delta, ctx) => {
    // Custom frame logic
  }
});
