var defaultFoods = [
  { id: "bread", name: "Gardenia Wholemeal Bread", qty: 9, min: 0, max: 16, step: 1, unit: "slices", packSize: 11.5, packPrice: 4.00, packUnit: "loaf (400g)", pantry: 0, cal: 75, p: 4.0, c: 13.0, f: 0.8, fib: 2.0, micros: { vitA: 0, vitB: 9, vitC: 0, vitD: 0, vitE: 2, vitK: 1, iron: 6, calc: 3, pot: 2 } },
  { id: "chicken", name: "Chicken Breast (Cooked)", qty: 150, min: 0, max: 400, step: 10, unit: "g", packSize: 1000, packPrice: 24.00, packUnit: "kg", pantry: 0, cal: 1.65, p: 0.30, c: 0, f: 0.036, fib: 0, micros: { vitA: 0.01, vitB: 0.35, vitC: 0, vitD: 0.01, vitE: 0.02, vitK: 0, iron: 0.06, calc: 0.01, pot: 0.06 } },
  { id: "eggs", name: "Grade A Whole Eggs", qty: 3, min: 0, max: 10, step: 1, unit: "eggs", packSize: 30, packPrice: 14.00, packUnit: "tray (30)", pantry: 0, cal: 72, p: 6.0, c: 0.4, f: 5.0, fib: 0, micros: { vitA: 9, vitB: 11, vitC: 0, vitD: 11, vitE: 4, vitK: 0.2, iron: 5, calc: 2, pot: 1.5 } },
  { id: "whey", name: "Protein Powder (69.4%)", qty: 0, min: 0, max: 4, step: 0.5, unit: "scoops", packSize: 36.6, packPrice: 92.40, packUnit: "tub (1.1kg)", pantry: 0, cal: 108, p: 20.8, c: 2.5, f: 1.5, fib: 0, micros: { vitA: 0, vitB: 4, vitC: 0, vitD: 0, vitE: 0, vitK: 0, iron: 2, calc: 9, pot: 3 } },
  { id: "broccoli", name: "Broccoli", qty: 100, min: 0, max: 300, step: 25, unit: "g", packSize: 500, packPrice: 5.00, packUnit: "head (500g)", pantry: 0, cal: 0.34, p: 0.028, c: 0.07, f: 0.004, fib: 0.026, micros: { vitA: 0.04, vitB: 0.08, vitC: 0.99, vitD: 0, vitE: 0.05, vitK: 0.85, iron: 0.04, calc: 0.04, pot: 0.07 } },
  { id: "carrots", name: "Carrots", qty: 100, min: 0, max: 300, step: 25, unit: "g", packSize: 500, packPrice: 2.25, packUnit: "pack (500g)", pantry: 0, cal: 0.41, p: 0.009, c: 0.10, f: 0.002, fib: 0.028, micros: { vitA: 0.93, vitB: 0.05, vitC: 0.07, vitD: 0, vitE: 0.04, vitK: 0.11, iron: 0.02, calc: 0.03, pot: 0.07 } },
  { id: "oil", name: "Cooking Oil", qty: 1.5, min: 0, max: 4, step: 0.5, unit: "tbsp", packSize: 67, packPrice: 6.70, packUnit: "bottle (1L)", pantry: 0, cal: 120, p: 0, c: 0, f: 14.0, fib: 0, micros: { vitA: 0, vitB: 0, vitC: 0, vitD: 0, vitE: 14, vitK: 8, iron: 0, calc: 0, pot: 0 } }
];

var defaultSettings = { weight: 72.5, goal: "maintain", energy: 2000, protein: 90, proteinPerKg: 1.2, bmr: 1450, theme: "dark" };
var saved = JSON.parse(localStorage.getItem("myNutriApp_v6")) || {
  foods: JSON.parse(JSON.stringify(defaultFoods)),
  library: JSON.parse(JSON.stringify(defaultFoods)),
  settings: Object.assign({}, defaultSettings),
  checked: {}
};

var foods = saved.foods;
var library = saved.library;
var settings = saved.settings;
var checked = saved.checked || {};

if (settings.theme === "light") document.body.classList.add("light");

