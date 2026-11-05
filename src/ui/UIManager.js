// MUMBYE: MAXIMUM CITY - Master HUD & UI Manager
import { Minimap } from './Minimap.js';
import { PhoneUI } from './PhoneUI.js';
import { DLCModal } from './DLCModal.js';
import { DialogBox } from './DialogBox.js';
import { PauseMenu } from './PauseMenu.js';
import { BlackMarketUI } from './BlackMarketUI.js';

export class UIManager {
  constructor(game) {
    this.game = game;

    // Sub-components
    this.minimap = null;
    this.phone = null;
    this.dlcModal = null;
    this.dialogBox = null;
    this.pauseMenu = null;
    this.blackMarketUI = null;

    // HUD Elements
    this.healthBar = null;
    this.armorBar = null;
    this.staminaBar = null;
    this.cashDisplay = null;
    this.wantedContainer = null;
    this.weaponNameEl = null;
    this.weaponAmmoEl = null;
    this.speedometerContainer = null;
    this.speedValueEl = null;
    this.nitroBarEl = null;
    this.actionPromptEl = null;
    this.radioPillEl = null;

    this.displayedCash = 0;

    this.init();
  }

  init() {
    const canvas = document.getElementById('minimap-canvas');
    if (canvas) this.minimap = new Minimap(canvas);

    this.phone = new PhoneUI(this.game);
    this.dlcModal = new DLCModal(this.game.dlcManager);
    this.dialogBox = new DialogBox();
    this.pauseMenu = new PauseMenu(this.game);
    this.blackMarketUI = new BlackMarketUI(this.game);

    // Cache HUD DOM references
    this.healthBar = document.getElementById('hud-health-fill');
    this.armorBar = document.getElementById('hud-armor-fill');
    this.staminaBar = document.getElementById('hud-stamina-fill');
    this.cashDisplay = document.getElementById('hud-cash-value');
    this.wantedContainer = document.getElementById('hud-wanted-stars');
    this.weaponNameEl = document.getElementById('hud-weapon-name');
    this.weaponAmmoEl = document.getElementById('hud-weapon-ammo');
    this.speedometerContainer = document.getElementById('hud-speedometer');
    this.speedValueEl = document.getElementById('hud-speed-val');
    this.nitroBarEl = document.getElementById('hud-nitro-fill');
    this.actionPromptEl = document.getElementById('hud-action-prompt');
    this.radioPillEl = document.getElementById('hud-radio-pill');

    this.initEventListeners();
  }

  initEventListeners() {
    window.addEventListener('mumbye_cash_collected', (e) => {
      if (this.game.player) {
        this.game.player.cash += e.detail.amount;
      }
    });

    window.addEventListener('mumbye_radio_changed', (e) => {
      this.showRadioPill(e.detail.name, e.detail.genre);
    });

    window.addEventListener('mumbye_neighborhood_entered', (e) => {
      this.showNeighborhoodBanner(e.detail);
    });

    // Instructions toggle
    document.getElementById('hud-help-btn')?.addEventListener('click', () => {
      const help = document.getElementById('controls-modal');
      if (help) help.style.display = help.style.display === 'none' ? 'flex' : 'none';
    });
    document.getElementById('help-close-btn')?.addEventListener('click', () => {
      const help = document.getElementById('controls-modal');
      if (help) help.style.display = 'none';
    });
  }

  showRadioPill(name, genre) {
    if (!this.radioPillEl) return;
    this.radioPillEl.innerHTML = `
      <div class="radio-pill-icon">📻</div>
      <div>
        <div class="radio-pill-title">${name}</div>
        <div class="radio-pill-sub">${genre}</div>
      </div>
    `;
    this.radioPillEl.style.opacity = '1';
    setTimeout(() => {
      if (this.radioPillEl) this.radioPillEl.style.opacity = '0';
    }, 3200);
  }

