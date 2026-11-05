// MUMBYE: MAXIMUM CITY - Mumbai Street Props, Landmarks, Trees & Interactive Stalls
import * as THREE from 'three';

export class CityProps {
  constructor(scene, physics) {
    this.scene = scene;
    this.physics = physics;
    this.interactiveStalls = []; // Vada Pav & Chai stalls
    this.stuntRamps = [];
    this.blackMarketShops = []; // Walk-in chop shops & contraband fences

    // Shared Materials Cache
    this.palmTrunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3e28, roughness: 0.9 });
    this.palmLeafMat = new THREE.MeshStandardMaterial({ color: 0x1f7a38, roughness: 0.6, side: THREE.DoubleSide });
  }

  // Iconic Tropical Palm Tree (for Marine Drive Promenade)
  createPalmTree(x, z, scale = 1.0) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Curved Trunk
    const trunkHeight = 7.5 * scale;
    const trunkGeo = new THREE.CylinderGeometry(0.18 * scale, 0.35 * scale, trunkHeight, 7);
    const trunk = new THREE.Mesh(trunkGeo, this.palmTrunkMat);
    trunk.position.y = trunkHeight / 2;
    trunk.rotation.z = (Math.random() - 0.5) * 0.15;
    group.add(trunk);

    // Palm Crown: 8 Drooping Fronds
    const crown = new THREE.Group();
    crown.position.set(0, trunkHeight, 0);

    const frondGeo = new THREE.BoxGeometry(0.5 * scale, 0.04, 3.2 * scale);
    for (let i = 0; i < 8; i++) {
      const frond = new THREE.Mesh(frondGeo, this.palmLeafMat);
      const angle = (i / 8) * Math.PI * 2;
      frond.rotation.y = angle;
      frond.rotation.x = 0.45;
      frond.position.set(Math.sin(angle) * 1.3 * scale, -0.4 * scale, Math.cos(angle) * 1.3 * scale);
      crown.add(frond);
    }
    group.add(crown);

    this.scene.add(group);

    const colBox = new THREE.Box3(
      new THREE.Vector3(x - 0.4, 0, z - 0.4),
      new THREE.Vector3(x + 0.4, trunkHeight, z + 0.4)
    );
    this.physics.addStaticBox(colBox, { type: 'tree' });

    return group;
  }

  // Metro General Hospital (Player Respawn Landmark)
  createHospital(x, z) {
    const group = new THREE.Group();
    group.name = 'MetroHospital';
    group.position.set(x, 0, z);

    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5 });
    const tealMat = new THREE.MeshStandardMaterial({ color: 0x0d9488, roughness: 0.4 });
    const redMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2 });

    // Main Hospital Block
    const mainBlock = new THREE.Mesh(new THREE.BoxGeometry(28, 22, 22), whiteMat);
    mainBlock.position.y = 11;
    mainBlock.receiveShadow = true;
    group.add(mainBlock);

    // Teal Accent Upper Band
    const band = new THREE.Mesh(new THREE.BoxGeometry(28.2, 3.5, 22.2), tealMat);
    band.position.y = 19;
    group.add(band);

    // Front Glass Entrance Canopy
    const entrance = new THREE.Mesh(new THREE.BoxGeometry(10, 4.5, 5), glassMat);
    entrance.position.set(0, 2.25, 12);
    group.add(entrance);

    // Illuminated Red Cross Symbol (+)
    const crossVert = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.0, 0.3), redMat);
    crossVert.position.set(0, 16.5, 11.2);
    const crossHoriz = new THREE.Mesh(new THREE.BoxGeometry(5.0, 1.2, 0.3), redMat);
    crossHoriz.position.set(0, 16.5, 11.2);
    group.add(crossVert, crossHoriz);

    // Signboard
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(16, 1.8, 0.2), new THREE.MeshBasicMaterial({ color: 0x0f172a }));
    signBoard.position.set(0, 12.8, 11.2);
    group.add(signBoard);

    // Red Cross Emergency Beacon Light
    const beacon = new THREE.PointLight(0xef4444, 2.0, 18);
    beacon.position.set(0, 17, 12.5);
    group.add(beacon);

    this.scene.add(group);

    const box = new THREE.Box3().setFromObject(mainBlock);
    this.physics.addStaticBox(box, { type: 'hospital' });

    return group;
  }

  // Vada Pav & Cutting Chai Tapri (Interactive Food Stall)
  createVadaPavStall(x, z, rotationY = 0) {
    const group = new THREE.Group();
    group.name = 'VadaPavStall';
    group.position.set(x, 0, z);
    group.rotation.y = rotationY;

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.8 });
    const blueMat = new THREE.MeshStandardMaterial({ color: 0x0066aa, roughness: 0.4 });
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xf5b700, roughness: 0.4 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.85, roughness: 0.2 });

    // Table / Cart
    const table = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 1.2), woodMat);
    table.position.y = 0.45;
    table.castShadow = true;
    group.add(table);

    // Striped Canvas Awning (Tarpaulin)
    const awning = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 1.6), yellowMat);
    awning.position.set(0, 2.3, 0);
    group.add(awning);

    // Awning Support Poles
    const poleGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.8);
    const p1 = new THREE.Mesh(poleGeo, woodMat);
    p1.position.set(1.0, 1.4, 0.6);
    const p2 = p1.clone();
    p2.position.set(-1.0, 1.4, 0.6);
    const p3 = p1.clone();
    p3.position.set(1.0, 1.4, -0.6);
    const p4 = p1.clone();
    p4.position.set(-1.0, 1.4, -0.6);
    group.add(p1, p2, p3, p4);

    // Big Boiling Brass/Steel Chai Kettle
    const kettle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.35, 12), metalMat);
    kettle.position.set(-0.6, 1.05, 0.1);
    group.add(kettle);

    // Platter with Golden Vada Pavs!
    const tray = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.04, 0.45), metalMat);
    tray.position.set(0.3, 0.92, 0.1);
    group.add(tray);

    const vadaMat = new THREE.MeshStandardMaterial({ color: 0xd99b26, roughness: 0.9 });
    for (let i = 0; i < 4; i++) {
      const vada = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), vadaMat);
      vada.position.set(0.15 + (i % 2) * 0.15, 0.98, (Math.floor(i / 2) - 0.5) * 0.15 + 0.1);
      group.add(vada);
    }

    // Signboard: "APNA VADA PAV & CUTTING CHAI"
    const sign = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.32, 0.05), new THREE.MeshStandardMaterial({ color: 0xaa1111 }));
    sign.position.set(0, 2.1, 0.78);
    group.add(sign);

    // Warm Lantern Light
    const lantern = new THREE.PointLight(0xffb044, 1.2, 7);
    lantern.position.set(0, 2.0, 0);
    group.add(lantern);

    this.scene.add(group);

    // Physics collision box
    const box = new THREE.Box3().setFromObject(table);
    this.physics.addStaticBox(box, { type: 'stall' });

    // Interactive Trigger
    this.interactiveStalls.push({
      position: new THREE.Vector3(x, 0, z),
      name: "Apna Vada Pav",
      cost: 20,
      healAmount: 100
    });

    return group;
  }

  // Marine Drive Tetrapod (Sea Wall Barrier)
  createTetrapod(x, y, z, scale = 1.0) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x828891, roughness: 0.9 });
    const legGeo = new THREE.CylinderGeometry(0.25 * scale, 0.45 * scale, 1.6 * scale, 6);

    // 4 Symmetrical Tetrahedral Legs
    const angles = [
      [0, 0, 0],
      [1.91, 0, 0],
      [-0.95, 1.65, 0],
      [-0.95, -1.65, 0]
    ];

    angles.forEach(([rx, ry, rz]) => {
      const leg = new THREE.Mesh(legGeo, concreteMat);
      leg.rotation.set(rx, ry, rz);
      leg.position.set(Math.sin(ry) * 0.4 * scale, Math.cos(rx) * 0.4 * scale, Math.sin(rz) * 0.4 * scale);
      leg.castShadow = true;
      group.add(leg);
    });

    this.scene.add(group);
    return group;
  }

  // Stunt Jump Ramp
  createStuntRamp(x, z, width = 6.0, length = 8.0, height = 3.2, direction = 'z') {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const rampMat = new THREE.MeshStandardMaterial({ color: 0xf5b700, roughness: 0.5 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });

    // Wedge Shape Geometry
    const shape = new THREE.Shape();
    shape.moveTo(-length / 2, 0);
    shape.lineTo(length / 2, height);
    shape.lineTo(length / 2, 0);
    shape.closePath();

    const extrudeSettings = { depth: width, bevelEnabled: false };
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.rotateY(direction === 'x' ? 0 : Math.PI / 2);
    geo.center();

    const mesh = new THREE.Mesh(geo, rampMat);
    mesh.position.y = height / 2;
    mesh.castShadow = true;
    group.add(mesh);

    // Warning Chevron Decals
    const chevron = new THREE.Mesh(new THREE.BoxGeometry(width * 0.9, 0.4, 0.1), blackMat);
    chevron.position.set(0, 0.2, length / 2);
    group.add(chevron);

    this.scene.add(group);

    // Register ramp with physics for vehicle launch!
    const rampBox = new THREE.Box3(
      new THREE.Vector3(x - width / 2, 0, z - length / 2),
      new THREE.Vector3(x + width / 2, height, z + length / 2)
    );
    this.physics.addRamp(rampBox, direction, height);
    this.stuntRamps.push({ position: new THREE.Vector3(x, 0, z), height });

    return group;
  }

  // Street Lamppost (Automatic evening lighting)
  createStreetLamp(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const ironMat = new THREE.MeshStandardMaterial({ color: 0x242b35, metalness: 0.8, roughness: 0.3 });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffe899 });

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 5.5, 8), ironMat);
    pole.position.y = 2.75;
    group.add(pole);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.1), ironMat);
    arm.position.set(0.5, 5.4, 0);
    group.add(arm);

    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.3, 8), lightMat);
    lantern.position.set(1.0, 5.2, 0);
    group.add(lantern);

    // Street Light Source
    const light = new THREE.PointLight(0xffe899, 1.4, 18);
    light.position.set(1.0, 5.0, 0);
    group.add(light);

    this.scene.add(group);

    const colBox = new THREE.Box3(
      new THREE.Vector3(x - 0.2, 0, z - 0.2),
      new THREE.Vector3(x + 0.2, 5.5, z + 0.2)
    );
    this.physics.addStaticBox(colBox, { type: 'pole' });

    return group;
  }

  // Bollywood Movie Billboard
  createBollywoodBillboard(x, y, z, width = 12.0, height = 6.0, title = "MUMBAI MERI JAAN") {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.7 });
    const posterMat = new THREE.MeshBasicMaterial({ color: 0xff2255 }); // Vibrant Bollywood Red/Pink

    // Frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(width + 0.4, height + 0.4, 0.3), frameMat);
    group.add(frame);

    // Poster Board
    const poster = new THREE.Mesh(new THREE.PlaneGeometry(width, height), posterMat);
    poster.position.z = 0.16;
    group.add(poster);

    // Spotlights shining on billboard
    const spotL = new THREE.PointLight(0xffffff, 1.5, 12);
    spotL.position.set(-width * 0.35, height * 0.4, 2.0);
    const spotR = new THREE.PointLight(0xffffff, 1.5, 12);
    spotR.position.set(width * 0.35, height * 0.4, 2.0);
    group.add(spotL, spotR);

    // Steel support legs if on ground
    if (y < 8) {
      const legGeo = new THREE.CylinderGeometry(0.18, 0.22, y);
      const l1 = new THREE.Mesh(legGeo, frameMat);
      l1.position.set(-width * 0.35, -y / 2, 0);
      const l2 = l1.clone();
      l2.position.set(width * 0.35, -y / 2, 0);
      group.add(l1, l2);
    }

    this.scene.add(group);
    return group;
  }

  // --- FUTURISTIC BKC & DOCKLANDS PROPS ---

  // Rooftop Helipad with Lighting & Markings
  createHelipad(x, y, z, radius = 9.0) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const padMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const greenLightMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });

    // Octagonal / Round Base Platform
    const padGeo = new THREE.CylinderGeometry(radius, radius + 0.5, 0.4, 16);
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.y = 0.2;
    group.add(pad);

    // Yellow Painted Ring
    const ringGeo = new THREE.RingGeometry(radius * 0.7, radius * 0.78, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, lineMat);
    ring.position.y = 0.42;
    group.add(ring);

    // Giant Painted 'H' Mark
    const hBarGeo = new THREE.PlaneGeometry(1.2, 5.0);
    hBarGeo.rotateX(-Math.PI / 2);
    const hL = new THREE.Mesh(hBarGeo, lineMat);
    hL.position.set(-1.6, 0.43, 0);
    const hR = new THREE.Mesh(hBarGeo, lineMat);
    hR.position.set(1.6, 0.43, 0);
    const hCross = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.2).rotateX(-Math.PI / 2), lineMat);
    hCross.position.set(0, 0.43, 0);
    group.add(hL, hR, hCross);

    // Perimeter Green LED Strobe Lights
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const lx = Math.cos(angle) * (radius - 0.4);
      const lz = Math.sin(angle) * (radius - 0.4);
      const lightMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), greenLightMat);
      lightMesh.position.set(lx, 0.5, lz);
      group.add(lightMesh);
    }

    this.scene.add(group);

    // Add solid collision platform
    const padBox = new THREE.Box3(
      new THREE.Vector3(x - radius, y, z - radius),
      new THREE.Vector3(x + radius, y + 0.6, z + radius)
    );
    this.physics.addRamp(padBox, 'y', y + 0.4);

    return group;
  }

  // Holographic Cyber Teleport / Elevator Pad
  createElevatorWarpPad(x, y, z, destX, destY, destZ, label = "Rooftop Elevator") {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.userData = { isElevator: true, target: new THREE.Vector3(destX, destY, destZ), label };

    const ringMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true });
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.0, 0.2, 16), ringMat);
    pad.position.y = 0.1;

    // Glowing column
    const glow = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.4, 2.8, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
    );
    glow.position.y = 1.4;

    group.add(pad, glow);
    this.scene.add(group);

    return group;
  }

  // Holographic Cyber Signboard
  createCyberSign(x, y, z, text = "ASTRACORP", colorHex = 0x00f3ff, width = 14, height = 4.5) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#050b14';
    ctx.fillRect(0, 0, 512, 160);

    // Cyber border
    ctx.strokeStyle = `#${colorHex.toString(16).padStart(6, '0')}`;
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 496, 144);

    ctx.font = 'bold 54px Montserrat, Rajdhani, sans-serif';
    ctx.fillStyle = ctx.strokeStyle;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 80);

    const tex = new THREE.CanvasTexture(canvas);
    const signMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), signMat);
    group.add(mesh);

    this.scene.add(group);
    return group;
  }

  // Shipping Freight Container (for Colaba Docks)
  createShippingContainer(x, y, z, colorHex = 0xdc2626, rotY = 0) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.y = rotY;

    const contMat = new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.5, roughness: 0.6 });
    const cont = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.0, 7.5), contMat);
    cont.position.y = 1.5;
    cont.castShadow = true;
    group.add(cont);

    this.scene.add(group);
    this.physics.addStaticBox(new THREE.Box3().setFromObject(cont));
    return group;
  }

  // Cargo Crane for Maritime Docks
  createCargoCrane(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const steelMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.3 }); // Safety Yellow

    // 4 Truss Legs
    const legGeo = new THREE.BoxGeometry(0.6, 22, 0.6);
    const l1 = new THREE.Mesh(legGeo, steelMat);
    l1.position.set(-3.5, 11, -3.5);
    const l2 = new THREE.Mesh(legGeo, steelMat);
    l2.position.set(3.5, 11, -3.5);
    const l3 = new THREE.Mesh(legGeo, steelMat);
    l3.position.set(-3.5, 11, 3.5);
    const l4 = new THREE.Mesh(legGeo, steelMat);
    l4.position.set(3.5, 11, 3.5);
    group.add(l1, l2, l3, l4);

    // Top Boom Arm
    const boomGeo = new THREE.BoxGeometry(2.0, 2.0, 28);
    const boom = new THREE.Mesh(boomGeo, steelMat);
    boom.position.set(0, 23, 6);
    group.add(boom);

    // Operator Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.0, 3.0), steelMat);
    cabin.position.set(0, 22, -2);
    group.add(cabin);

    this.scene.add(group);
    this.physics.addStaticBox(new THREE.Box3().setFromObject(l1));
    this.physics.addStaticBox(new THREE.Box3().setFromObject(l2));
    this.physics.addStaticBox(new THREE.Box3().setFromObject(l3));
    this.physics.addStaticBox(new THREE.Box3().setFromObject(l4));
    return group;
  }

  // --- Walk-in Chor Bazaar Black Market & Chop Shop Interior ---
  createWalkInShop(x, z, label = "CHOR BAZAAR BLACK MARKET & CHOP SHOP") {
    const group = new THREE.Group();
    group.name = 'BlackMarketShop';
    group.position.set(x, 0, z);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.85 }); // Vintage dark timber & plaster
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1f1915, roughness: 0.6 }); // Terracotta tiles
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x543621, roughness: 0.7 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.2 });

    const width = 11.0;
    const depth = 9.0;
    const height = 4.2;

    // Floor
    const floorGeo = new THREE.BoxGeometry(width, 0.2, depth);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(0, 0.1, 0);
    floor.receiveShadow = true;
    group.add(floor);

    // Ceiling / Roof
    const roofGeo = new THREE.BoxGeometry(width + 0.4, 0.3, depth + 0.4);
    const roof = new THREE.Mesh(roofGeo, wallMat);
    roof.position.set(0, height + 0.15, 0);
    group.add(roof);

    // Back Wall (z = -depth/2)
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.4), wallMat);
    backWall.position.set(0, height / 2, -depth / 2);
    group.add(backWall);

    // Left Wall (x = -width/2)
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, height, depth), wallMat);
    leftWall.position.set(-width / 2, height / 2, 0);
    group.add(leftWall);

    // Right Wall (x = width/2)
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, height, depth), wallMat);
    rightWall.position.set(width / 2, height / 2, 0);
    group.add(rightWall);

    // Front Wall with Walk-In Doorway Opening (Doorway width 3.6m in center)
    const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry((width - 3.6) / 2, height, 0.4), wallMat);
    frontWallLeft.position.set(-(width / 2) + (width - 3.6) / 4, height / 2, depth / 2);
    const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry((width - 3.6) / 2, height, 0.4), wallMat);
    frontWallRight.position.set((width / 2) - (width - 3.6) / 4, height / 2, depth / 2);
    const doorLintel = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.2, 0.4), wallMat);
    doorLintel.position.set(0, height - 0.6, depth / 2);
    group.add(frontWallLeft, frontWallRight, doorLintel);

    // Shopkeeper Wooden Counter Desk
    const counter = new THREE.Mesh(new THREE.BoxGeometry(5.0, 1.1, 1.1), woodMat);
    counter.position.set(0, 0.65, -1.2);
    group.add(counter);

    // Cash Register & Weighing Scale on Counter
    const reg = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.35, 0.5), metalMat);
    reg.position.set(-1.2, 1.35, -1.2);
    const scale = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 8), goldMat);
    scale.position.set(1.2, 1.35, -1.2);
    group.add(reg, scale);

    // Contraband Shelves on Back Wall
    for (let sy = 1.2; sy <= 3.2; sy += 0.9) {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.08, 0.6), woodMat);
      shelf.position.set(0, sy, -depth / 2 + 0.35);
      group.add(shelf);

      // Crates and smuggled electronics on shelves
      [-2.5, -0.8, 1.0, 2.7].forEach(sx => {
        const crate = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 0.4), goldMat);
        crate.position.set(sx, sy + 0.25, -depth / 2 + 0.35);
        group.add(crate);
      });
    }

    // NPC Shopkeeper ("Khadim Bhai") behind counter
    const shopkeeper = new THREE.Group();
    shopkeeper.position.set(0, 0, -2.6);
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.4), new THREE.MeshStandardMaterial({ color: 0x78350f })); // Kurta
    torso.position.y = 1.2;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
    head.position.y = 1.85;
    // Mustache
    const stache = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.06), new THREE.MeshBasicMaterial({ color: 0x111111 }));
    stache.position.set(0, 1.8, 0.22);
    shopkeeper.add(torso, head, stache);
    group.add(shopkeeper);

    // Overhead Warm Interior Lantern Lamp
    const lamp = new THREE.PointLight(0xffedd5, 1.8, 12);
    lamp.position.set(0, 3.6, 0);
    group.add(lamp);

    // Glowing Exterior Neon Shop Sign
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const sctx = signCanvas.getContext('2d');
    sctx.fillStyle = '#1c1917';
    sctx.fillRect(0, 0, 512, 128);
    sctx.strokeStyle = '#f59e0b';
    sctx.lineWidth = 6;
    sctx.strokeRect(6, 6, 500, 116);
    sctx.font = 'bold 36px Montserrat, Rajdhani, sans-serif';
    sctx.fillStyle = '#f59e0b';
    sctx.textAlign = 'center';
    sctx.textBaseline = 'middle';
    sctx.fillText("CHOR BAZAAR CHOP SHOP", 256, 45);
    sctx.font = '22px Montserrat, sans-serif';
    sctx.fillStyle = '#fbbf24';
    sctx.fillText("CONTRABAND FENCE & WEAPON MODS", 256, 85);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 1.8), new THREE.MeshBasicMaterial({ map: signTex }));
    signMesh.position.set(0, height + 0.9, depth / 2 + 0.05);
    group.add(signMesh);

    this.scene.add(group);

    // Register physics collisions for walls & counter
    this.physics.addStaticBox(new THREE.Box3().setFromObject(backWall));
    this.physics.addStaticBox(new THREE.Box3().setFromObject(leftWall));
    this.physics.addStaticBox(new THREE.Box3().setFromObject(rightWall));
    this.physics.addStaticBox(new THREE.Box3().setFromObject(frontWallLeft));
    this.physics.addStaticBox(new THREE.Box3().setFromObject(frontWallRight));
    this.physics.addStaticBox(new THREE.Box3().setFromObject(counter));

    // Register Black Market Shop trigger location for player interaction
    const shopEntry = {
      position: new THREE.Vector3(x, 0.5, z - 1.2),
      label: label,
      shopkeeperName: "Khadim Bhai"
    };
    this.blackMarketShops.push(shopEntry);

    return group;
  }

  // --- Wooden Maritime Boat Pier & Jetty ---
  createBoatPier(x, z, length = 18, width = 4.2, rotY = 0) {
    const group = new THREE.Group();
    group.name = 'BoatPier';
    group.position.set(x, 0, z);
    group.rotation.y = rotY;

    const woodPlankMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const pilingMat = new THREE.MeshStandardMaterial({ color: 0x27170e, roughness: 0.95 });
    const cleatMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });

    // Wooden Deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(width, 0.35, length), woodPlankMat);
    deck.position.set(0, 0.15, length / 2);
    deck.receiveShadow = true;
    group.add(deck);

    // Wooden Pilings
    const pilingGeo = new THREE.CylinderGeometry(0.18, 0.18, 3.5, 8);
    for (let pz = 1.5; pz <= length - 1.0; pz += 3.5) {
      [-width / 2 + 0.2, width / 2 - 0.2].forEach(px => {
        const piling = new THREE.Mesh(pilingGeo, pilingMat);
        piling.position.set(px, -1.2, pz);
        group.add(piling);

        // Mooring cleat on deck edge
        const cleat = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 0.35), cleatMat);
        cleat.position.set(px, 0.38, pz);
        group.add(cleat);
      });
    }

    // Safety Lifebuoy Ring at Pier End
    const lifebuoy = new THREE.Mesh(
      new THREE.TorusGeometry(0.4, 0.12, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.4 })
    );
    lifebuoy.position.set(0, 0.8, length - 0.2);
    group.add(lifebuoy);

    this.scene.add(group);

    // Static walkable deck box
    const pierBox = new THREE.Box3(
      new THREE.Vector3(x - width / 2, -0.2, z),
      new THREE.Vector3(x + width / 2, 0.6, z + length)
    );
    this.physics.addRamp(pierBox, 'y', 0.2);

    return group;
  }
}
