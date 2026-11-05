// MUMBYE: MAXIMUM CITY - Pedestrian AI & Population System
import * as THREE from 'three';
import { ModelFactory } from '../world/ModelFactory.js';

export class PedestrianManager {
  constructor(scene, physics, audioEngine, particleSystem) {
    this.scene = scene;
    this.physics = physics;
    this.audioEngine = audioEngine;
    this.particleSystem = particleSystem;
    this.factory = new ModelFactory();

    this.pedestrians = [];
    this.maxPedestrians = 28;
    this.droppedCash = []; // Collectible cash notes
    this.droppedLoot = []; // Collectible contraband / black market loot

    // Bambaiya scream quotes
    this.panicQuotes = [
      "Aila! Bhaago re baba!",
      "Security ko bulao!",
      "Goli chal raha hai!",
      "Mera dabba gir jayega!",
      "Aye shana mat ban!",
      "Bhai maaf karo!",
      "Katt le beta fatfat!"
    ];

    // Ambient crowd reaction quotes for low-flying drones & helicopters
    this.aerialQuotes = [
      "Aila! Dekh dekh, phone nikal, reel bana viral ho jayega!",
      "Arre baap re! AstraCorp ka drone itna neeche ud raha hai!",
      "Helicopter building ke itna paas aa gaya?!",
      "Aye shana, helicopter ka hawa sab chhatri uda dega!",
      "SkyEye surveillance chal raha hai boss!"
    ];
    this.aerialQuoteCooldown = 0;

    window.addEventListener('mumbye_drone_loot_dropped', (e) => {
      this.spawnLootDrop(e.detail.x, e.detail.z, e.detail.item);
    });
  }

  spawnInitial(sidewalkNodes) {
    if (!sidewalkNodes || sidewalkNodes.length === 0) return;

    const types = ['pedestrian', 'dabbawala', 'tapori', 'pedestrian'];
    for (let i = 0; i < this.maxPedestrians; i++) {
      const node = sidewalkNodes[Math.floor(Math.random() * sidewalkNodes.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      this.spawnPedestrian(node.x + (Math.random() - 0.5) * 4, node.z + (Math.random() - 0.5) * 4, type);
    }
  }

  spawnPedestrian(x, z, type = 'pedestrian') {
    const mesh = this.factory.createHumanoid(type);
    mesh.position.set(x, 0, z);
    mesh.rotation.y = Math.random() * Math.PI * 2;
    this.scene.add(mesh);

    const ped = {
      mesh,
      type,
      health: 60,
      state: 'wander', // 'wander', 'flee', 'dead'
      speed: 2.2 + Math.random() * 1.0,
      wanderTarget: new THREE.Vector3(x + (Math.random() - 0.5) * 40, 0, z + (Math.random() - 0.5) * 40),
      animTime: Math.random() * 10,
      fleeTimer: 0
    };

    this.pedestrians.push(ped);
    return ped;
  }

  update(delta, player, sidewalkNodes, activeAircraft = []) {
    const playerPos = player?.position || null;

    // Process dropped cash pickups
    for (let i = this.droppedCash.length - 1; i >= 0; i--) {
      const c = this.droppedCash[i];
      c.mesh.rotation.y += delta * 4;

      if (playerPos && playerPos.distanceTo(c.mesh.position) < 1.8) {
        this.audioEngine?.playCoinCash();
        window.dispatchEvent(new CustomEvent('mumbye_cash_collected', { detail: { amount: c.amount } }));
        this.scene.remove(c.mesh);
        this.droppedCash.splice(i, 1);
      }
    }

    // Process dropped contraband / black market loot pickups
    for (let i = this.droppedLoot.length - 1; i >= 0; i--) {
      const l = this.droppedLoot[i];
      l.mesh.rotation.y += delta * 3;
      l.mesh.position.y = l.baseY + Math.sin(Date.now() * 0.005) * 0.06;

      if (playerPos && playerPos.distanceTo(l.mesh.position) < 2.0) {
        this.audioEngine?.playShopKaching();
        if (player.addItem) {
          player.addItem(l.item.id, l.item.name, l.item.value, 1);
        }
        window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
          detail: { speaker: "Contraband Recovered", text: `Looted ${l.item.name}! Can be fenced at Chor Bazaar for ₹${l.item.value}.` }
        }));
        this.scene.remove(l.mesh);
        this.droppedLoot.splice(i, 1);
      }
    }

