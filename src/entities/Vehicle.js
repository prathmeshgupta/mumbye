// MUMBYE: MAXIMUM CITY - Arcade Vehicle Physics Engine & Entity
import * as THREE from 'three';

export class Vehicle {
  constructor(mesh, config = {}, audioEngine, particleSystem, physics) {
    this.mesh = mesh;
    this.audioEngine = audioEngine;
    this.particleSystem = particleSystem;
    this.physics = physics;

    this.type = config.type || 'auto'; // 'auto', 'taxi', 'bus', 'police', 'supercar'
    this.isPlayerDriving = false;

    // Physical stats based on type
    this.maxSpeed = config.maxSpeed || (this.type === 'supercar' ? 38 : this.type === 'police' ? 32 : this.type === 'bus' ? 18 : this.type === 'taxi' ? 26 : 22);
    this.acceleration = config.acceleration || (this.type === 'supercar' ? 26 : this.type === 'police' ? 20 : this.type === 'bus' ? 10 : 16);
    this.brakingForce = config.brakingForce || 28;
    this.turnSpeed = config.turnSpeed || (this.type === 'auto' ? 2.8 : this.type === 'supercar' ? 2.5 : 2.0);
    this.friction = 0.985;
    this.driftFactor = config.driftFactor || 0.92;

    // Dynamic states
    this.speed = 0;
    this.steeringAngle = 0;
    this.driftAngle = 0;
    this.health = 100;
    this.isDestroyed = false;
    this.isBurning = false;
    this.burnTimer = 0;

    // Nitro Boost
    this.hasNitro = !!config.hasNitro;
    this.nitroFuel = 100;
    this.isNitroActive = false;

    // Amphibious (Monsoon DLC)
    this.isAmphibious = !!config.isAmphibious;

    // Sirens for police
    this.isSirenOn = false;
    this.sirenFlashTime = 0;

    // Geometry metadata
    this.width = mesh.userData.width || 1.8;
    this.length = mesh.userData.length || 4.0;
    this.height = mesh.userData.height || 1.8;

    // Pitch & roll tilt
    this.pitchTilt = 0;
    this.rollTilt = 0;

    // Audio & Horn
    this.hornCooldown = 0;
  }

  get position() {
    return this.mesh.position;
  }

  get rotation() {
    return this.mesh.rotation;
  }

