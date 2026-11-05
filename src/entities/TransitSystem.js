// MUMBYE: MAXIMUM CITY - Extensible Public Transit & Suburban Railway Architecture
import * as THREE from 'three';
import { ModelFactory } from '../world/ModelFactory.js';

export class TransitSystem {
  constructor(scene, physics, audioEngine) {
    this.scene = scene;
    this.physics = physics;
    this.audioEngine = audioEngine;
    this.factory = new ModelFactory();

    this.routes = new Map();
    this.stations = [];
    this.trains = [];

    // Player boarding state
    this.isPlayerRiding = false;
    this.playerCurrentTrain = null;
    this.boardedCoachIndex = 0;
    this.doorHangingMode = false;

    this.initDefaultSuburbanLine();
  }

  // Extensible Transit Route Registration Interface (for Core Game, Metro DLCs, Ferries)
  registerTransitRoute(routeDef) {
    const route = {
      id: routeDef.id,
      name: routeDef.name,
      type: routeDef.type || 'train', // 'train', 'metro', 'monorail', 'ferry'
      trackX: routeDef.trackX || 40.0,
      trackZStart: routeDef.trackZStart || -200.0,
      trackZEnd: routeDef.trackZEnd || 200.0,
      cruiseSpeed: routeDef.cruiseSpeed || 22.0,
      stations: routeDef.stations || []
    };

    this.routes.set(route.id, route);
    return route;
  }

  initDefaultSuburbanLine() {
    // 1. Register Western Railway Suburban Line
    const route = this.registerTransitRoute({
      id: 'suburban_wr',
      name: 'Western Railway Suburban Line (Fast Local)',
      type: 'train',
      trackX: 40.0,
      trackZStart: -200.0,
      trackZEnd: 200.0,
      cruiseSpeed: 20.0,
      stations: [
        {
          id: 'station_dadar',
          name: 'Dadar Junction',
          z: -100.0,
          platformX: 45.5,
          announcement: "Pudhil station Dadar... Next station Dadar. Doors will open on the left side."
        },
        {
          id: 'station_cst',
          name: 'CST Terminus (CSMT)',
          z: 60.0,
          platformX: 45.5,
          announcement: "Pudhil station Chhatrapati Shivaji Maharaj Terminus... Final stop. Please alight carefully."
        }
      ]
    });

    this.stations = route.stations;

    // 2. Build Suburban 4-Coach EMU Rake
    const trainGroup = new THREE.Group();
    trainGroup.name = 'SuburbanLocalTrain';
    const coaches = [];
    const coachLength = 18.2;

    for (let i = 0; i < 4; i++) {
      const isMotor = i === 1 || i === 2; // Coaches with rooftop pantographs
      const coach = this.factory.createTrainCoach(isMotor);
      coach.position.set(route.trackX, 0, -180.0 - i * coachLength);
      trainGroup.add(coach);
      coaches.push(coach);
    }

    this.scene.add(trainGroup);

    this.suburbanTrain = {
      group: trainGroup,
      coaches,
      route,
      currentZ: -180.0,
      speed: route.cruiseSpeed,
      state: 'cruising', // 'cruising', 'slowing', 'stopped', 'departing'
      stopTimer: 0,
      targetStation: null,
      hornTimer: 0,
      announcementTimer: 0
    };

    this.trains.push(this.suburbanTrain);
  }

  getNearestStation(pos) {
    let nearest = null;
    let minDist = 999;
    this.stations.forEach(st => {
      const d = Math.hypot(pos.x - st.platformX, pos.z - st.z);
      if (d < minDist) {
        minDist = d;
        nearest = st;
      }
    });
    return { station: nearest, distance: minDist };
  }

