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

var defaultSettings = { weight: 72.5, goal: "maintain", energy: 1650, protein: 95, proteinPerKg: 1.3 };

var foods = [];
var library = [];
var settings = {};

function loadState() {
  try {
    var saved = JSON.parse(localStorage.getItem("myNutriDashboard_v1"));
    if (saved && Array.isArray(saved.foods)) {
      foods = saved.foods;
      library = Array.isArray(saved.library) ? saved.library : [];
      settings = saved.settings ? Object.assign({}, defaultSettings, saved.settings) : Object.assign({}, defaultSettings);
      return;
    }
  } catch (e) {}
  foods = JSON.parse(JSON.stringify(defaultFoods));
  library = JSON.parse(JSON.stringify(defaultFoods));
  settings = Object.assign({}, defaultSettings);
  saveState();
}

function saveState() {
  for (var i = 0; i < foods.length; i++) {
    var idx = -1;
    for (var j = 0; j < library.length; j++) {
      if (library[j].id === foods[i].id) { idx = j; break; }
    }
    var copy = JSON.parse(JSON.stringify(foods[i]));
    if (idx === -1) library.push(copy);
    else library[idx] = copy;
  }
  localStorage.setItem("myNutriDashboard_v1", JSON.stringify({ foods: foods, library: library, settings: settings }));
  document.getElementById("libCount").innerText = library.length;
}

