
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

  var foods = structuredClone(defaultFoods);
  var library = [];
  var settings = {weight:72.5, goal:'maintain', energy:2000, protein:90, proteinPerKg:1.2};
  var saveTimer, pendingSave = Promise.resolve(), saveRevision = 0;
  function rememberFoods() {
    foods.forEach(function (food) {
      var index = library.findIndex(saved => saved.id === food.id);
      if (index < 0) library.push(structuredClone(food));
      else library[index] = structuredClone(food);
    });
  }
  function save() {
    rememberFoods();
    renderLibrary();
    var revision = ++saveRevision;
    document.getElementById('saveStatus').textContent = 'Saving changes…';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      var snapshot = JSON.stringify({foods: foods, library: library, settings: settings});
      pendingSave = pendingSave.catch(function () {}).then(async function () {
        try {
          var response = await fetch('/api/plan', {method:'PUT', headers:{'Content-Type':'application/json'}, body:snapshot});
          if (!response.ok) throw new Error('Save failed');
          if (revision === saveRevision) document.getElementById('saveStatus').textContent = 'Plan, targets, and foods saved for this browser.';
        } catch {
          if (revision === saveRevision) document.getElementById('saveStatus').textContent = 'Changes are not saved. Check your connection and adjust a value to retry.';
        }
      });
    }, 300);
  }
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function setMode(mode) {
    viewMode = mode;
    document.getElementById("btnDaily").className = mode === "daily" ? "toggle-btn active" : "toggle-btn";
    document.getElementById("btnWeekly").className = mode === "weekly" ? "toggle-btn active" : "toggle-btn";
    updateUI();
  }

  function changeQty(idx, val) {
    var item = foods[idx];
    var next = Number(val);
    if (!Number.isFinite(next) || next < 0) next = 0;
    item.qty = Math.min(100000, Math.round(next * 100) / 100);
    item.max = Math.max(item.max, item.qty);
    document.getElementById('slider_' + idx).max = item.max;
    document.getElementById('slider_' + idx).value = item.qty;
    document.getElementById('quantity_' + idx).value = item.qty;
    save();
    updateUI();
  }
  function stepQty(idx, delta) { changeQty(idx, foods[idx].qty + delta); }
  function removeFood(idx) {
    rememberFoods();
    foods.splice(idx, 1);
    renderFoods(); updateUI(); save();
  }