    // Aerial reaction check for low-flying drones or helicopters
    if (this.aerialQuoteCooldown > 0) this.aerialQuoteCooldown -= delta;
    let nearbyAircraft = null;
    for (let j = 0; j < activeAircraft.length; j++) {
      const craft = activeAircraft[j];
      if (!craft) continue;
      const isAirborne = craft.isActive || (craft.type === 'helicopter' && craft.isAirborne);
      if (isAirborne) {
        nearbyAircraft = craft;
        break;
      }
    }

    // Update pedestrians
    for (let i = this.pedestrians.length - 1; i >= 0; i--) {
      const p = this.pedestrians[i];

      if (p.state === 'dead') continue;

      // Check proximity to low-flying aircraft
      let aircraftDist = 999;
      if (nearbyAircraft) {
        const horizDist = new THREE.Vector2(p.mesh.position.x - nearbyAircraft.position.x, p.mesh.position.z - nearbyAircraft.position.z).length();
        const vertDist = Math.abs(nearbyAircraft.position.y - p.mesh.position.y);
        if (horizDist < 24.0 && vertDist < 20.0) {
          aircraftDist = horizDist;
          if (horizDist < 8.0 && vertDist < 8.0 && nearbyAircraft.type === 'helicopter') {
            p.state = 'cower';
          } else if (p.state !== 'flee' && p.state !== 'cower') {
            p.state = 'film';
          }

          // Trigger ambient crowd quote
          if (this.aerialQuoteCooldown <= 0 && Math.random() < 0.15) {
            this.aerialQuoteCooldown = 7.0;
            const quote = this.aerialQuotes[Math.floor(Math.random() * this.aerialQuotes.length)];
            window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
              detail: { speaker: "Mumbai Local Bystander", text: quote }
            }));
          }
        } else if (p.state === 'film' || p.state === 'cower') {
          p.state = 'wander';
        }
      } else if (p.state === 'film' || p.state === 'cower') {
        p.state = 'wander';
      }

      if (p.state === 'flee') {
        p.fleeTimer -= delta;
        if (p.fleeTimer <= 0) p.state = 'wander';

        // Run away from player
        if (playerPos) {
          const awayDir = p.mesh.position.clone().sub(playerPos).setY(0).normalize();
          p.mesh.rotation.y = Math.atan2(awayDir.x, awayDir.z);
          p.mesh.position.addScaledVector(awayDir, p.speed * 2.2 * delta);
        }
      } else if (p.state === 'film') {
        // Pedestrian stops, faces the aircraft, and points phone upward
        if (nearbyAircraft) {
          const toCraft = nearbyAircraft.position.clone().sub(p.mesh.position);
          p.mesh.rotation.y = THREE.MathUtils.lerp(p.mesh.rotation.y, Math.atan2(toCraft.x, toCraft.z), delta * 5.0);

          if (p.mesh.joints) {
            // Right arm points phone upward
            p.mesh.joints.armR.rotation.x = THREE.MathUtils.lerp(p.mesh.joints.armR.rotation.x, -1.35, delta * 6.0);
            p.mesh.joints.armL.rotation.x = THREE.MathUtils.lerp(p.mesh.joints.armL.rotation.x, 0, delta * 6.0);
            p.mesh.joints.head.rotation.x = THREE.MathUtils.lerp(p.mesh.joints.head.rotation.x, -0.45, delta * 6.0);
          }
        }
      } else if (p.state === 'cower') {
        // Pedestrian crouches with hands shielding head from downwash
        if (p.mesh.joints) {
          p.mesh.joints.armR.rotation.x = -2.1;
          p.mesh.joints.armL.rotation.x = -2.1;
          p.mesh.joints.head.rotation.x = 0.5;
        }
      } else {
        // Reset arms and head from film/cower
        if (p.mesh.joints && (p.mesh.joints.head.rotation.x !== 0)) {
          p.mesh.joints.head.rotation.x = THREE.MathUtils.lerp(p.mesh.joints.head.rotation.x, 0, delta * 6.0);
        }

        // Wander toward target
        const distToTarget = p.mesh.position.distanceTo(p.wanderTarget);
        if (distToTarget < 2.0 || Math.random() < 0.005) {
          if (sidewalkNodes && sidewalkNodes.length > 0) {
            const nextNode = sidewalkNodes[Math.floor(Math.random() * sidewalkNodes.length)];
            p.wanderTarget.set(nextNode.x, 0, nextNode.z);
          } else {
            p.wanderTarget.set(
              p.mesh.position.x + (Math.random() - 0.5) * 50,
              0,
              p.mesh.position.z + (Math.random() - 0.5) * 50
            );
          }
        }

        const toTarget = p.wanderTarget.clone().sub(p.mesh.position).setY(0).normalize();
        const targetRotY = Math.atan2(toTarget.x, toTarget.z);
        p.mesh.rotation.y = THREE.MathUtils.lerp(p.mesh.rotation.y, targetRotY, delta * 4);
        p.mesh.position.addScaledVector(toTarget, p.speed * delta);
      }

      // Height check
      const groundY = this.physics.getGroundHeight(p.mesh.position.x, p.mesh.position.z);
      p.mesh.position.y = groundY;

      // Animate walking joints (only when wandering or fleeing)
      if (p.state === 'wander' || p.state === 'flee') {
        p.animTime += delta * (p.state === 'flee' ? 14 : 7);
        const swing = Math.sin(p.animTime);
        if (p.mesh.joints) {
          p.mesh.joints.legL.rotation.x = swing * 0.6;
          p.mesh.joints.legR.rotation.x = -swing * 0.6;
          p.mesh.joints.armL.rotation.x = -swing * 0.5;
          p.mesh.joints.armR.rotation.x = swing * 0.5;
        }
      }
    }
  }

  alertGunshot(origin, radius = 40) {
    for (let i = 0; i < this.pedestrians.length; i++) {
      const p = this.pedestrians[i];
      if (p.state === 'dead') continue;
      if (p.mesh.position.distanceTo(origin) < radius) {
        p.state = 'flee';
        p.fleeTimer = 8.0;

        if (Math.random() < 0.25) {
          const quote = this.panicQuotes[Math.floor(Math.random() * this.panicQuotes.length)];
          window.dispatchEvent(new CustomEvent('mumbye_pedestrian_shout', {
            detail: { position: p.mesh.position, quote }
          }));
        }
      }
    }
  }

  checkDamageAt(origin, range, damage) {
    for (let i = 0; i < this.pedestrians.length; i++) {
      const p = this.pedestrians[i];
      if (p.state === 'dead') continue;
      const d = p.mesh.position.distanceTo(origin);
      if (d < range) {
        p.health -= damage;
        this.particleSystem?.spawnBlood(p.mesh.position.clone().add(new THREE.Vector3(0, 1.0, 0)));

        if (p.health <= 0) {
          this.killPedestrian(p);
        } else {
          p.state = 'flee';
          p.fleeTimer = 10.0;
        }
        return true;
      }
    }
    return false;
  }

  killPedestrian(p) {
    p.state = 'dead';
    p.mesh.rotation.x = -Math.PI / 2;
    p.mesh.position.y = 0.2;

    // Drop Cash (₹20 to ₹120)
    const amount = 20 + Math.floor(Math.random() * 5) * 20;
    this.spawnCashDrop(p.mesh.position.x, p.mesh.position.z, amount);

    // 35% chance to drop fenceable contraband for Chor Bazaar Black Market
    if (Math.random() < 0.35) {
      const contrabandTypes = [
        { id: 'stolen_watch', name: 'Smuggled Luxury Watch', value: 800, color: 0xf59e0b },
        { id: 'antique_necklace', name: 'Vintage Gold Necklace', value: 1500, color: 0xfbbf24 }
      ];
      const item = contrabandTypes[Math.floor(Math.random() * contrabandTypes.length)];
      this.spawnLootDrop(p.mesh.position.x + (Math.random() - 0.5) * 0.8, p.mesh.position.z + (Math.random() - 0.5) * 0.8, item);
    }

    window.dispatchEvent(new CustomEvent('mumbye_pedestrian_killed'));
  }

  spawnCashDrop(x, z, amount = 50) {
    const cashGeo = new THREE.BoxGeometry(0.5, 0.04, 0.25);
    const cashMat = new THREE.MeshBasicMaterial({ color: 0x22aa44 }); // Green rupee stack
    const mesh = new THREE.Mesh(cashGeo, cashMat);
    mesh.position.set(x, 0.2, z);
    this.scene.add(mesh);

    this.droppedCash.push({ mesh, amount });
  }

  spawnLootDrop(x, z, item) {
    // 3D Contraband Loot Pickup (Glowing diamond / jewel box)
    const lootGeo = new THREE.BoxGeometry(0.35, 0.25, 0.35);
    const lootMat = new THREE.MeshStandardMaterial({
      color: item.color || 0x06b6d4,
      metalness: 0.8,
      roughness: 0.2,
      emissive: item.color || 0x06b6d4,
      emissiveIntensity: 0.4
    });
    const mesh = new THREE.Mesh(lootGeo, lootMat);
    const baseY = 0.35;
    mesh.position.set(x, baseY, z);
    this.scene.add(mesh);

    this.droppedLoot.push({ mesh, baseY, item });
  }
}
