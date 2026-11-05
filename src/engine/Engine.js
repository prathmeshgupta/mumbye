// MUMBYE: MAXIMUM CITY - Master Game Engine
import * as THREE from 'three';
import { Input } from './Input.js';
import { CameraManager } from './CameraManager.js';
import { AudioEngine } from './AudioEngine.js';
import { Physics } from './Physics.js';
import { Weather } from './Weather.js';
import { ParticleSystem } from './ParticleSystem.js';
import { ModelFactory } from '../world/ModelFactory.js';
import { CityMap } from '../world/CityMap.js';
import { Player } from '../entities/Player.js';
import { TrafficManager } from '../entities/TrafficManager.js';
import { PedestrianManager } from '../entities/PedestrianManager.js';
import { PoliceSystem } from '../entities/PoliceSystem.js';
import { TransitSystem } from '../entities/TransitSystem.js';
import { MissionManager } from '../missions/MissionManager.js';
import { DLCManager } from '../dlc/DLCManager.js';
import { UIManager } from '../ui/UIManager.js';
import { Drone } from '../entities/Drone.js';
import { Helicopter } from '../entities/Helicopter.js';
import { Speedboat } from '../entities/Speedboat.js';
import { PropertyManager } from '../world/PropertyManager.js';
import { BroadcastSystem } from './BroadcastSystem.js';

// Bundled DLCs
import { BandraDriftDLC } from '../dlc/bundled/BandraDriftDLC.js';
import { BollywoodHeroDLC } from '../dlc/bundled/BollywoodHeroDLC.js';
import { MonsoonMadnessDLC } from '../dlc/bundled/MonsoonMadnessDLC.js';

export class Engine {
  constructor() {
    this.container = document.getElementById('game-canvas-container');
    this.scene = new THREE.Scene();

    // Renderer (High-Performance 60+ FPS configuration)
    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.container.appendChild(this.renderer.domElement);

    // Camera
    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Systems
    this.input = new Input();
    this.audioEngine = new AudioEngine();
    this.physics = new Physics();
    this.cameraManager = new CameraManager(this.camera, this.renderer.domElement, this.physics);
    this.weather = new Weather(this.scene, this.renderer);
    this.particleSystem = new ParticleSystem(this.scene);
    this.factory = new ModelFactory();

    // City & World
    this.cityMap = new CityMap(this.scene, this.physics);
    this.cityMap.build();

    // Player
    const playerMesh = this.factory.createHumanoid('player');
    playerMesh.position.set(-45, 0, 10); // Start near Marine Drive
    this.scene.add(playerMesh);
    this.player = new Player(playerMesh, this.audioEngine, this.particleSystem, this.physics, this.cameraManager);
    this.cameraManager.setTargetPlayer(this.player);

    // AI Entities
    this.trafficManager = new TrafficManager(this.scene, this.physics, this.audioEngine, this.particleSystem);
    this.trafficManager.spawnInitial(this.cityMap.roadNodes);

    this.pedestrianManager = new PedestrianManager(this.scene, this.physics, this.audioEngine, this.particleSystem);
    this.pedestrianManager.spawnInitial(this.cityMap.sidewalkNodes);

    this.policeSystem = new PoliceSystem(this.scene, this.physics, this.audioEngine, this.particleSystem);
    this.transitSystem = new TransitSystem(this.scene, this.physics, this.audioEngine);
    this.propertyManager = new PropertyManager(this);
    this.broadcastSystem = new BroadcastSystem(this, this.audioEngine);

    // SkyEye Drone (Deployable with 'U' or Phone App)
    const droneMesh = this.factory.createDrone();
    droneMesh.visible = false;
    this.scene.add(droneMesh);
    this.drone = new Drone(droneMesh, this.audioEngine, this.particleSystem, this.physics);
    this.cameraManager.setTargetDrone(this.drone);

    // Sky-Ranger Helicopter at AstraCorp Helipad (BKC Cyber City at x: 240, y: 68.4, z: -80)
    const heliMesh = this.factory.createHelicopter();
    heliMesh.position.set(240, 68.4, -80);
    this.scene.add(heliMesh);
    this.helicopter = new Helicopter(heliMesh, this.audioEngine, this.particleSystem, this.physics);
    this.helicopter.groundY = 68.4;
    this.cameraManager.setTargetHelicopter(this.helicopter);

    // Speedboats at Colaba Maritime Docks & Marine Drive Pier
    this.speedboats = [];

    // Speedboat 1: Civilian Ocean Racer at Colaba Pier 1 (x: 282, z: 115)
    const boatMesh1 = this.factory.createSpeedboat({ color: 0x0284c7 });
    boatMesh1.position.set(282, -0.4, 115);
    this.scene.add(boatMesh1);
    const boat1 = new Speedboat(boatMesh1, { name: 'Colaba Ocean Racer' }, this.audioEngine, this.particleSystem, this.physics);
    this.speedboats.push(boat1);

    // Speedboat 2: Metro Security Harbor Patrol at Colaba Pier 2 (x: 282, z: 155)
    const boatMesh2 = this.factory.createSpeedboat({ isPolice: true });
    boatMesh2.position.set(282, -0.4, 155);
    this.scene.add(boatMesh2);
    const boat2 = new Speedboat(boatMesh2, { name: 'Metro Harbor Patrol', isPolice: true }, this.audioEngine, this.particleSystem, this.physics);
    this.speedboats.push(boat2);

    // Speedboat 3: Marine Drive Sport Cruiser in Arabian Sea (x: -74, z: -10)
    const boatMesh3 = this.factory.createSpeedboat({ color: 0xd97706 });
    boatMesh3.position.set(-74, -0.4, -10);
    boatMesh3.rotation.y = -Math.PI / 2;
    this.scene.add(boatMesh3);
    const boat3 = new Speedboat(boatMesh3, { name: 'Marine Drive Speed-Demon' }, this.audioEngine, this.particleSystem, this.physics);
    this.speedboats.push(boat3);

    // Gameplay
    this.missionManager = new MissionManager(this.audioEngine);
    this.currentNeighborhoodId = null;

    // DLC Framework
    this.dlcManager = new DLCManager(this);
    this.initDLCs();

    // UI
    this.uiManager = new UIManager(this);

    // Loop state
    this.clock = new THREE.Clock();
    this.timeScale = 1.0; // Can be slowed down for Bhai Time (Action DLC)
    this.isRunning = false;

    this.initEventListeners();
  }

