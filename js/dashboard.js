// DASHBOARD — Water Quality Gauges

const SENSORS = window.SENSORS = {
    temp: {
        valEl: document.getElementById('val-temp'),
        badgeEl: document.getElementById('status-temp'),
        dotEl: document.getElementById('dot-temp'),
        cardEl: document.getElementById('gauge-temp'),
        getState(v) {
            if (v >= 24 && v <= 30) return { label: 'NORMAL', state: 'optimal' };
            if ((v >= 20 && v < 24) || (v > 30 && v <= 33)) return { label: 'WARNING', state: 'warning' };
            return { label: 'CRITICAL', state: 'critical' };
        }
    },
    ph: {
        valEl: document.getElementById('val-ph'),
        badgeEl: document.getElementById('status-ph'),
        dotEl: document.getElementById('dot-ph'),
        cardEl: document.getElementById('gauge-ph'),
        getState(v) {
            if (v >= 7.0 && v <= 8.5) return { label: 'NORMAL', state: 'optimal' };
            if ((v >= 6.5 && v < 7.0) || (v > 8.5 && v <= 9.0)) return { label: 'WARNING', state: 'warning' };
            return { label: 'CRITICAL', state: 'critical' };
        }
    },
    do: {
        valEl: document.getElementById('val-do'),
        badgeEl: document.getElementById('status-do'),
        dotEl: document.getElementById('dot-do'),
        cardEl: document.getElementById('gauge-do'),
        getState(v) {
            if (v >= 5.0) return { label: 'NORMAL', state: 'optimal' };
            if (v >= 3.0) return { label: 'LOW', state: 'warning' };
            return { label: 'CRITICAL', state: 'critical' };
        }
    },
    turb: {
        valEl: document.getElementById('val-turb'),
        badgeEl: document.getElementById('status-turb'),
        dotEl: document.getElementById('dot-turb'),
        cardEl: document.getElementById('gauge-turb'),
        getState(v) {
            if (v <= 25) return { label: 'NORMAL', state: 'optimal' };
            if (v <= 50) return { label: 'CLOUDY', state: 'warning' };
            return { label: 'DIRTY', state: 'critical' };
        }
    },
    waterLevel: {
        valEl: document.getElementById('val-water-level'),
        badgeEl: document.getElementById('status-water-level'),
        dotEl: document.getElementById('dot-water-level'),
        cardEl: document.getElementById('gauge-water-level'),
        getState(v) {
            if (v >= 80 && v <= 120) return { label: 'NORMAL', state: 'optimal' };
            if ((v >= 60 && v < 80) || (v > 120 && v <= 140)) return { label: 'WARNING', state: 'warning' };
            return { label: 'CRITICAL', state: 'critical' };
        }
    }
};

function updateGauge(key, value) {
    const s = SENSORS[key];
    const { label, state } = s.getState(value);
    s.valEl.textContent = value;
    s.dotEl.className = `gauge-dot ${state}`;
    s.badgeEl.className = `gauge-badge ${state}`;
    s.badgeEl.childNodes[1]?.remove();
    s.badgeEl.appendChild(document.createTextNode(label));
    s.cardEl.className = `gauge-card ${state}`;
}

function simulateSensors() {
    updateGauge('temp', (27.5).toFixed(1));
    updateGauge('ph',   (7.8).toFixed(1));
    updateGauge('do',   (4.2).toFixed(1));
    updateGauge('turb', 60);
    updateGauge('waterLevel', (100).toFixed(1));
}

