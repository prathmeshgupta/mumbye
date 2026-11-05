// MUMBYE: MAXIMUM CITY - Mission State & Objective Manager
import * as THREE from 'three';
import { STORY_MISSIONS } from './MissionsData.js';

export class MissionManager {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
    this.missions = [...STORY_MISSIONS];
    this.currentMissionIndex = 0;
    this.activeMission = null;
    this.currentCheckpointIndex = 0;
    this.missionTimer = 0;
    this.combatKills = 0;

    // Taxi Driver side hustle mode
    this.taxiModeActive = false;
    this.taxiFareTarget = null;
    this.taxiTimer = 0;
    this.taxiFaresCompleted = 0;

    this.initListeners();
  }

  initListeners() {
    window.addEventListener('mumbye_pedestrian_killed', () => {
      if (this.activeMission) {
        const cp = this.getCurrentCheckpoint();
        if (cp && cp.type === 'combat_target') {
          this.combatKills++;
          if (this.combatKills >= (cp.targetCount || 1)) {
            this.advanceCheckpoint();
          }
        }
      }
    });

    window.addEventListener('mumbye_entered_vehicle', (e) => {
      const v = e.detail?.vehicle;
      if (this.activeMission) {
        const cp = this.getCurrentCheckpoint();
        if (cp && cp.type === 'enter_taxi' && v && v.type === 'taxi') {
          this.advanceCheckpoint();
        }
      }
    });
  }

  registerCustomMission(missionDef) {
    this.missions.push(missionDef);
  }

  getActiveMission() {
    return this.activeMission;
  }

  getCurrentCheckpoint() {
    if (!this.activeMission) return null;
    return this.activeMission.checkpoints[this.currentCheckpointIndex];
  }

  startStoryMission(index = this.currentMissionIndex) {
    if (index >= this.missions.length) {
      index = 0; // Restart or loop
    }
    const mission = this.missions[index];
    this.activeMission = mission;
    this.currentMissionIndex = index;
    this.currentCheckpointIndex = 0;
    this.combatKills = 0;

    const cp = this.getCurrentCheckpoint();
    this.missionTimer = cp?.timer || 0;

    // Trigger dialogue cutscene
    if (mission.introDialog && mission.introDialog.length > 0) {
      window.dispatchEvent(new CustomEvent('mumbye_cutscene_dialog', {
        detail: {
          title: mission.title,
          dialogs: mission.introDialog
        }
      }));
    }

    this.audioEngine?.playMissionSound(true);

    window.dispatchEvent(new CustomEvent('mumbye_mission_started', {
      detail: { mission, checkpoint: cp }
    }));
  }

  update(delta, playerPos, player) {
    // Story mission timer & checkpoint tracking
    if (this.activeMission) {
      const cp = this.getCurrentCheckpoint();
      if (!cp) return;

      if (this.missionTimer > 0) {
        this.missionTimer -= delta;
        if (this.missionTimer <= 0) {
          this.failMission("Time expired! You were too slow.");
          return;
        }
      }

      // Checkpoint reach query
      if (cp.target && playerPos) {
        const dist = playerPos.distanceTo(cp.target);
        if (dist <= (cp.radius || 4.5)) {
          this.advanceCheckpoint(player);
        }
      }
    }

    // Taxi Driver side mode
    if (this.taxiModeActive && player.isDriving && player.currentVehicle?.type === 'taxi') {
      this.updateTaxiMode(delta, playerPos, player);
    }
  }

  advanceCheckpoint(player) {
    this.currentCheckpointIndex++;
    if (this.currentCheckpointIndex >= this.activeMission.checkpoints.length) {
      this.completeMission(player);
    } else {
      const nextCp = this.getCurrentCheckpoint();
      this.missionTimer = nextCp.timer || 0;
      this.combatKills = 0;
      this.audioEngine?.playCoinCash();

      window.dispatchEvent(new CustomEvent('mumbye_checkpoint_reached', {
        detail: { checkpoint: nextCp }
      }));
    }
  }

  completeMission(player) {
    const mission = this.activeMission;
    this.activeMission = null;

    if (player) {
      player.cash += mission.rewardCash || 1000;
      if (mission.rewardWeapon) {
        // Unlock weapon
        const wIndex = player.weapons.findIndex(w => w.id === mission.rewardWeapon);
        if (wIndex >= 0) {
          player.equipWeapon(wIndex);
        }
      }
    }

    this.audioEngine?.playMissionSound(true);
    this.currentMissionIndex++;

    window.dispatchEvent(new CustomEvent('mumbye_mission_completed', {
      detail: {
        title: mission.title,
        rewardCash: mission.rewardCash,
        message: mission.successMessage
      }
    }));
  }

  failMission(reason = "Mission Failed") {
    this.activeMission = null;
    this.audioEngine?.playMissionSound(false);

    window.dispatchEvent(new CustomEvent('mumbye_mission_failed', {
      detail: { reason }
    }));
  }

  // Taxi Driver Side Hustle
  toggleTaxiMode(player) {
    if (!player.isDriving || player.currentVehicle?.type !== 'taxi') {
      window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
        detail: { speaker: "Dispatch", text: "You must be inside a Kaali-Peeli Taxi to start Taxi Missions!" }
      }));
      return;
    }

    this.taxiModeActive = !this.taxiModeActive;
    if (this.taxiModeActive) {
      this.assignNewTaxiFare(player.position);
    } else {
      this.taxiFareTarget = null;
      window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
        detail: { speaker: "Dispatch", text: "Taxi Shift Ended. Total Fares: " + this.taxiFaresCompleted }
      }));
    }
  }

  assignNewTaxiFare(playerPos) {
    const destinations = [
      { name: "Marine Drive Queen's Necklace", pos: new THREE.Vector3(-50, 0, -40) },
      { name: "CST Heritage Railway Station", pos: new THREE.Vector3(20, 0, 30) },
      { name: "Gateway of India Plaza", pos: new THREE.Vector3(-20, 0, 140) },
      { name: "Bhendi Bazaar Spice Market", pos: new THREE.Vector3(90, 0, 0) },
      { name: "Bandra Sea Link Toll Plaza", pos: new THREE.Vector3(-50, 4.5, -160) }
    ];

    const fare = destinations[Math.floor(Math.random() * destinations.length)];
    this.taxiFareTarget = fare;
    this.taxiTimer = 65.0;

    window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
      detail: { speaker: "Passenger", text: `Bhaiya, fatfat ${fare.name} le chalo! Meter down karo!` }
    }));
  }

  updateTaxiMode(delta, playerPos, player) {
    if (!this.taxiFareTarget) return;

    this.taxiTimer -= delta;
    if (this.taxiTimer <= 0) {
      window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
        detail: { speaker: "Passenger", text: "Arey bohot late kar diya! Main utar raha hu!" }
      }));
      this.assignNewTaxiFare(playerPos);
      return;
    }

    if (playerPos.distanceTo(this.taxiFareTarget.pos) < 6.0) {
      const fareReward = 180 + Math.floor(Math.random() * 80);
      player.cash += fareReward;
      this.taxiFaresCompleted++;
      this.audioEngine?.playCoinCash();

      window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
        detail: { speaker: "Passenger", text: `Shukriya bhaiya! Ye lo ₹${fareReward} with tip!` }
      }));

      // Next fare!
      this.assignNewTaxiFare(playerPos);
    }
  }
}