  initDLCs() {
    // Register bundled DLCs out of the box
    this.dlcManager.registerDLC(BandraDriftDLC);
    this.dlcManager.registerDLC(BollywoodHeroDLC);
    this.dlcManager.registerDLC(MonsoonMadnessDLC);

    // Auto-enable Bandra Drift DLC by default to give instant high speed thrill!
    this.dlcManager.enableDLC('dlc_bandra_drift');
  }

  initEventListeners() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Pointer lock on canvas click
    this.renderer.domElement.addEventListener('click', () => {
      this.audioEngine.ensureContext();
      if (!this.input.mouse.isPointerLocked) {
        this.input.requestPointerLock(this.renderer.domElement);
      }
    });

    // Player attack listener (punches, melee swings, gunshots)
    window.addEventListener('mumbye_player_attack', (e) => {
      const { type, damage, origin, direction, range, hasSuppressor } = e.detail;

      // Gunshots alert pedestrians and police (suppressed if hasSuppressor)
      if (type === 'gun') {
        if (!hasSuppressor) {
          this.pedestrianManager.alertGunshot(origin);
          if (Math.random() < 0.4) {
            this.policeSystem.addCrime(1);
          }
        }
      }

      // Check hit on pedestrians
      const hitPed = this.pedestrianManager.checkDamageAt(origin.clone().add(direction.clone().multiplyScalar(range * 0.4)), range, damage);
      if (hitPed) {
        this.policeSystem.addCrime(1);
      }

      // Check hit on police interceptor drones
      this.policeSystem.checkDroneDamage(origin, range, damage);

      // Check hit on speedboats
      this.speedboats.forEach(b => {
        if (b.isPlayerDriving || b.isDestroyed) return;
        const dist = b.position.distanceTo(origin);
        if (dist < range + 2) {
          const toBoat = b.position.clone().sub(origin).normalize();
          if (direction.dot(toBoat) > 0.6) {
            b.takeDamage(damage);
            this.particleSystem.spawnSparks(b.position);
          }
        }
      });

      // Check hit on vehicles
      const vehicles = this.trafficManager.getAllVehicles();
      vehicles.forEach(v => {
        if (v.isPlayerDriving || v.isDestroyed) return;
        const dist = v.position.distanceTo(origin);
        if (dist < range + 2) {
          const toVeh = v.position.clone().sub(origin).normalize();
          if (direction.dot(toVeh) > 0.65) {
            v.takeDamage(damage);
            this.particleSystem.spawnSparks(v.position);
          }
        }
      });
    });

    // Player vehicle carjacking / stealing crime
    window.addEventListener('mumbye_entered_vehicle', () => {
      if (Math.random() < 0.35 && this.policeSystem.wantedLevel === 0) {
        this.policeSystem.addCrime(1);
      }
    });

