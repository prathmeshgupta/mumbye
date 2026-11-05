// MUMBYE: MAXIMUM CITY - Kabir Player Entity & Controller
import * as THREE from 'three';
import { ModelFactory } from '../world/ModelFactory.js';

export class Player {
  constructor(mesh, audioEngine, particleSystem, physics, cameraManager) {
    this.mesh = mesh;
    this.audioEngine = audioEngine;
    this.particleSystem = particleSystem;
    this.physics = physics;
    this.cameraManager = cameraManager;
    this.factory = new ModelFactory();

    // Stats
    this.health = 100;
    this.maxHealth = 100;
    this.armor = 100;
    this.cash = 250; // Starting ₹250
    this.stamina = 100;
    this.wantedLevel = 0;
    this.isDead = false;

    // Movement speeds
    this.walkSpeed = 4.2;
    this.runSpeed = 8.0;
    this.sprintSpeed = 12.5;
    this.jumpForce = 8.5;

    // Physics state
    this.velocity = new THREE.Vector3();
    this.isGrounded = true;
    this.radius = 0.45;
    this.height = 1.8;

    // Vehicle state
    this.currentVehicle = null;
    this.isDriving = false;

    // Weapons Inventory
    this.weapons = [
      { id: 'fist', name: 'Bare Fists', type: 'melee', damage: 25, rate: 0.4, ammo: Infinity },
      { id: 'lathi', name: 'Police Lathi', type: 'melee', damage: 35, rate: 0.45, ammo: Infinity },
      { id: 'bat', name: 'Cricket Bat', type: 'melee', damage: 55, rate: 0.5, ammo: Infinity },
      { id: 'katta', name: 'Desi Katta', type: 'gun', damage: 85, rate: 0.8, ammo: 18, maxAmmo: 30 },
      { id: 'pistol', name: 'Service Pistol', type: 'gun', damage: 45, rate: 0.28, ammo: 45, maxAmmo: 120 },
      { id: 'ak47', name: 'Underworld AK-47', type: 'gun', damage: 40, rate: 0.11, ammo: 90, maxAmmo: 300 }
    ];
    this.currentWeaponIndex = 0;
    this.weaponMesh = null;
    this.attackCooldown = 0;

    // Animation state
    this.animTime = 0;
    this.footstepTimer = 0;
    this.isAiming = false;

    this.init();
  }

  get position() {
    return this.mesh.position;
  }

  init() {
    this.equipWeapon(this.currentWeaponIndex);
  }

  getCurrentWeapon() {
    return this.weapons[this.currentWeaponIndex];
  }

  equipWeapon(index) {
    if (index < 0 || index >= this.weapons.length) return;
    this.currentWeaponIndex = index;
    const weapon = this.weapons[index];

    // Detach old weapon mesh
    if (this.weaponMesh) {
      this.mesh.joints.handSocket.remove(this.weaponMesh);
      this.weaponMesh = null;
    }

    // Attach new weapon mesh to right hand socket
    if (weapon.id !== 'fist') {
      this.weaponMesh = this.factory.createWeaponMesh(weapon.id);
      this.mesh.joints.handSocket.add(this.weaponMesh);
    }

    window.dispatchEvent(new CustomEvent('mumbye_weapon_changed', { detail: weapon }));
  }

  cycleWeapon(direction = 1) {
    let next = (this.currentWeaponIndex + direction + this.weapons.length) % this.weapons.length;
    this.equipWeapon(next);
  }

  update(delta, input, vehicles = [], interactiveStalls = [], elevatorPads = []) {
    if (this.isDead) return;

    if (this.attackCooldown > 0) this.attackCooldown -= delta;

    if (this.isDriving && this.currentVehicle) {
      this.updateDriving(delta, input);
      return;
    }

    this.handleWeaponInput(input);
    this.handleMovement(delta, input);
    this.handleVehicleInteraction(input, vehicles);
    this.handleStallInteraction(input, interactiveStalls);
    this.handleElevatorInteraction(input, elevatorPads);
    this.handleCombat(delta, input);
    this.animateJoints(delta, input);
  }

