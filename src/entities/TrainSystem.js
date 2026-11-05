// MUMBYE: MAXIMUM CITY - Mumbai Suburban Local Train System
import * as THREE from 'three';
import { ModelFactory } from '../world/ModelFactory.js';

export class TrainSystem {
  constructor(scene, audioEngine) {
    this.scene = scene;
    this.audioEngine = audioEngine;
    this.factory = new ModelFactory();

    this.trainGroup = new THREE.Group();
    this.coaches = [];
    this.trackX = 40.0;
    this.speed = 18.0;
    this.currentZ = -190.0;
    this.hornTimer = 0;

    this.initTrain();
  }

  initTrain() {
    // 3-Coach EMU suburban rake
    const coachLength = 18.2;
    for (let i = 0; i < 3; i++) {
      const isMotor = i === 1; // Middle coach has pantograph
      const coach = this.factory.createTrainCoach(isMotor);
      coach.position.set(this.trackX, 0, this.currentZ - i * coachLength);
      this.trainGroup.add(coach);
      this.coaches.push(coach);
    }

    this.scene.add(this.trainGroup);
  }

  update(delta, playerPos) {
    this.currentZ += this.speed * delta;
    if (this.currentZ > 240) {
      this.currentZ = -240; // Loop back around
    }

    const coachLength = 18.2;
    for (let i = 0; i < this.coaches.length; i++) {
      this.coaches[i].position.z = this.currentZ - i * coachLength;
    }

    // Sound train horn when passing near player
    if (playerPos) {
      const dist = Math.abs(playerPos.z - this.currentZ);
      if (dist < 40 && Math.abs(playerPos.x - this.trackX) < 50) {
        this.hornTimer += delta;
        if (this.hornTimer > 6.0) {
          this.audioEngine?.playCarHorn('bus'); // Deep locomotive horn
          this.hornTimer = 0;
        }
      }
    }
  }
}