function escapeHTML(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function setMode(mode) {
  viewMode = mode;
  document.getElementById("btnDaily").className = mode === "daily" ? "toggle-btn active" : "toggle-btn";
  document.getElementById("btnWeekly").className = mode === "weekly" ? "toggle-btn active" : "toggle-btn";
  updateUI();
}

function switchMobileTab(panelId, btn) {
  var panels = document.querySelectorAll(".col-panel");
  for (var i = 0; i < panels.length; i++) panels[i].classList.remove("mob-active");
  document.getElementById(panelId).classList.add("mob-active");

  var tabs = document.querySelectorAll(".mob-tab");
  for (var j = 0; j < tabs.length; j++) tabs[j].classList.remove("active");
  btn.classList.add("active");
}

function openDrawer(id) {
  if (id === "drawerLib") renderLibrary();
  if (id === "drawerTargets") fillTargetsForm();
  document.getElementById(id).classList.add("open");
}

function closeDrawer(id) {
  document.getElementById(id).classList.remove("open");
}

function closeDrawerOnBg(e, id) {
  if (e.target.id === id) closeDrawer(id);
}

function changeQty(idx, val) {
  var next = parseFloat(val);
  if (isNaN(next) || next < 0) next = 0;
  next = Math.round(next * 100) / 100;
  foods[idx].qty = next;
  if (next > foods[idx].max) foods[idx].max = next;
  var slider = document.getElementById("slider_" + idx);
  var numBox = document.getElementById("num_" + idx);
  if (slider) { slider.max = foods[idx].max; slider.value = next; }
  if (numBox) { numBox.value = next; }
  saveState();
  updateUI();
}

function stepQty(idx, delta) {
  changeQty(idx, foods[idx].qty + delta);
}

function changePrice(idx, val) {
  var p = parseFloat(val);
  foods[idx].price = (!isNaN(p) && p >= 0) ? p : 0;
  saveState();
  updateUI();
}

function removeFood(idx) {
  foods.splice(idx, 1);
  saveState();
  renderFoods();
  updateUI();
}

function resetDefaults() {
  foods = JSON.parse(JSON.stringify(defaultFoods));
  saveState();
  renderFoods();
  updateUI();
}

function renderFoods() {
  var container = document.getElementById("foodList");
  if (!foods.length) {
    container.innerHTML = '<div style="color:var(--muted);font-size:0.85rem;padding:12px;">No foods in dashboard. Click <strong>+ Add Food</strong> or open <strong>Saved Library</strong>.</div>';
    return;
  }
  var html = "";
  for (var i = 0; i < foods.length; i++) {
    var item = foods[i];
    html += '<div class="food-card">' +
      '<div class="food-row1">' +
        '<span class="food-title">' + escapeHTML(item.name) + '</span>' +
        '<span class="food-price-tag" id="cost_' + i + '">RM0.00</span>' +
      '</div>' +
      '<div class="slider-controls">' +
        '<button type="button" class="step-btn" onclick="stepQty(' + i + ', -' + item.step + ')">−</button>' +
        '<input type="range" id="slider_' + i + '" min="0" max="' + item.max + '" step="' + item.step + '" value="' + item.qty + '" oninput="changeQty(' + i + ', this.value)" />' +
        '<button type="button" class="step-btn" onclick="stepQty(' + i + ', ' + item.step + ')">+</button>' +
        '<input type="number" class="qty-num" id="num_' + i + '" step="any" min="0" value="' + item.qty + '" onchange="changeQty(' + i + ', this.value)" />' +
      '</div>' +
      '<div class="food-row3">' +
        '<span id="meta_' + i + '">0 kcal • 0g P</span>' +
        '<span>RM <input type="number" step="0.01" min="0" class="inline-price" value="' + item.price.toFixed(2) + '" onchange="changePrice(' + i + ', this.value)" /> (' + escapeHTML(item.unitLabel) + ') &nbsp;|&nbsp; <button type="button" class="del-btn" onclick="removeFood(' + i + ')">Remove</button></span>' +
      '</div>' +
    '</div>';
  }
  container.innerHTML = html;
}

var lastShopText = "";

function updateUI() {
  var mult = viewMode === "weekly" ? 7 : 1;
  var totalCost = 0, totalCal = 0, totalP = 0, totalC = 0, totalF = 0, totalFib = 0;
  var micros = { vitA: 0, vitB: 0, vitC: 0, vitD: 0, vitE: 0, vitK: 0, iron: 0, calc: 0, pot: 0 };
  var shopHTML = "";
  var shopLines = [];

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

    if (item.micros) {
      var microMult = item.priceDiv ? (item.qty / item.priceDiv) : item.qty;
      for (var k in micros) {
        micros[k] += microMult * (item.micros[k] || 0);
      }
    }

    var costEl = document.getElementById("cost_" + i);
    var metaEl = document.getElementById("meta_" + i);
    if (costEl) costEl.innerText = "RM" + (dCost * mult).toFixed(2);
    if (metaEl) metaEl.innerText = (Math.round(item.qty * mult * 10) / 10) + " " + item.unit + " • " + Math.round(dCal * mult) + " kcal • " + (dP * mult).toFixed(1) + "g P";

    if (item.qty > 0) {
      var wAmt = (item.qty * 7) / item.shopDiv;
      var wCost = (dCost * 7).toFixed(2);
      shopHTML += '<div class="shop-item">' +
        '<div><div>' + escapeHTML(item.name) + '</div><div class="shop-sub">RM' + wCost + ' / week</div></div>' +
        '<div class="shop-qty">' + wAmt.toFixed(2) + ' ' + escapeHTML(item.shopUnit) + '</div>' +
      '</div>';
      shopLines.push("- " + item.name + ": " + wAmt.toFixed(2) + " " + item.shopUnit + " (RM" + wCost + ")");
    }
  }

  lastShopText = "7-Day Grocery List (Total: RM" + (totalCost * 7).toFixed(2) + "):
" + shopLines.join("
");

  document.getElementById("lblCost").innerText = viewMode === "weekly" ? "Weekly Cost (7d)" : "Daily Cost";
  document.getElementById("lblCal").innerText = viewMode === "weekly" ? "Weekly Energy (7d)" : "Daily Energy";
  document.getElementById("lblPro").innerText = viewMode === "weekly" ? "Weekly Protein (7d)" : "Daily Protein";
  document.getElementById("nutrientModeLbl").innerText = viewMode === "weekly" ? "Weekly Totals" : "Daily Totals";

  document.getElementById("valCost").innerText = "RM" + (totalCost * mult).toFixed(2);
  document.getElementById("subCost").innerText = viewMode === "weekly" ? "Daily avg: RM" + totalCost.toFixed(2) : "Weekly: RM" + (totalCost * 7).toFixed(2);

  document.getElementById("valCal").innerText = Math.round(totalCal * mult).toLocaleString() + " kcal";
  document.getElementById("subCal").innerText = "Target: " + Math.round(settings.energy * mult).toLocaleString() + " kcal";

  document.getElementById("valPro").innerText = (totalP * mult).toFixed(1) + "g";
  document.getElementById("subPro").innerText = "Target: " + Math.round(settings.protein * mult) + "g";

  var goalLabel = { lose: "Lose Weight", maintain: "Maintain", gain: "Gain Muscle" }[settings.goal] || "Maintain";
  document.getElementById("profileBanner").innerText = settings.weight + " kg • " + goalLabel + " • Target: " + settings.energy + " kcal | " + settings.protein + "g Protein/day";

  var statusBox = document.getElementById("statusBox");
  if (totalCal < 1450) {
    statusBox.className = "status-pill st-danger";
    statusBox.innerText = "Below 1,450 kcal BMR floor (" + Math.round(totalCal) + " kcal/day). Add bread, eggs, or oil.";
  } else if (totalP < settings.protein) {
    statusBox.className = "status-pill st-warn";
    statusBox.innerText = "Safe calories (" + Math.round(totalCal) + " kcal), but " + (settings.protein - totalP).toFixed(1) + "g short of protein target.";
  } else {
    statusBox.className = "status-pill st-ok";
    statusBox.innerText = "On track: " + Math.round(totalCal) + " kcal & " + totalP.toFixed(1) + "g protein/day.";
  }

  var macros = [
    { name: "Protein", val: totalP * mult, goal: settings.protein * mult, color: "#38bdf8" },
    { name: "Carbohydrates", val: totalC * mult, goal: (settings.energy * 0.45 / 4) * mult, color: "#10b981" },
    { name: "Dietary Fat", val: totalF * mult, goal: (settings.energy * 0.30 / 9) * mult, color: "#f59e0b" },
    { name: "Fiber", val: totalFib * mult, goal: 25 * mult, color: "#a78bfa" }
  ];
  var macroHTML = "";
  for (var m = 0; m < macros.length; m++) {
    var md = macros[m];
    var pct = Math.min(100, Math.round((md.val / Math.max(1, md.goal)) * 100));
    macroHTML += '<div class="macro-item">' +
      '<div class="macro-top"><span>' + md.name + '</span><strong>' + md.val.toFixed(1) + 'g / ' + Math.round(md.goal) + 'g</strong></div>' +
      '<div class="track"><div class="fill" style="width:' + pct + '%;background:' + md.color + ';"></div></div>' +
    '</div>';
  }
  document.getElementById("macroBars").innerHTML = macroHTML;

  var microKeys = [
    { k: "vitA", n: "Vit A" }, { k: "vitB", n: "Vit B" }, { k: "vitC", n: "Vit C" },
    { k: "vitD", n: "Vit D" }, { k: "vitE", n: "Vit E" }, { k: "vitK", n: "Vit K" },
    { k: "iron", n: "Iron" }, { k: "calc", n: "Calcium" }, { k: "pot", n: "Potassium" }
  ];
  var microHTML = "";
  for (var j = 0; j < microKeys.length; j++) {
    var mk = microKeys[j];
    var v = Math.min(100, Math.round(micros[mk.k]));
    var col = v >= 80 ? "#10b981" : (v >= 40 ? "#f59e0b" : "#f43f5e");
    microHTML += '<div class="micro-box"><div class="micro-lbl">' + mk.n + '</div><div class="micro-val" style="color:' + col + ';">' + v + '%</div></div>';
  }
  document.getElementById("microGrid").innerHTML = microHTML;

  document.getElementById("shoppingList").innerHTML = shopHTML || '<div style="color:var(--muted);font-size:0.84rem;">No items selected yet.</div>';
}