const LEGENDS = {
    temp: {
        title: 'TEMPERATURE (°C)',
        items: [
            { state: 'optimal', label: 'NORMAL', range: '24–30°C', desc: 'Optimal range for crayfish growth and molting.' },
            { state: 'warning', label: 'WARNING', range: '20–23°C or 31–33°C', desc: 'May slow metabolism and cause stress to crayfish.' },
            { state: 'critical', label: 'CRITICAL', range: 'below 20°C or above 33°C', desc: 'Can cause death. Alert notification will be sent.' }
        ]
    },
    ph: {
        title: 'pH LEVEL',
        items: [
            { state: 'optimal', label: 'NORMAL', range: '7.0–8.5', desc: 'Ideal acidity for healthy molting and shell formation.' },
            { state: 'warning', label: 'WARNING', range: '6.5–6.9 or 8.6–9.0', desc: 'May irritate gills and weaken immune system.' },
            { state: 'critical', label: 'CRITICAL', range: 'below 6.5 or above 9.0', desc: 'Highly toxic. Can cause rapid death of crayfish.' }
        ]
    },
    do: {
        title: 'DISSOLVED OXYGEN (mg/L)',
        items: [
            { state: 'optimal', label: 'NORMAL', range: '5.0+ mg/L', desc: 'Sufficient oxygen for active and healthy crayfish.' },
            { state: 'warning', label: 'LOW', range: '3.0–4.9 mg/L', desc: 'Crayfish may become inactive and lose appetite.' },
            { state: 'critical', label: 'CRITICAL', range: 'below 3.0 mg/L', desc: 'Dangerously low. Triggers aerator pump automatically.' }
        ]
    },
    turb: {
        title: 'TURBIDITY (NTU)',
        items: [
            { state: 'optimal', label: 'NORMAL', range: '0–25 NTU', desc: 'Clean water with good visibility and low bacteria risk.' },
            { state: 'warning', label: 'CLOUDY', range: '26–50 NTU', desc: 'Suspended particles may clog gills over time.' },
            { state: 'critical', label: 'DIRTY', range: 'above 50 NTU', desc: 'Severely dirty water. Triggers filtration alert immediately.' }
        ]
    },
    waterLevel: {
        title: 'WATER LEVEL (cm)',
        items: [
            { state: 'optimal', label: 'NORMAL', range: '80–120 cm', desc: 'Ideal water level for crayfish growth and oxygen exchange.' },
            { state: 'warning', label: 'WARNING', range: '60–79 cm or 121–140 cm', desc: 'May affect water quality and circulation.' },
            { state: 'critical', label: 'CRITICAL', range: 'below 60 cm or above 140 cm', desc: 'Extreme water level. Can stress or kill crayfish.' }
        ]
    }
};

const legendOverlay = document.getElementById('legend-overlay');
const legendSheet = document.getElementById('legend-sheet');
const legendTitle = document.getElementById('legend-title');
const legendList = document.getElementById('legend-list');

function openLegend(key) {
    const data = LEGENDS[key];
    legendTitle.textContent = data.title;
    legendList.innerHTML = data.items.map(item => `
        <div class="legend-item">
            <span class="legend-dot ${item.state}"></span>
            <div class="legend-info">
                <span class="legend-state">${item.label}</span>
                <span class="legend-range">${item.range}</span>
                <span class="legend-desc">${item.desc}</span>
            </div>
        </div>
    `).join('');
    legendOverlay.classList.add('show');
    legendSheet.classList.add('show');
}

function closeLegend() {
    legendOverlay.classList.remove('show');
    legendSheet.classList.remove('show');
}

legendOverlay.addEventListener('click', closeLegend);

// Gauge Card Detail Modal
const GAUGE_META = {
    temp: { title: 'Temperature', unit: '°C', img: 'resources/images/temperature.png', ideal: 'Ideal: 24.0 – 30.0°C' },
    ph:   { title: 'pH Level',    unit: 'pH',   img: 'resources/images/pH.png',          ideal: 'Ideal: 7.0 – 8.5' },
    do:   { title: 'Dissolved O₂', unit: 'mg/L', img: 'resources/images/DO.png',       ideal: 'Ideal: >5.0 mg/L' },
    turb: { title: 'Turbidity',   unit: 'NTU',  img: 'resources/images/Turbidity.png',  ideal: 'Ideal: 0 – 25 NTU' },
    waterLevel: { title: 'Water Level', unit: 'cm', img: 'resources/images/Turbidity.png', ideal: 'Ideal: 80 – 120 cm' }
};

const gaugeModalOverlay = document.getElementById('gauge-modal-overlay');
const gaugeModal        = document.getElementById('gauge-modal');

function openGaugeModal(key) {
    const s    = SENSORS[key];
    const meta = GAUGE_META[key];
    const val  = s.valEl.textContent;
    const { label, state } = s.getState(parseFloat(val));

    document.getElementById('gauge-modal-header-title').textContent = 'Details';
    document.getElementById('gauge-modal-title').textContent = meta.title;
    document.getElementById('gauge-modal-img').src           = meta.img;
    document.getElementById('gauge-modal-value').textContent = val;
    document.getElementById('gauge-modal-unit').textContent  = meta.unit;
    document.getElementById('gauge-modal-ideal').textContent = meta.ideal;

    const badge = document.getElementById('gauge-modal-badge');
    badge.textContent = label;
    badge.className   = `gauge-badge ${state}`;
    badge.prepend(Object.assign(document.createElement('span'), { className: `gauge-dot ${state}` }));

    // Legend
    const legendData = LEGENDS[key];
    document.getElementById('gauge-modal-legend').innerHTML = legendData.items.map(item => `
        <div class="legend-item">
            <span class="legend-dot ${item.state}"></span>
            <div class="legend-info">
                <span class="legend-state">${item.label}</span>
                <span class="legend-range">${item.range}</span>
                <span class="legend-desc">${item.desc}</span>
            </div>
        </div>
    `).join('');

    gaugeModalOverlay.classList.add('show');
    gaugeModal.classList.add('show');
}

