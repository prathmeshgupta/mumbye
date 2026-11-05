// MUMBYE: MAXIMUM CITY - Circular Minimap & GPS Radar
import * as THREE from 'three';

export class Minimap {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.size = canvas.width;
    this.radius = this.size / 2;
    this.mapScale = 0.85; // Pixels per meter
  }

  render(playerPos, playerYaw, cityMap, missionTarget, policeOfficers, vehicles, properties, transitStations) {
    const ctx = this.ctx;
    const w = this.size;
    const h = this.size;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Save for circular clipping mask
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, this.radius - 4, 0, Math.PI * 2);
    ctx.clip();

    // Background: Arabian Sea (blue) & Land (dark grey)
    ctx.fillStyle = '#1c2128';
    ctx.fillRect(0, 0, w, h);

    if (!playerPos) {
      ctx.restore();
      return;
    }

    // World to minimap transformation centered on player
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-playerYaw); // Rotate radar with player heading

    // Draw Sea Coast (west of x = -60)
    const seaX = (-60 - playerPos.x) * this.mapScale;
    ctx.fillStyle = '#0f3854';
    ctx.fillRect(seaX - 400, -400, 400, 800);

    // Draw Roads (Grid lines)
    ctx.strokeStyle = '#383e4a';
    ctx.lineWidth = 10 * this.mapScale;
    ctx.lineCap = 'round';

    // Vertical Arterials
    [-50, 20, 90, 160].forEach(rx => {
      const screenX = (rx - playerPos.x) * this.mapScale;
      ctx.beginPath();
      ctx.moveTo(screenX, (-180 - playerPos.z) * this.mapScale);
      ctx.lineTo(screenX, (180 - playerPos.z) * this.mapScale);
      ctx.stroke();
    });

    // Horizontal Crossings
    [-120, -60, 0, 60, 120].forEach(rz => {
      const screenZ = (rz - playerPos.z) * this.mapScale;
      ctx.beginPath();
      ctx.moveTo((-50 - playerPos.x) * this.mapScale, screenZ);
      ctx.lineTo((160 - playerPos.x) * this.mapScale, screenZ);
      ctx.stroke();
    });

    // Bandra-Worli Sea Link Bridge
    ctx.strokeStyle = '#4e5666';
    ctx.lineWidth = 8 * this.mapScale;
    ctx.beginPath();
    ctx.moveTo((-50 - playerPos.x) * this.mapScale, (-140 - playerPos.z) * this.mapScale);
    ctx.lineTo((-50 - playerPos.x) * this.mapScale, (-420 - playerPos.z) * this.mapScale);
    ctx.stroke();

    // Railway Line (Dashed)
    ctx.strokeStyle = '#8a6547';
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo((40 - playerPos.x) * this.mapScale, (-180 - playerPos.z) * this.mapScale);
    ctx.lineTo((40 - playerPos.x) * this.mapScale, (180 - playerPos.z) * this.mapScale);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Food Stalls (Green Blips)
    if (cityMap?.props?.interactiveStalls) {
      ctx.fillStyle = '#22c55e';
      cityMap.props.interactiveStalls.forEach(s => {
        const sx = (s.position.x - playerPos.x) * this.mapScale;
        const sz = (s.position.z - playerPos.z) * this.mapScale;
        ctx.beginPath();
        ctx.arc(sx, sz, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw Safehouse Properties (Green = Owned, Gold = Available)
    if (properties) {
      properties.forEach(prop => {
        const px = (prop.exteriorPos.x - playerPos.x) * this.mapScale;
        const pz = (prop.exteriorPos.z - playerPos.z) * this.mapScale;
        const dist = Math.hypot(px, pz);
        if (dist < this.radius - 8) {
          ctx.fillStyle = prop.isOwned ? '#10b981' : '#f59e0b';
          ctx.beginPath();
          ctx.rect(px - 3, pz - 2, 6, 5);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(px - 4, pz - 2);
          ctx.lineTo(px, pz - 6);
          ctx.lineTo(px + 4, pz - 2);
          ctx.closePath();
          ctx.fill();
        }
      });
    }

    // Draw Railway Transit Stations (Red Circular Blip with White Rim)
    if (transitStations) {
      transitStations.forEach(st => {
        const sx = (st.platformX - playerPos.x) * this.mapScale;
        const sz = (st.z - playerPos.z) * this.mapScale;
        const dist = Math.hypot(sx, sz);
        if (dist < this.radius - 8) {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(sx, sz, 4.0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }
      });
    }

    // Draw Vehicles (Blue Blips)
    if (vehicles) {
      ctx.fillStyle = '#38bdf8';
      vehicles.forEach(v => {
        if (v.isPlayerDriving || v.isDestroyed) return;
        const vx = (v.position.x - playerPos.x) * this.mapScale;
        const vz = (v.position.z - playerPos.z) * this.mapScale;
        if (Math.hypot(vx, vz) < this.radius) {
          ctx.beginPath();
          ctx.arc(vx, vz, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // Draw Police (Flashing Red-Blue Blips)
    if (policeOfficers && policeOfficers.length > 0) {
      const isRed = Math.floor(Date.now() / 250) % 2 === 0;
      ctx.fillStyle = isRed ? '#ef4444' : '#3b82f6';
      policeOfficers.forEach(p => {
        const px = (p.mesh.position.x - playerPos.x) * this.mapScale;
        const pz = (p.mesh.position.z - playerPos.z) * this.mapScale;
        ctx.beginPath();
        ctx.arc(px, pz, 4.0, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw Mission Objective Blip (Yellow or Gold Star)
    if (missionTarget) {
      const tx = (missionTarget.x - playerPos.x) * this.mapScale;
      const tz = (missionTarget.z - playerPos.z) * this.mapScale;
      const dist = Math.hypot(tx, tz);

      // Clamp to edge of radar if out of view
      let drawX = tx;
      let drawZ = tz;
      if (dist > this.radius - 12) {
        const angle = Math.atan2(tz, tx);
        drawX = Math.cos(angle) * (this.radius - 12);
        drawZ = Math.sin(angle) * (this.radius - 12);
      }

      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(drawX, drawZ, 6.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore(); // Undo rotation and translation

    // Draw Center Player Arrow (pointing straight up)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 8);
    ctx.lineTo(cx - 6, cy + 7);
    ctx.lineTo(cx, cy + 3);
    ctx.lineTo(cx + 6, cy + 7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore(); // Undo circular clipping mask

    // Radar Outer Ring
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(cx, cy, this.radius - 2, 0, Math.PI * 2);
    ctx.stroke();

    // Cardinal Points (N, S, E, W)
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', cx + Math.sin(playerYaw) * (this.radius - 10), cy - Math.cos(playerYaw) * (this.radius - 10));
  }
}
