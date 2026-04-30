// ANALYTICS — Historical Data & Trends

const TEAL = '#1FA5A5';
const CHART_COLORS = {
    temp: '#f59e0b',
    ph:   '#1FA5A5',
    do:   '#52c283',
    turb: '#E63946'
};

// Generate simulated historical data
function generateData(points, min, max) {
    return Array.from({ length: points }, () => +(Math.random() * (max - min) + min).toFixed(1));
}

function getLabels(range) {
    const now = new Date();
    if (range === '24h') {
        return Array.from({ length: 12 }, (_, i) => {
            const d = new Date(now - (11 - i) * 2 * 3600000);
            let h = d.getHours();
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12 || 12;
            return h + ':00 ' + ampm;
        });
    }
    if (range === '7d') {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(now - (6 - i) * 86400000);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
    }
    return Array.from({ length: 10 }, (_, i) => {
        const d = new Date(now - (9 - i) * 3 * 86400000);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
}

const UNITS = { temp: '°C', ph: '', do: ' mg/L', turb: ' NTU' };

function makeChartConfig(label, data, labels, color, unit) {
    return {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label,
                data,
                borderColor: color,
                backgroundColor: color + '18',
                borderWidth: 2.5,
                pointRadius: 4,
                pointHoverRadius: 7,
                pointBackgroundColor: color,
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: color,
                pointHoverBorderWidth: 2.5,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            interaction: { mode: 'nearest', intersect: true },
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    backgroundColor: '#0B3C49',
                    titleFont: { family: 'Poppins', size: 10, weight: '700' },
                    bodyFont: { family: 'Poppins', size: 11, weight: '800' },
                    footerFont: { family: 'Poppins', size: 9 },
                    padding: 10,
                    cornerRadius: 10,
                    displayColors: false,
                    callbacks: {
                        title: ctx => ctx[0].label,
                        label: ctx => `${ctx.parsed.y} ${label.includes('Temp') ? '°C' : label.includes('pH') ? 'pH' : label.includes('O') ? 'mg/L' : 'NTU'}`,
                        footer: ctx => {
                            const v = ctx[0].parsed.y;
                            if (label.includes('Temp')) {
                                if (v >= 24 && v <= 30) return 'Status: Ideal';
                                if (v >= 21 && v <= 32) return 'Status: Thermal Stress';
                                return 'Status: Lethal Temp';
                            }
                            if (label.includes('pH')) {
                                if (v >= 7.0 && v <= 8.5) return 'Status: Balanced';
                                if (v >= 6.5 && v <= 9.5) return 'Status: pH Imbalance';
                                return 'Status: Chemical Danger';
                            }
                            if (label.includes('O')) {
                                if (v > 5.0) return 'Status: Oxygen Rich';
                                if (v >= 3.1) return 'Status: Low Oxygen';
                                return 'Status: Suffocation Risk';
                            }
                            if (v <= 25) return 'Status: Crystal Clear';
                            if (v <= 50) return 'Status: Moderate Cloud';
                            return 'Status: Fouled Water';
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { font: { family: 'Poppins', size: 8 }, color: '#0B3C4988' },
                    grid: { display: false }
                },
                y: {
                    ticks: {
                        font: { family: 'Poppins', size: 8 },
                        color: '#0B3C4988',
                        maxTicksLimit: 4,
                        callback: val => `${val}${unit}`
                    },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                }
            }
        }
    };
}

let charts = {};

function buildCharts(range) {
    const labels = getLabels(range);
    const pts = labels.length;

    const datasets = {
        temp: generateData(pts, 22, 32),
        ph:   generateData(pts, 6.5, 9.0),
        do:   generateData(pts, 2.5, 7.0),
        turb: generateData(pts, 10, 70)
    };

    const configs = {
        temp: makeChartConfig('Temperature', datasets.temp, labels, CHART_COLORS.temp, UNITS.temp),
        ph:   makeChartConfig('pH Level',    datasets.ph,   labels, CHART_COLORS.ph,   UNITS.ph),
        do:   makeChartConfig('Dissolved O₂',datasets.do,   labels, CHART_COLORS.do,   UNITS.do),
        turb: makeChartConfig('Turbidity',   datasets.turb, labels, CHART_COLORS.turb, UNITS.turb)
    };

    Object.keys(configs).forEach(key => {
        if (charts[key]) charts[key].destroy();
        charts[key] = new Chart(document.getElementById(`chart-${key}`), configs[key]);
    });

    const avg = arr => (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
    document.getElementById('avg-temp').textContent = `Avg: ${avg(datasets.temp)}°C`;
    document.getElementById('avg-ph').textContent   = `Avg: ${avg(datasets.ph)}`;
    document.getElementById('avg-do').textContent   = `Avg: ${avg(datasets.do)} mg/L`;
    document.getElementById('avg-turb').textContent = `Avg: ${avg(datasets.turb)} NTU`;

    // System Insights
    const peakTemp = Math.max(...datasets.temp);
    const peakTurb = Math.max(...datasets.turb);
    const minDo    = Math.min(...datasets.do);
    let insight = `Peak temperature reached ${peakTemp}°C. `;
    if (peakTurb > 50) insight += `Turbidity spiked to ${peakTurb} NTU — check filtration. `;
    if (minDo < 3.5)   insight += `DO dropped to ${minDo} mg/L — aerator may have triggered.`;
    document.getElementById('insight-text').textContent = insight;
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const range = btn.dataset.range;
        if (range === 'custom') {
            document.getElementById('custom-range').classList.remove('hidden');
        } else {
            document.getElementById('custom-range').classList.add('hidden');
            buildCharts(range);
        }
    });
});

