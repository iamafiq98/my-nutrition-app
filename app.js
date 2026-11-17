function updateUI() {
  var mult = viewMode === "weekly" ? 7 : 1;
  var totalCost = 0, totalCal = 0, totalP = 0, totalC = 0, totalF = 0, totalFib = 0;
  var micros = { vitA: 0, vitB: 0, vitC: 0, vitD: 0, vitE: 0, vitK: 0, iron: 0, calc: 0, pot: 0 };
  var shopHTML = "";

  for (var i = 0; i < foods.length; i++) {
    var item = foods[i];
    var unitPrice = item.priceDiv ? (item.price / item.priceDiv) : item.price;
    var dCost = item.qty * unitPrice;
    var dCal = item.qty * item.cal;
    var dP = item.qty * item.p;

    totalCost += dCost;
    totalCal += dCal;
    totalP += dP;
    totalC += item.qty * item.c;
    totalF += item.qty * item.f;
    totalFib += item.qty * item.fib;

    for (var k in micros) {
      if (item.micros && item.micros[k]) {
        micros[k] += item.qty * item.micros[k];
      }
    }

    document.getElementById("cost_" + i).innerText = "RM" + (dCost * mult).toFixed(2);
    document.getElementById("qtyLabel_" + i).innerText = (Math.round(item.qty * mult * 10) / 10) + " " + item.unit;
    document.getElementById("calMeta_" + i).innerText = Math.round(dCal * mult) + " kcal • " + (dP * mult).toFixed(1) + "g protein";

    if (item.qty > 0) {
      var wUnits = (item.qty * 7) / (item.shopDiv || 1);
      shopHTML += '<div class="shop-row"><span>' + escapeHTML(item.name) + '</span><strong>' + wUnits.toFixed(2) + ' ' + escapeHTML(item.shopUnit || item.unit) + ' (RM' + (dCost * 7).toFixed(2) + ')</strong></div>';
    }
  }

  document.getElementById("costTitle").innerText = viewMode === "weekly" ? "Weekly Cost" : "Daily Cost";
  document.getElementById("calTitle").innerText = viewMode === "weekly" ? "Weekly Energy" : "Daily Energy";
  document.getElementById("proTitle").innerText = viewMode === "weekly" ? "Weekly Protein" : "Daily Protein";

  document.getElementById("kpiCost").innerText = "RM" + (totalCost * mult).toFixed(2);
  document.getElementById("kpiCostSub").innerText = viewMode === "weekly" ? "Daily avg: RM" + totalCost.toFixed(2) : "Weekly: RM" + (totalCost * 7).toFixed(2);
  document.getElementById("kpiCal").innerText = Math.round(totalCal * mult).toLocaleString() + " kcal";
  document.getElementById("kpiCalSub").innerText = "Target: " + Math.round(settings.energy * mult).toLocaleString() + " kcal";
  document.getElementById("kpiPro").innerText = (totalP * mult).toFixed(1) + "g";
  document.getElementById("kpiProSub").innerText = "Target: " + Math.round(settings.protein * mult) + "g";

  var goalNames = { lose: "Fat Loss", maintain: "Maintain", gain: "Muscle Gain" };
  document.getElementById("profileSummary").innerText = settings.weight + " kg • " + (goalNames[settings.goal] || "Maintain") + " • Target: " + settings.energy + " kcal | " + settings.protein + "g Protein";

  var banner = document.getElementById("statusBanner");
  var bmr = settings.bmr || 1450;
  if (totalCal < bmr) {
    banner.className = "status-pill status-danger";
    banner.innerText = "Below BMR Floor (" + Math.round(totalCal) + " / " + bmr + " kcal). Increase food portions.";
  } else if (totalCal <= settings.energy * 1.05) {
    banner.className = "status-pill status-ok";
    banner.innerText = "Safe Zone: " + Math.round(totalCal) + " kcal/day • Protein " + (totalP >= settings.protein ? "Target Met" : Math.round(settings.protein - totalP) + "g short");
  } else {
    banner.className = "status-pill status-warn";
    banner.innerText = "Surplus Zone: " + Math.round(totalCal - settings.energy) + " kcal above your daily target.";
  }

  var macroData = [
    { name: "Protein", val: totalP * mult, goal: settings.protein * mult, color: "#38bdf8" },
    { name: "Carbohydrates", val: totalC * mult, goal: (settings.energy * 0.5 / 4) * mult, color: "#10b981" },
    { name: "Dietary Fat", val: totalF * mult, goal: (settings.energy * 0.3 / 9) * mult, color: "#f59e0b" },
    { name: "Fiber", val: totalFib * mult, goal: (settings.energy / 1000 * 14) * mult, color: "#a78bfa" }
  ];
  var macroHTML = "";
  for (var m = 0; m < macroData.length; m++) {
    var md = macroData[m];
    var pct = Math.min(100, Math.round((md.val / (md.goal || 1)) * 100));
    macroHTML += '<div class="macro-row"><div class="macro-label"><span>' + md.name + '</span><strong>' + md.val.toFixed(1) + 'g / ' + Math.round(md.goal) + 'g</strong></div><div class="track"><div class="fill" style="width:' + pct + '%;background:' + md.color + ';"></div></div></div>';
  }
  document.getElementById("macroBars").innerHTML = macroHTML;

  var microList = [
    { k: "vitA", n: "Vit A" }, { k: "vitB", n: "Vit B" }, { k: "vitC", n: "Vit C" },
    { k: "vitD", n: "Vit D" }, { k: "vitE", n: "Vit E" }, { k: "vitK", n: "Vit K" },
    { k: "iron", n: "Iron" }, { k: "calc", n: "Calcium" }, { k: "pot", n: "Potassium" }
  ];
  var microHTML = "";
  for (var j = 0; j < microList.length; j++) {
    var ml = microList[j];
    var val = Math.min(100, Math.round(micros[ml.k]));
    var color = val >= 80 ? "#10b981" : (val >= 40 ? "#f59e0b" : "#f43f5e");
    microHTML += '<div class="micro-chip"><div class="micro-name">' + ml.n + '</div><div class="micro-pct" style="color:' + color + ';">' + val + '%</div></div>';
  }
  document.getElementById("microGrid").innerHTML = microHTML;

  if (shopHTML) {
    shopHTML += '<div class="shop-row" style="margin-top:8px;border-top:1px solid var(--border);"><strong>Weekly Total</strong><strong style="color:var(--accent);">RM' + (totalCost * 7).toFixed(2) + '</strong></div>';
  }
  document.getElementById("shoppingList").innerHTML = shopHTML || '<div style="color:var(--muted);font-size:0.82rem;">No foods selected.</div>';
}

