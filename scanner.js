var onlineCache = [];

// ADD NEW FOODS HERE (All values per 100g or 100ml; micros in % Daily Value / RDI)
var localMalaysianDB = [
  // POULTRY, MEAT & EGGS
  { source: "MY Staples (per 100g)", name: "Chicken Breast (Skinless, Cooked)", cal: 165, p: 31.0, c: 0, f: 3.6, fib: 0, micros: { vitA: 1, vitB: 35, vitC: 0, vitD: 1, vitE: 2, vitK: 0, iron: 6, calc: 1, pot: 6 } },
  { source: "MY Staples (per 100g)", name: "Chicken Thigh (Skinless, Cooked)", cal: 209, p: 26.0, c: 0, f: 10.9, fib: 0, micros: { vitA: 2, vitB: 28, vitC: 0, vitD: 1, vitE: 2, vitK: 2, iron: 7, calc: 1, pot: 5 } },
  { source: "MY Staples (per 100g)", name: "Chicken Drumstick (With Skin, Cooked)", cal: 216, p: 24.2, c: 0, f: 12.5, fib: 0, micros: { vitA: 3, vitB: 25, vitC: 0, vitD: 1, vitE: 3, vitK: 2, iron: 7, calc: 1, pot: 5 } },
  { source: "MY Staples (per 100g)", name: "Lean Beef / Daging Lembu (Cooked)", cal: 250, p: 26.0, c: 0, f: 15.0, fib: 0, micros: { vitA: 0, vitB: 48, vitC: 0, vitD: 1, vitE: 2, vitK: 1, iron: 14, calc: 1, pot: 7 } },
  { source: "MY Staples (per 100g)", name: "Whole Chicken Egg (Grade A)", cal: 143, p: 12.6, c: 0.7, f: 9.5, fib: 0, micros: { vitA: 18, vitB: 22, vitC: 0, vitD: 22, vitE: 7, vitK: 0, iron: 10, calc: 4, pot: 3 } },

  // FISH & SEAFOOD
  { source: "MY Staples (per 100g)", name: "Atlantic Salmon (Cooked)", cal: 208, p: 20.4, c: 0, f: 13.4, fib: 0, micros: { vitA: 2, vitB: 45, vitC: 0, vitD: 66, vitE: 8, vitK: 0, iron: 2, calc: 1, pot: 8 } },
  { source: "MY Staples (per 100g)", name: "Ikan Kembung (Indian Mackerel)", cal: 167, p: 20.8, c: 0, f: 8.6, fib: 0, micros: { vitA: 5, vitB: 52, vitC: 0, vitD: 45, vitE: 6, vitK: 0, iron: 9, calc: 2, pot: 9 } },
  { source: "MY Staples (per 100g)", name: "Ikan Siakap (Barramundi / Seabass)", cal: 124, p: 22.8, c: 0, f: 3.2, fib: 0, micros: { vitA: 3, vitB: 26, vitC: 0, vitD: 25, vitE: 5, vitK: 0, iron: 3, calc: 2, pot: 7 } },
  { source: "MY Staples (per 100g)", name: "Ikan Tilapia (Cooked)", cal: 128, p: 26.2, c: 0, f: 2.7, fib: 0, micros: { vitA: 0, vitB: 28, vitC: 0, vitD: 18, vitE: 5, vitK: 1, iron: 4, calc: 1, pot: 8 } },
  { source: "MY Staples (per 100g)", name: "Canned Tuna in Water (Drained)", cal: 116, p: 25.5, c: 0, f: 0.8, fib: 0, micros: { vitA: 2, vitB: 28, vitC: 0, vitD: 12, vitE: 3, vitK: 0, iron: 8, calc: 1, pot: 5 } },
  { source: "MY Staples (per 100g)", name: "Prawns / Udang (Cooked)", cal: 99, p: 24.0, c: 0.2, f: 0.3, fib: 0, micros: { vitA: 6, vitB: 18, vitC: 0, vitD: 2, vitE: 9, vitK: 0, iron: 3, calc: 5, pot: 4 } },
  { source: "MY Staples (per 100g)", name: "Squid / Sotong (Cooked)", cal: 120, p: 21.0, c: 4.0, f: 1.8, fib: 0, micros: { vitA: 1, vitB: 24, vitC: 5, vitD: 0, vitE: 8, vitK: 0, iron: 5, calc: 3, pot: 6 } },

  // PLANT PROTEIN & LEGUMES
  { source: "MY Staples (per 100g)", name: "Firm Tofu (Tauhu Keras)", cal: 144, p: 15.8, c: 2.8, f: 8.7, fib: 2.3, micros: { vitA: 0, vitB: 6, vitC: 0, vitD: 0, vitE: 1, vitK: 2, iron: 15, calc: 53, pot: 5 } },
  { source: "MY Staples (per 100g)", name: "Soft / Silken Tofu (Tauhu Lembut)", cal: 55, p: 4.8, c: 1.8, f: 2.7, fib: 0.2, micros: { vitA: 0, vitB: 4, vitC: 0, vitD: 0, vitE: 0, vitK: 2, iron: 6, calc: 10, pot: 3 } },
  { source: "MY Staples (per 100g)", name: "Tempeh (Cooked)", cal: 192, p: 20.3, c: 7.6, f: 10.8, fib: 5.5, micros: { vitA: 0, vitB: 18, vitC: 0, vitD: 0, vitE: 2, vitK: 0, iron: 15, calc: 9, pot: 9 } },
  { source: "MY Staples (per 100g)", name: "Edamame (Shelled, Cooked)", cal: 121, p: 11.9, c: 8.9, f: 5.2, fib: 5.2, micros: { vitA: 2, vitB: 14, vitC: 7, vitD: 0, vitE: 5, vitK: 22, iron: 13, calc: 5, pot: 9 } },
  { source: "MY Staples (per 100g)", name: "Peanut Butter (Smooth)", cal: 588, p: 25.0, c: 20.0, f: 50.0, fib: 6.0, micros: { vitA: 0, vitB: 30, vitC: 0, vitD: 0, vitE: 60, vitK: 0, iron: 11, calc: 4, pot: 14 } },

  // CARBS, RICE, BREAD & NOODLES
  { source: "MY Staples (per 100g)", name: "White Rice (Cooked / Nasi Putih)", cal: 130, p: 2.7, c: 28.2, f: 0.3, fib: 0.4, micros: { vitA: 0, vitB: 4, vitC: 0, vitD: 0, vitE: 0, vitK: 0, iron: 1, calc: 1, pot: 1 } },
  { source: "MY Staples (per 100g)", name: "Brown Rice (Cooked / Beras Perang)", cal: 112, p: 2.6, c: 23.5, f: 0.9, fib: 1.8, micros: { vitA: 0, vitB: 10, vitC: 0, vitD: 0, vitE: 1, vitK: 1, iron: 3, calc: 1, pot: 2 } },
  { source: "MY Staples (per 100g)", name: "Rolled Oats (Dry)", cal: 379, p: 13.2, c: 67.7, f: 6.5, fib: 10.1, micros: { vitA: 0, vitB: 22, vitC: 0, vitD: 0, vitE: 3, vitK: 2, iron: 24, calc: 4, pot: 8 } },
  { source: "MY Staples (per 100g)", name: "Sweet Potato / Keledek (Cooked)", cal: 90, p: 2.0, c: 20.7, f: 0.2, fib: 3.3, micros: { vitA: 107, vitB: 9, vitC: 22, vitD: 0, vitE: 5, vitK: 2, iron: 4, calc: 3, pot: 10 } },
  { source: "MY Staples (per 100g)", name: "Potato / Ubi Kentang (Boiled)", cal: 87, p: 1.9, c: 20.1, f: 0.1, fib: 1.8, micros: { vitA: 0, vitB: 10, vitC: 14, vitD: 0, vitE: 0, vitK: 2, iron: 2, calc: 1, pot: 8 } },
  { source: "MY Staples (per 100g)", name: "Bihun / Rice Vermicelli (Cooked)", cal: 109, p: 0.9, c: 24.9, f: 0.2, fib: 1.0, micros: { vitA: 0, vitB: 2, vitC: 0, vitD: 0, vitE: 0, vitK: 0, iron: 1, calc: 0, pot: 0 } },

  // VEGETABLES (SAYUR)
  { source: "MY Staples (per 100g)", name: "Broccoli (Cooked)", cal: 35, p: 2.4, c: 7.2, f: 0.4, fib: 3.3, micros: { vitA: 4, vitB: 8, vitC: 72, vitD: 0, vitE: 10, vitK: 118, iron: 4, calc: 3, pot: 6 } },
  { source: "MY Staples (per 100g)", name: "Carrots / Lobak Merah", cal: 41, p: 0.9, c: 9.6, f: 0.2, fib: 2.8, micros: { vitA: 93, vitB: 5, vitC: 7, vitD: 0, vitE: 4, vitK: 11, iron: 2, calc: 3, pot: 7 } },
  { source: "MY Staples (per 100g)", name: "Spinach / Bayam (Cooked)", cal: 23, p: 3.0, c: 3.8, f: 0.3, fib: 2.4, micros: { vitA: 58, vitB: 10, vitC: 11, vitD: 0, vitE: 14, vitK: 411, iron: 20, calc: 10, pot: 10 } },
  { source: "MY Staples (per 100g)", name: "Kangkung / Water Spinach (Cooked)", cal: 20, p: 2.1, c: 3.7, f: 0.2, fib: 1.8, micros: { vitA: 35, vitB: 6, vitC: 18, vitD: 0, vitE: 5, vitK: 95, iron: 7, calc: 4, pot: 6 } },
  { source: "MY Staples (per 100g)", name: "Sawi / Pak Choy (Cooked)", cal: 12, p: 1.6, c: 1.8, f: 0.2, fib: 1.0, micros: { vitA: 24, vitB: 5, vitC: 29, vitD: 0, vitE: 1, vitK: 28, iron: 6, calc: 7, pot: 8 } },
  { source: "MY Staples (per 100g)", name: "Cucumber / Timun", cal: 15, p: 0.7, c: 3.6, f: 0.1, fib: 0.5, micros: { vitA: 1, vitB: 2, vitC: 3, vitD: 0, vitE: 0, vitK: 14, iron: 2, calc: 1, pot: 3 } },
  { source: "MY Staples (per 100g)", name: "Tomato", cal: 18, p: 0.9, c: 3.9, f: 0.2, fib: 1.2, micros: { vitA: 5, vitB: 4, vitC: 15, vitD: 0, vitE: 4, vitK: 7, iron: 2, calc: 1, pot: 5 } },

  // FRUITS (BUAH)
  { source: "MY Staples (per 100g)", name: "Banana (Pisang Berangan / Cavendish)", cal: 89, p: 1.1, c: 22.8, f: 0.3, fib: 2.6, micros: { vitA: 0, vitB: 14, vitC: 10, vitD: 0, vitE: 1, vitK: 0, iron: 1, calc: 0, pot: 8 } },
  { source: "MY Staples (per 100g)", name: "Jackfruit (Nangka / Cempedak)", cal: 95, p: 1.7, c: 23.2, f: 0.6, fib: 1.5, micros: { vitA: 1, vitB: 12, vitC: 15, vitD: 0, vitE: 2, vitK: 0, iron: 1, calc: 2, pot: 10 } },
  { source: "MY Staples (per 100g)", name: "Apple (With Skin)", cal: 52, p: 0.3, c: 13.8, f: 0.2, fib: 2.4, micros: { vitA: 0, vitB: 2, vitC: 5, vitD: 0, vitE: 1, vitK: 2, iron: 1, calc: 0, pot: 2 } },
  { source: "MY Staples (per 100g)", name: "Grapes (Red or Green)", cal: 69, p: 0.7, c: 18.1, f: 0.2, fib: 0.9, micros: { vitA: 0, vitB: 4, vitC: 4, vitD: 0, vitE: 1, vitK: 12, iron: 2, calc: 1, pot: 4 } },
  { source: "MY Staples (per 100g)", name: "Papaya (Betik)", cal: 43, p: 0.5, c: 10.8, f: 0.3, fib: 1.7, micros: { vitA: 5, vitB: 3, vitC: 68, vitD: 0, vitE: 2, vitK: 2, iron: 1, calc: 2, pot: 4 } },
  { source: "MY Staples (per 100g)", name: "Guava (Jambu Batu)", cal: 68, p: 2.6, c: 14.3, f: 1.0, fib: 5.4, micros: { vitA: 3, vitB: 5, vitC: 254, vitD: 0, vitE: 5, vitK: 2, iron: 1, calc: 1, pot: 9 } },
  { source: "MY Staples (per 100g)", name: "Watermelon (Tembikai)", cal: 30, p: 0.6, c: 7.6, f: 0.2, fib: 0.4, micros: { vitA: 3, vitB: 3, vitC: 9, vitD: 0, vitE: 0, vitK: 0, iron: 1, calc: 1, pot: 2 } },

  // DAIRY & SOY DRINKS
  { source: "MY Staples (per 100ml)", name: "Full Cream UHT Milk (Farm Fresh / Dutch Lady)", cal: 64, p: 3.3, c: 4.8, f: 3.5, fib: 0, micros: { vitA: 5, vitB: 12, vitC: 0, vitD: 6, vitE: 1, vitK: 0, iron: 0, calc: 10, pot: 3 } },
  { source: "MY Staples (per 100ml)", name: "Unsweetened Soy Milk (Susu Soya)", cal: 33, p: 2.9, c: 1.2, f: 1.8, fib: 0.4, micros: { vitA: 0, vitB: 8, vitC: 0, vitD: 5, vitE: 1, vitK: 2, iron: 3, calc: 9, pot: 3 } }
];
// EXPANDED MALAYSIAN MILK & DAIRY BRANDS (Per 100ml or 100g)
localMalaysianDB.push(
  { source: "MY Dairy (per 100ml)", name: "Farm Fresh Pure Fresh Milk (Chilled)", cal: 65, p: 3.4, c: 4.7, f: 3.6, fib: 0, micros: { vitA: 5, vitB: 12, vitC: 0, vitD: 2, vitE: 1, vitK: 0, iron: 0, calc: 11, pot: 3 } },
  { source: "MY Dairy (per 100ml)", name: "Farm Fresh Skinny Low Fat Milk", cal: 46, p: 3.5, c: 5.0, f: 1.3, fib: 0, micros: { vitA: 5, vitB: 13, vitC: 0, vitD: 2, vitE: 0, vitK: 0, iron: 0, calc: 12, pot: 3 } },
  { source: "MY Dairy (per 100ml)", name: "Marigold HL Low Fat Milk (High Protein)", cal: 53, p: 4.5, c: 6.2, f: 1.1, fib: 0, micros: { vitA: 12, vitB: 18, vitC: 0, vitD: 15, vitE: 0, vitK: 0, iron: 0, calc: 16, pot: 4 } },
  { source: "MY Dairy (per 100ml)", name: "Dutch Lady PureFarm Low Fat Milk", cal: 45, p: 3.3, c: 4.9, f: 1.3, fib: 0, micros: { vitA: 6, vitB: 14, vitC: 0, vitD: 10, vitE: 0, vitK: 0, iron: 0, calc: 11, pot: 3 } },
  { source: "MY Dairy (per 100ml)", name: "Dutch Lady +Protein High Protein Milk", cal: 63, p: 6.0, c: 5.4, f: 1.9, fib: 0, micros: { vitA: 6, vitB: 16, vitC: 0, vitD: 10, vitE: 0, vitK: 0, iron: 0, calc: 14, pot: 4 } },
  { source: "MY Dairy (per 100ml)", name: "Goodday Fresh / Pasteurized Full Cream Milk", cal: 64, p: 3.3, c: 4.8, f: 3.5, fib: 0, micros: { vitA: 5, vitB: 12, vitC: 0, vitD: 8, vitE: 1, vitK: 0, iron: 0, calc: 11, pot: 3 } },
  { source: "MY Dairy (per 100ml)", name: "Magnolia Fresh Milk", cal: 63, p: 3.2, c: 4.8, f: 3.4, fib: 0, micros: { vitA: 5, vitB: 12, vitC: 0, vitD: 8, vitE: 1, vitK: 0, iron: 0, calc: 11, pot: 3 } },
  { source: "MY Dairy (per 100ml)", name: "V-Soy Multi-Grain / Original Soy Milk", cal: 62, p: 3.2, c: 7.5, f: 2.1, fib: 0.6, micros: { vitA: 0, vitB: 9, vitC: 0, vitD: 0, vitE: 2, vitK: 2, iron: 4, calc: 3, pot: 3 } },
  { source: "MY Dairy (per 100g)", name: "Plain Greek Yogurt (Low Fat)", cal: 73, p: 10.0, c: 3.6, f: 1.9, fib: 0, micros: { vitA: 2, vitB: 15, vitC: 0, vitD: 0, vitE: 0, vitK: 0, iron: 0, calc: 9, pot: 3 } }
);
// EXPANDED MALAYSIAN CANNED TUNA BRANDS & VARIETIES (Per 100g)
localMalaysianDB.push(
  // AYAM BRAND
  { source: "MY Tuna (per 100g)", name: "Ayam Brand Tuna Chunks/Flakes in Mineral Water", cal: 103, p: 23.0, c: 0.4, f: 1.0, fib: 0.5, micros: { vitA: 2, vitB: 28, vitC: 0, vitD: 12, vitE: 3, vitK: 0, iron: 8, calc: 1, pot: 5 } },
  { source: "MY Tuna (per 100g)", name: "Ayam Brand Tuna Chunks/Flakes in Olive Oil", cal: 198, p: 21.5, c: 0.5, f: 12.2, fib: 0.4, micros: { vitA: 2, vitB: 26, vitC: 0, vitD: 12, vitE: 10, vitK: 5, iron: 7, calc: 1, pot: 5 } },
  { source: "MY Tuna (per 100g)", name: "Ayam Brand Tuna Flakes in Sunflower Oil", cal: 204, p: 21.0, c: 0.5, f: 13.0, fib: 0.4, micros: { vitA: 2, vitB: 26, vitC: 0, vitD: 12, vitE: 18, vitK: 1, iron: 7, calc: 1, pot: 5 } },
  { source: "MY Tuna (per 100g)", name: "Ayam Brand Chili Tuna / Pedas", cal: 162, p: 17.5, c: 4.8, f: 8.1, fib: 1.2, micros: { vitA: 6, vitB: 22, vitC: 5, vitD: 10, vitE: 9, vitK: 2, iron: 7, calc: 1, pot: 6 } },
  { source: "MY Tuna (per 100g)", name: "Ayam Brand Tuna Mayonnaise (Mild / Hot)", cal: 245, p: 13.5, c: 5.2, f: 18.8, fib: 0.6, micros: { vitA: 3, vitB: 18, vitC: 0, vitD: 8, vitE: 12, vitK: 3, iron: 5, calc: 1, pot: 4 } },

  // TC BOY
  { source: "MY Tuna (per 100g)", name: "TC Boy Tuna Flakes in Mineral Water", cal: 98, p: 22.4, c: 0.3, f: 0.8, fib: 0.2, micros: { vitA: 2, vitB: 27, vitC: 0, vitD: 12, vitE: 3, vitK: 0, iron: 8, calc: 1, pot: 5 } },
  { source: "MY Tuna (per 100g)", name: "TC Boy Tuna Flakes in Vegetable / Sunflower Oil", cal: 196, p: 20.6, c: 0.5, f: 12.4, fib: 0.3, micros: { vitA: 2, vitB: 25, vitC: 0, vitD: 11, vitE: 15, vitK: 2, iron: 7, calc: 1, pot: 5 } },
  { source: "MY Tuna (per 100g)", name: "TC Boy Chili Tuna", cal: 158, p: 17.0, c: 4.5, f: 7.9, fib: 1.0, micros: { vitA: 5, vitB: 21, vitC: 4, vitD: 10, vitE: 8, vitK: 2, iron: 7, calc: 1, pot: 6 } },
  { source: "MY Tuna (per 100g)", name: "TC Boy Tuna Spread / Mayonnaise", cal: 238, p: 13.0, c: 5.8, f: 18.0, fib: 0.5, micros: { vitA: 3, vitB: 17, vitC: 0, vitD: 8, vitE: 11, vitK: 3, iron: 5, calc: 1, pot: 4 } },

  // REX
  { source: "MY Tuna (per 100g)", name: "Rex Tuna Flakes in Water / Brine", cal: 96, p: 22.0, c: 0.2, f: 0.8, fib: 0.1, micros: { vitA: 2, vitB: 26, vitC: 0, vitD: 12, vitE: 3, vitK: 0, iron: 8, calc: 1, pot: 5 } },
  { source: "MY Tuna (per 100g)", name: "Rex Tuna Flakes in Vegetable Oil", cal: 194, p: 20.4, c: 0.4, f: 12.2, fib: 0.2, micros: { vitA: 2, vitB: 25, vitC: 0, vitD: 11, vitE: 14, vitK: 2, iron: 7, calc: 1, pot: 5 } },
  { source: "MY Tuna (per 100g)", name: "Rex Chili Tuna", cal: 155, p: 16.8, c: 4.6, f: 7.6, fib: 1.0, micros: { vitA: 5, vitB: 21, vitC: 4, vitD: 10, vitE: 8, vitK: 2, iron: 7, calc: 1, pot: 6 } }
);
// EXPANDED MALAYSIAN CANNED SARDINES & BREAD VARIETIES (Per 100g)
localMalaysianDB.push(
  // SARDINES IN TOMATO SAUCE & OLIVE OIL
  { source: "MY Sardines (per 100g)", name: "Ayam Brand Sardines in Tomato Sauce", cal: 158, p: 16.5, c: 3.2, f: 8.8, fib: 0.8, micros: { vitA: 4, vitB: 38, vitC: 2, vitD: 24, vitE: 6, vitK: 2, iron: 13, calc: 22, pot: 8 } },
  { source: "MY Sardines (per 100g)", name: "Ayam Brand Sardines in Extra Virgin Olive Oil", cal: 215, p: 19.5, c: 0.5, f: 15.0, fib: 0.2, micros: { vitA: 3, vitB: 42, vitC: 0, vitD: 26, vitE: 14, vitK: 5, iron: 14, calc: 25, pot: 7 } },
  { source: "MY Sardines (per 100g)", name: "Marina / King Cup Sardines in Tomato Sauce", cal: 152, p: 15.8, c: 3.6, f: 8.2, fib: 0.7, micros: { vitA: 4, vitB: 36, vitC: 2, vitD: 22, vitE: 5, vitK: 2, iron: 12, calc: 21, pot: 8 } },
  { source: "MY Sardines (per 100g)", name: "Botan Sardines in Tomato Sauce", cal: 149, p: 15.5, c: 3.5, f: 8.0, fib: 0.7, micros: { vitA: 4, vitB: 35, vitC: 2, vitD: 22, vitE: 5, vitK: 2, iron: 12, calc: 20, pot: 8 } },

  // GARDENIA & MASSIMO BREAD VARIETIES (Per 100g)
  { source: "MY Bread (per 100g)", name: "Gardenia 100% Wholemeal Bread (Purple)", cal: 242, p: 11.5, c: 42.5, f: 2.6, fib: 6.5, micros: { vitA: 0, vitB: 28, vitC: 0, vitD: 0, vitE: 5, vitK: 2, iron: 18, calc: 9, pot: 6 } },
  { source: "MY Bread (per 100g)", name: "Gardenia Breakthru Whole Wheat (Green)", cal: 248, p: 11.2, c: 44.0, f: 2.8, fib: 5.8, micros: { vitA: 0, vitB: 26, vitC: 0, vitD: 0, vitE: 4, vitK: 2, iron: 17, calc: 10, pot: 5 } },
  { source: "MY Bread (per 100g)", name: "Gardenia Breakthru Bran & WheatGerm (Orange)", cal: 251, p: 11.8, c: 43.2, f: 3.2, fib: 6.8, micros: { vitA: 0, vitB: 30, vitC: 0, vitD: 0, vitE: 8, vitK: 2, iron: 19, calc: 9, pot: 6 } },
  { source: "MY Bread (per 100g)", name: "Gardenia Canadian Purple Wheat", cal: 245, p: 11.0, c: 44.5, f: 2.5, fib: 5.5, micros: { vitA: 0, vitB: 25, vitC: 0, vitD: 0, vitE: 4, vitK: 2, iron: 16, calc: 8, pot: 5 } },
  { source: "MY Bread (per 100g)", name: "Gardenia Original Classic White Bread", cal: 262, p: 8.8, c: 49.5, f: 3.1, fib: 2.4, micros: { vitA: 0, vitB: 22, vitC: 0, vitD: 0, vitE: 2, vitK: 1, iron: 14, calc: 9, pot: 3 } },
  { source: "MY Bread (per 100g)", name: "Gardenia Bonanza Keluarga White Bread", cal: 258, p: 8.5, c: 49.0, f: 3.0, fib: 2.2, micros: { vitA: 0, vitB: 20, vitC: 0, vitD: 0, vitE: 2, vitK: 1, iron: 13, calc: 8, pot: 3 } },
  { source: "MY Bread (per 100g)", name: "Massimo 100% Whole Wheat Loaf", cal: 244, p: 11.4, c: 43.0, f: 2.7, fib: 6.2, micros: { vitA: 0, vitB: 27, vitC: 0, vitD: 0, vitE: 5, vitK: 2, iron: 18, calc: 9, pot: 6 } },
  { source: "MY Bread (per 100g)", name: "Massimo Fine Wholemeal Bread", cal: 249, p: 10.6, c: 45.2, f: 2.8, fib: 5.0, micros: { vitA: 0, vitB: 24, vitC: 0, vitD: 0, vitE: 4, vitK: 2, iron: 16, calc: 9, pot: 5 } },
  { source: "MY Bread (per 100g)", name: "Massimo White Sandwich Loaf with Wheat Germ", cal: 260, p: 9.2, c: 48.8, f: 3.1, fib: 3.2, micros: { vitA: 0, vitB: 24, vitC: 0, vitD: 0, vitE: 5, vitK: 1, iron: 15, calc: 9, pot: 4 } }
);

