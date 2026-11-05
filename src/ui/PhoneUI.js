// MUMBYE: MAXIMUM CITY - Interactive Bambaiya Smartphone
export class PhoneUI {
  constructor(game) {
    this.game = game;
    this.isOpen = false;
    this.currentApp = 'home'; // 'home', 'contacts', 'cheats', 'radio'
    this.container = null;

    this.cheatsList = [
      { code: 'PAISA', desc: 'Add ₹10,000 Cash' },
      { code: 'SEHAT', desc: 'Full Health & 100 Armor' },
      { code: 'HATHIYAR', desc: 'Unlock All Weapons & Max Ammo' },
      { code: 'POLICEHATAO', desc: 'Clear All Wanted Stars' },
      { code: 'SUPERCAR', desc: 'Spawn Bollywood Supercar' },
      { code: 'AUTO', desc: 'Spawn Mumbai Auto Rickshaw' },
      { code: 'TAXI', desc: 'Spawn Kaali-Peeli Taxi' },
      { code: 'MONSOON', desc: 'Trigger Heavy Monsoon Weather' },
      { code: 'SUNSET', desc: 'Set Romantic Marine Drive Sunset' },
      { code: 'NITRO', desc: 'Infinite Nitro (Bandra DLC)' },
      { code: 'BHAITIME', desc: 'Bullet Time Slow-Mo (Action DLC)' }
    ];

    this.init();
  }

