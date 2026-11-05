// MUMBYE: MAXIMUM CITY - Comprehensive Pause, Settings & Map System
export class PauseMenu {
  constructor(game) {
    this.game = game;
    this.isOpen = false;
    this.activeTab = 'map'; // 'map', 'graphics', 'audio', 'gameplay', 'controls'
    this.container = null;
    this.mapCanvas = null;

    // Settings state
    this.shadowsEnabled = true;
    this.showFps = true;
    this.renderScale = 1.0;
    this.mouseSensitivity = 1.0;
    this.invertY = false;

    this.fps = 60;
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();

    this.init();
  }

  init() {
    this.container = document.getElementById('pause-menu-modal');

    // ESC key toggles pause menu
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        // If DLC modal or controls modal is open, let them handle it first
        if (this.game.uiManager?.dlcModal?.isOpen) {
          this.game.uiManager.dlcModal.close();
          return;
        }
        if (this.game.uiManager?.phone?.isOpen) {
          this.game.uiManager.phone.close();
          return;
        }
        this.toggle();
      }
    });

    const menuBtn = document.getElementById('hud-menu-btn');
    if (menuBtn) {
      menuBtn.addEventListener('click', () => this.toggle());
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    if (document.exitPointerLock) {
      document.exitPointerLock();
    }
    if (this.container) {
      this.container.style.display = 'flex';
      this.render();
    }
  }

  close() {
    this.isOpen = false;
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  updateFps() {
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate >= 500) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;

      const fpsEl = document.getElementById('hud-fps-counter');
      if (fpsEl) {
        fpsEl.innerText = `${this.fps} FPS`;
        fpsEl.style.display = this.showFps ? 'block' : 'none';
      }
    }
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="pause-menu-box">
        <div class="pause-header">
          <div class="pause-logo">
            <span class="logo-title">MUMBYE</span>
            <span class="logo-sub">MAXIMUM CITY • PAUSE & SETTINGS</span>
          </div>
          <div class="pause-tabs">
            <button class="ptab ${this.activeTab === 'map' ? 'active' : ''}" data-tab="map">🗺️ CITY MAP</button>
            <button class="ptab ${this.activeTab === 'graphics' ? 'active' : ''}" data-tab="graphics">🖥️ GRAPHICS</button>
            <button class="ptab ${this.activeTab === 'audio' ? 'active' : ''}" data-tab="audio">🔊 AUDIO</button>
            <button class="ptab ${this.activeTab === 'gameplay' ? 'active' : ''}" data-tab="gameplay">⚙️ GAME & TIME</button>
            <button class="ptab ${this.activeTab === 'controls' ? 'active' : ''}" data-tab="controls">🎮 CONTROLS</button>
          </div>
          <button class="pause-close-btn" id="pause-close-btn">✖ RESUME (ESC)</button>
        </div>

        <div class="pause-body">
          ${this.renderActiveTabContent()}
        </div>

        <div class="pause-footer">
          <div class="pause-footer-stats">
            <span>Health: <b>${Math.round(this.game.player?.health || 100)}%</b></span>
            <span>Cash: <b>₹${(this.game.player?.cash || 0).toLocaleString('en-IN')}</b></span>
            <span>Wanted Heat: <b>${this.game.policeSystem?.wantedLevel || 0} / 5 Stars</b></span>
          </div>
          <div class="pause-footer-actions">
            <button class="pause-action-btn btn-respawn" id="btn-hospital-respawn">🏥 Respawn at Hospital</button>
            <button class="pause-action-btn btn-resume" id="btn-resume-game">▶ RESUME GAME</button>
          </div>
        </div>
      </div>
    `;

    // Bind tab clicks
    this.container.querySelectorAll('.ptab').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.getAttribute('data-tab');
        this.render();
      });
    });

    document.getElementById('pause-close-btn')?.addEventListener('click', () => this.close());
    document.getElementById('btn-resume-game')?.addEventListener('click', () => this.close());

    document.getElementById('btn-hospital-respawn')?.addEventListener('click', () => {
      this.close();
      this.game.policeSystem.setWantedLevel(0);
      this.game.policeSystem.clearPolice();
      this.game.player.respawn(20, -30);
      this.game.cameraManager.yaw = 0;
      this.game.cameraManager.pitch = 0.25;
      window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
        detail: { speaker: "Metro General Hospital", text: "Emergency medical transport completed. Wanted heat cleared." }
      }));
    });

    // Post-render tab handlers
    if (this.activeTab === 'map') {
      this.renderFullMapCanvas();
    } else if (this.activeTab === 'graphics') {
      this.bindGraphicsHandlers();
    } else if (this.activeTab === 'audio') {
      this.bindAudioHandlers();
    } else if (this.activeTab === 'gameplay') {
      this.bindGameplayHandlers();
    }
  }

  renderActiveTabContent() {
    if (this.activeTab === 'map') {
      return `
        <div class="map-view-container">
          <div class="map-sidebar">
            <h3>📍 MUMBAI DISTRICTS</h3>
            <ul>
              <li><span class="dot dot-blue"></span> <b>Marine Drive:</b> Seaside Queen's Necklace promenade</li>
              <li><span class="dot dot-cyan"></span> <b>BKC Cyber City:</b> Neon skyscrapers, skybridges & Helipad</li>
              <li><span class="dot dot-gold"></span> <b>Gateway of India:</b> Historic stone arch & plaza</li>
              <li><span class="dot dot-orange"></span> <b>Bhendi & Chor Bazaar:</b> Dense alleys, markets & chop-shops</li>
              <li><span class="dot dot-cyan"></span> <b>Bandra-Worli Sea Link:</b> 4-lane cable suspension bridge</li>
              <li><span class="dot dot-red"></span> <b>CST Railway Corridor:</b> Moving suburban local trains</li>
              <li><span class="dot dot-green"></span> <b>Metro General Hospital:</b> Emergency medical facility</li>
              <li><span class="dot dot-gold"></span> <b>Colaba Freight Docks:</b> Shipping containers & maritime cranes</li>
              <li><span class="dot dot-vada"></span> <b>Vada Pav Tapris:</b> Steaming food stalls (Restore 100 HP)</li>
            </ul>
            <div class="map-hint">💡 Blinking white arrow represents Kabir's current position and heading.</div>
          </div>
          <div class="map-canvas-wrapper">
            <canvas id="full-map-canvas" width="600" height="420"></canvas>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'graphics') {
      return `
        <div class="settings-grid">
          <div class="settings-card">
            <h4>🖥️ VISUAL & RENDERING OPTIONS</h4>
            <div class="s-row">
              <label>Dynamic Shadows (Lighting)</label>
              <select id="setting-shadows" class="s-select">
                <option value="true" ${this.shadowsEnabled ? 'selected' : ''}>Enabled (Crisp Lighting)</option>
                <option value="false" ${!this.shadowsEnabled ? 'selected' : ''}>Disabled (Maximum 60+ FPS)</option>
              </select>
            </div>
            <div class="s-row">
              <label>Display FPS Counter</label>
              <select id="setting-fps" class="s-select">
                <option value="true" ${this.showFps ? 'selected' : ''}>On</option>
                <option value="false" ${!this.showFps ? 'selected' : ''}>Off</option>
              </select>
            </div>
            <div class="s-row">
              <label>Render Resolution Scale</label>
              <select id="setting-render-scale" class="s-select">
                <option value="0.75" ${this.renderScale === 0.75 ? 'selected' : ''}>Performance (0.75x)</option>
                <option value="1.0" ${this.renderScale === 1.0 ? 'selected' : ''}>Balanced 1080p (1.0x)</option>
                <option value="1.5" ${this.renderScale === 1.5 ? 'selected' : ''}>Ultra Sharp (1.5x)</option>
              </select>
            </div>
          </div>
          <div class="settings-card">
            <h4>🛡️ COMPATIBILITY & OVERRIDES</h4>
            <div class="s-row">
              <label>Dark Reader Shield</label>
              <span class="badge-status badge-active">Active (Lock Injected)</span>
            </div>
            <div class="s-hint">
              Protects game HUD, 3D Canvas, and UI from browser dark mode extension color inversions.
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'audio') {
      const ae = this.game.audioEngine;
      const currentStation = ae?.currentRadioStation || 0;
      return `
        <div class="settings-grid">
          <div class="settings-card">
            <h4>🔊 AUDIO & VOLUME CONTROLS</h4>
            <div class="s-row">
              <label>Master Volume</label>
              <input type="range" id="vol-master" min="0" max="100" value="75" class="s-slider">
            </div>
            <div class="s-row">
              <label>Sound Effects & Engines</label>
              <input type="range" id="vol-sfx" min="0" max="100" value="80" class="s-slider">
            </div>
            <div class="s-row">
              <label>Radio Stations & Music</label>
              <input type="range" id="vol-music" min="0" max="100" value="70" class="s-slider">
            </div>
          </div>
          <div class="settings-card">
            <h4>📻 LIVE MUMBYE RADIO CHANNELS</h4>
            <div class="s-row">
              <label>Active Station</label>
              <select id="setting-radio-station" class="s-select">
                <option value="0" ${currentStation === 0 ? 'selected' : ''}>Radio OFF</option>
                <option value="1" ${currentStation === 1 ? 'selected' : ''}>Bombay Disco 98.3 (Bollywood Funk)</option>
                <option value="2" ${currentStation === 2 ? 'selected' : ''}>Gully Beat 104.8 (Mumbai Hip Hop)</option>
                <option value="3" ${currentStation === 3 ? 'selected' : ''}>Marine Drive Chill 92.7 (Chillwave)</option>
                <option value="4" ${currentStation === 4 ? 'selected' : ''}>Dhol Tasha 101.2 (Ganpati Energy)</option>
                <option value="5" ${currentStation === 5 ? 'selected' : ''}>Cyber BKC 107.5 (Futuristic Synthwave)</option>
              </select>
            </div>
            <div class="s-hint">
              Procedurally synthesized audio engine. Switch radio channels anytime in vehicles by pressing <b>R</b>.
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'gameplay') {
      const weather = this.game.weather;
      return `
        <div class="settings-grid">
          <div class="settings-card">
            <h4>🌤️ TIME & ENVIRONMENT</h4>
            <div class="s-row">
              <label>Time of Day Preset</label>
              <select id="setting-time-preset" class="s-select">
                <option value="6.5">Morning Sunrise (6:30 AM)</option>
                <option value="12.0">Midday Sunshine (12:00 PM)</option>
                <option value="17.8" selected>Golden Sunset over Arabian Sea (5:45 PM)</option>
                <option value="22.5">Cyberpunk Mumbai Night (10:30 PM)</option>
              </select>
            </div>
            <div class="s-row">
              <label>Weather Condition</label>
              <select id="setting-weather-preset" class="s-select">
                <option value="sunset" ${weather?.currentWeather === 'sunset' ? 'selected' : ''}>Golden Sunset</option>
                <option value="clear" ${weather?.currentWeather === 'clear' ? 'selected' : ''}>Clear Skies</option>
                <option value="monsoon" ${weather?.currentWeather === 'monsoon' ? 'selected' : ''}>Mumbai Monsoon Storm (Rain & Lightning)</option>
              </select>
            </div>
          </div>
          <div class="settings-card">
            <h4>🎮 CAMERA & INPUT CONTROLS</h4>
            <div class="s-row">
              <label>Mouse Look Sensitivity</label>
              <input type="range" id="setting-sensitivity" min="5" max="30" value="12" class="s-slider">
            </div>
            <div class="s-hint">
              You can also pan the camera using <b>Arrow Keys</b> at any time without moving your mouse!
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'controls') {
      return `
        <div class="controls-view">
          <div class="ctrl-group">
            <h4>🚶 ON FOOT</h4>
            <div class="ctrl-row"><span>WASD</span> Move Kabir</div>
            <div class="ctrl-row"><span>Shift</span> Sprint</div>
            <div class="ctrl-row"><span>Space</span> Jump</div>
            <div class="ctrl-row"><span>Left Click / F</span> Attack / Fire Weapon</div>
            <div class="ctrl-row"><span>Right Click</span> Aim Crosshair Over Shoulder</div>
            <div class="ctrl-row"><span>1 - 6 / Q / Wheel</span> Switch Weapon</div>
            <div class="ctrl-row"><span>E</span> Enter Vehicle / Eat Vada Pav</div>
          </div>
          <div class="ctrl-group">
            <h4>🛺 VEHICLES</h4>
            <div class="ctrl-row"><span>W / Up</span> Gas</div>
            <div class="ctrl-row"><span>S / Down</span> Brake / Reverse</div>
            <div class="ctrl-row"><span>A / D</span> Steer</div>
            <div class="ctrl-row"><span>Space</span> Handbrake & Drift</div>
            <div class="ctrl-row"><span>Shift</span> Nitro Boost (Bandra DLC)</div>
            <div class="ctrl-row"><span>H</span> Mumbai Horn / Siren</div>
            <div class="ctrl-row"><span>R</span> Cycle Radio Station</div>
            <div class="ctrl-row"><span>T</span> Taxi Driver Fares Mode</div>
            <div class="ctrl-row"><span>E</span> Exit Vehicle</div>
          </div>
          <div class="ctrl-group">
            <h4>📱 SHORTCUTS</h4>
            <div class="ctrl-row"><span>P</span> Open Bambaiya Smartphone</div>
            <div class="ctrl-row"><span>ESC</span> Open Pause & Settings Menu</div>
            <div class="ctrl-row"><span>M</span> Open DLC & Mod Manager</div>
            <div class="ctrl-row"><span>B</span> "Bhai Time" Bullet Time (Action DLC)</div>
            <div class="ctrl-row"><span>Arrow Keys</span> Pan Camera Independently</div>
          </div>
        </div>
      `;
    }
  }

  renderFullMapCanvas() {
    const canvas = document.getElementById('full-map-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Coordinate mapping: World (-120 to +180 in X, -340 to +200 in Z)
    const mapScale = 0.85;
    const originX = 140;
    const originY = 240;

    const toScreenX = (wx) => originX + wx * mapScale;
    const toScreenY = (wz) => originY + wz * mapScale;

    // Arabian Sea (West of x = -60)
    ctx.fillStyle = '#0a3d62';
    ctx.fillRect(0, 0, toScreenX(-60), h);

    // City Land Base
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(toScreenX(-60), 0, w - toScreenX(-60), h);

    // Roads Grid
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';

    // Vertical Avenues
    [-50, 20, 90, 160, 240].forEach(rx => {
      ctx.beginPath();
      ctx.moveTo(toScreenX(rx), toScreenY(-180));
      ctx.lineTo(toScreenX(rx), toScreenY(180));
      ctx.stroke();
    });

    // Horizontal Streets
    [-180, -120, -60, 0, 60, 120].forEach(rz => {
      ctx.beginPath();
      ctx.moveTo(toScreenX(-50), toScreenY(rz));
      ctx.lineTo(toScreenX(300), toScreenY(rz));
      ctx.stroke();
    });

    // Bandra-Worli Sea Link Bridge
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(toScreenX(-50), toScreenY(-140));
    ctx.lineTo(toScreenX(-50), toScreenY(-340));
    ctx.stroke();

    // Railway Line
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(toScreenX(40), toScreenY(-180));
    ctx.lineTo(toScreenX(40), toScreenY(180));
    ctx.stroke();
    ctx.setLineDash([]);

    // Landmark Icons & Labels
    const landmarks = [
      { name: "🌊 Marine Drive", x: -50, z: 0, color: "#38bdf8" },
      { name: "🏛️ Gateway Plaza", x: -20, z: 150, color: "#facc15" },
      { name: "🏙️ Chor Bazaar", x: 90, z: 0, color: "#fb923c" },
      { name: "🛸 BKC Cyber Hub", x: 240, z: -80, color: "#06b6d4" },
      { name: "🚁 AstraCorp Helipad", x: 240, z: -60, color: "#a855f7" },
      { name: "⚓ Colaba Docks", x: 240, z: 120, color: "#f59e0b" },
      { name: "🌉 Sea Link", x: -50, z: -240, color: "#38bdf8" },
      { name: "🚆 CST Station", x: 40, z: 30, color: "#f87171" },
      { name: "🏥 Metro Hospital", x: 20, z: -30, color: "#4ade80" },
      { name: "🛺 Vada Pav", x: -48, z: -10, color: "#eab308" }
    ];

    landmarks.forEach(lm => {
      const sx = toScreenX(lm.x);
      const sy = toScreenY(lm.z);

      ctx.fillStyle = lm.color;
      ctx.beginPath();
      ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = '#f1f5f9';
      ctx.fillText(lm.name, sx + 6, sy + 3);
    });

    // Draw Player Blip
    const playerPos = this.game.player?.position;
    if (playerPos) {
      const px = toScreenX(playerPos.x);
      const py = toScreenY(playerPos.z);
      const yaw = this.game.cameraManager?.yaw || 0;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-yaw);

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(-6, 7);
      ctx.lineTo(0, 3);
      ctx.lineTo(6, 7);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    }
  }

  bindGraphicsHandlers() {
    document.getElementById('setting-shadows')?.addEventListener('change', (e) => {
      this.shadowsEnabled = e.target.value === 'true';
      if (this.game.renderer) {
        this.game.renderer.shadowMap.enabled = this.shadowsEnabled;
        this.game.scene.traverse(obj => {
          if (obj.material) obj.material.needsUpdate = true;
        });
      }
    });

    document.getElementById('setting-fps')?.addEventListener('change', (e) => {
      this.showFps = e.target.value === 'true';
      const fpsEl = document.getElementById('hud-fps-counter');
      if (fpsEl) fpsEl.style.display = this.showFps ? 'block' : 'none';
    });

    document.getElementById('setting-render-scale')?.addEventListener('change', (e) => {
      this.renderScale = parseFloat(e.target.value);
      if (this.game.renderer) {
        this.game.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.renderScale));
        this.game.renderer.setSize(window.innerWidth, window.innerHeight);
      }
    });
  }

  bindAudioHandlers() {
    const ae = this.game.audioEngine;
    document.getElementById('vol-master')?.addEventListener('input', (e) => {
      const val = e.target.value / 100;
      if (ae?.masterGain?.gain) ae.masterGain.gain.setValueAtTime(val, ae.ctx.currentTime);
    });

    document.getElementById('vol-sfx')?.addEventListener('input', (e) => {
      const val = e.target.value / 100;
      if (ae?.sfxGain?.gain) ae.sfxGain.gain.setValueAtTime(val, ae.ctx.currentTime);
    });

    document.getElementById('vol-music')?.addEventListener('input', (e) => {
      const val = e.target.value / 100;
      if (ae?.musicGain?.gain) ae.musicGain.gain.setValueAtTime(val, ae.ctx.currentTime);
    });

    document.getElementById('setting-radio-station')?.addEventListener('change', (e) => {
      const idx = parseInt(e.target.value);
      ae?.setRadioStation(idx);
    });
  }

  bindGameplayHandlers() {
    document.getElementById('setting-time-preset')?.addEventListener('change', (e) => {
      const hour = parseFloat(e.target.value);
      this.game.weather.setTimeOfDay(hour);
    });

    document.getElementById('setting-weather-preset')?.addEventListener('change', (e) => {
      const type = e.target.value;
      this.game.weather.setWeather(type);
    });

    document.getElementById('setting-sensitivity')?.addEventListener('input', (e) => {
      const mult = e.target.value / 10;
      this.game.cameraManager.sensitivity = 0.0024 * mult;
    });
  }
}
