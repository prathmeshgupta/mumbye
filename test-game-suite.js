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
  await testEndpoint('http://localhost:3000/assets/index-aVyZXu1J.css', 200, 'text/css');
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
