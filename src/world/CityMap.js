// MUMBYE: MAXIMUM CITY - City Map & District Generator
// Creates Marine Drive, South Bombay, Heritage Fort, Chawls, Sea Link, and the Arabian Sea.
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
    this.waterTime = 0;
  }

  build() {
    this.buildArabianSea();
    this.buildRoadNetwork();
    this.buildMarineDriveDistrict();
    this.buildHeritageAndGatewayDistrict();
    this.buildChawlsAndMarketDistrict();
    this.buildBandraWorliSeaLink();
    this.buildRailwayCorridor();
    this.buildPropsAndStalls();
  }

  // Arabian Sea (Ocean Water)
  buildArabianSea() {
    const waterGeo = new THREE.PlaneGeometry(800, 800, 48, 48);
    waterGeo.rotateX(-Math.PI / 2);

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0a4d68,
      roughness: 0.15,
      metalness: 0.8,
      transparent: true,
      opacity: 0.92
    });

    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.position.set(-250, -0.4, 0);
    this.scene.add(this.waterMesh);
  }

  // Update animated sea waves
  updateWater(delta) {
    if (!this.waterMesh) return;
    this.waterTime += delta * 2.5;
    const pos = this.waterMesh.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const v = pos.getZ(i);
      const wave = Math.sin(u * 0.05 + this.waterTime) * 0.35 + Math.cos(v * 0.04 + this.waterTime * 0.8) * 0.25;
      pos.setY(i, wave);
    }
    pos.needsUpdate = true;
  }

  // Road Network, Ground & Pavements
  buildRoadNetwork() {
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x23272e, roughness: 0.85 });
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xf5f5f5 });
    const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xf5b700 });
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x9fa4ab, roughness: 0.9 });
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x3d434d, roughness: 0.95 });

    // Main City Base Ground
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(120, -0.05, 0);
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Define Grid of Roads: [startX, startZ, endX, endZ, width, isMarineDrive]
    const roads = [
      // Marine Drive Boulevard (North-South arterial road along coast)
      { sx: -50, sz: -180, ex: -50, ez: 180, w: 16, name: "Marine Drive" },
      // Central Avenue (Fort to Dadar)
      { sx: 20, sz: -180, ex: 20, ez: 180, w: 14, name: "Dr. D.N. Road" },
      // East Avenue (Chawls to Docks)
      { sx: 90, sz: -180, ex: 90, ez: 180, w: 12, name: "Bhendi Bazaar Road" },
      // East Outer Highway
      { sx: 160, sz: -180, ex: 160, ez: 180, w: 12, name: "Eastern Freeway" },

      // Cross Streets (West to East)
      { sx: -50, sz: -120, ex: 160, ez: -120, w: 12, name: "Bandra Link Approach" },
      { sx: -50, sz: -60, ex: 160, ez: -60, w: 12, name: "Churchgate Cross" },
      { sx: -50, sz: 0, ex: 160, ez: 0, w: 14, name: "Veer Nariman Road" },
      { sx: -50, sz: 60, ex: 160, ez: 60, w: 12, name: "Colaba Causeway" },
      { sx: -50, sz: 120, ex: 160, ez: 120, w: 12, name: "Gateway Boulevard" }
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
      const centerLineGeo = new THREE.PlaneGeometry(isVertical ? 0.3 : len, isVertical ? len : 0.3);
      centerLineGeo.rotateX(-Math.PI / 2);
      const centerLine = new THREE.Mesh(centerLineGeo, yellowLineMat);
      centerLine.position.set(midX, 0.03, midZ);
      this.scene.add(centerLine);

      // Sidewalk Curbs
      const curbHeight = 0.22;
      const curbWidth = 2.4;
      if (isVertical) {
        // Left & Right Sidewalks
        const swL = new THREE.Mesh(new THREE.BoxGeometry(curbWidth, curbHeight, len), sidewalkMat);
        swL.position.set(midX - r.w / 2 - curbWidth / 2, curbHeight / 2, midZ);
        swL.receiveShadow = true;
        const swR = new THREE.Mesh(new THREE.BoxGeometry(curbWidth, curbHeight, len), sidewalkMat);
        swR.position.set(midX + r.w / 2 + curbWidth / 2, curbHeight / 2, midZ);
        swR.receiveShadow = true;
        this.scene.add(swL, swR);

        // Add to road navigation nodes
        for (let z = r.sz + 15; z <= r.ez - 15; z += 30) {
          this.roadNodes.push(new THREE.Vector3(midX - 3.5, 0, z)); // Southbound lane
          this.roadNodes.push(new THREE.Vector3(midX + 3.5, 0, z)); // Northbound lane
          this.sidewalkNodes.push(new THREE.Vector3(midX - r.w / 2 - 1.2, 0.22, z));
          this.sidewalkNodes.push(new THREE.Vector3(midX + r.w / 2 + 1.2, 0.22, z));
        }
      } else {
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
    }
  }

  // District 1: Marine Drive & Promenade (Queen's Necklace)
  buildMarineDriveDistrict() {
    // Sea wall along x = -59
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x7a808a, roughness: 0.9 });
    const seaWall = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 360), wallMat);
    seaWall.position.set(-60, 0.6, 0);
    this.scene.add(seaWall);
    this.physics.addStaticBox(new THREE.Box3().setFromObject(seaWall));

    // Tetrapods along the ocean edge
    for (let z = -175; z <= 175; z += 5) {
      this.props.createTetrapod(-62, 0.1, z, 1.1);
      this.props.createTetrapod(-64, -0.2, z + 2.5, 1.2);
    }

    // Art Deco Seafront Apartment Towers (Marine Drive Skyline)
    const buildingColors = [0xf5e6cc, 0xe8d0b5, 0xd4c2b0, 0xfceee3, 0xdde7ea];
    const windowMat = new THREE.MeshStandardMaterial({ color: 0x1a2e3b, roughness: 0.3 });

    for (let z = -160; z <= 160; z += 35) {
      if (Math.abs(z % 60) < 15) continue; // Skip intersection gaps

      const height = 28 + (Math.abs(z) % 20);
      const width = 24;
      const depth = 28;
      const bColor = buildingColors[Math.abs(Math.floor(z / 35)) % buildingColors.length];
      const mat = new THREE.MeshStandardMaterial({ color: bColor, roughness: 0.6 });

      const tower = new THREE.Mesh(new THREE.BoxGeometry(depth, height, width), mat);
      tower.position.set(-20, height / 2, z);
      tower.castShadow = true;
      tower.receiveShadow = true;
      this.scene.add(tower);
      this.physics.addStaticBox(new THREE.Box3().setFromObject(tower));

      // Windows
      const winGroup = new THREE.Mesh(new THREE.BoxGeometry(0.1, height * 0.8, width * 0.8), windowMat);
      winGroup.position.set(-34.1, height / 2, z);
      this.scene.add(winGroup);

      // Rooftop water tank
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 3.5, 12), new THREE.MeshStandardMaterial({ color: 0x222222 }));
      tank.position.set(-20, height + 1.75, z);
      this.scene.add(tank);
    }

    // Giant Bollywood Billboard atop Marine Drive Tower
    this.props.createBollywoodBillboard(-20, 36, 0, 16, 7, "BHAI: RETURN OF MAXIMUM CITY");
  }

  // District 2: Gateway of India & Heritage Fort
  buildHeritageAndGatewayDistrict() {
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xa8937b, roughness: 0.85 });
    const darkStoneMat = new THREE.MeshStandardMaterial({ color: 0x6e5e4e, roughness: 0.9 });

    // Gateway of India Monument Plaza (x: -50 to 0, z: 150 to 180)
    const gatewayGroup = new THREE.Group();
    gatewayGroup.position.set(-20, 0, 160);

    // Gateway Arch Towers
    const towerL = new THREE.Mesh(new THREE.BoxGeometry(6, 22, 6), stoneMat);
    towerL.position.set(-7, 11, 0);
    const towerR = new THREE.Mesh(new THREE.BoxGeometry(6, 22, 6), stoneMat);
    towerR.position.set(7, 11, 0);

    // Arch Central Top
    const archTop = new THREE.Mesh(new THREE.BoxGeometry(20, 7, 6), stoneMat);
    archTop.position.set(0, 20.5, 0);

    // Central Dome
    const dome = new THREE.Mesh(new THREE.SphereGeometry(4.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), darkStoneMat);
    dome.position.set(0, 24, 0);

    // 4 Corner Minarets / Domes
    const miniDomeGeo = new THREE.SphereGeometry(1.4, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const m1 = new THREE.Mesh(miniDomeGeo, darkStoneMat);
    m1.position.set(-8.5, 24, 2);
    const m2 = m1.clone();
    m2.position.set(8.5, 24, 2);
    const m3 = m1.clone();
    m3.position.set(-8.5, 24, -2);
    const m4 = m1.clone();
    m4.position.set(8.5, 24, -2);

    gatewayGroup.add(towerL, towerR, archTop, dome, m1, m2, m3, m4);
    gatewayGroup.castShadow = true;
    this.scene.add(gatewayGroup);

    // Colliders for Gateway pillars
    this.physics.addStaticBox(new THREE.Box3().setFromObject(towerL));
    this.physics.addStaticBox(new THREE.Box3().setFromObject(towerR));

    // Stunt ramp near Gateway plaza facing the sea!
    this.props.createStuntRamp(-45, 140, 6.0, 9.0, 3.8, 'x');
  }

  // District 3: Chawls, Market & Dadar Alleys
  buildChawlsAndMarketDistrict() {
    const chawlColors = [0xcc843d, 0x3d94cc, 0xc24641, 0xd4a017, 0x5a9e6f];
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x422a1d });

    // Multi-story colorful Chawls with balconies along x: 50 to 80 and 100 to 140
    for (let x of [55, 125]) {
      for (let z = -150; z <= 150; z += 32) {
        if (Math.abs(z % 60) < 14) continue;

        const chawlHeight = 16 + (Math.abs(z) % 10);
        const col = chawlColors[Math.abs(Math.floor((z + x) / 30)) % chawlColors.length];
        const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.85 });

        const building = new THREE.Mesh(new THREE.BoxGeometry(22, chawlHeight, 20), mat);
        building.position.set(x, chawlHeight / 2, z);
        building.castShadow = true;
        building.receiveShadow = true;
        this.scene.add(building);
        this.physics.addStaticBox(new THREE.Box3().setFromObject(building));

        // Balconies on front and back
        for (let floorY = 4; floorY < chawlHeight - 2; floorY += 3.5) {
          const balcony = new THREE.Mesh(new THREE.BoxGeometry(18, 0.3, 1.8), woodMat);
          balcony.position.set(x, floorY, z + 10.5);
          this.scene.add(balcony);

          // Railing
          const railing = new THREE.Mesh(new THREE.BoxGeometry(18, 0.8, 0.1), woodMat);
          railing.position.set(x, floorY + 0.4, z + 11.4);
          this.scene.add(railing);
        }
      }
    }
  }

  // District 4: Bandra-Worli Sea Link (Mega Suspension Cable Bridge)
  buildBandraWorliSeaLink() {
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.4 });
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1f232b, roughness: 0.8 });
    const cableMat = new THREE.MeshBasicMaterial({ color: 0xf5f5f5 });

    const bridgeStartX = -50;
    const bridgeStartZ = -180;
    const bridgeLength = 260; // Extends across the sea into northern bay
    const bridgeWidth = 14;
    const bridgeHeight = 4.5; // Elevated above ocean water

    // Approach Ramp (from z = -140 to z = -180)
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

    // Main Bridge Deck (z from -180 to -440)
    const deckGeo = new THREE.BoxGeometry(bridgeWidth, 1.2, bridgeLength);
    const deck = new THREE.Mesh(deckGeo, roadMat);
    deck.position.set(bridgeStartX, bridgeHeight, bridgeStartZ - bridgeLength / 2);
    deck.receiveShadow = true;
    this.scene.add(deck);

    // Register bridge deck collider with physics
    const deckBox = new THREE.Box3(
      new THREE.Vector3(bridgeStartX - bridgeWidth / 2, bridgeHeight - 0.5, bridgeStartZ - bridgeLength),
      new THREE.Vector3(bridgeStartX + bridgeWidth / 2, bridgeHeight + 0.6, bridgeStartZ)
    );
    this.physics.addRamp(deckBox, 'z', bridgeHeight); // flat elevated plane

    // Bridge Guardrails
    const railMat = new THREE.MeshStandardMaterial({ color: 0x334466, metalness: 0.7 });
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, bridgeLength), railMat);
    railL.position.set(bridgeStartX - bridgeWidth / 2 + 0.2, bridgeHeight + 0.8, bridgeStartZ - bridgeLength / 2);
    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, bridgeLength), railMat);
    railR.position.set(bridgeStartX + bridgeWidth / 2 - 0.2, bridgeHeight + 0.8, bridgeStartZ - bridgeLength / 2);
    this.scene.add(railL, railR);
    this.physics.addStaticBox(new THREE.Box3().setFromObject(railL));
    this.physics.addStaticBox(new THREE.Box3().setFromObject(railR));

    // Two Majestic Cable Pylons (Diamond / Tower structure)
    const pylonZPositions = [bridgeStartZ - 70, bridgeStartZ - 180];
    pylonZPositions.forEach(pz => {
      // Pylon concrete legs
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

      // White Stay Cables radiating from top to deck
      for (let offsetZ = -50; offsetZ <= 50; offsetZ += 12) {
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

    // Stunt Ramp on Sea Link for high speed jump over water!
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

    // Gravel Ballast Bed
    const ballast = new THREE.Mesh(new THREE.PlaneGeometry(8.0, trackLength), gravelMat);
    ballast.rotateX(-Math.PI / 2);
    ballast.position.set(trackX, 0.06, 0);
    this.scene.add(ballast);

    // Parallel Steel Rails
    const railGeo = new THREE.BoxGeometry(0.12, 0.16, trackLength);
    const rail1 = new THREE.Mesh(railGeo, railMat);
    rail1.position.set(trackX - 1.2, 0.16, 0);
    const rail2 = new THREE.Mesh(railGeo, railMat);
    rail2.position.set(trackX + 1.2, 0.16, 0);
    this.scene.add(rail1, rail2);

    // Wooden Sleepers / Ties along tracks
    const sleeperGeo = new THREE.BoxGeometry(3.2, 0.12, 0.35);
    for (let z = trackZStart; z <= trackZEnd; z += 1.8) {
      const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
      sleeper.position.set(trackX, 0.1, z);
      this.scene.add(sleeper);
    }

    // Overhead Catenary Electric Poles (OHE)
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, metalness: 0.7 });
    for (let z = trackZStart; z <= trackZEnd; z += 35) {
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

    // Station Name Signboard "MUMBAI CST / VT"
    const stSign = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.8, 0.1), new THREE.MeshBasicMaterial({ color: 0xffd200 }));
    stSign.position.set(trackX + 5.5, 2.4, 30);
    this.scene.add(stSign);
  }

  // Interactive Food Stalls & Urban Props
  buildPropsAndStalls() {
    // Vada Pav Stalls at bustling locations
    this.props.createVadaPavStall(-48, -10, 0); // Marine Drive south
    this.props.createVadaPavStall(12, 52, Math.PI / 2); // Churchgate / Fort
    this.props.createVadaPavStall(82, -45, -Math.PI / 2); // Bhendi Bazaar
    this.props.createVadaPavStall(32, 28, 0); // Near CST Station

    // Stunt Ramps in city
    this.props.createStuntRamp(20, -90, 6.0, 8.0, 3.2, 'z'); // Jump over Churchgate alley
    this.props.createStuntRamp(90, 30, 6.0, 8.0, 3.5, '-z'); // Bazaar high jump
  }
}