function copyShoppingList() {
  if (!lastShopText) return;
  navigator.clipboard.writeText(lastShopText).then(function() {
    var btn = document.getElementById("copyShopBtn");
    btn.innerText = "Copied!";
    setTimeout(function() { btn.innerText = "Copy List"; }, 1500);
  });
}

document.getElementById("addFoodForm").addEventListener("submit", function(e) {
  e.preventDefault();
  var fd = new FormData(e.target);
  var serving = Math.max(0.1, parseFloat(fd.get("serving")) || 1);
  var unit = fd.get("unit").trim();
  var qty = Math.max(0, parseFloat(fd.get("qty")) || 0);
  var newItem = {
    id: "custom_" + Date.now(),
    name: fd.get("name").trim(),
    qty: qty,
    min: 0,
    max: Math.max(qty * 2, serving * 4),
    step: (unit === "g" || unit === "ml") ? 10 : 0.5,
    unit: unit,
    unitLabel: "RM/" + serving + unit,
    price: Math.max(0, parseFloat(fd.get("price")) || 0),
    priceDiv: serving,
    cal: (parseFloat(fd.get("cal")) || 0) / serving,
    p: (parseFloat(fd.get("p")) || 0) / serving,
    c: (parseFloat(fd.get("c")) || 0) / serving,
    f: (parseFloat(fd.get("f")) || 0) / serving,
    fib: (parseFloat(fd.get("fib")) || 0) / serving,
    shopUnit: unit,
    shopDiv: 1,
    micros: { vitA: 0, vitB: 0, vitC: 0, vitD: 0, vitE: 0, vitK: 0, iron: 0, calc: 0, pot: 0 }
  };
  foods.push(newItem);
  saveState();
  renderFoods();
  updateUI();
  e.target.reset();
  closeDrawer("drawerAdd");
});

