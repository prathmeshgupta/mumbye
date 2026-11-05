// MUMBYE: MAXIMUM CITY - Collision, Raycasting & Spatial Physics System
import * as THREE from 'three';

export class Physics {
  constructor() {
    // Static colliders: array of THREE.Box3 bounding boxes
    this.staticColliders = [];
    // Dynamic colliders (vehicles, props)
    this.dynamicColliders = [];
    // Stunt ramps and slopes: { box: Box3, slopeAngle, height, direction }
    this.ramps = [];
    // Water plane level
    this.waterY = 0.0;
  }

  addStaticBox(box, metadata = {}) {
    this.staticColliders.push({ box, ...metadata });
  }

  addRamp(box, direction, height) {
    this.ramps.push({ box, direction, height });
  }

  clear() {
    this.staticColliders = [];
    this.dynamicColliders = [];
    this.ramps = [];
  }

  // Check sphere collision against static world boxes
  // Returns collision normal vector and penetration depth if overlapping
  checkSphereCollision(position, radius) {
    const sphere = new THREE.Sphere(position, radius);
    let hit = false;
    const correction = new THREE.Vector3();

    for (let i = 0; i < this.staticColliders.length; i++) {
      const col = this.staticColliders[i];
      if (col.box.intersectsSphere(sphere)) {
        hit = true;
        // Find closest point on box to sphere center
        const closestPoint = new THREE.Vector3();
        col.box.clampPoint(position, closestPoint);

        const diff = new THREE.Vector3().subVectors(position, closestPoint);
        const dist = diff.length();

        if (dist === 0) {
          // Inside box: push out along smallest axis
          const center = new THREE.Vector3();
          col.box.getCenter(center);
          const size = new THREE.Vector3();
          col.box.getSize(size);

          const dx = position.x - center.x;
          const dz = position.z - center.z;

          if (Math.abs(dx) > Math.abs(dz)) {
            correction.x += Math.sign(dx) * 0.5;
          } else {
            correction.z += Math.sign(dz) * 0.5;
          }
        } else {
          const penetration = radius - dist;
          if (penetration > 0) {
            diff.normalize().multiplyScalar(penetration);
            correction.add(diff);
          }
        }
      }
    }

    return { hit, correction };
  }

  // Raycast against scene static colliders
  raycast(origin, direction, maxDistance = 50) {
    const ray = new THREE.Ray(origin, direction.clone().normalize());
    let closestDist = maxDistance;
    let hitPoint = null;
    let hitNormal = null;
    let hitObject = null;

    for (let i = 0; i < this.staticColliders.length; i++) {
      const col = this.staticColliders[i];
      const target = new THREE.Vector3();
      const hit = ray.intersectBox(col.box, target);

      if (hit) {
        const dist = origin.distanceTo(target);
        if (dist < closestDist) {
          closestDist = dist;
          hitPoint = target.clone();
          hitObject = col;

          // Estimate face normal
          const center = new THREE.Vector3();
          col.box.getCenter(center);
          const size = new THREE.Vector3();
          col.box.getSize(size);

          const normal = new THREE.Vector3();
          const eps = 0.05;
          if (Math.abs(hitPoint.x - col.box.max.x) < eps) normal.set(1, 0, 0);
          else if (Math.abs(hitPoint.x - col.box.min.x) < eps) normal.set(-1, 0, 0);
          else if (Math.abs(hitPoint.y - col.box.max.y) < eps) normal.set(0, 1, 0);
          else if (Math.abs(hitPoint.y - col.box.min.y) < eps) normal.set(0, -1, 0);
          else if (Math.abs(hitPoint.z - col.box.max.z) < eps) normal.set(0, 0, 1);
          else if (Math.abs(hitPoint.z - col.box.min.z) < eps) normal.set(0, 0, -1);
          hitNormal = normal;
        }
      }
    }

    return { hit: !!hitPoint, distance: closestDist, point: hitPoint, normal: hitNormal, object: hitObject };
  }

  // Height query for road bridges (Sea Link) or ground
  getGroundHeight(x, z) {
    // Check Sea Link bridge span (e.g. from z = -120 to z = -320, x between -80 and -40)
    // We will register ramps and bridges
    for (let i = 0; i < this.ramps.length; i++) {
      const r = this.ramps[i];
      if (x >= r.box.min.x && x <= r.box.max.x && z >= r.box.min.z && z <= r.box.max.z) {
        // Linear height interpolation along ramp direction
        if (r.direction === 'z') {
          const t = (z - r.box.min.z) / (r.box.max.z - r.box.min.z);
          return r.box.min.y + t * r.height;
        } else if (r.direction === '-z') {
          const t = 1.0 - (z - r.box.min.z) / (r.box.max.z - r.box.min.z);
          return r.box.min.y + t * r.height;
        } else if (r.direction === 'x') {
          const t = (x - r.box.min.x) / (r.box.max.x - r.box.min.x);
          return r.box.min.y + t * r.height;
        }
      }
    }

    // Default ground level
    return 0.0;
  }
}