function persist() {
  foods.forEach(function(f) {
    var idx = library.findIndex(function(x) { return x.id === f.id; });
    if (idx < 0) library.push(JSON.parse(JSON.stringify(f)));
    else library[idx] = JSON.parse(JSON.stringify(f));
  });
  localStorage.setItem("myNutriApp_v6", JSON.stringify({ foods: foods, library: library, settings: settings, checked: checked }));
}

function escapeHTML(val) {
  return String(val).replace(/[&<>"']/g, function(c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function switchView(viewId, btn) {
  document.querySelectorAll(".view").forEach(function(v) { v.classList.remove("active"); });
  document.querySelectorAll(".nav-btn").forEach(function(b) { b.classList.remove("active"); });
  document.getElementById(viewId).classList.add("active");
  btn.classList.add("active");
  if (viewId === "viewManage") fillTargets();
  updateAll();
}

function toggleTheme() {
  document.body.classList.toggle("light");
  settings.theme = document.body.classList.contains("light") ? "light" : "dark";
  persist();
}

function changeQty(idx, val) {
  var item = foods[idx];
  var next = Math.max(0, Math.round((Number(val) || 0) * 100) / 100);
  item.qty = next;
  item.max = Math.max(item.max, next);
  persist();
  renderDaily();
  updateAll();
}

function stepQty(idx, delta) { changeQty(idx, foods[idx].qty + delta); }

function removeFood(idx) {
  foods.splice(idx, 1);
  persist();
  renderDaily();
  updateAll();
}

function resetDefaults() {
  foods = JSON.parse(JSON.stringify(defaultFoods));
  checked = {};
  persist();
  renderDaily();
  updateAll();
}

function logDayToPantry() {
  var deducted = false;
  foods.forEach(function(item) {
    if (item.qty > 0 && item.pantry > 0) {
      item.pantry = Math.max(0, Math.round((item.pantry - item.qty) * 100) / 100);
      deducted = true;
    }
  });
  persist();
  updateAll();
  alert(deducted ? "Today's portions have been deducted from your Pantry inventory!" : "No pantry stock to deduct yet. Enter what you already own in the Grocery & Pantry tab first.");
}

function renderDaily() {
  var box = document.getElementById("dailyFoodList");
  if (!foods.length) {
    box.innerHTML = '<p class="muted-sm">No foods in daily plan. Switch to Add Food & Targets to add items.</p>';
    return;
  }
  box.innerHTML = foods.map(function(item, i) {
    var unitCost = item.packPrice / (item.packSize || 1);
    var dCost = item.qty * unitCost;
    return '<div class="food-item">' +
      '<div class="food-top"><span class="food-name">' + escapeHTML(item.name) + '</span><span class="food-cost">RM' + dCost.toFixed(2) + ' / day</span></div>' +
      '<div class="slider-row">' +
        '<button type="button" class="step-btn" onclick="stepQty(' + i + ', -' + item.step + ')">-</button>' +
        '<input type="range" min="0" max="' + item.max + '" step="' + item.step + '" value="' + item.qty + '" oninput="changeQty(' + i + ', this.value)">' +
        '<button type="button" class="step-btn" onclick="stepQty(' + i + ', ' + item.step + ')">+</button>' +
        '<input class="num-sm" type="number" step="any" min="0" value="' + item.qty + '" onchange="changeQty(' + i + ', this.value)">' +
      '</div>' +
      '<div class="food-sub">' +
        '<span>' + item.qty + ' ' + escapeHTML(item.unit) + ' • ' + Math.round(item.qty * item.cal) + ' kcal | ' + (item.qty * item.p).toFixed(1) + 'g P</span>' +
        '<button type="button" class="del-link" onclick="removeFood(' + i + ')">Remove</button>' +
      '</div>' +
    '</div>';
  }).join("");
}
function updatePantry(idx, val) {
  foods[idx].pantry = Math.max(0, Number(val) || 0);
  persist();
  updateAll();
}

function toggleCheck(id) {
  checked[id] = !checked[id];
  persist();
  updateAll();
}

function clearChecked() {
  checked = {};
  persist();
  updateAll();
}

function updateAll() {
  var dCost = 0, cal = 0, p = 0, c = 0, f = 0, fib = 0;
  var micros = { vitA: 0, vitB: 0, vitC: 0, vitD: 0, vitE: 0, vitK: 0, iron: 0, calc: 0, pot: 0 };

  foods.forEach(function(item) {
    var uCost = item.packPrice / (item.packSize || 1);
    dCost += item.qty * uCost;
    cal += item.qty * item.cal;
    p += item.qty * item.p;
    c += item.qty * item.c;
    f += item.qty * item.f;
    fib += item.qty * item.fib;
    for (var k in micros) {
      if (item.micros && item.micros[k]) micros[k] += item.qty * item.micros[k];
    }
  });

  var goalNames = { lose: "Fat Loss", maintain: "Maintain", gain: "Muscle Gain" };
  document.getElementById("profileBadge").innerText = settings.weight + " kg • " + (goalNames[settings.goal] || "Maintain") + " • " + settings.energy + " kcal | " + settings.protein + "g Protein";
  document.getElementById("dailyCostPill").innerText = "Today's Food Cost: RM" + dCost.toFixed(2);

  var banner = document.getElementById("bmrBanner");
  var bmr = settings.bmr || 1450;
  if (cal < bmr) {
    banner.className = "banner danger";
    banner.innerText = "Below Safe BMR Floor (" + Math.round(cal) + " / " + bmr + " kcal). Add more food portions.";
  } else if (cal <= settings.energy * 1.05) {
    banner.className = "banner ok";
    banner.innerText = "Safe Zone: " + Math.round(cal) + " / " + settings.energy + " kcal • Protein " + (p >= settings.protein ? "Target Met!" : Math.round(settings.protein - p) + "g remaining");
  } else {
    banner.className = "banner warn";
    banner.innerText = "Calorie Surplus: " + Math.round(cal - settings.energy) + " kcal above your daily target.";
  }

  document.getElementById("donutCal").innerText = Math.round(cal).toLocaleString();
  var pCal = p * 4, cCal = c * 4, fCal = f * 9;
  var totMacroCal = Math.max(1, pCal + cCal + fCal);
  var pPct = Math.round((pCal / totMacroCal) * 100);
  var cPct = Math.round((cCal / totMacroCal) * 100);
  document.getElementById("macroDonut").style.background = "conic-gradient(#38bdf8 0% " + pPct + "%, #10b981 " + pPct + "% " + (pPct + cPct) + "%, #f59e0b " + (pPct + cPct) + "% 100%)";

  var mList = [
    { name: "Protein (" + pPct + "%)", val: p, goal: settings.protein, color: "#38bdf8" },
    { name: "Carbs (" + cPct + "%)", val: c, goal: settings.energy * 0.5 / 4, color: "#10b981" },
    { name: "Fat (" + Math.max(0, 100 - pPct - cPct) + "%)", val: f, goal: settings.energy * 0.3 / 9, color: "#f59e0b" },
    { name: "Fiber", val: fib, goal: settings.energy / 1000 * 14, color: "#a78bfa" }
  ];
  document.getElementById("macroBars").innerHTML = mList.map(function(m) {
    var pct = Math.min(100, Math.round((m.val / (m.goal || 1)) * 100));
    return '<div class="m-row"><div class="m-lbl"><span>' + m.name + '</span><strong>' + m.val.toFixed(1) + 'g / ' + Math.round(m.goal) + 'g</strong></div><div class="track"><div class="fill" style="width:' + pct + '%;background:' + m.color + ';"></div></div></div>';
  }).join("");

  var microMeta = [
    { k: "vitA", n: "Vit A" }, { k: "vitB", n: "Vit B" }, { k: "vitC", n: "Vit C" },
    { k: "vitD", n: "Vit D" }, { k: "vitE", n: "Vit E" }, { k: "vitK", n: "Vit K" },
    { k: "iron", n: "Iron" }, { k: "calc", n: "Calcium" }, { k: "pot", n: "Potassium" }
  ];
  document.getElementById("microGrid").innerHTML = microMeta.map(function(m) {
    var val = Math.min(100, Math.round(micros[m.k]));
    var col = val >= 80 ? "#10b981" : (val >= 40 ? "#f59e0b" : "#f43f5e");
    return '<div class="micro-box"><span>' + m.n + '</span><strong style="color:' + col + ';">' + val + '%</strong></div>';
  }).join("");

  var days = Number(document.getElementById("cycleSelect").value) || 7;
  var checkoutTotal = 0, savedTotal = 0, trolleySpent = 0;
  var shopHTML = "";

  foods.forEach(function(item, idx) {
    if (item.qty <= 0) return;
    var needed = item.qty * days;
    var pantryHave = item.pantry || 0;
    var netNeeded = Math.max(0, needed - pantryHave);
    var packsToBuy = netNeeded > 0 ? Math.ceil(netNeeded / (item.packSize || 1)) : 0;
    var rawPacks = Math.ceil(needed / (item.packSize || 1));
    var buyCost = packsToBuy * item.packPrice;
    var rawCost = rawPacks * item.packPrice;

    checkoutTotal += buyCost;
    savedTotal += Math.max(0, rawCost - buyCost);
    if (checked[item.id]) trolleySpent += buyCost;

    var leftover = (packsToBuy * item.packSize + pantryHave) - needed;
    var isDone = !!checked[item.id];

    shopHTML += '<div class="shop-item ' + (isDone ? 'checked' : '') + '">' +
      '<div class="shop-left">' +
        '<input type="checkbox" class="shop-check" ' + (isDone ? 'checked' : '') + ' onchange="toggleCheck(\'' + item.id + '\')" />' +
        '<div><strong>' + escapeHTML(item.name) + ' — Buy: ' + packsToBuy + ' ' + escapeHTML(item.packUnit) + ' (RM' + buyCost.toFixed(2) + ')</strong><br>' +
        '<span class="muted-sm">Need: ' + Math.round(needed * 10) / 10 + ' ' + escapeHTML(item.unit) + ' • Leftover after ' + days + 'd: ' + Math.max(0, Math.round(leftover * 10) / 10) + ' ' + escapeHTML(item.unit) + '</span></div>' +
      '</div>' +
      '<div class="shop-right">' +
        '<label>In Pantry (' + escapeHTML(item.unit) + '): <input type="number" class="pantry-input" min="0" step="any" value="' + pantryHave + '" onchange="updatePantry(' + idx + ', this.value)"></label>' +
      '</div>' +
    '</div>';
  });

  document.getElementById("checkoutTotal").innerText = "RM" + checkoutTotal.toFixed(2);
  document.getElementById("pantrySavedNote").innerText = "Pantry saved: RM" + savedTotal.toFixed(2);
  document.getElementById("trolleySpent").innerText = "RM" + trolleySpent.toFixed(2);
  document.getElementById("trolleyRemain").innerText = "Remaining: RM" + Math.max(0, checkoutTotal - trolleySpent).toFixed(2);
  document.getElementById("shopChecklist").innerHTML = shopHTML || '<p class="muted-sm">No active foods selected in your daily plan.</p>';
  renderLibrary();
}
function copyShopList() {
  var days = Number(document.getElementById("cycleSelect").value) || 7;
  var lines = ["Supermarket List (" + days + " Days):"];
  var total = 0;
  foods.forEach(function(item) {
    if (item.qty <= 0) return;
    var net = Math.max(0, (item.qty * days) - (item.pantry || 0));
    var packs = net > 0 ? Math.ceil(net / (item.packSize || 1)) : 0;
    if (packs > 0) {
      var cost = packs * item.packPrice;
      total += cost;
      lines.push("- [ ] " + item.name + ": " + packs + " " + item.packUnit + " (RM" + cost.toFixed(2) + ")");
    }
  });
  lines.push("Total Checkout: RM" + total.toFixed(2));
  navigator.clipboard.writeText(lines.join("\n")).then(function() {
    var b = document.getElementById("copyShopBtn");
    b.innerText = "Copied!";
    setTimeout(function() { b.innerText = "Copy Supermarket List"; }, 1800);
  });
}

document.getElementById("newFoodForm").addEventListener("submit", function(e) {
  e.preventDefault();
  var fd = new FormData(e.target);
  var unit = fd.get("unit").trim() || "g";
  var serving = Math.max(0.1, Number(fd.get("serving")) || 100);
  var packSize = Math.max(0.1, Number(fd.get("packSize")) || 100);
  var packPrice = Math.max(0, Number(fd.get("packPrice")) || 0);
  var qty = Math.max(0, Number(fd.get("qty")) || 0);
  var isGram = /^(g|ml)$/i.test(unit);

  var newItem = {
    id: "food_" + Date.now(),
    name: fd.get("name").trim(),
    unit: unit,
    qty: qty,
    min: 0,
    max: Math.max(isGram ? 400 : 12, qty * 2, serving * 4),
    step: isGram ? 10 : 0.5,
    packSize: packSize,
    packPrice: packPrice,
    packUnit: fd.get("packUnit").trim() || "pack",
    pantry: 0,
    cal: (Number(fd.get("cal")) || 0) / serving,
    p: (Number(fd.get("p")) || 0) / serving,
    c: (Number(fd.get("c")) || 0) / serving,
    f: (Number(fd.get("f")) || 0) / serving,
    fib: (Number(fd.get("fib")) || 0) / serving,
    micros: {}
  };
  ["vitA", "vitB", "vitC", "vitD", "vitE", "vitK", "iron", "calc", "pot"].forEach(function(k) {
    newItem.micros[k] = (Number(fd.get(k)) || 0) / serving;
  });

  foods.push(newItem);
  persist();
  renderDaily();
  updateAll();
  e.target.reset();
  document.getElementById("onlineResults").hidden = true;
  document.getElementById("ocrPreview").hidden = true;
  switchView("viewDaily", document.querySelector(".nav-btn"));
});

function renderLibrary() {
  var q = (document.getElementById("libFilter").value || "").toLowerCase();
  var list = document.getElementById("libraryList");
  list.innerHTML = library.filter(function(item) {
    return item.name.toLowerCase().indexOf(q) >= 0;
  }).map(function(item) {
    var active = foods.some(function(f) { return f.id === item.id; });
    return '<div class="lib-item"><div><strong>' + escapeHTML(item.name) + '</strong><br><span class="muted-sm">RM' + item.packPrice.toFixed(2) + ' / ' + item.packSize + ' ' + escapeHTML(item.unit) + '</span></div>' +
      '<button class="btn" ' + (active ? 'disabled' : '') + ' onclick="addFromLib(\'' + item.id + '\')">' + (active ? 'Active' : '+ Add') + '</button></div>';
  }).join("") || '<p class="muted-sm">No matching items.</p>';
}

function addFromLib(id) {
  var item = library.find(function(x) { return x.id === id; });
  if (!item || foods.some(function(f) { return f.id === id; })) return;
  foods.push(JSON.parse(JSON.stringify(item)));
  persist();
  renderDaily();
  updateAll();
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

function autoCalcTargets() {
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
  settings.weight = Number(fd.get("weight")) || 72.5;
  settings.goal = fd.get("goal");
  settings.proteinPerKg = Number(fd.get("proteinPerKg")) || 1.2;
  settings.bmr = Number(fd.get("bmr")) || 1450;
  settings.energy = Number(fd.get("energy")) || 2000;
  settings.protein = Number(fd.get("protein")) || 90;
  persist();
  updateAll();
  alert("Targets saved!");
});

function exportBackup() {
  var blob = new Blob([localStorage.getItem("myNutriApp_v6") || "{}"], { type: "application/json" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "my-nutrition-backup.json";
  a.click();
}

function importBackup(e) {
  var file = e.target.files && e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    try {
      var data = JSON.parse(ev.target.result);
      if (data.foods) foods = data.foods;
      if (data.library) library = data.library;
      if (data.settings) settings = data.settings;
      if (data.checked) checked = data.checked;
      persist();
      renderDaily();
      updateAll();
      alert("Backup restored successfully!");
    } catch (err) { alert("Invalid backup file."); }
  };
  reader.readAsText(file);
}

renderDaily();
updateAll();
