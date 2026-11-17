var viewMode = "daily";

var defaultFoods = [
  { id: "bread", name: "Gardenia Wholemeal Bread", qty: 9, min: 0, max: 16, step: 1, unit: "slices", unitLabel: "RM/slice", price: 0.35, cal: 75, p: 4.0, c: 13.0, f: 0.8, fib: 2.0, shopUnit: "loaves", shopDiv: 11.5, micros: { vitA: 0, vitB: 10, vitC: 0, vitD: 0, vitE: 2, vitK: 1, iron: 8, calc: 4, pot: 3 } },
  { id: "chicken", name: "Chicken Breast (Cooked)", qty: 150, min: 0, max: 400, step: 10, unit: "g", unitLabel: "RM/100g", price: 2.40, priceDiv: 100, cal: 1.65, p: 0.30, c: 0, f: 0.036, fib: 0, shopUnit: "kg", shopDiv: 1000, micros: { vitA: 1, vitB: 45, vitC: 0, vitD: 1, vitE: 2, vitK: 0, iron: 6, calc: 1, pot: 8 } },
  { id: "eggs", name: "Whole Eggs", qty: 3, min: 0, max: 10, step: 1, unit: "eggs", unitLabel: "RM/egg", price: 0.47, cal: 72, p: 6.0, c: 0.4, f: 5.0, fib: 0, shopUnit: "eggs", shopDiv: 1, micros: { vitA: 10, vitB: 12, vitC: 0, vitD: 15, vitE: 5, vitK: 0, iron: 5, calc: 3, pot: 2 } },
  { id: "whey", name: "Protein Powder (69.4%)", qty: 0, min: 0, max: 4, step: 0.5, unit: "scoops", unitLabel: "RM/scoop", price: 2.52, cal: 108, p: 20.8, c: 2.5, f: 1.5, fib: 0, shopUnit: "tubs (1.1kg)", shopDiv: 36.6, micros: { vitA: 0, vitB: 5, vitC: 0, vitD: 0, vitE: 0, vitK: 0, iron: 2, calc: 10, pot: 4 } },
  { id: "broccoli", name: "Broccoli", qty: 100, min: 0, max: 300, step: 25, unit: "g", unitLabel: "RM/100g", price: 1.00, priceDiv: 100, cal: 0.34, p: 0.028, c: 0.07, f: 0.004, fib: 0.026, shopUnit: "kg", shopDiv: 1000, micros: { vitA: 7, vitB: 8, vitC: 110, vitD: 0, vitE: 5, vitK: 115, iron: 4, calc: 5, pot: 9 } },
  { id: "carrots", name: "Carrots", qty: 100, min: 0, max: 300, step: 25, unit: "g", unitLabel: "RM/100g", price: 0.45, priceDiv: 100, cal: 0.41, p: 0.009, c: 0.10, f: 0.002, fib: 0.028, shopUnit: "kg", shopDiv: 1000, micros: { vitA: 115, vitB: 5, vitC: 7, vitD: 0, vitE: 4, vitK: 14, iron: 2, calc: 3, pot: 9 } },
  { id: "oil", name: "Cooking Oil", qty: 1.5, min: 0, max: 4, step: 0.5, unit: "tbsp", unitLabel: "RM/tbsp", price: 0.10, cal: 120, p: 0, c: 0, f: 14.0, fib: 0, shopUnit: "ml", shopDiv: 0.067, micros: { vitA: 0, vitB: 0, vitC: 0, vitD: 0, vitE: 15, vitK: 8, iron: 0, calc: 0, pot: 0 } }
];

var STORAGE_KEY = "myNutriDashboard_v4";
var foods = JSON.parse(JSON.stringify(defaultFoods));
var library = [];
var settings = { weight: 72.5, goal: "maintain", energy: 2000, protein: 90, proteinPerKg: 1.2 };
var lastShopText = "";

function cloneObj(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function rememberFoods() {
  for (var i = 0; i < foods.length; i++) {
    var food = foods[i];
    var idx = -1;
    for (var j = 0; j < library.length; j++) {
      if (library[j].id === food.id) { idx = j; break; }
    }
    if (idx < 0) library.push(cloneObj(food));
    else library[idx] = cloneObj(food);
  }
}

function save() {
  rememberFoods();
  renderLibrary();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ foods: foods, library: library, settings: settings }));
  } catch (e) {}
}