  boardTrain(player) {
    if (this.isPlayerRiding) return;
    this.isPlayerRiding = true;
    this.playerCurrentTrain = this.suburbanTrain;
    this.boardedCoachIndex = 1; // Middle coach

    this.audioEngine?.playScannerBeep();
    window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
      detail: {
        speaker: "Suburban Local Train",
        text: `Boarded Western Railway Fast Local! Press [E] to Disembark | [Space] Toggle Door-Hanging`
      }
    }));
  }

  alightTrain(player) {
    if (!this.isPlayerRiding || !this.playerCurrentTrain) return;
    const train = this.playerCurrentTrain;

    // Disembark player onto platform side
    player.position.set(train.route.trackX + 4.8, 1.1, train.currentZ);
    player.velocity.set(0, 0, 0);

    this.isPlayerRiding = false;
    this.playerCurrentTrain = null;
    this.doorHangingMode = false;

    window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
      detail: {
        speaker: "Suburban Local Train",
        text: `Alighted from train safely.`
      }
    }));
  }

  toggleDoorHanging(player) {
    this.doorHangingMode = !this.doorHangingMode;
    window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
      detail: {
        speaker: "Local Train",
        text: this.doorHangingMode ? "Hanging from doorway! Feel the Mumbai breeze!" : "Stepped inside passenger carriage."
      }
    }));
  }

  update(delta, player) {
    const train = this.suburbanTrain;
    if (!train) return;

    // Station stopping logic
    const nextStation = train.route.stations.find(st => {
      const diff = st.z - train.currentZ;
      return diff > -2 && diff < 80;
    });

    if (nextStation && train.state === 'cruising' && Math.abs(train.currentZ - nextStation.z) < 30) {
      train.state = 'slowing';
      train.targetStation = nextStation;

      // Play station announcement chime
      this.audioEngine?.playMissionSound(true);
      window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
        detail: {
          speaker: "Railway Public Address",
          text: `📢 ${nextStation.announcement}`
        }
      }));
    }

    if (train.state === 'slowing') {
      train.speed = THREE.MathUtils.lerp(train.speed, 0, delta * 1.5);
      if (Math.abs(train.currentZ - train.targetStation.z) < 1.5 || train.speed < 0.5) {
        train.speed = 0;
        train.state = 'stopped';
        train.stopTimer = 8.0; // Dwell for 8 seconds
        this.audioEngine?.playCarHorn('bus');
      }
    } else if (train.state === 'stopped') {
      train.stopTimer -= delta;
      if (train.stopTimer <= 0) {
        train.state = 'cruising';
        train.targetStation = null;
        this.audioEngine?.playCarHorn('bus');
      }
    } else {
      train.speed = THREE.MathUtils.lerp(train.speed, train.route.cruiseSpeed, delta * 1.0);
    }

    // Advance train forward
    train.currentZ += train.speed * delta;
    if (train.currentZ > train.route.trackZEnd) {
      train.currentZ = train.route.trackZStart;
    }

    const coachLength = 18.2;
    for (let i = 0; i < train.coaches.length; i++) {
      train.coaches[i].position.z = train.currentZ - i * coachLength;
    }

    // If player is riding train, lock player position to the coach
    if (this.isPlayerRiding && player) {
      const coachZ = train.currentZ - this.boardedCoachIndex * coachLength;
      const offsetX = this.doorHangingMode ? 1.65 : 0; // Lean out open doorway
      player.position.set(train.route.trackX + offsetX, 1.2, coachZ);
      player.velocity.set(0, 0, 0);

      // Keyboard toggle for door hanging or exiting
      if (this.game?.input?.wasJustPressed('Space')) {
        this.toggleDoorHanging(player);
      }
      if (this.game?.input?.wasJustPressed('KeyE')) {
        this.alightTrain(player);
      }
    }

    // Ambient locomotive horn
    if (player && !this.isPlayerRiding) {
      const dist = Math.abs(player.position.z - train.currentZ);
      if (dist < 35 && Math.abs(player.position.x - train.route.trackX) < 45) {
        train.hornTimer += delta;
        if (train.hornTimer > 8.0) {
          train.hornTimer = 0;
          this.audioEngine?.playCarHorn('bus');
        }
      }
    }
  }
}