document.getElementById('gauge-modal-view-btn').addEventListener('click', () => {
    gaugeModalOverlay.classList.remove('show');
    gaugeModal.classList.remove('show');
    // Navigate to analytics tab
    document.querySelector('.nav-btn[data-target="analytics"]').click();
    setTimeout(() => buildCharts('24h'), 100);
});

gaugeModalOverlay.addEventListener('click', () => {
    gaugeModalOverlay.classList.remove('show');
    gaugeModal.classList.remove('show');
});

document.getElementById('gauge-modal-close').addEventListener('click', () => {
    gaugeModalOverlay.classList.remove('show');
    gaugeModal.classList.remove('show');
});

// Attach click to each gauge card
Object.keys(SENSORS).forEach(key => {
    SENSORS[key].cardEl.addEventListener('click', () => {
        openGaugeModal(key);
    });
});

// QUICK ACTIONS

document.getElementById('quick-aerator')?.addEventListener('click', () => {
    window.showNavSection('controls');
    setTimeout(() => {
        const card = document.getElementById('hw-aerator1');
        if (card) card.click();
    }, 100);
});

document.getElementById('quick-pump')?.addEventListener('click', () => {
    window.showNavSection('controls');
    setTimeout(() => {
        const card = document.getElementById('hw-pump');
        if (card) card.click();
    }, 100);
});

document.getElementById('quick-feed-now')?.addEventListener('click', () => {
    window.showNavSection('controls');
});

simulateSensors();
setInterval(simulateSensors, 300000);

// ─── TANK STATUS (live data) ────────────────────────────
function updateDashTankStatus() {
    const live = window.getLiveCount ? window.getLiveCount() : 0;
    const totalMort = window.getTotalMortality ? window.getTotalMortality() : 0;
    const initial = window.growoutData?.initialStock ?? 0;
    const survival = initial > 0 ? (live / initial * 100) : 0;

    document.getElementById('dash-live-count').textContent = live;
    document.getElementById('dash-survival').textContent = survival.toFixed(1) + '%';
    document.getElementById('dash-initial').textContent = initial;
    document.getElementById('dash-mortality').textContent = totalMort;
}

setTimeout(updateDashTankStatus, 100);
setInterval(updateDashTankStatus, 5000);

// ─── NEXT ACTION CARD ──────────────────────────────────
function updateDashNextAction() {
    const data = window.growoutData || {};
    const samplingHistory = data.samplingHistory || [];
    const hasStock = data.initialStock > 0;

    // Days in culture
    const days = window.getDaysInCulture ? window.getDaysInCulture() : 0;
    document.getElementById('dash-days-culture').textContent = days > 0 ? days + ' day' + (days !== 1 ? 's' : '') : '--';

    // Last sampling — date only
    const lastDetail = document.getElementById('dash-last-sampling-detail');
    if (samplingHistory.length > 0) {
        const last = samplingHistory[samplingHistory.length - 1];
        const d = new Date(last.date + 'T00:00:00');
        lastDetail.textContent = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else {
        lastDetail.textContent = 'No data';
    }

    // Next sampling — date + remaining days
    const nextEl = document.getElementById('dash-next-sampling-date');
    const remainingEl = document.getElementById('dash-sampling-remaining');
    if (!hasStock) {
        nextEl.textContent = 'Set up first';
        if (remainingEl) remainingEl.textContent = '';
    } else {
        const nextDate = window.getNextSamplingDate ? window.getNextSamplingDate() : null;
        if (nextDate && !isNaN(nextDate)) {
            nextEl.textContent = nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const daysUntil = window.getDaysUntilSampling ? window.getDaysUntilSampling() : null;
            if (remainingEl) {
                if (daysUntil === 0) remainingEl.textContent = 'Due today!';
                else if (daysUntil > 0) remainingEl.textContent = daysUntil + ' day' + (daysUntil !== 1 ? 's' : '') + ' left';
                else remainingEl.textContent = '';
            }
        } else {
            nextEl.textContent = 'After first sampling';
            if (remainingEl) remainingEl.textContent = '';
        }
    }
}

setTimeout(updateDashNextAction, 100);
setInterval(updateDashNextAction, 5000);

// Re-run on custom events
document.addEventListener('growoutUpdated', updateDashTankStatus);
document.addEventListener('growoutUpdated', updateDashNextAction);
