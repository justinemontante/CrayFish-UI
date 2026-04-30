// DASHBOARD — Water Quality Gauges

const SENSORS = window.SENSORS = {
    temp: {
        valEl: document.getElementById('val-temp'),
        badgeEl: document.getElementById('status-temp'),
        dotEl: document.getElementById('dot-temp'),
        cardEl: document.getElementById('gauge-temp'),
        getState(v) {
            if (v >= 24 && v <= 30) return { label: 'Normal', state: 'optimal' };
            if ((v >= 21 && v < 24) || (v > 30 && v <= 32)) return { label: 'Too Hot / Too Cold', state: 'warning' };
            return { label: 'Danger', state: 'critical' };
        }
    },
    ph: {
        valEl: document.getElementById('val-ph'),
        badgeEl: document.getElementById('status-ph'),
        dotEl: document.getElementById('dot-ph'),
        cardEl: document.getElementById('gauge-ph'),
        getState(v) {
            if (v >= 7.0 && v <= 8.5) return { label: 'Normal', state: 'optimal' };
            if ((v >= 6.5 && v < 7.0) || (v > 8.5 && v <= 9.5)) return { label: 'Off Range', state: 'warning' };
            return { label: 'Danger', state: 'critical' };
        }
    },
    do: {
        valEl: document.getElementById('val-do'),
        badgeEl: document.getElementById('status-do'),
        dotEl: document.getElementById('dot-do'),
        cardEl: document.getElementById('gauge-do'),
        getState(v) {
            if (v > 5.0) return { label: 'Normal', state: 'optimal' };
            if (v >= 3.1) return { label: 'Low', state: 'warning' };
            return { label: 'Critical', state: 'critical' };
        }
    },
    turb: {
        valEl: document.getElementById('val-turb'),
        badgeEl: document.getElementById('status-turb'),
        dotEl: document.getElementById('dot-turb'),
        cardEl: document.getElementById('gauge-turb'),
        getState(v) {
            if (v <= 25) return { label: 'Clear', state: 'optimal' };
            if (v <= 50) return { label: 'Cloudy', state: 'warning' };
            return { label: 'Dirty', state: 'critical' };
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

    // Auto-push critical notifications
    if (state === 'critical' && window.pushNotification) {
        const NOTIF_MAP = {
            temp: { icon: 'bi-thermometer-high', title: 'High Temperature Alert', msg: `Temperature is at ${value}°C — Lethal range detected.` },
            ph:   { icon: 'bi-exclamation-triangle-fill', title: 'pH Critical Alert', msg: `pH level is at ${value} — Chemical danger detected.` },
            do:   { icon: 'bi-droplet-fill', title: 'Low DO Alert', msg: `Dissolved Oxygen dropped to ${value} mg/L — Aerator triggered.` },
            turb: { icon: 'bi-eye-slash-fill', title: 'Turbidity Alert', msg: `Turbidity is at ${value} NTU — Fouled water detected.` }
        };
        const n = NOTIF_MAP[key];
        if (n) window.pushNotification('critical', n.icon, n.title, n.msg);
    }
}

function simulateSensors() {
    updateGauge('temp', +(24 + Math.random() * 8).toFixed(1));
    updateGauge('ph',   +(6.8 + Math.random() * 2).toFixed(1));
    updateGauge('do',   +(3 + Math.random() * 4).toFixed(1));
    updateGauge('turb', Math.floor(Math.random() * 65));
}

const LEGENDS = {
    temp: {
        title: 'Temperature Status Legend',
        items: [
            { state: 'optimal', label: 'Normal', range: '24.0°C – 30.0°C', desc: 'Optimal range for crayfish growth and molting.' },
            { state: 'warning', label: 'Too Hot / Too Cold', range: '21.0°C – 23.9°C or 30.1°C – 32.0°C', desc: 'May slow metabolism and cause stress to crayfish.' },
            { state: 'critical', label: 'Danger', range: 'Below 20.0°C or Above 32.0°C', desc: 'Can cause death. Triggers cooling fans automatically.' }
        ]
    },
    ph: {
        title: 'pH Level Status Legend',
        items: [
            { state: 'optimal', label: 'Normal', range: '7.0 – 8.5', desc: 'Ideal acidity for healthy molting and shell formation.' },
            { state: 'warning', label: 'Off Range', range: '6.5 – 6.9 or 8.6 – 9.5', desc: 'May irritate gills and weaken immune system.' },
            { state: 'critical', label: 'Danger', range: 'Below 6.5 or Above 9.5', desc: 'Highly toxic. Can cause rapid death of crayfish.' }
        ]
    },
    do: {
        title: 'Dissolved O₂ Status Legend',
        items: [
            { state: 'optimal', label: 'Normal', range: 'Above 5.0 mg/L', desc: 'Sufficient oxygen for active and healthy crayfish.' },
            { state: 'warning', label: 'Low', range: '3.1 – 4.9 mg/L', desc: 'Crayfish may become lethargic and lose appetite.' },
            { state: 'critical', label: 'Critical', range: 'Below 3.0 mg/L', desc: 'Dangerously low. Triggers aerator pump automatically.' }
        ]
    },
    turb: {
        title: 'Turbidity Status Legend',
        items: [
            { state: 'optimal', label: 'Clear', range: '0 – 25 NTU', desc: 'Clean water with good visibility and low bacteria risk.' },
            { state: 'warning', label: 'Cloudy', range: '26 – 50 NTU', desc: 'Suspended particles may clog gills over time.' },
            { state: 'critical', label: 'Dirty', range: 'Above 60 NTU', desc: 'Severely dirty water. Triggers filtration alert immediately.' }
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
    turb: { title: 'Turbidity',   unit: 'NTU',  img: 'resources/images/Turbidity.png',  ideal: 'Ideal: 0 – 25 NTU' }
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


simulateSensors();
setInterval(simulateSensors, 5000);
