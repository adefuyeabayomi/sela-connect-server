 const zonesData = {
    "mainlandA": {
      "mainlandA": { bulk: 5500, regular: 2000, express: 2500 },
      "mainlandB": { bulk: 6000, regular: 2500, express: 3000 },
      "mainlandC": { bulk: 7000, regular: 3000, express: 3500 },
      "mainlandD": { bulk: 9000, regular: 3000, express: 3500 },
      "mainlandE": { bulk: 9000, regular: 3500, express: 4000 },
      "islandA": { bulk: 5000, regular: 2500, express: 2800 },
      "islandB": { bulk: 5000, regular: 3000, express: 3500 },
      "islandC": { bulk: 8000, regular: 4000, express: 4500 },
    },
    "mainlandB": {
      "mainlandA": { bulk: 6000, regular: 2500, express: 3000 },
      "mainlandB": { bulk: 6000, regular: 2500, express: 3000 },
      "mainlandC": { bulk: 7000, regular: 2500, express: 3000 },
      "mainlandD": { bulk: 7500, regular: 3000, express: 3500 },
      "mainlandE": { bulk: 9000, regular: 3500, express: 4000 },
      "islandA": { bulk: 5000, regular: 2500, express: 3000 },
      "islandB": { bulk: 5500, regular: 3000, express: 3500 },
      "islandC": { bulk: 8000, regular: 4000, express: 5000 },
    },
    "mainlandC": {
      "mainlandA": { bulk: 7000, regular: 3000, express: 3500 },
      "mainlandB": { bulk: 7000, regular: 2500, express: 3000 },
      "mainlandC": { bulk: 7000, regular: 2000, express: 2500 },
      "mainlandD": { bulk: 7000, regular: 3000, express: 3500 },
      "mainlandE": { bulk: 8000, regular: 4000, express: 4500 },
      "islandA": { bulk: 8000, regular: 3000, express: 3500 },
      "islandB": { bulk: 9000, regular: 4000, express: 4500 },
      "islandC": { bulk: 10000, regular: 4500, express: 5000 },
    },
    "mainlandD": {
      "mainlandA": { bulk: 7000, regular: [2500, 3500], express: [3000, 4000] },
      "mainlandB": { bulk: 6000, regular: [2500, 3000], express: [3000, 3500] },
      "mainlandC": { bulk: 6000, regular: [3000, 3500], express: 3500 },
      "mainlandD": { bulk: 6000, regular: [2500, 3500], express: [2500, 3500] },
      "mainlandE": { bulk: 8000, regular: [3500, 4500], express: [4000, 5500] },
      "islandA": { bulk: 7000, regular: [3000, 4000], express: [3500, 4500] },
      "islandB": { bulk: 8000, regular: [4000, 4500], express: [4500, 5500] },
      "islandC": { bulk: 10000, regular: [4500, 6000], express: [5000, 7000] },
    },
    "mainlandE": {
      "mainlandA": { bulk: 7500, regular: 3500, express: 4000 },
      "mainlandB": { bulk: 7500, regular: 3500, express: 4000 },
      "mainlandC": { bulk: 8000, regular: 4000, express: 5000 },
      "mainlandD": { bulk: 8000, regular: [3500, 4500], express: [4500, 5500] },
      "mainlandE": { bulk: 5000, regular: 2500, express: 3000 },
      "islandA": { bulk: 7000, regular: 3500, express: 4500 },
      "islandB": { bulk: 10000, regular: 5000, express: 5500 },
      "islandC": { bulk: 10000, regular: 6000, express: 7000 },
    },
    "islandA": {
      "mainlandA": { bulk: 9000, regular: 2500, express: 3000 },
      "mainlandB": { bulk: 7500, regular: 3000, express: 3500 },
      "mainlandC": { bulk: 8000, regular: 3500, express: 4000 },
      "mainlandD": { bulk: 7000, regular: [3000, 4000], express: [3500, 4500] },
      "mainlandE": { bulk: 7000, regular: 3500, express: 4500 },
      "islandA": { bulk: 6500, regular: 2000, express: 2500 },
      "islandB": { bulk: 7000, regular: 2500, express: 3000 },
    },
    "islandB": {
      "mainlandA": { bulk: 9000, regular: 3500, express: 4000 },
      "mainlandB": { bulk: 9000, regular: 3500, express: 4000 },
      "mainlandC": { bulk: 9000, regular: 4000, express: 4500 },
      "mainlandD": { bulk: 9000, regular: [4000, 4500], express: [4500, 5000] },
      "mainlandE": { bulk: 10000, regular: 5000, express: 5500 },
      "islandA": { bulk: 7000, regular: 2500, express: 3000 },
      "islandB": { bulk: 6500, regular: 2000, express: 2500 },
      "islandC": { bulk: 7000, regular: 3500, express: 4000 },
    },
    "islandC": {
      "mainlandA": { bulk: 9000, regular: 3500, express: 4000 },
      "mainlandB": { bulk: 9000, regular: 3500, express: 4000 },
      "mainlandC": { bulk: 9000, regular: 4000, express: 4500 },
      "mainlandD": { bulk: 9500, regular: 4500, express: 5000 },
      "mainlandE": { bulk: 10000, regular: 6000, express: 7000 },
      "islandA": { bulk: 7000, regular: 3500, express: 4000 },
      "islandB": { bulk: 6500, regular: 3000, express: 3500 },
      "islandC": { bulk: 5500, regular: 2500, express: 3000 },
    }
  };

  const areasByZone = {
    mainlandA: [
      "Surulere", "Costain", "Mushin", "Obanikoro", "Onipanu", "Orile", "Ijora", 
      "Oyingbo", "Yaba", "Ebutte-Metta", "Lawanson"
    ],
    mainlandB: [
      "Oshodi", "Ikeja", "Ogba", "Agege", "Ojodu-Berger", "Ojota", "Ajao Estate", 
      "Oworonshoki", "Shomolu", "Gbagada", "Bariga", "Anthony/Maryland", 
      "Ifako-Ijaiye", "Ketu", "Mile 12"
    ],
    mainlandC: [
      "Abule Egba", "Ipaja", "Sango Ota", "Ayobo", "Meiran", "Ikotun-Igando", "Idimu"
    ],
    mainlandD: [
      "Okokomaiko", "Ojo Alaba", "Satellite Town", "Mile 2", "Apapa", "Amuwo Odofin", 
      "LASU", "Festac Town", "Iju Ishaga"
    ],
    mainlandE: [
      "Ikorodu"
    ],
    mainlandF: [
      "Badagry", "Agbara", "Ijanikin", "Oko Afo"
    ],
    islandA: [
      "Lagos Island", "Ikoyi", "Obalende", "Banana Island", "Marina", "Oniru"
    ],
    islandB: [
      "Ikate", "Ikota", "Lekki Phase 1", "Oniru"
    ],
    islandC: [
      "Osapa London", "Agungi", "Ikota", "Chevron", "Ajah", "VGC", "Badore", 
      "Abraham Adesanya", "Lekki Phase 2"
    ],
    islandD: [
      "Ogombo", "Sangotedo", "Awoyaya", "Epe", "Ibeju", "Lakowe"
    ]
  };
  
  function determineZone(area) {
    for (const [zone, areas] of Object.entries(areasByZone)) {
      if (areas.includes(area)) {
        return zone;
      }
    }
    return null; // Return null if the area is not found in any zone
  }

  module.exports = {
    zonesData,
    determineZone
  }