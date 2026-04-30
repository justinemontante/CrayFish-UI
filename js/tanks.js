// TANKS — Lifecycle Management

// ─── TAB SWITCHING ───────────────────────────────────────────
document.querySelectorAll('.tank-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tank-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tank-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`tank-panel-${tab.dataset.tank}`).classList.add('active');
    });
});

// ─── TANK 1: BREEDING ────────────────────────────────────────
let pairsCount = 2;

document.querySelectorAll('.counter-btn[data-target="pairs"]').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.dataset.action === 'inc') pairsCount++;
        else if (pairsCount > 0) pairsCount--;
        document.getElementById('pairs-count').textContent = pairsCount;
    });
});

document.getElementById('berried-date').addEventListener('change', function () {
    const spotted = new Date(this.value);
    const hatchDate = new Date(spotted);
    hatchDate.setDate(hatchDate.getDate() + 30);
    const today = new Date();
    const elapsed = Math.floor((today - spotted) / 86400000);
    const daysLeft = Math.max(30 - elapsed, 0);
    const pct = Math.min((elapsed / 30) * 100, 100);

    document.getElementById('hatch-days').textContent = daysLeft > 0 ? `${daysLeft} days left` : 'Ready to hatch!';
    document.getElementById('hatch-fill').style.width = pct + '%';
    document.getElementById('hatch-sub').textContent =
        `Expected: ${hatchDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
});

// ─── TANK 2: NURSERY ─────────────────────────────────────────
let lengthVal = 0.0;

document.querySelectorAll('.counter-btn[data-target="length"]').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.dataset.action === 'inc') lengthVal = +(lengthVal + 0.1).toFixed(1);
        else if (lengthVal > 0) lengthVal = +(lengthVal - 0.1).toFixed(1);
        document.getElementById('length-val').textContent = lengthVal.toFixed(1);
    });
});

document.getElementById('nursery-date').addEventListener('change', function () {
    const transfer = new Date(this.value);
    const today = new Date();
    const age = Math.max(Math.floor((today - transfer) / 86400000), 0);
    const daysLeft = Math.max(30 - age, 0);
    const pct = Math.min((age / 30) * 100, 100);

    document.getElementById('nursery-age').textContent = age;
    document.getElementById('nursery-days-left').textContent = daysLeft;
    document.getElementById('nursery-pct').textContent = Math.round(pct) + '%';
    document.getElementById('nursery-fill').style.width = pct + '%';
});

// ─── TANK 3: GROW-OUT ────────────────────────────────────────
let stockCount = 100;
let mortalityCount = 0;

function updateLiveCount() {
    const live = stockCount - mortalityCount;
    document.getElementById('live-count').textContent = live;
    document.getElementById('mortality-count').textContent = mortalityCount;
    document.getElementById('sample-size').textContent = Math.ceil(live * 0.1);
}

document.querySelectorAll('.counter-btn[data-target="stock"]').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.dataset.action === 'inc') stockCount++;
        else if (stockCount > mortalityCount) stockCount--;
        document.getElementById('stock-count').textContent = stockCount;
        updateLiveCount();
    });
});

// Bi-weekly sampling (simulated 7 days elapsed)
document.getElementById('sampling-days').textContent = '7 days left';
document.getElementById('sampling-fill').style.width = '50%';

// Compute ABW & Biomass
document.getElementById('compute-btn').addEventListener('click', () => {
    const weight = parseFloat(document.getElementById('sample-weight').value);
    if (!weight || weight <= 0) return;

    const live = stockCount - mortalityCount;
    const sampleSize = Math.ceil(live * 0.1);
    const abw = +(weight / sampleSize).toFixed(2);
    const biomass = +(live * abw).toFixed(1);
    const feedRation = +(biomass * 0.03).toFixed(1);

    document.getElementById('abw-val').textContent = abw;
    document.getElementById('feed-ration-val').textContent = feedRation;
    document.getElementById('biomass-val').textContent = biomass;
    document.getElementById('abw-result').classList.remove('hidden');

    const feederRationEl = document.getElementById('feeder-ration');
    if (feederRationEl) {
        feederRationEl.textContent = `System will dispense ${feedRation}g today based on 3% Total Biomass`;
    }
});

// ─── MORTALITY MODAL ─────────────────────────────────────────
const mortOverlay = document.getElementById('mortality-overlay');
const mortModal   = document.getElementById('mortality-modal');
let mortInputVal  = 1;

document.getElementById('log-mortality-btn').addEventListener('click', () => {
    mortInputVal = 1;
    document.getElementById('mort-input-val').textContent = mortInputVal;
    mortOverlay.classList.add('show');
    mortModal.classList.add('show');
});

document.getElementById('mort-inc').addEventListener('click', () => {
    const live = stockCount - mortalityCount;
    if (mortInputVal < live) mortInputVal++;
    document.getElementById('mort-input-val').textContent = mortInputVal;
});

document.getElementById('mort-dec').addEventListener('click', () => {
    if (mortInputVal > 1) mortInputVal--;
    document.getElementById('mort-input-val').textContent = mortInputVal;
});

document.getElementById('mort-confirm').addEventListener('click', () => {
    mortalityCount += mortInputVal;
    updateLiveCount();
    mortOverlay.classList.remove('show');
    mortModal.classList.remove('show');
});

document.getElementById('mort-cancel').addEventListener('click', () => {
    mortOverlay.classList.remove('show');
    mortModal.classList.remove('show');
});

mortOverlay.addEventListener('click', () => {
    mortOverlay.classList.remove('show');
    mortModal.classList.remove('show');
});

updateLiveCount();
