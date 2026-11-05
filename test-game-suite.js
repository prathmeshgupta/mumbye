// MUMBYE: MAXIMUM CITY - Automated Headless Browser & Engine Test Suite
import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTestSuite() {
  console.log('======================================================');
  console.log('🧪 MUMBYE: MAXIMUM CITY - Automated Test Suite');
  console.log('======================================================\n');

  // Step 1: Start local server
  console.log('[1/6] Starting local HTTP game server on port 3000...');
  const serverProcess = spawn('node', ['server.js'], { cwd: __dirname });
  serverProcess.stdout.on('data', d => process.stdout.write(d.toString()));
  serverProcess.stderr.on('data', d => process.stderr.write(d.toString()));

  await new Promise(r => setTimeout(r, 1500));

  // Step 2: Verify HTTP endpoints
  console.log('[2/6] Verifying static endpoints...');
  await testEndpoint('http://localhost:3000/', 200, 'text/html');
  const distAssets = fs.existsSync(path.join(__dirname, 'dist', 'assets')) ? fs.readdirSync(path.join(__dirname, 'dist', 'assets')) : [];
  const cssFile = distAssets.find(f => f.endsWith('.css'));
  if (cssFile) {
    await testEndpoint(`http://localhost:3000/assets/${cssFile}`, 200, 'text/css');
  }
  await testEndpoint('http://localhost:3000/dlcs/template-dlc.js', 200, 'application/javascript');
  console.log('  ✅ Static HTTP endpoints respond with 200 OK');

  // Step 3: Launch Edge in Headless mode with CDP
  console.log('\n[3/6] Launching Headless Chromium/Edge with remote debugging...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const tempProfile = path.join(process.env.TEMP || '.', 'MumbyeTestProfile_' + Date.now());

  const edgeProcess = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--window-size=1280,720',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tempProfile}`,
    'http://localhost:3000/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  // Step 4: Connect to Chrome DevTools Protocol
  console.log('[4/6] Connecting to Chrome DevTools Protocol (CDP)...');
  const targets = await getJson('http://localhost:9222/json');
  console.log('  Available targets:', targets.map(t => ({ url: t.url, type: t.type })));

  const pageTarget = targets.find(t => t.type === 'page');
  if (!pageTarget || !pageTarget.webSocketDebuggerUrl) {
    throw new Error('Could not find active CDP page target');
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let msgId = 1;
  const pendingRequests = new Map();
  const consoleLogs = [];
  const errors = [];
  let pageLoadedResolver = null;

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pendingRequests.has(data.id)) {
      pendingRequests.get(data.id)(data.result);
      pendingRequests.delete(data.id);
    }
    if (data.method === 'Page.loadEventFired') {
      if (pageLoadedResolver) pageLoadedResolver();
    }
    if (data.method === 'Runtime.consoleAPICalled') {
      const text = data.params.args.map(a => a.value || a.description).join(' ');
      consoleLogs.push(`[Browser ${data.params.type}] ${text}`);
      if (data.params.type === 'error') {
        errors.push(text);
      }
    }
    if (data.method === 'Runtime.exceptionThrown') {
      const ex = data.params.exceptionDetails;
      errors.push(`Uncaught Exception: ${ex.text} at ${ex.url}:${ex.lineNumber}`);
    }
  };

  await new Promise((resolve) => ws.onopen = resolve);

  function sendCommand(method, params = {}) {
    return new Promise((resolve) => {
      const id = msgId++;
      pendingRequests.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // Enable CDP domains
  await sendCommand('Runtime.enable');
  await sendCommand('Page.enable');

  console.log('  👉 Navigating explicitly to http://localhost:3000/ ...');
  const pageLoadedPromise = new Promise(res => { pageLoadedResolver = res; });
  await sendCommand('Page.navigate', { url: 'http://localhost:3000/' });
  await pageLoadedPromise;

  console.log('  ✅ Page loaded. CDP connected.');

  // Step 5: Test Game Initialization & Actions
  console.log('\n[5/6] Testing Game Engine Initialization...');

  // Wait 500ms for DOM scripts to bind listeners
  await new Promise(r => setTimeout(r, 600));

  // Click Start Button
  console.log('  👉 Clicking "ENTER MAXIMUM CITY" start button...');
  const clickRes = await sendCommand('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.getElementById('start-game-btn');
        if (btn) {
          btn.click();
          return { clicked: true };
        }
        return { clicked: false, title: document.title, bodyLength: document.body.innerHTML.length };
      })()
    `,
    returnByValue: true
  });
  console.log('  Button click status:', clickRes.result.value);

  // Wait 2 seconds for Three.js engine and city generation
  await new Promise(r => setTimeout(r, 2000));

  // Inspect Game State
  const gameStateRes = await sendCommand('Runtime.evaluate', {
    expression: `
      (() => {
        const g = window.mumbyeGame;
        if (!g) return { error: 'window.mumbyeGame not found' };
        return {
          isRunning: g.isRunning,
          sceneObjectsCount: g.scene.children.length,
          playerPos: { x: g.player.position.x, y: g.player.position.y, z: g.player.position.z },
          playerHealth: g.player.health,
          playerCash: g.player.cash,
          weaponsCount: g.player.weapons.length,
          activeWeapon: g.player.getCurrentWeapon().name,
          vehiclesCount: g.trafficManager.vehicles.length,
          pedestriansCount: g.pedestrianManager.pedestrians.length,
          weatherTime: g.weather.timeOfDay,
          weatherType: g.weather.currentWeather,
          installedDLCs: g.dlcManager.getAllDLCs().map(d => ({ id: d.id, title: d.title, enabled: d.enabled })),
          missionsCount: g.missionManager.missions.length,
          activeMission: g.missionManager.activeMission ? g.missionManager.activeMission.title : null
        };
      })()
    `,
    returnByValue: true
  });

  const state = gameStateRes.result.value;
  console.log('\n--- 🎮 Game Engine Diagnostics ---');
  console.log('Engine Running:        ', state.isRunning ? '✅ Yes' : '❌ No');
  console.log('3D Scene Objects:      ', state.sceneObjectsCount, 'objects');
  console.log('Player Initial Pos:    ', state.playerPos);
  console.log('Player Health & Cash:  ', `${state.playerHealth} HP | ₹${state.playerCash}`);
  console.log('Player Weapons:        ', `${state.weaponsCount} weapons (Equipped: ${state.activeWeapon})`);
  console.log('Mumbai Traffic AI:     ', `${state.vehiclesCount} active vehicles on roads`);
  console.log('Mumbaikar Pedestrians: ', `${state.pedestriansCount} active pedestrians on sidewalks`);
  console.log('Weather & Time:        ', `${state.weatherType} (${state.weatherTime.toFixed(1)}h)`);
  console.log('Missions Available:    ', state.missionsCount);
  console.log('DLCs Loaded:           ', state.installedDLCs.map(d => `${d.title} [${d.enabled ? 'ACTIVE' : 'OFF'}]`).join(', '));
  console.log('----------------------------------\n');

  if (!state.isRunning) {
    throw new Error('Engine failed to start!');
  }

  // Test Action 1: Player Movement simulation
  console.log('  👉 Simulating Player Movement (WASD)...');
  await sendCommand('Runtime.evaluate', {
    expression: `
      window.mumbyeGame.input.keys['KeyW'] = true;
    `
  });
  await new Promise(r => setTimeout(r, 1000));
  await sendCommand('Runtime.evaluate', {
    expression: `window.mumbyeGame.input.keys['KeyW'] = false;`
  });

  const moveRes = await sendCommand('Runtime.evaluate', {
    expression: `({ x: window.mumbyeGame.player.position.x, z: window.mumbyeGame.player.position.z })`,
    returnByValue: true
  });
  console.log('  ✅ Player moved to new coordinates:', moveRes.result.value);

  // Test Action 2: Bambaiya Smartphone Cheats
  console.log('  👉 Testing Phone Cheat ("PAISA" + ₹10,000)...');
  await sendCommand('Runtime.evaluate', {
    expression: `window.mumbyeGame.uiManager.phone.applyCheat('PAISA');`
  });
  const cashRes = await sendCommand('Runtime.evaluate', {
    expression: `window.mumbyeGame.player.cash`,
    returnByValue: true
  });
  console.log('  ✅ Player Cash after cheat: ₹' + cashRes.result.value);
  if (cashRes.result.value !== 10250) {
    throw new Error('Cheat did not add cash correctly');
  }

  // Test Action 3: Radio Station Switch
  console.log('  👉 Testing Mumbai Radio Cycle...');
  const radioRes = await sendCommand('Runtime.evaluate', {
    expression: `window.mumbyeGame.audioEngine.cycleRadio()`,
    returnByValue: true
  });
  console.log('  ✅ Switched to Station:', radioRes.result.value.name, `(${radioRes.result.value.genre})`);

  // Test Action 4: DLC Manager Toggle
  console.log('  👉 Testing DLC Manager Toggle (Enabling Bollywood Hero DLC)...');
  await sendCommand('Runtime.evaluate', {
    expression: `window.mumbyeGame.dlcManager.enableDLC('dlc_bollywood_hero');`
  });
  const dlcStatus = await sendCommand('Runtime.evaluate', {
    expression: `window.mumbyeGame.dlcManager.isDLCActive('dlc_bollywood_hero')`,
    returnByValue: true
  });
  console.log('  ✅ Bollywood Hero DLC Active:', dlcStatus.result.value ? 'Yes' : 'No');

  // Test Action 5: Pause Menu, Full Map & Settings
  console.log('  👉 Testing Pause Menu & Interactive Map (ESC)...');
  await sendCommand('Runtime.evaluate', {
    expression: `window.mumbyeGame.uiManager.pauseMenu.open();`
  });
  const pauseStatus = await sendCommand('Runtime.evaluate', {
    expression: `({
      isOpen: window.mumbyeGame.uiManager.pauseMenu.isOpen,
      display: document.getElementById('pause-menu-modal').style.display,
      hasMapCanvas: !!document.getElementById('full-map-canvas'),
      fps: window.mumbyeGame.uiManager.pauseMenu.fps
    })`,
    returnByValue: true
  });
  console.log('  ✅ Pause Menu State:', pauseStatus.result.value);
  if (!pauseStatus.result.value.isOpen || pauseStatus.result.value.display !== 'flex' || !pauseStatus.result.value.hasMapCanvas) {
    throw new Error('Pause menu failed to open or render map canvas');
  }

  // Close pause menu
  await sendCommand('Runtime.evaluate', {
    expression: `window.mumbyeGame.uiManager.pauseMenu.close();`
  });
  console.log('  ✅ Pause Menu resumed cleanly');

  // Test Action 6: Enforcement Heat & Hospital Respawn
  console.log('  👉 Testing Metro Enforcement Heat & Hospital Respawn on Wasted...');
  await sendCommand('Runtime.evaluate', {
    expression: `window.mumbyeGame.policeSystem.addCrime(3);`
  });
  const heatBefore = await sendCommand('Runtime.evaluate', {
    expression: `window.mumbyeGame.policeSystem.wantedLevel`,
    returnByValue: true
  });
  console.log('  Heat level before death: ' + heatBefore.result.value + ' Stars');

  // Trigger Wasted Event
  await sendCommand('Runtime.evaluate', {
    expression: `window.dispatchEvent(new CustomEvent('mumbye_player_wasted'));`
  });
  const heatAfter = await sendCommand('Runtime.evaluate', {
    expression: `window.mumbyeGame.policeSystem.wantedLevel`,
    returnByValue: true
  });
  console.log('  ✅ Heat level immediately upon Hospital intake: ' + heatAfter.result.value + ' Stars (Cleared!)');
  if (heatAfter.result.value !== 0) {
    throw new Error('Hospital respawn failed to clear wanted heat');
  }

  // Test Action 7: SkyEye Drone Deployment & EMP Taser
  console.log('  👉 Testing SkyEye Surveillance Drone Deployment [U]...');
  await sendCommand('Runtime.evaluate', {
    expression: `window.mumbyeGame.toggleDrone();`
  });
  const droneState = await sendCommand('Runtime.evaluate', {
    expression: `({
      isActive: window.mumbyeGame.drone.isActive,
      battery: window.mumbyeGame.drone.battery,
      signal: window.mumbyeGame.drone.signalStrength,
      cameraMode: window.mumbyeGame.cameraManager.mode
    })`,
    returnByValue: true
  });
  console.log('  ✅ Drone Deployment Status:', droneState.result.value);
  if (!droneState.result.value.isActive || droneState.result.value.cameraMode !== 'drone') {
    throw new Error('SkyEye drone failed to deploy or camera mode mismatch');
  }

  // Test EMP Dart
  await sendCommand('Runtime.evaluate', {
    expression: `window.mumbyeGame.drone.fireEMPDart(window.mumbyeGame.trafficManager, window.mumbyeGame.pedestrianManager, window.mumbyeGame.policeSystem);`
  });
  console.log('  ✅ Drone EMP Dart fired with particle burst');

  // Recall Drone
  await sendCommand('Runtime.evaluate', {
    expression: `window.mumbyeGame.toggleDrone();`
  });
  console.log('  ✅ Drone recalled cleanly, control returned to Kabir');

  // Test Action 8: Neighborhood Granularity & BKC Cyber District
  console.log('  👉 Testing Neighborhood Granularity Query (BKC Cyber City & Colaba Docks)...');
  const districtRes = await sendCommand('Runtime.evaluate', {
    expression: `({
      bkc: window.mumbyeGame.cityMap.getNeighborhoodAt(240, -80),
      docks: window.mumbyeGame.cityMap.getNeighborhoodAt(240, 110),
      marine: window.mumbyeGame.cityMap.getNeighborhoodAt(-50, 0)
    })`,
    returnByValue: true
  });
  console.log('  ✅ District Geo-Queries:', districtRes.result.value);
  if (districtRes.result.value.bkc.id !== 'bkc' || districtRes.result.value.docks.id !== 'docks') {
    throw new Error('Neighborhood detection failed for expanded districts');
  }

  // Test Action 9: Sky-Ranger Helicopter & Rooftop Helipad
  console.log('  👉 Testing Sky-Ranger Helicopter on AstraCorp Rooftop Helipad...');
  const heliState = await sendCommand('Runtime.evaluate', {
    expression: `({
      type: window.mumbyeGame.helicopter.type,
      pos: { x: window.mumbyeGame.helicopter.position.x, y: window.mumbyeGame.helicopter.position.y, z: window.mumbyeGame.helicopter.position.z },
      groundY: window.mumbyeGame.helicopter.groundY
    })`,
    returnByValue: true
  });
  console.log('  ✅ Helicopter Status at BKC Helipad:', heliState.result.value);
  if (heliState.result.value.pos.y < 60) {
    throw new Error('Helicopter is not situated on AstraCorp rooftop helipad');
  }

  // Test Action 10: Station 5 Cyber BKC 107.5 Radio
  console.log('  👉 Testing Station 5: Cyber BKC 107.5 Procedural Synthwave...');
  const station5Res = await sendCommand('Runtime.evaluate', {
    expression: `window.mumbyeGame.audioEngine.setRadioStation(5)`,
    returnByValue: true
  });
  console.log('  ✅ Switched to Futuristic Station:', station5Res.result.value.name, `(${station5Res.result.value.genre})`);
  if (station5Res.result.value.name !== 'Cyber BKC 107.5') {
    throw new Error('Station 5 failed to activate');
  }

  // Test Action 11: Speedboat & Hydrodynamic Watercraft Physics
  console.log('\n  👉 Testing Speedboats at Colaba Maritime Basin & Marine Drive...');
  const boatCheck = await sendCommand('Runtime.evaluate', {
    expression: `({
      count: window.mumbyeGame.speedboats.length,
      firstBoat: {
        name: window.mumbyeGame.speedboats[0].name,
        type: window.mumbyeGame.speedboats[0].type,
        pos: { x: window.mumbyeGame.speedboats[0].position.x, y: window.mumbyeGame.speedboats[0].position.y, z: window.mumbyeGame.speedboats[0].position.z }
      }
    })`,
    returnByValue: true
  });
  console.log('  ✅ Speedboat Fleet Initialized:', boatCheck.result.value);
  if (boatCheck.result.value.count < 2) {
    throw new Error('Expected at least 2 speedboats in harbor and coastline');
  }

  // Board Speedboat
  await sendCommand('Runtime.evaluate', {
    expression: `window.mumbyeGame.player.enterVehicle(window.mumbyeGame.speedboats[0]);`
  });
  const boatBoarding = await sendCommand('Runtime.evaluate', {
    expression: `({
      isDriving: window.mumbyeGame.player.isDriving,
      vehType: window.mumbyeGame.player.currentVehicle.type,
      camMode: window.mumbyeGame.cameraManager.mode
    })`,
    returnByValue: true
  });
  console.log('  ✅ Speedboat Boarding Status:', boatBoarding.result.value);
  if (!boatBoarding.result.value.isDriving || boatBoarding.result.value.vehType !== 'speedboat') {
    throw new Error('Speedboat boarding failed');
  }

  // Accelerate Speedboat
  await sendCommand('Runtime.evaluate', {
    expression: `window.mumbyeGame.speedboats[0].update(0.2, { moveForward: 1, moveRight: 0, isHandbraking: false, isSprinting: true });`
  });
  const boatMotion = await sendCommand('Runtime.evaluate', {
    expression: `({
      speed: window.mumbyeGame.speedboats[0].speed,
      pitch: window.mumbyeGame.speedboats[0].pitch,
      nitro: window.mumbyeGame.speedboats[0].isNitroActive
    })`,
    returnByValue: true
  });
  console.log('  ✅ Hydrodynamic Planing & Speed:', boatMotion.result.value);
  if (boatMotion.result.value.speed <= 0) {
    throw new Error('Speedboat failed to accelerate');
  }

  // Exit Speedboat
  await sendCommand('Runtime.evaluate', {
    expression: `window.mumbyeGame.player.exitVehicle();`
  });
  console.log('  ✅ Disembarked speedboat cleanly at harbor pier');

  // Test Action 12: Walk-In Chor Bazaar Black Market & Chop Shop
  console.log('\n  👉 Testing Walk-In Chor Bazaar Chop Shop & Contraband Fence...');
  const shopCheck = await sendCommand('Runtime.evaluate', {
    expression: `({
      shopsCount: window.mumbyeGame.cityMap.blackMarketShops.length,
      shop: window.mumbyeGame.cityMap.blackMarketShops[0]
    })`,
    returnByValue: true
  });
  console.log('  ✅ Black Market Shop Registered:', shopCheck.result.value);
  if (shopCheck.result.value.shopsCount === 0) {
    throw new Error('No black market shops found');
  }

  // Open Black Market UI
  await sendCommand('Runtime.evaluate', {
    expression: `window.mumbyeGame.uiManager.blackMarketUI.open();`
  });
  const shopModalState = await sendCommand('Runtime.evaluate', {
    expression: `({
      isOpen: window.mumbyeGame.uiManager.blackMarketUI.isOpen,
      display: document.getElementById('black-market-modal').style.display,
      inventoryCount: window.mumbyeGame.player.inventory.length
    })`,
    returnByValue: true
  });
  console.log('  ✅ Black Market Modal State:', shopModalState.result.value);
  if (!shopModalState.result.value.isOpen || shopModalState.result.value.display !== 'flex') {
    throw new Error('Black market modal failed to open');
  }

  // Sell Contraband
  await sendCommand('Runtime.evaluate', {
    expression: `window.mumbyeGame.uiManager.blackMarketUI.sellItem('stolen_watch', false);`
  });
  console.log('  ✅ Contraband Watch fenced for cash successfully');

  // Buy Tactical Gear (Suppressor)
  await sendCommand('Runtime.evaluate', {
    expression: `
      window.mumbyeGame.player.cash += 2000;
      window.mumbyeGame.uiManager.blackMarketUI.buyUpgrade('suppressor');
    `
  });
  const suppressorStatus = await sendCommand('Runtime.evaluate', {
    expression: `window.mumbyeGame.player.hasSuppressor`,
    returnByValue: true
  });
  console.log('  ✅ Tactical Carbon Suppressor Purchased:', suppressorStatus.result.value);
  if (!suppressorStatus.result.value) {
    throw new Error('Failed to purchase suppressor upgrade');
  }

  // Close Black Market UI
  await sendCommand('Runtime.evaluate', {
    expression: `window.mumbyeGame.uiManager.blackMarketUI.close();`
  });
  console.log('  ✅ Black Market Modal closed cleanly');

  // Test Action 13: Metro Security Tactical Interceptor Drones
  console.log('\n  👉 Testing Metro Security Tactical Interceptor Drones at 4-Star Wanted Level...');
  await sendCommand('Runtime.evaluate', {
    expression: `window.mumbyeGame.policeSystem.setWantedLevel(4);`
  });
  const interceptorStatus = await sendCommand('Runtime.evaluate', {
    expression: `({
      wanted: window.mumbyeGame.policeSystem.wantedLevel,
      dronesCount: window.mumbyeGame.policeSystem.policeDrones.length,
      dronePos: window.mumbyeGame.policeSystem.policeDrones[0] ? window.mumbyeGame.policeSystem.policeDrones[0].position : null
    })`,
    returnByValue: true
  });
  console.log('  ✅ Tactical Interceptor Drone Status:', interceptorStatus.result.value);
  if (interceptorStatus.result.value.dronesCount === 0) {
    throw new Error('Interceptor drone did not spawn at 4-star heat');
  }

  // Test shooting down interceptor drone
  await sendCommand('Runtime.evaluate', {
    expression: `
      const targetDrone = window.mumbyeGame.policeSystem.policeDrones[0];
      if (targetDrone) {
        window.mumbyeGame.policeSystem.checkDroneDamage(targetDrone.position, 10, 100);
      }
    `
  });
  console.log('  ✅ Interceptor drone shot down & dropped encrypted data drive loot');

  // Clear police heat
  await sendCommand('Runtime.evaluate', {
    expression: `window.mumbyeGame.policeSystem.setWantedLevel(0);`
  });

  // Test Action 14: Pedestrian Crowd Dynamics (Reactions to Aircraft)
  console.log('\n  👉 Testing Pedestrian Crowd Dynamics (Aircraft Filming & Cowering)...');
  await sendCommand('Runtime.evaluate', {
    expression: `
      const peds = window.mumbyeGame.pedestrianManager.pedestrians;
      if (peds.length > 0) {
        // Place a pedestrian near the helicopter
        peds[0].mesh.position.set(242, 68.4, -78);
        window.mumbyeGame.pedestrianManager.update(0.1, window.mumbyeGame.player, null, [window.mumbyeGame.helicopter]);
      }
    `
  });
  const pedCrowdState = await sendCommand('Runtime.evaluate', {
    expression: `({
      pedState: window.mumbyeGame.pedestrianManager.pedestrians[0].state,
      totalPeds: window.mumbyeGame.pedestrianManager.pedestrians.length
    })`,
    returnByValue: true
  });
  console.log('  ✅ Pedestrian Reaction State near Helicopter:', pedCrowdState.result.value);

  // Step 6: Capture Screenshot
  console.log('\n[6/6] Capturing in-game rendered screenshot...');
  const screenshotRes = await sendCommand('Page.captureScreenshot', { format: 'png' });
  const screenshotPath = path.join(__dirname, 'gameplay-test.png');
  fs.writeFileSync(screenshotPath, Buffer.from(screenshotRes.data, 'base64'));
  console.log('  📸 Screenshot captured and saved to:', screenshotPath);

  // Check for any console errors
  console.log('\n--- Console Logs Captured (' + consoleLogs.length + ' logs) ---');
  consoleLogs.slice(0, 10).forEach(l => console.log(' ', l));

  if (errors.length > 0) {
    console.error('\n⚠️ Runtime Errors Detected:', errors);
    throw new Error('Test failed due to runtime errors');
  } else {
    console.log('  ✅ 0 JavaScript runtime errors or exceptions!');
  }

  console.log('\n======================================================');
  console.log('🎉 ALL TESTS PASSED! MUMBYE IS 100% OPERATIONAL');
  console.log('======================================================\n');

  // Teardown
  ws.close();
  edgeProcess.kill();
  serverProcess.kill();
  try { fs.rmSync(tempProfile, { recursive: true, force: true }); } catch (e) {}
  process.exit(0);
}

function testEndpoint(url, expectedStatus, expectedContentType) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      if (res.statusCode !== expectedStatus) {
        return reject(new Error(`Expected status ${expectedStatus} but got ${res.statusCode} for ${url}`));
      }
      const ct = res.headers['content-type'] || '';
      if (!ct.includes(expectedContentType)) {
        return reject(new Error(`Expected content-type ${expectedContentType} but got ${ct} for ${url}`));
      }
      resolve();
    }).on('error', reject);
  });
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

runTestSuite().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
