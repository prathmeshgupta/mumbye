// MUMBYE: MAXIMUM CITY - Chor Bazaar Black Market & Chop Shop UI
export class BlackMarketUI {
  constructor(game) {
    this.game = game;
    this.isOpen = false;
    this.currentTab = 'sell'; // 'sell' or 'buy'
    this.modalEl = null;

    this.shopQuotes = [
      "No receipts, no questions asked, bhai!",
      "Chor Bazaar special: pure 24 karat smuggled goods.",
      "AstraCorp technology sells like hot vada pav in the underworld.",
      "Bring more data drives, the hackers in Dharavi pay top rupee!"
    ];

    this.init();
  }

  init() {
    this.modalEl = document.createElement('div');
    this.modalEl.id = 'black-market-modal';
    this.modalEl.className = 'mumbye-modal';
    this.modalEl.style.display = 'none';

    this.modalEl.innerHTML = `
      <div class="market-backdrop"></div>
      <div class="market-container">
        <div class="market-header">
          <div class="market-badge">CHOR BAZAAR UNDERWORLD</div>
          <h2 class="market-title">KHADIM'S CHOP SHOP & FENCE</h2>
          <div class="market-subtitle">Contraband Trade, Drone Tuning & Weapon Modifications</div>
          <button class="market-close-btn" id="market-close">✕</button>
        </div>

        <div class="market-tabs">
          <button class="market-tab-btn active" id="tab-sell-btn">💰 SELL CONTRABAND & LOOT</button>
          <button class="market-tab-btn" id="tab-buy-btn">⚡ BUY GEAR & DRONE UPGRADES</button>
        </div>

        <div class="market-body" id="market-body-content">
          <!-- Dynamically populated -->
        </div>

        <div class="market-footer">
          <div class="market-cash-badge">Wallet: <span id="market-player-cash">₹ 0</span></div>
          <div class="market-tip">Press [ESC] to Exit Shop</div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modalEl);

    // Event listeners
    this.modalEl.querySelector('#market-close')?.addEventListener('click', () => this.close());
    this.modalEl.querySelector('.market-backdrop')?.addEventListener('click', () => this.close());

    this.modalEl.querySelector('#tab-sell-btn')?.addEventListener('click', () => {
      this.currentTab = 'sell';
      this.updateTabs();
      this.renderContent();
    });

    this.modalEl.querySelector('#tab-buy-btn')?.addEventListener('click', () => {
      this.currentTab = 'buy';
      this.updateTabs();
      this.renderContent();
    });

    window.addEventListener('mumbye_open_black_market', () => {
      this.open();
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  updateTabs() {
    const sellBtn = this.modalEl.querySelector('#tab-sell-btn');
    const buyBtn = this.modalEl.querySelector('#tab-buy-btn');
    if (this.currentTab === 'sell') {
      sellBtn?.classList.add('active');
      buyBtn?.classList.remove('active');
    } else {
      buyBtn?.classList.add('active');
      sellBtn?.classList.remove('active');
    }
  }

  open() {
    this.isOpen = true;
    this.modalEl.style.display = 'flex';
    this.game.input?.exitPointerLock();
    this.game.audioEngine?.playShopChime();
    this.updateTabs();
    this.renderContent();
  }

  close() {
    this.isOpen = false;
    this.modalEl.style.display = 'none';
  }

  renderContent() {
    const player = this.game.player;
    if (!player) return;

    // Update cash
    const cashEl = this.modalEl.querySelector('#market-player-cash');
    if (cashEl) cashEl.innerText = `₹ ${player.cash.toLocaleString('en-IN')}`;

    const bodyEl = this.modalEl.querySelector('#market-body-content');
    if (!bodyEl) return;

    if (this.currentTab === 'sell') {
      const items = (player.inventory || []).filter(i => i.count > 0);

      if (items.length === 0) {
        bodyEl.innerHTML = `
          <div class="market-empty-state">
            <div class="empty-icon">🎒</div>
            <div class="empty-title">Your Contraband Bag is Empty!</div>
            <div class="empty-sub">Collect dropped loot from downed targets, shoot down Metro Security Interceptor Drones, or find antique artifacts across Maximum City.</div>
          </div>
        `;
        return;
      }

      let html = `<div class="market-items-grid">`;
      items.forEach(item => {
        html += `
          <div class="market-card">
            <div class="card-icon">${item.id === 'data_drive' ? '💾' : item.id === 'stolen_watch' ? '⌚' : item.id === 'antique_necklace' ? '📿' : '⚙️'}</div>
            <div class="card-info">
              <div class="card-title">${item.name}</div>
              <div class="card-sub">In Bag: <strong>${item.count}</strong> &nbsp;|&nbsp; Value: ₹${item.value} each</div>
            </div>
            <div class="card-actions">
              <button class="market-btn-sell" data-item="${item.id}" data-action="single">Sell 1 (₹${item.value})</button>
              ${item.count > 1 ? `<button class="market-btn-sell-all" data-item="${item.id}" data-action="all">Sell All (₹${item.value * item.count})</button>` : ''}
            </div>
          </div>
        `;
      });
      html += `</div>`;
      bodyEl.innerHTML = html;

      // Attach sell buttons
      bodyEl.querySelectorAll('.market-btn-sell, .market-btn-sell-all').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.getAttribute('data-item');
          const isAll = e.target.getAttribute('data-action') === 'all';
          this.sellItem(id, isAll);
        });
      });
    } else {
      // Buy Upgrades & Tactical Mods
      const upgrades = [
        {
          id: 'suppressor',
          title: 'Tactical Carbon Suppressor',
          icon: '🔇',
          desc: 'Silences all gunfire. Reduces Metro Security wanted level alert rate by 80%.',
          cost: 1000,
          owned: player.hasSuppressor
        },
        {
          id: 'ammo_pack',
          title: 'Heavy Underworld Ammo Crate',
          icon: '📦',
          desc: 'Refills +60 rounds for Katta, Pistol, and Underworld AK-47.',
          cost: 450,
          owned: false
        },
        {
          id: 'drone_battery',
          title: 'Graphene Drone Battery Cell',
          icon: '🔋',
          desc: 'Overclocks SkyEye drone power grid (+100% flight duration before recharge).',
          cost: 2000,
          owned: player.droneBatteryMultiplier > 1.2
        },
        {
          id: 'emp_coil',
          title: 'High-Voltage EMP Amplifier Coil',
          icon: '⚡',
          desc: 'Doubles SkyEye drone EMP shockwave blast radius & instantly drains enemy vehicle ignition.',
          cost: 2500,
          owned: player.droneTaserMultiplier > 1.2
        },
        {
          id: 'nitro_kit',
          title: 'Reusable Nitrous Oxide Kit',
          icon: '🚀',
          desc: 'Installs reusable high-thrust Nitro injectors on all operated cars and speedboats [Shift].',
          cost: 1500,
          owned: player.hasNitroKit
        }
      ];

      let html = `<div class="market-items-grid">`;
      upgrades.forEach(upg => {
        const canAfford = player.cash >= upg.cost;
        html += `
          <div class="market-card">
            <div class="card-icon">${upg.icon}</div>
            <div class="card-info">
              <div class="card-title">${upg.title}</div>
              <div class="card-sub">${upg.desc}</div>
              <div class="card-price">Cost: <strong>₹ ${upg.cost.toLocaleString('en-IN')}</strong></div>
            </div>
            <div class="card-actions">
              ${upg.owned ? `
                <button class="market-btn-owned" disabled>OWNED ✓</button>
              ` : `
                <button class="market-btn-buy" data-upgrade="${upg.id}" ${canAfford ? '' : 'disabled'}>
                  ${canAfford ? `BUY (₹${upg.cost})` : 'NEED CASH'}
                </button>
              `}
            </div>
          </div>
        `;
      });
      html += `</div>`;
      bodyEl.innerHTML = html;

      // Attach buy buttons
      bodyEl.querySelectorAll('.market-btn-buy').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.getAttribute('data-upgrade');
          this.buyUpgrade(id);
        });
      });
    }
  }

  sellItem(id, sellAll = false) {
    const player = this.game.player;
    if (!player) return;

    let item = player.inventory.find(i => i.id === id);
    if (!item || item.count <= 0) return;

    const countToSell = sellAll ? item.count : 1;
    const payout = item.value * countToSell;

    item.count -= countToSell;
    player.cash += payout;

    this.game.audioEngine?.playShopKaching();

    const quote = this.shopQuotes[Math.floor(Math.random() * this.shopQuotes.length)];
    window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
      detail: { speaker: "Khadim Bhai (Fence)", text: `Sold ${countToSell}x ${item.name} for ₹${payout}! ${quote}` }
    }));

    this.renderContent();
  }

  buyUpgrade(id) {
    const player = this.game.player;
    if (!player) return;

    if (id === 'suppressor' && player.cash >= 1000) {
      player.cash -= 1000;
      player.hasSuppressor = true;
      this.game.audioEngine?.playShopKaching();
      window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
        detail: { speaker: "Khadim Bhai (Gunsmith)", text: "Suppressor attached! Gunshots are now completely silent to Metro Security." }
      }));
    } else if (id === 'ammo_pack' && player.cash >= 450) {
      player.cash -= 450;
      player.weapons.forEach(w => {
        if (w.type === 'gun' && w.ammo !== Infinity) {
          w.ammo = Math.min(w.maxAmmo || 100, w.ammo + 60);
        }
      });
      this.game.audioEngine?.playShopKaching();
      window.dispatchEvent(new CustomEvent('mumbye_ammo_changed', { detail: player.getCurrentWeapon() }));
      window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
        detail: { speaker: "Khadim Bhai", text: "Ammo restocked! Keep the lead flying." }
      }));
    } else if (id === 'drone_battery' && player.cash >= 2000) {
      player.cash -= 2000;
      player.droneBatteryMultiplier = 2.0;
      if (this.game.drone) this.game.drone.batteryDischargeRate = 1.8; // Halved consumption
      this.game.audioEngine?.playShopKaching();
      window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
        detail: { speaker: "Khadim Bhai (Tuner)", text: "Graphene cell installed! SkyEye drone battery now lasts twice as long." }
      }));
    } else if (id === 'emp_coil' && player.cash >= 2500) {
      player.cash -= 2500;
      player.droneTaserMultiplier = 2.0;
      this.game.audioEngine?.playShopKaching();
      window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
        detail: { speaker: "Khadim Bhai (Tuner)", text: "High-Voltage EMP coil wired! Stun blasts now wipe out all nearby circuits." }
      }));
    } else if (id === 'nitro_kit' && player.cash >= 1500) {
      player.cash -= 1500;
      player.hasNitroKit = true;
      const vehicles = this.game.trafficManager?.getAllVehicles() || [];
      vehicles.forEach(v => { v.hasNitro = true; });
      this.game.audioEngine?.playShopKaching();
      window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
        detail: { speaker: "Khadim Bhai (Mechanic)", text: "Nitrous Oxide kit active! Hold [Shift] while driving any car or speedboat for extreme boost." }
      }));
    }

    this.renderContent();
  }
}