function escapeHTML(val) {
  return String(val).replace(/[&<>"']/g, function(c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function openDrawer(id) {
  closeAllDrawers();
  document.getElementById("backdrop").classList.add("open");
  document.getElementById(id).classList.add("open");
}

function closeAllDrawers() {
  document.getElementById("backdrop").classList.remove("open");
  var drawers = document.querySelectorAll(".drawer");
  for (var i = 0; i < drawers.length; i++) drawers[i].classList.remove("open");
}

function switchMobileTab(tabName) {
  var panels = ["Foods", "Macros", "Shop"];
  for (var i = 0; i < panels.length; i++) {
    var p = panels[i];
    document.getElementById("panel" + p).classList.toggle("mobile-active", p === tabName);
    document.getElementById("tab" + p).classList.toggle("active", p === tabName);
  }
}

function setMode(mode) {
  viewMode = mode;
  document.getElementById("btnDaily").className = mode === "daily" ? "toggle-btn active" : "toggle-btn";
  document.getElementById("btnWeekly").className = mode === "weekly" ? "toggle-btn active" : "toggle-btn";
  document.getElementById("macroPeriodLabel").textContent = mode === "weekly" ? "Weekly (7d) Totals" : "Daily Totals";
  updateUI();
}

function changeQty(idx, val) {
  var item = foods[idx];
  var next = Number(val);
  if (!isFinite(next) || next < 0) next = 0;
  item.qty = Math.min(100000, Math.round(next * 100) / 100);
  item.max = Math.max(item.max, item.qty);
  var slider = document.getElementById("slider_" + idx);
  var qInput = document.getElementById("quantity_" + idx);
  if (slider) { slider.max = item.max; slider.value = item.qty; }
  if (qInput) { qInput.value = item.qty; }
  save();
  updateUI();
}

function stepQty(idx, delta) {
  changeQty(idx, foods[idx].qty + delta);
}

function removeFood(idx) {
  rememberFoods();
  foods.splice(idx, 1);
  renderFoods();
  updateUI();
  save();
}

function changePrice(idx, val) {
  var value = Number(val);
  foods[idx].price = isFinite(value) ? Math.max(0, value) : 0;
  save();
  updateUI();
}

function resetDefaults() {
  rememberFoods();
  foods = cloneObj(defaultFoods);
  save();
  renderFoods();
  updateUI();
}

function renderFoods() {
  var container = document.getElementById("foodList");
  var html = "";
  for (var i = 0; i < foods.length; i++) {
    var item = foods[i];
    html += '<div class="food-card">' +
      '<div class="food-top"><span class="food-name">' + escapeHTML(item.name) + '</span><span class="food-cost" id="cost_' + i + '">RM0.00</span></div>' +
      '<div class="slider-row">' +
        '<button type="button" class="step-btn" onclick="stepQty(' + i + ', -' + item.step + ')">-</button>' +
        '<input type="range" id="slider_' + i + '" min="0" max="' + item.max + '" step="' + item.step + '" value="' + item.qty + '" oninput="changeQty(' + i + ', this.value)">' +
        '<button type="button" class="step-btn" onclick="stepQty(' + i + ', ' + item.step + ')">+</button>' +
        '<input class="qty-input" type="number" id="quantity_' + i + '" min="0" step="any" value="' + item.qty + '" onchange="changeQty(' + i + ', this.value)">' +
      '</div>' +
      '<div class="food-meta"><span id="qty_' + i + '"></span><span id="calMeta_' + i + '"></span></div>' +
      '<div class="food-meta">' +
        '<label>Price (' + escapeHTML(item.unitLabel) + '): RM <input class="price-edit" type="number" min="0" step="0.01" value="' + item.price + '" onchange="changePrice(' + i + ', this.value)"></label>' +
        '<button type="button" class="mini-del" onclick="removeFood(' + i + ')">Remove</button>' +
      '</div>' +
    '</div>';
  }
  container.innerHTML = html || '<p class="helper">No foods in plan. Click + Add Food at the top.</p>';
}

function updateUI() {
  var mult = viewMode === "weekly" ? 7 : 1;
  var totalCost = 0, totalCal = 0, totalP = 0, totalC = 0, totalF = 0, totalFib = 0;
  var micros = { vitA: 0, vitB: 0, vitC: 0, vitD: 0, vitE: 0, vitK: 0, iron: 0, calc: 0, pot: 0 };
  var shopHTML = "";
  var shopLines = ["7-Day Grocery List:"];

  for (var i = 0; i < foods.length; i++) {
    var item = foods[i];
    var unitPrice = item.priceDiv ? (item.price / item.priceDiv) : item.price;
    var dailyCost = item.qty * unitPrice;
    var dailyCal = item.qty * item.cal;
    var dailyP = item.qty * item.p;

    totalCost += dailyCost;
    totalCal += dailyCal;
    totalP += dailyP;
    totalC += item.qty * item.c;
    totalF += item.qty * item.f;
    totalFib += item.qty * item.fib;

    for (var k in micros) {
      var mVal = item.micros && item.micros[k] ? item.micros[k] : 0;
      micros[k] += item.qty * mVal;
    }

    var costEl = document.getElementById("cost_" + i);
    var qtyEl = document.getElementById("qty_" + i);
    var calEl = document.getElementById("calMeta_" + i);
    if (costEl) costEl.innerText = "RM" + (dailyCost * mult).toFixed(2);
    if (qtyEl) qtyEl.innerText = (Math.round(item.qty * mult * 10) / 10) + " " + item.unit;
    if (calEl) calEl.innerText = Math.round(dailyCal * mult) + " kcal · " + (dailyP * mult).toFixed(1) + "g protein";

    if (item.qty > 0) {
      var weeklyUnits = (item.qty * 7) / (item.shopDiv || 1);
      var lineText = item.name + ": " + weeklyUnits.toFixed(2) + " " + item.shopUnit + " (RM" + (dailyCost * 7).toFixed(2) + ")";
      shopLines.push("- " + lineText);
      shopHTML += '<div class="shop-row"><span>' + escapeHTML(item.name) + '</span><strong>' + weeklyUnits.toFixed(2) + ' ' + escapeHTML(item.shopUnit) + ' (RM' + (dailyCost * 7).toFixed(2) + ')</strong></div>';
    }
  }

  shopLines.push("Total Weekly Cost: RM" + (totalCost * 7).toFixed(2));
  lastShopText = shopLines.join("\n");

  document.getElementById("costTitle").innerText = viewMode === "weekly" ? "Weekly Cost" : "Daily Cost";
  document.getElementById("calTitle").innerText = viewMode === "weekly" ? "Weekly Energy" : "Daily Energy";
  document.getElementById("proTitle").innerText = viewMode === "weekly" ? "Weekly Protein" : "Daily Protein";

  document.getElementById("kpiCost").innerText = "RM" + (totalCost * mult).toFixed(2);
  document.getElementById("kpiCostSub").innerText = viewMode === "weekly" ? "Daily avg: RM" + totalCost.toFixed(2) : "Weekly: RM" + (totalCost * 7).toFixed(2);
  document.getElementById("kpiCal").innerText = Math.round(totalCal * mult).toLocaleString() + " kcal";
  document.getElementById("kpiCalSub").innerText = "Target: " + Math.round(settings.energy * mult).toLocaleString() + " kcal";
  document.getElementById("kpiPro").innerText = (totalP * mult).toFixed(1) + "g";
  document.getElementById("kpiProSub").innerText = "Target: " + (settings.protein * mult).toFixed(1) + "g";

  var goalNames = { lose: "Lose weight", maintain: "Maintain", gain: "Gain weight" };
  document.getElementById("profileSummary").textContent = settings.weight + " kg · " + (goalNames[settings.goal] || "Maintain") + " · Target: " + settings.energy + " kcal | " + settings.protein + "g Protein";

  var statusCard = document.getElementById("statusCard");
  var banner = document.getElementById("statusBanner");
  if (totalCal < 1450) {
    statusCard.className = "kpi status-danger";
    banner.textContent = "Below 1,450 kcal BMR floor (" + Math.round(totalCal) + " kcal/day). Add bread, eggs, or oil.";
  } else if (totalCal <= settings.energy * 1.05) {
    statusCard.className = "kpi status-ok";
    banner.textContent = "On Track: " + Math.round(totalCal) + " kcal & " + totalP.toFixed(1) + "g protein/day (Safe BMR met).";
  } else {
    statusCard.className = "kpi status-warn";
    banner.textContent = "Calorie Surplus: " + Math.round(totalCal) + " kcal/day (above " + settings.energy + " kcal target).";
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
    var pct = md.goal > 0 ? Math.min(100, Math.round((md.val / md.goal) * 100)) : 0;
    macroHTML += '<div class="macro-row">' +
      '<div class="macro-label"><span>' + md.name + '</span><strong>' + md.val.toFixed(1) + 'g / ' + Math.round(md.goal) + 'g</strong></div>' +
      '<div class="progress-track"><div class="progress-fill" style="width:' + pct + '%;background:' + md.color + ';"></div></div>' +
    '</div>';
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

  document.getElementById("shoppingList").innerHTML = shopHTML || '<p class="helper">No items selected.</p>';
}

function copyShoppingList() {
  if (!navigator.clipboard) return;
  navigator.clipboard.writeText(lastShopText).then(function() {
    var btn = document.getElementById("copyShopBtn");
    btn.textContent = "Copied!";
    setTimeout(function() { btn.textContent = "Copy List"; }, 1500);
  });
}

document.getElementById("addFoodForm").addEventListener("submit", function(e) {
  e.preventDefault();
  var fd = new FormData(e.currentTarget);
  var serving = Number(fd.get("serving")) || 1;
  var qty = Number(fd.get("qty")) || 0;
  var unit = String(fd.get("unit")).trim();
  var item = {
    id: "custom_" + Date.now(),
    name: String(fd.get("name")).trim(),
    unit: unit,
    qty: qty,
    min: 0,
    max: Math.max(400, qty, serving * 4),
    step: unit.match(/^(g|ml)$/i) ? 10 : 0.5,
    price: Number(fd.get("price")) || 0,
    priceDiv: serving,
    unitLabel: "RM/" + serving + " " + unit,
    shopUnit: unit,
    shopDiv: 1,
    cal: (Number(fd.get("cal")) || 0) / serving,
    p: (Number(fd.get("p")) || 0) / serving,
    c: (Number(fd.get("c")) || 0) / serving,
    f: (Number(fd.get("f")) || 0) / serving,
    fib: (Number(fd.get("fib")) || 0) / serving,
    micros: { vitA: 0, vitB: 0, vitC: 0, vitD: 0, vitE: 0, vitK: 0, iron: 0, calc: 0, pot: 0 }
  };
  if (!item.name || !item.unit) return;
  foods.push(item);
  renderFoods();
  updateUI();
  save();
  e.currentTarget.reset();
  closeAllDrawers();
});

function renderLibrary() {
  var q = (document.getElementById("librarySearch").value || "").toLowerCase().trim();
  document.getElementById("libCountBadge").textContent = library.length;
  var html = "";
  for (var i = 0; i < library.length; i++) {
    var item = library[i];
    if (q && item.name.toLowerCase().indexOf(q) === -1) continue;
    var active = false;
    for (var j = 0; j < foods.length; j++) {
      if (foods[j].id === item.id) { active = true; break; }
    }
    var basis = item.priceDiv || 1;
    html += '<div class="lib-row">' +
      '<div><strong>' + escapeHTML(item.name) + '</strong><div class="helper">' + Math.round(item.cal * basis) + ' kcal · ' + (item.p * basis).toFixed(1) + 'g protein / ' + basis + ' ' + escapeHTML(item.unit) + '</div></div>' +
      '<button type="button" class="btn" onclick="restoreFood(' + i + ')" ' + (active ? "disabled" : "") + '>' + (active ? "In Plan" : "+ Add") + '</button>' +
    '</div>';
  }
  document.getElementById("savedFoods").innerHTML = html || '<p class="helper">No matching saved foods.</p>';
}

function restoreFood(idx) {
  var item = library[idx];
  if (!item) return;
  for (var i = 0; i < foods.length; i++) {
    if (foods[i].id === item.id) return;
  }
  foods.push(cloneObj(item));
  renderFoods();
  updateUI();
  save();
}

document.getElementById("librarySearch").addEventListener("input", renderLibrary);

function fillTargets() {
  var form = document.getElementById("targetsForm");
  for (var k in settings) {
    if (form.elements[k]) form.elements[k].value = settings[k];
  }
}

document.getElementById("estimateTargets").addEventListener("click", function() {
  var form = document.getElementById("targetsForm");
  var w = Number(form.elements.weight.value) || 72.5;
  var g = form.elements.goal.value;
  var pKg = Number(form.elements.proteinPerKg.value) || 1.2;
  var mult = g === "lose" ? 27 : (g === "gain" ? 37 : 32);
  form.elements.energy.value = Math.round(w * mult);
  form.elements.protein.value = Math.round(w * pKg * 10) / 10;
  document.getElementById("targetHelp").textContent = "Calculated! Click Apply Targets below to update your dashboard.";
});

document.getElementById("targetsForm").addEventListener("submit", function(e) {
  e.preventDefault();
  var fd = new FormData(e.currentTarget);
  settings = {
    weight: Number(fd.get("weight")) || 72.5,
    goal: fd.get("goal") || "maintain",
    energy: Number(fd.get("energy")) || 2000,
    protein: Number(fd.get("protein")) || 90,
    proteinPerKg: Number(fd.get("proteinPerKg")) || 1.2
  };
  updateUI();
  save();
  closeAllDrawers();
});

function initialize() {
  try {
    var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.foods)) {
      foods = saved.foods;
      library = Array.isArray(saved.library) ? saved.library : [];
      if (saved.settings) settings = saved.settings;
    }
  } catch (e) {}
  rememberFoods();
  fillTargets();
  renderFoods();
  updateUI();
  renderLibrary();
}

initialize();
