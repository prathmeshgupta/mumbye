// MUMBYE: MAXIMUM CITY - Sky-Ranger VTOL Helicopter Entity
import * as THREE from 'three';

const _tempVec = new THREE.Vector3();

export class Helicopter {
  constructor(mesh, audioEngine, particleSystem, physics) {
    this.mesh = mesh;
    this.audioEngine = audioEngine;
    this.particleSystem = particleSystem;
    this.physics = physics;

    this.position = this.mesh.position;
    this.velocity = new THREE.Vector3();

    this.yaw = 0;
    this.pitch = 0;
    this.roll = 0;

    this.isPlayerFlying = false;
    this.rotorRpm = 0; // 0.0 to 1.0
    this.maxSpeed = 38.0;
    this.climbSpeed = 16.0;
    this.altitudeCeiling = 140.0;
    this.groundY = 0.0;

    this.health = 300;
    this.maxHealth = 300;
    this.isDestroyed = false;

    // Type identifier for HUD
    this.type = 'helicopter';
  }

  enter() {
    this.isPlayerFlying = true;
    if (this.audioEngine) {
      this.audioEngine.startHelicopterSound();
    }
  }

  exit() {
    this.isPlayerFlying = false;
    if (this.audioEngine) {
      this.audioEngine.stopHelicopterSound();
    }
  }

  update(delta, input) {
    if (this.isDestroyed) return;

    // Spin up/down rotors
    const targetRpm = this.isPlayerFlying ? 1.0 : 0.0;
    this.rotorRpm += (targetRpm - this.rotorRpm) * Math.min(1.0, delta * 2.0);

    // Animate Rotors
    if (this.mesh.mainRotor) {
      this.mesh.mainRotor.rotation.y += this.rotorRpm * 38.0 * delta;
    }
    if (this.mesh.tailRotor) {
      this.mesh.tailRotor.rotation.x += this.rotorRpm * 55.0 * delta;
    }

    if (!this.isPlayerFlying) {
      // Settle on ground
      if (this.position.y > this.groundY) {
        this.position.y = Math.max(this.groundY, this.position.y - 4.0 * delta);
      }
      return;
    }

    // Flight controls
    let collective = 0; // Altitude climb/descend
    let pitchInput = 0; // Forward/back
    let yawInput = 0; // Left/right turn
    let rollInput = 0;

    if (input.keys['Space']) collective += 1;
    if (input.keys['ShiftLeft'] || input.keys['ShiftRight']) collective -= 1;
    if (input.keys['KeyW'] || input.keys['ArrowUp']) pitchInput += 1;
    if (input.keys['KeyS'] || input.keys['ArrowDown']) pitchInput -= 1;
    if (input.keys['KeyA'] || input.keys['ArrowLeft']) yawInput += 1;
    if (input.keys['KeyD'] || input.keys['ArrowRight']) yawInput -= 1;

    // Yaw rotation
    this.yaw += yawInput * 1.5 * delta;

    // Pitch & Roll target angles based on flight
    const targetPitch = pitchInput * 0.32;
    const targetRoll = -yawInput * 0.22;
    this.pitch += (targetPitch - this.pitch) * Math.min(1.0, delta * 5.0);
    this.roll += (targetRoll - this.roll) * Math.min(1.0, delta * 5.0);

    // Forward direction from yaw
    const forwardVec = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const targetVelX = forwardVec.x * pitchInput * this.maxSpeed * this.rotorRpm;
    const targetVelZ = forwardVec.z * pitchInput * this.maxSpeed * this.rotorRpm;
    const targetVelY = collective * this.climbSpeed * this.rotorRpm;

    this.velocity.x += (targetVelX - this.velocity.x) * Math.min(1.0, delta * 3.5);
    this.velocity.z += (targetVelZ - this.velocity.z) * Math.min(1.0, delta * 3.5);
    this.velocity.y += (targetVelY - this.velocity.y) * Math.min(1.0, delta * 4.0);

    // Apply movement
    this.position.x += this.velocity.x * delta;
    this.position.z += this.velocity.z * delta;
    this.position.y += this.velocity.y * delta;

    // Clamping
    this.position.y = Math.max(this.groundY, Math.min(this.altitudeCeiling, this.position.y));

    // Update Mesh transform
    this.mesh.rotation.set(0, 0, 0);
    this.mesh.rotateY(this.yaw);
    this.mesh.rotateX(this.pitch);
    this.mesh.rotateZ(this.roll);

    // Downwash particles when close to ground
    if (this.position.y < 16.0 && this.rotorRpm > 0.5 && this.particleSystem) {
      if (Math.random() < 0.35) {
        const dustPos = this.position.clone();
        dustPos.y = 0.2;
        dustPos.x += (Math.random() - 0.5) * 6;
        dustPos.z += (Math.random() - 0.5) * 6;
        this.particleSystem.spawnSmoke(dustPos, '#cbd5e1');
      }
    }

    // Audio update
    if (this.audioEngine) {
      this.audioEngine.updateHelicopterSound(this.rotorRpm, collective);
    }
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0 && !this.isDestroyed) {
      this.isDestroyed = true;
      if (this.particleSystem) {
        this.particleSystem.spawnExplosion(this.position);
      }
      this.exit();
    }
  }
}