  update(delta, input = null) {
    if (this.hornCooldown > 0) this.hornCooldown -= delta;

    if (this.isDestroyed) {
      // Burned wreckage
      if (Math.random() < 0.2) {
        this.particleSystem?.spawnEngineSmoke(this.position, false);
      }
      return;
    }

    // Health / Burning check
    if (this.health <= 20 && !this.isBurning) {
      this.isBurning = true;
      this.burnTimer = 3.0; // 3 seconds until explosion!
    }

    if (this.isBurning) {
      this.burnTimer -= delta;
      this.particleSystem?.spawnEngineSmoke(this.position, true);
      if (this.burnTimer <= 0) {
        this.explode();
        return;
      }
    } else if (this.health < 45) {
      if (Math.random() < 0.3) {
        this.particleSystem?.spawnEngineSmoke(this.position, false);
      }
    }

    // Police Beacon Flashing
    if (this.type === 'police' && this.isSirenOn && this.mesh.userData.beacons) {
      this.sirenFlashTime += delta * 12;
      const [redMesh, blueMesh, lightRed, lightBlue] = this.mesh.userData.beacons;
      const isRed = Math.floor(this.sirenFlashTime) % 2 === 0;

      redMesh.material.color.setHex(isRed ? 0xff0000 : 0x440000);
      blueMesh.material.color.setHex(!isRed ? 0x0055ff : 0x001144);
      lightRed.intensity = isRed ? 2.5 : 0;
      lightBlue.intensity = !isRed ? 2.5 : 0;
    }

    if (this.isPlayerDriving && input) {
      this.handlePlayerControl(delta, input);
    } else {
      // Decelerate if unattended
      this.speed *= Math.pow(this.friction, delta * 60);
      if (Math.abs(this.speed) < 0.05) this.speed = 0;
    }

    // Apply motion
    const forwardVec = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);
    const rightVec = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);

    const moveStep = forwardVec.clone().multiplyScalar(this.speed * delta);
    const targetPos = this.mesh.position.clone().add(moveStep);

    // Collision check against world buildings & props
    const colRadius = Math.max(this.width, this.length) * 0.45;
    const { hit, correction } = this.physics.checkSphereCollision(targetPos, colRadius);

    if (hit) {
      // Crash impact!
      if (Math.abs(this.speed) > 6) {
        const crashDamage = Math.floor(Math.abs(this.speed) * 1.5);
        this.takeDamage(crashDamage);
        this.audioEngine?.playCrash();
        this.particleSystem?.spawnSparks(targetPos);
      }
      this.speed = -this.speed * 0.35; // Bounce back
      this.mesh.position.add(correction);
    } else {
      this.mesh.position.copy(targetPos);
    }

    // Road Height / Stunt Ramp query
    const targetY = this.physics.getGroundHeight(this.mesh.position.x, this.mesh.position.z);
    if (this.mesh.position.y > targetY + 0.1) {
      // In the air (stunt jump!)
      this.mesh.position.y -= 14.0 * delta;
      if (this.mesh.position.y < targetY) this.mesh.position.y = targetY;
    } else {
      this.mesh.position.y = THREE.MathUtils.lerp(this.mesh.position.y, targetY, delta * 15);
    }

    // Tilt body smoothly with acceleration and turn
    const targetPitch = (this.speed / this.maxSpeed) * -0.06;
    const targetRoll = (this.steeringAngle * this.speed / this.maxSpeed) * 0.12;
    this.pitchTilt = THREE.MathUtils.lerp(this.pitchTilt, targetPitch, delta * 8);
    this.rollTilt = THREE.MathUtils.lerp(this.rollTilt, targetRoll, delta * 8);

    this.mesh.rotation.x = this.pitchTilt;
    this.mesh.rotation.z = this.rollTilt;

    // Update audio engine RPM
    if (this.isPlayerDriving && this.audioEngine) {
      const normalizedSpeed = Math.abs(this.speed) / this.maxSpeed;
      this.audioEngine.updateVehicleEngine(normalizedSpeed, input ? (input.moveForward !== 0) : false);
    }
  }

  handlePlayerControl(delta, input) {
    const fwdInput = input.moveForward; // 1 = gas, -1 = reverse
    const steerInput = -input.moveRight; // 1 = left, -1 = right
    const isHandbraking = input.isBraking;

    // Nitro Boost (Shift)
    if (this.hasNitro && input.isSprinting && this.nitroFuel > 0 && fwdInput > 0) {
      this.isNitroActive = true;
      this.nitroFuel = Math.max(0, this.nitroFuel - delta * 30);
      this.speed = Math.min(this.maxSpeed * 1.5, this.speed + this.acceleration * 2.2 * delta);
      // Spawn exhaust fire/smoke
      this.particleSystem?.spawnMuzzleFlash(this.position, new THREE.Vector3(0, 0, -1));
    } else {
      this.isNitroActive = false;
      if (this.nitroFuel < 100) this.nitroFuel += delta * 8; // Recharge nitro
    }

    // Accelerate / Reverse
    if (fwdInput > 0) {
      const topSpeed = this.isNitroActive ? this.maxSpeed * 1.5 : this.maxSpeed;
      this.speed = Math.min(topSpeed, this.speed + this.acceleration * delta);
    } else if (fwdInput < 0) {
      if (this.speed > 0.5) {
        // Braking
        this.speed = Math.max(0, this.speed - this.brakingForce * delta);
        if (Math.abs(this.speed) > 12) this.particleSystem?.spawnTireSmoke(this.position);
      } else {
        // Reversing
        this.speed = Math.max(-this.maxSpeed * 0.45, this.speed - this.acceleration * 0.7 * delta);
      }
    } else {
      // Natural deceleration / coasting
      this.speed *= Math.pow(this.friction, delta * 60);
      if (Math.abs(this.speed) < 0.1) this.speed = 0;
    }

    // Handbrake / Drift
    if (isHandbraking && Math.abs(this.speed) > 4) {
      this.speed *= Math.pow(0.92, delta * 60);
      this.particleSystem?.spawnTireSmoke(this.position);
      if (Math.random() < 0.3) this.audioEngine?.playTireSqueal();
    }

    // Steering (turns sharper at moderate speed, less twitchy at top speed)
    if (steerInput !== 0 && Math.abs(this.speed) > 0.1) {
      const directionModifier = this.speed >= 0 ? 1 : -1;
      const speedFactor = Math.min(1.0, Math.abs(this.speed) / 10);
      const turnAmount = steerInput * this.turnSpeed * directionModifier * speedFactor * delta;

      this.mesh.rotation.y += turnAmount;
      this.steeringAngle = THREE.MathUtils.lerp(this.steeringAngle, steerInput, delta * 12);
    } else {
      this.steeringAngle = THREE.MathUtils.lerp(this.steeringAngle, 0, delta * 10);
    }

    // Horn / Siren ('H')
    if (input.wasJustPressed('KeyH')) {
      this.honkHorn();
    }

    // Cycle Radio ('R')
    if (input.wasJustPressed('KeyR')) {
      const station = this.audioEngine?.cycleRadio();
      if (station) {
        window.dispatchEvent(new CustomEvent('mumbye_radio_changed', { detail: station }));
      }
    }
  }

  honkHorn() {
    if (this.hornCooldown > 0) return;
    this.hornCooldown = 0.5;

    if (this.type === 'police') {
      this.isSirenOn = !this.isSirenOn;
      this.audioEngine?.playPoliceSiren(this.isSirenOn);
    } else if (this.type === 'auto') {
      this.audioEngine?.playCarHorn('auto');
    } else if (this.type === 'bus') {
      this.audioEngine?.playCarHorn('bus');
    } else {
      this.audioEngine?.playCarHorn('car');
    }
  }

  takeDamage(amount) {
    if (this.isDestroyed) return;
    this.health = Math.max(0, this.health - amount);
    if (this.health === 0) {
      this.explode();
    }
  }

  explode() {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    this.health = 0;
    this.speed = 0;

    if (this.type === 'police' && this.isSirenOn) {
      this.audioEngine?.playPoliceSiren(false);
    }

    this.audioEngine?.playExplosion();
    this.particleSystem?.spawnExplosion(this.position);

    // Darken chassis to charred black
    this.mesh.traverse(child => {
      if (child.isMesh && child.material) {
        child.material = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.95 });
      }
    });

    window.dispatchEvent(new CustomEvent('mumbye_vehicle_exploded', { detail: { vehicle: this } }));
  }
}
