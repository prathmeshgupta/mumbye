// MUMBYE: MAXIMUM CITY - Mumbai Street Props & Interactive Stalls
import * as THREE from 'three';

export class CityProps {
  constructor(scene, physics) {
    this.scene = scene;
    this.physics = physics;
    this.interactiveStalls = []; // Vada Pav & Chai stalls
    this.stuntRamps = [];
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
    pole.castShadow = true;
    group.add(pole);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.1), ironMat);
    arm.position.set(0.5, 5.4, 0);
    group.add(arm);

    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.3, 8), lightMat);
    lantern.position.set(1.0, 5.2, 0);
    group.add(lantern);

    // Street Light Source
    const light = new THREE.PointLight(0xffe899, 1.8, 22);
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
    const spotL = new THREE.PointLight(0xffffff, 2.0, 15);
    spotL.position.set(-width * 0.35, height * 0.4, 2.0);
    const spotR = new THREE.PointLight(0xffffff, 2.0, 15);
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
}
