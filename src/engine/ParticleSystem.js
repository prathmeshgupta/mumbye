// MUMBYE: MAXIMUM CITY - Particle System
import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];

    // Rain system
    this.rainMesh = null;
    this.rainCount = 2000;
    this.rainGeometry = null;
    this.rainMaterial = null;

    this.initRain();
  }

  initRain() {
    this.rainGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.rainCount * 3);
    const boxSize = 80;

    for (let i = 0; i < this.rainCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * boxSize;
      positions[i * 3 + 1] = Math.random() * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * boxSize;
    }

    this.rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.rainMaterial = new THREE.PointsMaterial({
      color: 0x9bc2e6,
      size: 0.18,
      transparent: true,
      opacity: 0.75
    });

    this.rainMesh = new THREE.Points(this.rainGeometry, this.rainMaterial);
    this.rainMesh.visible = false;
    this.scene.add(this.rainMesh);
  }

  spawnMuzzleFlash(position, direction) {
    // Flash light
    const light = new THREE.PointLight(0xffaa22, 4.0, 10);
    light.position.copy(position);
    this.scene.add(light);
    setTimeout(() => this.scene.remove(light), 50);

    // Flash sprite/mesh
    const geo = new THREE.SphereGeometry(0.18, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0xfff0aa });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position).add(direction.clone().multiplyScalar(0.2));
    this.scene.add(mesh);
    setTimeout(() => this.scene.remove(mesh), 50);

    // Sparks
    for (let i = 0; i < 5; i++) {
      const sparkVel = direction.clone()
        .add(new THREE.Vector3((Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8))
        .normalize().multiplyScalar(8 + Math.random() * 8);

      this.createParticle({
        position: position.clone(),
        velocity: sparkVel,
        size: 0.08,
        color: 0xffcc33,
        life: 0.15,
        decay: 1.0,
        gravity: 5
      });
    }
  }

  spawnSparks(position, normal = new THREE.Vector3(0, 1, 0)) {
    for (let i = 0; i < 8; i++) {
      const vel = normal.clone()
        .add(new THREE.Vector3((Math.random() - 0.5) * 1.5, Math.random() * 1.5, (Math.random() - 0.5) * 1.5))
        .normalize().multiplyScalar(4 + Math.random() * 7);

      this.createParticle({
        position: position.clone(),
        velocity: vel,
        size: 0.09,
        color: 0xffaa22,
        life: 0.25,
        decay: 1.0,
        gravity: 9.8
      });
    }
  }

  spawnBlood(position) {
    for (let i = 0; i < 6; i++) {
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 2.5 + 0.5,
        (Math.random() - 0.5) * 2
      );
      this.createParticle({
        position: position.clone(),
        velocity: vel,
        size: 0.12,
        color: 0x990000,
        life: 0.4,
        decay: 1.0,
        gravity: 9.8
      });
    }
  }

  // Speedboat Water Spray & Foaming Ocean Wake
  spawnWaterWake(position, forwardDir, speed = 10) {
    const sternOffset = forwardDir.clone().negate().multiplyScalar(1.2);
    const leftSpray = new THREE.Vector3(-forwardDir.z, 0, forwardDir.x).multiplyScalar(0.7);
    const rightSpray = new THREE.Vector3(forwardDir.z, 0, -forwardDir.x).multiplyScalar(0.7);

    [leftSpray, rightSpray].forEach(sprayDir => {
      const pPos = position.clone().add(sternOffset).add(sprayDir);
      pPos.y = -0.3; // Water surface

      const vel = sprayDir.clone().multiplyScalar(speed * 0.2 + 1.5)
        .add(new THREE.Vector3(0, 1.2 + Math.random() * 1.5, 0));

      this.createParticle({
        position: pPos,
        velocity: vel,
        size: 0.22 + Math.random() * 0.15,
        color: 0xe0f2fe,
        opacity: 0.85,
        life: 0.35 + Math.random() * 0.2,
        decay: 1.0,
        growth: 2.2,
        gravity: 6.0
      });
    });
  }

  // Metro Security Laser / Stun Beam Bolt
  spawnStunBeam(startPos, endPos) {
    const dir = endPos.clone().sub(startPos);
    const length = dir.length();
    const beamGeo = new THREE.CylinderGeometry(0.08, 0.08, length, 6);
    beamGeo.rotateX(Math.PI / 2);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.9 });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.copy(startPos).addScaledVector(dir, 0.5);
    beam.lookAt(endPos);
    this.scene.add(beam);

    setTimeout(() => {
      this.scene.remove(beam);
      beamGeo.dispose();
      beamMat.dispose();
    }, 90);

    // Impact sparks
    this.spawnSparks(endPos);
  }

  spawnTireSmoke(position) {
    const vel = new THREE.Vector3((Math.random() - 0.5) * 0.8, Math.random() * 0.6 + 0.2, (Math.random() - 0.5) * 0.8);
    this.createParticle({
      position: position.clone(),
      velocity: vel,
      size: 0.35,
      growth: 1.2,
      color: 0xddeeff,
      opacity: 0.35,
      life: 0.6,
      decay: 1.0,
      gravity: -0.2
    });
  }

  spawnEngineSmoke(position, isFire = false) {
    const vel = new THREE.Vector3(
      (Math.random() - 0.5) * 0.5,
      Math.random() * 2.5 + 1.0,
      (Math.random() - 0.5) * 0.5
    );

    this.createParticle({
      position: position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.3, 0, (Math.random() - 0.5) * 0.3)),
      velocity: vel,
      size: isFire ? 0.35 : 0.45,
      growth: 1.5,
      color: isFire ? (Math.random() > 0.5 ? 0xff4400 : 0xffaa00) : 0x222222,
      opacity: isFire ? 0.8 : 0.5,
      life: isFire ? 0.4 : 0.9,
      decay: 1.0,
      gravity: -1.0
    });
  }

  spawnExplosion(position) {
    // Big flash
    const light = new THREE.PointLight(0xff6600, 8.0, 30);
    light.position.copy(position).add(new THREE.Vector3(0, 2, 0));
    this.scene.add(light);
    setTimeout(() => this.scene.remove(light), 150);

    // Expanding fireball core
    for (let i = 0; i < 25; i++) {
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 2,
        (Math.random() - 0.5) * 2
      ).normalize().multiplyScalar(4 + Math.random() * 10);

      this.createParticle({
        position: position.clone().add(new THREE.Vector3(0, 1.0, 0)),
        velocity: vel,
        size: 0.9,
        growth: 2.2,
        color: Math.random() > 0.3 ? 0xff3300 : 0xff9900,
        opacity: 0.9,
        life: 0.7,
        decay: 1.0,
        gravity: -1.5
      });
    }

    // Heavy black smoke column
    for (let i = 0; i < 20; i++) {
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 3 + 2,
        (Math.random() - 0.5) * 2
      );

      this.createParticle({
        position: position.clone().add(new THREE.Vector3(0, 1.5, 0)),
        velocity: vel,
        size: 1.2,
        growth: 3.0,
        color: 0x111111,
        opacity: 0.75,
        life: 1.5,
        decay: 1.0,
        gravity: -2.5
      });
    }
  }

  createParticle(config) {
    const geo = new THREE.SphereGeometry(config.size || 0.2, 6, 6);
    const mat = new THREE.MeshBasicMaterial({
      color: config.color || 0xffffff,
      transparent: true,
      opacity: config.opacity !== undefined ? config.opacity : 1.0
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(config.position);
    this.scene.add(mesh);

    this.particles.push({
      mesh,
      velocity: config.velocity || new THREE.Vector3(),
      life: config.life || 1.0,
      maxLife: config.life || 1.0,
      decay: config.decay || 1.0,
      growth: config.growth || 0,
      gravity: config.gravity || 0
    });
  }

  update(delta, playerPos, isRaining = false) {
    // Update individual particle meshes
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta * p.decay;

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.particles.splice(i, 1);
        continue;
      }

      // Physics
      p.velocity.y -= p.gravity * delta;
      p.mesh.position.addScaledVector(p.velocity, delta);

      // Fade out and grow
      const t = p.life / p.maxLife;
      p.mesh.material.opacity = t;
      if (p.growth > 0) {
        const scale = 1 + (1 - t) * p.growth;
        p.mesh.scale.set(scale, scale, scale);
      }
    }

    // Update rain
    if (this.rainMesh) {
      this.rainMesh.visible = isRaining;
      if (isRaining && playerPos) {
        this.rainMesh.position.x = playerPos.x;
        this.rainMesh.position.z = playerPos.z;

        const positions = this.rainGeometry.attributes.position.array;
        const boxSize = 80;
        const speed = 40.0;

        for (let i = 0; i < this.rainCount; i++) {
          positions[i * 3 + 1] -= speed * delta;
          if (positions[i * 3 + 1] < 0) {
            positions[i * 3 + 1] = 40;
            positions[i * 3 + 0] = (Math.random() - 0.5) * boxSize;
            positions[i * 3 + 2] = (Math.random() - 0.5) * boxSize;
          }
        }
        this.rainGeometry.attributes.position.needsUpdate = true;
      }
    }
  }
}
