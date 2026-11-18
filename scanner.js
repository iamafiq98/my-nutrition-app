var onlineCache = [];

async function scanLabelImage(event) {
  var file = event.target.files && event.target.files[0];
  if (!file) return;

  var status = document.getElementById("ocrStatus");
  var preview = document.getElementById("ocrPreview");
  preview.src = URL.createObjectURL(file);
  preview.hidden = false;
  status.innerText = "Reading label text locally... (takes ~5-10 seconds)";

  try {
    if (typeof Tesseract === "undefined") {
      status.innerText = "OCR engine still loading. Wait 3 seconds and try again.";
      return;
    }
    var result = await Tesseract.recognize(file, "eng");
    var text = (result && result.data && result.data.text) ? result.data.text : "";
    parseNutritionText(text);
    status.innerText = "Label read! Verify the auto-filled values below and enter your pack price.";
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
  status.innerText = "Searching Open Food Facts & USDA...";
  list.hidden = true;
  onlineCache = [];

  var isBarcode = /^[0-9]{8,14}$/.test(q);

  try {
    var offUrl = isBarcode
      ? "https://openfoodfacts.org" + q + ".json"
      : "https://openfoodfacts.org" + encodeURIComponent(q) + "&search_simple=1&action=process&json=1&page_size=5";
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

  if (!isBarcode) {
    try {
      var usdaRes = await fetch("https://usda.gov" + encodeURIComponent(q));
      if (usdaRes.ok) {
        var usdaJson = await usdaRes.json();
        (usdaJson.foods || []).forEach(function(f) {
          var getN = function(id1, id2) {
            var hit = (f.foodNutrients || []).find(function(x) { return x.nutrientId === id1 || x.nutrientId === id2; });
            return hit ? Number(hit.value) || 0 : 0;
          };
          var bAvg = Math.round(((getN(1165)/1.2 + getN(1166)/1.3 + getN(1167)/16 + getN(1175)/1.7 + getN(1178)/2.4) / 5) * 100);
          onlineCache.push({
            source: "USDA (per 100g)",
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
    } catch (e) {}
  }

  btn.disabled = false;
  if (!onlineCache.length) {
    status.innerText = "No matches found. Enter values manually below.";
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