function changePrice(idx, val) {
var value = Number(val);
foods[idx].price = Number.isFinite(value) ? Math.max(0, value) : 0;
if (document.activeElement && document.activeElement.classList.contains('price-edit')) document.activeElement.value = foods[idx].price;
save();
updateUI();
}
function resetDefaults() {
rememberFoods();
foods = structuredClone(defaultFoods);
save();
renderFoods();
updateUI();
}
function renderFoods() {
var container = document.getElementById("foodList");
var html = "";
for (var i = 0; i < foods.length; i++) {
var item = foods[i];
html += `<div class="food-card">
  <div class="food-top"><span class="food-name">${escapeHTML(item.name)}</span><span class="food-cost" id="cost_${i}"></span></div>
  <div class="slider-row">
    <button type="button" class="step-btn" aria-label="Decrease ${escapeHTML(item.name)}" onclick="stepQty(${i}, -${item.step})">−</button>
    <input type="range" id="slider_${i}" min="0" max="${item.max}" step="${item.step}" value="${item.qty}" aria-label="${escapeHTML(item.name)} daily quantity" oninput="changeQty(${i}, this.value)">
    <button type="button" class="step-btn" aria-label="Increase ${escapeHTML(item.name)}" onclick="stepQty(${i}, ${item.step})">+</button>
    <input class="qty-input" type="number" id="quantity_${i}" min="0" max="100000" step="any" value="${item.qty}" aria-label="${escapeHTML(item.name)} daily quantity in ${escapeHTML(item.unit)}" onchange="changeQty(${i}, this.value)">
  </div>
  <div class="food-meta"><span id="qty_${i}"></span><span id="calMeta_${i}"></span></div>
  <div class="food-meta"><label>Price (${escapeHTML(item.unitLabel)}) <input class="price-edit" type="number" min="0" step="0.01" value="${item.price}" onchange="changePrice(${i}, this.value)"></label><button type="button" class="reset-btn" onclick="removeFood(${i})" aria-label="Remove ${escapeHTML(item.name)}">Remove</button></div>
</div>`;
}
container.innerHTML = html || '<p class="helper">No foods in your plan. Use Add a food to get started.</p>';
}
function updateUI() {
var mult = viewMode === "weekly" ? 7 : 1;
var totalCost = 0, totalCal = 0, totalP = 0, totalC = 0, totalF = 0, totalFib = 0;
var micros = { vitA: 0, vitB: 0, vitC: 0, vitD: 0, vitE: 0, vitK: 0, iron: 0, calc: 0, pot: 0 };
var shopHTML = "";
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
micros[k] += (item.qty / (item.priceDiv || 1)) * (item.micros[k] || 0);
}
document.getElementById("cost_" + i).innerText = "RM" + (dailyCost * mult).toFixed(2);
document.getElementById("qty_" + i).innerText = (Math.round(item.qty * mult * 10) / 10) + " " + item.unit;
document.getElementById("calMeta_" + i).innerText = Math.round(dailyCal * mult) + " kcal | " + (dailyP * mult).toFixed(1) + "g protein";
if (item.qty > 0) {
var weeklyUnits = (item.qty * 7) / item.shopDiv;
shopHTML += '<div class="shop-row"><span>' + escapeHTML(item.name) + '</span><span>' + weeklyUnits.toFixed(2) + ' ' + escapeHTML(item.shopUnit) + ' (RM' + (dailyCost * 7).toFixed(2) + ')</span></div>';
}
}
document.getElementById("costTitle").innerText = viewMode === "weekly" ? "Weekly Grocery Cost" : "Daily Grocery Cost";
document.getElementById("calTitle").innerText = viewMode === "weekly" ? "Weekly Energy" : "Daily Energy";
document.getElementById("proTitle").innerText = viewMode === "weekly" ? "Weekly Protein" : "Daily Protein";
document.getElementById("kpiCost").innerText = "RM" + (totalCost * mult).toFixed(2);
document.getElementById("kpiCostSub").innerText = viewMode === "weekly" ? "Daily avg: RM" + totalCost.toFixed(2) : "Weekly: RM" + (totalCost * 7).toFixed(2);
document.getElementById("kpiCal").innerText = Math.round(totalCal * mult) + " kcal";
document.getElementById("kpiPro").innerText = (totalP * mult).toFixed(1) + "g";
document.getElementById("kpiProSub").innerText = "Target: " + (settings.protein * mult).toFixed(1) + "g / " + (mult === 7 ? "week" : "day");
var banner = document.getElementById("statusBanner");
document.getElementById('kpiCalSub').textContent = 'Target: ' + Math.round(settings.energy * mult).toLocaleString() + ' kcal / ' + (mult === 7 ? 'week' : 'day');
document.getElementById('profileSummary').textContent = settings.weight + ' kg · ' + ({lose:'Lose weight',maintain:'Maintain weight',gain:'Gain weight'}[settings.goal]) + ' · ' + settings.energy + ' kcal · ' + settings.protein + 'g protein / day';
var energyDiff = Math.round(totalCal - settings.energy);
var proteinDiff = Math.round((totalP - settings.protein) * 10) / 10;
banner.className = 'status-banner ' + (Math.abs(energyDiff) <= settings.energy * 0.1 && proteinDiff >= 0 ? 'status-ok' : 'status-warn');
banner.innerText = 'Daily plan: ' + Math.abs(energyDiff) + ' kcal ' + (energyDiff < 0 ? 'below' : 'above') + ' your energy target; ' + Math.abs(proteinDiff).toFixed(1) + 'g protein ' + (proteinDiff < 0 ? 'below' : 'above') + ' your protein target.';
var macroData = [
{ name: "Protein", val: totalP * mult, goal: settings.protein * mult, color: "#38bdf8" },
{ name: "Carbohydrates", val: totalC * mult, goal: (settings.energy * 0.5 / 4) * mult, color: "#10b981" },
{ name: "Dietary Fat", val: totalF * mult, goal: (settings.energy * 0.3 / 9) * mult, color: "#f59e0b" },
{ name: "Fiber", val: totalFib * mult, goal: (settings.energy / 1000 * 14) * mult, color: "#a78bfa" }
];
var macroHTML = "";
for (var m = 0; m < macroData.length; m++) {
var md = macroData[m];
var pct = Math.min(100, Math.round((md.val / md.goal) * 100));
macroHTML += `<div class="macro-row"><div class="macro-label"><span>${md.name}</span><span>${md.val.toFixed(1)}g / ${Math.round(md.goal)}g</span></div><div class="progress-track" role="meter" aria-label="${md.name}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><div class="progress-fill" style="width:${pct}%;background:${md.color}"></div></div></div>`;
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
microHTML += `<div class="micro-chip"><div class="micro-name">${ml.n}</div><div class="micro-pct" style="color:${color}">${val}%</div></div>`;
}
document.getElementById("microGrid").innerHTML = microHTML;
document.getElementById("shoppingList").innerHTML = shopHTML || 'No items selected.';
}
document.getElementById('addFoodForm').addEventListener('submit', function(event) {
  event.preventDefault();
  var form = event.currentTarget;
  if (!form.reportValidity()) return;
  if (library.length >= 1000) { document.getElementById('scanStatus').textContent = 'Your saved-food library is full (1,000 foods).'; return; }
  if (foods.length >= 200) { document.getElementById('saveStatus').textContent = 'Your plan can contain up to 200 foods.'; return; }
  var values = new FormData(form), serving = Number(values.get('serving'));
  var item = {id:crypto.randomUUID(), name:values.get('name').trim(), unit:values.get('unit').trim(), qty:Number(values.get('qty')), min:0, max:Math.min(100000, Math.max(400, Number(values.get('qty')), serving * 4)), step:values.get('unit').trim().match(/^(g|ml)$/i) ? 1 : 0.5, price:Number(values.get('price')), priceDiv:serving, unitLabel:'RM/' + serving + ' ' + values.get('unit').trim(), shopUnit:values.get('unit').trim(), shopDiv:1, micros:{}};
  if (!item.name || !item.unit) return;
  ['cal','p','c','f','fib'].forEach(k => item[k] = Number(values.get(k)) / serving);
  foods.push(item); renderFoods(); updateUI(); save(); form.reset();
  document.getElementById('scanStatus').textContent = 'Food saved in your library and added to the plan.';
});
function renderLibrary() {
  var query = document.getElementById('librarySearch').value.toLowerCase().trim();
  document.getElementById('libraryCount').textContent = library.length + ' FOODS';
  var html = '';
  library.forEach(function(item, index) {
    if (!item.name.toLowerCase().includes(query)) return;
    var active = foods.some(f => f.id === item.id);
    var basis = item.priceDiv || 1;
    html += `<div class="library-row"><div><strong>${escapeHTML(item.name)}</strong><p class="helper">${(item.cal * basis).toFixed(0)} kcal · ${(item.p * basis).toFixed(1)}g protein / ${basis} ${escapeHTML(item.unit)}</p></div><button type="button" class="reset-btn" onclick="restoreFood(${index})" ${active ? 'disabled' : ''} aria-label="${active ? 'In plan: ' : 'Add to plan: '}${escapeHTML(item.name)}">${active ? 'In plan' : '+ Add'}</button></div>`;
  });
  document.getElementById('savedFoods').innerHTML = html || '<p class="helper">' + (query ? 'No saved foods match your search.' : 'Foods you add appear here for reuse.') + '</p>';
}
function restoreFood(index) {
  var item = library[index];
  if (!item || foods.some(f => f.id === item.id)) return;
  if (foods.length >= 200) { document.getElementById('libraryStatus').textContent = 'Your plan can contain up to 200 foods. Remove one before adding another.'; return; }
  foods.push(structuredClone(item));
  renderFoods(); updateUI(); save();
  document.getElementById('libraryStatus').textContent = item.name + ' added with its saved portion and values.';
}
document.getElementById('librarySearch').addEventListener('input', renderLibrary);
function fillTargets() {
  var form = document.getElementById('targetsForm');
  Object.keys(settings).forEach(k => form.elements.namedItem(k).value = settings[k]);
}
document.getElementById('estimateTargets').addEventListener('click', function () {
  var form = document.getElementById('targetsForm');
  if (!form.elements.weight.reportValidity() || !form.elements.proteinPerKg.reportValidity()) return;
  var weight = Number(form.elements.weight.value);
  form.elements.energy.value = Math.min(20000, Math.round(weight * ({lose:27,maintain:32,gain:37}[form.elements.goal.value])));
  form.elements.protein.value = Math.min(2000, Math.round(weight * Number(form.elements.proteinPerKg.value) * 10) / 10);
  document.getElementById('targetHelp').textContent = 'Estimate ready. Adjust energy or protein if needed, then Apply targets. These are rough starting estimates, not a BMR calculation.';
});
document.getElementById('targetsForm').addEventListener('submit', function(event) {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  var values = new FormData(event.currentTarget);
  settings = {weight:Number(values.get('weight')), goal:values.get('goal'), energy:Number(values.get('energy')), protein:Number(values.get('protein')), proteinPerKg:Number(values.get('proteinPerKg'))};
  updateUI(); save();
  document.getElementById('targetHelp').textContent = 'Targets applied. Edit them anytime, or estimate again after changing your weight or goal.';
});
var previewURL;
document.getElementById('labelPhoto').addEventListener('change', function() {
  if (previewURL) URL.revokeObjectURL(previewURL);
  var file = this.files[0], preview = document.getElementById('labelPreview');
  preview.hidden = true;
  if (file && ['image/jpeg','image/png','image/webp'].includes(file.type) && file.size <= 10 * 1024 * 1024) {
    previewURL = URL.createObjectURL(file); preview.src = previewURL; preview.hidden = false;
    document.getElementById('scanStatus').textContent = 'Photo ready. Select Read label photo to fill the form.';
  } else document.getElementById('scanStatus').textContent = 'Choose a JPEG, PNG, or WebP photo up to 10 MB.';
});
async function prepareLabel(file) {
  var bitmap = await createImageBitmap(file);
  try {
    var scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    var canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    return canvas.toDataURL('image/jpeg',0.9);
  } finally { bitmap.close(); }
}
document.getElementById('scanLabel').addEventListener('click', async function() {
  var button = this, input = document.getElementById('labelPhoto'), file = input.files[0];
  var status = document.getElementById('scanStatus');
  if (!file || !['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
    status.textContent = 'Choose a JPEG, PNG, or WebP photo up to 10 MB first.'; return;
  }
  button.disabled = true; input.disabled = true;
  var form = document.getElementById('addFoodForm');
  Array.from(form.elements).forEach(el => el.disabled = true);
  button.textContent = 'Reading label…'; status.textContent = 'Reading the serving size and nutrition values…';
  try {
    var image = await prepareLabel(file);
    var response = await fetch('/api/scan-label',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image}),signal:AbortSignal.timeout(25000)});
    var data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not read this label. Try again or enter values manually.');
    ['name','unit','serving','cal','p','c','f','fib'].forEach(function(k) {
      form.elements.namedItem(k).value = data[k] == null ? '' : data[k];
    });
    form.elements.qty.value = data.serving > 0 ? data.serving : '';
    form.elements.price.value = '';
    status.textContent = 'Review before saving: ' + (data.notes || 'Check all values against the label.') + ' Fill any blank fields and enter the price for the shown serving.';
  } catch(error) {
    status.textContent = error.name === 'TimeoutError' ? 'Label reading timed out. Try again or enter the values manually.' : (error.message || 'Could not read the image. Try another photo.');
  } finally {
    button.disabled = false; input.disabled = false; button.textContent = 'Read label photo';
    Array.from(form.elements).forEach(el => el.disabled = false);
  }
});
async function initialize() {
  var ready = false;
  document.getElementById('retryPlan').hidden = true;
  document.querySelectorAll('button, input, select').forEach(el => el.disabled = true);
  try {
    var response = await fetch('/api/plan');
    if (!response.ok) throw new Error('Load failed');
    var plan = await response.json();
    if (Array.isArray(plan.foods)) foods = plan.foods;
    library = Array.isArray(plan.library) ? plan.library : [];
    if (plan.settings && Object.keys(settings).every(k => plan.settings[k] !== undefined)) settings = plan.settings;
    if (plan.foods === null) {
      try {
        var legacy = JSON.parse(localStorage.getItem('myNutriApp_v3'));
        if (Array.isArray(legacy) && legacy.every(f => f && typeof f.name === 'string' && Number.isFinite(f.qty) && f.micros)) {
          foods = legacy; foods.forEach(f => f.max = Math.max(f.max, f.qty));
        }
      } catch {}
    }
    var oldLibrarySize = library.length;
    rememberFoods();
    ready = true;
    document.getElementById('saveStatus').textContent = 'Plan ready. Changes save automatically for this browser.';
    if (plan.foods === null || oldLibrarySize !== library.length) save();
  } catch {
    document.getElementById('saveStatus').textContent = 'Saved plan could not load. Retry to load your foods and targets before editing.';
    document.getElementById('retryPlan').hidden = false;
  }
  fillTargets(); renderFoods(); updateUI(); renderLibrary();
  document.querySelectorAll('button, input, select').forEach(el => el.disabled = !ready);
  if (ready) renderLibrary();
  document.getElementById('retryPlan').disabled = false;
}
document.getElementById('retryPlan').addEventListener('click', initialize);
initialize();
