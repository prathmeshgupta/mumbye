# 🛺 MUMBYE: MAXIMUM CITY
> **Open-World 3D Action Game Set in Mumbai • Web Browser Based • Extensible DLC & Modding Engine**

![Mumbye Banner](https://img.shields.io/badge/Platform-Web%20Browser%20(WebGL)-brightgreen)
![Three.js](https://img.shields.io/badge/Engine-Three.js-blue)
![Audio](https://img.shields.io/badge/Audio-Pure%20Web%20Audio%20Synthesis-orange)
![DLC System](https://img.shields.io/badge/Architecture-Extensible%20DLC%20Framework-purple)

---

## 🌟 Game Overview

**MUMBYE: MAXIMUM CITY** is a full 3D GTA-style open-world game built completely for the web browser. You play as **Kabir**, a street-smart newcomer navigating the bustling streets, coastal promenades, crowded chawls, and underworld turf wars of Mumbai.

Everything is finished end-to-end:
* **Authentic Mumbai Atmosphere**: Auto Rickshaws with 2-stroke engine sputter, Kaali-Peeli vintage Premier Padmini taxis, red BEST buses, animated Mumbai suburban local trains with horns, tetrapods lining Marine Drive, and steaming Vada Pav / Cutting Chai tapris.
* **Open World Map & Neighborhood Granularity**:
  * **BKC Cyber City (Futuristic Hub)**: Gleaming illuminated skyscrapers (*AstraCorp HQ*, *Quantum Neural*, *Vexen AI*), elevated skybridges, neon data lines, and rooftop Helipad with high-speed elevator warp.
  * **Colaba Harbor & Maritime Docks**: Shipping freight container stacks, industrial cargo cranes, and dockside tapris.
  * **Marine Drive (Queen's Necklace)**: Seaside boulevard along the Arabian Sea with palm trees, tetrapods, Art Deco apartments, and Bollywood billboards.
  * **Gateway of India & Fort Plaza**: Grand heritage stone arch monument facing the ocean harbor.
  * **Chor Bazaar & Chawls**: Vibrant, dense multi-story chawls with laundry lines, narrow alleys, chop-shops, and bustling market stalls.
  * **Bandra-Worli Sea Link**: Majestic cable-stayed suspension bridge spanning the open ocean with stunt ramps.
  * **Central Railway Corridor**: Realistic railway tracks with overhead catenary wires, suburban platforms, and moving Mumbai Local Train.
* **Aerial Flight & Flying Vehicles**:
  * **SkyEye Surveillance & Combat Drone**: Deployable on foot via **`U`** or the phone app. 6-DOF aerodynamic flight, altitude ceiling, solar battery, camera tracking, and fireable **EMP Taser Dart** that disables hostile vehicles and guards.
  * **Sky-Ranger VTOL Helicopter**: Flyable twin-rotor helicopter located at the AstraCorp Rooftop Helipad. Full collective altitude climb/descent, bank/tilt, downwash ground smoke, and aerial skyline views.
  * **High-Speed Lift / Elevator Warp**: Interactive elevator pads connecting AstraCorp street level to the 68m rooftop helipad.
* **Physics & Arcade Driving**:
  * Drift physics, suspension roll and pitch, handbrake slides, tire burnout smoke, nitro boost, and stunt ramps.
  * Vehicle damage, engine smoke, fire, and explosions.
* **Metro Patrol Enforcement System**:
  * 1 to 5 Wanted Stars with authentic enforcer radio chatter (*"Target spotted! Surround the suspect!"*).
  * Lathi-wielding guards on foot, high-speed Metro Patrol Cruisers, tactical roadblocks, and sirens.
* **Pure Web Audio Synthesis Engine (CC0 / Zero-Liability Guarantee)**:
  * 100% original algorithmic synthesis via Web Audio API. Zero external audio downloads, zero copyrighted MP3s/samples, zero trademark liabilities.
  * Procedurally synthesized vehicle engines (2-stroke rickshaw, taxi carbureted engine, bus diesel rumble, screaming supercar V8, drone quad-rotor whirr, helicopter blade chop).
  * 5 Live Mumbai Radio Stations:
    1. *Bombay Disco 98.3* (Bollywood Funk & Disco)
    2. *Gully Beat 104.8* (Mumbai Desi Hip Hop)
    3. *Marine Drive Chill 92.7* (Arabian Sea Chillwave)
    4. *Dhol Tasha 101.2* (Ganpati Festival High-Energy Beats)
    5. *Cyber BKC 107.5* (Futuristic Synthwave & Cyberpunk EDM)
* **Bambaiya Smartphone Apps**:
  * Press **`P`** to access Contacts (call fixer Babu Bhaiyya, order Taxis, post legal bail bond to clear heat).
  * **SkyEye Drone App**: One-tap drone deployment.
  * **Bounties Board App**: Radiant dynamic mini-missions across neighborhoods.
  * **Bazaar Stocks App**: Fictitious Mumbai stock market ticker with instant investments.
  * **Cheats App, Radio Tuner, and DLC Store**.
* **Story Campaign & Radiant Mini-Bounties**:
  * 7-Mission cinematic story campaign connecting Dadar, Marine Drive, Bhendi Bazaar, BKC Cyber City, and the Sea Link.
  * Repeatable dynamic mini-missions (Dabbawala Express, Chor Bazaar Drone Taser, BKC Rooftop Data Transport).
* **Pause Menu, Full Map & Settings (`ESC`)**:
  * Interactive full city map with district legend and live player GPS tracker.
  * Graphics settings: Dynamic shadows toggle, render resolution scale, live FPS counter.
  * Audio mixer for master, SFX, and radio station volume.
  * Time of day & weather overrides (Sunrise, Midday, Golden Sunset, Monsoon Storm).
  * Metro General Hospital respawn with instant wanted heat clearance.
* **Spring-Arm Collision Camera & Dark Reader Immunity**:
  * Camera dynamically detects walls and buildings to prevent clipping and getting stuck.
  * Hardened against browser extensions (e.g. Dark Reader) with `<meta name="darkreader-lock">` and forced color-scheme guards.

---

## 🚀 Quick Start

### 🏎️ NEW: Mumbye Godot 4.3 3D Edition (Vice City / San Andreas Grade)
Double-click **`run_godot.bat`** directly from the root of this repository.
* 🚀 **120–180+ FPS GPU Native Performance**: Zero browser overhead, native AMD/Nvidia OpenGL ES 3.0 / WebGL 2.0 Compatibility renderer.
* 📷 **GTA-Style `SpringArm3D` Camera**: Collision raycasting with sphere margin prevents camera from ever clipping into walls or buildings.
* 🛺 **Real `VehicleBody3D` Physics**: True 4-wheel independent suspension, tire friction slip, handbrake powerslides/drifting, and dynamic chase camera with high-speed FOV rush.
* 🌆 **Sunny Mumbai High-Key Graphics**: Marine Drive 6-lane coastal boulevard, tetrapod seawall, Gateway of India monument, Bandra-Worli Sea Link cable-stayed bridge, historic Colaba chawls, and BKC glass skyscrapers.
* 🎶 **Zero-Dependency Procedural Audio**: Algorithmic engine revs, tire screeches, horns, gunshots, cash chimes, and radio stations.

### Option A: Standalone Windows Webview Executable (.exe)
Double-click **`Mumbye.exe`** directly from the root of this repository (or download it from [GitHub Releases](https://github.com/prathmeshgupta/mumbye/releases)).
* ⚡ No Node.js or npm required!
* 🖥️ Runs in a dedicated, hardware-accelerated desktop window.

### Option B: Run via Node / Web Browser
```bash
# Start the local web server
npm start
# or start live Vite development mode
npm run dev
```

Then open your browser at **`http://localhost:3000`** and click **"ENTER MAXIMUM CITY"**!

---

## 🎮 Controls

### 🚶 On-Foot
| Key | Action |
| --- | --- |
| **W, A, S, D / Arrows** | Move Kabir |
| **Shift** | Sprint |
| **Space** | Jump |
| **Left Click / F** | Attack (Punch, Swing Bat, Fire Gun) |
| **Right Click** | Aim Crosshair (Over-the-shoulder zoom) |
| **1 – 6 / Q / Scroll Wheel** | Cycle Weapons (Fist, Lathi, Bat, Katta, Pistol, AK-47) |
| **E** | Enter Vehicle / Buy Vada Pav at Tapri (Restores 100 HP for ₹20) |

### 🛺 In-Vehicle
| Key | Action |
| --- | --- |
| **W / Up** | Accelerate |
| **S / Down** | Brake / Reverse |
| **A / D / Left, Right** | Steer |
| **Spacebar** | Handbrake & Drift |
| **Shift** | Nitrous Oxide Boost (*Bandra DLC*) |
| **H** | Mumbai Horn / Police Siren |
| **R** | Switch Mumbai Radio Station |
| **T** | Toggle Taxi Driver Fares Side Mission |
| **E** | Exit Vehicle |

### 📱 Smartphone & Features
| Key | Action |
| --- | --- |
| **P** | Open Bambaiya Smartphone |
| **M** | Open DLC & Mod Manager |
| **B** | "Bhai Time" / Bullet Time Slow-Motion (*Action Hero DLC*) |

---

## 🧩 Extensible DLC Architecture

The game features a first-class **DLC & Modding Engine** (`src/dlc/DLCManager.js`). Developers can create, distribute, and install full custom expansions without needing to modify core game code.

### 3 Bundled DLCs (Included Out-of-the-Box):
1. **Bandra Nitro Drifters Pack (`dlc_bandra_drift`)**:
   * Nitrous oxide boost for all vehicles (press `Shift`).
   * Neon Cyber Auto Rickshaw with custom underglow.
   * Midnight Bandra-Worli Sea Link Grand Prix race mission.
2. **Bollywood Action Hero Pack (`dlc_bollywood_hero`)**:
   * "Bhai Time" (cinematic slow motion on `B` key).
   * Golden Desert Eagle with explosive rounds.
   * Film City Studio Gold Heist mission.
3. **Monsoon Madness Pack (`dlc_monsoon_madness`)**:
   * Torrential Mumbai Monsoon weather with lightning and puddles.
   * Legendary **Amphibious Tuk-Tuk** that cruises on the Arabian Sea waves!
   * Arabian Sea flood rescue mission.

### Installing Custom DLCs:
1. Press **`M`** in-game to open the **DLC Manager**.
2. Go to the **"Create / Install Custom DLC"** tab.
3. Paste any custom JavaScript DLC code or click **"Insert Boilerplate Template"**.
4. Click **"⚡ Install & Activate DLC Mod"** to load the mod live into the game instantly!

For full developer API documentation and code samples, see [`docs/DLC_CREATION_GUIDE.md`](./docs/DLC_CREATION_GUIDE.md).

---

## 📁 Project Architecture

```
c:\Users\pratj\Mumbye\
├── Mumbye.exe                   # Standalone desktop game executable for Windows
├── MumbyeLauncher.cs            # Native desktop launcher source
├── Mumbye.ico                   # Application icon
├── index.html                   # Master UI, HUD, and Canvas HTML
├── server.js                    # Zero-dependency local web server
├── package.json                 # Scripts and dependencies (Three.js & Vite)
├── vite.config.js               # Build and bundle configuration
├── docs/
│   └── DLC_CREATION_GUIDE.md    # Developer guide for creating DLCs
├── public/
│   └── dlcs/
│       └── template-dlc.js      # Modder starter template
├── src/
│   ├── main.js                  # Entry point & startup orchestration
│   ├── style.css                # GTA glassmorphism HUD & Phone styling
│   ├── engine/
│   │   ├── Engine.js            # Main loop, renderer, entity coordinator
│   │   ├── AudioEngine.js       # Web Audio synthesizer (SFX, engines, radio)
│   │   ├── CameraManager.js     # Third-person, aiming, and vehicle chase cam
│   │   ├── Input.js             # Keyboard, mouse, pointer lock, touch
│   │   ├── Physics.js           # Sphere/AABB collisions, ramps, raycasting
│   │   ├── Weather.js           # 24h clock, skybox, sunset, monsoon storm
│   │   └── ParticleSystem.js    # Muzzle flashes, sparks, blood, smoke, rain
│   ├── world/
│   │   ├── CityMap.js           # Marine Drive, Sea Link, Gateway, Chawls
│   │   ├── ModelFactory.js      # Procedural 3D Rickshaws, Taxis, Buses, Characters
│   │   └── CityProps.js         # Vada Pav tapris, tetrapods, ramps, billboards
│   ├── entities/
│   │   ├── Player.js            # Kabir player controller, weapons, health
│   │   ├── Vehicle.js           # Arcade physics, drifting, damage, sirens
│   │   ├── Drone.js             # SkyEye 6-DOF Drone & EMP Taser Dart
│   │   ├── Helicopter.js        # Sky-Ranger VTOL Helicopter flight mechanics
│   │   ├── TrafficManager.js    # Mumbai ambient traffic AI
│   │   ├── PedestrianManager.js # Pedestrian AI & dropped cash
│   │   ├── PoliceSystem.js      # 5-Star Wanted Level & Metro Patrol Enforcement AI
│   │   └── TrainSystem.js       # Moving Mumbai Local Train with horn
│   ├── missions/
│   │   ├── MissionManager.js    # Mission state, checkpoints, taxi hustle, bounties
│   │   └── MissionsData.js      # Story missions 1-7 & radiant mini-contracts
│   ├── dlc/
│   │   ├── DLCManager.js        # Core modding framework & runtime injector
│   │   └── bundled/
│   │       ├── BandraDriftDLC.js
│   │       ├── BollywoodHeroDLC.js
│   │       └── MonsoonMadnessDLC.js
│   └── ui/
│       ├── UIManager.js         # Master HUD controller
│       ├── Minimap.js           # Circular GPS radar with rotating arrow
│       ├── PauseMenu.js         # Interactive Map, Graphics, Audio & Settings
│       ├── PhoneUI.js           # Bambaiya smartphone with Drone, Stocks & Bounties apps
│       ├── DLCModal.js          # Interactive in-game DLC manager
│       └── DialogBox.js         # Dialog subtitles & GTA banners
└── dist/                        # Production build
```

---

## ⚡ Cheats (Enter via Phone - Press P)

| Cheat Code | Effect |
| --- | --- |
| **`PAISA`** | Add ₹10,000 Cash |
| **`SEHAT`** | Restore Full Health & 100 Armor |
| **`HATHIYAR`** | Unlock All Weapons & Full Ammo |
| **`POLICEHATAO`** | Clear All Wanted Stars |
| **`DRONE`** | Instantly Deploy SkyEye Surveillance Drone |
| **`HELI`** | Warp to AstraCorp Rooftop Helipad |
| **`SUPERCAR`** | Spawn Bollywood Supercar |
| **`AUTO`** | Spawn Mumbai Auto Rickshaw |
| **`TAXI`** | Spawn Kaali-Peeli Taxi |
| **`MONSOON`** | Trigger Torrential Rain & Lightning |
| **`SUNSET`** | Set Golden Marine Drive Sunset |
| **`NITRO`** | Infinite Nitro (*Bandra DLC*) |
| **`BHAITIME`** | Bullet Time Slow-Mo (*Action DLC*) |

---

*Mumbai Meri Jaan! Maximum City awaits.*