document.getElementById('apply-custom').addEventListener('click', () => {
    buildCharts('custom');
});

// CSV Export
document.getElementById('export-btn').addEventListener('click', () => {
    const labels = getLabels('24h');
    const rows = [['Time', 'Temperature (°C)', 'pH', 'DO (mg/L)', 'Turbidity (NTU)']];
    labels.forEach((l, i) => {
        rows.push([
            l,
            charts.temp?.data.datasets[0].data[i] ?? '',
            charts.ph?.data.datasets[0].data[i] ?? '',
            charts.do?.data.datasets[0].data[i] ?? '',
            charts.turb?.data.datasets[0].data[i] ?? ''
        ]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'craycare_data.csv';
    a.click();
});

// Init on analytics tab shown
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.dataset.target === 'analytics') {
            setTimeout(() => buildCharts('24h'), 50);
        }
    });
});

// Chart Fullscreen Modal
const chartOverlay = document.getElementById('chart-overlay');
const chartModal = document.getElementById('chart-modal');
const chartModalTitle = document.getElementById('chart-modal-title');
const chartModalClose = document.getElementById('chart-modal-close');

const CHART_TITLES = {
    temp: 'Temperature (°C)',
    ph:   'pH Level',
    do:   'Dissolved O₂ (mg/L)',
    turb: 'Turbidity (NTU)'
};

let modalChart = null;

const CHART_KEYS = {
    temp: { label: 'Temperature', unit: '°C' },
    ph:   { label: 'pH Level',    unit: 'pH' },
    do:   { label: 'Dissolved O₂', unit: 'mg/L' },
    turb: { label: 'Turbidity',   unit: 'NTU' }
};

const SENSOR_IDS = { temp: 'val-temp', ph: 'val-ph', do: 'val-do', turb: 'val-turb' };
let liveValInterval = null;

function openChartModal(key) {
    const src = charts[key];
    if (!src) return;
    const { label } = CHART_KEYS[key];
    chartModalTitle.textContent = CHART_TITLES[key];

    // Set live value
    const unit = UNITS[key];
    document.getElementById('chart-modal-live-unit').textContent = unit;
    const updateLive = () => {
        const el = document.getElementById(SENSOR_IDS[key]);
        if (!el) return;
        const val = parseFloat(el.textContent);
        document.getElementById('chart-modal-live-val').textContent = el.textContent;
        // Get state from dashboard SENSORS if available
        const sensorState = window.SENSORS?.[key]?.getState(val);
        if (sensorState) {
            const badge = document.getElementById('chart-modal-live-badge');
            badge.className = 'chart-modal-status';
            badge.textContent = `Status: ${sensorState.label}`;
        }
    };
    updateLive();
    if (liveValInterval) clearInterval(liveValInterval);
    liveValInterval = setInterval(updateLive, 1000);

    if (modalChart) modalChart.destroy();
    const config = makeChartConfig(
        label,
        src.data.datasets[0].data,
        src.data.labels,
        CHART_COLORS[key],
        UNITS[key]
    );
    config.options.scales.x.ticks.font.size = 9;
    config.options.scales.y.ticks.font.size = 9;
    modalChart = new Chart(document.getElementById('chart-modal-canvas'), config);
    chartOverlay.classList.add('show');
    chartModal.classList.add('show');
}

function closeChartModal() {
    chartOverlay.classList.remove('show');
    chartModal.classList.remove('show');
    if (liveValInterval) { clearInterval(liveValInterval); liveValInterval = null; }
}

document.querySelectorAll('.chart-card').forEach(card => {
    card.addEventListener('click', () => openChartModal(card.dataset.chart));
});

chartOverlay.addEventListener('click', closeChartModal);
chartModalClose.addEventListener('click', closeChartModal);