  showNeighborhoodBanner(district) {
    let el = document.getElementById('hud-district-banner');
    if (!el) {
      el = document.createElement('div');
      el.id = 'hud-district-banner';
      document.body.appendChild(el);
    }
    el.innerHTML = `
      <div class="district-badge" style="border-left-color: ${district.color || '#06b6d4'}">
        <div class="district-title">📍 ${district.name}</div>
        <div class="district-sub">${district.sub}</div>
      </div>
    `;
    el.classList.add('show-banner');
    setTimeout(() => {
      el.classList.remove('show-banner');
    }, 3800);
  }

  setActionPrompt(text) {
    if (!this.actionPromptEl) return;
    if (text) {
      this.actionPromptEl.innerHTML = text;
      this.actionPromptEl.style.display = 'block';
    } else {
      this.actionPromptEl.style.display = 'none';
    }
  }

  update(delta) {
    if (this.pauseMenu) {
      this.pauseMenu.updateFps();
    }

    const player = this.game.player;
    if (!player) return;

    // Health, Armor, Stamina
    if (this.healthBar) {
      const hpPercent = Math.max(0, Math.min(100, player.health));
      this.healthBar.style.width = hpPercent + '%';
      this.healthBar.style.background = hpPercent > 30 ? '#22c55e' : '#ef4444';
    }

    if (this.armorBar) {
      const armPercent = Math.max(0, Math.min(100, player.armor));
      this.armorBar.style.width = armPercent + '%';
    }

    if (this.staminaBar) {
      const stamPercent = Math.max(0, Math.min(100, player.stamina));
      this.staminaBar.style.width = stamPercent + '%';
    }

    // Cash slot increment
    if (this.cashDisplay) {
      if (this.displayedCash !== player.cash) {
        const factor = Math.min(1.0, delta * 10);
        this.displayedCash = Math.round(this.displayedCash + (player.cash - this.displayedCash) * factor);
        this.cashDisplay.innerText = `₹ ${this.displayedCash.toLocaleString('en-IN')}`;
      }
    }

    // Wanted Stars (1 to 5)
    if (this.wantedContainer) {
      const stars = this.wantedContainer.querySelectorAll('.star');
      const lvl = this.game.policeSystem.wantedLevel;
      const isBlink = Math.floor(Date.now() / 300) % 2 === 0;

      stars.forEach((star, idx) => {
        if (idx < lvl) {
          star.classList.add('star-active');
          if (isBlink) star.classList.add('star-blink');
          else star.classList.remove('star-blink');
        } else {
          star.classList.remove('star-active', 'star-blink');
        }
      });
    }

    // Weapon HUD
    const weapon = player.getCurrentWeapon();
    if (weapon && this.weaponNameEl && this.weaponAmmoEl) {
      this.weaponNameEl.innerText = weapon.name;
      this.weaponAmmoEl.innerText = weapon.ammo === Infinity ? '∞' : weapon.ammo;
    }

    // In-Vehicle Speedometer & Nitro
    if (player.isDriving && player.currentVehicle) {
      if (this.speedometerContainer) this.speedometerContainer.style.display = 'flex';
      const kmh = Math.round(Math.abs(player.currentVehicle.speed) * 3.6);
      if (this.speedValueEl) this.speedValueEl.innerText = kmh;

      if (this.nitroBarEl) {
        const nitroPercent = player.currentVehicle.nitroFuel || 0;
        this.nitroBarEl.style.width = nitroPercent + '%';
        this.nitroBarEl.parentElement.style.display = player.currentVehicle.hasNitro ? 'block' : 'none';
      }
    } else {
      if (this.speedometerContainer) this.speedometerContainer.style.display = 'none';
    }

    // Action Prompts (detect nearest vehicle or food stall)
    this.updateContextPrompts(player);

    // Update Minimap
    if (this.minimap) {
      const activeMission = this.game.missionManager.getActiveMission();
      const currentCp = activeMission ? activeMission.checkpoints[this.game.missionManager.currentCheckpointIndex] : null;
      const missionTarget = currentCp?.target || null;

      this.minimap.render(
        player.position,
        this.game.cameraManager.yaw,
        this.game.cityMap,
        missionTarget,
        this.game.policeSystem.policeOfficers,
        this.game.trafficManager.vehicles
      );
    }

    // Update Mission timer in dialog
    if (this.game.missionManager.activeMission && this.game.missionManager.missionTimer > 0) {
      this.dialogBox.updateTimer(this.game.missionManager.missionTimer);
    }
  }

