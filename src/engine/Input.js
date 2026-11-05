// MUMBYE: MAXIMUM CITY - Input Manager
// Supports Keyboard, Mouse (with optional pointer lock), and Touch Virtual Joysticks

export class Input {
  constructor() {
    this.keys = {};
    this.mouse = {
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      leftDown: false,
      rightDown: false,
      isPointerLocked: false
    };

    // Normalized directional axes
    this.moveForward = 0;
    this.moveRight = 0;
    this.isSprinting = false;
    this.isJumping = false;
    this.isBraking = false;
    this.isAiming = false;
    this.isFiring = false;

    // Single trigger events (consumed once per frame/action)
    this.justPressed = {};

    this.touchEnabled = false;
    this.touchJoysticks = {
      move: { active: false, startX: 0, startY: 0, currX: 0, currY: 0, dirX: 0, dirY: 0 },
      look: { active: false, startX: 0, startY: 0, currX: 0, currY: 0, dirX: 0, dirY: 0 }
    };

    this.init();
  }

  init() {
    window.addEventListener('keydown', (e) => {
      const code = e.code;
      if (!this.keys[code]) {
        this.justPressed[code] = true;
      }
      this.keys[code] = true;

      // Prevent scrolling on space / arrows
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement) {
        this.mouse.dx += e.movementX;
        this.mouse.dy += e.movementY;
      } else {
        // Fallback relative tracking
        this.mouse.dx = e.movementX || 0;
        this.mouse.dy = e.movementY || 0;
      }
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.mouse.leftDown = true;
        this.justPressed['Mouse0'] = true;
      } else if (e.button === 2) {
        this.mouse.rightDown = true;
        this.justPressed['Mouse2'] = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouse.leftDown = false;
      if (e.button === 2) this.mouse.rightDown = false;
    });

    window.addEventListener('contextmenu', (e) => {
      e.preventDefault(); // disable browser right-click menu for aiming
    });

    window.addEventListener('wheel', (e) => {
      if (e.deltaY > 0) this.justPressed['WheelDown'] = true;
      if (e.deltaY < 0) this.justPressed['WheelUp'] = true;
    });

    document.addEventListener('pointerlockchange', () => {
      this.mouse.isPointerLocked = !!document.pointerLockElement;
    });

    // Touch device detection
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      this.touchEnabled = true;
      this.initTouchControls();
    }
  }

  requestPointerLock(element) {
    if (element && element.requestPointerLock) {
      element.requestPointerLock().catch(() => {});
    }
  }

  isKeyDown(code) {
    return !!this.keys[code];
  }

  wasJustPressed(code) {
    const val = !!this.justPressed[code];
    this.justPressed[code] = false;
    return val;
  }

  update() {
    // Forward / Backward
    let fwd = 0;
    if (this.isKeyDown('KeyW') || this.isKeyDown('ArrowUp')) fwd += 1;
    if (this.isKeyDown('KeyS') || this.isKeyDown('ArrowDown')) fwd -= 1;

    // Right / Left
    let right = 0;
    if (this.isKeyDown('KeyD') || this.isKeyDown('ArrowRight')) right += 1;
    if (this.isKeyDown('KeyA') || this.isKeyDown('ArrowLeft')) right -= 1;

    // Touch joystick overlay
    if (this.touchEnabled && this.touchJoysticks.move.active) {
      fwd = -this.touchJoysticks.move.dirY;
      right = this.touchJoysticks.move.dirX;
    }

    this.moveForward = fwd;
    this.moveRight = right;
    this.isSprinting = this.isKeyDown('ShiftLeft') || this.isKeyDown('ShiftRight');
    this.isJumping = this.isKeyDown('Space');
    this.isBraking = this.isKeyDown('Space');
    this.isAiming = this.mouse.rightDown;
    this.isFiring = this.mouse.leftDown || this.isKeyDown('KeyF');
  }

  resetMouseDeltas() {
    this.mouse.dx = 0;
    this.mouse.dy = 0;
  }

  initTouchControls() {
    // Can attach listeners to virtual joystick touch containers
    const touchOverlay = document.getElementById('touch-controls');
    if (!touchOverlay) return;
    touchOverlay.style.display = 'block';

    const moveZone = document.getElementById('touch-move-zone');
    const moveStick = document.getElementById('touch-move-stick');

    if (moveZone && moveStick) {
      let touchId = null;
      moveZone.addEventListener('touchstart', (e) => {
        const t = e.changedTouches[0];
        touchId = t.identifier;
        const rect = moveZone.getBoundingClientRect();
        this.touchJoysticks.move.active = true;
        this.touchJoysticks.move.startX = rect.left + rect.width / 2;
        this.touchJoysticks.move.startY = rect.top + rect.height / 2;
      }, { passive: false });

      const handleMove = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === touchId) {
            const dx = t.clientX - this.touchJoysticks.move.startX;
            const dy = t.clientY - this.touchJoysticks.move.startY;
            const dist = Math.hypot(dx, dy);
            const maxDist = 45;
            const clampedDist = Math.min(dist, maxDist);
            const angle = Math.atan2(dy, dx);

            const finalX = Math.cos(angle) * clampedDist;
            const finalY = Math.sin(angle) * clampedDist;

            moveStick.style.transform = `translate(${finalX}px, ${finalY}px)`;
            this.touchJoysticks.move.dirX = finalX / maxDist;
            this.touchJoysticks.move.dirY = finalY / maxDist;
          }
        }
      };

      const handleEnd = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === touchId) {
            touchId = null;
            this.touchJoysticks.move.active = false;
            this.touchJoysticks.move.dirX = 0;
            this.touchJoysticks.move.dirY = 0;
            moveStick.style.transform = `translate(0px, 0px)`;
          }
        }
      };

      moveZone.addEventListener('touchmove', handleMove, { passive: false });
      moveZone.addEventListener('touchend', handleEnd, { passive: false });
      moveZone.addEventListener('touchcancel', handleEnd, { passive: false });
    }
  }
}
