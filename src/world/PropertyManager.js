// MUMBYE: MAXIMUM CITY - Extensible Property & Real Estate Architecture
import * as THREE from 'three';

export class PropertyManager {
  constructor(game) {
    this.game = game;
    this.properties = new Map();
    this.activeSafehouse = null;
    this.respawnPropertyId = null;

    // Passive revenue timer
    this.revenueTimer = 60.0; // Payout every 60 seconds

    this.initDefaultProperties();
  }

  // Extensible Property Registration Interface (for Core Game & Community DLCs)
  registerProperty(def) {
    const property = {
      id: def.id,
      name: def.name,
      district: def.district || 'City',
      districtId: def.districtId || 'dadar',
      type: def.type || 'safehouse', // 'safehouse', 'garage', 'penthouse', 'commercial'
      price: def.price || 10000,
      isOwned: def.isOwned || false,
      description: def.description || 'Safehouse in Maximum City',
      exteriorPos: def.exteriorPos ? def.exteriorPos.clone() : new THREE.Vector3(),
      interiorPos: def.interiorPos ? def.interiorPos.clone() : new THREE.Vector3(),
      garagePos: def.garagePos ? def.garagePos.clone() : null,
      perks: {
        hasWeaponsLocker: def.perks?.hasWeaponsLocker ?? true,
        hasRespawnBed: def.perks?.hasRespawnBed ?? true,
        hasGarage: def.perks?.hasGarage ?? false,
        dailyRevenue: def.perks?.dailyRevenue || 0
      },
      signMesh: def.signMesh || null
    };

    this.properties.set(property.id, property);
    return property;
  }

  initDefaultProperties() {
    // 1. Dadar Chawl Flat #4 (Starter Safehouse - ₹5,000)
    this.registerProperty({
      id: 'dadar_chawl',
      name: 'Dadar Chawl Flat #4',
      district: 'Central Dadar Chawls',
      districtId: 'dadar',
      type: 'safehouse',
      price: 5000,
      description: 'Authentic 1BHK chawl flat with steel almirah weapon stash and charpai bed.',
      exteriorPos: new THREE.Vector3(55, 0.5, 32),
      interiorPos: new THREE.Vector3(55, 1.2, 34),
      garagePos: new THREE.Vector3(45, 0.2, 32),
      perks: {
        hasWeaponsLocker: true,
        hasRespawnBed: true,
        hasGarage: false,
        dailyRevenue: 50
      }
    });

    // 2. Bandra Sea-Breeze Villa & Garage (Mid-Tier Waterfront Estate - ₹25,000)
    this.registerProperty({
      id: 'bandra_villa',
      name: 'Bandra Sea-Breeze Villa & Garage',
      district: 'Marine Drive Waterfront',
      districtId: 'marine',
      type: 'garage',
      price: 25000,
      description: 'Sea-facing duplex with 2-car garage bay, private speedboat jetty, and Arabian Sea views.',
      exteriorPos: new THREE.Vector3(-35, 0.5, -45),
      interiorPos: new THREE.Vector3(-35, 1.2, -48),
      garagePos: new THREE.Vector3(-45, 0.2, -45),
      perks: {
        hasWeaponsLocker: true,
        hasRespawnBed: true,
        hasGarage: true,
        dailyRevenue: 250
      }
    });

    // 3. BKC AstraCorp Sky-Penthouse (Luxury High-Roller Suite - ₹75,000)
    this.registerProperty({
      id: 'bkc_penthouse',
      name: 'AstraCorp Sky-Penthouse Suite',
      district: 'BKC Cyber City',
      districtId: 'bkc',
      type: 'penthouse',
      price: 75000,
      description: 'Exclusive 52m high penthouse with executive elevator, direct helipad access, and corporate bond dividends.',
      exteriorPos: new THREE.Vector3(240, 0.5, -60),
      interiorPos: new THREE.Vector3(240, 52.5, -78),
      garagePos: new THREE.Vector3(240, 68.4, -80), // Helipad
      perks: {
        hasWeaponsLocker: true,
        hasRespawnBed: true,
        hasGarage: true,
        dailyRevenue: 1000
      }
    });
  }

  getAllProperties() {
    return Array.from(this.properties.values());
  }

  getProperty(id) {
    return this.properties.get(id);
  }

  buyProperty(id, player) {
    const prop = this.properties.get(id);
    if (!prop) return false;
    if (prop.isOwned) return false;

    if (player.cash >= prop.price) {
      player.cash -= prop.price;
      prop.isOwned = true;
      this.respawnPropertyId = prop.id;

      this.game.audioEngine?.playShopKaching();
      window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
        detail: {
          speaker: "MumbAI Real Estate",
          text: `Congratulations! You purchased ${prop.name} for ₹${prop.price.toLocaleString('en-IN')}. Set as primary safehouse.`
        }
      }));
      window.dispatchEvent(new CustomEvent('mumbye_property_purchased', { detail: { property: prop } }));
      return true;
    } else {
      window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
        detail: {
          speaker: "MumbAI Real Estate",
          text: `Insufficient funds! ${prop.name} requires ₹${prop.price.toLocaleString('en-IN')}.`
        }
      }));
      return false;
    }
  }

  enterSafehouse(prop, player) {
    this.activeSafehouse = prop;
    player.position.copy(prop.interiorPos);
    player.velocity.set(0, 0, 0);

    // Refill weapons locker if perk is active
    if (prop.perks.hasWeaponsLocker) {
      player.weapons.forEach(w => {
        if (w.ammo !== Infinity) w.ammo = w.maxAmmo || 100;
      });
      window.dispatchEvent(new CustomEvent('mumbye_ammo_changed', { detail: player.getCurrentWeapon() }));
    }

    // Set respawn point
    if (prop.perks.hasRespawnBed) {
      this.respawnPropertyId = prop.id;
    }

    this.game.audioEngine?.playShopChime();
    window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
      detail: {
        speaker: prop.name,
        text: `Entered safehouse. Weapons restocked from locker. Respawn point set.`
      }
    }));
  }

  exitSafehouse(prop, player) {
    player.position.copy(prop.exteriorPos);
    player.velocity.set(0, 0, 0);
    this.activeSafehouse = null;

    window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
      detail: { speaker: prop.name, text: `Exited to street level.` }
    }));
  }

  getRespawnPosition() {
    if (this.respawnPropertyId) {
      const prop = this.properties.get(this.respawnPropertyId);
      if (prop && prop.isOwned) {
        return prop.exteriorPos.clone();
      }
    }
    return new THREE.Vector3(20, 0, -30); // Fallback: Metro General Hospital
  }

  update(delta, player) {
    // Passive rental / dividend income from commercial/owned properties
    this.revenueTimer -= delta;
    if (this.revenueTimer <= 0) {
      this.revenueTimer = 60.0;
      let totalRevenue = 0;
      this.properties.forEach(prop => {
        if (prop.isOwned && prop.perks.dailyRevenue > 0) {
          totalRevenue += prop.perks.dailyRevenue;
        }
      });

      if (totalRevenue > 0 && player) {
        player.cash += totalRevenue;
        this.game.audioEngine?.playCoinCash();
        window.dispatchEvent(new CustomEvent('mumbye_dialog_message', {
          detail: {
            speaker: "Real Estate Dividends",
            text: `Collected ₹${totalRevenue.toLocaleString('en-IN')} passive income from your Mumbai properties!`
          }
        }));
      }
    }
  }
}
