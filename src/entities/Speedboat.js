// MUMBYE: MAXIMUM CITY - Speedboat & Hydrodynamic Watercraft Entity
import * as THREE from 'three';

export class Speedboat {
  constructor(mesh, options = {}, audioEngine, particleSystem, physics) {
    this.mesh = mesh;
    this.audioEngine = audioEngine;
    this.particleSystem = particleSystem;
    this.physics = physics;

    this.type = 'speedboat';
    this.isPolice = options.isPolice || false;
    this.name = options.name || (this.isPolice ? 'Metro Harbor Patrol' : 'Sea-Rider Cruiser');

    this.position = this.mesh.position;
    this.rotation = this.mesh.rotation;

    // Hydrodynamic parameters
    this.speed = 0;
    this.maxSpeed = options.maxSpeed || 38.0; // ~137 km/h
    this.acceleration = 16.0;
    this.reverseSpeed = -8.0;
    this.drag = 4.2; // Hydrodynamic water resistance
    this.turnSpeed = 1.75;
    this.health = 160;
    this.isDestroyed = false;

    // Nitro
    this.hasNitro = true;
    this.nitroFuel = 100;
    this.isNitroActive = false;

    // Floatation & Wave physics
    this.waterBaseY = -0.4;
    this.waveTime = Math.random() * Math.PI * 2;
    this.roll = 0;
    this.pitch = 0;

    this.isPlayerDriving = false;
    this.strobeTimer = 0;

    // Collision dimensions
    this.width = 2.4;
    this.length = 6.4;
  }

  enter() {
    this.isPlayerDriving = true;
    this.audioEngine?.startBoatEngine();
    this.audioEngine?.playWaterSplash();
  }

  exit() {
    this.isPlayerDriving = false;
    this.audioEngine?.stopBoatEngine();
    this.isNitroActive = false;
  }

  takeDamage(amount) {
    if (this.isDestroyed) return;
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.isDestroyed = true;
      this.particleSystem?.spawnSparks(this.position);
      this.audioEngine?.playExplosion();
      this.speed = 0;
      if (this.isPlayerDriving) {
        window.dispatchEvent(new CustomEvent('mumbye_player_wasted'));
      }
    }
  }

  update(delta, input = null) {
    if (this.isDestroyed) return;

    this.waveTime += delta * 2.0;

    if (this.isPlayerDriving && input) {
      const fwdInput = input.moveForward;
      const rightInput = input.moveRight;
      const isBraking = input.isHandbraking;
      const wantsNitro = input.isSprinting && this.hasNitro && this.nitroFuel > 0 && fwdInput > 0;

      // Nitro boost
      if (wantsNitro) {
        this.isNitroActive = true;
        this.nitroFuel = Math.max(0, this.nitroFuel - delta * 25);
      } else {
        this.isNitroActive = false;
        if (this.nitroFuel < 100) this.nitroFuel += delta * 8;
      }

      const accelRate = this.acceleration * (this.isNitroActive ? 1.6 : 1.0);
      const topSpeed = this.maxSpeed * (this.isNitroActive ? 1.35 : 1.0);

      // Throttle & acceleration
      if (fwdInput > 0) {
        this.speed = Math.min(topSpeed, this.speed + accelRate * delta);
      } else if (fwdInput < 0) {
        this.speed = Math.max(this.reverseSpeed, this.speed - accelRate * 0.7 * delta);
      } else {
        // Natural water resistance drag
        if (this.speed > 0) {
          this.speed = Math.max(0, this.speed - this.drag * delta);
        } else if (this.speed < 0) {
          this.speed = Math.min(0, this.speed + this.drag * delta);
        }
      }

      // Hydro-brake
      if (isBraking) {
        if (this.speed > 0) this.speed = Math.max(0, this.speed - this.drag * 3.5 * delta);
        else if (this.speed < 0) this.speed = Math.min(0, this.speed + this.drag * 3.5 * delta);
      }

      // Rudder steering (effective when moving)
      if (rightInput !== 0 && Math.abs(this.speed) > 0.5) {
        const steerDir = this.speed >= 0 ? -1 : 1;
        const speedFactor = Math.min(1.0, Math.abs(this.speed) / 12.0);
        this.rotation.y += rightInput * steerDir * this.turnSpeed * speedFactor * delta;

        // Roll into turns
        const targetRoll = -rightInput * Math.min(0.35, Math.abs(this.speed) / topSpeed * 0.4);
        this.roll = THREE.MathUtils.lerp(this.roll, targetRoll, delta * 6.0);
      } else {
        this.roll = THREE.MathUtils.lerp(this.roll, 0, delta * 5.0);
      }

      // Planing: Bow rises up when accelerating forward
      const targetPitch = fwdInput > 0 ? Math.min(0.16, (this.speed / topSpeed) * 0.18) : 0;
      this.pitch = THREE.MathUtils.lerp(this.pitch, targetPitch, delta * 4.0);

      // Sound update
      const normSpeed = Math.abs(this.speed) / this.maxSpeed;
      this.audioEngine?.updateBoatEngine(normSpeed, fwdInput > 0);

      // Water Wake and Foam Particles
      if (Math.abs(this.speed) > 3.0) {
        const fwdVec = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y);
        this.particleSystem?.spawnWaterWake(this.position, fwdVec, Math.abs(this.speed));
      }
    } else {
      // Idle float
      this.roll = THREE.MathUtils.lerp(this.roll, 0, delta * 3.0);
      this.pitch = THREE.MathUtils.lerp(this.pitch, 0, delta * 3.0);
      this.speed = THREE.MathUtils.lerp(this.speed, 0, delta * 2.0);
    }

    // Displacement forward
    const fwdVec = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y);
    const displacement = fwdVec.clone().multiplyScalar(this.speed * delta);
    this.position.add(displacement);

    // Dynamic wave bobbing
    const waveBob = Math.sin(this.waveTime) * 0.08 + Math.cos(this.waveTime * 0.7) * 0.04;
    this.position.y = this.waterBaseY + waveBob;

    // Apply orientation angles
    this.mesh.rotation.z = this.roll + Math.sin(this.waveTime * 0.8) * 0.03;
    this.mesh.rotation.x = this.pitch + Math.cos(this.waveTime * 1.1) * 0.02;

    // Police strobe alternation
    if (this.isPolice && this.mesh.strobeL && this.mesh.strobeR) {
      this.strobeTimer += delta * 12;
      const isRed = Math.floor(this.strobeTimer) % 2 === 0;
      this.mesh.strobeL.visible = isRed;
      this.mesh.strobeR.visible = !isRed;
    }
  }
}
