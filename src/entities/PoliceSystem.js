// MUMBYE: MAXIMUM CITY - Metro Enforcement & 5-Star Wanted Level System
import * as THREE from 'three';
import { ModelFactory } from '../world/ModelFactory.js';
import { Vehicle } from './Vehicle.js';
import { PoliceInterceptorDrone } from './PoliceInterceptorDrone.js';

const _tempVec = new THREE.Vector3();

export class PoliceSystem {
  constructor(scene, physics, audioEngine, particleSystem) {
    this.scene = scene;
    this.physics = physics;
    this.audioEngine = audioEngine;
    this.particleSystem = particleSystem;
    this.factory = new ModelFactory();

    this.wantedLevel = 0; // 0 to 5
    this.policeOfficers = [];
    this.policeVehicles = [];
    this.policeDrones = [];

    this.cooldownTimer = 0;
    this.isFlashingStars = false;

    this.enforcerQuotes = [
      "Halt! Step away from the vehicle!",
      "Surrender immediately!",
      "Do not resist Metro Security!",
      "Pull over to the curb!",
      "Security unit has visual on suspect!"
    ];
  }

  setWantedLevel(level) {
    const clamped = Math.max(0, Math.min(5, level));
    if (this.wantedLevel !== clamped) {
      this.wantedLevel = clamped;
      if (this.wantedLevel > 0) {
        this.cooldownTimer = 20.0 + this.wantedLevel * 10;
        this.spawnPoliceResponse();
      } else {
        this.clearPolice();
      }
      window.dispatchEvent(new CustomEvent('mumbye_wanted_changed', { detail: { level: this.wantedLevel } }));
    }
  }

  addCrime(severity = 1) {
    if (this.wantedLevel < 5) {
      this.setWantedLevel(this.wantedLevel + severity);
    }
  }

  clearPolice() {
    this.policeOfficers.forEach(p => {
      if (p.mesh.parent) p.mesh.parent.remove(p.mesh);
    });
    this.policeVehicles.forEach(v => {
      v.audioEngine?.playPoliceSiren(false);
      if (v.mesh.parent) v.mesh.parent.remove(v.mesh);
    });
    this.policeDrones.forEach(d => {
      if (d.mesh.parent) d.mesh.parent.remove(d.mesh);
    });
    this.policeOfficers = [];
    this.policeVehicles = [];
    this.policeDrones = [];
  }

  spawnPoliceResponse() {
    if (this.wantedLevel === 0) return;

    // Level 1+: Spawn Foot Officers with Lathis
    if (this.policeOfficers.length < this.wantedLevel * 2) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 20;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      const mesh = this.factory.createHumanoid('police');
      mesh.position.set(x, 0, z);
      this.scene.add(mesh);

      // Attach Lathi to officer's hand
      const lathi = this.factory.createWeaponMesh('lathi');
      mesh.joints.handSocket.add(lathi);

      this.policeOfficers.push({
        mesh,
        health: 80,
        speed: 5.5,
        attackTimer: 0,
        animTime: 0
      });
    }

    // Level 2+: Spawn Police PCR Gypsies
    if (this.wantedLevel >= 2 && this.policeVehicles.length < (this.wantedLevel - 1)) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 30;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      const carMesh = this.factory.createPoliceCar();
      carMesh.position.set(x, 0, z);
      this.scene.add(carMesh);

      const pVehicle = new Vehicle(carMesh, { type: 'police' }, this.audioEngine, this.particleSystem, this.physics);
      pVehicle.isSirenOn = true;
      pVehicle.aiSpeed = 22 + this.wantedLevel * 2;
      this.audioEngine?.playPoliceSiren(true);

