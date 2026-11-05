// MUMBYE: MAXIMUM CITY - Procedural 3D Model Factory
// Builds authentic Mumbai vehicles, characters, props, and weapons with Three.js primitives.
import * as THREE from 'three';

export class ModelFactory {
  constructor() {
    this.materialsCache = new Map();
  }

  getMaterial(key, createFn) {
    if (!this.materialsCache.has(key)) {
      this.materialsCache.set(key, createFn());
    }
    return this.materialsCache.get(key);
  }

  // --- VEHICLES ---

  // Auto Rickshaw (Bajaj RE 3-Wheeler)
  createAutoRickshaw(options = {}) {
    const group = new THREE.Group();
    group.name = 'AutoRickshaw';

    const bodyMat = new THREE.MeshStandardMaterial({
      color: options.bodyColor || (options.isNeon ? 0x00f3ff : 0x0a6b2d), // Green or custom
      roughness: 0.35,
      metalness: 0.2
    });
    const roofMat = new THREE.MeshStandardMaterial({
      color: options.roofColor || (options.isNeon ? 0xff0077 : 0xf2c016), // Yellow
      roughness: 0.7
    });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.85, roughness: 0.15 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xaaddee, transparent: true, opacity: 0.65 });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfff6bd });
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff1100 });

    // Chassis floor
    const floorGeo = new THREE.BoxGeometry(1.5, 0.2, 2.6);
    const floor = new THREE.Mesh(floorGeo, blackMat);
    floor.position.y = 0.45;
    floor.castShadow = true;
    group.add(floor);

    // Front nose cone (sloped)
    const noseGeo = new THREE.BoxGeometry(1.2, 0.7, 0.9);
    const nose = new THREE.Mesh(noseGeo, bodyMat);
    nose.position.set(0, 0.75, 0.85);
    nose.castShadow = true;
    group.add(nose);

    // Windshield frame & glass
    const wsFrameGeo = new THREE.BoxGeometry(1.2, 0.75, 0.08);
    const wsFrame = new THREE.Mesh(wsFrameGeo, blackMat);
    wsFrame.position.set(0, 1.45, 0.48);
    group.add(wsFrame);

    const wsGlassGeo = new THREE.PlaneGeometry(1.05, 0.6);
    const wsGlass = new THREE.Mesh(wsGlassGeo, glassMat);
    wsGlass.position.set(0, 1.45, 0.52);
    group.add(wsGlass);

    // Iconic Yellow Roof Canvas
    const roofGeo = new THREE.BoxGeometry(1.48, 0.12, 2.5);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 1.9, -0.2);
    roof.castShadow = true;
    group.add(roof);

    // Rear body & passenger cabin
    const cabinGeo = new THREE.BoxGeometry(1.48, 0.7, 1.4);
    const cabin = new THREE.Mesh(cabinGeo, bodyMat);
    cabin.position.set(0, 0.8, -0.6);
    cabin.castShadow = true;
    group.add(cabin);

    // Passenger bench seat
    const seatGeo = new THREE.BoxGeometry(1.3, 0.35, 0.6);
    const seat = new THREE.Mesh(seatGeo, blackMat);
    seat.position.set(0, 0.75, -0.7);
    group.add(seat);

    // Rear bumper & Horn OK Please board
    const boardGeo = new THREE.BoxGeometry(1.3, 0.28, 0.05);
    const boardMat = new THREE.MeshStandardMaterial({ color: 0xffd200 });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(0, 0.65, -1.33);
    group.add(board);

    // Roof support pillars
    const pillarMat = blackMat;
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8), pillarMat);
    p1.position.set(0.68, 1.5, -1.25);
    const p2 = p1.clone();
    p2.position.set(-0.68, 1.5, -1.25);
    const p3 = p1.clone();
    p3.position.set(0.68, 1.5, 0.35);
    const p4 = p1.clone();
    p4.position.set(-0.68, 1.5, 0.35);
    group.add(p1, p2, p3, p4);

    // Single Front Wheel (3-wheeler setup)
    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = blackMat;

    const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
    frontWheel.position.set(0, 0.32, 1.05);
    frontWheel.castShadow = true;
    group.add(frontWheel);

    // Two Rear Wheels
    const rearWheelL = new THREE.Mesh(wheelGeo, wheelMat);
    rearWheelL.position.set(0.8, 0.32, -0.65);
    rearWheelL.castShadow = true;
    const rearWheelR = new THREE.Mesh(wheelGeo, wheelMat);
    rearWheelR.position.set(-0.8, 0.32, -0.65);
    rearWheelR.castShadow = true;
    group.add(rearWheelL, rearWheelR);

    // Single Central Front Headlight
    const headlight = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 16), lightMat);
    headlight.rotateX(Math.PI / 2);
    headlight.position.set(0, 0.95, 1.32);
    group.add(headlight);

    // Tail lights
    const tl1 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.05), tailMat);
    tl1.position.set(0.55, 0.65, -1.33);
    const tl2 = tl1.clone();
    tl2.position.set(-0.55, 0.65, -1.33);
    group.add(tl1, tl2);

    // Driver meter box
    const meter = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.12), new THREE.MeshBasicMaterial({ color: 0x222222 }));
    meter.position.set(0.35, 1.0, 0.55);
    group.add(meter);

    // Nitro flame exhaust if neon / drift DLC
    if (options.isNeon) {
      const underglow = new THREE.PointLight(0x00f3ff, 2.5, 5);
      underglow.position.set(0, 0.2, 0);
      group.add(underglow);
    }

    group.userData = {
      type: 'auto',
      width: 1.6,
      length: 2.8,
      height: 2.0,
      headlightPos: new THREE.Vector3(0, 0.95, 1.4),
      seatPos: new THREE.Vector3(0, 0.8, 0.0),
      driverSeatPos: new THREE.Vector3(0, 0.7, 0.1)
    };

    return group;
  }

  // Kaali-Peeli Taxi (Premier Padmini / Ambassador)
  createTaxi(options = {}) {
    const group = new THREE.Group();
    group.name = 'KaaliPeeliTaxi';

    const blackBodyMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.25, metalness: 0.1 });
    const yellowRoofMat = new THREE.MeshStandardMaterial({ color: 0xf3b700, roughness: 0.35 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.9, roughness: 0.1 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x88ccdd, transparent: true, opacity: 0.6 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.8 });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfffae0 });
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xdd1100 });

    // Lower Chassis
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.55, 4.2), blackBodyMat);
    lowerBody.position.y = 0.55;
    lowerBody.castShadow = true;
    group.add(lowerBody);

    // Vintage Curved Hood & Trunk
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.22, 1.3), blackBodyMat);
    hood.position.set(0, 0.82, 1.25);
    hood.castShadow = true;
    group.add(hood);

    const trunk = new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.2, 1.0), blackBodyMat);
    trunk.position.set(0, 0.8, -1.45);
    trunk.castShadow = true;
    group.add(trunk);

    // Yellow Roof Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.65, 1.9), yellowRoofMat);
    cabin.position.set(0, 1.2, -0.15);
    cabin.castShadow = true;
    group.add(cabin);

    // Windshield & Windows
    const wsFront = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.48, 0.05), glassMat);
    wsFront.position.set(0, 1.2, 0.82);
    const wsRear = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.45, 0.05), glassMat);
    wsRear.position.set(0, 1.2, -1.12);
    group.add(wsFront, wsRear);

    // Classic Chrome Radiator Grille
    const grille = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.32, 0.08), chromeMat);
    grille.position.set(0, 0.65, 2.12);
    group.add(grille);

    // Yellow "TAXI" Roof Box
    const taxiSign = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.16, 0.22), new THREE.MeshBasicMaterial({ color: 0xffe033 }));
    taxiSign.position.set(0, 1.6, -0.15);
    group.add(taxiSign);

    // Round Vintage Headlights
    const hl1 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 16), lightMat);
    hl1.rotateX(Math.PI / 2);
    hl1.position.set(0.65, 0.65, 2.12);
    const hl2 = hl1.clone();
    hl2.position.set(-0.65, 0.65, 2.12);
    group.add(hl1, hl2);

    // Chrome Bumpers
    const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.15, 0.12), chromeMat);
    frontBumper.position.set(0, 0.35, 2.14);
    const rearBumper = frontBumper.clone();
    rearBumper.position.set(0, 0.35, -2.14);
    group.add(frontBumper, rearBumper);

    // Tail Lights
    const tl1 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.05), tailMat);
    tl1.position.set(0.68, 0.65, -2.12);
    const tl2 = tl1.clone();
    tl2.position.set(-0.68, 0.65, -2.12);
    group.add(tl1, tl2);

    // 4 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wFL = new THREE.Mesh(wheelGeo, wheelMat);
    wFL.position.set(0.9, 0.35, 1.25);
    wFL.castShadow = true;
    const wFR = wFL.clone();
    wFR.position.set(-0.9, 0.35, 1.25);
    const wRL = wFL.clone();
    wRL.position.set(0.9, 0.35, -1.25);
    const wRR = wFL.clone();
    wRR.position.set(-0.9, 0.35, -1.25);
    group.add(wFL, wFR, wRL, wRR);

    group.userData = {
      type: 'taxi',
      width: 1.9,
      length: 4.3,
      height: 1.7,
      driverSeatPos: new THREE.Vector3(0.4, 0.8, -0.1)
    };

    return group;
  }

  // BEST Red Bus (Iconic Mumbai Public Transport)
  createBestBus() {
    const group = new THREE.Group();
    group.name = 'BestBus';

    const redMat = new THREE.MeshStandardMaterial({ color: 0xba131a, roughness: 0.4 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.5 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x66aacc, transparent: true, opacity: 0.65 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfffedd });

    // Main Bus Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.2, 9.5), redMat);
    body.position.y = 2.1;
    body.castShadow = true;
    group.add(body);

    // Front Route Board "123 VT - BANDRA"
    const routeBoard = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 0.08), new THREE.MeshBasicMaterial({ color: 0xffd200 }));
    routeBoard.position.set(0, 3.2, 4.78);
    group.add(routeBoard);

    // Windshield upper & lower
    const ws1 = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.85, 0.06), glassMat);
    ws1.position.set(0, 2.2, 4.78);
    const ws2 = ws1.clone();
    ws2.position.set(0, 3.0, -4.78);
    group.add(ws1, ws2);

    // Side Windows (Rows)
    for (let side = -1; side <= 1; side += 2) {
      if (side === 0) continue;
      for (let z = -3.5; z <= 3.5; z += 1.4) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.75, 1.0), glassMat);
        win.position.set(side * 1.32, 2.5, z);
        group.add(win);
      }
    }

    // Bus Wheels (6 Heavy Wheels)
    const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.4, 16);
    wheelGeo.rotateZ(Math.PI / 2);

    const positions = [
      [1.3, 0.55, 2.8],
      [-1.3, 0.55, 2.8],
      [1.3, 0.55, -2.4],
      [-1.3, 0.55, -2.4],
      [1.3, 0.55, -3.6],
      [-1.3, 0.55, -3.6]
    ];
    positions.forEach(pos => {
      const w = new THREE.Mesh(wheelGeo, blackMat);
      w.position.set(...pos);
      w.castShadow = true;
      group.add(w);
    });

    // Dual Headlights
    const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.08), lightMat);
    hlL.position.set(0.9, 1.0, 4.78);
    const hlR = hlL.clone();
    hlR.position.set(-0.9, 1.0, 4.78);
    group.add(hlL, hlR);

    group.userData = {
      type: 'bus',
      width: 2.8,
      length: 9.8,
      height: 3.8,
      driverSeatPos: new THREE.Vector3(0.7, 1.8, 3.2)
    };

    return group;
  }

  // Metro Patrol SUV (Security Cruiser)
  createPoliceCar() {
    const group = new THREE.Group();
    group.name = 'PoliceCar';

    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.3 });
    const blueMat = new THREE.MeshStandardMaterial({ color: 0x003399, roughness: 0.4 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.8 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x88ccdd, transparent: true, opacity: 0.6 });

    // SUV Lower Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.85, 4.4), whiteMat);
    body.position.y = 0.8;
    body.castShadow = true;
    group.add(body);

    // Blue Police Chevron Stripes
    const stripeL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.25, 3.6), blueMat);
    stripeL.position.set(0.96, 0.8, 0);
    const stripeR = stripeL.clone();
    stripeR.position.set(-0.96, 0.8, 0);
    group.add(stripeL, stripeR);

    // Cabin Roof
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.75, 2.4), whiteMat);
    cabin.position.set(0, 1.55, -0.3);
    cabin.castShadow = true;
    group.add(cabin);

    // Windows
    const ws = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.55, 0.05), glassMat);
    ws.position.set(0, 1.55, 0.92);
    group.add(ws);

    // Flashing Police Roof Lightbar (Red & Blue)
    const lightbarBase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.2), blackMat);
    lightbarBase.position.set(0, 1.98, -0.3);
    group.add(lightbarBase);

    const redLight = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.16), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    redLight.position.set(-0.25, 2.05, -0.3);
    const blueLight = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.16), new THREE.MeshBasicMaterial({ color: 0x0055ff }));
    blueLight.position.set(0.25, 2.05, -0.3);
    group.add(redLight, blueLight);

    // Point lights for flashing beacon
    const beaconL = new THREE.PointLight(0xff0000, 1.5, 12);
    beaconL.position.set(-0.5, 2.1, -0.3);
    const beaconR = new THREE.PointLight(0x0055ff, 1.5, 12);
    beaconR.position.set(0.5, 2.1, -0.3);
    group.add(beaconL, beaconR);

    group.userData.beacons = [redLight, blueLight, beaconL, beaconR];

    // Heavy SUV Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wFL = new THREE.Mesh(wheelGeo, blackMat);
    wFL.position.set(0.95, 0.42, 1.35);
    wFL.castShadow = true;
    const wFR = wFL.clone();
    wFR.position.set(-0.95, 0.42, 1.35);
    const wRL = wFL.clone();
    wRL.position.set(0.95, 0.42, -1.35);
    const wRR = wFL.clone();
    wRR.position.set(-0.95, 0.42, -1.35);
    group.add(wFL, wFR, wRL, wRR);

    // Front Bullbar
    const bullbar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 0.1), blackMat);
    bullbar.position.set(0, 0.65, 2.25);
    group.add(bullbar);

    group.userData = {
      type: 'police',
      width: 2.0,
      length: 4.6,
      height: 2.1,
      driverSeatPos: new THREE.Vector3(0.45, 1.0, 0.0),
      beacons: [redLight, blueLight, beaconL, beaconR]
    };

    return group;
  }

  // Bollywood Supercar / Drift King
  createSupercar(options = {}) {
    const group = new THREE.Group();
    group.name = 'Supercar';

    const color = options.color || 0xff0044;
    const carMat = new THREE.MeshStandardMaterial({ color, roughness: 0.15, metalness: 0.8 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x223344, transparent: true, opacity: 0.7 });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });

    // Ultra low aerodynamic body
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.42, 4.6), carMat);
    body.position.y = 0.4;
    body.castShadow = true;
    group.add(body);

    // Sleek cockpit
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 2.1), glassMat);
    cabin.position.set(0, 0.75, -0.2);
    cabin.castShadow = true;
    group.add(cabin);

    // Rear GT Wing Spoiler
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.06, 0.45), carMat);
    wing.position.set(0, 0.85, -2.1);
    const strutL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.15), blackMat);
    strutL.position.set(0.65, 0.65, -2.1);
    const strutR = strutL.clone();
    strutR.position.set(-0.65, 0.65, -2.1);
    group.add(wing, strutL, strutR);

    // Wide sports wheels
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.35, 18);
    wheelGeo.rotateZ(Math.PI / 2);
    const wFL = new THREE.Mesh(wheelGeo, blackMat);
    wFL.position.set(0.98, 0.38, 1.4);
    wFL.castShadow = true;
    const wFR = wFL.clone();
    wFR.position.set(-0.98, 0.38, 1.4);
    const wRL = wFL.clone();
    wRL.position.set(1.0, 0.38, -1.35);
    const wRR = wFL.clone();
    wRR.position.set(-1.0, 0.38, -1.35);
    group.add(wFL, wFR, wRL, wRR);

    // Neon underglow light
    const underglow = new THREE.PointLight(options.underglowColor || 0x00ffff, 2.5, 6);
    underglow.position.set(0, 0.15, 0);
    group.add(underglow);

    group.userData = {
      type: 'supercar',
      width: 2.1,
      length: 4.8,
      height: 1.3,
      driverSeatPos: new THREE.Vector3(0.45, 0.55, -0.1)
    };

    return group;
  }

  // Mumbai Local Train Coach (ICF Suburban EMU)
  createTrainCoach(isMotorCoach = false) {
    const group = new THREE.Group();
    group.name = 'MumbaiLocalCoach';

    const creamMat = new THREE.MeshStandardMaterial({ color: 0xf5eedb, roughness: 0.4 });
    const blueMat = new THREE.MeshStandardMaterial({ color: 0x184a8c, roughness: 0.4 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xb5bcc7, roughness: 0.6 });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x777777, metalness: 0.7, roughness: 0.3 });

    // Lower Coach Body (Blue Stripe)
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.2, 18.0), blueMat);
    lowerBody.position.y = 1.4;
    lowerBody.castShadow = true;
    group.add(lowerBody);

    // Upper Coach Body (Cream)
    const upperBody = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.6, 18.0), creamMat);
    upperBody.position.y = 2.8;
    upperBody.castShadow = true;
    group.add(upperBody);

    // Curved Metallic Roof
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, 18.0, 16, 1, false, 0, Math.PI), roofMat);
    roof.rotation.z = Math.PI / 2;
    roof.rotation.y = Math.PI / 2;
    roof.position.y = 3.6;
    group.add(roof);

    // Open Doorways (Mumbai local style - wide open doors!)
    const doorCutoutMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const doorZPositions = [-5.5, -0.0, 5.5];
    doorZPositions.forEach(z => {
      const doorL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.2, 1.6), doorCutoutMat);
      doorL.position.set(1.61, 2.2, z);
      const doorR = doorL.clone();
      doorR.position.set(-1.61, 2.2, z);
      group.add(doorL, doorR);
    });

    // Heavy Train Bogies & Metal Wheels
    const bogieGeo = new THREE.BoxGeometry(2.6, 0.4, 3.5);
    const bogie1 = new THREE.Mesh(bogieGeo, steelMat);
    bogie1.position.set(0, 0.6, 5.5);
    const bogie2 = bogie1.clone();
    bogie2.position.set(0, 0.6, -5.5);
    group.add(bogie1, bogie2);

    // Pantograph on motor coach
    if (isMotorCoach) {
      const pantoBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 1.5), steelMat);
      pantoBase.position.set(0, 4.4, 0);
      const pantoArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2), steelMat);
      pantoArm.rotation.x = Math.PI / 4;
      pantoArm.position.set(0, 4.9, 0);
      group.add(pantoBase, pantoArm);
    }

    group.userData = {
      type: 'train',
      width: 3.4,
      length: 18.2,
      height: 4.8
    };

    return group;
  }

  // --- CHARACTERS ---

  // Rigged Modular Humanoid Character
  createHumanoid(type = 'player', options = {}) {
    const group = new THREE.Group();
    group.name = 'Humanoid_' + type;

    // Materials based on character type
    let shirtColor = 0x224488; // Kabir denim
    let pantsColor = 0x1f242d;
    let skinColor = 0xb57855; // Indian skin tone
    let hairColor = 0x1a1512;
    let shoesColor = 0xeeeeee;

    if (type === 'police') {
      shirtColor = 0xb08b59; // Khaki
      pantsColor = 0xb08b59;
      shoesColor = 0x3d2716; // Brown boots
    } else if (type === 'dabbawala') {
      shirtColor = 0xffffff; // White Kurta
      pantsColor = 0xffffff;
      shoesColor = 0x5a4a3a;
    } else if (type === 'tapori') {
      shirtColor = options.shirtColor || 0xff6600; // Bright floral
      pantsColor = 0x2b3e50;
      shoesColor = 0xdd2222;
    } else if (type === 'pedestrian') {
      const colors = [0x2660a4, 0x1b998b, 0xed254e, 0xf46036, 0x483d3f, 0x7209b7];
      shirtColor = colors[Math.floor(Math.random() * colors.length)];
      pantsColor = Math.random() > 0.5 ? 0x222222 : 0x444444;
    }

    const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.6 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.5 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.6 });
    const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.9 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: shoesColor, roughness: 0.5 });

    // Root Pelvis
    const pelvis = new THREE.Group();
    pelvis.position.y = 0.95;
    group.add(pelvis);

    const hips = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.22, 0.24), pantsMat);
    pelvis.add(hips);

    // Torso / Chest
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.52, 0.28), shirtMat);
    torso.position.y = 0.36;
    torso.castShadow = true;
    pelvis.add(torso);

    // Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.75, 0);
    pelvis.add(headGroup);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.24), skinMat);
    head.castShadow = true;
    headGroup.add(head);

    // Hair or Police Cap or Gandhi Topi
    if (type === 'police') {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.12, 12), new THREE.MeshStandardMaterial({ color: 0x9c7a4d }));
      cap.position.y = 0.16;
      const redBand = new THREE.Mesh(new THREE.CylinderGeometry(0.182, 0.182, 0.04, 12), new THREE.MeshBasicMaterial({ color: 0xaa1111 }));
      redBand.position.y = 0.13;
      headGroup.add(cap, redBand);
    } else if (type === 'dabbawala') {
      const topi = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.28), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      topi.position.set(0, 0.16, 0);
      headGroup.add(topi);
    } else {
      const hair = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.1, 0.26), hairMat);
      hair.position.y = 0.14;
      headGroup.add(hair);

      if (type === 'player') {
        // Cool sunglasses
        const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.05), new THREE.MeshBasicMaterial({ color: 0x111111 }));
        glasses.position.set(0, 0.03, 0.13);
        headGroup.add(glasses);
      }
    }

    // Left Arm (Shoulder pivot)
    const armL = new THREE.Group();
    armL.position.set(0.28, 0.54, 0);
    pelvis.add(armL);
    const upperArmL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.12), shirtMat);
    upperArmL.position.y = -0.14;
    armL.add(upperArmL);
    const lowerArmL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.26, 0.1), skinMat);
    lowerArmL.position.y = -0.38;
    armL.add(lowerArmL);

    // Right Arm (Shoulder pivot) - Holds weapon
    const armR = new THREE.Group();
    armR.position.set(-0.28, 0.54, 0);
    pelvis.add(armR);
    const upperArmR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.12), shirtMat);
    upperArmR.position.y = -0.14;
    armR.add(upperArmR);
    const lowerArmR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.26, 0.1), skinMat);
    lowerArmR.position.y = -0.38;
    armR.add(lowerArmR);

    // Weapon Attachment Socket on Right Hand
    const handSocket = new THREE.Group();
    handSocket.position.set(0, -0.48, 0.05);
    armR.add(handSocket);

    // Left Leg (Hip pivot)
    const legL = new THREE.Group();
    legL.position.set(0.12, -0.1, 0);
    pelvis.add(legL);
    const upperLegL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.42, 0.14), pantsMat);
    upperLegL.position.y = -0.21;
    legL.add(upperLegL);
    const lowerLegL = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.42, 0.13), pantsMat);
    lowerLegL.position.y = -0.58;
    legL.add(lowerLegL);
    const footL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.24), shoeMat);
    footL.position.set(0, -0.82, 0.05);
    legL.add(footL);

    // Right Leg (Hip pivot)
    const legR = new THREE.Group();
    legR.position.set(-0.12, -0.1, 0);
    pelvis.add(legR);
    const upperLegR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.42, 0.14), pantsMat);
    upperLegR.position.y = -0.21;
    legR.add(upperLegR);
    const lowerLegR = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.42, 0.13), pantsMat);
    lowerLegR.position.y = -0.58;
    legR.add(lowerLegR);
    const footR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.24), shoeMat);
    footR.position.set(0, -0.82, 0.05);
    legR.add(footR);

    // If Dabbawala, add steel dabba tiffin carrier in left hand!
    if (type === 'dabbawala') {
      const dabbaGroup = new THREE.Group();
      dabbaGroup.position.set(0, -0.5, 0.1);
      const steelMat2 = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.2 });
      for (let i = 0; i < 4; i++) {
        const tier = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 12), steelMat2);
        tier.position.y = i * 0.09;
        dabbaGroup.add(tier);
      }
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 6, 12, Math.PI), steelMat2);
      handle.position.y = 0.38;
      dabbaGroup.add(handle);
      armL.add(dabbaGroup);
    }

    // Attach animation joints for runtime manipulation
    group.joints = {
      pelvis,
      torso,
      head: headGroup,
      armL,
      armR,
      legL,
      legR,
      handSocket
    };

    return group;
  }

  // --- WEAPONS ---

  createWeaponMesh(weaponId) {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x6e3d1d, roughness: 0.6 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.85, roughness: 0.25 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, metalness: 0.9, roughness: 0.15 });

    if (weaponId === 'lathi') {
      // Bamboo police cane
      const bambooMat = new THREE.MeshStandardMaterial({ color: 0xd9b768, roughness: 0.6 });
      const lathi = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 1.2, 8), bambooMat);
      lathi.position.y = 0.3;
      group.add(lathi);
    } else if (weaponId === 'bat') {
      // Cricket Bat with MRF/CEAT sticker
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 8), new THREE.MeshStandardMaterial({ color: 0xdd1111 }));
      handle.position.y = 0.15;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.65, 0.04), woodMat);
      blade.position.y = 0.55;
      const sticker = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.25), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      sticker.position.set(0, 0.6, 0.022);
      group.add(handle, blade, sticker);
    } else if (weaponId === 'katta') {
      // Desi Katta (Single shot rustic country pistol)
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.35, 8), metalMat);
      barrel.rotateX(Math.PI / 2);
      barrel.position.set(0, 0.12, 0.15);
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.06), woodMat);
      grip.position.set(0, 0.02, 0.02);
      group.add(barrel, grip);
    } else if (weaponId === 'pistol') {
      // Service 9mm pistol
      const slide = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.25), metalMat);
      slide.position.set(0, 0.1, 0.08);
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.14, 0.07), metalMat);
      grip.position.set(0, 0.02, 0.01);
      group.add(slide, grip);
    } else if (weaponId === 'ak47') {
      // Underworld AK-47
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.45), metalMat);
      receiver.position.set(0, 0.08, 0.1);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), metalMat);
      barrel.rotateX(Math.PI / 2);
      barrel.position.set(0, 0.09, 0.45);
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.28), woodMat);
      stock.position.set(0, 0.04, -0.22);
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.1), metalMat);
      mag.position.set(0, -0.05, 0.18);
      mag.rotation.x = -0.25;
      group.add(receiver, barrel, stock, mag);
    } else if (weaponId === 'gold_eagle') {
      // Bollywood DLC Gold Desert Eagle
      const slide = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.32), goldMat);
      slide.position.set(0, 0.11, 0.1);
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.09), new THREE.MeshStandardMaterial({ color: 0x111111 }));
      grip.position.set(0, 0.02, 0.02);
      group.add(slide, grip);
    } else if (weaponId === 'coconut') {
      // Coconut Grenade
      const nut = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), new THREE.MeshStandardMaterial({ color: 0x4d3319, roughness: 0.9 }));
      const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.08), new THREE.MeshBasicMaterial({ color: 0xff3300 }));
      fuse.position.y = 0.12;
      group.add(nut, fuse);
    }

    return group;
  }
}
