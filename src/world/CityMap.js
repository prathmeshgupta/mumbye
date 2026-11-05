// MUMBYE: MAXIMUM CITY - City Map & District Generator (Optimized 60 FPS & Enhanced Visuals)
import * as THREE from 'three';
import { CityProps } from './CityProps.js';

export class CityMap {
  constructor(scene, physics) {
    this.scene = scene;
    this.physics = physics;
    this.props = new CityProps(scene, physics);

    // Road network nodes for Traffic & Pedestrian AI
    this.roadNodes = [];
    this.sidewalkNodes = [];
    this.districts = [];

    // Water
    this.waterMesh = null;
    this.waterMaterial = null;
    this.waterTime = 0;

    // Procedural Facade Textures
    this.artDecoTexture = this.createFacadeTexture('artdeco');
    this.chawlTexture = this.createFacadeTexture('chawl');
    this.cyberTexture = this.createFacadeTexture('cyber');

    // Elevator / Teleport pads
    this.elevatorPads = [];
    this.blackMarketShops = [];
    this.speedboats = [];
  }

  // Generate Procedural Building Facade Textures with Windows and Lights
  createFacadeTexture(type = 'artdeco') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    if (type === 'artdeco') {
      // Warm ivory stucco base
      ctx.fillStyle = '#eeddc3';
      ctx.fillRect(0, 0, 256, 256);

      // Art Deco vertical bands
      ctx.fillStyle = '#cca885';
      ctx.fillRect(0, 0, 16, 256);
      ctx.fillRect(240, 0, 16, 256);

      // Window Grid with random interior lights
      const rows = 8;
      const cols = 5;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const wx = 32 + c * 40;
          const wy = 20 + r * 28;

          // Frame
          ctx.fillStyle = '#3a2e24';
          ctx.fillRect(wx - 2, wy - 2, 24, 18);

          // Glass: randomly day/night lit
          const isLit = (r + c * 3) % 3 === 0 || (r * c) % 5 === 0;
          ctx.fillStyle = isLit ? '#fef08a' : '#1e293b';
          ctx.fillRect(wx, wy, 20, 14);
        }
      }
    } else if (type === 'cyber') {
      // Futuristic BKC Cyber Facade (Deep midnight blue glass + glowing cyan & magenta strips)
      ctx.fillStyle = '#050b14';
      ctx.fillRect(0, 0, 256, 256);

      // Neon vertical data channels
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(0, 0, 8, 256);
      ctx.fillRect(248, 0, 8, 256);
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(124, 0, 6, 256);

      // High-tech office strip windows
      for (let r = 0; r < 9; r++) {
        const wy = 12 + r * 26;
        for (let c = 0; c < 6; c++) {
          const wx = 18 + c * 38;
          if (c === 2 || c === 3) continue; // Center conduit gap
          ctx.fillStyle = (r + c) % 3 === 0 ? '#38bdf8' : '#0f172a';
          ctx.fillRect(wx, wy, 28, 14);
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1;
          ctx.strokeRect(wx, wy, 28, 14);
        }
      }
    } else {
      // Chawl colorful terracotta/ochre base
      ctx.fillStyle = '#c25a3d';
      ctx.fillRect(0, 0, 256, 256);

      // Balcony railings and clotheslines
      for (let r = 0; r < 6; r++) {
        const wy = 15 + r * 40;

        // Wooden balcony plank
        ctx.fillStyle = '#451a03';
        ctx.fillRect(0, wy + 26, 256, 6);

        // Windows
        for (let c = 0; c < 4; c++) {
          const wx = 24 + c * 56;
          ctx.fillStyle = '#1e1b4b';
          ctx.fillRect(wx, wy, 32, 22);

          // Colorful curtains / clothes
          ctx.fillStyle = (r + c) % 2 === 0 ? '#38bdf8' : '#fbbf24';
          ctx.fillRect(wx + 2, wy + 2, 12, 18);
        }
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  build() {
    this.buildArabianSea();
    this.buildRoadNetwork();
    this.buildMarineDriveDistrict();
    this.buildHeritageAndGatewayDistrict();
    this.buildChawlsAndMarketDistrict();
    this.buildBKCCyberDistrict();
    this.buildColabaDocklands();
    this.buildBandraWorliSeaLink();
    this.buildRailwayCorridor();
    this.buildPropsAndStalls();

    this.blackMarketShops = this.props.blackMarketShops || [];
  }

  // Arabian Sea (Optimized High-Performance Water)
  buildArabianSea() {
    const waterGeo = new THREE.PlaneGeometry(800, 800, 16, 16);
    waterGeo.rotateX(-Math.PI / 2);

    this.waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x074b69,
      roughness: 0.12,
      metalness: 0.88,
      transparent: true,
      opacity: 0.94
    });

    this.waterMesh = new THREE.Mesh(waterGeo, this.waterMaterial);
    this.waterMesh.position.set(-250, -0.4, 0);
    this.scene.add(this.waterMesh);
  }

  // 60 FPS Zero-Cost Water (Shader/Color Pulse instead of Heavy CPU Vertex Modification)
  updateWater(delta) {
    if (!this.waterMesh) return;
    this.waterTime += delta * 0.8;
    // Gentle water shimmer
    const waveSin = Math.sin(this.waterTime);
    this.waterMesh.position.y = -0.4 + waveSin * 0.08;
  }

  // Road Network, Ground & Pavements
  buildRoadNetwork() {
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1f232b, roughness: 0.85 });
    const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xf5b700 });
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x949ba6, roughness: 0.9 });
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x333842, roughness: 0.95 });

    // Main City Base Ground (Expanded East to BKC & South to Docks)
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(850, 650), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(160, -0.05, 0);
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Roads layout
    const roads = [
      { sx: -50, sz: -180, ex: -50, ez: 180, w: 16, name: "Marine Drive" },
      { sx: 20, sz: -180, ex: 20, ez: 180, w: 14, name: "Dr. D.N. Road" },
      { sx: 90, sz: -180, ex: 90, ez: 180, w: 12, name: "Bhendi Bazaar Road" },
      { sx: 160, sz: -180, ex: 160, ez: 180, w: 14, name: "Eastern Freeway" },
      { sx: 240, sz: -180, ex: 240, ez: 60, w: 16, name: "BKC Tech Boulevard" },
      { sx: 240, sz: 60, ex: 240, ez: 180, w: 14, name: "Colaba Dock Basin" },

      { sx: -50, sz: -120, ex: 300, ez: -120, w: 12, name: "Bandra-BKC Connector" },
      { sx: -50, sz: -60, ex: 300, ez: -60, w: 12, name: "Churchgate-Skybridge Cross" },
      { sx: -50, sz: 0, ex: 300, ez: 0, w: 14, name: "Veer Nariman Central Ave" },
      { sx: -50, sz: 60, ex: 300, ez: 60, w: 12, name: "Colaba Causeway & Docks" },
      { sx: -50, sz: 120, ex: 300, ez: 120, w: 12, name: "Gateway Boulevard" },
      { sx: 160, sz: -180, ex: 300, ez: -180, w: 14, name: "BKC Expressway" }
    ];

    roads.forEach(r => {
      const isVertical = r.sx === r.ex;
      const len = isVertical ? Math.abs(r.ez - r.sz) : Math.abs(r.ex - r.sx);
      const midX = (r.sx + r.ex) / 2;
      const midZ = (r.sz + r.ez) / 2;

      // Road Asphalt Surface
      const roadGeo = new THREE.PlaneGeometry(isVertical ? r.w : len, isVertical ? len : r.w);
      roadGeo.rotateX(-Math.PI / 2);
      const roadMesh = new THREE.Mesh(roadGeo, roadMat);
      roadMesh.position.set(midX, 0.02, midZ);
      roadMesh.receiveShadow = true;
      this.scene.add(roadMesh);

      // Yellow Center Dividing Strip
      const centerLineGeo = new THREE.PlaneGeometry(isVertical ? 0.35 : len, isVertical ? len : 0.35);
      centerLineGeo.rotateX(-Math.PI / 2);
      const centerLine = new THREE.Mesh(centerLineGeo, yellowLineMat);
      centerLine.position.set(midX, 0.03, midZ);
      this.scene.add(centerLine);

      // Sidewalk Curbs
      const curbHeight = 0.22;
      const curbWidth = 2.4;
      if (isVertical) {
        const swL = new THREE.Mesh(new THREE.BoxGeometry(curbWidth, curbHeight, len), sidewalkMat);
        swL.position.set(midX - r.w / 2 - curbWidth / 2, curbHeight / 2, midZ);
        swL.receiveShadow = true;
        const swR = new THREE.Mesh(new THREE.BoxGeometry(curbWidth, curbHeight, len), sidewalkMat);
        swR.position.set(midX + r.w / 2 + curbWidth / 2, curbHeight / 2, midZ);
        swR.receiveShadow = true;
        this.scene.add(swL, swR);

        for (let z = r.sz + 15; z <= r.ez - 15; z += 30) {
          this.roadNodes.push(new THREE.Vector3(midX - 3.5, 0, z));
          this.roadNodes.push(new THREE.Vector3(midX + 3.5, 0, z));
          this.sidewalkNodes.push(new THREE.Vector3(midX - r.w / 2 - 1.2, 0.22, z));
          this.sidewalkNodes.push(new THREE.Vector3(midX + r.w / 2 + 1.2, 0.22, z));
        }
      } else {
        const swTop = new THREE.Mesh(new THREE.BoxGeometry(len, curbHeight, curbWidth), sidewalkMat);
        swTop.position.set(midX, curbHeight / 2, midZ - r.w / 2 - curbWidth / 2);
        swTop.receiveShadow = true;
        const swBottom = new THREE.Mesh(new THREE.BoxGeometry(len, curbHeight, curbWidth), sidewalkMat);
        swBottom.position.set(midX, curbHeight / 2, midZ + r.w / 2 + curbWidth / 2);
        swBottom.receiveShadow = true;
        this.scene.add(swTop, swBottom);

        for (let x = r.sx + 15; x <= r.ex - 15; x += 30) {
          this.roadNodes.push(new THREE.Vector3(x, 0, midZ - 3.0));
          this.roadNodes.push(new THREE.Vector3(x, 0, midZ + 3.0));
          this.sidewalkNodes.push(new THREE.Vector3(x, 0.22, midZ - r.w / 2 - 1.2));
          this.sidewalkNodes.push(new THREE.Vector3(x, 0.22, midZ + r.w / 2 + 1.2));
        }
      }
    });

    // Street Lamps along roads
    for (let z = -160; z <= 160; z += 40) {
      this.props.createStreetLamp(-50 + 9.5, z);
      this.props.createStreetLamp(20 + 8.5, z);
      this.props.createStreetLamp(90 + 7.5, z);
      this.props.createStreetLamp(160 + 8.5, z);
      this.props.createStreetLamp(240 + 9.5, z);
    }
  }

  // District 1: Marine Drive Promenade & Skyline
  buildMarineDriveDistrict() {
    // Sea wall along x = -60
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x717782, roughness: 0.9 });
    const seaWall = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 360), wallMat);
    seaWall.position.set(-60, 0.6, 0);
    this.scene.add(seaWall);
    this.physics.addStaticBox(new THREE.Box3().setFromObject(seaWall));

    // Tetrapods along the ocean edge
    for (let z = -175; z <= 175; z += 6) {
      this.props.createTetrapod(-62, 0.1, z, 1.1);
      this.props.createTetrapod(-64, -0.2, z + 3.0, 1.2);
    }

    // Iconic Palm Trees along the Marine Drive Promenade!
    for (let z = -165; z <= 165; z += 18) {
      this.props.createPalmTree(-58.5, z, 1.05);
    }

    // Art Deco Seafront Apartment Towers with Facade Textures
    const towerMat = new THREE.MeshStandardMaterial({
      map: this.artDecoTexture,
      roughness: 0.65
    });

    for (let z = -160; z <= 160; z += 35) {
      if (Math.abs(z % 60) < 15) continue; // Skip intersection gaps

      const height = 30 + (Math.abs(z) % 18);
      const width = 24;
      const depth = 28;

      const tower = new THREE.Mesh(new THREE.BoxGeometry(depth, height, width), towerMat);
      tower.position.set(-20, height / 2, z);
      tower.receiveShadow = true;
      this.scene.add(tower);
      this.physics.addStaticBox(new THREE.Box3().setFromObject(tower));

      // Rooftop water tank
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 3.5, 10), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
      tank.position.set(-20, height + 1.75, z);
      this.scene.add(tank);
    }

    // Bollywood Billboard atop Marine Drive Tower
    this.props.createBollywoodBillboard(-20, 36, 0, 16, 7, "BHAI: RETURN OF MAXIMUM CITY");

    // Marine Drive Seaside Boat Pier into the Arabian Sea
    this.props.createBoatPier(-62, -10, 18, 4.0, -Math.PI / 2);
  }

  // District 2: Gateway of India, Fort & Metro General Hospital
  buildHeritageAndGatewayDistrict() {
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x9c8874, roughness: 0.85 });
    const darkStoneMat = new THREE.MeshStandardMaterial({ color: 0x5a4d3f, roughness: 0.9 });

    // Gateway of India Monument Plaza (x: -20, z: 160)
    const gatewayGroup = new THREE.Group();
    gatewayGroup.position.set(-20, 0, 160);

    const towerL = new THREE.Mesh(new THREE.BoxGeometry(6, 22, 6), stoneMat);
    towerL.position.set(-7, 11, 0);
    const towerR = new THREE.Mesh(new THREE.BoxGeometry(6, 22, 6), stoneMat);
    towerR.position.set(7, 11, 0);

    const archTop = new THREE.Mesh(new THREE.BoxGeometry(20, 7, 6), stoneMat);
    archTop.position.set(0, 20.5, 0);

    const dome = new THREE.Mesh(new THREE.SphereGeometry(4.5, 14, 14, 0, Math.PI * 2, 0, Math.PI / 2), darkStoneMat);
    dome.position.set(0, 24, 0);

    const miniDomeGeo = new THREE.SphereGeometry(1.4, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    const m1 = new THREE.Mesh(miniDomeGeo, darkStoneMat);
    m1.position.set(-8.5, 24, 2);
    const m2 = m1.clone();
    m2.position.set(8.5, 24, 2);
    const m3 = m1.clone();
    m3.position.set(-8.5, 24, -2);
    const m4 = m1.clone();
    m4.position.set(8.5, 24, -2);

    gatewayGroup.add(towerL, towerR, archTop, dome, m1, m2, m3, m4);
    this.scene.add(gatewayGroup);

    this.physics.addStaticBox(new THREE.Box3().setFromObject(towerL));
    this.physics.addStaticBox(new THREE.Box3().setFromObject(towerR));

    // Stunt ramp near Gateway plaza
    this.props.createStuntRamp(-45, 140, 6.0, 9.0, 3.8, 'x');

    // Metro General Hospital (Player Respawn Location at x: 20, z: -30)
    this.props.createHospital(20, -30);
  }

  // District 3: Chawls, Market & Dadar Alleys
  buildChawlsAndMarketDistrict() {
    const chawlMat = new THREE.MeshStandardMaterial({
      map: this.chawlTexture,
      roughness: 0.8
    });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x422a1d });

    // Multi-story colorful Chawls with balconies
    for (let x of [55, 125]) {
      for (let z = -150; z <= 150; z += 32) {
        if (Math.abs(z % 60) < 14) continue;
        if (x === 55 && z >= -45 && z <= -15) continue; // Hospital clearance

        const chawlHeight = 16 + (Math.abs(z) % 8);

        const building = new THREE.Mesh(new THREE.BoxGeometry(22, chawlHeight, 20), chawlMat);
        building.position.set(x, chawlHeight / 2, z);
        building.receiveShadow = true;
        this.scene.add(building);
        this.physics.addStaticBox(new THREE.Box3().setFromObject(building));

        // Balconies
        for (let floorY = 4; floorY < chawlHeight - 2; floorY += 3.5) {
          const balcony = new THREE.Mesh(new THREE.BoxGeometry(18, 0.3, 1.8), woodMat);
          balcony.position.set(x, floorY, z + 10.5);
          this.scene.add(balcony);

          const railing = new THREE.Mesh(new THREE.BoxGeometry(18, 0.8, 0.1), woodMat);
          railing.position.set(x, floorY + 0.4, z + 11.4);
          this.scene.add(railing);
        }
      }
    }

    // Walk-In Chor Bazaar Chop Shop & Contraband Fence at x: 95, z: 25
    this.props.createWalkInShop(95, 25, "Chor Bazaar Chop Shop & Black Market");
  }

  // District 4: BKC Cyber City (Futuristic High-Tech Hub & Helipad)
  buildBKCCyberDistrict() {
    const cyberMat = new THREE.MeshStandardMaterial({
      map: this.cyberTexture,
      metalness: 0.85,
      roughness: 0.2
    });
    const glassBridgeMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.55,
      roughness: 0.1
    });

    // 1. AstraCorp Headquarters Skyscraper (with Rooftop Helipad at 68m)
    const astraHeight = 68;
    const astraTower = new THREE.Mesh(new THREE.BoxGeometry(34, astraHeight, 34), cyberMat);
    astraTower.position.set(240, astraHeight / 2, -80);
    astraTower.receiveShadow = true;
    this.scene.add(astraTower);
    this.physics.addStaticBox(new THREE.Box3().setFromObject(astraTower));

    // Rooftop Helipad
    this.props.createHelipad(240, astraHeight, -80, 9.5);

    // Elevator Warp Pads (Street Ground <-> Rooftop Helipad)
    const groundElevator = this.props.createElevatorWarpPad(240, 0.05, -61, 240, astraHeight + 0.8, -78, "Elevator to AstraCorp Helipad");
    const roofElevator = this.props.createElevatorWarpPad(240, astraHeight + 0.1, -65, 240, 0.5, -59, "Elevator to Street Level");
    this.elevatorPads.push(groundElevator, roofElevator);

    // Neon Corporate Signboard atop AstraCorp
    this.props.createCyberSign(240, 52, -62.8, "ASTRACORP GLOBAL", 0x06b6d4, 18, 5.0);

    // 2. Quantum Neural Skyscraper
    const quantumHeight = 56;
    const quantumTower = new THREE.Mesh(new THREE.BoxGeometry(30, quantumHeight, 30), cyberMat);
    quantumTower.position.set(240, quantumHeight / 2, -140);
    quantumTower.receiveShadow = true;
    this.scene.add(quantumTower);
    this.physics.addStaticBox(new THREE.Box3().setFromObject(quantumTower));

    this.props.createCyberSign(240, 42, -124.8, "QUANTUM NEURAL", 0xec4899, 16, 4.5);

    // 3. Elevated Glass Skybridge Connecting AstraCorp & Quantum Towers at 36m height
    const bridgeY = 36.0;
    const bridgeLength = 30.0;
    const bridgeGeo = new THREE.BoxGeometry(6.0, 4.0, bridgeLength);
    const bridgeMesh = new THREE.Mesh(bridgeGeo, glassBridgeMat);
    bridgeMesh.position.set(240, bridgeY, -110);
    this.scene.add(bridgeMesh);

    const bridgeBox = new THREE.Box3(
      new THREE.Vector3(240 - 3.0, bridgeY - 2.0, -110 - bridgeLength / 2),
      new THREE.Vector3(240 + 3.0, bridgeY + 2.0, -110 + bridgeLength / 2)
    );
    this.physics.addRamp(bridgeBox, 'y', bridgeY - 1.5);

    // 4. Vexen Robotics Tower
    const vexenHeight = 50;
    const vexenTower = new THREE.Mesh(new THREE.BoxGeometry(26, vexenHeight, 26), cyberMat);
    vexenTower.position.set(290, vexenHeight / 2, -100);
    vexenTower.receiveShadow = true;
    this.scene.add(vexenTower);
    this.physics.addStaticBox(new THREE.Box3().setFromObject(vexenTower));

    this.props.createCyberSign(290, 38, -86.8, "VEXEN AI GRID", 0x22c55e, 14, 4.0);

    // Cyber Stunt Launch Ramp
    this.props.createStuntRamp(240, -40, 7.0, 9.0, 4.0, '-z');
  }

  // District 5: Colaba Harbor & Docks (Maritime Industrial Hub)
  buildColabaDocklands() {
    // Stacks of Shipping Cargo Containers
    const colors = [0xdc2626, 0x2563eb, 0xf59e0b, 0x059669]; // Red, Blue, Yellow, Green

    for (let i = 0; i < 8; i++) {
      const col = colors[i % colors.length];
      const cx = 200 + (i % 3) * 12;
      const cz = 100 + Math.floor(i / 3) * 14;
      this.props.createShippingContainer(cx, 0, cz, col, (i % 2) * Math.PI / 2);
      if (i % 2 === 0) {
        // Stack 2nd container on top
        this.props.createShippingContainer(cx, 3.0, cz, colors[(i + 1) % colors.length], (i % 2) * Math.PI / 2);
      }
    }

    // Heavy Harbor Cargo Cranes
    this.props.createCargoCrane(285, 90);
    this.props.createCargoCrane(285, 145);

    // Harbor Wooden Piers for Speedboats
    this.props.createBoatPier(280, 105, 20, 4.2, 0);
    this.props.createBoatPier(280, 145, 20, 4.2, 0);

    // Dockworkers Chai & Vada Pav Tapri
    this.props.createVadaPavStall(236, 68, 0);

    // Stunt ramp leaping over dock crates
    this.props.createStuntRamp(215, 85, 6.5, 8.5, 3.6, 'z');
  }

  // Dynamic Neighborhood / District Geo-Query
  getNeighborhoodAt(x, z) {
    if (x > 180 && z <= 50) {
      return { id: 'bkc', name: 'BKC CYBER CITY', sub: 'High-Tech Financial Hub & Autonomous Grid', color: '#06b6d4' };
    }
    if (x > 180 && z > 50) {
      return { id: 'docks', name: 'COLABA HARBOR & DOCKS', sub: 'Industrial Freight Terminal & Speedboat Basin', color: '#f59e0b' };
    }
    if (x <= -20 && z <= -140) {
      return { id: 'sealink', name: 'BANDRA-WORLI SEA LINK', sub: 'Open Ocean Cable Suspension Bridge', color: '#38bdf8' };
    }
    if (x <= 0) {
      return { id: 'marine', name: 'MARINE DRIVE', sub: "Queen's Necklace Seaside Promenade", color: '#3b82f6' };
    }
    if (x <= 70 && z >= 80) {
      return { id: 'gateway', name: 'GATEWAY OF INDIA & FORT', sub: 'Historic Stone Monuments & Plaza', color: '#eab308' };
    }
    if (x > 70 && z >= 0) {
      return { id: 'bazaar', name: 'CHOR BAZAAR & CHAWLS', sub: 'Dense Alleys, Spice Markets & Chop-Shops', color: '#f97316' };
    }
    return { id: 'dadar', name: 'CENTRAL DADAR & CST', sub: 'Suburban Railway Lines & Chawls', color: '#ef4444' };
  }

  // District 4: Bandra-Worli Sea Link
  buildBandraWorliSeaLink() {
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.4 });
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1f232b, roughness: 0.8 });
    const cableMat = new THREE.MeshBasicMaterial({ color: 0xf5f5f5 });

    const bridgeStartX = -50;
    const bridgeStartZ = -180;
    const bridgeLength = 260;
    const bridgeWidth = 14;
    const bridgeHeight = 4.5;

    // Approach Ramp
    const rampLength = 40;
    const rampBox = new THREE.Box3(
      new THREE.Vector3(bridgeStartX - bridgeWidth / 2, 0, bridgeStartZ),
      new THREE.Vector3(bridgeStartX + bridgeWidth / 2, bridgeHeight, bridgeStartZ + rampLength)
    );
    this.physics.addRamp(rampBox, '-z', bridgeHeight);

    const rampGeo = new THREE.BoxGeometry(bridgeWidth, 0.8, rampLength);
    const rampMesh = new THREE.Mesh(rampGeo, concreteMat);
    rampMesh.position.set(bridgeStartX, bridgeHeight / 2, bridgeStartZ + rampLength / 2);
    rampMesh.rotation.x = -Math.atan2(bridgeHeight, rampLength);
    this.scene.add(rampMesh);

    // Main Bridge Deck
    const deckGeo = new THREE.BoxGeometry(bridgeWidth, 1.2, bridgeLength);
    const deck = new THREE.Mesh(deckGeo, roadMat);
    deck.position.set(bridgeStartX, bridgeHeight, bridgeStartZ - bridgeLength / 2);
    deck.receiveShadow = true;
    this.scene.add(deck);

    const deckBox = new THREE.Box3(
      new THREE.Vector3(bridgeStartX - bridgeWidth / 2, bridgeHeight - 0.5, bridgeStartZ - bridgeLength),
      new THREE.Vector3(bridgeStartX + bridgeWidth / 2, bridgeHeight + 0.6, bridgeStartZ)
    );
    this.physics.addRamp(deckBox, 'z', bridgeHeight);

    // Bridge Guardrails
    const railMat = new THREE.MeshStandardMaterial({ color: 0x334466, metalness: 0.7 });
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, bridgeLength), railMat);
    railL.position.set(bridgeStartX - bridgeWidth / 2 + 0.2, bridgeHeight + 0.8, bridgeStartZ - bridgeLength / 2);
    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, bridgeLength), railMat);
    railR.position.set(bridgeStartX + bridgeWidth / 2 - 0.2, bridgeHeight + 0.8, bridgeStartZ - bridgeLength / 2);
    this.scene.add(railL, railR);
    this.physics.addStaticBox(new THREE.Box3().setFromObject(railL));
    this.physics.addStaticBox(new THREE.Box3().setFromObject(railR));

    // Cable Pylons
    const pylonZPositions = [bridgeStartZ - 70, bridgeStartZ - 180];
    pylonZPositions.forEach(pz => {
      const pylonHeight = 42;
      const legL = new THREE.Mesh(new THREE.BoxGeometry(1.8, pylonHeight, 2.4), concreteMat);
      legL.position.set(bridgeStartX - bridgeWidth / 2 - 1.2, pylonHeight / 2 - 2, pz);
      legL.rotation.z = -0.06;
      const legR = new THREE.Mesh(new THREE.BoxGeometry(1.8, pylonHeight, 2.4), concreteMat);
      legR.position.set(bridgeStartX + bridgeWidth / 2 + 1.2, pylonHeight / 2 - 2, pz);
      legR.rotation.z = 0.06;

      const pylonTop = new THREE.Mesh(new THREE.BoxGeometry(4.0, 6.0, 3.0), concreteMat);
      pylonTop.position.set(bridgeStartX, pylonHeight - 2, pz);

      this.scene.add(legL, legR, pylonTop);

      for (let offsetZ = -50; offsetZ <= 50; offsetZ += 14) {
        if (Math.abs(offsetZ) < 8) continue;
        const cableGeo = new THREE.CylinderGeometry(0.04, 0.04, 38);
        const cable = new THREE.Mesh(cableGeo, cableMat);
        const anchorDeck = new THREE.Vector3(bridgeStartX - bridgeWidth / 2 + 0.5, bridgeHeight, pz + offsetZ);
        const anchorTop = new THREE.Vector3(bridgeStartX, pylonHeight - 3, pz);

        cable.position.copy(anchorTop).lerp(anchorDeck, 0.5);
        cable.lookAt(anchorDeck);
        cable.rotateX(Math.PI / 2);
        this.scene.add(cable);
      }
    });

    this.props.createStuntRamp(bridgeStartX, bridgeStartZ - 120, 8.0, 10.0, 4.2, '-z');
  }

  // Central Railway Corridor & Mumbai Local Tracks
  buildRailwayCorridor() {
    const trackX = 40;
    const trackZStart = -180;
    const trackZEnd = 180;
    const trackLength = trackZEnd - trackZStart;

    const gravelMat = new THREE.MeshStandardMaterial({ color: 0x3d352e, roughness: 0.95 });
    const railMat = new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.9, roughness: 0.2 });
    const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x5a483a, roughness: 0.9 });

    const ballast = new THREE.Mesh(new THREE.PlaneGeometry(8.0, trackLength), gravelMat);
    ballast.rotateX(-Math.PI / 2);
    ballast.position.set(trackX, 0.06, 0);
    this.scene.add(ballast);

    const railGeo = new THREE.BoxGeometry(0.12, 0.16, trackLength);
    const rail1 = new THREE.Mesh(railGeo, railMat);
    rail1.position.set(trackX - 1.2, 0.16, 0);
    const rail2 = new THREE.Mesh(railGeo, railMat);
    rail2.position.set(trackX + 1.2, 0.16, 0);
    this.scene.add(rail1, rail2);

    const sleeperGeo = new THREE.BoxGeometry(3.2, 0.12, 0.35);
    for (let z = trackZStart; z <= trackZEnd; z += 2.2) {
      const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
      sleeper.position.set(trackX, 0.1, z);
      this.scene.add(sleeper);
    }

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, metalness: 0.7 });
    for (let z = trackZStart; z <= trackZEnd; z += 40) {
      const mastL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 7.5), poleMat);
      mastL.position.set(trackX - 3.2, 3.75, z);
      const mastR = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 7.5), poleMat);
      mastR.position.set(trackX + 3.2, 3.75, z);
      const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.15, 0.15), poleMat);
      crossBeam.position.set(trackX, 7.2, z);
      this.scene.add(mastL, mastR, crossBeam);
    }

    // Railway Station Platform (CST / Dadar)
    const platMat = new THREE.MeshStandardMaterial({ color: 0x8a9099, roughness: 0.8 });
    const platform = new THREE.Mesh(new THREE.BoxGeometry(5.0, 1.1, 80), platMat);
    platform.position.set(trackX + 5.5, 0.55, 30);
    this.scene.add(platform);
    this.physics.addStaticBox(new THREE.Box3().setFromObject(platform));

    const stSign = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.8, 0.1), new THREE.MeshBasicMaterial({ color: 0xffd200 }));
    stSign.position.set(trackX + 5.5, 2.4, 30);
    this.scene.add(stSign);
  }

  // Interactive Food Stalls & Urban Props
  buildPropsAndStalls() {
    this.props.createVadaPavStall(-48, -10, 0);
    this.props.createVadaPavStall(12, 52, Math.PI / 2);
    this.props.createVadaPavStall(82, -45, -Math.PI / 2);
    this.props.createVadaPavStall(32, 28, 0);

    this.props.createStuntRamp(20, -90, 6.0, 8.0, 3.2, 'z');
    this.props.createStuntRamp(90, 30, 6.0, 8.0, 3.5, '-z');
  }
}
