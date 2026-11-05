// MUMBYE: MAXIMUM CITY - Traffic AI & Dynamic Mumbai Vehicles
import * as THREE from 'three';
import { ModelFactory } from '../world/ModelFactory.js';
import { Vehicle } from './Vehicle.js';

export class TrafficManager {
  constructor(scene, physics, audioEngine, particleSystem) {
    this.scene = scene;
    this.physics = physics;
    this.audioEngine = audioEngine;
    this.particleSystem = particleSystem;
    this.factory = new ModelFactory();

    this.vehicles = [];
    this.maxTraffic = 18;
  }

  spawnInitial(roadNodes) {
    if (!roadNodes || roadNodes.length === 0) return;

    const types = ['auto', 'auto', 'taxi', 'taxi', 'bus', 'supercar'];
    for (let i = 0; i < this.maxTraffic; i++) {
      const node = roadNodes[Math.floor(Math.random() * roadNodes.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      this.spawnTrafficVehicle(node.x, node.z, type);
    }
  }

  spawnTrafficVehicle(x, z, type = 'auto', heading = 0) {
    let mesh;
    if (type === 'auto') mesh = this.factory.createAutoRickshaw();
    else if (type === 'taxi') mesh = this.factory.createTaxi();
    else if (type === 'bus') mesh = this.factory.createBestBus();
    else if (type === 'police') mesh = this.factory.createPoliceCar();
    else mesh = this.factory.createSupercar();

    mesh.position.set(x, 0, z);
    mesh.rotation.y = heading;
    this.scene.add(mesh);

    const vehicle = new Vehicle(mesh, { type }, this.audioEngine, this.particleSystem, this.physics);
    vehicle.aiSpeed = 10 + Math.random() * 8;
    vehicle.targetNode = null;

    this.vehicles.push(vehicle);
    return vehicle;
  }

  update(delta, playerPos, roadNodes) {
    for (let i = this.vehicles.length - 1; i >= 0; i--) {
      const v = this.vehicles[i];

      // If player is driving this vehicle, it is controlled by player input in main loop
      if (v.isPlayerDriving) {
        continue;
      }

      if (v.isDestroyed) {
        v.update(delta);
        continue;
      }

      // Simple road waypoint navigation for ambient traffic
      if (!v.targetNode || v.position.distanceTo(v.targetNode) < 4.0) {
        if (roadNodes && roadNodes.length > 0) {
          // Find next node in front of vehicle
          const candidates = roadNodes.filter(n => n.distanceTo(v.position) > 15 && n.distanceTo(v.position) < 80);
          if (candidates.length > 0) {
            v.targetNode = candidates[Math.floor(Math.random() * candidates.length)].clone();
          } else {
            v.targetNode = roadNodes[Math.floor(Math.random() * roadNodes.length)].clone();
          }
        }
      }

      if (v.targetNode) {
        const toTarget = v.targetNode.clone().sub(v.position).setY(0);
        const desiredRot = Math.atan2(toTarget.x, toTarget.z);

        let diff = desiredRot - v.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;

        v.mesh.rotation.y += diff * Math.min(1.0, delta * 3.0);
        v.speed = THREE.MathUtils.lerp(v.speed, v.aiSpeed, delta * 2.0);

        // Check if player or another vehicle is right in front (traffic braking)
        if (playerPos && v.position.distanceTo(playerPos) < 6.5) {
          v.speed = 0; // Stop for player
          if (Math.random() < 0.02) v.honkHorn(); // Angry honk!
        }
      }

      v.update(delta);
    }
  }

  getAllVehicles() {
    return this.vehicles;
  }
}
