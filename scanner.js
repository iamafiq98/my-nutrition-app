var USDA_KEY = localStorage.getItem("usda_api_key") || "DEMO_KEY";
var onlineCache = [];

function saveUsdaKey(val) {
  USDA_KEY = val.trim() || "DEMO_KEY";
  localStorage.setItem("usda_api_key", USDA_KEY);
  document.getElementById("onlineStatus").innerText = "Personal USDA key saved privately to this device!";
}

var localMalaysianDB = [
  { source: "Verified Whole Foods (per 100g)", name: "Atlantic Salmon (Cooked / Raw)", cal: 208, p: 20.4, c: 0, f: 13.4, fib: 0, micros: { vitA: 2, vitB: 45, vitC: 0, vitD: 66, vitE: 8, vitK: 0, iron: 2, calc: 1, pot: 8 } },
  { source: "Verified Whole Foods (per 100g)", name: "Ikan Kembung / Indian Mackerel", cal: 167, p: 20.8, c: 0, f: 8.6, fib: 0, micros: { vitA: 5, vitB: 52, vitC: 0, vitD: 45, vitE: 6, vitK: 0, iron: 9, calc: 2, pot: 9 } },
  { source: "Verified Whole Foods (per 100g)", name: "Prawns / Shrimp (Cooked)", cal: 99, p: 24.0, c: 0.2, f: 0.3, fib: 0, micros: { vitA: 6, vitB: 18, vitC: 0, vitD: 2, vitE: 9, vitK: 0, iron: 3, calc: 5, pot: 4 } },
  { source: "Verified Whole Foods (per 100g)", name: "Lean Beef (Cooked)", cal: 250, p: 26.0, c: 0, f: 15.0, fib: 0, micros: { vitA: 0, vitB: 48, vitC: 0, vitD: 1, vitE: 2, vitK: 1, iron: 14, calc: 1, pot: 7 } },
  { source: "Verified Whole Foods (per 100g)", name: "Jackfruit (Nangka / Cempedak)", cal: 95, p: 1.7, c: 23.2, f: 0.6, fib: 1.5, micros: { vitA: 1, vitB: 12, vitC: 15, vitD: 0, vitE: 2, vitK: 0, iron: 1, calc: 2, pot: 10 } },
  { source: "Verified Whole Foods (per 100g)", name: "Apple (With Skin)", cal: 52, p: 0.3, c: 13.8, f: 0.2, fib: 2.4, micros: { vitA: 0, vitB: 2, vitC: 5, vitD: 0, vitE: 1, vitK: 2, iron: 1, calc: 0, pot: 2 } },
  { source: "Verified Whole Foods (per 100g)", name: "Red or Green Grapes", cal: 69, p: 0.7, c: 18.1, f: 0.2, fib: 0.9, micros: { vitA: 0, vitB: 4, vitC: 4, vitD: 0, vitE: 1, vitK: 12, iron: 2, calc: 1, pot: 4 } },
  { source: "Verified Whole Foods (per 100g)", name: "Cavendish / Berangan Banana", cal: 89, p: 1.1, c: 22.8, f: 0.3, fib: 2.6, micros: { vitA: 0, vitB: 14, vitC: 10, vitD: 0, vitE: 1, vitK: 0, iron: 1, calc: 0, pot: 8 } },
  { source: "Verified Whole Foods (per 100g)", name: "Papaya (Betik)", cal: 43, p: 0.5, c: 10.8, f: 0.3, fib: 1.7, micros: { vitA: 5, vitB: 3, vitC: 68, vitD: 0, vitE: 2, vitK: 2, iron: 1, calc: 2, pot: 4 } },
  { source: "Verified Whole Foods (per 100g)", name: "Guava (Jambu Batu)", cal: 68, p: 2.6, c: 14.3, f: 1.0, fib: 5.4, micros: { vitA: 3, vitB: 5, vitC: 254, vitD: 0, vitE: 5, vitK: 2, iron: 1, calc: 1, pot: 9 } },
  { source: "Verified Whole Foods (per 100g)", name: "Firm Tofu (Tauhu)", cal: 144, p: 15.8, c: 2.8, f: 8.7, fib: 2.3, micros: { vitA: 0, vitB: 6, vitC: 0, vitD: 0, vitE: 1, vitK: 2, iron: 15, calc: 53, pot: 5 } },
  { source: "Verified Whole Foods (per 100g)", name: "Tempeh (Cooked)", cal: 192, p: 20.3, c: 7.6, f: 10.8, fib: 5.5, micros: { vitA: 0, vitB: 18, vitC: 0, vitD: 0, vitE: 2, vitK: 0, iron: 15, calc: 9, pot: 9 } },
  { source: "Verified Whole Foods (per 100g)", name: "White Rice (Cooked)", cal: 130, p: 2.7, c: 28.2, f: 0.3, fib: 0.4, micros: { vitA: 0, vitB: 4, vitC: 0, vitD: 0, vitE: 0, vitK: 0, iron: 1, calc: 1, pot: 1 } },
  { source: "Verified Whole Foods (per 100g)", name: "Brown Rice (Cooked)", cal: 112, p: 2.6, c: 23.5, f: 0.9, fib: 1.8, micros: { vitA: 0, vitB: 10, vitC: 0, vitD: 0, vitE: 1, vitK: 1, iron: 3, calc: 1, pot: 2 } },
  { source: "Verified Whole Foods (per 100g)", name: "Sweet Potato / Keledek (Cooked)", cal: 90, p: 2.0, c: 20.7, f: 0.2, fib: 3.3, micros: { vitA: 107, vitB: 9, vitC: 22, vitD: 0, vitE: 5, vitK: 2, iron: 4, calc: 3, pot: 10 } },
  { source: "Verified Whole Foods (per 100g)", name: "Spinach / Bayam (Cooked)", cal: 23, p: 3.0, c: 3.8, f: 0.3, fib: 2.4, micros: { vitA: 58, vitB: 10, vitC: 11, vitD: 0, vitE: 14, vitK: 411, iron: 20, calc: 10, pot: 10 } },
  { source: "Verified Whole Foods (per 100ml)", name: "Full Cream UHT Milk", cal: 64, p: 3.3, c: 4.8, f: 3.5, fib: 0, micros: { vitA: 5, vitB: 12, vitC: 0, vitD: 6, vitE: 1, vitK: 0, iron: 0, calc: 10, pot: 3 } },
  { source: "Verified Whole Foods (per 100g)", name: "Canned Tuna in Water", cal: 116, p: 25.5, c: 0, f: 0.8, fib: 0, micros: { vitA: 2, vitB: 28, vitC: 0, vitD: 12, vitE: 3, vitK: 0, iron: 8, calc: 1, pot: 5 } },
  { source: "Verified Whole Foods (per 100g)", name: "Rolled Oats (Dry)", cal: 379, p: 13.2, c: 67.7, f: 6.5, fib: 10.1, micros: { vitA: 0, vitB: 22, vitC: 0, vitD: 0, vitE: 3, vitK: 2, iron: 24, calc: 4, pot: 8 } },
  { source: "Verified Whole Foods (per 100g)", name: "Peanut Butter (Smooth)", cal: 588, p: 25.0, c: 20.0, f: 50.0, fib: 6.0, micros: { vitA: 0, vitB: 30, vitC: 0, vitD: 0, vitE: 60, vitK: 0, iron: 11, calc: 4, pot: 14 } }
];

