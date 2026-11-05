// MUMBYE: MAXIMUM CITY - Interactive Bambaiya Smartphone
import { DYNAMIC_BOUNTIES } from '../missions/MissionsData.js';

export class PhoneUI {
  constructor(game) {
    this.game = game;
    this.isOpen = false;
    this.currentApp = 'home'; // 'home', 'contacts', 'cheats', 'radio', 'bounties', 'stocks'
    this.container = null;

    this.cheatsList = [
      { code: 'PAISA', desc: 'Add ₹10,000 Cash' },
      { code: 'SEHAT', desc: 'Full Health & 100 Armor' },
      { code: 'HATHIYAR', desc: 'Unlock All Weapons & Max Ammo' },
      { code: 'POLICEHATAO', desc: 'Clear All Wanted Stars' },
      { code: 'HEAT5', desc: '5-Star Heat (Interceptor Drones & Cruisers)' },
      { code: 'BOAT', desc: 'Teleport to Colaba Harbor Speedboat Basin' },
      { code: 'CHOP', desc: 'Teleport to Chor Bazaar Black Market Shop' },
      { code: 'DRONE', desc: 'Instant Deploy SkyEye Drone' },
      { code: 'HELI', desc: 'Teleport to AstraCorp Helipad' },
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
    } else if (this.currentApp === 'bounties') {
      this.renderBountiesScreen();
    } else if (this.currentApp === 'stocks') {
      this.renderStocksScreen();
    } else if (this.currentApp === 'properties') {
      this.renderPropertiesScreen();
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
            <button class="phone-app-icon" id="app-drone">
              <div class="icon-box icon-cyan">🛸</div>
              <span>SkyEye</span>
            </button>
            <button class="phone-app-icon" id="app-bounties">
              <div class="icon-box icon-gold">🎯</div>
              <span>Bounties</span>
            </button>
            <button class="phone-app-icon" id="app-stocks">
              <div class="icon-box icon-emerald">📈</div>
              <span>Stocks</span>
            </button>
            <button class="phone-app-icon" id="app-cheats">
              <div class="icon-box icon-purple">⚡</div>
              <span>Cheats</span>
            </button>
            <button class="phone-app-icon" id="app-properties">
              <div class="icon-box" style="background: #e11d48;">🏠</div>
              <span>Estates</span>
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
    document.getElementById('app-drone')?.addEventListener('click', () => {
      this.close();
      window.dispatchEvent(new CustomEvent('mumbye_toggle_drone'));
    });
    document.getElementById('app-bounties')?.addEventListener('click', () => {
      this.currentApp = 'bounties';
      this.render();
    });
    document.getElementById('app-stocks')?.addEventListener('click', () => {
      this.currentApp = 'stocks';
      this.render();
    });
    document.getElementById('app-cheats')?.addEventListener('click', () => {
      this.currentApp = 'cheats';
      this.render();
    });
    document.getElementById('app-properties')?.addEventListener('click', () => {
      this.currentApp = 'properties';
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
              <div class="contact-name">Metro Security Legal</div>
              <div class="contact-sub">Post Bail Bond (-₹500)</div>
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
          detail: { speaker: "Metro Security", text: "Bail bond processed! Wanted status revoked." }
        }));
      } else {
        window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
          detail: { speaker: "Metro Security", text: "Insufficient funds for bail bond (₹500 required)." }
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
    } else if (code === 'HEAT5') {
      g.policeSystem.setWantedLevel(5);
      this.showCheatAlert("CHEAT ACTIVATED: 5-Star Wanted Level! Interceptors Dispatched!");
    } else if (code === 'BOAT') {
      g.player.position.set(280, 0.4, 110);
      g.player.velocity.set(0, 0, 0);
      this.showCheatAlert("CHEAT ACTIVATED: Teleported to Colaba Harbor Pier!");
    } else if (code === 'CHOP') {
      g.player.position.set(95, 0.2, 27);
      g.player.velocity.set(0, 0, 0);
      this.showCheatAlert("CHEAT ACTIVATED: Teleported to Chor Bazaar Black Market!");
    } else if (code === 'DRONE') {
      g.toggleDrone();
      this.showCheatAlert("CHEAT ACTIVATED: SkyEye Drone Deployed!");
    } else if (code === 'HELI') {
      g.player.position.set(240, 68.8, -78);
      g.player.velocity.set(0, 0, 0);
      this.showCheatAlert("CHEAT ACTIVATED: Teleported to AstraCorp Helipad!");
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

  renderBountiesScreen() {
    const listHtml = DYNAMIC_BOUNTIES.map(b => `
      <div class="bounty-card" data-id="${b.id}">
        <div class="bounty-top">
          <span class="bounty-title">${b.title}</span>
          <span class="bounty-payout">₹${b.payout}</span>
        </div>
        <div class="bounty-district">📍 ${b.district} • ⏱️ ${b.timer}s limit</div>
        <div class="bounty-desc">${b.description}</div>
        <button class="bounty-accept-btn" data-id="${b.id}">ACCEPT CONTRACT</button>
      </div>
    `).join('');

    this.container.innerHTML = `
      <div class="phone-frame">
        <div class="phone-status-bar">
          <span>Bambaiya Bounties</span>
          <span>${this.formatGameTime()}</span>
          <button class="phone-back-btn" id="phone-back">◀ Home</button>
        </div>
        <div class="phone-screen phone-list-screen">
          <div class="phone-section-title">⚡ ACTIVE MINI-CONTRACTS</div>
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

    this.container.querySelectorAll('.bounty-accept-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        const bounty = DYNAMIC_BOUNTIES.find(b => b.id === id);
        if (bounty) {
          this.close();
          this.game.missionManager?.startBounty(bounty);
        }
      });
    });
  }

  renderStocksScreen() {
    const stocks = [
      { sym: 'VADA', name: 'VadaPav Corp', price: 142.50, change: '+5.4%', up: true },
      { sym: 'ASTRA', name: 'AstraCorp Cybernetics', price: 840.10, change: '+12.8%', up: true },
      { sym: 'LRL', name: 'LocalRailways Suburban', price: 68.20, change: '-1.4%', up: false },
      { sym: 'BNTR', name: 'Bandra Motors Nitro', price: 320.00, change: '+8.2%', up: true },
      { sym: 'MBY', name: 'Mumbye Coin Crypto', price: 4120.00, change: '+24.5%', up: true }
    ];

    const listHtml = stocks.map(s => `
      <div class="stock-card">
        <div class="stock-top">
          <span class="stock-sym">${s.sym}</span>
          <span class="stock-price">₹${s.price.toFixed(2)}</span>
        </div>
        <div class="stock-bottom">
          <span class="stock-name">${s.name}</span>
          <span class="stock-change ${s.up ? 'stk-up' : 'stk-down'}">${s.change}</span>
        </div>
      </div>
    `).join('');

    this.container.innerHTML = `
      <div class="phone-frame">
        <div class="phone-status-bar">
          <span>Bazaar Ticker</span>
          <span>${this.formatGameTime()}</span>
          <button class="phone-back-btn" id="phone-back">◀ Home</button>
        </div>
        <div class="phone-screen phone-list-screen">
          <div class="phone-section-title">📊 MUMBAI STOCK EXCHANGE</div>
          ${listHtml}
          <div class="stock-actions">
            <button class="invest-btn" id="btn-quick-invest">💰 Quick Invest ₹1,000</button>
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

    document.getElementById('btn-quick-invest')?.addEventListener('click', () => {
      if (this.game.player.cash < 1000) {
        this.showCheatAlert("Insufficient funds to invest ₹1,000.");
        return;
      }
      this.game.player.cash -= 1000;
      const profitRate = (Math.random() * 0.4) - 0.1; // -10% to +30%
      const profit = Math.round(1000 * (1 + profitRate));
      setTimeout(() => {
        this.game.player.cash += profit;
        this.game.audioEngine?.playCoinCash();
        this.showCheatAlert(`Bazaar Dividend Received: ₹${profit} (${profitRate >= 0 ? '+' : ''}${Math.round(profitRate * 100)}%)`);
      }, 1500);
    });
  }

  renderPropertiesScreen() {
    const properties = this.game.propertyManager?.getAllProperties() || [];
    const playerCash = this.game.player?.cash || 0;

    const listHtml = properties.map(p => {
      const isOwned = p.isOwned;
      const canAfford = playerCash >= p.price;
      const perks = [];
      if (p.perks.hasWeaponsLocker) perks.push('🔫 Gun Locker');
      if (p.perks.hasRespawnBed) perks.push('🛏️ Respawn Bed');
      if (p.perks.hasGarage) perks.push('🏎️ Vehicle Bay');
      if (p.perks.dailyRevenue > 0) perks.push(`💰 +₹${p.perks.dailyRevenue}/min`);

      return `
        <div class="bounty-card" style="border-left: 3px solid ${isOwned ? '#10b981' : '#f59e0b'};" data-id="${p.id}">
          <div class="bounty-top">
            <span class="bounty-title" style="font-size: 13px;">${p.name}</span>
            <span class="bounty-payout" style="color: ${isOwned ? '#10b981' : '#f59e0b'};">
              ${isOwned ? 'OWNED' : '₹' + p.price.toLocaleString('en-IN')}
            </span>
          </div>
          <div class="bounty-district">📍 ${p.district} • ${p.type.toUpperCase()}</div>
          <div class="bounty-desc" style="margin-bottom: 6px;">${p.description}</div>
          <div style="font-size: 10px; color: #94a3b8; margin-bottom: 8px;">${perks.join(' • ')}</div>
          <div style="display: flex; gap: 6px;">
            ${!isOwned ? `
              <button class="bounty-accept-btn prop-buy-btn" data-id="${p.id}" ${canAfford ? '' : 'disabled style="opacity:0.5; cursor:not-allowed;"'}>
                ${canAfford ? 'PURCHASE ESTATE' : 'CANNOT AFFORD'}
              </button>
            ` : `
              <button class="bounty-accept-btn prop-gps-btn" data-id="${p.id}" style="background: #10b981;">
                📍 SET GPS DESTINATION
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');

    this.container.innerHTML = `
      <div class="phone-frame">
        <div class="phone-status-bar">
          <span>MumbAI Real Estate</span>
          <span>${this.formatGameTime()}</span>
          <button class="phone-back-btn" id="phone-back">◀ Home</button>
        </div>
        <div class="phone-screen phone-list-screen">
          <div class="phone-section-title">🏠 PROPERTIES & SAFEHOUSE NETWORK</div>
          <div style="font-size: 10px; color: #cbd5e1; padding: 0 10px 8px;">
            Cash Balance: <span style="color: #10b981; font-weight: bold;">₹${playerCash.toLocaleString('en-IN')}</span>
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

    this.container.querySelectorAll('.prop-buy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const success = this.game.propertyManager?.buyProperty(id, this.game.player);
        if (success) {
          this.renderPropertiesScreen();
        }
      });
    });

    this.container.querySelectorAll('.prop-gps-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const prop = this.game.propertyManager?.getProperty(id);
        if (prop && this.game.missionManager) {
          this.game.missionManager.customWaypoint = prop.exteriorPos.clone();
          this.showCheatAlert(`GPS waypoint set to ${prop.name}!`);
          this.close();
        }
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
