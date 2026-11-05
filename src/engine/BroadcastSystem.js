// MUMBYE: MAXIMUM CITY - Dynamic Radio Broadcast, DJ Banter & News Architecture
export class BroadcastSystem {
  constructor(game, audioEngine) {
    this.game = game;
    this.audioEngine = audioEngine;
    this.speechEnabled = true;
    this.isSpeaking = false;
    this.speechQueue = [];
    this.totalBroadcasts = 0;
    this.lastBroadcast = null;
    this.banterTimer = 25.0; // Trigger DJ banter periodically

    // DJ Personalities per Radio Station
    this.djProfiles = {
      1: { name: "RJ Rocky", style: "Bollywood Funk & Disco 98.3", pitch: 1.1, rate: 1.05 },
      2: { name: "MC Azad", style: "Gully Beat 104.8", pitch: 0.95, rate: 1.1 },
      3: { name: "Sagarika", style: "Marine Drive Chill 92.7", pitch: 1.0, rate: 0.9 },
      4: { name: "Dholak Master Bindaas", style: "Dhol Tasha 101.2", pitch: 1.2, rate: 1.15 },
      5: { name: "AstraCorp AI Announcer", style: "Cyber BKC 107.5", pitch: 0.85, rate: 0.95 }
    };

    // Ambient Commercial Ads & DJ Jokes
    this.ambientBanter = [
      "You are listening to Maximum City FM! Traffic is jammed at Dadar TT circle as usual, so turn up the volume!",
      "A reminder from our sponsors at Garam Vada Pav Dadar West: ₹15 me full energy, chutney extra spicy!",
      "Breaking stock update: AstraCorp Global shares fluctuate wildly today amid rumors of high-altitude drone activity in BKC.",
      "Looking for vintage watches and imported sound systems? Khadim's Chop Shop in Chor Bazaar says: No receipts, no problem!",
      "Weather department predicts heavy clouds moving over the Arabian Sea. Keep your wipers ready on the Sea Link, Mumbai!"
    ];

    this.initEventListeners();
  }

  initEventListeners() {
    // Reactive Wanted Level News Flashes
    window.addEventListener('mumbye_wanted_changed', (e) => {
      const level = e.detail.level;
      if (level === 5) {
        this.broadcastNews("EMERGENCY BULLETIN: Metro Security has initiated Code Red! Tactical Interceptor Drones authorized with live stun rounds across all districts!");
      } else if (level === 4) {
        this.broadcastNews("FLASH NEWS: High-speed pursuit underway on Eastern Freeway! Metro Security cruisers and aerial units are converging on suspect!");
      } else if (level === 3) {
        this.broadcastNews("Traffic Advisory: Metro Patrol sirens reported near Marine Drive. Motorists advised to clear outer lanes.");
      }
    });

    // Reactive Mission Story News
    window.addEventListener('mumbye_mission_completed', (e) => {
      const mission = e.detail.mission;
      this.broadcastNews(`City Newsflash: Underworld activity spikes following reports of a daring operation in ${mission.title || 'Central Mumbai'}. Citizens urged to remain alert.`);
    });

    // Reactive Weather News
    window.addEventListener('mumbye_weather_changed', (e) => {
      const weather = e.detail.weather;
      if (weather === 'monsoon') {
        this.broadcastNews("Mumbai Meteorological Alert: High tide warning along Queen's Necklace promenade! Drive safe on wet asphalt.");
      }
    });
  }

  broadcastNews(text) {
    this.queueBroadcast({
      speaker: "Maximum City Live News",
      text: text,
      isEmergency: true
    });
  }

  broadcastNewsFlash(text) {
    this.broadcastNews(text);
  }

  triggerDjBanter(stationId = null) {
    const station = stationId ?? (this.audioEngine?.currentRadioStation || 1);
    if (station <= 0) return;
    const dj = this.djProfiles[station] || { name: "Maximum City DJ" };
    const quote = this.ambientBanter[Math.floor(Math.random() * this.ambientBanter.length)];
    this.queueBroadcast({
      speaker: `${dj.name} (${this.audioEngine.radioStations?.[station]?.name || 'Radio'})`,
      text: quote,
      isEmergency: false
    });
  }

  queueBroadcast(item) {
    this.totalBroadcasts++;
    this.lastBroadcast = item;
    this.speechQueue.push(item);
    if (!this.isSpeaking) {
      this.processNextInQueue();
    }
  }

  processNextInQueue() {
    if (this.speechQueue.length === 0) {
      this.isSpeaking = false;
      return;
    }

    const item = this.speechQueue.shift();
    this.isSpeaking = true;

    // Dispatch visual UI news flash banner
    window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
      detail: { speaker: item.speaker, text: `📻 ${item.text}` }
    }));

    // Speech Synthesis voice-over (if supported & enabled)
    if (this.speechEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // Cancel any lingering utterances

        const utterance = new SpeechSynthesisUtterance(item.text);
        const currentStation = this.audioEngine?.currentRadioStation || 1;
        const dj = this.djProfiles[currentStation] || this.djProfiles[1];

        utterance.pitch = dj.pitch;
        utterance.rate = dj.rate;

        // Auto-duck music gain slightly during voice announcement
        if (this.audioEngine?.musicGain && this.audioEngine.ctx) {
          this.audioEngine.musicGain.gain.setTargetAtTime(0.12, this.audioEngine.ctx.currentTime, 0.1);
        }

        utterance.onend = () => {
          // Restore music gain smoothly
          if (this.audioEngine?.musicGain && this.audioEngine.ctx) {
            this.audioEngine.musicGain.gain.setTargetAtTime(0.35, this.audioEngine.ctx.currentTime, 0.2);
          }
          this.processNextInQueue();
        };

        utterance.onerror = () => {
          if (this.audioEngine?.musicGain && this.audioEngine.ctx) {
            this.audioEngine.musicGain.gain.setTargetAtTime(0.35, this.audioEngine.ctx.currentTime, 0.2);
          }
          this.processNextInQueue();
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        this.processNextInQueue();
      }
    } else {
      setTimeout(() => {
        this.processNextInQueue();
      }, 3500);
    }
  }

  update(delta) {
    if (!this.speechEnabled) return;

    // Periodic ambient DJ banter between music tracks
    this.banterTimer -= delta;
    if (this.banterTimer <= 0) {
      this.banterTimer = 45.0 + Math.random() * 30.0;
      const currentStation = this.audioEngine?.currentRadioStation || 0;
      if (currentStation > 0) {
        const dj = this.djProfiles[currentStation] || { name: "Maximum City DJ" };
        const quote = this.ambientBanter[Math.floor(Math.random() * this.ambientBanter.length)];
        this.queueBroadcast({
          speaker: `${dj.name} (${this.audioEngine.radioStations[currentStation]?.name || 'Radio'})`,
          text: quote,
          isEmergency: false
        });
      }
    }
  }
}
