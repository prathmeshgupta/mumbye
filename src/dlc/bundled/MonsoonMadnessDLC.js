// MUMBYE: MAXIMUM CITY - DLC 3: Monsoon Floods & Amphibious Tuk-Tuk Pack
import * as THREE from 'three';
import { Vehicle } from '../../entities/Vehicle.js';

export const MonsoonMadnessDLC = {
  id: 'dlc_monsoon_madness',
  title: 'Monsoon Madness & Amphibious Tuk-Tuk Pack',
  version: '1.0.0',
  author: 'Mumbye Studios',
  description: 'Unlocks torrential Mumbai Monsoon storms, flooded sea levels, and the legendary Amphibious Tuk-Tuk that cruises on the Arabian Sea.',
  badge: 'CHAOS DLC',

  cheats: {
    'MONSOON': (ctx) => {
      ctx.weather.setWeather('monsoon');
      ctx.showMessage("MUMBAI MONSOON WEATHER TRIGGERED! Puddles & thunder active!");
    },
    'AMPHIBIOUS': (ctx) => {
      const pPos = ctx.player.position;
      const tuk = ctx.game.factory.createAutoRickshaw({ bodyColor: 0x0088cc, roofColor: 0xffe600 });
      tuk.position.set(pPos.x + 3, 0, pPos.z + 3);
      ctx.scene.add(tuk);

      const v = new Vehicle(tuk, { type: 'auto', maxSpeed: 28, isAmphibious: true }, ctx.audioEngine, ctx.game.particleSystem, ctx.physics);
      ctx.trafficManager.vehicles.push(v);

      ctx.showMessage("AMPHIBIOUS TUK-TUK SPAWNED! Drive straight into the ocean!");
    }
  },

  missions: [
    {
      id: 'm_dlc_monsoon_rescue',
      title: "DLC: Arabian Sea Flood Rescue",
      contact: "Mumbai Disaster Relief",
      introDialog: [
        { speaker: "Control Room", text: "Attention Kabir! Mumbai me high tide aur bhari barish chal raha hai!" },
        { speaker: "Kabir", text: "Marine Drive doob raha hai kya?" },
        { speaker: "Control Room", text: "Amphibious Tuk-Tuk lo aur samandar me phanse stranded citizens ko rescue karo!" }
      ],
      checkpoints: [
        {
          text: "Drive into the Arabian Sea waters past the Tetrapods",
          target: new THREE.Vector3(-90, 0, -50),
          radius: 12.0,
          type: 'reach'
        },
        {
          text: "Rescue the stranded passenger boat near the Sea Link Pylon",
          target: new THREE.Vector3(-80, 0, -220),
          radius: 15.0,
          type: 'reach',
          timer: 60
        },
        {
          text: "Return safely to Gateway Harbor stairs!",
          target: new THREE.Vector3(-30, 0, 160),
          radius: 8.0,
          type: 'reach'
        }
      ],
      rewardCash: 7000,
      rewardWeapon: 'katta',
      successMessage: "RESCUE HERO! You navigated the high tide! ₹7,000 awarded."
    }
  ],

  onEnable: (ctx) => {
    // Switch weather to monsoon
    ctx.weather.setWeather('monsoon');

    // Spawn an Amphibious Tuk-Tuk
    const pPos = ctx.player.position;
    const tuk = ctx.game.factory.createAutoRickshaw({ bodyColor: 0x0088cc, roofColor: 0xffe600 });
    tuk.position.set(pPos.x + 4, 0, pPos.z + 4);
    ctx.scene.add(tuk);

    const v = new Vehicle(tuk, { type: 'auto', maxSpeed: 28, isAmphibious: true }, ctx.audioEngine, ctx.game.particleSystem, ctx.physics);
    ctx.trafficManager.vehicles.push(v);

    ctx.showMessage("Monsoon Madness Enabled! Rain & Amphibious Tuk-Tuk active! You can drive on water!");
  },

  onDisable: (ctx) => {
    ctx.weather.setWeather('sunset');
    ctx.showMessage("Monsoon Madness Disabled. Returned to golden sunset.");
  }
};
