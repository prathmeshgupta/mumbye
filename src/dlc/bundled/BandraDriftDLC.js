// MUMBYE: MAXIMUM CITY - DLC 1: Bandra Underground Racing & Nitro Pack
import * as THREE from 'three';
import { Vehicle } from '../../entities/Vehicle.js';

export const BandraDriftDLC = {
  id: 'dlc_bandra_drift',
  title: 'Bandra Nitro Drifters Pack',
  version: '1.2.0',
  author: 'Mumbye Studios',
  description: 'Unlocks Nitrous Oxide Boost for all cars, Neon Cyber Auto Rickshaws, and the midnight Bandra-Worli drift circuit.',
  badge: 'SPEED DLC',

  cheats: {
    'NITRO': (ctx) => {
      if (ctx.player.isDriving && ctx.player.currentVehicle) {
        ctx.player.currentVehicle.hasNitro = true;
        ctx.player.currentVehicle.nitroFuel = 100;
        ctx.showMessage("NITRO BOOST ENGAGED! Press Shift while driving!");
      } else {
        ctx.showMessage("Get inside a vehicle first to use Nitro!");
      }
    },
    'DRIFT': (ctx) => {
      if (ctx.player.isDriving && ctx.player.currentVehicle) {
        ctx.player.currentVehicle.driftFactor = 0.82;
        ctx.player.currentVehicle.turnSpeed = 3.8;
        ctx.showMessage("DRIFT KING MODE ACTIVE! Hold Space to slide!");
      }
    }
  },

  missions: [
    {
      id: 'm_dlc_bandra_gp',
      title: "DLC: Bandra Midnight Sea Link GP",
      contact: "Speedy Raju",
      introDialog: [
        { speaker: "Speedy Raju", text: "Aye Kabir! Bandra boys ne Midnight Sea Link race challenge kiya hai!" },
        { speaker: "Kabir", text: "Inki gaadiyo ka meter down kar dunga. Kaha aana hai?" },
        { speaker: "Speedy Raju", text: "Sea Link toll gate pe aa fatfat! Full nitro daba ke nikalna!" }
      ],
      checkpoints: [
        {
          text: "Reach the Bandra-Worli Sea Link Starting Grid",
          target: new THREE.Vector3(-50, 4.5, -160),
          radius: 8.0,
          type: 'reach'
        },
        {
          text: "Drift through Checkpoint 1 on the Sea Link Bridge",
          target: new THREE.Vector3(-50, 4.5, -240),
          radius: 9.0,
          type: 'reach',
          timer: 35
        },
        {
          text: "Hit the Mega Ramp over the finish line in North Bay!",
          target: new THREE.Vector3(-50, 4.5, -340),
          radius: 10.0,
          type: 'reach',
          timer: 30
        }
      ],
      rewardCash: 5000,
      rewardWeapon: 'supercar',
      successMessage: "DLC RACE WON! You are the King of Bandra Drift! ₹5,000 awarded."
    }
  ],

  onEnable: (ctx) => {
    // Spawn a Neon Cyber Auto Rickshaw with Nitro right near player!
    const pPos = ctx.player.position;
    const neonAuto = ctx.game.factory.createAutoRickshaw({ isNeon: true });
    neonAuto.position.set(pPos.x + 3, 0, pPos.z + 3);
    ctx.scene.add(neonAuto);

    const v = new Vehicle(neonAuto, { type: 'auto', maxSpeed: 30, hasNitro: true }, ctx.audioEngine, ctx.game.particleSystem, ctx.physics);
    ctx.trafficManager.vehicles.push(v);

    ctx.showMessage("Bandra Nitro Drifters Pack Enabled! Neon Cyber Auto spawned! Hold Shift in any car for Nitro!");
  },

  onDisable: (ctx) => {
    ctx.showMessage("Bandra Nitro Drifters Pack Disabled.");
  }
};