function ensureTesseract() {
  return new Promise(function(resolve, reject) {
    if (window.Tesseract) return resolve(window.Tesseract);
    var cdns = [
      "https://jsdelivr.net",
      "https://unpkg.com"
    ];
    function tryLoad(idx) {
      if (idx >= cdns.length) return reject(new Error("OCR library blocked"));
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
  var file = files && files.length ? files[0] : null;
  if (!file) return;

  var status = document.getElementById("ocrStatus");
  var preview = document.getElementById("ocrPreview");
  preview.src = URL.createObjectURL(file);
  preview.hidden = false;
  status.innerText = "Loading OCR engine & scanning photo (~5-10s)...";

  try {
    var T = await ensureTesseract();
    var result = await T.recognize(file, "eng");
    var text = (result && result.data && result.data.text) ? result.data.text : "";
    parseNutritionText(text);
    status.innerText = "Scan complete! Check the auto-filled values below and enter your price.";
  } catch (err) {
    status.innerText = "Could not load OCR scanner (check internet connection) or photo was unclear.";
  }
}

function parseNutritionText(raw) {
  var clean = raw.replace(/,/g, ".").replace(/\s+/g, " ");
  var form = document.getElementById("newFoodForm");
  function findNum(patterns) {
    for (var i = 0; i < patterns.length; i++) {
      var m = clean.match(patterns[i]);
      if (m && m[1]) return parseFloat(m[1]);
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
async function searchOnline() {
  var q = document.getElementById("onlineQuery").value.trim();
  if (!q) return;
  var status = document.getElementById("onlineStatus");
  var list = document.getElementById("onlineResults");
  var btn = document.getElementById("onlineBtn");

  btn.disabled = true;
  status.innerText = "Searching live USDA database...";
  list.hidden = true;
  onlineCache = [];

  var isBarcode = /^[0-9]{8,14}$/.test(q);
  var apiError = "";

  if (isBarcode) {
    try {
      var offRes = await fetch("https://openfoodfacts.org" + q + ".json");
      if (offRes.ok) {
        var offJson = await offRes.json();
        if (offJson.product && offJson.product.product_name) {
          var p = offJson.product, n = p.nutriments || {};
          onlineCache.push({
            source: "Open Food Facts Barcode (per 100g)",
            name: p.product_name,
            cal: Math.round(Number(n["energy-kcal_100g"]) || 0),
            p: Math.round((Number(n.proteins_100g) || 0) * 10) / 10,
            c: Math.round((Number(n.carbohydrates_100g) || 0) * 10) / 10,
            f: Math.round((Number(n.fat_100g) || 0) * 10) / 10,
            fib: Math.round((Number(n.fiber_100g) || 0) * 10) / 10,
            micros: {
              vitA: Math.round(((Number(n["vitamin-a_100g"]) || 0) * 1000000 / 900) * 100),
              vitB: 0,
              vitC: Math.round(((Number(n["vitamin-c_100g"]) || 0) * 1000 / 90) * 100),
              vitD: Math.round(((Number(n["vitamin-d_100g"]) || 0) * 1000000 / 20) * 100),
              vitE: Math.round(((Number(n["vitamin-e_100g"]) || 0) * 1000 / 15) * 100),
              vitK: Math.round(((Number(n["vitamin-k_100g"]) || 0) * 1000000 / 120) * 100),
              iron: Math.round(((Number(n.iron_100g) || 0) * 1000 / 18) * 100),
              calc: Math.round(((Number(n.calcium_100g) || 0) * 1000 / 1300) * 100),
              pot: Math.round(((Number(n.potassium_100g) || 0) * 1000 / 4700) * 100)
            }
          });
        }
      }
    } catch (e) { apiError = "Barcode lookup failed."; }
  } else {
    try {
      var usdaRes = await fetch("https://usda.gov" + encodeURIComponent(USDA_KEY) + "&pageSize=10&query=" + encodeURIComponent(q));
      if (usdaRes.status === 429) {
        apiError = "USDA DEMO_KEY rate limit reached. Paste your free key above.";
      } else if (usdaRes.status === 403) {
        apiError = "Invalid USDA API key. Check your key or clear the box.";
      } else if (usdaRes.ok) {
        var usdaJson = await usdaRes.json();
        (usdaJson.foods || []).forEach(function(f) {
          var getN = function(id1, id2) {
            var hit = (f.foodNutrients || []).find(function(x) { return x.nutrientId === id1 || x.nutrientId === id2; });
            return hit ? Number(hit.value) || 0 : 0;
          };
          var bAvg = Math.round(((getN(1165)/1.2 + getN(1166)/1.3 + getN(1167)/16 + getN(1175)/1.7 + getN(1178)/2.4) / 5) * 100);
          onlineCache.push({
            source: "Live USDA (" + (f.dataType || "100g") + ")",
            name: f.description,
            cal: Math.round(getN(1008, 2047)),
            p: Math.round(getN(1003) * 10) / 10,
            c: Math.round(getN(1005) * 10) / 10,
            f: Math.round(getN(1004) * 10) / 10,
            fib: Math.round(getN(1079) * 10) / 10,
            micros: {
              vitA: Math.round((getN(1106) / 900) * 100),
              vitB: bAvg,
              vitC: Math.round((getN(1162) / 90) * 100),
              vitD: Math.round((getN(1114) / 20) * 100),
              vitE: Math.round((getN(1109) / 15) * 100),
              vitK: Math.round((getN(1185) / 120) * 100),
              iron: Math.round((getN(1089) / 18) * 100),
              calc: Math.round((getN(1087) / 1300) * 100),
              pot: Math.round((getN(1092) / 4700) * 100)
            }
          });
        });
      }
    } catch (e) { apiError = "Network error reaching USDA API."; }
  }

  var lowerQ = q.toLowerCase();
  localMalaysianDB.forEach(function(item) {
    if (item.name.toLowerCase().indexOf(lowerQ) >= 0) {
      onlineCache.push(JSON.parse(JSON.stringify(item)));
    }
  });

  btn.disabled = false;
  if (!onlineCache.length) {
    status.innerText = apiError || "No matches found for '" + q + "'.";
    return;
  }
  status.innerText = (apiError ? apiError + " Showing local matches:" : "Found " + onlineCache.length + " live matches (tap to fill):");
  list.innerHTML = onlineCache.map(function(item, i) {
    return '<div class="res-item" onclick="pickOnlineItem(' + i + ')"><strong>' + escapeHTML(item.name) + '</strong><br><span class="muted-sm">' + item.source + ' • ' + item.cal + ' kcal | P:' + item.p + 'g C:' + item.c + 'g F:' + item.f + 'g</span></div>';
  }).join("");
  list.hidden = false;
}

function pickOnlineItem(i) {
  var item = onlineCache[i];
  if (!item) return;
  var form = document.getElementById("newFoodForm");
  form.elements.name.value = item.name;
  form.elements.unit.value = "g";
  form.elements.serving.value = 100;
  form.elements.qty.value = 100;
  form.elements.cal.value = item.cal;
  form.elements.p.value = item.p;
  form.elements.c.value = item.c;
  form.elements.f.value = item.f;
  form.elements.fib.value = item.fib;
  for (var k in item.micros) {
    if (form.elements[k]) form.elements[k].value = item.micros[k];
  }
  document.getElementById("onlineStatus").innerText = "Loaded! Enter your store pack size & price below, then click Save.";
}
