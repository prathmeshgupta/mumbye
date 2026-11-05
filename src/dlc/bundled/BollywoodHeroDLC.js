// MUMBYE: MAXIMUM CITY - DLC 2: Bollywood Action Hero & Stunt Pack
import * as THREE from 'three';

export const BollywoodHeroDLC = {
  id: 'dlc_bollywood_hero',
  title: 'Bollywood Action Hero Pack',
  version: '1.1.0',
  author: 'Mumbye Studios',
  description: 'Unlocks cinematic slow-motion "Bhai Time" (press B), the Golden Desert Eagle pistol, and Bollywood stunt sets.',
  badge: 'ACTION DLC',

  weapons: [
    {
      id: 'gold_eagle',
      name: 'Golden Desert Eagle',
      type: 'gun',
      damage: 120,
      rate: 0.25,
      ammo: 50,
      maxAmmo: 150
    }
  ],

  cheats: {
    'BHAITIME': (ctx) => {
      ctx.game.timeScale = 0.35;
      setTimeout(() => { ctx.game.timeScale = 1.0; }, 6000);
      ctx.showMessage("BHAI TIME ACTIVATED! Bullet time slow motion!");
    },
    'GOLDEAGLE': (ctx) => {
      const idx = ctx.player.weapons.findIndex(w => w.id === 'gold_eagle');
      if (idx >= 0) {
        ctx.player.weapons[idx].ammo = 100;
        ctx.player.equipWeapon(idx);
        ctx.showMessage("Golden Desert Eagle equipped with 100 explosive rounds!");
      }
    }
  },

  missions: [
    {
      id: 'm_dlc_filmcity_heist',
      title: "DLC: Film City Studio Heist",
      contact: "Bollywood Director",
      introDialog: [
        { speaker: "Director", text: "Action hero Kabir! Smugglers ne Film City ke gold props chori kar liye!" },
        { speaker: "Kabir", text: "Camera roll karo! Hero entry lene aa raha hai!" }
      ],
      checkpoints: [
        {
          text: "Storm the Gateway Heritage Set and recover the gold chests",
          target: new THREE.Vector3(-20, 0, 160),
          radius: 12.0,
          type: 'combat_target',
          targetCount: 5
        },
        {
          text: "Escape to Marine Drive and celebrate with Vada Pav!",
          target: new THREE.Vector3(-48, 0, -10),
          radius: 6.0,
          type: 'reach'
        }
      ],
      rewardCash: 8000,
      rewardWeapon: 'gold_eagle',
      successMessage: "BLOCKBUSTER HIT! Studio Gold recovered! ₹8,000 + Golden Desert Eagle awarded."
    }
  ],

  onEnable: (ctx) => {
    // Register 'B' key listener for Bhai Time slow-mo
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyB' && ctx.game.dlcManager.isDLCActive('dlc_bollywood_hero')) {
        const isSlow = ctx.game.timeScale < 0.9;
        ctx.game.timeScale = isSlow ? 1.0 : 0.35;
        const hudSlow = document.getElementById('bhai-time-vignette');
        if (hudSlow) hudSlow.style.opacity = isSlow ? '0' : '0.6';
        ctx.showMessage(isSlow ? "Normal Time restored." : "BHAI TIME ACTIVATED (Slow-Mo)!");
      }
    });

    ctx.showMessage("Bollywood Action Hero Pack Enabled! Press 'B' anytime for Bhai Time (Slow-Mo)!");
  },

  onDisable: (ctx) => {
    ctx.game.timeScale = 1.0;
    const hudSlow = document.getElementById('bhai-time-vignette');
    if (hudSlow) hudSlow.style.opacity = '0';
    ctx.showMessage("Bollywood Action Hero Pack Disabled.");
  }
};
