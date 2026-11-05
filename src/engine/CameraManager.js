// MUMBYE: MAXIMUM CITY - Third Person & Vehicle Camera System
import * as THREE from 'three';

export class CameraManager {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Spherical angles
    this.yaw = 0; // horizontal angle in radians
    this.pitch = 0.25; // vertical angle in radians (clamped)
    this.distance = 5.5; // distance from target
    this.target = new THREE.Vector3();
    this.currentPosition = new THREE.Vector3();

    // Configuration
    this.minPitch = -0.3;
    this.maxPitch = 1.35;
    this.sensitivity = 0.0024;
    this.lerpSpeed = 12.0;

    // Modes: 'on_foot', 'in_vehicle', 'aiming', 'cinematic'
    this.mode = 'on_foot';
    this.targetVehicle = null;
    this.targetPlayer = null;

    // Cinematic / Stunt cam
    this.cinematicTime = 0;
    this.cinematicTarget = null;
    this.shakeIntensity = 0;

    this.baseFov = 65;
    this.currentFov = 65;
  }

  setTargetPlayer(player) {
    this.targetPlayer = player;
  }

  setTargetVehicle(vehicle) {
    this.targetVehicle = vehicle;
  }

  setMode(mode) {
    this.mode = mode;
  }

  triggerShake(intensity = 0.4) {
    this.shakeIntensity = Math.min(1.0, this.shakeIntensity + intensity);
  }

  update(delta, input) {
    // Process mouse look input
    if (input) {
      this.yaw -= input.mouse.dx * this.sensitivity;
      this.pitch -= input.mouse.dy * this.sensitivity;
      this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
      input.resetMouseDeltas();
    }

    if (this.shakeIntensity > 0) {
      this.shakeIntensity = Math.max(0, this.shakeIntensity - delta * 2.5);
    }

    if (this.mode === 'in_vehicle' && this.targetVehicle) {
      this.updateVehicleCamera(delta, input);
    } else if (this.mode === 'aiming' && this.targetPlayer) {
      this.updateAimingCamera(delta);
    } else if (this.mode === 'cinematic') {
      this.updateCinematicCamera(delta);
    } else {
      this.updateOnFootCamera(delta);
    }

    // Apply trauma shake if active
    if (this.shakeIntensity > 0) {
      const shakeX = (Math.random() - 0.5) * this.shakeIntensity * 0.35;
      const shakeY = (Math.random() - 0.5) * this.shakeIntensity * 0.35;
      const shakeZ = (Math.random() - 0.5) * this.shakeIntensity * 0.35;
      this.camera.position.add(new THREE.Vector3(shakeX, shakeY, shakeZ));
    }
  }

  updateOnFootCamera(delta) {
    if (!this.targetPlayer) return;

    const playerPos = this.targetPlayer.position;
    const eyeHeight = 1.6;
    this.target.set(playerPos.x, playerPos.y + eyeHeight, playerPos.z);

    this.distance = 4.8;
    this.currentFov = THREE.MathUtils.lerp(this.currentFov, this.baseFov, delta * 5);
    this.camera.fov = this.currentFov;
    this.camera.updateProjectionMatrix();

    // Calculate desired position from spherical coords
    const cosPitch = Math.cos(this.pitch);
    const offsetX = this.distance * cosPitch * Math.sin(this.yaw);
    const offsetY = this.distance * Math.sin(this.pitch);
    const offsetZ = this.distance * cosPitch * Math.cos(this.yaw);

    const desiredPos = new THREE.Vector3(
      this.target.x + offsetX,
      Math.max(0.5, this.target.y + offsetY),
      this.target.z + offsetZ
    );

    // Smooth camera lag
    const factor = Math.min(1.0, delta * this.lerpSpeed);
    this.currentPosition.lerp(desiredPos, factor);
    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.target);
  }

  updateAimingCamera(delta) {
    if (!this.targetPlayer) return;

    const playerPos = this.targetPlayer.position;
    const eyeHeight = 1.65;

    // Right-shoulder camera offset
    const cosYaw = Math.cos(this.yaw);
    const sinYaw = Math.sin(this.yaw);
    const shoulderRight = 0.55;

    this.target.set(
      playerPos.x + cosYaw * shoulderRight,
      playerPos.y + eyeHeight,
      playerPos.z - sinYaw * shoulderRight
    );

    this.distance = 2.4;
    this.currentFov = THREE.MathUtils.lerp(this.currentFov, 45, delta * 10);
    this.camera.fov = this.currentFov;
    this.camera.updateProjectionMatrix();

    const cosPitch = Math.cos(this.pitch);
    const offsetX = this.distance * cosPitch * Math.sin(this.yaw);
    const offsetY = this.distance * Math.sin(this.pitch);
    const offsetZ = this.distance * cosPitch * Math.cos(this.yaw);

    const desiredPos = new THREE.Vector3(
      this.target.x + offsetX,
      Math.max(0.5, this.target.y + offsetY),
      this.target.z + offsetZ
    );

    const factor = Math.min(1.0, delta * (this.lerpSpeed * 1.5));
    this.currentPosition.lerp(desiredPos, factor);
    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.target);
  }

  updateVehicleCamera(delta, input) {
    if (!this.targetVehicle) return;

    const vehPos = this.targetVehicle.position;
    const vehRotation = this.targetVehicle.rotation.y;
    const vehSpeed = Math.abs(this.targetVehicle.speed || 0);

    // Dynamic FOV with speed & nitro
    const targetFov = this.baseFov + Math.min(25, (vehSpeed / 30) * 20);
    this.currentFov = THREE.MathUtils.lerp(this.currentFov, targetFov, delta * 4);
    this.camera.fov = this.currentFov;
    this.camera.updateProjectionMatrix();

    // Auto-align camera behind vehicle if no active mouse movement
    if (Math.abs(input?.mouse?.dx || 0) < 0.1) {
      // Gently blend yaw toward vehicle rear
      const targetYaw = vehRotation + Math.PI;
      let diff = targetYaw - this.yaw;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.yaw += diff * Math.min(1.0, delta * 3.5);
    }

    const vehHeight = this.targetVehicle.height || 1.8;
    this.target.set(vehPos.x, vehPos.y + vehHeight * 0.7, vehPos.z);

    const vehicleDist = (this.targetVehicle.type === 'bus') ? 11.0 : (this.targetVehicle.type === 'auto') ? 6.0 : 6.8;
    const cosPitch = Math.cos(Math.max(0.1, this.pitch));
    const offsetX = vehicleDist * cosPitch * Math.sin(this.yaw);
    const offsetY = vehicleDist * Math.sin(Math.max(0.18, this.pitch)) + 1.2;
    const offsetZ = vehicleDist * cosPitch * Math.cos(this.yaw);

    const desiredPos = new THREE.Vector3(
      this.target.x + offsetX,
      Math.max(0.8, this.target.y + offsetY),
      this.target.z + offsetZ
    );

    const factor = Math.min(1.0, delta * 8.0);
    this.currentPosition.lerp(desiredPos, factor);
    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.target);
  }

  updateCinematicCamera(delta) {
    this.cinematicTime += delta;
    if (this.cinematicTarget) {
      const radius = 9.0;
      const angle = this.cinematicTime * 0.5;
      const eyeY = 4.0 + Math.sin(this.cinematicTime * 0.8) * 1.5;

      this.camera.position.set(
        this.cinematicTarget.x + Math.cos(angle) * radius,
        this.cinematicTarget.y + eyeY,
        this.cinematicTarget.z + Math.sin(angle) * radius
      );
      this.camera.lookAt(this.cinematicTarget);
    }
  }

  setCinematic(target, duration = 3.0) {
    this.mode = 'cinematic';
    this.cinematicTarget = target;
    this.cinematicTime = 0;
    setTimeout(() => {
      if (this.mode === 'cinematic') {
        this.mode = this.targetVehicle ? 'in_vehicle' : 'on_foot';
      }
    }, duration * 1000);
  }
}