function renderLibrary() {
  var q = document.getElementById("libSearch").value.toLowerCase().trim();
  var html = "";
  for (var i = 0; i < library.length; i++) {
    var item = library[i];
    if (q && item.name.toLowerCase().indexOf(q) === -1) continue;
    var inPlan = false;
    for (var j = 0; j < foods.length; j++) {
      if (foods[j].id === item.id) { inPlan = true; break; }
    }
    var basis = item.priceDiv || 1;
    html += '<div class="lib-item">' +
      '<div><strong>' + escapeHTML(item.name) + '</strong><div style="color:var(--muted);font-size:0.75rem;">' + Math.round(item.cal * basis) + ' kcal • ' + (item.p * basis).toFixed(1) + 'g P per ' + basis + ' ' + escapeHTML(item.unit) + '</div></div>' +
      '<button type="button" class="nav-btn" ' + (inPlan ? 'disabled style="opacity:0.5;"' : 'onclick="addFromLibrary(' + i + ')"') + '>' + (inPlan ? 'In Plan' : '+ Add') + '</button>' +
    '</div>';
  }
  document.getElementById("libList").innerHTML = html || '<div style="color:var(--muted);font-size:0.84rem;">No matching foods found.</div>';
}

function addFromLibrary(idx) {
  var item = library[idx];
  if (!item) return;
  foods.push(JSON.parse(JSON.stringify(item)));
  saveState();
  renderFoods();
  updateUI();
  renderLibrary();
}

function fillTargetsForm() {
  var form = document.getElementById("targetsForm");
  form.elements.weight.value = settings.weight;
  form.elements.goal.value = settings.goal;
  form.elements.proteinPerKg.value = settings.proteinPerKg;
  form.elements.energy.value = settings.energy;
  form.elements.protein.value = settings.protein;
}

function autoEstimateTargets() {
  var form = document.getElementById("targetsForm");
  var w = parseFloat(form.elements.weight.value) || 72.5;
  var g = form.elements.goal.value;
  var pKg = parseFloat(form.elements.proteinPerKg.value) || 1.3;
  var mult = g === "lose" ? 24 : (g === "gain" ? 33 : 29);
  form.elements.energy.value = Math.round(w * mult);
  form.elements.protein.value = Math.round(w * pKg);
}

document.getElementById("targetsForm").addEventListener("submit", function(e) {
  e.preventDefault();
  var fd = new FormData(e.target);
  settings.weight = parseFloat(fd.get("weight")) || 72.5;
  settings.goal = fd.get("goal");
  settings.proteinPerKg = parseFloat(fd.get("proteinPerKg")) || 1.3;
  settings.energy = parseInt(fd.get("energy"), 10) || 1650;
  settings.protein = parseInt(fd.get("protein"), 10) || 95;
  saveState();
  updateUI();
  closeDrawer("drawerTargets");
});

loadState();
renderFoods();
updateUI();
