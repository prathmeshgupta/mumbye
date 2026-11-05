// MUMBYE: MAXIMUM CITY - Dialog Subtitles & GTA Mission Banners
export class DialogBox {
  constructor() {
    this.container = document.getElementById('dialog-container');
    this.bannerContainer = document.getElementById('gta-banner-container');
    this.objectiveBar = document.getElementById('objective-bar');

    this.activeDialogQueue = [];
    this.isDisplaying = false;
    this.currentTimeout = null;

    this.init();
  }

  init() {
    window.addEventListener('mumbye_dialog_message', (e) => {
      const { speaker, text } = e.detail;
      this.showDialog(speaker, text);
    });

    window.addEventListener('mumbye_cutscene_dialog', (e) => {
      const { title, dialogs } = e.detail;
      this.playCutsceneDialogs(title, dialogs);
    });

    window.addEventListener('mumbye_mission_completed', (e) => {
      const { title, rewardCash, message } = e.detail;
      this.showBanner('MISSION PASSED', `₹${rewardCash || 0} REWARD`, '#facc15');
      this.clearObjective();
    });

    window.addEventListener('mumbye_mission_failed', (e) => {
      const { reason } = e.detail;
      this.showBanner('MISSION FAILED', reason || 'You failed the objective', '#ef4444');
      this.clearObjective();
    });

    window.addEventListener('mumbye_player_wasted', () => {
      this.showBanner('WASTED', 'Respawning at Hospital...', '#dc2626');
    });

    window.addEventListener('mumbye_checkpoint_reached', (e) => {
      const cp = e.detail?.checkpoint;
      if (cp) this.setObjective(cp.text, cp.timer);
    });

    window.addEventListener('mumbye_mission_started', (e) => {
      const cp = e.detail?.checkpoint;
      if (cp) this.setObjective(cp.text, cp.timer);
    });
  }

  showDialog(speaker, text, duration = 4.0) {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="dialog-card">
        <div class="dialog-speaker">${speaker}</div>
        <div class="dialog-text">"${text}"</div>
      </div>
    `;
    this.container.style.display = 'block';

    if (this.currentTimeout) clearTimeout(this.currentTimeout);
    this.currentTimeout = setTimeout(() => {
      this.container.style.display = 'none';
    }, duration * 1000);
  }

  playCutsceneDialogs(title, dialogs) {
    let index = 0;
    const playNext = () => {
      if (index >= dialogs.length) return;
      const d = dialogs[index];
      this.showDialog(d.speaker, d.text, 3.5);
      index++;
      setTimeout(playNext, 3800);
    };
    playNext();
  }

  setObjective(text, timer = 0) {
    if (!this.objectiveBar) return;
    this.objectiveBar.style.display = 'flex';
    this.objectiveBar.innerHTML = `
      <div class="objective-icon">🎯</div>
      <div class="objective-text">${text}</div>
      ${timer > 0 ? `<div class="objective-timer" id="obj-timer">${Math.ceil(timer)}s</div>` : ''}
    `;
  }

  updateTimer(secondsRemaining) {
    const el = document.getElementById('obj-timer');
    if (el) {
      el.innerText = Math.max(0, Math.ceil(secondsRemaining)) + 's';
    }
  }

  clearObjective() {
    if (this.objectiveBar) {
      this.objectiveBar.style.display = 'none';
    }
  }

  showBanner(headline, subtext, color = '#facc15') {
    if (!this.bannerContainer) return;

    this.bannerContainer.innerHTML = `
      <div class="gta-banner-card">
        <div class="gta-banner-title" style="color: ${color}">${headline}</div>
        <div class="gta-banner-sub">${subtext}</div>
      </div>
    `;
    this.bannerContainer.style.display = 'flex';

    setTimeout(() => {
      this.bannerContainer.style.display = 'none';
    }, 4500);
  }
}
