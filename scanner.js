var onlineCache = [];

var localMalaysianDB = [
  { source: "Local MY Staples (per 100g)", name: "Firm Tofu (Tauhu)", cal: 144, p: 15.8, c: 2.8, f: 8.7, fib: 2.3, micros: { vitA: 0, vitB: 6, vitC: 0, vitD: 0, vitE: 1, vitK: 2, iron: 15, calc: 53, pot: 5 } },
  { source: "Local MY Staples (per 100g)", name: "Silken / Soft Tofu", cal: 55, p: 4.8, c: 1.8, f: 2.7, fib: 0.2, micros: { vitA: 0, vitB: 4, vitC: 0, vitD: 0, vitE: 0, vitK: 2, iron: 6, calc: 10, pot: 3 } },
  { source: "Local MY Staples (per 100g)", name: "Tempeh (Cooked)", cal: 192, p: 20.3, c: 7.6, f: 10.8, fib: 5.5, micros: { vitA: 0, vitB: 18, vitC: 0, vitD: 0, vitE: 2, vitK: 0, iron: 15, calc: 9, pot: 9 } },
  { source: "Local MY Staples (per 100g)", name: "White Rice (Cooked)", cal: 130, p: 2.7, c: 28.2, f: 0.3, fib: 0.4, micros: { vitA: 0, vitB: 4, vitC: 0, vitD: 0, vitE: 0, vitK: 0, iron: 1, calc: 1, pot: 1 } },
  { source: "Local MY Staples (per 100g)", name: "Brown Rice (Cooked)", cal: 112, p: 2.6, c: 23.5, f: 0.9, fib: 1.8, micros: { vitA: 0, vitB: 10, vitC: 0, vitD: 0, vitE: 1, vitK: 1, iron: 3, calc: 1, pot: 2 } },
  { source: "Local MY Staples (per 100g)", name: "Cavendish / Berangan Banana", cal: 89, p: 1.1, c: 22.8, f: 0.3, fib: 2.6, micros: { vitA: 0, vitB: 14, vitC: 10, vitD: 0, vitE: 1, vitK: 0, iron: 1, calc: 0, pot: 8 } },
  { source: "Local MY Staples (per 100g)", name: "Papaya (Betik)", cal: 43, p: 0.5, c: 10.8, f: 0.3, fib: 1.7, micros: { vitA: 5, vitB: 3, vitC: 68, vitD: 0, vitE: 2, vitK: 2, iron: 1, calc: 2, pot: 4 } },
  { source: "Local MY Staples (per 100g)", name: "Guava (Jambu Batu)", cal: 68, p: 2.6, c: 14.3, f: 1.0, fib: 5.4, micros: { vitA: 3, vitB: 5, vitC: 254, vitD: 0, vitE: 5, vitK: 2, iron: 1, calc: 1, pot: 9 } },
  { source: "Local MY Staples (per 100ml)", name: "Full Cream UHT Milk (Farm Fresh / Dutch Lady)", cal: 64, p: 3.3, c: 4.8, f: 3.5, fib: 0, micros: { vitA: 5, vitB: 12, vitC: 0, vitD: 6, vitE: 1, vitK: 0, iron: 0, calc: 10, pot: 3 } },
  { source: "Local MY Staples (per 100g)", name: "Canned Tuna in Water (Drained)", cal: 116, p: 25.5, c: 0, f: 0.8, fib: 0, micros: { vitA: 2, vitB: 28, vitC: 0, vitD: 12, vitE: 3, vitK: 0, iron: 8, calc: 1, pot: 5 } },
  { source: "Local MY Staples (per 100g)", name: "Rolled Oats (Dry)", cal: 379, p: 13.2, c: 67.7, f: 6.5, fib: 10.1, micros: { vitA: 0, vitB: 22, vitC: 0, vitD: 0, vitE: 3, vitK: 2, iron: 24, calc: 4, pot: 8 } },
  { source: "Local MY Staples (per 100g)", name: "Peanut Butter (Smooth)", cal: 588, p: 25.0, c: 20.0, f: 50.0, fib: 6.0, micros: { vitA: 0, vitB: 30, vitC: 0, vitD: 0, vitE: 60, vitK: 0, iron: 11, calc: 4, pot: 14 } }
];

async function scanLabelImage(event) {
  var files = event.target.files;
  var file = files && files.length ? files[0] : null;
  if (!file) return;

  var status = document.getElementById("ocrStatus");
  var preview = document.getElementById("ocrPreview");
  preview.src = URL.createObjectURL(file);
  preview.hidden = false;
  status.innerText = "Reading label text locally... (takes ~5-10 seconds)";

  try {
    if (typeof Tesseract === "undefined") {
      status.innerText = "OCR engine still loading. Wait 3 seconds and tap again.";
      return;
    }
    var result = await Tesseract.recognize(file, "eng");
    var text = (result && result.data && result.data.text) ? result.data.text : "";
    parseNutritionText(text);
    status.innerText = "Label read! Verify the auto-filled numbers below and enter your pack price.";
  } catch (err) {
    status.innerText = "Could not read photo clearly. Try a sharper, well-lit close-up or type values below.";
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

  var serving = findNum([
    /serving\s*size[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*(g|ml)/i,
    /per\s*([0-9]+(?:\.[0-9]+)?)\s*(g|ml)/i
  ]);
  var cal = findNum([
    /energy[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*kcal/i,
    /calories[^0-9]*([0-9]+(?:\.[0-9]+)?)/i,
    /([0-9]+(?:\.[0-9]+)?)\s*kcal/i
  ]);
  var protein = findNum([/protein[^0-9]*([0-9]+(?:\.[0-9]+)?)/i]);
  var carbs = findNum([/carbohydrate[s]?[^0-9]*([0-9]+(?:\.[0-9]+)?)/i]);
  var fat = findNum([/(?:total\s*)?fat[^0-9]*([0-9]+(?:\.[0-9]+)?)/i]);
  var fiber = findNum([/(?:dietary\s*)?fi(?:b|br)er[^0-9]*([0-9]+(?:\.[0-9]+)?)/i]);

  if (serving !== null) {
    form.elements.serving.value = serving;
    form.elements.qty.value = serving;
  }
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
  status.innerText = "Searching local staples & Open Food Facts...";
  list.hidden = true;
  onlineCache = [];

  var lowerQ = q.toLowerCase();
  localMalaysianDB.forEach(function(item) {
    if (item.name.toLowerCase().indexOf(lowerQ) >= 0) {
      onlineCache.push(JSON.parse(JSON.stringify(item)));
    }
  });

  var isBarcode = /^[0-9]{8,14}$/.test(q);

  try {
    var offUrl = isBarcode
      ? "https://openfoodfacts.org" + q + ".json"
      : "https://openfoodfacts.org" + encodeURIComponent(q) + "&fields=product_name,nutriments&page_size=6";
    var offRes = await fetch(offUrl);
    if (offRes.ok) {
      var offJson = await offRes.json();
      var products = isBarcode ? (offJson.product ? [offJson.product] : []) : (offJson.products || []);
      products.forEach(function(p) {
        if (!p.product_name || !p.nutriments) return;
        var n = p.nutriments;
        onlineCache.push({
          source: "Open Food Facts (per 100g)",
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
      });
    }
  } catch (e) {}

  btn.disabled = false;
  if (!onlineCache.length) {
    status.innerText = "No matches found. Try a simpler word (e.g., tofu, rice, banana) or type values below.";
    return;
  }
  status.innerText = "Tap a match below to fill the form:";
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