function ensureTesseract() {
  return new Promise(function(resolve, reject) {
    if (window.Tesseract) return resolve(window.Tesseract);
    var cdns = [
      "https://jsdelivr.net",
      "https://unpkg.com"
    ];
    function tryLoad(idx) {
      if (idx >= cdns.length) return reject(new Error("OCR library unavailable"));
      var s = document.createElement("script");
      s.src = cdns[idx];
      s.onload = function() { window.Tesseract ? resolve(window.Tesseract) : tryLoad(idx + 1); };
      s.onerror = function() { tryLoad(idx + 1); };
      document.head.appendChild(s);
    }
    tryLoad(0);
  });
}

async function scanLabelImage(event) {
  var files = event.target.files;
  var file = files && files.length ? files : null;
  if (!file) return;

  var status = document.getElementById("ocrStatus");
  var preview = document.getElementById("ocrPreview");
  preview.src = URL.createObjectURL(file);
  preview.hidden = false;
  status.innerText = "Loading OCR engine & reading label (~5-10s)...";

  try {
    var T = await ensureTesseract();
    var result = await T.recognize(file, "eng");
    var text = (result && result.data && result.data.text) ? result.data.text : "";
    parseNutritionText(text);
    status.innerText = "Scan complete! Verify the numbers below and enter your pack price.";
  } catch (err) {
    status.innerText = "Could not load OCR scanner or photo was unclear. Enter values below.";
  }
}