function copyShoppingList() {
  var lines = ["7-Day Grocery List:"];
  var totalW = 0;
  for (var i = 0; i < foods.length; i++) {
    var item = foods[i];
    if (item.qty > 0) {
      var uPrice = item.priceDiv ? (item.price / item.priceDiv) : item.price;
      var wCost = item.qty * uPrice * 7;
      var wUnits = (item.qty * 7) / (item.shopDiv || 1);
      totalW += wCost;
      lines.push("- " + item.name + ": " + wUnits.toFixed(2) + " " + (item.shopUnit || item.unit) + " (RM" + wCost.toFixed(2) + ")");
    }
  }
  lines.push("Total Weekly Cost: RM" + totalW.toFixed(2));
  navigator.clipboard.writeText(lines.join("\n")).then(function() {
    var btn = document.getElementById("copyBtn");
    btn.innerText = "Copied!";
    setTimeout(function() { btn.innerText = "Copy List"; }, 1800);
  });
}
async function searchOnlineFood() {
  var q = document.getElementById("onlineQuery").value.trim();
  if (!q) return;
  var status = document.getElementById("searchStatus");
  var box = document.getElementById("searchResults");
  var btn = document.getElementById("searchBtn");
  btn.disabled = true;
  status.innerText = "Searching USDA & Open Food Facts...";
  box.style.display = "none";
  searchCache = [];

  try {
    var usdaRes = await fetch("https://usda.gov" + encodeURIComponent(q));
    if (usdaRes.ok) {
      var usdaData = await usdaRes.json();
      (usdaData.foods || []).forEach(function(f) {
        var getN = function(id1, id2) {
          var found = (f.foodNutrients || []).find(function(n) { return n.nutrientId === id1 || n.nutrientId === id2; });
          return found ? Number(found.value) || 0 : 0;
        };
        var vitBList = [getN(1165)/1.2, getN(1166)/1.3, getN(1167)/16, getN(1175)/1.7, getN(1178)/2.4];
        var avgVitB = Math.round((vitBList.reduce(function(a,b){return a+b;},0) / 5) * 100);
        searchCache.push({
          source: "USDA (per 100g)",
          name: f.description,
          cal: Math.round(getN(1008, 2047)),
          p: Math.round(getN(1003) * 10) / 10,
          c: Math.round(getN(1005) * 10) / 10,
          f: Math.round(getN(1004) * 10) / 10,
          fib: Math.round(getN(1079) * 10) / 10,
          micros: {
            vitA: Math.round((getN(1106) / 900) * 100),
            vitB: avgVitB,
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

  try {
    var offRes = await fetch("https://openfoodfacts.org" + encodeURIComponent(q) + "&search_simple=1&action=process&json=1&page_size=5");
    if (offRes.ok) {
      var offData = await offRes.json();
      (offData.products || []).forEach(function(p) {
        if (!p.product_name || !p.nutriments) return;
        var n = p.nutriments;
        searchCache.push({
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
  if (!searchCache.length) {
    status.innerText = "No matches found. Enter values manually below.";
    return;
  }
  status.innerText = "Click a result below to auto-fill the form:";
  box.innerHTML = searchCache.map(function(item, idx) {
    return '<div class="search-item" onclick="selectSearchItem(' + idx + ')"><strong>' + escapeHTML(item.name) + '</strong><br><span style="color:var(--muted);">' + item.source + ' • ' + item.cal + ' kcal | P:' + item.p + 'g C:' + item.c + 'g F:' + item.f + 'g</span></div>';
  }).join("");
  box.style.display = "block";
}

function selectSearchItem(idx) {
  var item = searchCache[idx];
  if (!item) return;
  var form = document.getElementById("addFoodForm");
  form.elements.name.value = item.name;
  form.elements.serving.value = 100;
  form.elements.unit.value = "g";
  form.elements.qty.value = 100;
  form.elements.cal.value = item.cal;
  form.elements.p.value = item.p;
  form.elements.c.value = item.c;
  form.elements.f.value = item.f;
  form.elements.fib.value = item.fib;
  for (var k in item.micros) {
    if (form.elements[k]) form.elements[k].value = item.micros[k];
  }
  document.getElementById("searchStatus").innerText = "Loaded! Enter the Ringgit price per 100g below and click Save.";
}

document.getElementById("addFoodForm").addEventListener("submit", function(e) {
  e.preventDefault();
  var fd = new FormData(e.target);
  var serving = Math.max(0.1, Number(fd.get("serving")) || 100);
  var unit = fd.get("unit").trim() || "g";
  var qty = Math.max(0, Number(fd.get("qty")) || 0);
  var isGram = /^(g|ml)$/i.test(unit);
  var newItem = {
    id: "food_" + Date.now(),
    name: fd.get("name").trim(),
    qty: qty,
    min: 0,
    max: Math.max(isGram ? 400 : 12, qty * 2, serving * 4),
    step: isGram ? 10 : 0.5,
    unit: unit,
    unitLabel: "RM/" + serving + unit,
    price: Math.max(0, Number(fd.get("price")) || 0),
    priceDiv: serving,
    cal: (Number(fd.get("cal")) || 0) / serving,
    p: (Number(fd.get("p")) || 0) / serving,
    c: (Number(fd.get("c")) || 0) / serving,
    f: (Number(fd.get("f")) || 0) / serving,
    fib: (Number(fd.get("fib")) || 0) / serving,
    shopUnit: isGram ? "kg" : unit,
    shopDiv: isGram ? 1000 : 1,
    micros: {}
  };
  ["vitA", "vitB", "vitC", "vitD", "vitE", "vitK", "iron", "calc", "pot"].forEach(function(k) {
    newItem.micros[k] = (Number(fd.get(k)) || 0) / serving;
  });
  foods.push(newItem);
  renderFoods();
  updateUI();
  save();
  e.target.reset();
  document.getElementById("searchResults").style.display = "none";
  closeDrawer("addDrawer");
});

function renderLibrary() {
  document.getElementById("libBtn").innerText = "Saved Library (" + library.length + ")";
  var q = (document.getElementById("librarySearch").value || "").toLowerCase();
  var html = "";
  library.forEach(function(item, idx) {
    if (item.name.toLowerCase().indexOf(q) < 0) return;
    var inPlan = foods.some(function(f) { return f.id === item.id; });
    var basis = item.priceDiv || 1;
    html += '<div class="lib-row"><div><strong>' + escapeHTML(item.name) + '</strong><br><span style="color:var(--muted);">' + Math.round(item.cal * basis) + ' kcal • ' + (item.p * basis).toFixed(1) + 'g P per ' + basis + item.unit + '</span></div>' +
      '<button class="btn" ' + (inPlan ? "disabled" : "") + ' onclick="restoreFood(' + idx + ')">' + (inPlan ? "In Plan" : "+ Add") + '</button></div>';
  });
  document.getElementById("savedFoods").innerHTML = html || '<div style="color:var(--muted);font-size:0.82rem;">No matching foods.</div>';
}

function restoreFood(idx) {
  var item = library[idx];
  if (!item || foods.some(function(f) { return f.id === item.id; })) return;
  foods.push(JSON.parse(JSON.stringify(item)));
  renderFoods();
  updateUI();
  save();
}

function fillTargets() {
  var f = document.getElementById("targetsForm");
  f.elements.weight.value = settings.weight;
  f.elements.goal.value = settings.goal;
  f.elements.proteinPerKg.value = settings.proteinPerKg;
  f.elements.bmr.value = settings.bmr || 1450;
  f.elements.energy.value = settings.energy;
  f.elements.protein.value = settings.protein;
}

function estimateTargets() {
  var f = document.getElementById("targetsForm");
  var w = Number(f.elements.weight.value) || 72.5;
  var g = f.elements.goal.value;
  var ppk = Number(f.elements.proteinPerKg.value) || 1.2;
  var mult = g === "lose" ? 24 : (g === "gain" ? 34 : 29);
  f.elements.bmr.value = Math.round(w * 20.5);
  f.elements.energy.value = Math.round(w * mult);
  f.elements.protein.value = Math.round(w * ppk);
}

document.getElementById("targetsForm").addEventListener("submit", function(e) {
  e.preventDefault();
  var fd = new FormData(e.target);
  settings = {
    weight: Number(fd.get("weight")) || 72.5,
    goal: fd.get("goal"),
    proteinPerKg: Number(fd.get("proteinPerKg")) || 1.2,
    bmr: Number(fd.get("bmr")) || 1450,
    energy: Number(fd.get("energy")) || 2000,
    protein: Number(fd.get("protein")) || 90
  };
  updateUI();
  save();
  closeDrawer("targetDrawer");
});

renderFoods();
updateUI();
renderLibrary();
