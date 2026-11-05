// MUMBYE: MAXIMUM CITY - Application Entry Point
import { Engine } from './engine/Engine.js';

window.addEventListener('DOMContentLoaded', () => {
  const startOverlay = document.getElementById('start-overlay');
  const startBtn = document.getElementById('start-game-btn');

  let engine = null;

  startBtn.addEventListener('click', () => {
    // Hide start overlay
    startOverlay.style.opacity = '0';
    startOverlay.style.transition = 'opacity 0.4s ease';
    setTimeout(() => {
      startOverlay.style.display = 'none';
    }, 400);

    // Initialize Game Engine
    engine = new Engine();
    window.mumbyeGame = engine; // Exposed for debugging and DLCs

    // Start audio context & engine loop
    engine.audioEngine.ensureContext();
    engine.start();

    // Welcome dialog message
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
        detail: {
          speaker: "Babu Bhaiyya",
          text: "Welcome to Maximum City Kabir! Press 'P' to open your phone, or 'M' to manage DLCs!"
        }
      }));
    }, 1000);
  });
});
