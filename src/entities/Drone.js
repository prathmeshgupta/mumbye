// MUMBYE: MAXIMUM CITY - Controllable Surveillance & Tactical Drone
import * as THREE from 'three';

const _tempVec = new THREE.Vector3();

export class Drone {
  constructor(mesh, audioEngine, particleSystem, physics) {
    this.mesh = mesh;
    this.audioEngine = audioEngine;
    this.particleSystem = particleSystem;
    this.physics = physics;

    this.position = this.mesh.position;
    this.velocity = new THREE.Vector3();
    this.yaw = 0; // Horizontal heading in radians
    this.pitch = 0; // Tilt angle
    this.roll = 0;

    this.isActive = false;
    this.battery = 100; // 0 - 100%
    this.maxBattery = 100;
    this.altitudeCeiling = 80; // Maximum flight height
    this.groundFloor = 0.5;

    // Movement speeds
    this.horizontalSpeed = 24.0;
    this.verticalSpeed = 14.0;
    this.turnSpeed = 2.4;

    // EMP Dart Weapon
    this.empCooldown = 0;
    this.empMaxCooldown = 2.5;

    // Signal distance to player
    this.signalRange = 350; // In meters
    this.signalStrength = 100; // %
  }

  deploy(playerPosition, playerYaw) {
    this.isActive = true;
    this.battery = Math.max(30, this.battery);
    this.yaw = playerYaw;
    this.pitch = 0;
    this.roll = 0;
    this.velocity.set(0, 0, 0);

    // Spawn 2 meters in front and 1.5m above player
    const spawnPos = playerPosition.clone().add(
      new THREE.Vector3(Math.sin(playerYaw) * 2.0, 2.2, Math.cos(playerYaw) * 2.0)
    );
    this.mesh.position.copy(spawnPos);
    this.mesh.visible = true;

    if (this.audioEngine) {
      this.audioEngine.startDroneSound();
      this.audioEngine.playScannerBeep();
    }
  }

  recall() {
    this.isActive = false;
    this.mesh.visible = false;
    if (this.audioEngine) {
      this.audioEngine.stopDroneSound();
    }
  }

