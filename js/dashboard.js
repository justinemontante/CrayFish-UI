// DASHBOARD — Water Quality Gauges

const SENSORS = {
    temp: {
        valEl: document.getElementById('val-temp'),
        badgeEl: document.getElementById('status-temp'),
        dotEl: document.getElementById('dot-temp'),
        cardEl: document.getElementById('gauge-temp'),
        getState(v) {
            if (v >= 24 && v <= 30) return { label: 'Ideal', state: 'optimal' };
            if ((v >= 21 && v < 24) || (v > 30 && v <= 32)) return { label: 'Thermal Stress', state: 'warning' };
            return { label: 'Lethal Temp', state: 'critical' };
        }
    },
    ph: {
        valEl: document.getElementById('val-ph'),
        badgeEl: document.getElementById('status-ph'),
        dotEl: document.getElementById('dot-ph'),
        cardEl: document.getElementById('gauge-ph'),
        getState(v) {
            if (v >= 7.0 && v <= 8.5) return { label: 'Balanced', state: 'optimal' };
            if ((v >= 6.5 && v < 7.0) || (v > 8.5 && v <= 9.5)) return { label: 'pH Imbalance', state: 'warning' };
            return { label: 'Chemical Danger', state: 'critical' };
        }
    },
    do: {
        valEl: document.getElementById('val-do'),
        badgeEl: document.getElementById('status-do'),
        dotEl: document.getElementById('dot-do'),
        cardEl: document.getElementById('gauge-do'),
        getState(v) {
            if (v > 5.0) return { label: 'Oxygen Rich', state: 'optimal' };
            if (v >= 3.1) return { label: 'Low Oxygen', state: 'warning' };
            return { label: 'Suffocation Risk', state: 'critical' };
        }
    },
    turb: {
        valEl: document.getElementById('val-turb'),
        badgeEl: document.getElementById('status-turb'),
        dotEl: document.getElementById('dot-turb'),
        cardEl: document.getElementById('gauge-turb'),
        getState(v) {
            if (v <= 25) return { label: 'Crystal Clear', state: 'optimal' };
            if (v <= 50) return { label: 'Moderate Cloud', state: 'warning' };
            return { label: 'Fouled Water', state: 'critical' };
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
    updateGauge('temp', +(24 + Math.random() * 8).toFixed(1));
    updateGauge('ph',   +(6.8 + Math.random() * 2).toFixed(1));
    updateGauge('do',   +(3 + Math.random() * 4).toFixed(1));
    updateGauge('turb', Math.floor(Math.random() * 65));
}

const LEGENDS = {
    temp: {
        title: 'Temperature Status Legend',
        items: [
            { state: 'optimal', label: 'Ideal', range: '24.0°C – 30.0°C', desc: 'Optimal range for crayfish growth and molting.' },
            { state: 'warning', label: 'Thermal Stress', range: '21.0°C – 23.9°C or 30.1°C – 32.0°C', desc: 'May slow metabolism and cause stress to crayfish.' },
            { state: 'critical', label: 'Lethal Temp', range: 'Below 20.0°C or Above 32.0°C', desc: 'Can cause death. Triggers cooling fans automatically.' }
        ]
    },
    ph: {
        title: 'pH Level Status Legend',
        items: [
            { state: 'optimal', label: 'Balanced', range: '7.0 – 8.5', desc: 'Ideal acidity for healthy molting and shell formation.' },
            { state: 'warning', label: 'pH Imbalance', range: '6.5 – 6.9 or 8.6 – 9.5', desc: 'May irritate gills and weaken immune system.' },
            { state: 'critical', label: 'Chemical Danger', range: 'Below 6.5 or Above 9.5', desc: 'Highly toxic. Can cause rapid death of crayfish.' }
        ]
    },
    do: {
        title: 'Dissolved O₂ Status Legend',
        items: [
            { state: 'optimal', label: 'Oxygen Rich', range: 'Above 5.0 mg/L', desc: 'Sufficient oxygen for active and healthy crayfish.' },
            { state: 'warning', label: 'Low Oxygen', range: '3.1 – 4.9 mg/L', desc: 'Crayfish may become lethargic and lose appetite.' },
            { state: 'critical', label: 'Suffocation Risk', range: 'Below 3.0 mg/L', desc: 'Dangerously low. Triggers aerator pump automatically.' }
        ]
    },
    turb: {
        title: 'Turbidity Status Legend',
        items: [
            { state: 'optimal', label: 'Crystal Clear', range: '0 – 25 NTU', desc: 'Clean water with good visibility and low bacteria risk.' },
            { state: 'warning', label: 'Moderate Cloud', range: '26 – 50 NTU', desc: 'Suspended particles may clog gills over time.' },
            { state: 'critical', label: 'Fouled Water', range: 'Above 60 NTU', desc: 'Severely dirty water. Triggers filtration alert immediately.' }
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

Object.keys(SENSORS).forEach(key => {
    SENSORS[key].badgeEl.addEventListener('click', () => openLegend(key));
});

legendOverlay.addEventListener('click', closeLegend);

simulateSensors();
setInterval(simulateSensors, 5000);