      this.policeVehicles.push(pVehicle);
    }

    // Level 3+: Spawn Tactical Interceptor Drones
    const maxDrones = Math.max(1, this.wantedLevel - 2);
    if (this.wantedLevel >= 3 && this.policeDrones.length < maxDrones) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 35 + Math.random() * 25;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const drone = new PoliceInterceptorDrone(
        this.scene,
        this.physics,
        this.audioEngine,
        this.particleSystem,
        new THREE.Vector3(x, 18, z)
      );
      this.policeDrones.push(drone);
    }
  }

  checkDroneDamage(origin, range, damage) {
    for (let i = this.policeDrones.length - 1; i >= 0; i--) {
      const drone = this.policeDrones[i];
      if (drone.isDestroyed) continue;
      if (drone.position.distanceTo(origin) <= range) {
        drone.takeDamage(damage);
        return true;
      }
    }
    return false;
  }

  update(delta, player, playerDrone = null, playerHeli = null) {
    if (this.wantedLevel === 0) return;

    const playerPos = player.position;

    // Cooldown timer if player breaks line of sight or hides
    this.cooldownTimer -= delta;
    if (this.cooldownTimer <= 0) {
      this.setWantedLevel(this.wantedLevel - 1);
      return;
    }

    // Update Tactical Interceptor Drones
    for (let i = this.policeDrones.length - 1; i >= 0; i--) {
      const drone = this.policeDrones[i];
      if (drone.isDestroyed) {
        this.policeDrones.splice(i, 1);
        continue;
      }
      drone.update(delta, player, playerDrone, playerHeli);
    }

    // Update Foot Officers
    for (let i = this.policeOfficers.length - 1; i >= 0; i--) {
      const cop = this.policeOfficers[i];

      _tempVec.subVectors(playerPos, cop.mesh.position).setY(0);
      const dist = _tempVec.length();

      if (dist > 1.8) {
        // Run toward player
        _tempVec.normalize();
        cop.mesh.rotation.y = Math.atan2(_tempVec.x, _tempVec.z);
        cop.mesh.position.addScaledVector(_tempVec, cop.speed * delta);

        cop.animTime += delta * 12;
        const swing = Math.sin(cop.animTime);
        if (cop.mesh.joints) {
          cop.mesh.joints.legL.rotation.x = swing * 0.7;
          cop.mesh.joints.legR.rotation.x = -swing * 0.7;
          cop.mesh.joints.armL.rotation.x = -swing * 0.6;
        }
      } else {
        // In range: Swing Lathi baton!
        cop.attackTimer -= delta;
        if (cop.attackTimer <= 0) {
          cop.attackTimer = 1.0;
          this.audioEngine?.playBatSwing();
          player.takeDamage(15);
          if (Math.random() < 0.4) {
            const quote = this.enforcerQuotes[Math.floor(Math.random() * this.enforcerQuotes.length)];
            window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
              detail: { speaker: "Metro Security", text: quote }
            }));
          }
        }
      }

      cop.mesh.position.y = this.physics.getGroundHeight(cop.mesh.position.x, cop.mesh.position.z);
    }

    // Update Police Vehicles (Pursuit & Ramming AI)
    for (let i = this.policeVehicles.length - 1; i >= 0; i--) {
      const pv = this.policeVehicles[i];
      if (pv.isDestroyed) continue;

      _tempVec.subVectors(playerPos, pv.position).setY(0);
      const desiredRot = Math.atan2(_tempVec.x, _tempVec.z);

      let diff = desiredRot - pv.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;

      pv.mesh.rotation.y += diff * Math.min(1.0, delta * 3.8);
      pv.speed = THREE.MathUtils.lerp(pv.speed, pv.aiSpeed, delta * 2.5);

      pv.update(delta);

      // Check ramming player vehicle
      if (player.isDriving && player.currentVehicle) {
        const d = pv.position.distanceTo(player.currentVehicle.position);
        if (d < 4.2) {
          player.currentVehicle.takeDamage(12);
          this.audioEngine?.playCrash();
          this.particleSystem?.spawnSparks(pv.position);
        }
      }
    }
  }
}
