// TANK 3: GROW-OUT — REDESIGNED
const GROWOUT_KEY = 'craycare_growout';
const GROWOUT_CYCLE_DAYS = 7;
const GROWOUT_FEED_PCT = 0.03;

let growoutData = (() => {
    try {
        const saved = localStorage.getItem(GROWOUT_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Default sample data so dashboard isn't blank on first open
    return {
        initialStock: 68,
        mortalityHistory: [
            { date: '2026-04-28', count: 2 },
            { date: '2026-05-02', count: 3 }
        ],
        stockingDate: '2026-04-15',
        lastSamplingDate: '2026-05-01',
        samplingHistory: [
            { date: '2026-04-22', samples: 7, totalWeight: 245, abw: 35.0 },
            { date: '2026-05-01', samples: 8, totalWeight: 320, abw: 40.0 }
        ]
    };
})();

function saveGrowout() {
    try { localStorage.setItem(GROWOUT_KEY, JSON.stringify(growoutData)); } catch (e) {}
}

function getTotalMortality() {
    return growoutData.mortalityHistory.reduce((sum, entry) => sum + entry.count, 0);
}
function getLiveCount() { return Math.max(growoutData.initialStock - getTotalMortality(), 0); }
function getSurvivalRate() { return growoutData.initialStock === 0 ? 0 : (getLiveCount() / growoutData.initialStock * 100); }

function getDaysInCulture() {
    if (!growoutData.stockingDate) return 0;
    const stock = new Date(growoutData.stockingDate + 'T00:00:00');
    const now = new Date(); now.setHours(0, 0, 0, 0);
    return Math.max(Math.floor((now - stock) / 86400000), 0);
}

// Auto-update days in culture daily
setInterval(() => {
    const days = getDaysInCulture();
    const daysEl = document.getElementById('go-days-culture');
    if (daysEl) daysEl.textContent = days + ' day' + (days !== 1 ? 's' : '');
}, 60000); // Check every minute

function getDaysUntilSampling() {
    if (!growoutData.lastSamplingDate) return GROWOUT_CYCLE_DAYS;
    const last = new Date(growoutData.lastSamplingDate + 'T00:00:00');
    const next = new Date(last); next.setDate(next.getDate() + GROWOUT_CYCLE_DAYS);
    const now = new Date(); now.setHours(0, 0, 0, 0);
    return Math.max(Math.ceil((next - now) / 86400000), 0);
}

function getNextSamplingDate() {
    if (!growoutData.lastSamplingDate) return null;
    const last = new Date(growoutData.lastSamplingDate + 'T00:00:00');
    last.setDate(last.getDate() + GROWOUT_CYCLE_DAYS);
    return last;
}

function getGrowthStage(abw) {
    if (abw == null) return { name: '--', index: 0, pct: 0 };
    if (abw <= 5)  return { name: 'Postlarvae', index: 0, pct: (abw / 5) * 25 };
    if (abw <= 20) return { name: 'Juvenile',   index: 1, pct: 25 + ((abw - 5) / 15) * 25 };
    if (abw <= 40) return { name: 'Sub-adult',  index: 2, pct: 50 + ((abw - 20) / 20) * 25 };
    if (abw < 60)  return { name: 'Sub-adult',  index: 2, pct: 75 + ((abw - 40) / 20) * 25 };
    return { name: 'Harvest-ready', index: 3, pct: 100 };
}

/* ═══════════════════════════════════════════
   RENDERING
  ═══════════════════════════════════════════ */
function renderGrowout() {
    const live = getLiveCount();
    const survival = getSurvivalRate();
    const days = getDaysInCulture();
    
    document.getElementById('go-survival-pct').textContent = survival.toFixed(1) + '%';
    document.getElementById('go-live-count').textContent = live;
    document.getElementById('go-mortality').textContent = getTotalMortality();
    document.getElementById('go-initial-stock').textContent = growoutData.initialStock;
    
    // Update donut - circumference = 2 * PI * r = 2 * 3.1416 * 50 = 314.16
    const circumference = 2 * Math.PI * 50;
    const offset = circumference - (survival / 100) * circumference;
    const fillEl = document.getElementById('go-donut-fill');
    fillEl.style.strokeDashoffset = offset;
    const donutColor = survival >= 95 ? '#52c283' : survival >= 85 ? '#f59e0b' : '#E63946';
    fillEl.setAttribute('stroke', donutColor);
    
    const pctEl = document.getElementById('go-survival-pct');
    pctEl.style.color = donutColor;

    const suggested = Math.ceil(live * 0.1);
    const samplesEl = document.getElementById('go-suggested-samples');
    if (samplesEl) samplesEl.textContent = suggested;
    const promptEl = document.getElementById('go-sampling-prompt');
    if (promptEl) promptEl.innerHTML = `Target: Catch at least <strong>${suggested}</strong> random samples (10%). Actual count may vary.`;

    const countInput = document.getElementById('go-sample-count');
    if (countInput && (countInput.value === '' || countInput.value === '0')) countInput.value = suggested;

    document.getElementById('go-days-culture').textContent = days + ' day' + (days !== 1 ? 's' : '');

    const dateEl = document.getElementById('go-stock-date-display');
    if (growoutData.stockingDate) {
        const d = new Date(growoutData.stockingDate + 'T00:00:00');
        dateEl.textContent = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else {
        dateEl.textContent = 'Not set';
    }

    renderStepTracker();
    renderGrowthStage();
    renderSparklines();
    renderAIInsights();
    renderGrowoutHistory();
}

/* ═══════════════════════════════════════════
   STEP TRACKER
  ═══════════════════════════════════════════ */
function renderStepTracker() {
    const daysLeft = getDaysUntilSampling();
    const countdownEl = document.getElementById('go-sampling-countdown');
    const dateEl = document.getElementById('go-next-sampling-date');
    const dotsContainer = document.getElementById('go-step-dots');

    if (!growoutData.lastSamplingDate) {
        countdownEl.textContent = `${GROWOUT_CYCLE_DAYS} days left`;
        countdownEl.classList.remove('due');
        dateEl.textContent = 'Complete first sampling to begin cycle';
    } else if (daysLeft <= 0) {
        countdownEl.textContent = 'Due today!';
        countdownEl.classList.add('due');
        const nextDate = getNextSamplingDate();
        dateEl.textContent = `Sampling was due: ${nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else {
        countdownEl.textContent = `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`;
        countdownEl.classList.remove('due');
        const nextDate = getNextSamplingDate();
        dateEl.textContent = `Next sampling: ${nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }

    let currentDay = 1;
    if (growoutData.lastSamplingDate) {
        const last = new Date(growoutData.lastSamplingDate + 'T00:00:00');
        const now = new Date(); now.setHours(0, 0, 0, 0);
        const daysElapsed = Math.floor((now - last) / 86400000);
        currentDay = Math.min(Math.max(daysElapsed + 1, 1), GROWOUT_CYCLE_DAYS);
    }

    const dots = dotsContainer.querySelectorAll('.step-dot');
    dots.forEach((dot, i) => {
        dot.classList.remove('done', 'current', 'overdue');
        const dayNum = i + 1;
        if (dayNum < currentDay) dot.classList.add('done');
        else if (dayNum === currentDay) {
            if (daysLeft <= 0) dot.classList.add('overdue');
            else dot.classList.add('current');
        }
    });
}

/* ═══════════════════════════════════════════
   GROWTH STAGE
  ═══════════════════════════════════════════ */
function renderGrowthStage() {
    const history = growoutData.samplingHistory;
    const stageEl = document.getElementById('go-growth-stage');
    const nameEl = document.getElementById('go-stage-name');
    const fillEl = document.getElementById('go-stage-fill');
    const markers = document.querySelectorAll('.growout-stage-marker');
    const hintEl = document.getElementById('go-stage-hint');

    if (history.length === 0) {
        stageEl.classList.add('hidden');
        return;
    }

    stageEl.classList.remove('hidden');
    const last = history[history.length - 1];
    const stage = getGrowthStage(last.abw);

    nameEl.textContent = stage.name;
    fillEl.style.width = stage.pct + '%';
    hintEl.textContent = last.abw >= 60 ? 'Ready for harvest!' : 'Harvest-ready at ~60g ABW';
    nameEl.style.color = last.abw >= 60 ? '#f59e0b' : '#52c283';

    markers.forEach((m, i) => m.classList.toggle('active', i <= stage.index));
}

/* ═══════════════════════════════════════════
   SPARKLINES
  ═══════════════════════════════════════════ */
let sparkAbwChart = null;
let sparkPopChart = null;

function renderSparklines() {
    const section = document.getElementById('go-sparkline-section');
    const emptyEl = document.getElementById('go-spark-empty');
    const btn = document.getElementById('go-full-analytics-btn');
    const history = growoutData.samplingHistory;

    if (history.length < 2) {
        section.classList.add('hidden');
        if (emptyEl) {
            emptyEl.classList.remove('hidden');
            const nextDate = getNextSamplingDate();
            const dateStr = nextDate ? nextDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'your next sampling';
            emptyEl.querySelector('.spark-empty-text').textContent = `Not enough data for trends. Charts will appear after your next sampling on ${dateStr}.`;
        }
        btn.classList.add('hidden');
        return;
    }

    section.classList.remove('hidden');
    if (emptyEl) emptyEl.classList.add('hidden');
    btn.classList.remove('hidden');

    const labels = history.map((s, i) => {
        const d = new Date(s.date + 'T00:00:00');
        return `#${i + 1} · ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    });

    if (sparkAbwChart) sparkAbwChart.destroy();
    sparkAbwChart = new Chart(document.getElementById('go-spark-abw'), {
        type: 'line',
        data: {
            labels,
            datasets: [{
                data: history.map(s => s.abw),
                borderColor: 'rgba(31,165,165,0.7)',
                backgroundColor: 'rgba(31,165,165,0.08)',
                fill: true, tension: 0.3, pointRadius: 2, pointHoverRadius: 4,
                pointBackgroundColor: 'rgba(31,165,165,1)', pointBorderColor: '#fff',
                pointBorderWidth: 1, borderWidth: 2
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: true, bodyFont: { size: 10 }, titleFont: { size: 9 } } },
            scales: {
                y: { display: true, grid: { display: false }, ticks: { font: { size: 8 }, color: 'rgba(31,165,165,0.6)', maxTicksLimit: 3, callback: v => v + 'g' } },
                x: { display: false }
            }
        }
    });

    if (sparkPopChart) sparkPopChart.destroy();
    sparkPopChart = new Chart(document.getElementById('go-spark-pop'), {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Live',
                    data: history.map(s => s.liveCount),
                    borderColor: 'rgba(82,194,131,0.7)',
                    backgroundColor: 'rgba(82,194,131,0.06)',
                    fill: true, tension: 0.3, pointRadius: 2, pointHoverRadius: 4,
                    pointBackgroundColor: 'rgba(82,194,131,1)', pointBorderColor: '#fff',
                    pointBorderWidth: 1, borderWidth: 2
                },
                {
                    label: 'Dead',
                    data: history.map(s => s.mortalityAt),
                    borderColor: 'rgba(230,57,70,0.6)',
                    backgroundColor: 'rgba(230,57,70,0.04)',
                    fill: true, tension: 0.3, pointRadius: 1.5, pointHoverRadius: 3,
                    pointBackgroundColor: 'rgba(230,57,70,0.8)', pointBorderColor: '#fff',
                    pointBorderWidth: 1, borderWidth: 1.5, borderDash: [3, 2]
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'top', labels: { font: { size: 8 }, boxWidth: 10, padding: 4, color: 'rgba(11,60,73,0.4)' } }, tooltip: { enabled: true, bodyFont: { size: 10 }, titleFont: { size: 9 } } },
            scales: {
                y: { display: true, grid: { display: false }, ticks: { font: { size: 8 }, color: 'rgba(11,60,73,0.4)', maxTicksLimit: 3 } },
                x: { display: false }
            }
        }
    });
}

/* ═══════════════════════════════════════════
   AI INSIGHTS
  ═══════════════════════════════════════════ */
function renderAIInsights() {
    const list = document.getElementById('go-insights-list');
    const history = growoutData.samplingHistory;

    if (history.length === 0) {
        list.innerHTML = '';
        return;
    }

    const insights = [];
    const last = history[history.length - 1];
    const live = getLiveCount();
    const survival = getSurvivalRate();
    const days = getDaysInCulture();

    if (history.length >= 2) {
        const prev = history[history.length - 2];
        const abwChange = last.abw - prev.abw;
        const abwPct = (abwChange / prev.abw * 100).toFixed(1);
        if (abwChange > 3) {
            insights.push({ type: 'good', icon: 'bi-graph-up-arrow', title: 'Strong Growth', desc: `ABW increased +${abwPct}% (${prev.abw}g → ${last.abw}g). Feed program is effective.` });
        } else if (abwChange > 0) {
            insights.push({ type: 'info', icon: 'bi-arrow-up-right', title: 'Steady Growth', desc: `ABW grew +${abwPct}% (${prev.abw}g → ${last.abw}g). Monitor for improvements.` });
        } else if (abwChange === 0) {
            insights.push({ type: 'warning', icon: 'bi-pause-circle', title: 'Growth Stalled', desc: `No ABW increase since last sampling (${prev.abw}g). Check water quality.` });
        } else {
            insights.push({ type: 'critical', icon: 'bi-exclamation-triangle', title: 'Weight Loss', desc: `ABW dropped from ${prev.abw}g to ${last.abw}g. Urgent water check needed.` });
        }
    } else {
        insights.push({ type: 'info', icon: 'bi-info-circle', title: 'Baseline Set', desc: `First sampling: ${last.abw}g ABW. More data needed for trends.` });
    }

    if (survival >= 95) {
        insights.push({ type: 'good', icon: 'bi-shield-check', title: 'Excellent Survival', desc: `${survival.toFixed(1)}% survival rate — Health management optimal. Your crayfish are thriving!` });
    } else if (survival >= 85) {
        insights.push({ type: 'warning', icon: 'bi-shield-exclamation', title: 'Moderate Mortality', desc: `${survival.toFixed(1)}% survival. ${getTotalMortality()} crayfish lost. Check water quality parameters soon.` });
    } else {
        insights.push({ type: 'critical', icon: 'bi-shield-x', title: 'High Mortality', desc: `Only ${survival.toFixed(1)}% survival! ${getTotalMortality()} lost. Urgent water check needed — act now.` });
    }

    if (last.abw >= 50 && last.abw < 60) {
        insights.push({ type: 'warning', icon: 'bi-clock-history', title: 'Near Harvest', desc: `ABW at ${last.abw}g — close to 60g. Expect harvest in 2-3 weeks.` });
    } else if (last.abw >= 60) {
        insights.push({ type: 'good', icon: 'bi-trophy', title: 'Harvest Ready!', desc: `ABW ${last.abw}g exceeds 60g threshold. Ready for market.` });
    }

    if (days > 0) {
        const abwPerDay = (last.abw / days).toFixed(2);
        const daysToHarvest = last.abw < 60 ? Math.ceil((60 - last.abw) / parseFloat(abwPerDay)) : 0;
        insights.push({ type: 'info', icon: 'bi-speedometer', title: 'Growth Rate', desc: `${abwPerDay}g/day. Harvest est. in ${last.abw >= 60 ? 'now' : daysToHarvest + ' days'}.` });
    }

    list.innerHTML = insights.map(ins => `
        <div class="growout-insight-item ${ins.type}">
            <div class="growout-insight-icon"><i class="bi ${ins.icon}"></i></div>
            <div class="growout-insight-body">
                <p class="growout-insight-title">${ins.title}</p>
                <p class="growout-insight-desc">${ins.desc}</p>
            </div>
        </div>
    `).join('');
}

/* ═══════════════════════════════════════════
   HISTORY
  ═══════════════════════════════════════════ */
function renderGrowoutHistory() {
    const section = document.getElementById('go-history-section');
    const list = document.getElementById('go-history-list');

    if (growoutData.samplingHistory.length === 0) {
        section.classList.add('hidden');
        return;
    }

    section.classList.remove('hidden');
    list.innerHTML = growoutData.samplingHistory.slice().reverse().map((s, i) => {
        const actualIndex = growoutData.samplingHistory.length - 1 - i;
        const d = new Date(s.date + 'T00:00:00');
        return `
        <div class="growout-history-item">
          <div class="growout-history-left">
            <span class="growout-history-num">#${actualIndex + 1}</span>
            <span class="growout-history-date">${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
          <div class="growout-history-right">
            <span class="growout-history-abw">${s.abw}g</span>
            <span class="growout-history-biomass">${s.biomass}g</span>
          </div>
        </div>`;
    }).join('');
}

/* ═══════════════════════════════════════════
   INIT ON DOM READY
  ═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

    // Tab switching
    document.querySelectorAll('.growout-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.growout-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.growout-tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    // View full analytics
    document.getElementById('go-full-analytics-btn').addEventListener('click', () => {
        window.showNavSection('analytics');
    });

    // Stock date modal
    const stockDateOverlay = document.getElementById('stock-date-overlay');
    const stockDateModal   = document.getElementById('stock-date-modal');

    function openStockDateModal() {
        const input = document.getElementById('stock-date-input');
        input.value = growoutData.stockingDate || new Date().toISOString().split('T')[0];
        stockDateOverlay.classList.add('show');
        stockDateModal.classList.add('show');
    }

    document.getElementById('stock-date-confirm').addEventListener('click', () => {
        const val = document.getElementById('stock-date-input').value;
        if (val) {
            growoutData.stockingDate = val;
            saveGrowout();
            renderGrowout();
        }
        stockDateOverlay.classList.remove('show');
        stockDateModal.classList.remove('show');
    });

    document.getElementById('stock-date-cancel').addEventListener('click', () => {
        stockDateOverlay.classList.remove('show');
        stockDateModal.classList.remove('show');
    });

    stockDateOverlay.addEventListener('click', (e) => {
        if (e.target === stockDateOverlay) {
            stockDateOverlay.classList.remove('show');
            stockDateModal.classList.remove('show');
        }
    });

    if (!growoutData.stockingDate) {
        setTimeout(openStockDateModal, 800);
    }

    // Click on date display to change it
    const stockDateDisplay = document.getElementById('go-stock-date-display');
    if (stockDateDisplay) {
        stockDateDisplay.addEventListener('click', openStockDateModal);
        stockDateDisplay.style.cursor = 'pointer';
    }

    // Initial stock modal
    const initialStockOverlay = document.getElementById('initial-stock-overlay');
    const initialStockModal   = document.getElementById('initial-stock-modal');

    function openInitialStockModal() {
        const input = document.getElementById('initial-stock-input');
        input.value = growoutData.initialStock > 0 ? growoutData.initialStock : '';
        initialStockOverlay.classList.add('show');
        initialStockModal.classList.add('show');
        setTimeout(() => input.focus(), 100);
    }

    const setInitialStockBtn = document.getElementById('go-set-initial-stock');
    if (setInitialStockBtn) {
        setInitialStockBtn.addEventListener('click', openInitialStockModal);
    }

    document.getElementById('initial-stock-confirm').addEventListener('click', () => {
        const val = parseInt(document.getElementById('initial-stock-input').value);
        if (!val || val <= 0) {
            return;
        }
        growoutData.initialStock = val;
        saveGrowout();
        renderGrowout();
        initialStockOverlay.classList.remove('show');
        initialStockModal.classList.remove('show');
    });

    document.getElementById('initial-stock-cancel').addEventListener('click', () => {
        initialStockOverlay.classList.remove('show');
        initialStockModal.classList.remove('show');
    });

    initialStockOverlay.addEventListener('click', (e) => {
        if (e.target === initialStockOverlay) {
            initialStockOverlay.classList.remove('show');
            initialStockModal.classList.remove('show');
        }
    });

    // Mortality modal
    const goMortOverlay = document.getElementById('mortality-overlay');
    const goMortModal   = document.getElementById('mortality-modal');
    let goMortVal = 1;

    function updateMortInput(val) {
        const live = getLiveCount();
        // No negative or zero, max is current count
        goMortVal = Math.max(1, Math.min(Math.max(1, val), live));
        document.getElementById('mort-number-input').value = goMortVal;
        document.getElementById('mort-max-hint').textContent = live;
        document.getElementById('mort-live-hint').textContent = live;
    }

    document.getElementById('go-log-mortality').addEventListener('click', () => {
        if (getLiveCount() <= 0) return;
        updateMortInput(1);
        goMortOverlay.classList.add('show');
        goMortModal.classList.add('show');
    });

    document.getElementById('mort-inc').addEventListener('click', () => updateMortInput(goMortVal + 1));
    document.getElementById('mort-dec').addEventListener('click', () => updateMortInput(goMortVal - 1));
    document.getElementById('mort-number-input').addEventListener('input', (e) => updateMortInput(parseInt(e.target.value) || 1));

    document.getElementById('mort-confirm').addEventListener('click', () => {
        const today = new Date().toISOString().split('T')[0];
        growoutData.mortalityHistory.push({ date: today, count: goMortVal });
        saveGrowout();
        goMortOverlay.classList.remove('show');
        goMortModal.classList.remove('show');
        renderGrowout();
    });

    document.getElementById('mort-cancel').addEventListener('click', () => {
        goMortOverlay.classList.remove('show');
        goMortModal.classList.remove('show');
    });

    goMortOverlay.addEventListener('click', (e) => {
        if (e.target === goMortOverlay) {
            goMortOverlay.classList.remove('show');
            goMortModal.classList.remove('show');
        }
    });

    // Mortality log sheet
    const mortLogOverlay = document.getElementById('mort-log-overlay');
    const mortLogSheet   = document.getElementById('mort-log-sheet');

    function openMortLogSheet() {
        const total = getTotalMortality();
        document.getElementById('mort-log-summary').textContent = `Total: ${total} dead since stocking`;
        const list = document.getElementById('mort-log-list');
        if (growoutData.mortalityHistory.length === 0) {
            list.innerHTML = '<p class="mort-log-empty">No mortality records yet.</p>';
        } else {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            list.innerHTML = growoutData.mortalityHistory.slice().reverse().map(entry => {
                const d = new Date(entry.date + 'T00:00:00');
                return `
                <div class="mort-log-item">
                    <div class="mort-log-item-left">
                        <span class="mort-log-item-date">${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        <span class="mort-log-item-day">${dayNames[d.getDay()]}</span>
                    </div>
                    <span class="mort-log-item-count">−${entry.count}</span>
                </div>`;
            }).join('');
        }
        mortLogOverlay.classList.add('show');
        mortLogSheet.classList.add('show');
    }

    document.getElementById('go-view-mort-log').addEventListener('click', openMortLogSheet);

    document.getElementById('mort-log-close').addEventListener('click', () => {
        mortLogOverlay.classList.remove('show');
        mortLogSheet.classList.remove('show');
    });

    mortLogOverlay.addEventListener('click', (e) => {
        if (e.target === mortLogOverlay) {
            mortLogOverlay.classList.remove('show');
            mortLogSheet.classList.remove('show');
        }
    });

    // Sampling compute
    document.getElementById('go-compute-btn').addEventListener('click', () => {
        const weight = parseFloat(document.getElementById('go-sample-weight').value);
        const sampleCount = parseInt(document.getElementById('go-sample-count').value);
        if (!weight || weight <= 0) return;
        if (!sampleCount || sampleCount <= 0) return;

        const live = getLiveCount();
        const abw = +(weight / sampleCount).toFixed(2);
        const biomass = +(live * abw).toFixed(1);
        const feedRation = +(biomass * GROWOUT_FEED_PCT).toFixed(1);

        const today = new Date().toISOString().split('T')[0];

        growoutData.samplingHistory.push({
            date: today, abw, biomass, feedRation, sampleSize: sampleCount, totalWeight: weight,
            liveCount: live, mortalityAt: getTotalMortality()
        });

        growoutData.lastSamplingDate = today;
        saveGrowout();

        document.getElementById('go-abw-val').textContent = abw + 'g';
        document.getElementById('go-total-biomass').textContent = biomass + 'g';
        document.getElementById('go-feed-ration').textContent = feedRation + 'g/day';

        document.getElementById('go-results-inline').classList.remove('hidden');
        document.getElementById('go-sample-weight').value = '';

        renderGrowout();
        
        // Update AI recommendation in feeder
        if (window.renderFeederRecommendation) {
            window.renderFeederRecommendation();
        }
    });

    renderGrowout();
});

// Expose functions globally for controls.js
window.growoutData = growoutData;
window.getLiveCount = getLiveCount;
window.getTotalMortality = getTotalMortality;
window.getDaysInCulture = getDaysInCulture;

// ═════════════════════════════════════════
//   FORCE RESET - PASSWORD + OTP
// ═════════════════════════════════════════

let resetOTP = null;
let resetOTPIssuedAt = null;

// Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Simulate sending OTP to email (in real app, this would call backend)
function sendOTPToEmail() {
    resetOTP = generateOTP();
    resetOTPIssuedAt = Date.now();
    console.log('OTP sent to email:', resetOTP); // For demo/debug
    alert(`OTP (demo): ${resetOTP}`); // Show OTP for demo
    return resetOTP;
}

// Verify user's password (check against stored password in localStorage)
function verifyPassword(inputPassword) {
    // Get stored password from signup/login
    let userPassword = 'admin123'; // Default for demo
    try {
        const saved = localStorage.getItem('craycare_user_password');
        if (saved) userPassword = saved;
    } catch (e) {}
    return inputPassword === userPassword;
}

// Show Password Modal
function showResetPasswordModal() {
    document.getElementById('reset-password-overlay').classList.add('show');
    document.getElementById('reset-password-modal').classList.add('show');
    document.getElementById('reset-password-input').value = '';
    document.getElementById('reset-password-error').textContent = '';
    document.getElementById('reset-password-input').focus();
}

// Hide Password Modal
function hideResetPasswordModal() {
    document.getElementById('reset-password-overlay').classList.remove('show');
    document.getElementById('reset-password-modal').classList.remove('show');
}

// Show OTP Modal
function showResetOtpModal() {
    hideResetPasswordModal();
    sendOTPToEmail(); // "Send" OTP
    document.getElementById('reset-otp-overlay').classList.add('show');
    document.getElementById('reset-otp-modal').classList.add('show');
    const otpInputs = document.querySelectorAll('#reset-otp-container .otp-input');
    otpInputs.forEach(input => {
        input.value = '';
    });
    if (otpInputs[0]) otpInputs[0].focus();
    document.getElementById('reset-otp-error').textContent = '';
}

// Hide OTP Modal
function hideResetOtpModal() {
    document.getElementById('reset-otp-overlay').classList.remove('show');
    document.getElementById('reset-otp-modal').classList.remove('show');
}

// Show Selective Reset Modal
function showResetSelectModal() {
    hideResetOtpModal();
    document.getElementById('reset-select-overlay').classList.add('show');
    document.getElementById('reset-select-modal').classList.add('show');
    document.getElementById('reset-select-error').textContent = '';
    // Uncheck all by default
    ['reset-initial-stock', 'reset-mortality', 'reset-stocking-date', 'reset-sampling', 'reset-all'].forEach(id => {
        document.getElementById(id).checked = false;
    });
}

// Hide Selective Reset Modal
function hideResetSelectModal() {
    document.getElementById('reset-select-overlay').classList.remove('show');
    document.getElementById('reset-select-modal').classList.remove('show');
}

// Perform selective reset
function performSelectiveReset() {
    const resetAll = document.getElementById('reset-all').checked;
    const resetInitialStock = document.getElementById('reset-initial-stock').checked;
    const resetMortality = document.getElementById('reset-mortality').checked;
    const resetStockingDate = document.getElementById('reset-stocking-date').checked;
    const resetSampling = document.getElementById('reset-sampling').checked;
    
    if (!resetAll && !resetInitialStock && !resetMortality && !resetStockingDate && !resetSampling) {
        document.getElementById('reset-select-error').textContent = 'Please select at least one option to reset.';
        return;
    }
    
    if (resetAll || resetInitialStock) {
        growoutData.initialStock = 0;
    }
    if (resetAll || resetStockingDate) {
        growoutData.stockingDate = null;
    }
    if (resetAll || resetMortality) {
        growoutData.mortalityHistory = [];
        // Also clear mortality trend
        try {
            localStorage.removeItem('craycare_mortality_trend');
        } catch(e) {}
    }
    if (resetAll || resetSampling) {
        growoutData.samplingHistory = [];
        growoutData.lastSamplingDate = null;
        // Also clear trend data (Growth & Population charts)
        // These are derived from samplingHistory
        try {
            localStorage.removeItem('craycare_growth_trend');
            localStorage.removeItem('craycare_population_trend');
        } catch(e) {}
    }
    
    saveGrowout();
    renderGrowout();
    
    // Build detailed feedback message
    let feedback = '✅ Reset Complete!\n';
    if (resetAll || resetInitialStock) feedback += '• Initial Stock: → 0\n';
    if (resetAll || resetMortality) feedback += '• Mortality Log: Cleared\n';
    if (resetAll || resetStockingDate) feedback += '• Stocking Date: Cleared\n';
    if (resetAll || resetSampling) feedback += '• Sampling Data: Cleared (trends also reset)\n';
    
    // Update AI recommendation if available
    if (window.renderFeederRecommendation) {
        window.renderFeederRecommendation();
    }
    
    hideResetSelectModal();
    alert(feedback);
}

// Initialize Force Reset functionality
function initForceReset() {
    // Force Reset button
    const forceResetBtn = document.getElementById('go-force-reset-btn');
    if (forceResetBtn) {
        forceResetBtn.addEventListener('click', () => {
            showResetPasswordModal();
        });
    }
    
    // Password Modal - Confirm
    const passwordConfirm = document.getElementById('reset-password-confirm');
    if (passwordConfirm) {
        passwordConfirm.addEventListener('click', () => {
            const password = document.getElementById('reset-password-input').value;
            if (!password) {
                document.getElementById('reset-password-error').textContent = 'Please enter your password.';
                return;
            }
            if (!verifyPassword(password)) {
                document.getElementById('reset-password-error').textContent = 'Incorrect password.';
                return;
            }
            showResetOtpModal();
        });
    }
    
    // Password Modal - Cancel
    const passwordCancel = document.getElementById('reset-password-cancel');
    if (passwordCancel) {
        passwordCancel.addEventListener('click', hideResetPasswordModal);
    }
    
    // OTP Modal - Confirm
    const otpConfirm = document.getElementById('reset-otp-confirm');
    if (otpConfirm) {
        otpConfirm.addEventListener('click', () => {
            const otpInputs = document.querySelectorAll('#reset-otp-container .otp-input');
            const enteredOTP = Array.from(otpInputs).map(input => input.value).join('');
            
            if (enteredOTP.length < 6) {
                document.getElementById('reset-otp-error').textContent = 'Please enter the complete 6-digit OTP.';
                return;
            }
            
            // Check if OTP is expired (5 minutes)
            if (resetOTPIssuedAt && (Date.now() - resetOTPIssuedAt) > 300000) {
                document.getElementById('reset-otp-error').textContent = 'OTP has expired. Please request a new one.';
                return;
            }
            
            if (enteredOTP !== resetOTP) {
                document.getElementById('reset-otp-error').textContent = 'Incorrect OTP.';
                return;
            }
            
            showResetSelectModal();
        });
    }
    
    // OTP Modal - Cancel
    const otpCancel = document.getElementById('reset-otp-cancel');
    if (otpCancel) {
        otpCancel.addEventListener('click', hideResetOtpModal);
    }
    
    // OTP Input auto-tab
    const otpContainer = document.getElementById('reset-otp-container');
    if (otpContainer) {
        otpContainer.addEventListener('input', (e) => {
            if (e.target.classList.contains('otp-input')) {
                const val = e.target.value.replace(/[^0-9]/g, '');
                e.target.value = val;
                if (val && e.target.nextElementSibling && e.target.nextElementSibling.classList.contains('otp-input')) {
                    e.target.nextElementSibling.focus();
                }
            }
        });
        
        otpContainer.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('otp-input')) {
                if (e.key === 'Backspace' && !e.target.value && e.target.previousElementSibling) {
                    e.target.previousElementSibling.focus();
                }
            }
        });
    }
    
    // Selective Reset Modal - Confirm
    const selectConfirm = document.getElementById('reset-select-confirm');
    if (selectConfirm) {
        selectConfirm.addEventListener('click', performSelectiveReset);
    }
    
    // Selective Reset Modal - Cancel
    const selectCancel = document.getElementById('reset-select-cancel');
    if (selectCancel) {
        selectCancel.addEventListener('click', hideResetSelectModal);
    }
    
    // "Reset All" checkbox logic
    const resetAllCheckbox = document.getElementById('reset-all');
    if (resetAllCheckbox) {
        resetAllCheckbox.addEventListener('change', () => {
            const checkboxes = ['reset-initial-stock', 'reset-mortality', 'reset-stocking-date', 'reset-sampling'];
            checkboxes.forEach(id => {
                document.getElementById(id).checked = resetAllCheckbox.checked;
            });
        });
    }
}

// Run on load
setTimeout(initForceReset, 500);