  update(delta, input, playerPosition, trafficManager, pedestrianManager, policeSystem) {
    if (!this.isActive) {
      // Passive recharge while docked
      if (this.battery < this.maxBattery) {
        this.battery = Math.min(this.maxBattery, this.battery + delta * 12);
      }
      return;
    }

    // Battery drain
    this.battery = Math.max(0, this.battery - delta * 1.5);
    if (this.battery <= 0) {
      // Emergency auto-recall
      this.recall();
      window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
        detail: { speaker: "SkyEye OS", text: "Battery depleted. Emergency return initiated." }
      }));
      return;
    }

    // Check distance / signal to player
    const distToPlayer = this.position.distanceTo(playerPosition);
    this.signalStrength = Math.max(0, Math.min(100, Math.round((1 - distToPlayer / this.signalRange) * 100)));

    if (distToPlayer > this.signalRange) {
      this.recall();
      window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
        detail: { speaker: "SkyEye OS", text: "Signal lost beyond operational perimeter." }
      }));
      return;
    }

    // Controls
    let moveForward = 0;
    let strafe = 0;
    let elevate = 0;
    let turn = 0;

    if (input.keys['KeyW'] || input.keys['ArrowUp']) moveForward += 1;
    if (input.keys['KeyS'] || input.keys['ArrowDown']) moveForward -= 1;
    if (input.keys['KeyA']) strafe -= 1;
    if (input.keys['KeyD']) strafe += 1;
    if (input.keys['Space']) elevate += 1;
    if (input.keys['ShiftLeft'] || input.keys['ShiftRight']) elevate -= 1;

    // Mouse horizontal look controls yaw when pointer locked
    if (input.mouse.isPointerLocked) {
      this.yaw -= input.mouse.deltaX * 0.0022;
    }

    // Desired horizontal direction
    const forwardVec = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const rightVec = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    _tempVec.set(0, 0, 0);
    if (moveForward !== 0) _tempVec.addScaledVector(forwardVec, moveForward);
    if (strafe !== 0) _tempVec.addScaledVector(rightVec, strafe);
    if (_tempVec.lengthSq() > 0) _tempVec.normalize();

    // Accelerate velocity
    const targetVelX = _tempVec.x * this.horizontalSpeed;
    const targetVelZ = _tempVec.z * this.horizontalSpeed;
    const targetVelY = elevate * this.verticalSpeed;

    this.velocity.x += (targetVelX - this.velocity.x) * Math.min(1.0, delta * 6.0);
    this.velocity.z += (targetVelZ - this.velocity.z) * Math.min(1.0, delta * 6.0);
    this.velocity.y += (targetVelY - this.velocity.y) * Math.min(1.0, delta * 6.0);

    // Apply movement
    this.position.x += this.velocity.x * delta;
    this.position.z += this.velocity.z * delta;
    this.position.y += this.velocity.y * delta;

    // Clamp altitude
    this.position.y = Math.max(this.groundFloor, Math.min(this.altitudeCeiling, this.position.y));

    // Dynamic bank/tilt tilt angles based on velocity
    const targetPitch = moveForward * 0.28;
    const targetRoll = -strafe * 0.28;
    this.pitch += (targetPitch - this.pitch) * Math.min(1.0, delta * 8.0);
    this.roll += (targetRoll - this.roll) * Math.min(1.0, delta * 8.0);

    // Update Mesh transform
    this.mesh.rotation.set(0, 0, 0);
    this.mesh.rotateY(this.yaw);
    this.mesh.rotateX(this.pitch);
    this.mesh.rotateZ(this.roll);

    // Spin Propeller Rotors
    if (this.mesh.rotors) {
      const rotorSpeed = 45.0 * delta;
      this.mesh.rotors.forEach((r, idx) => {
        r.rotation.y += (idx % 2 === 0 ? 1 : -1) * rotorSpeed;
      });
    }

    // Audio update
    if (this.audioEngine) {
      const speedNorm = Math.min(1.0, this.velocity.length() / this.horizontalSpeed);
      const isThrottling = moveForward !== 0 || elevate !== 0 || strafe !== 0;
      this.audioEngine.updateDroneSound(isThrottling ? 1.0 : 0.2, speedNorm);
    }

    // EMP Dart Weapon Cooldown
    if (this.empCooldown > 0) {
      this.empCooldown -= delta;
    }

    // Fire EMP Dart on Left Click or F
    if ((input.mouse.leftDown || input.keys['KeyF']) && this.empCooldown <= 0) {
      this.fireEMPDart(trafficManager, pedestrianManager, policeSystem);
      this.empCooldown = this.empMaxCooldown;
      input.mouse.leftDown = false;
    }
  }

  fireEMPDart(trafficManager, pedestrianManager, policeSystem) {
    if (this.audioEngine) {
      this.audioEngine.playEMPZap();
    }

    // Forward aim ray from camera/drone
    const aimDir = new THREE.Vector3(Math.sin(this.yaw), -0.25, Math.cos(this.yaw)).normalize();
    const hitPoint = this.position.clone().addScaledVector(aimDir, 45);

    // Spawn sparks & lightning particles along trajectory
    if (this.particleSystem) {
      this.particleSystem.spawnSparks(this.position.clone().add(aimDir.clone().multiplyScalar(3)));
      this.particleSystem.spawnSparks(hitPoint);
    }

    // Check hit on vehicles
    if (trafficManager) {
      const vehicles = trafficManager.getAllVehicles();
      for (let i = 0; i < vehicles.length; i++) {
        const v = vehicles[i];
        if (v.position.distanceTo(hitPoint) < 10) {
          v.takeDamage(40);
          v.speed *= 0.1; // EMP stall
          if (this.particleSystem) this.particleSystem.spawnSparks(v.position);
          window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
            detail: { speaker: "SkyEye EMP", text: "Target vehicle electronics disabled by EMP charge!" }
          }));
          return;
        }
      }
    }

    // Check hit on pedestrians
    if (pedestrianManager) {
      const hitPed = pedestrianManager.checkDamageAt(hitPoint, 6, 80);
      if (hitPed) {
        window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
          detail: { speaker: "SkyEye EMP", text: "Hostile incapacitated by stun taser." }
        }));
      }
    }
  }
}