  handleElevatorInteraction(input, elevatorPads = []) {
    if (!input.wasJustPressed('KeyE')) return;
    for (let i = 0; i < elevatorPads.length; i++) {
      const pad = elevatorPads[i];
      if (this.position.distanceTo(pad.position) < 2.8) {
        const dest = pad.userData.target;
        this.position.copy(dest);
        this.velocity.set(0, 0, 0);
        this.audioEngine?.playScannerBeep();
        window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
          detail: { speaker: "AstraCorp High-Speed Lift", text: `Transported to ${pad.userData.label}.` }
        }));
        return;
      }
    }
  }

  handleMovement(delta, input) {
    const fwdInput = input.moveForward;
    const rightInput = input.moveRight;
    const isMoving = fwdInput !== 0 || rightInput !== 0;

    // Movement direction relative to camera yaw
    const camYaw = this.cameraManager.yaw;
    const forwardVec = new THREE.Vector3(-Math.sin(camYaw), 0, -Math.cos(camYaw));
    const rightVec = new THREE.Vector3(Math.cos(camYaw), 0, -Math.sin(camYaw));

    let moveDir = new THREE.Vector3();
    if (isMoving) {
      moveDir.addScaledVector(forwardVec, fwdInput);
      moveDir.addScaledVector(rightVec, rightInput);
      moveDir.normalize();

      // Face direction of movement (or face camera direction if aiming)
      if (this.isAiming) {
        this.mesh.rotation.y = camYaw + Math.PI;
      } else {
        const targetRotY = Math.atan2(moveDir.x, moveDir.z);
        let diff = targetRotY - this.mesh.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.mesh.rotation.y += diff * Math.min(1.0, delta * 14.0);
      }
    } else if (this.isAiming) {
      this.mesh.rotation.y = camYaw + Math.PI;
    }

    // Determine speed
    let speed = this.walkSpeed;
    if (input.isSprinting && this.stamina > 0 && isMoving && !this.isAiming) {
      speed = this.sprintSpeed;
      this.stamina = Math.max(0, this.stamina - delta * 15);
    } else if (isMoving) {
      speed = this.runSpeed;
      if (this.stamina < 100) this.stamina += delta * 10;
    } else {
      if (this.stamina < 100) this.stamina += delta * 18;
    }

    // Horizontal velocity
    this.velocity.x = moveDir.x * speed;
    this.velocity.z = moveDir.z * speed;

    // Jump
    if (input.isJumping && this.isGrounded) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      this.audioEngine?.playFootstep();
    }

    // Gravity
    this.velocity.y -= 22.0 * delta;

    // New prospective position
    const moveStep = this.velocity.clone().multiplyScalar(delta);
    const targetPos = this.mesh.position.clone().add(moveStep);

    // Collision check against world buildings & props
    const { hit, correction } = this.physics.checkSphereCollision(targetPos, this.radius);
    if (hit) {
      targetPos.add(correction);
    }

    // Height query from terrain & ramps
    const groundY = this.physics.getGroundHeight(targetPos.x, targetPos.z);
    if (targetPos.y <= groundY) {
      targetPos.y = groundY;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    this.mesh.position.copy(targetPos);

    // Footstep audio
    if (isMoving && this.isGrounded) {
      this.footstepTimer += delta * (speed / 4.0);
      if (this.footstepTimer >= 0.5) {
        this.audioEngine?.playFootstep();
        this.footstepTimer = 0;
      }
    }
  }

  handleWeaponInput(input) {
    if (input.wasJustPressed('Digit1')) this.equipWeapon(0); // Fist
    if (input.wasJustPressed('Digit2')) this.equipWeapon(1); // Lathi
    if (input.wasJustPressed('Digit3')) this.equipWeapon(2); // Bat
    if (input.wasJustPressed('Digit4')) this.equipWeapon(3); // Katta
    if (input.wasJustPressed('Digit5')) this.equipWeapon(4); // Pistol
    if (input.wasJustPressed('Digit6')) this.equipWeapon(5); // AK47

    if (input.wasJustPressed('WheelDown') || input.wasJustPressed('KeyQ')) this.cycleWeapon(1);
    if (input.wasJustPressed('WheelUp')) this.cycleWeapon(-1);

    this.isAiming = input.isAiming;
    this.cameraManager.setMode(this.isAiming ? 'aiming' : 'on_foot');
  }

  handleCombat(delta, input) {
    const isFire = input.isFiring;
    if (!isFire || this.attackCooldown > 0) return;

    const weapon = this.getCurrentWeapon();
    if (weapon.ammo <= 0) return;

    this.attackCooldown = weapon.rate;
    if (weapon.ammo !== Infinity) {
      weapon.ammo--;
      window.dispatchEvent(new CustomEvent('mumbye_ammo_changed', { detail: weapon }));
    }

    if (weapon.type === 'melee') {
      // Melee Swing
      if (weapon.id === 'bat' || weapon.id === 'lathi') {
        this.audioEngine?.playBatSwing();
      } else {
        this.audioEngine?.playPunch();
      }

      // Raycast punch forward in 2.2m range
      const punchOrigin = this.position.clone().add(new THREE.Vector3(0, 1.2, 0));
      const fwd = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);

      window.dispatchEvent(new CustomEvent('mumbye_player_attack', {
        detail: {
          type: 'melee',
          damage: weapon.damage,
          origin: punchOrigin,
          direction: fwd,
          range: 2.5
        }
      }));
    } else if (weapon.type === 'gun') {
      // Gunshot
      this.audioEngine?.playGunshot(weapon.id);
      this.cameraManager.triggerShake(weapon.id === 'katta' ? 0.35 : 0.18);

      // Gun muzzle flash from hand socket
      const muzzlePos = this.position.clone().add(new THREE.Vector3(0, 1.4, 0));
      const aimDir = new THREE.Vector3();
      this.cameraManager.camera.getWorldDirection(aimDir);

      this.particleSystem?.spawnMuzzleFlash(muzzlePos, aimDir);

      window.dispatchEvent(new CustomEvent('mumbye_player_attack', {
        detail: {
          type: 'gun',
          damage: weapon.damage,
          origin: muzzlePos,
          direction: aimDir,
          range: 80
        }
      }));
    }
  }

  handleVehicleInteraction(input, vehicles) {
    if (!input.wasJustPressed('KeyE')) return;

    // Find nearest vehicle within 3.5m
    let nearest = null;
    let minDist = 3.8;

    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];
      if (v.isDestroyed) continue;
      const d = this.position.distanceTo(v.position);
      if (d < minDist) {
        minDist = d;
        nearest = v;
      }
    }

    if (nearest) {
      this.enterVehicle(nearest);
    }
  }

  enterVehicle(vehicle) {
    this.isDriving = true;
    this.currentVehicle = vehicle;
    vehicle.isPlayerDriving = true;

    // Hide on-foot player mesh while inside car or helicopter
    this.mesh.visible = false;

    if (vehicle.type === 'helicopter') {
      vehicle.enter();
      this.cameraManager.setTargetHelicopter(vehicle);
      this.cameraManager.setMode('helicopter');
    } else {
      // Start ground vehicle engine sound
      this.audioEngine?.startVehicleEngine(vehicle.type);
      this.cameraManager.setTargetVehicle(vehicle);
      this.cameraManager.setMode('in_vehicle');
    }

    window.dispatchEvent(new CustomEvent('mumbye_entered_vehicle', { detail: { vehicle } }));
  }

  exitVehicle() {
    if (!this.isDriving || !this.currentVehicle) return;

    const v = this.currentVehicle;
    v.isPlayerDriving = false;

    if (v.type === 'helicopter') {
      v.exit();
      this.mesh.position.set(v.position.x + 2.5, v.position.y, v.position.z);
    } else {
      // Position player just outside vehicle driver door
      const exitOffset = new THREE.Vector3(v.width * 0.7 + 0.8, 0, 0)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), v.rotation.y);
      this.mesh.position.copy(v.position).add(exitOffset);
      this.audioEngine?.stopVehicleEngine();
    }

    this.mesh.visible = true;
    this.cameraManager.setMode('on_foot');

    this.isDriving = false;
    this.currentVehicle = null;

    window.dispatchEvent(new CustomEvent('mumbye_exited_vehicle'));
  }

  updateDriving(delta, input) {
    if (input.wasJustPressed('KeyE')) {
      this.exitVehicle();
      return;
    }

    // Synchronize player position with vehicle
    this.mesh.position.copy(this.currentVehicle.position);
  }

  handleStallInteraction(input, interactiveStalls) {
    if (!input.wasJustPressed('KeyE')) return;

    // Check if near any Vada Pav stall
    for (let i = 0; i < interactiveStalls.length; i++) {
      const s = interactiveStalls[i];
      const d = this.position.distanceTo(s.position);
      if (d < 2.8) {
        if (this.cash >= s.cost) {
          this.cash -= s.cost;
          this.health = Math.min(this.maxHealth, this.health + s.healAmount);
          this.audioEngine?.playCoinCash();
          window.dispatchEvent(new CustomEvent('mumbye_food_eaten', {
            detail: {
              name: s.name,
              message: "Garam garam Vada Pav re baba! Health full!"
            }
          }));
        } else {
          window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
            detail: { speaker: "Tapriwala", text: "Aye bhai! Paisa kidhar hai? ₹20 lagta hai!" }
          }));
        }
        break;
      }
    }
  }

  animateJoints(delta, input) {
    const isMoving = input.moveForward !== 0 || input.moveRight !== 0;
    const joints = this.mesh.joints;
    if (!joints) return;

    if (isMoving && this.isGrounded) {
      this.animTime += delta * (input.isSprinting ? 14 : 9);
      const swing = Math.sin(this.animTime);

      // Swing legs
      joints.legL.rotation.x = swing * 0.7;
      joints.legR.rotation.x = -swing * 0.7;

      // Swing arms opposite to legs
      if (!this.isAiming) {
        joints.armL.rotation.x = -swing * 0.6;
        joints.armR.rotation.x = swing * 0.6;
      }
    } else {
      // Idle breathing
      this.animTime += delta * 2;
      const breathe = Math.sin(this.animTime) * 0.03;
      joints.torso.position.y = 0.36 + breathe;

      joints.legL.rotation.x = THREE.MathUtils.lerp(joints.legL.rotation.x, 0, delta * 10);
      joints.legR.rotation.x = THREE.MathUtils.lerp(joints.legR.rotation.x, 0, delta * 10);

      if (!this.isAiming) {
        joints.armL.rotation.x = THREE.MathUtils.lerp(joints.armL.rotation.x, 0, delta * 10);
        joints.armR.rotation.x = THREE.MathUtils.lerp(joints.armR.rotation.x, 0, delta * 10);
      }
    }

    // Aiming pose
    if (this.isAiming) {
      joints.armR.rotation.x = Math.PI / 2;
      joints.armL.rotation.x = Math.PI / 2.5;
      joints.armL.rotation.z = -0.3;
    }
  }

  takeDamage(amount) {
    if (this.isDead) return;

    // Armor absorbs 70% of damage
    if (this.armor > 0) {
      const absorbed = Math.min(this.armor, amount * 0.7);
      this.armor -= absorbed;
      amount -= absorbed;
    }

    this.health = Math.max(0, this.health - amount);
    this.particleSystem?.spawnBlood(this.position);
    this.cameraManager.triggerShake(0.3);

    if (this.health <= 0) {
      this.die();
    }

    window.dispatchEvent(new CustomEvent('mumbye_player_damaged'));
  }

  die() {
    this.isDead = true;
    this.health = 0;
    this.audioEngine?.playMissionSound(false);

    if (this.isDriving) {
      this.exitVehicle();
    }

    // Fall backward
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y = 0.2;

    window.dispatchEvent(new CustomEvent('mumbye_player_wasted'));
  }

  respawn(x = 0, z = 0) {
    this.health = 100;
    this.armor = 50;
    this.isDead = false;
    this.mesh.rotation.x = 0;
    this.mesh.position.set(x, 1.0, z);
    this.wantedLevel = 0;
  }
}
