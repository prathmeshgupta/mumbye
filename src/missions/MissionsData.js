// MUMBYE: MAXIMUM CITY - Story Missions & Side Activities
import * as THREE from 'three';

export const STORY_MISSIONS = [
  {
    id: 'm1_dabbawala',
    title: "1. The Dabbawala Rush",
    contact: "Babu Bhaiyya",
    introDialog: [
      { speaker: "Babu Bhaiyya", text: "Arey Kabir! Ek zaroori dabba CST station pe reh gaya!" },
      { speaker: "Kabir", text: "Dabbe me kya hai Bhaiyya? Biryani?" },
      { speaker: "Babu Bhaiyya", text: "Biryani nahi re khopdi! Usme Chhota Munna ke secret diamonds hai! Lunch time se pehle Bandra pohcha, fatfat!" }
    ],
    checkpoints: [
      {
        text: "Go to CST Platform and pick up the VIP Dabba",
        target: new THREE.Vector3(40, 0, 30),
        radius: 3.5,
        type: 'collect'
      },
      {
        text: "Steal an Auto Rickshaw and deliver the Dabba to Bandra Link before timer runs out!",
        target: new THREE.Vector3(-50, 4.5, -160),
        radius: 6.0,
        type: 'reach',
        timer: 90
      }
    ],
    rewardCash: 1500,
    rewardWeapon: 'katta',
    successMessage: "MISSION PASSED! You saved the diamonds! ₹1,500 awarded + Desi Katta unlocked."
  },
  {
    id: 'm2_taxi_hustle',
    title: "2. Meter Down Madness",
    contact: "Babu Bhaiyya",
    introDialog: [
      { speaker: "Babu Bhaiyya", text: "Kabir, Kaali-Peeli taxi pakad aur thoda rozi roti kama le." },
      { speaker: "Kabir", text: "Main gangster banne aaya tha, taxi driver nahi!" },
      { speaker: "Babu Bhaiyya", text: "Arey pehle raste toh samajh! Teen VIP passengers wait kar rahe hai!" }
    ],
    checkpoints: [
      {
        text: "Find and get into a Kaali-Peeli Taxi",
        target: null, // Any taxi
        type: 'enter_taxi'
      },
      {
        text: "Pick up the frantic Bollywood Director at Churchgate",
        target: new THREE.Vector3(20, 0, -60),
        radius: 5.0,
        type: 'reach'
      },
      {
        text: "Rush the Director to Gateway Plaza without crashing!",
        target: new THREE.Vector3(-20, 0, 140),
        radius: 6.0,
        type: 'reach',
        timer: 75
      }
    ],
    rewardCash: 2500,
    rewardWeapon: 'bat',
    successMessage: "MISSION PASSED! Director reached his shoot on time! ₹2,500 awarded."
  },
  {
    id: 'm3_turf_war',
    title: "3. Bhendi Bazaar Turf War",
    contact: "Chhota Munna",
    introDialog: [
      { speaker: "Chhota Munna", text: "Kabir! Raju Meter ke gundon ne Bhendi Bazaar me aatank machaya hai!" },
      { speaker: "Kabir", text: "Kaha milenge ye log?" },
      { speaker: "Chhota Munna", text: "Market chawl ke peeche lathi aur katte leke ghoom rahe hai. Unka meter down kar!" }
    ],
    checkpoints: [
      {
        text: "Go to the Bhendi Bazaar Chawl Hideout",
        target: new THREE.Vector3(90, 0, -30),
        radius: 6.0,
        type: 'reach'
      },
      {
        text: "Defeat Raju Meter's gang enforcers!",
        target: new THREE.Vector3(90, 0, -30),
        radius: 25.0,
        type: 'combat_target',
        targetCount: 4
      }
    ],
    rewardCash: 4000,
    rewardWeapon: 'ak47',
    successMessage: "MISSION PASSED! Bhendi Bazaar is now your turf! ₹4,000 + Underworld AK-47 unlocked."
  },
  {
    id: 'm4_sea_link_pursuit',
    title: "4. Sea Link High Speed Manhunt",
    contact: "Babu Bhaiyya",
    introDialog: [
      { speaker: "Babu Bhaiyya", text: "Kabir! Police ko tera pata chal gaya! Pura Mumbai Police force peeche hai!" },
      { speaker: "Kabir", text: "Fikar mat karo Bhaiyya, Sea Link pe full speed nikalta hu!" }
    ],
    checkpoints: [
      {
        text: "Get a fast vehicle and race onto the Bandra-Worli Sea Link!",
        target: new THREE.Vector3(-50, 4.5, -180),
        radius: 6.0,
        type: 'reach'
      },
      {
        text: "Hit the Stunt Ramp over the Police Roadblock and escape the 3-Star Manhunt!",
        target: new THREE.Vector3(-50, 4.5, -300),
        radius: 8.0,
        type: 'reach'
      }
    ],
    rewardCash: 6000,
    rewardWeapon: 'supercar',
    successMessage: "MISSION PASSED! Insane stunt jump! You escaped the police manhunt! ₹6,000 awarded."
  },
  {
    id: 'm5_bollywood_finale',
    title: "5. The Bollywood Finale",
    contact: "Aryan Khan (Superstar)",
    introDialog: [
      { speaker: "Aryan Khan", text: "Bhai! Film City shooting set pe underworld don Don Salim ne humko gher liya hai!" },
      { speaker: "Kabir", text: "Picture me villain ko hero maarta hai. Asal zindagi me Kabir!" }
    ],
    checkpoints: [
      {
        text: "Storm the Gateway Grand Set and eliminate Don Salim's henchmen",
        target: new THREE.Vector3(-20, 0, 160),
        radius: 12.0,
        type: 'combat_target',
        targetCount: 6
      },
      {
        text: "Escort the Superstar to the Getaway Golden Supercar!",
        target: new THREE.Vector3(-45, 0, 120),
        radius: 5.0,
        type: 'reach'
      }
    ],
    rewardCash: 15000,
    rewardWeapon: 'gold_eagle',
    successMessage: "CONGRATULATIONS! YOU HAVE CONQUERED MUMBAI! YOU ARE THE DON OF MAXIMUM CITY!"
  }
];