  updateContextPrompts(player) {
    if (this.game.drone?.isActive) {
      const drone = this.game.drone;
      this.setActionPrompt(`🛸 SKYEYE DRONE &nbsp;|&nbsp; BATTERY: ${Math.round(drone.battery)}% &nbsp;|&nbsp; SIGNAL: ${drone.signalStrength}% &nbsp;|&nbsp; ALT: ${Math.round(drone.position.y)}M &nbsp;|&nbsp; [Left Click] EMP Dart &nbsp;|&nbsp; [U] Recall`);
      return;
    }

    if (player.isDriving) {
      if (player.currentVehicle?.type === 'helicopter') {
        this.setActionPrompt("[E] Exit Helicopter &nbsp;|&nbsp; [Space/Shift] Altitude Climb &nbsp;|&nbsp; [WASD] Pitch & Rudder");
      } else if (player.currentVehicle?.type === 'speedboat') {
        this.setActionPrompt("[E] Dock / Exit Speedboat &nbsp;|&nbsp; [WASD] Throttle & Rudder &nbsp;|&nbsp; [Shift] Nitro Boost &nbsp;|&nbsp; [Space] Hydro-Brake");
      } else {
        this.setActionPrompt("[E] Exit Vehicle &nbsp;|&nbsp; [H] Horn &nbsp;|&nbsp; [R] Radio");
      }
      return;
    }

    // Check near Black Market Shop counter
    const blackMarketShops = this.game.cityMap?.blackMarketShops || [];
    for (let i = 0; i < blackMarketShops.length; i++) {
      const shop = blackMarketShops[i];
      if (player.position.distanceTo(shop.position) < 3.2) {
        this.setActionPrompt(`[E] Open ${shop.label}`);
        return;
      }
    }

    // Check near speedboat
    const speedboats = this.game.speedboats || [];
    for (let i = 0; i < speedboats.length; i++) {
      const boat = speedboats[i];
      if (boat.isDestroyed) continue;
      if (player.position.distanceTo(boat.position) < 4.8) {
        this.setActionPrompt(`[E] Board ${boat.name}`);
        return;
      }
    }

    // Check near helicopter
    if (this.game.helicopter && !this.game.helicopter.isDestroyed) {
      if (player.position.distanceTo(this.game.helicopter.position) < 5.0) {
        this.setActionPrompt("[E] Board Sky-Ranger Helicopter");
        return;
      }
    }

    // Check near elevator pads
    const elevatorPads = this.game.cityMap?.elevatorPads || [];
    for (let i = 0; i < elevatorPads.length; i++) {
      const pad = elevatorPads[i];
      if (player.position.distanceTo(pad.position) < 2.5) {
        this.setActionPrompt(`[E] Take ${pad.userData.label}`);
        return;
      }
    }

    // Check near interactive stall
    const stalls = this.game.cityMap?.props?.interactiveStalls || [];
    for (let i = 0; i < stalls.length; i++) {
      const s = stalls[i];
      if (player.position.distanceTo(s.position) < 2.8) {
        this.setActionPrompt(`[E] Eat Garam Vada Pav (₹${s.cost}) to restore Health`);
        return;
      }
    }

    // Check near vehicle
    const vehicles = this.game.trafficManager.getAllVehicles();
    let nearVeh = null;
    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];
      if (v.isDestroyed) continue;
      if (player.position.distanceTo(v.position) < 3.8) {
        nearVeh = v;
        break;
      }
    }

    if (nearVeh) {
      const typeLabel = nearVeh.type === 'auto' ? 'Auto Rickshaw' : nearVeh.type === 'taxi' ? 'Kaali-Peeli Taxi' : nearVeh.type === 'bus' ? 'BEST Bus' : 'Vehicle';
      this.setActionPrompt(`[E] Enter ${typeLabel}`);
      return;
    }

    this.setActionPrompt(null);
  }
}