  init() {
    this.container = document.getElementById('smartphone-container');
    this.render();

    // Toggle key 'P'
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyP') {
        this.toggle();
      }
    });

    const phoneTrigger = document.getElementById('hud-phone-btn');
    if (phoneTrigger) {
      phoneTrigger.addEventListener('click', () => this.toggle());
    }
  }

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.container) {
      this.container.classList.toggle('phone-open', this.isOpen);
      if (this.isOpen) {
        this.currentApp = 'home';
        this.render();
      }
    }
  }

  close() {
    this.isOpen = false;
    if (this.container) {
      this.container.classList.remove('phone-open');
    }
  }

  render() {
    if (!this.container) return;

    if (this.currentApp === 'home') {
      this.renderHomeScreen();
    } else if (this.currentApp === 'contacts') {
      this.renderContactsScreen();
    } else if (this.currentApp === 'cheats') {
      this.renderCheatsScreen();
    } else if (this.currentApp === 'radio') {
      this.renderRadioScreen();
    }
  }

  renderHomeScreen() {
    this.container.innerHTML = `
      <div class="phone-frame">
        <div class="phone-notch"></div>
        <div class="phone-status-bar">
          <span>Mumbye 5G</span>
          <span>${this.formatGameTime()}</span>
          <span>100% 🔋</span>
        </div>
        <div class="phone-screen phone-home">
          <div class="phone-wallpaper-title">MUMBYE OS</div>
          <div class="phone-apps-grid">
            <button class="phone-app-icon" id="app-contacts">
              <div class="icon-box icon-green">📞</div>
              <span>Contacts</span>
            </button>
            <button class="phone-app-icon" id="app-cheats">
              <div class="icon-box icon-purple">⚡</div>
              <span>Cheats</span>
            </button>
            <button class="phone-app-icon" id="app-radio">
              <div class="icon-box icon-orange">📻</div>
              <span>Radio</span>
            </button>
            <button class="phone-app-icon" id="app-dlc">
              <div class="icon-box icon-blue">🧩</div>
              <span>DLCs</span>
            </button>
          </div>
        </div>
        <div class="phone-home-bar" id="phone-home-btn"></div>
      </div>
    `;

    document.getElementById('app-contacts')?.addEventListener('click', () => {
      this.currentApp = 'contacts';
      this.render();
    });
    document.getElementById('app-cheats')?.addEventListener('click', () => {
      this.currentApp = 'cheats';
      this.render();
    });
    document.getElementById('app-radio')?.addEventListener('click', () => {
      this.currentApp = 'radio';
      this.render();
    });
    document.getElementById('app-dlc')?.addEventListener('click', () => {
      this.close();
      window.dispatchEvent(new CustomEvent('mumbye_open_dlc_modal'));
    });
    document.getElementById('phone-home-btn')?.addEventListener('click', () => this.close());
  }

  renderContactsScreen() {
    this.container.innerHTML = `
      <div class="phone-frame">
        <div class="phone-status-bar">
          <span>Contacts</span>
          <span>${this.formatGameTime()}</span>
          <button class="phone-back-btn" id="phone-back">◀ Home</button>
        </div>
        <div class="phone-screen phone-list-screen">
          <div class="contact-card" id="call-babu">
            <div class="contact-avatar">👳</div>
            <div class="contact-info">
              <div class="contact-name">Babu Bhaiyya</div>
              <div class="contact-sub">Dadar Fixer & Missions</div>
            </div>
            <button class="call-btn">CALL</button>
          </div>
          <div class="contact-card" id="call-taxi">
            <div class="contact-avatar">🚖</div>
            <div class="contact-info">
              <div class="contact-name">Kaali-Peeli Dispatch</div>
              <div class="contact-sub">Order Taxi to Location</div>
            </div>
            <button class="call-btn">CALL</button>
          </div>
          <div class="contact-card" id="call-police">
            <div class="contact-avatar">👮</div>
            <div class="contact-info">
              <div class="contact-name">Mama Police Chowki</div>
              <div class="contact-sub">Pay Bribe (-₹500)</div>
            </div>
            <button class="call-btn">CALL</button>
          </div>
        </div>
        <div class="phone-home-bar" id="phone-home-btn"></div>
      </div>
    `;

    document.getElementById('phone-back')?.addEventListener('click', () => {
      this.currentApp = 'home';
      this.render();
    });
    document.getElementById('phone-home-btn')?.addEventListener('click', () => this.close());

    document.getElementById('call-babu')?.addEventListener('click', () => {
      this.close();
      this.game.missionManager.startStoryMission();
    });

    document.getElementById('call-taxi')?.addEventListener('click', () => {
      this.close();
      const p = this.game.player.position;
      this.game.trafficManager.spawnTrafficVehicle(p.x + 4, p.z + 4, 'taxi');
      window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
        detail: { speaker: "Dispatch", text: "Taxi arrived outside! Meter down ho gaya!" }
      }));
    });

    document.getElementById('call-police')?.addEventListener('click', () => {
      this.close();
      if (this.game.player.cash >= 500) {
        this.game.player.cash -= 500;
        this.game.policeSystem.setWantedLevel(0);
        window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
          detail: { speaker: "Mama Police", text: "Chalo mamla settle! Bhaag idhar se abhi!" }
        }));
      } else {
        window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
          detail: { speaker: "Mama Police", text: "₹500 nahi hai tere paas? Chal chowki!" }
        }));
      }
    });
  }

  renderCheatsScreen() {
    const listHtml = this.cheatsList.map(c => `
      <div class="cheat-item" data-code="${c.code}">
        <div class="cheat-title">${c.code}</div>
        <div class="cheat-desc">${c.desc}</div>
        <button class="activate-cheat-btn">APPLY</button>
      </div>
    `).join('');

    this.container.innerHTML = `
      <div class="phone-frame">
        <div class="phone-status-bar">
          <span>Bambaiya Cheats</span>
          <span>${this.formatGameTime()}</span>
          <button class="phone-back-btn" id="phone-back">◀ Home</button>
        </div>
        <div class="phone-screen phone-list-screen">
          ${listHtml}
        </div>
        <div class="phone-home-bar" id="phone-home-btn"></div>
      </div>
    `;

    document.getElementById('phone-back')?.addEventListener('click', () => {
      this.currentApp = 'home';
      this.render();
    });
    document.getElementById('phone-home-btn')?.addEventListener('click', () => this.close());

    this.container.querySelectorAll('.cheat-item').forEach(el => {
      el.addEventListener('click', () => {
        const code = el.getAttribute('data-code');
        this.applyCheat(code);
      });
    });
  }

  applyCheat(code) {
    this.close();
    const g = this.game;

    if (code === 'PAISA') {
      g.player.cash += 10000;
      g.audioEngine?.playCoinCash();
      this.showCheatAlert("CHEAT ACTIVATED: +₹10,000 Cash!");
    } else if (code === 'SEHAT') {
      g.player.health = 100;
      g.player.armor = 100;
      this.showCheatAlert("CHEAT ACTIVATED: Full Health & 100 Armor!");
    } else if (code === 'HATHIYAR') {
      g.player.weapons.forEach(w => w.ammo = w.maxAmmo || 100);
      g.player.equipWeapon(4); // pistol
      this.showCheatAlert("CHEAT ACTIVATED: All Weapons Loaded!");
    } else if (code === 'POLICEHATAO') {
      g.policeSystem.setWantedLevel(0);
      this.showCheatAlert("CHEAT ACTIVATED: Wanted Stars Cleared!");
    } else if (code === 'SUPERCAR') {
      const p = g.player.position;
      g.trafficManager.spawnTrafficVehicle(p.x + 3, p.z + 3, 'supercar');
      this.showCheatAlert("CHEAT ACTIVATED: Bollywood Supercar Spawned!");
    } else if (code === 'AUTO') {
      const p = g.player.position;
      g.trafficManager.spawnTrafficVehicle(p.x + 3, p.z + 3, 'auto');
      this.showCheatAlert("CHEAT ACTIVATED: Mumbai Auto Rickshaw Spawned!");
    } else if (code === 'TAXI') {
      const p = g.player.position;
      g.trafficManager.spawnTrafficVehicle(p.x + 3, p.z + 3, 'taxi');
      this.showCheatAlert("CHEAT ACTIVATED: Kaali-Peeli Taxi Spawned!");
    } else if (code === 'MONSOON') {
      g.weather.setWeather('monsoon');
      this.showCheatAlert("CHEAT ACTIVATED: Mumbai Monsoon Storm!");
    } else if (code === 'SUNSET') {
      g.weather.setWeather('sunset');
      this.showCheatAlert("CHEAT ACTIVATED: Golden Marine Drive Sunset!");
    } else {
      // Check DLC cheats
      const dlcHandled = g.dlcManager.executeCheat(code);
      if (!dlcHandled) {
        this.showCheatAlert("Cheat code not recognized: " + code);
      }
    }
  }

  renderRadioScreen() {
    const ae = this.game.audioEngine;
    const stations = ae?.radioStations || [];
    const current = ae?.currentRadioStation || 0;

    const listHtml = stations.map((s, idx) => `
      <div class="radio-station-card ${idx === current ? 'active-station' : ''}" data-index="${idx}">
        <div class="radio-name">${s.name}</div>
        <div class="radio-genre">${s.genre}</div>
      </div>
    `).join('');

    this.container.innerHTML = `
      <div class="phone-frame">
        <div class="phone-status-bar">
          <span>Mumbye Radio FM</span>
          <span>${this.formatGameTime()}</span>
          <button class="phone-back-btn" id="phone-back">◀ Home</button>
        </div>
        <div class="phone-screen phone-list-screen">
          <div class="radio-now-playing">
            <div>NOW PLAYING</div>
            <div class="radio-active-title">${stations[current]?.name || 'OFF'}</div>
          </div>
          ${listHtml}
        </div>
        <div class="phone-home-bar" id="phone-home-btn"></div>
      </div>
    `;

    document.getElementById('phone-back')?.addEventListener('click', () => {
      this.currentApp = 'home';
      this.render();
    });
    document.getElementById('phone-home-btn')?.addEventListener('click', () => this.close());

    this.container.querySelectorAll('.radio-station-card').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.getAttribute('data-index'));
        const newStation = this.game.audioEngine?.setRadioStation(idx);
        if (newStation) {
          window.dispatchEvent(new CustomEvent('mumbye_radio_changed', { detail: newStation }));
        }
        this.renderRadioScreen();
      });
    });
  }

  formatGameTime() {
    const hour = Math.floor(this.game.weather?.timeOfDay || 12);
    const minute = Math.floor(((this.game.weather?.timeOfDay || 12) % 1) * 60);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${minute < 10 ? '0' : ''}${minute} ${ampm}`;
  }

  showCheatAlert(text) {
    window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
      detail: { speaker: "Phone", text }
    }));
  }
}