    // Toggle taxi driver side hustle ('T')
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyT') {
        this.missionManager.toggleTaxiMode(this.player);
      }
      if (e.code === 'KeyU') {
        this.toggleDrone();
      }
    });

    window.addEventListener('mumbye_toggle_drone', () => {
      this.toggleDrone();
    });

    // Player Wasted (death) / Hospital Respawn
    window.addEventListener('mumbye_player_wasted', () => {
      if (this.drone.isActive) {
        this.drone.recall();
      }
      // Clear all police heat & despawn active cruisers immediately
      this.policeSystem.setWantedLevel(0);
      this.policeSystem.clearPolice();

      setTimeout(() => {
        const fee = Math.min(this.player.cash, 100);
        this.player.cash -= fee;
        // Respawn at Safehouse or Metro General Hospital
        const respawnPos = this.propertyManager.getRespawnPosition();
        this.player.respawn(respawnPos.x, respawnPos.z);
        this.cameraManager.yaw = 0;
        this.cameraManager.pitch = 0.25;
        this.cameraManager.setMode('on_foot');
        const isSafehouse = this.propertyManager.respawnPropertyId !== null;
        window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
          detail: { 
            speaker: isSafehouse ? "Safehouse Recovery" : "Metro General Hospital", 
            text: isSafehouse ? "Revived & rested at your personal safehouse. Wanted heat cleared." : `Patient revived & discharged. Medical fee: ₹${fee}. Wanted heat cleared.` 
          }
        }));
      }, 3500);
    });
  }

  toggleDrone() {
    if (this.drone.isActive) {
      this.drone.recall();
      this.cameraManager.setMode(this.player.isDriving ? (this.player.currentVehicle?.type === 'helicopter' ? 'helicopter' : 'in_vehicle') : 'on_foot');
      window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
        detail: { speaker: "SkyEye Drone", text: "Drone recalled. Control returned to Kabir." }
      }));
    } else {
      if (this.player.isDriving) {
        window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
          detail: { speaker: "SkyEye Drone", text: "Cannot deploy drone while operating a vehicle." }
        }));
        return;
      }
      this.drone.deploy(this.player.position, this.cameraManager.yaw);
      this.cameraManager.setMode('drone');
      window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
        detail: { speaker: "SkyEye Drone", text: "Drone online! [WASD] Fly | [Space/Shift] Elevate | [Left Click] EMP Dart | [U] Recall" }
      }));
    }
  }

  start() {
    this.isRunning = true;
    this.clock.start();
    this.loop();
  }

  loop() {
    if (!this.isRunning) return;
    requestAnimationFrame(() => this.loop());

    // If Pause Menu is open, render scene without advancing game physics
    if (this.uiManager?.pauseMenu?.isOpen) {
      this.uiManager.update(0);
      this.renderer.render(this.scene, this.camera);
      return;
    }

    let rawDelta = this.clock.getDelta();
    // Clamp delta to avoid huge physics spikes on tab switch
    rawDelta = Math.min(rawDelta, 0.08);
    const delta = rawDelta * this.timeScale;

    // Update Input
    this.input.update();

    // Update Drone
    if (this.drone.isActive) {
      this.drone.update(delta, this.input, this.player.position, this.trafficManager, this.pedestrianManager, this.policeSystem);
    }

    // Update Helicopter
    this.helicopter.update(delta, this.input);

    // Update Speedboats
    this.speedboats.forEach(b => {
      if (b.isPlayerDriving) b.update(delta, this.input);
      else b.update(delta);
    });

    // Update Player & Vehicles (if drone is not active)
    const allVehicles = [...this.trafficManager.getAllVehicles(), this.helicopter, ...this.speedboats];
    const stalls = this.cityMap.props?.interactiveStalls || [];
    const elevatorPads = this.cityMap.elevatorPads || [];
    const blackMarketShops = this.cityMap.blackMarketShops || [];
    if (!this.drone.isActive) {
      this.player.update(delta, this.input, allVehicles, stalls, elevatorPads, blackMarketShops, this.propertyManager);

      // If player is driving road vehicle or non-helicopter/speedboat
      if (this.player.isDriving && this.player.currentVehicle && this.player.currentVehicle !== this.helicopter && this.player.currentVehicle.type !== 'speedboat') {
        this.player.currentVehicle.update(delta, this.input);
      }
    }

    // Dynamic Neighborhood Tracking & HUD Alerts
    const currentLoc = this.drone.isActive ? this.drone.position : this.player.position;
    const district = this.cityMap.getNeighborhoodAt(currentLoc.x, currentLoc.z);
    if (district && district.id !== this.currentNeighborhoodId) {
      this.currentNeighborhoodId = district.id;
      window.dispatchEvent(new CustomEvent('mumbye_neighborhood_entered', { detail: district }));
    }

    // Update Traffic, Pedestrians, Police, Real Estate & Transit
    const activeAircraft = [this.drone, this.helicopter, ...(this.policeSystem.policeDrones || [])];
    this.trafficManager.update(delta, this.player.position, this.cityMap.roadNodes);
    this.pedestrianManager.update(delta, this.player, this.cityMap.sidewalkNodes, activeAircraft);
    this.policeSystem.update(delta, this.player, this.drone, this.helicopter);
    this.transitSystem.update(delta, this.player);
    this.propertyManager.update(delta, this.player);
    this.broadcastSystem.update(delta);

    // Update Missions & DLC
    this.missionManager.update(delta, this.player.position, this.player);
    this.dlcManager.update(delta);

    // Update Camera
    this.cameraManager.update(delta, this.input);

    // Update Environment, Ocean Water & Particles
    this.weather.update(delta, this.player.position);
    this.cityMap.updateWater(delta);
    this.particleSystem.update(delta, this.player.position, this.weather.isRaining);

    // Update Master HUD & Minimap
    this.uiManager.update(delta);

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  }
}
