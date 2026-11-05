// MUMBYE: MAXIMUM CITY - Dynamic Time of Day & Weather System
import * as THREE from 'three';

export class Weather {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;

    // Time of day (0.0 to 24.0 hours)
    this.timeOfDay = 17.5; // Start at 5:30 PM (Golden sunset over Marine Drive)
    this.timeScale = 0.05; // 1 real second = ~3 game minutes

    // Weather types: 'clear', 'sunset', 'night', 'monsoon'
    this.currentWeather = 'sunset';

    // Lighting nodes
    this.sunLight = null;
    this.ambientLight = null;
    this.hemiLight = null;
    this.skyMesh = null;

    // Monsoon storm state
    this.isRaining = false;
    this.lightningTimer = 0;
    this.nextLightning = 8 + Math.random() * 12;

    this.init();
  }

  init() {
    // Hemispherical ambient light (sky/ground color)
    this.hemiLight = new THREE.HemisphereLight(0xffeedd, 0x334455, 0.6);
    this.scene.add(this.hemiLight);

    // Main directional sunlight / moonlight
    this.sunLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    this.sunLight.position.set(100, 150, 100);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 500;
    const d = 120;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Fog
    this.scene.fog = new THREE.FogExp2(0xd6a87c, 0.0028);

    // Sky Dome Mesh
    const skyGeo = new THREE.SphereGeometry(600, 32, 16);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0xffa055,
      side: THREE.BackSide
    });
    this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyMesh);

    this.updateLightingColors();
  }

  setWeather(weatherName) {
    this.currentWeather = weatherName;
    if (weatherName === 'monsoon') {
      this.isRaining = true;
    } else {
      this.isRaining = false;
    }

    if (weatherName === 'sunset') this.timeOfDay = 18.0;
    else if (weatherName === 'night') this.timeOfDay = 22.5;
    else if (weatherName === 'clear') this.timeOfDay = 12.0;

    this.updateLightingColors();
  }

  setTimeOfDay(hour) {
    this.timeOfDay = (hour % 24 + 24) % 24;
    this.updateLightingColors();
  }

  update(delta, playerPos) {
    // Advance clock
    this.timeOfDay = (this.timeOfDay + delta * this.timeScale) % 24;

    // Follow player with directional light shadow box
    if (playerPos) {
      const sunDistance = 200;
      const angle = ((this.timeOfDay - 6) / 24) * Math.PI * 2;
      const sunX = playerPos.x + Math.cos(angle) * sunDistance;
      const sunY = Math.max(15, Math.sin(angle) * sunDistance);
      const sunZ = playerPos.z + 80;

      this.sunLight.position.set(sunX, sunY, sunZ);
      this.sunLight.target.position.set(playerPos.x, playerPos.y, playerPos.z);
      this.sunLight.target.updateMatrixWorld();

      if (this.skyMesh) {
        this.skyMesh.position.copy(playerPos);
      }
    }

    // Handle monsoon lightning
    if (this.isRaining) {
      this.lightningTimer += delta;
      if (this.lightningTimer > this.nextLightning) {
        this.triggerLightning();
        this.lightningTimer = 0;
        this.nextLightning = 6 + Math.random() * 10;
      }
    }

    this.updateLightingColors();
  }

  triggerLightning() {
    const origIntensity = this.sunLight.intensity;
    this.sunLight.intensity = 3.5;
    this.scene.fog.color.setHex(0xeef5ff);

    setTimeout(() => {
      this.sunLight.intensity = 0.4;
      setTimeout(() => {
        this.sunLight.intensity = 2.8;
        setTimeout(() => {
          this.sunLight.intensity = origIntensity;
          this.updateLightingColors();
        }, 80);
      }, 50);
    }, 60);
  }

  updateLightingColors() {
    const hour = this.timeOfDay;
    let skyColor, fogColor, sunColor, hemiSky, hemiGround, sunIntensity;

    if (this.isRaining) {
      // Overcast stormy Mumbai monsoon
      skyColor = 0x3a4854;
      fogColor = 0x485866;
      sunColor = 0x7c8c9a;
      hemiSky = 0x5a6a78;
      hemiGround = 0x222a33;
      sunIntensity = 0.5;
      this.scene.fog.density = 0.0055;
    } else if (hour >= 5.5 && hour < 8.0) {
      // Dawn / Sunrise
      const t = (hour - 5.5) / 2.5;
      skyColor = new THREE.Color(0x351a44).lerp(new THREE.Color(0xfd7e40), t);
      fogColor = new THREE.Color(0x5a2d54).lerp(new THREE.Color(0xec905a), t);
      sunColor = 0xffa366;
      hemiSky = 0xffeedd;
      hemiGround = 0x443322;
      sunIntensity = 0.9;
      this.scene.fog.density = 0.0032;
    } else if (hour >= 8.0 && hour < 16.5) {
      // Daytime Clear Mumbai
      skyColor = 0x64b0f7;
      fogColor = 0xbce0fd;
      sunColor = 0xfffaea;
      hemiSky = 0xffffff;
      hemiGround = 0x555544;
      sunIntensity = 1.35;
      this.scene.fog.density = 0.0022;
    } else if (hour >= 16.5 && hour < 19.5) {
      // Golden Hour & Sunset (Marine Drive Queen's Necklace)
      const t = (hour - 16.5) / 3.0;
      skyColor = new THREE.Color(0xf58e38).lerp(new THREE.Color(0x541c4f), t);
      fogColor = new THREE.Color(0xf39b56).lerp(new THREE.Color(0x6b245a), t);
      sunColor = 0xffaa44;
      hemiSky = 0xffcf99;
      hemiGround = 0x502820;
      sunIntensity = 1.1;
      this.scene.fog.density = 0.0028;
    } else {
      // Night (Cyberpunk neon Mumbai)
      skyColor = 0x070b19;
      fogColor = 0x0c1328;
      sunColor = 0x3d5485; // Moonlight
      hemiSky = 0x1b2848;
      hemiGround = 0x080911;
      sunIntensity = 0.35;
      this.scene.fog.density = 0.0035;
    }

    if (this.skyMesh) this.skyMesh.material.color.set(skyColor);
    if (this.scene.fog) this.scene.fog.color.set(fogColor);
    if (this.sunLight) {
      this.sunLight.color.set(sunColor);
      this.sunLight.intensity = sunIntensity;
    }
    if (this.hemiLight) {
      this.hemiLight.color.set(hemiSky);
      this.hemiLight.groundColor.set(hemiGround);
    }
  }

  isNight() {
    return this.timeOfDay > 19.5 || this.timeOfDay < 5.5;
  }
}
