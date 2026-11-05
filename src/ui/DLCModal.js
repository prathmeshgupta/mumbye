// MUMBYE: MAXIMUM CITY - In-Game DLC & Mod Manager UI
export class DLCModal {
  constructor(dlcManager) {
    this.dlcManager = dlcManager;
    this.isOpen = false;
    this.modalEl = null;

    this.init();
  }

  init() {
    this.modalEl = document.getElementById('dlc-modal');

    window.addEventListener('mumbye_open_dlc_modal', () => this.open());

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyM' && !e.ctrlKey && !e.metaKey) {
        this.toggle();
      }
      if (e.code === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    const trigger = document.getElementById('hud-dlc-btn');
    if (trigger) {
      trigger.addEventListener('click', () => this.toggle());
    }
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  open() {
    this.isOpen = true;
    if (this.modalEl) {
      this.modalEl.style.display = 'flex';
      this.render();
    }
  }

  close() {
    this.isOpen = false;
    if (this.modalEl) {
      this.modalEl.style.display = 'none';
    }
  }

  render() {
    if (!this.modalEl) return;

    const dlcs = this.dlcManager.getAllDLCs();

    const dlcCards = dlcs.map(d => `
      <div class="dlc-card ${d.enabled ? 'dlc-enabled' : ''}">
        <div class="dlc-card-header">
          <div>
            <span class="dlc-badge">${d.badge || 'DLC'}</span>
            <span class="dlc-title">${d.title}</span>
            <span class="dlc-version">v${d.version || '1.0'}</span>
          </div>
          <label class="switch">
            <input type="checkbox" class="dlc-toggle" data-id="${d.id}" ${d.enabled ? 'checked' : ''}>
            <span class="slider round"></span>
          </label>
        </div>
        <div class="dlc-author">By ${d.author || 'Mumbye Studios'}</div>
        <div class="dlc-desc">${d.description}</div>
      </div>
    `).join('');

    this.modalEl.innerHTML = `
      <div class="dlc-modal-content">
        <div class="dlc-modal-header">
          <div class="dlc-header-title">🧩 MUMBYE EXPANSION & DLC MANAGER</div>
          <button class="dlc-close-btn" id="dlc-close-btn">✖</button>
        </div>

        <div class="dlc-tabs">
          <button class="dlc-tab active" id="tab-installed">Installed DLCs (${dlcs.length})</button>
          <button class="dlc-tab" id="tab-modder">Create / Install Custom DLC</button>
        </div>

        <div class="dlc-tab-body" id="dlc-body-installed">
          <div class="dlc-grid">
            ${dlcCards}
          </div>
        </div>

        <div class="dlc-tab-body" id="dlc-body-modder" style="display:none;">
          <div class="modder-instructions">
            <b>Make your own DLC for Mumbye:</b> Paste custom JavaScript DLC code below and click "Load & Activate Mod" to inject it directly into the running game!
          </div>
          <div class="modder-actions">
            <button class="modder-btn" id="load-template-btn">📄 Insert Boilerplate Template</button>
          </div>
          <textarea class="modder-code-editor" id="custom-dlc-code" placeholder="// Paste or write your custom DLC code here..."></textarea>
          <div class="modder-footer">
            <button class="dlc-install-btn" id="install-custom-dlc-btn">⚡ Install & Activate DLC Mod</button>
            <span id="dlc-install-status"></span>
          </div>
        </div>
      </div>
    `;

    // Close button
    document.getElementById('dlc-close-btn')?.addEventListener('click', () => this.close());

    // Tabs
    const tabInstalled = document.getElementById('tab-installed');
    const tabModder = document.getElementById('tab-modder');
    const bodyInstalled = document.getElementById('dlc-body-installed');
    const bodyModder = document.getElementById('dlc-body-modder');

    tabInstalled?.addEventListener('click', () => {
      tabInstalled.classList.add('active');
      tabModder?.classList.remove('active');
      bodyInstalled.style.display = 'block';
      bodyModder.style.display = 'none';
    });

    tabModder?.addEventListener('click', () => {
      tabModder.classList.add('active');
      tabInstalled?.classList.remove('active');
      bodyInstalled.style.display = 'none';
      bodyModder.style.display = 'block';
    });

    // DLC ON/OFF Toggles
    this.modalEl.querySelectorAll('.dlc-toggle').forEach(el => {
      el.addEventListener('change', (e) => {
        const id = el.getAttribute('data-id');
        if (e.target.checked) {
          this.dlcManager.enableDLC(id);
        } else {
          this.dlcManager.disableDLC(id);
        }
        this.render();
      });
    });

    // Modder Template button
    document.getElementById('load-template-btn')?.addEventListener('click', () => {
      const editor = document.getElementById('custom-dlc-code');
      if (editor) {
        editor.value = this.dlcManager.getBoilerplateTemplate();
      }
    });

    // Install Custom DLC button
    document.getElementById('install-custom-dlc-btn')?.addEventListener('click', () => {
      const code = document.getElementById('custom-dlc-code')?.value;
      const statusEl = document.getElementById('dlc-install-status');
      if (!code) return;

      const res = this.dlcManager.loadDLCFromScript(code);
      if (res.success) {
        if (statusEl) {
          statusEl.style.color = '#22c55e';
          statusEl.innerText = '✅ Custom DLC installed and activated successfully!';
        }
        setTimeout(() => {
          tabInstalled?.click();
          this.render();
        }, 1200);
      } else {
        if (statusEl) {
          statusEl.style.color = '#ef4444';
          statusEl.innerText = '❌ Error: ' + res.error;
        }
      }
    });
  }
}
