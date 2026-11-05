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
* **Open World Map**:
  * **Marine Drive (Queen's Necklace)**: Seaside boulevard along the Arabian Sea with tetrapods, Art Deco apartments, and Bollywood billboards.
  * **Gateway of India & Fort Plaza**: Grand heritage stone arch monument facing the ocean harbor.
  * **Bhendi Bazaar & Chawls**: Vibrant, dense multi-story chawls with laundry lines, narrow alleys, and bustling market stalls.
  * **Bandra-Worli Sea Link**: Majestic cable-stayed suspension bridge spanning the open ocean.
  * **Central Railway Corridor**: Realistic railway tracks with overhead catenary wires and moving Mumbai Local Train.
* **Physics & Arcade Driving**:
  * Drift physics, suspension roll and pitch, handbrake slides, tire burnout smoke, nitro boost, and stunt ramps.
  * Vehicle damage, engine smoke, fire, and explosions.
* **Mumbai Police System ("Mama")**:
  * 1 to 5 Wanted Stars with authentic police chatter (*"Aye ruk! Kidhar bhaagta hai!"*).
  * Lathi-wielding Havildars on foot, high-speed Police PCR Gypsies, roadblocks, and tactical response.
* **Pure Web Audio Synthesis Engine**:
  * Zero external sound asset dependencies (no 404s or broken links).
  * Procedurally synthesized vehicle engines (2-stroke rickshaw, taxi carbureted engine, bus diesel rumble, screaming supercar V8).
  * 4 Live Mumbai Radio Stations:
    1. *Bombay Disco 98.3* (Bollywood Funk & Disco)
    2. *Gully Beat 104.8* (Mumbai Desi Hip Hop)
    3. *Marine Drive Chill 92.7* (Arabian Sea Chillwave)
    4. *Dhol Tasha 101.2* (Ganpati Festival High-Energy Beats)
* **Bambaiya Smartphone**:
  * Press **`P`** to access Contacts (call fixer Babu Bhaiyya, order Taxis, bribe police), Cheats App, Radio, and DLC Store.

---

## 🚀 Quick Start

Run the game locally in your browser with zero setup:

```bash
# Start the production server
npm start
# or start development mode
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
│   │   ├── TrafficManager.js    # Mumbai ambient traffic AI
│   │   ├── PedestrianManager.js # Pedestrian AI & dropped cash
│   │   ├── PoliceSystem.js      # 5-Star Wanted Level & Mumbai Police AI
│   │   └── TrainSystem.js       # Moving Mumbai Local Train with horn
│   ├── missions/
│   │   ├── MissionManager.js    # Mission state, checkpoints, taxi hustle
│   │   └── MissionsData.js      # Story missions 1 through 5
│   ├── dlc/
│   │   ├── DLCManager.js        # Core modding framework & runtime injector
│   │   └── bundled/
│   │       ├── BandraDriftDLC.js
│   │       ├── BollywoodHeroDLC.js
│   │       └── MonsoonMadnessDLC.js
│   └── ui/
│       ├── UIManager.js         # Master HUD controller
│       ├── Minimap.js           # Circular GPS radar with rotating arrow
│       ├── PhoneUI.js           # Bambaiya smartphone with apps & cheats
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
| **`SUPERCAR`** | Spawn Bollywood Supercar |
| **`AUTO`** | Spawn Mumbai Auto Rickshaw |
| **`TAXI`** | Spawn Kaali-Peeli Taxi |
| **`MONSOON`** | Trigger Torrential Rain & Lightning |
| **`SUNSET`** | Set Golden Marine Drive Sunset |
| **`NITRO`** | Infinite Nitro (*Bandra DLC*) |
| **`BHAITIME`** | Bullet Time Slow-Mo (*Action DLC*) |

---

*Mumbai Meri Jaan! Maximum City awaits.*
