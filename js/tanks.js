const GROWOUT_CYCLE_DAYS = 7;
const GROWOUT_FEED_PCT = 0.03;

let gfFormVisible = false;
let gfEditMode = false;
let gtChartMode = 'abw';

let growoutData = {
    initialStock: 0,
    stockingDate: null,
    mortalityHistory: [],
    lastSamplingDate: null,
    samplingHistory: [],
    initialEdits: []
};

function saveGrowout() {}

function isSetupComplete() {
    return growoutData.initialStock > 0 && growoutData.stockingDate != null;
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

setInterval(() => {
    const days = getDaysInCulture();
    const daysEl = document.getElementById('go-days-culture');
    if (daysEl) daysEl.textContent = days + ' day' + (days !== 1 ? 's' : '');
}, 60000);

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

function getCurrentWeek() {
    const days = getDaysInCulture();
    return Math.floor(days / 7) + 1;
}

function getGrowthStage(abw) {
    if (abw == null) return { name: '--', index: 0, pct: 0 };
    if (abw <= 5)   return { name: 'Juvenile',       index: 0, pct: (abw / 5) * 20 };
    if (abw <= 15)  return { name: 'Early Grow-out', index: 1, pct: 20 + ((abw - 5) / 10) * 20 };
    if (abw <= 30)  return { name: 'Mid Grow-out',   index: 2, pct: 40 + ((abw - 15) / 15) * 20 };
    if (abw < 50)   return { name: 'Late Grow-out',  index: 3, pct: 60 + ((abw - 30) / 20) * 20 };
    return { name: 'Market Size', index: 4, pct: 100 };
}

function renderWarningBanner() {
    const banner = document.getElementById('go-warning-banner');
    const text = document.getElementById('go-warning-text');
    const survival = getSurvivalRate();
    const live = getLiveCount();
    const totalMort = getTotalMortality();

    if (survival < 85 && survival > 0) {
        banner.classList.remove('hidden');
        if (survival < 70) {
            text.textContent = `Critical: Only ${survival.toFixed(1)}% survival (${totalMort} lost). Check water quality immediately.`;
            banner.className = 'growout-warning-banner critical';
        } else {
            text.textContent = `Warning: ${survival.toFixed(1)}% survival — ${totalMort} crayfish lost. Monitor tank conditions.`;
            banner.className = 'growout-warning-banner warning';
        }
    } else {
        banner.classList.add('hidden');
    }
}

function renderGrowout() {
    const isEmpty = !isSetupComplete();
    document.getElementById('go-empty-state').classList.toggle('hidden', !isEmpty);
    document.getElementById('go-donut-stats').classList.toggle('hidden', isEmpty);
    document.getElementById('go-dashboard').classList.toggle('hidden', isEmpty);
    if (isEmpty) return;

    const live = getLiveCount();
    const survival = getSurvivalRate();
    const days = getDaysInCulture();

    document.getElementById('go-survival-pct').textContent = survival.toFixed(1) + '%';
    document.getElementById('go-live-count').textContent = live;
    document.getElementById('go-mortality').textContent = getTotalMortality();
    document.getElementById('go-initial-stock').textContent = growoutData.initialStock;

    const lastEditedRow = document.getElementById('go-last-edited-row');
    const lastEditedEl = document.getElementById('go-last-edited');
    const edits = growoutData.initialEdits;
    if (edits.length > 0) {
        const last = edits[edits.length - 1];
        const d = new Date(last.date + 'T' + last.time);
        const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' +
            d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        lastEditedEl.innerHTML = formatted + (last.reason ? '<br>' + last.reason : '');
        lastEditedEl.style.color = '#000';
        lastEditedRow.classList.remove('hidden');
    } else {
        lastEditedRow.classList.add('hidden');
    }

    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (survival / 100) * circumference;
    const fillEl = document.getElementById('go-donut-fill');
    fillEl.style.strokeDashoffset = offset;
    const donutColor = survival >= 95 ? '#1FA5A5' : survival >= 85 ? '#f59e0b' : '#E63946';
    fillEl.setAttribute('stroke', donutColor);

    const pctEl = document.getElementById('go-survival-pct');
    pctEl.style.color = donutColor;

    document.getElementById('go-days-culture').textContent = days + ' day' + (days !== 1 ? 's' : '');

    const history = growoutData.samplingHistory;
    const samplingStats = document.getElementById('go-sampling-stats');
    if (history.length > 0) {
        const last = history[history.length - 1];
        document.getElementById('go-avg-weight-display').textContent = last.abw + ' g';
        document.getElementById('go-avg-length-display').textContent = last.avgLength ? last.avgLength + ' cm' : '-- cm';
        samplingStats.classList.remove('hidden');
    } else {
        samplingStats.classList.add('hidden');
    }

    const dateEl = document.getElementById('go-stock-date-display');
    if (growoutData.stockingDate) {
        const d = new Date(growoutData.stockingDate + 'T00:00:00');
        dateEl.textContent = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else {
        dateEl.textContent = 'Not set';
    }

    renderWarningBanner();
    renderGrowthTab();
    renderTrendsTab();
    if (window.renderFeederRecommendation) window.renderFeederRecommendation();
}

function renderGrowthTab() {
    const setupDone = isSetupComplete();
    const history = growoutData.samplingHistory;
    const daysLeft = getDaysUntilSampling();
    const currentWeek = getCurrentWeek();
    const today = new Date().toISOString().split('T')[0];
    const sampledToday = growoutData.lastSamplingDate === today;

    const panelsVisible = setupDone;
    document.getElementById('gf-next-sampling').classList.toggle('hidden', !panelsVisible);
    document.getElementById('gf-overview').classList.toggle('hidden', !panelsVisible || history.length === 0);
    document.getElementById('gf-history-panel').classList.toggle('hidden', !panelsVisible || history.length === 0);

    // ── 1. NEXT SAMPLING PANEL ──
    if (panelsVisible) {
        const countdownEl = document.getElementById('gf-ns-countdown');
        const dueDateEl = document.getElementById('gf-ns-due-date');

        if (!growoutData.lastSamplingDate) {
            countdownEl.textContent = `${GROWOUT_CYCLE_DAYS} days remaining`;
            countdownEl.className = 'gf-ns-countdown';
            dueDateEl.textContent = 'Complete first sampling to begin cycle';
        } else if (sampledToday) {
            const last = history[history.length - 1];
            countdownEl.textContent = `${last.abw}g ABW · ${last.avgLength || '--'}cm ABL · ${last.biomass}g biomass`;
            countdownEl.className = 'gf-ns-countdown';
            const nextDate = getNextSamplingDate();
            dueDateEl.textContent = 'Sampling done — next: ' + (nextDate ? nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--');
        } else if (daysLeft <= 0) {
            countdownEl.textContent = 'Sampling Day';
            const nextDate = getNextSamplingDate();
            dueDateEl.textContent = nextDate
                ? 'Due: ' + nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Due now';
        } else {
            countdownEl.textContent = `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`;
            const nextDate = getNextSamplingDate();
            dueDateEl.textContent = nextDate
                ? 'Due on ' + nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Due soon';
        }

        document.getElementById('gf-week-text').textContent = `Week ${currentWeek}`;

        // 7-day step tracker
        renderStepTracker();
    }

    // ── 2. GROWTH OVERVIEW PANEL ──
    if (setupDone && history.length > 0) {
        const first = history[0];
        const last = history[history.length - 1];

        document.getElementById('gf-init-abw').textContent = first.abw + ' g';
        document.getElementById('gf-init-length').textContent = first.avgLength ? first.avgLength + ' cm' : '-- cm';
        document.getElementById('gf-init-date').textContent = formatDate(first.date);

        document.getElementById('gf-latest-abw').textContent = last.abw + ' g';
        document.getElementById('gf-latest-length').textContent = last.avgLength ? last.avgLength + ' cm' : '-- cm';
        document.getElementById('gf-latest-date').textContent = formatDate(last.date);

        const diffAbw = +(last.abw - first.abw).toFixed(2);
        const diffLength = last.avgLength && first.avgLength ? +(last.avgLength - first.avgLength).toFixed(2) : null;

        document.getElementById('gf-growth-abw').textContent = (diffAbw >= 0 ? '+' : '') + diffAbw + ' g';
        document.getElementById('gf-growth-length').textContent = diffLength !== null ? (diffLength >= 0 ? '+' : '') + diffLength + ' cm' : '-- cm';

        // ── Card click → modal ──
        const miniCards = document.querySelectorAll('.gf-overview-cards .gf-mini-card');
        const modalOverlay = document.getElementById('go-modal-overlay');
        const modal = document.getElementById('go-modal');
        const modalIcon = document.getElementById('go-modal-icon');
        const modalTitle = document.getElementById('go-modal-title');
        const modalBadge = document.getElementById('go-modal-badge');
        const modalBody = document.getElementById('go-modal-body');
        const closeBtns = [modalOverlay, document.getElementById('go-modal-close')];

        function showGoModal(iconHtml, title, badge, rows) {
            modalIcon.innerHTML = iconHtml;
            modalTitle.textContent = title;
            modalBadge.textContent = badge;
            modalBody.innerHTML = rows.map(r =>
                '<div class="go-modal-row"><span class="go-modal-row-label">' + r.label + '</span><span class="go-modal-row-val">' + r.val + '</span></div>'
            ).join('');
            modalOverlay.classList.add('show');
            modal.classList.add('show');
        }
        function closeGoModal() {
            modalOverlay.classList.remove('show');
            modal.classList.remove('show');
        }
        closeBtns.forEach(el => el.addEventListener('click', closeGoModal));

        miniCards.forEach((card, i) => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                if (i === 0) {
                    showGoModal(
                        '<i class="bi bi-clock-history"></i>',
                        'Initial Baseline',
                        formatDate(first.date),
                        [
                            { label: 'Avg Body Weight', val: first.abw + ' g' },
                            { label: 'Avg Body Length', val: (first.avgLength || '--') + ' cm' },
                            { label: 'Biomass', val: first.biomass + ' g' },
                            { label: 'Live Count', val: first.liveCount || '--' }
                        ]
                    );
                } else if (i === 1) {
                    showGoModal(
                        '<i class="bi bi-clipboard-data"></i>',
                        'Latest Sampling',
                        formatDate(last.date),
                        [
                            { label: 'Avg Body Weight', val: last.abw + ' g' },
                            { label: 'Avg Body Length', val: (last.avgLength || '--') + ' cm' },
                            { label: 'Biomass', val: last.biomass + ' g' },
                            { label: 'Live Count', val: last.liveCount || getLiveCount() }
                        ]
                    );
                } else if (i === 2) {
                    const abwChange = (diffAbw >= 0 ? '+' : '') + diffAbw + ' g';
                    const lenChange = diffLength !== null ? (diffLength >= 0 ? '+' : '') + diffLength + ' cm' : '-- cm';
                    showGoModal(
                        '<i class="bi bi-arrow-up-circle"></i>',
                        'Growth Progress',
                        'From Initial to Latest',
                        [
                            { label: 'Weight Change', val: abwChange },
                            { label: 'Length Change', val: lenChange },
                            { label: 'Initial ABW', val: first.abw + ' g' },
                            { label: 'Latest ABW', val: last.abw + ' g' },
                            { label: 'Sampling Interval', val: history.length + ' sampling' + (history.length > 1 ? 's' : '') }
                        ]
                    );
                }
            });
        });
    }

    // ── 3. WEEKLY SAMPLING PANEL ──
    const samplingPanel = document.getElementById('gf-sampling-panel');
    const editBtn = document.getElementById('gf-edit-btn');
    const gfWeightInput = document.getElementById('gf-sample-weight');
    const gfCountInput = document.getElementById('gf-sample-count');
    const gfLengthInput = document.getElementById('gf-sample-length');
    const gfComputeBtn = document.getElementById('gf-compute-btn');
    const canSample = daysLeft <= 0;

    if (setupDone) {
        samplingPanel.classList.remove('hidden');

        const isEditing = sampledToday && gfEditMode;
        const inputsEnabled = canSample || isEditing;

        [gfWeightInput, gfCountInput, gfLengthInput].forEach(el => {
            if (el) el.disabled = !inputsEnabled;
        });

        if (sampledToday && !gfEditMode && history.length > 0) {
            const last = history[history.length - 1];
            if (gfWeightInput && gfWeightInput.value === '') gfWeightInput.value = last.totalWeight || '';
            if (gfCountInput && gfCountInput.value === '') gfCountInput.value = last.sampleSize || '';
            if (gfLengthInput && gfLengthInput.value === '') gfLengthInput.value = last.totalLength || '';
        }

        if (editBtn) {
            editBtn.classList.toggle('hidden', !sampledToday || gfEditMode);
        }

        if (gfComputeBtn) {
            const inputsValid = gfWeightInput && gfCountInput && gfLengthInput &&
                parseFloat(gfWeightInput.value) > 0 && parseInt(gfCountInput.value) > 0 && parseFloat(gfLengthInput.value) > 0;
            gfComputeBtn.disabled = !inputsEnabled || !inputsValid;
            gfComputeBtn.innerHTML = gfEditMode
                ? '<i class="bi bi-check2"></i> Update Results'
                : '<i class="bi bi-calculator-fill"></i> Compute Results';
        }
    } else {
        samplingPanel.classList.add('hidden');
    }

    renderGrowthStage();

    // ── 4. SAMPLING HISTORY PANEL ──
    if (history.length > 0) {
        const list = document.getElementById('gf-history-list');
        list.innerHTML = history.map((entry, idx) => {
            const weekLabel = idx === 0 ? 'Initial' : `Week ${idx}`;
            const badgeClass = idx === 0 ? 'init' : idx % 2 === 1 ? 'teal' : 'orange';
            return `
            <div class="gf-history-row">
              <span class="gf-history-badge gf-badge-${badgeClass}">${weekLabel}</span>
              <span class="gf-history-date">${formatDate(entry.date)}</span>
              <div class="gf-history-metrics">
                <span class="gf-history-metric"><strong>${entry.abw}</strong> g</span>
                <span class="gf-history-metric"><strong>${entry.avgLength || '--'}</strong> cm</span>
                <span class="gf-history-metric"><strong>${entry.sampleSize}</strong> samples</span>
              </div>
              <i class="bi bi-chevron-right gf-history-arrow"></i>
            </div>`;
        }).join('');
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '--';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderGrowthStage() {
    const stageEl = document.getElementById('gf-form-growth-stage');
    const nameEl = document.getElementById('gf-stage-name');
    const fillEl = document.getElementById('gf-stage-fill');
    const markers = document.querySelectorAll('#gf-form-growth-stage .gf-stage-markers span');
    const history = growoutData.samplingHistory;

    if (history.length === 0) {
        stageEl.classList.add('hidden');
        return;
    }

    stageEl.classList.remove('hidden');
    const last = history[history.length - 1];
    const stage = getGrowthStage(last.abw);

    nameEl.textContent = stage.name;
    fillEl.style.width = stage.pct + '%';
    nameEl.style.color = last.abw >= 60 ? '#f59e0b' : '#1FA5A5';

    markers.forEach((m, i) => m.classList.toggle('active', i <= stage.index));
}

function syncStepItems() {
    document.querySelectorAll('.gf-step-item').forEach(item => {
        const dot = item.querySelector('.gf-step-dot');
        const line = item.querySelector('.gf-step-line');
        if (!dot) return;
        item.classList.remove('completed', 'done-line-red');
        if (dot.classList.contains('done') || dot.classList.contains('current')) {
            item.classList.add('completed');
        }
        if (dot.classList.contains('red')) {
            item.classList.add('done-line-red');
        }
    });
}

function renderStepTracker() {
    const track = document.getElementById('gf-step-track');
    const dotsContainer = document.getElementById('gf-step-dots');
    const dayLabel = document.getElementById('gf-current-day');
    if (!track || !dotsContainer) return;

    if (!growoutData.stockingDate) {
        track.classList.add('hidden');
        return;
    }

    track.classList.remove('hidden');

    const today = new Date().toISOString().split('T')[0];
    const sampledToday = growoutData.lastSamplingDate === today;
    const daysLeft = getDaysUntilSampling();

    if (sampledToday || daysLeft <= 0) {
        if (dayLabel) dayLabel.textContent = 7;
        const dots = dotsContainer.querySelectorAll('.gf-step-dot');
        dots.forEach((dot, i) => {
            dot.classList.remove('current');
            dot.classList.add('done');
            if (i === 6) {
                dot.classList.remove('done');
                dot.classList.add('red');
            }
        });
        syncStepItems();
        return;
    }

    if (daysLeft <= 0) {
        if (dayLabel) dayLabel.textContent = 7;
        const dots = dotsContainer.querySelectorAll('.gf-step-dot');
        dots.forEach(dot => {
            dot.classList.remove('done', 'current');
            dot.classList.add('red');
        });
        syncStepItems();
        return;
    }

    const daysElapsed = GROWOUT_CYCLE_DAYS - daysLeft;

    let dayWithinWeek;
    if (daysElapsed <= 0) {
        dayWithinWeek = 1;
    } else {
        dayWithinWeek = ((daysElapsed - 1) % 7) + 1;
    }

    if (dayLabel) dayLabel.textContent = dayWithinWeek;

    const dots = dotsContainer.querySelectorAll('.gf-step-dot');
    dots.forEach((dot, i) => {
        const dayNum = i + 1;
        dot.classList.remove('done', 'current', 'red');
        if (dayNum < dayWithinWeek) {
            dot.classList.add('done');
        } else if (dayNum === dayWithinWeek) {
            dot.classList.add('current');
        }
    });
    syncStepItems();
}

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
        insights.push({ type: 'good', icon: 'bi-shield-check', title: 'Excellent Survival', desc: `${survival.toFixed(1)}% survival rate — Health management optimal.` });
    } else if (survival >= 85) {
        insights.push({ type: 'warning', icon: 'bi-shield-exclamation', title: 'Moderate Mortality', desc: `${survival.toFixed(1)}% survival. ${getTotalMortality()} crayfish lost. Check water quality soon.` });
    } else {
        insights.push({ type: 'critical', icon: 'bi-shield-x', title: 'High Mortality', desc: `Only ${survival.toFixed(1)}% survival! ${getTotalMortality()} lost. Urgent water check needed.` });
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
            ${s.avgLength ? `<span class="growout-history-length">${s.avgLength}cm</span>` : ''}
            <span class="growout-history-biomass">${s.biomass}g</span>
          </div>
        </div>`;
    }).join('');
}

function renderTrendsTab() {
    const empty = document.getElementById('gt-empty');
    const content = document.getElementById('gt-content');
    const history = growoutData.samplingHistory;
    const setupDone = isSetupComplete();
    const hasData = setupDone && history.length >= 1;

    if (empty) empty.classList.toggle('hidden', hasData);
    if (content) content.classList.toggle('hidden', !hasData);
    if (!hasData) return;

    const last = history[history.length - 1];
    const first = history[0];
    const stage = getGrowthStage(last.abw);
    const survival = getSurvivalRate();
    const live = getLiveCount();

    // ── 1. SUMMARY CARDS ──
    document.getElementById('gt-stage-val').textContent = stage.name;
    document.getElementById('gt-survival-val').textContent = survival.toFixed(0) + '%';
    document.getElementById('gt-biomass-val').textContent = last.biomass >= 1000 ? (last.biomass / 1000).toFixed(1) + 'kg' : last.biomass + 'g';
    document.getElementById('gt-population-val').textContent = live;

    // ── 2. GROWTH TREND CHART ──
    const growthCanvas = document.getElementById('gt-growth-chart');
    if (growthCanvas) {
        const oldChart = Chart.getChart(growthCanvas);
        if (oldChart) oldChart.destroy();

        const labels = history.map((_, i) => i === 0 ? 'Initial' : 'Week ' + i);
        const isAbw = document.getElementById('gt-toggle-abw').classList.contains('active');
        const data = isAbw ? history.map(e => e.abw) : history.map(e => e.avgLength || null);
        const unit = isAbw ? 'g' : 'cm';
        const color = isAbw ? '#1FA5A5' : '#f59e0b';

        new Chart(growthCanvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: isAbw ? 'ABW (g)' : 'ABL (cm)',
                    data,
                    borderColor: color,
                    backgroundColor: color + '22',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: color,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    borderWidth: 2.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => ctx.parsed.y + ' ' + unit,
                            afterLabel: ctx => {
                                const h = history[ctx.dataIndex];
                                if (!h) return '';
                                const s = getGrowthStage(h.abw);
                                return 'Stage: ' + s.name;
                            }
                        }
                    }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 9, family: 'Poppins' }, color: 'rgba(11,60,73,0.4)' } },
                    y: { beginAtZero: true, grid: { color: 'rgba(11,60,73,0.04)' }, ticks: { font: { size: 9, family: 'Poppins' }, color: 'rgba(11,60,73,0.4)', callback: v => v + unit } }
                }
            }
        });

        const footer = document.getElementById('gt-growth-footer');
        if (history.length >= 2) {
            const firstVal = isAbw ? first.abw : (first.avgLength || 0);
            const lastVal = isAbw ? last.abw : (last.avgLength || 0);
            const gain = (lastVal - firstVal).toFixed(2);
            const weekly = (gain / (history.length - 1)).toFixed(2);
            footer.innerHTML = history.length === 2
                ? '<span>Total gain: <strong>+' + gain + unit + '</strong></span>'
                : '<span>Total gain: <strong>+' + gain + unit + '</strong></span><span>Avg weekly: <strong>+' + weekly + unit + '</strong></span>';
        } else {
            footer.innerHTML = '<span>Keep sampling to track growth</span>';
        }
    }

    // ── 3. BIOMASS TREND CHART ──
    const biomassCanvas = document.getElementById('gt-biomass-chart');
    if (biomassCanvas) {
        const oldChart = Chart.getChart(biomassCanvas);
        if (oldChart) oldChart.destroy();

        const labels = history.map((_, i) => i === 0 ? 'Initial' : 'Week ' + i);
        new Chart(biomassCanvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Biomass (g)',
                    data: history.map(e => e.biomass),
                    borderColor: '#52c283',
                    backgroundColor: 'rgba(82,194,131,0.15)',
                    fill: true, tension: 0.3,
                    pointRadius: 3, pointBackgroundColor: '#52c283',
                    pointBorderColor: '#fff', pointBorderWidth: 2, borderWidth: 2
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.parsed.y + ' g' } } },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 9, family: 'Poppins' }, color: 'rgba(11,60,73,0.4)' } },
                    y: { beginAtZero: true, grid: { color: 'rgba(11,60,73,0.04)' }, ticks: { font: { size: 9, family: 'Poppins' }, color: 'rgba(11,60,73,0.4)' } }
                }
            }
        });
    }

    // ── 3.5 MORTALITY TREND CHART ──
    const mortCanvas = document.getElementById('gt-mortality-chart');
    const mortText = document.getElementById('gt-mortality-text');
    if (mortCanvas) {
        const oldChart = Chart.getChart(mortCanvas);
        if (oldChart) oldChart.destroy();

        const labels = [];
        const mortData = [];
        const dateInfo = [];

        const total = getTotalMortality();
        if (history.length === 1) {
            if (total > 0) {
                labels.push('Week 1');
                mortData.push(total);
                dateInfo.push('Since ' + formatDate(history[0].date));
            }
        } else {
            for (let i = 1; i < history.length; i++) {
                const e = history[i];
                const baseMort = e.mortalityAt || 0;
                const isLast = i === history.length - 1;
                const extra = isLast ? Math.max(0, total - (e.mortalityAt || 0)) : 0;
                labels.push('Week ' + i);
                mortData.push(baseMort + extra);
                dateInfo.push('Up to ' + formatDate(e.date) + (extra > 0 ? ' (incl. ' + extra + ' post-sampling)' : ''));
            }
        }

        if (mortData.length > 0) {
            const barColor = mortData.map(v => v > 0 ? 'rgba(230,57,70,0.7)' : 'rgba(82,194,131,0.35)');
            const borderColor = mortData.map(v => v > 0 ? '#E63946' : '#52c283');
            new Chart(mortCanvas, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Mortality',
                        data: mortData,
                        backgroundColor: barColor,
                        borderColor: borderColor,
                        borderWidth: 1.5,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    layout: { padding: { left: 8, right: 8 } },
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.parsed.y + ' mort' + (ctx.parsed.y === 1 ? '' : 'alities'), afterLabel: ctx => dateInfo[ctx.dataIndex] || '' } } },
                    scales: {
                        x: { grid: { display: false }, ticks: { font: { size: 9, family: 'Poppins' }, color: 'rgba(11,60,73,0.4)', maxRotation: 0 } },
                        y: { beginAtZero: true, grid: { color: 'rgba(11,60,73,0.04)' }, ticks: { font: { size: 9, family: 'Poppins' }, color: 'rgba(11,60,73,0.4)', precision: 0 } }
                    }
                }
            });
        }
    }
    if (mortText) mortText.textContent = getTotalMortality() > 0 ? getTotalMortality() + ' mortality records' : 'No mortality';

    // ── 4. WEEKLY INSIGHTS ──
    const insightsEl = document.getElementById('gt-insights-list');
    if (history.length < 2) {
        insightsEl.innerHTML = '<div class="gt-insight-empty">Complete your second sampling to see insights.</div>';
        return;
    }

    const prev = history[history.length - 2];
    const curr = history[history.length - 1];
    const weekNum = history.length - 1;
    const prevWeek = history.length - 2;
    const list = [];

    const abwCh = curr.abw - prev.abw;
    const abwPct = prev.abw > 0 ? (abwCh / prev.abw * 100) : 0;
    if (abwCh > 0) {
        list.push({ type: 'good', icon: '\u{1F7E2}', text: 'Week ' + weekNum + ' vs Week ' + prevWeek + ': Growth +' + abwPct.toFixed(1) + '% (' + prev.abw + '\u2192' + curr.abw + 'g ABW)' });
    } else if (abwCh < 0) {
        list.push({ type: 'critical', icon: '\u{1F534}', text: 'Week ' + weekNum + ': ABW dropped ' + Math.abs(abwPct).toFixed(1) + '% from Week ' + prevWeek + ' (' + prev.abw + '\u2192' + curr.abw + 'g).' });
    } else {
        list.push({ type: 'info', icon: '\u{1F7E1}', text: 'Week ' + weekNum + ': ABW steady at ' + curr.abw + 'g.' });
    }

    const pMort = prev.mortalityAt != null ? prev.mortalityAt : 0;
    const cMort = curr.mortalityAt != null ? curr.mortalityAt : (prev.liveCount - curr.liveCount);
    const deaths = cMort - pMort;
    if (deaths > 0) {
        list.push({ type: 'critical', icon: '\u{1F534}', text: 'Week ' + weekNum + ': ' + deaths + ' new ' + (deaths === 1 ? 'mortality' : 'mortalities') + ' recorded.' });
    } else {
        list.push({ type: 'good', icon: '\u{1F7E2}', text: 'Week ' + weekNum + ': No mortality. All clear!' });
    }

    const bioCh = curr.biomass - prev.biomass;
    const bioPct = prev.biomass > 0 ? (bioCh / prev.biomass * 100) : 0;
    if (bioCh > 0) {
        list.push({ type: 'good', icon: '\u{1F7E2}', text: 'Week ' + weekNum + ': Biomass +' + bioPct.toFixed(1) + '% (' + prev.biomass + '\u2192' + curr.biomass + 'g).' });
    } else if (bioCh < 0) {
        list.push({ type: 'warning', icon: '\u{1F7E1}', text: 'Week ' + weekNum + ': Biomass \u2212' + Math.abs(bioPct).toFixed(1) + '% (' + prev.biomass + '\u2192' + curr.biomass + 'g).' });
    } else {
        list.push({ type: 'info', icon: '\u{1F7E1}', text: 'Week ' + weekNum + ': Biomass unchanged at ' + curr.biomass + 'g.' });
    }

    insightsEl.innerHTML = list.map(i => '<div class="gt-insight ' + i.type + '"><span class="gt-insight-icon">' + i.icon + '</span><span class="gt-insight-text">' + i.text + '</span></div>').join('');
}

document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('.growout-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.growout-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.growout-tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    // Quick Actions → navigate to tank sub-tabs
    document.querySelectorAll('.quick-action-card[data-go]').forEach(card => {
        card.addEventListener('click', () => {
            const targetTab = card.dataset.go;
            const tabMap = { inventory: 'tab-inventory', sampling: 'tab-growth', trends: 'tab-trends' };
            const tabId = tabMap[targetTab];
            if (!tabId) return;

            window.showNavSection('tanks');

            document.querySelectorAll('.growout-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.growout-tab-content').forEach(c => c.classList.remove('active'));

            const btn = document.querySelector(`.growout-tab-btn[data-tab="${tabId}"]`);
            if (btn) btn.classList.add('active');
            document.getElementById(tabId)?.classList.add('active');
        });
    });

    const fullAnalyticsBtn = document.getElementById('go-full-analytics-btn');
    if (fullAnalyticsBtn) {
        fullAnalyticsBtn.addEventListener('click', () => window.showNavSection('analytics'));
    }

    // Setup Modal
    const setupOverlay = document.getElementById('setup-overlay');
    const setupModal = document.getElementById('setup-modal');
    const setupCountInput = document.getElementById('setup-sample-count');
    const setupWeightInput = document.getElementById('setup-sample-weight');
    const setupLengthInput = document.getElementById('setup-total-length');
    const setupAvgWeightEl = document.getElementById('setup-avg-weight');
    const setupAvgLengthEl = document.getElementById('setup-avg-length');

    setupModal.querySelectorAll('input[type="number"]').forEach(inp => {
        inp.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
        });
        inp.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
        inp.addEventListener('input', () => {
            const min = parseFloat(inp.getAttribute('min')) || 0;
            if (inp.value !== '' && parseFloat(inp.value) < min) inp.value = min;
        });
    });

    function updateSetupAverages() {
        const count = parseFloat(setupCountInput.value);
        const weight = parseFloat(setupWeightInput.value);
        const length = parseFloat(setupLengthInput.value);
        if (count > 0 && weight > 0) {
            setupAvgWeightEl.textContent = (weight / count).toFixed(2) + ' g';
            setupAvgWeightEl.classList.remove('empty');
        } else {
            setupAvgWeightEl.textContent = '-- g';
            setupAvgWeightEl.classList.add('empty');
        }
        if (count > 0 && length > 0) {
            setupAvgLengthEl.textContent = (length / count).toFixed(2) + ' cm';
            setupAvgLengthEl.classList.remove('empty');
        } else {
            setupAvgLengthEl.textContent = '-- cm';
            setupAvgLengthEl.classList.add('empty');
        }
    }

    if (setupCountInput) setupCountInput.addEventListener('input', updateSetupAverages);
    if (setupWeightInput) setupWeightInput.addEventListener('input', updateSetupAverages);
    if (setupLengthInput) setupLengthInput.addEventListener('input', updateSetupAverages);

    function openSetupModal() {
        if (!growoutData.initialStock) {
            document.getElementById('setup-stock-input').value = 50;
            document.getElementById('setup-sample-count').value = 5;
            document.getElementById('setup-sample-weight').value = 30;
            document.getElementById('setup-total-length').value = 25;
            document.getElementById('setup-date-input').value = new Date().toISOString().split('T')[0];
            updateSetupAverages();
        } else {
            document.getElementById('setup-stock-input').value = growoutData.initialStock;
            document.getElementById('setup-sample-count').value = '';
            document.getElementById('setup-sample-weight').value = '';
            document.getElementById('setup-total-length').value = '';
            document.getElementById('setup-date-input').value = new Date().toISOString().split('T')[0];
            setupAvgWeightEl.textContent = '-- g';
            setupAvgWeightEl.classList.add('empty');
            setupAvgLengthEl.textContent = '-- cm';
            setupAvgLengthEl.classList.add('empty');
        }
        setupOverlay.classList.add('show');
        setupModal.classList.add('show');
        setTimeout(() => document.getElementById('setup-stock-input').focus(), 100);
    }

    document.getElementById('go-setup-btn').addEventListener('click', openSetupModal);

    document.getElementById('setup-confirm').addEventListener('click', () => {
        const stock = parseInt(document.getElementById('setup-stock-input').value);
        const date = document.getElementById('setup-date-input').value;
        if (!stock || stock <= 0 || !date) return;

        growoutData.initialStock = stock;
        growoutData.stockingDate = date;

        const sampleCount = parseInt(setupCountInput.value);
        const totalWeight = parseFloat(setupWeightInput.value);
        const totalLength = parseFloat(setupLengthInput.value);

        if (sampleCount > 0 && totalWeight > 0) {
            const abw = +(totalWeight / sampleCount).toFixed(2);
            const biomass = +(stock * abw).toFixed(1);
            const feedRation = +(biomass * GROWOUT_FEED_PCT).toFixed(1);
            const avgLength = totalLength > 0 && sampleCount > 0 ? +(totalLength / sampleCount).toFixed(2) : null;
            growoutData.samplingHistory.push({
                date: date,
                abw,
                biomass,
                feedRation,
                sampleSize: sampleCount,
                totalWeight,
                totalLength: totalLength > 0 ? totalLength : null,
                avgLength,
                liveCount: stock,
                mortalityAt: 0
            });
            // Offset lastSamplingDate so the first compute is due immediately
            const offset = new Date(date);
            offset.setDate(offset.getDate() - GROWOUT_CYCLE_DAYS);
            growoutData.lastSamplingDate = offset.toISOString().split('T')[0];
        }

        saveGrowout();
        // Pre-fill sampling panel with setup values
        document.getElementById('gf-sample-count').value = sampleCount || '';
        document.getElementById('gf-sample-weight').value = '';
        document.getElementById('gf-sample-length').value = '';
        setupOverlay.classList.remove('show');
        setupModal.classList.remove('show');
        renderGrowout();
    });

    document.getElementById('setup-cancel').addEventListener('click', () => {
        setupOverlay.classList.remove('show');
        setupModal.classList.remove('show');
    });

    setupOverlay.addEventListener('click', (e) => {
        if (e.target === setupOverlay) {
            setupOverlay.classList.remove('show');
            setupModal.classList.remove('show');
        }
    });

    // Edit initial stock modal
    const editInitialOverlay = document.getElementById('edit-initial-overlay');
    const editInitialModal = document.getElementById('edit-initial-modal');
    const editWeightInput = document.getElementById('edit-total-weight');
    const editLengthInput = document.getElementById('edit-total-length');
    const editCountInput = document.getElementById('edit-sample-count');
    const editAvgWeightEl = document.getElementById('edit-avg-weight');
    const editAvgLengthEl = document.getElementById('edit-avg-length');

    editInitialModal.querySelectorAll('input[type="number"]').forEach(inp => {
        inp.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
        });
        inp.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
        inp.addEventListener('input', () => {
            const min = parseFloat(inp.getAttribute('min')) || 0;
            if (inp.value !== '' && parseFloat(inp.value) < min) inp.value = min;
        });
    });

    function updateEditAverages() {
        const count = parseFloat(editCountInput.value);
        const weight = parseFloat(editWeightInput.value);
        const length = parseFloat(editLengthInput.value);
        if (count > 0 && weight > 0) {
            editAvgWeightEl.textContent = (weight / count).toFixed(2) + ' g';
            editAvgWeightEl.classList.remove('empty');
        } else {
            editAvgWeightEl.textContent = '-- g';
            editAvgWeightEl.classList.add('empty');
        }
        if (count > 0 && length > 0) {
            editAvgLengthEl.textContent = (length / count).toFixed(2) + ' cm';
            editAvgLengthEl.classList.remove('empty');
        } else {
            editAvgLengthEl.textContent = '-- cm';
            editAvgLengthEl.classList.add('empty');
        }
    }

    function getFirstSampling() {
        return growoutData.samplingHistory.length > 0 ? growoutData.samplingHistory[0] : null;
    }

    document.getElementById('go-edit-initial-btn').addEventListener('click', () => {
        if (!isSetupComplete()) return;
        document.getElementById('edit-initial-input').value = growoutData.initialStock;
        document.getElementById('edit-initial-reason').value = '';
        const first = getFirstSampling();
        if (editCountInput) editCountInput.value = first && first.sampleSize ? first.sampleSize : '';
        if (editWeightInput) editWeightInput.value = first && first.totalWeight ? first.totalWeight : '';
        if (editLengthInput) editLengthInput.value = first && first.totalLength ? first.totalLength : '';
        updateEditAverages();
        editInitialOverlay.classList.add('show');
        editInitialModal.classList.add('show');
        setTimeout(() => document.getElementById('edit-initial-input').focus(), 100);
    });

    if (editCountInput) editCountInput.addEventListener('input', updateEditAverages);
    if (editWeightInput) editWeightInput.addEventListener('input', updateEditAverages);
    if (editLengthInput) editLengthInput.addEventListener('input', updateEditAverages);

    document.getElementById('edit-initial-save').addEventListener('click', () => {
        const newStock = parseInt(document.getElementById('edit-initial-input').value);
        if (!newStock || newStock <= 0) return;
        const reason = document.getElementById('edit-initial-reason').value.trim();
        const now = new Date();
        growoutData.initialEdits.push({
            from: growoutData.initialStock,
            to: newStock,
            date: now.toISOString().split('T')[0],
            time: now.toTimeString().split(' ')[0],
            reason: reason || ''
        });
        growoutData.initialStock = newStock;

        const first = getFirstSampling();
        if (first) {
            const newSampleCount = parseInt(editCountInput.value);
            const newWeight = parseFloat(editWeightInput.value);
            const newLength = parseFloat(editLengthInput.value);
            if (newSampleCount > 0) {
                first.sampleSize = newSampleCount;
            }
            if (newWeight > 0 && first.sampleSize > 0) {
                first.totalWeight = newWeight;
                first.abw = +(newWeight / first.sampleSize).toFixed(2);
                first.biomass = +(newStock * first.abw).toFixed(1);
                first.feedRation = +(first.biomass * GROWOUT_FEED_PCT).toFixed(1);
            }
            if (newLength > 0 && first.sampleSize > 0) {
                first.totalLength = newLength;
                first.avgLength = +(newLength / first.sampleSize).toFixed(2);
            }
        }

        saveGrowout();
        editInitialOverlay.classList.remove('show');
        editInitialModal.classList.remove('show');
        renderGrowout();
    });

    document.getElementById('edit-initial-cancel').addEventListener('click', () => {
        editInitialOverlay.classList.remove('show');
        editInitialModal.classList.remove('show');
    });

    editInitialOverlay.addEventListener('click', (e) => {
        if (e.target === editInitialOverlay) {
            editInitialOverlay.classList.remove('show');
            editInitialModal.classList.remove('show');
        }
    });

    // Stocking date click to edit
    const stockDateDisplay = document.getElementById('go-stock-date-display');
    if (stockDateDisplay) {
        stockDateDisplay.addEventListener('click', () => {
            if (!isSetupComplete()) return;
            const input = document.createElement('input');
            input.type = 'date';
            input.value = growoutData.stockingDate || new Date().toISOString().split('T')[0];
            input.style.cssText = 'border:1px solid rgba(31,165,165,0.3);border-radius:8px;padding:4px 8px;font-size:11px;font-family:Poppins,sans-serif;width:auto';
            stockDateDisplay.textContent = '';
            stockDateDisplay.appendChild(input);
            input.focus();
            input.addEventListener('blur', () => {
                if (input.value) {
                    growoutData.stockingDate = input.value;
                    saveGrowout();
                    renderGrowout();
                }
            });
            input.addEventListener('change', () => {
                if (input.value) {
                    growoutData.stockingDate = input.value;
                    saveGrowout();
                    renderGrowout();
                }
            });
        });
        stockDateDisplay.style.cursor = 'pointer';
    }

    // Mortality modal
    const goMortOverlay = document.getElementById('mortality-overlay');
    const goMortModal = document.getElementById('mortality-modal');
    let goMortVal = 1;

    function updateMortInput(val) {
        const live = getLiveCount();
        goMortVal = Math.max(1, Math.min(Math.max(1, val), live));
        document.getElementById('mort-number-input').value = goMortVal;
        document.getElementById('mort-max-hint').textContent = live;
        document.getElementById('mort-live-hint').textContent = live;
    }

    document.getElementById('go-action-mortality').addEventListener('click', () => {
        if (getLiveCount() <= 0) return;
        updateMortInput(1);
        document.getElementById('mort-notes-input').value = '';
        goMortOverlay.classList.add('show');
        goMortModal.classList.add('show');
    });

    document.getElementById('mort-inc').addEventListener('click', () => updateMortInput(goMortVal + 1));
    document.getElementById('mort-dec').addEventListener('click', () => updateMortInput(goMortVal - 1));
    document.getElementById('mort-number-input').addEventListener('input', (e) => updateMortInput(parseInt(e.target.value) || 1));

    document.getElementById('mort-confirm').addEventListener('click', () => {
        const today = new Date().toISOString().split('T')[0];
        const notes = document.getElementById('mort-notes-input').value.trim();
        growoutData.mortalityHistory.push({ date: today, count: goMortVal, notes: notes || '' });
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
    const mortLogSheet = document.getElementById('mort-log-sheet');

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
                    <div class="mort-log-item-right">
                        <span class="mort-log-item-count">−${entry.count}</span>
                        ${entry.notes ? `<span class="mort-log-item-notes">${entry.notes}</span>` : ''}
                    </div>
                </div>`;
            }).join('');
        }
        mortLogOverlay.classList.add('show');
        mortLogSheet.classList.add('show');
    }

    document.getElementById('go-action-logs').addEventListener('click', openMortLogSheet);

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

    // -- Growth tab number input controls --
    document.querySelectorAll('.gf-input[type="number"]').forEach(inp => {
        inp.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
        });
        inp.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
        inp.addEventListener('input', () => {
            const min = parseFloat(inp.getAttribute('min')) || 0;
            if (inp.value !== '' && parseFloat(inp.value) < min) inp.value = min;
        });
    });

    // -- Growth tab form validation --
    const gfWeightInput = document.getElementById('gf-sample-weight');
    const gfCountInput = document.getElementById('gf-sample-count');
    const gfLengthInput = document.getElementById('gf-sample-length');
    const gfComputeBtn = document.getElementById('gf-compute-btn');

    function checkGfSamplingInputs() {
        const today = new Date().toISOString().split('T')[0];
        if (getDaysUntilSampling() > 0 && growoutData.lastSamplingDate !== today) return;
        const w = parseFloat(gfWeightInput.value);
        const c = parseInt(gfCountInput.value);
        const l = parseFloat(gfLengthInput.value);
        gfComputeBtn.disabled = !(w > 0 && c > 0 && l > 0);
    }

    if (gfWeightInput && gfCountInput && gfLengthInput && gfComputeBtn) {
        gfWeightInput.addEventListener('input', checkGfSamplingInputs);
        gfCountInput.addEventListener('input', checkGfSamplingInputs);
        gfLengthInput.addEventListener('input', checkGfSamplingInputs);

        gfComputeBtn.addEventListener('click', () => {
            const today = new Date().toISOString().split('T')[0];
            if (getDaysUntilSampling() > 0 && growoutData.lastSamplingDate !== today) return;
            const weight = parseFloat(gfWeightInput.value);
            const sampleCount = parseInt(gfCountInput.value);
            const totalLength = parseFloat(gfLengthInput.value);
            if (!weight || weight <= 0 || !sampleCount || sampleCount <= 0 || !totalLength || totalLength <= 0) return;

            const live = getLiveCount();
            const abw = +(weight / sampleCount).toFixed(2);
            const avgLength = +(totalLength / sampleCount).toFixed(2);
            const biomass = +(live * abw).toFixed(1);
            const feedRation = +(biomass * GROWOUT_FEED_PCT).toFixed(1);

            const entry = {
                date: today, abw, biomass, feedRation, sampleSize: sampleCount,
                totalWeight: weight, totalLength, avgLength,
                liveCount: live, mortalityAt: getTotalMortality()
            };

            if (growoutData.lastSamplingDate === today && growoutData.samplingHistory.length > 0) {
                growoutData.samplingHistory[growoutData.samplingHistory.length - 1] = entry;
            } else {
                growoutData.samplingHistory.push(entry);
            }

            growoutData.lastSamplingDate = today;
            gfEditMode = false;
            saveGrowout();
            gfFormVisible = false;
            renderGrowout();

            if (window.renderFeederRecommendation) {
                window.renderFeederRecommendation();
            }
            document.dispatchEvent(new Event('growoutUpdated'));

            gfComputeBtn.disabled = true;
        });

        document.getElementById('gf-edit-btn').addEventListener('click', () => {
            gfEditMode = true;
            renderGrowthTab();
            setTimeout(() => gfWeightInput.focus(), 100);
        });
    }

    // Growth stage reference modal
    const gfRefOverlay = document.getElementById('gf-ref-overlay');
    const gfRefModal = document.getElementById('gf-ref-modal');
    document.getElementById('gf-stage-info-btn').addEventListener('click', () => {
        gfRefOverlay.classList.add('show');
        gfRefModal.classList.add('show');
    });
    function closeGfRef() {
        gfRefOverlay.classList.remove('show');
        gfRefModal.classList.remove('show');
    }
    document.getElementById('gf-ref-close').addEventListener('click', closeGfRef);
    gfRefOverlay.addEventListener('click', (e) => {
        if (e.target === gfRefOverlay) closeGfRef();
    });

    // Sampling history modal
    const gfHistOverlay = document.getElementById('gf-hist-overlay');
    const gfHistModal = document.getElementById('gf-hist-modal');
    const gfHistTbody = document.getElementById('gf-hist-tbody');
    document.getElementById('gf-view-all-link').addEventListener('click', () => {
        const history = growoutData.samplingHistory;
        if (history.length === 0) return;
        gfHistTbody.innerHTML = history.map((entry, idx) => {
            const weekLabel = idx === 0 ? 'Initial' : `Week ${idx}`;
            const weekClass = idx === 0 ? 'hist-week-init' : 'hist-week';
            const mort = entry.mortalityAt != null ? entry.mortalityAt : (idx > 0 ? history[idx - 1].liveCount - entry.liveCount : '--');
            return `<tr>
                <td><span class="${weekClass}">${weekLabel}</span></td>
                <td>${formatDate(entry.date)}</td>
                <td><strong>${entry.abw}</strong> g</td>
                <td>${entry.avgLength || '--'} cm</td>
                <td>${entry.sampleSize}</td>
                <td>${mort}</td>
            </tr>`;
        }).join('');
        gfHistOverlay.classList.add('show');
        gfHistModal.classList.add('show');
    });
    function closeGfHist() {
        gfHistOverlay.classList.remove('show');
        gfHistModal.classList.remove('show');
    }
    document.getElementById('gf-hist-close').addEventListener('click', closeGfHist);
    gfHistOverlay.addEventListener('click', (e) => {
        if (e.target === gfHistOverlay) closeGfHist();
    });

    // Trends tab ABW/ABL toggle
    document.querySelectorAll('.gt-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.gt-toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTrendsTab();
        });
    });

    document.getElementById('gt-biomass-info').addEventListener('click', () => {
        document.getElementById('gt-biomass-popover').classList.toggle('hidden');
    });

    renderGrowout();
});

window.growoutData = growoutData;
window.getLiveCount = getLiveCount;
window.getTotalMortality = getTotalMortality;
window.getDaysInCulture = getDaysInCulture;
window.getDaysUntilSampling = getDaysUntilSampling;
window.getNextSamplingDate = getNextSamplingDate;