function parseNutritionText(raw) {
  var clean = raw.replace(/,/g, ".").replace(/\s+/g, " ");
  var form = document.getElementById("newFoodForm");
  function findNum(patterns) {
    for (var i = 0; i < patterns.length; i++) {
      var m = clean.match(patterns[i]);
      if (m && m) return parseFloat(m);
    }
    return null;
  }
  var serving = findNum([/serving\s*size[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*(g|ml)/i, /per\s*([0-9]+(?:\.[0-9]+)?)\s*(g|ml)/i]);
  var cal = findNum([/energy[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*kcal/i, /calories[^0-9]*([0-9]+(?:\.[0-9]+)?)/i, /([0-9]+(?:\.[0-9]+)?)\s*kcal/i]);
  var protein = findNum([/protein[^0-9]*([0-9]+(?:\.[0-9]+)?)/i]);
  var carbs = findNum([/carbohydrate[s]?[^0-9]*([0-9]+(?:\.[0-9]+)?)/i]);
  var fat = findNum([/(?:total\s*)?fat[^0-9]*([0-9]+(?:\.[0-9]+)?)/i]);
  var fiber = findNum([/(?:dietary\s*)?fi(?:b|br)er[^0-9]*([0-9]+(?:\.[0-9]+)?)/i]);

  if (serving !== null) { form.elements.serving.value = serving; form.elements.qty.value = serving; }
  if (cal !== null) form.elements.cal.value = cal;
  if (protein !== null) form.elements.p.value = protein;
  if (carbs !== null) form.elements.c.value = carbs;
  if (fat !== null) form.elements.f.value = fat;
  if (fiber !== null) form.elements.fib.value = fiber;
}

function searchOnline() {
  var q = document.getElementById("onlineQuery").value.trim().toLowerCase();
  var status = document.getElementById("onlineStatus");
  var list = document.getElementById("onlineResults");
  onlineCache = [];

  if (!q) {
    onlineCache = localMalaysianDB.slice();
  } else {
    localMalaysianDB.forEach(function(item) {
      if (item.name.toLowerCase().indexOf(q) >= 0 || item.source.toLowerCase().indexOf(q) >= 0) {
        onlineCache.push(JSON.parse(JSON.stringify(item)));
      }
    });
  }

  if (!onlineCache.length) {
    list.hidden = true;
    status.innerText = "No local match for '" + q + "'. Enter label details below or add it to scanner.js.";
    return;
  }

  status.innerText = "Found " + onlineCache.length + " instant matches (tap one to auto-fill):";
  list.innerHTML = onlineCache.map(function(item, i) {
    return '<div class="res-item" onclick="pickOnlineItem(' + i + ')"><strong>' + escapeHTML(item.name) + '</strong><br><span class="muted-sm">' + item.source + ' • ' + item.cal + ' kcal | P:' + item.p + 'g C:' + item.c + 'g F:' + item.f + 'g</span></div>';
  }).join("");
  list.hidden = false;
}

function pickOnlineItem(i) {
  var item = onlineCache[i];
  if (!item) return;
  var form = document.getElementById("newFoodForm");
  var isLiquid = item.source.indexOf("100ml") >= 0;
  form.elements.name.value = item.name;
  form.elements.unit.value = isLiquid ? "ml" : "g";
  form.elements.serving.value = 100;
  form.elements.qty.value = isLiquid ? 250 : 100;
  form.elements.packSize.value = isLiquid ? 1000 : 500;
  form.elements.packUnit.value = isLiquid ? "carton (1L)" : "pack";
  form.elements.cal.value = item.cal;
  form.elements.p.value = item.p;
  form.elements.c.value = item.c;
  form.elements.f.value = item.f;
  form.elements.fib.value = item.fib;
  for (var k in item.micros) {
    if (form.elements[k]) form.elements[k].value = item.micros[k];
  }
  document.getElementById("onlineStatus").innerText = "Loaded! Adjust your pack price below and click Save.";
}
