// MUMBYE: MAXIMUM CITY - Metro Security Tactical Interceptor Drone (Aerial Pursuit & Dogfighting)
import * as THREE from 'three';
import { ModelFactory } from '../world/ModelFactory.js';

export class PoliceInterceptorDrone {
  constructor(scene, physics, audioEngine, particleSystem, startPos) {
    this.scene = scene;
    this.physics = physics;
    this.audioEngine = audioEngine;
    this.particleSystem = particleSystem;
    this.factory = new ModelFactory();

    this.mesh = this.factory.createPoliceInterceptorDrone();
    this.mesh.position.copy(startPos || new THREE.Vector3(0, 16, 0));
    this.scene.add(this.mesh);

    this.position = this.mesh.position;
    this.health = 90;
    this.speed = 24.0;
    this.targetAltitude = 14.0;
    this.attackCooldown = 2.0;
    this.isDestroyed = false;

    this.strobeTimer = 0;
    this.rotorSpin = 0;
    this.chatterTimer = 4.0;

    this.chatterQuotes = [
      "Interceptor Drone Alpha: Target locked in visual grid.",
      "Metro Drone Unit: Discharging compliance stun beam!",
      "Air Surveillance: Suspect acquired. Engaging aerial suppression.",
      "Warning: Neutralizing suspect vehicle electronics!"
    ];
  }

  takeDamage(amount) {
    if (this.isDestroyed) return;
    this.health -= amount;
    this.particleSystem?.spawnSparks(this.position);

    if (this.health <= 0) {
      this.destroy();
    }
  }

  destroy() {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    this.audioEngine?.playExplosion();
    this.particleSystem?.spawnSparks(this.position);

    // Drop loot at ground level below drone
    const dropX = this.position.x;
    const dropZ = this.position.z;
    const groundY = Math.max(0.1, this.physics.getGroundHeight(dropX, dropZ));

    window.dispatchEvent(new CustomEvent('mumbye_drone_loot_dropped', {
      detail: {
        x: dropX,
        y: groundY + 0.3,
        z: dropZ,
        item: {
          id: 'data_drive',
          name: 'Encrypted AstraCorp Data Drive',
          value: 1200
        }
      }
    }));

    if (this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
  }

  update(delta, player, playerDrone = null, playerHeli = null) {
    if (this.isDestroyed) return;

    // Spin quad rotors
    this.rotorSpin += delta * 45;
    if (this.mesh.rotors) {
      this.mesh.rotors.forEach(r => {
        r.rotation.y = this.rotorSpin;
      });
    }

    // Flash emergency strobes
    this.strobeTimer += delta * 10;
    const isRed = Math.floor(this.strobeTimer) % 2 === 0;
    if (this.mesh.redStrobe && this.mesh.blueStrobe) {
      this.mesh.redStrobe.visible = isRed;
      this.mesh.blueStrobe.visible = !isRed;
    }

    // Determine target to pursue (prioritize airborne player drone or helicopter if active)
    let targetPos = player.position.clone();
    let isAirborneTarget = false;

    if (playerDrone && playerDrone.isActive) {
      targetPos = playerDrone.position.clone();
      isAirborneTarget = true;
    } else if (player.isDriving && player.currentVehicle?.type === 'helicopter' && playerHeli && playerHeli.isAirborne) {
      targetPos = playerHeli.position.clone();
      isAirborneTarget = true;
    }

    // Target altitude: match airborne vehicle altitude or hover 14m above ground targets
    const desiredAlt = isAirborneTarget ? targetPos.y + 1.5 : Math.max(14.0, targetPos.y + 12.0);
    this.position.y = THREE.MathUtils.lerp(this.position.y, desiredAlt, delta * 3.5);

    // Lateral pursuit
    const toTarget = targetPos.clone().sub(this.position);
    toTarget.y = 0;
    const dist2D = toTarget.length();

    if (dist2D > 6.0) {
      toTarget.normalize();
      const targetYaw = Math.atan2(toTarget.x, toTarget.z);
      this.mesh.rotation.y = THREE.MathUtils.lerp(this.mesh.rotation.y, targetYaw, delta * 4.0);
      this.position.addScaledVector(toTarget, this.speed * delta);

      // Pitch forward in pursuit
      this.mesh.rotation.x = THREE.MathUtils.lerp(this.mesh.rotation.x, 0.22, delta * 4.0);
    } else {
      // Orbiting / hovering near target
      this.mesh.rotation.x = THREE.MathUtils.lerp(this.mesh.rotation.x, 0, delta * 4.0);
      this.mesh.rotation.y += delta * 0.8;
    }

    // Aim gimbal towards target
    if (this.mesh.gimbal) {
      this.mesh.gimbal.lookAt(targetPos);
    }

    // Attack cooldown & stun laser firing
    this.attackCooldown -= delta;
    if (this.attackCooldown <= 0 && dist2D < 32.0) {
      this.attackCooldown = 3.0 + Math.random() * 1.5;
      this.fireStunLaser(targetPos, player, playerDrone, playerHeli, isAirborneTarget);
    }

    // Ambient enforcement radio chatter
    this.chatterTimer -= delta;
    if (this.chatterTimer <= 0) {
      this.chatterTimer = 8.0 + Math.random() * 6.0;
      const quote = this.chatterQuotes[Math.floor(Math.random() * this.chatterQuotes.length)];
      window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
        detail: { speaker: "Metro Tactical Grid", text: quote }
      }));
    }
  }

  fireStunLaser(targetPos, player, playerDrone, playerHeli, isAirborneTarget) {
    const muzzlePos = this.position.clone().add(new THREE.Vector3(0, -0.4, 0));
    this.audioEngine?.playStunLaser();
    this.particleSystem?.spawnStunBeam(muzzlePos, targetPos);

    if (isAirborneTarget) {
      if (playerDrone && playerDrone.isActive) {
        playerDrone.drainBattery(20);
        window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
          detail: { speaker: "SkyEye Warning", text: "EMP Interceptor strike! Battery drained by 20%." }
        }));
      } else if (playerHeli) {
        playerHeli.takeDamage(15);
      }
    } else {
      // Ground target attack
      if (player.isDriving && player.currentVehicle) {
        player.currentVehicle.takeDamage(10);
      } else {
        player.takeDamage(12);
      }
    }
  }
}
