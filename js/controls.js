// CONTROLS — Hardware Control Center

// ─── FEEDER ACTIVITY LOG ─────────────────────────────────────
const feederLogs = [
    { action: 'Dispensed 44.1g feed (Scheduled)', type: 'auto', time: '8:00 AM', date: 'Today' },
    { action: 'Manual feed triggered', type: 'manual', time: '7:45 AM', date: 'Today' },
    { action: 'Dispensed 44.1g feed (Scheduled)', type: 'auto', time: '6:00 AM', date: 'Today' }
];

function getTs() {
    return {
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        date: 'Today'
    };
}

function addFeederLog(action, type) {
    const { time, date } = getTs();
    feederLogs.unshift({ action, type, time, date });
    if (feederLogs.length > 50) feederLogs.pop();
    renderFeederLog();
    updateDashboardFeeding();
}

// Update Dashboard feeding card
function updateDashboardFeeding() {
    const lastFedEl = document.getElementById('dash-last-fed');
    const nextFeedEl = document.getElementById('dash-next-feed');
    if (!lastFedEl || !nextFeedEl) return;
    
    // Get last feed time
    const feedLogs = feederLogs.filter(l => l.type === 'auto' || l.type === 'manual');
    if (feedLogs.length > 0) {
        lastFedEl.textContent = feedLogs[0].time;
    } else {
        lastFedEl.textContent = '--';
    }
    
    // Calculate next feeding time (check schedules)
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    let nextTime = null;
    
    document.querySelectorAll('.schedule-item').forEach(item => {
        const timeStr = item.querySelector('.schedule-time')?.textContent;
        if (!timeStr) return;
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return;
        let h = parseInt(match[1]);
        const m = parseInt(match[2]);
        const ampm = match[3].toUpperCase();
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        const minutes = h * 60 + m;
        
        if (minutes > currentMinutes && (!nextTime || minutes < nextTime)) {
            nextTime = minutes;
        }
    });
    
    if (nextTime) {
        const h = Math.floor(nextTime / 60);
        const m = nextTime % 60;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        nextFeedEl.textContent = `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
    } else {
        nextFeedEl.textContent = 'Tomorrow';
    }
}

// Initial dashboard update
setTimeout(updateDashboardFeeding, 1000);

function renderFeederLog() {
    const list = document.getElementById('feeder-log-list');
    if (!list) return;
    // Only show 'auto' and 'manual' feed logs
    const feedLogs = feederLogs.filter(l => l.type === 'auto' || l.type === 'manual');
    if (feedLogs.length === 0) {
        list.innerHTML = `<p class="hw-detail-log-empty">No activity yet.</p>`;
        return;
    }
    const dotClass = { auto: 'auto', manual: 'on' };
    list.innerHTML = feedLogs.map(l => `
        <div class="hw-detail-log-item">
          <div class="hw-detail-log-dot ${dotClass[l.type] || 'auto'}"></div>
          <div class="hw-detail-log-info">
            <span class="hw-detail-log-action">${l.action}</span>
            <span class="hw-detail-log-time">${l.date} &middot; ${l.time}</span>
          </div>
        </div>`).join('');
}

// ─── FEEDER MODE TOGGLE ───────────────────────────────────────
const feederToggle = document.getElementById('feeder-toggle');
const feederModeLabel = document.getElementById('feeder-mode-label');
const scheduleList = document.querySelector('.schedule-list');

function updateFeederMode() {
    const isAuto = feederToggle.checked;
    feederModeLabel.textContent = isAuto ? 'Auto' : 'Manual';
    scheduleList.style.display = isAuto ? 'block' : 'none';
}

feederToggle.addEventListener('change', () => {
    const isAuto = feederToggle.checked;
    updateFeederMode();
});
updateFeederMode();

// Feed Now Button
document.getElementById('feed-now-btn').addEventListener('click', () => {
    const btn = document.getElementById('feed-now-btn');
    btn.innerHTML = '<i class="bi bi-check-lg"></i> Dispensing...';
    btn.style.opacity = '0.7';
    addFeederLog('Manual Feed — Feed Now triggered', 'manual');
    setTimeout(() => {
        btn.innerHTML = '<i class="bi bi-play-fill"></i> Feed Now';
        btn.style.opacity = '1';
    }, 2000);
});

// Schedule Management
function formatTime(val) {
    const [h, m] = val.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
}

function parseTimeTo24h(timeStr) {
    const [timePart, ampm] = timeStr.split(' ');
    const [h, m] = timePart.split(':');
    let hour = parseInt(h);
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    return { hour: hour, minute: parseInt(m), isPM: ampm === 'PM', display: `${String(hour).padStart(2,'0')}:${m}` };
}

function getScheduleStatus(s) {
    const now = new Date();
    const schedMin = s.hour * 60 + s.minute;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    
    if (schedMin < nowMin) return 'completed';
    if (schedMin === nowMin) return 'pending';
    return 'upcoming';
}

function renderSchedules() {
    const morningContainer = document.getElementById('morning-items');
    const afternoonContainer = document.getElementById('afternoon-items');
    
    const morning = schedules.filter(s => !s.isPM && s.hour < 12);
    const afternoon = schedules.filter(s => s.isPM || s.hour === 12);
    
    const morningGrams = morning.reduce((sum, s) => sum + s.grams, 0);
    const afternoonGrams = afternoon.reduce((sum, s) => sum + s.grams, 0);
    const totalGrams = morningGrams + afternoonGrams;
    
    document.getElementById('schedule-grand-total').innerHTML = `<i class="bi bi-egg-fried"></i> ${totalGrams}g Total`;
    document.getElementById('morning-total').textContent = morningGrams + 'g';
    document.getElementById('afternoon-total').textContent = afternoonGrams + 'g';

    const morningHTML = morning.map(s => {
        const status = getScheduleStatus(s);
        const statusIcons = { completed: 'bi-check-circle-fill', pending: 'bi-hourglass-split', upcoming: 'bi-clock' };
        return `
        <div class="schedule-item ${status}">
            <i class="bi ${statusIcons[status]}"></i>
            <span class="schedule-time-text">${s.display}</span>
            <span class="schedule-status ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
            <button class="schedule-edit" data-time="${s.time}" data-period="morning"><i class="bi bi-pencil-fill"></i></button>
            <button class="schedule-remove" data-time="${s.time}" data-period="morning"><i class="bi bi-trash-fill"></i></button>
        </div>`;
    }).join('');

    const afternoonHTML = afternoon.map(s => {
        const status = getScheduleStatus(s);
        const statusIcons = { completed: 'bi-check-circle-fill', pending: 'bi-hourglass-split', upcoming: 'bi-clock' };
        return `
        <div class="schedule-item ${status}">
            <i class="bi ${statusIcons[status]}"></i>
            <span class="schedule-time-text">${s.display}</span>
            <span class="schedule-status ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
            <button class="schedule-edit" data-time="${s.time}" data-period="afternoon"><i class="bi bi-pencil-fill"></i></button>
            <button class="schedule-remove" data-time="${s.time}" data-period="afternoon"><i class="bi bi-trash-fill"></i></button>
        </div>`;
    }).join('');

    morningContainer.innerHTML = morningHTML;
    afternoonContainer.innerHTML = afternoonHTML;

    morningContainer.querySelectorAll('.schedule-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openScheduleEdit(btn.dataset.time, 'morning');
        });
    });
    
    morningContainer.querySelectorAll('.schedule-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            schedules = schedules.filter(t => t.time !== btn.dataset.time);
            saveSchedules();
            renderSchedules();
        });
    });
    
    afternoonContainer.querySelectorAll('.schedule-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openScheduleEdit(btn.dataset.time, 'afternoon');
        });
    });

    afternoonContainer.querySelectorAll('.schedule-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            schedules = schedules.filter(t => t.time !== btn.dataset.time);
            saveSchedules();
            renderSchedules();
        });
    });
}

function openScheduleEdit(timeStr, period) {
    const sched = schedules.find(s => s.time === timeStr);
    if (!sched) return;

    const timeInput = document.getElementById('schedule-time-input');
    const gramsInput = document.getElementById('schedule-grams-input');
    const addBtn = document.getElementById('schedule-add-btn');

    const [timePart, ampm] = timeStr.split(' ');
    const [h, m] = timePart.split(':');
    let hour = parseInt(h);
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;

    timeInput.value = `${String(hour).padStart(2,'0')}:${m}`;
    gramsInput.value = sched.grams;
    editMode = true;
    editTimeStr = timeStr;
    addBtn.textContent = 'Update';
}

let editMode = false;
let editTimeStr = null;

function addHandler() {
    if (editMode) {
        updateSchedule();
        return;
    }
    const timeInput = document.getElementById('schedule-time-input');
    const gramsInput = document.getElementById('schedule-grams-input');
    if (!timeInput.value) return;

    const formatted = formatTime(timeInput.value);
    const parsed = parseTimeTo24h(formatted);
    const grams = parseInt(gramsInput.value) || 10;

    if (!schedules.find(s => s.time === formatted)) {
        schedules.push({
            time: formatted,
            display: formatted,
            hour: parsed.hour,
            minute: parsed.minute,
            isPM: parsed.isPM,
            grams: grams
        });
        schedules.sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute));
        saveSchedules();
        renderSchedules();
    }
    timeInput.value = '';
    gramsInput.value = '';
}

function updateSchedule() {
    const timeInput = document.getElementById('schedule-time-input');
    const gramsInput = document.getElementById('schedule-grams-input');
    const addBtn = document.getElementById('schedule-add-btn');
    if (!timeInput.value) return;

    const newFormatted = formatTime(timeInput.value);
    const newParsed = parseTimeTo24h(newFormatted);
    const newGrams = parseInt(gramsInput.value) || 10;

    schedules = schedules.filter(t => t.time !== editTimeStr);
    schedules.push({
        time: newFormatted,
        display: newFormatted,
        hour: newParsed.hour,
        minute: newParsed.minute,
        isPM: newParsed.isPM,
        grams: newGrams
    });
    schedules.sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute));
    saveSchedules();

    editMode = false;
    editTimeStr = null;
    addBtn.textContent = 'Add';
    timeInput.value = '';
    gramsInput.value = '';
    renderSchedules();
}

let schedules = [
    { time: '6:00 AM', display: '6:00 AM', hour: 6, minute: 0, isPM: false, grams: 15 },
    { time: '8:00 AM', display: '8:00 AM', hour: 8, minute: 0, isPM: false, grams: 22 },
    { time: '5:00 PM', display: '5:00 PM', hour: 17, minute: 0, isPM: true, grams: 22 }
];

function loadSchedules() {
    const saved = localStorage.getItem('crayfish_feeder_schedules');
    if (saved) {
        try {
            schedules = JSON.parse(saved);
        } catch (e) {}
    }
}

function saveSchedules() {
    localStorage.setItem('crayfish_feeder_schedules', JSON.stringify(schedules));
}

loadSchedules();
renderSchedules();

const addBtn = document.getElementById('schedule-add-btn');
addBtn.addEventListener('click', addHandler);

// Track last triggered time to prevent duplicates within the same minute
let lastTriggeredTime = null;
let lastCheckedMinute = null;
let appReady = false; // Flag to prevent triggering on page load

// Helper to get current hour and minute as integers (24-hour format)
function getCurrentTime() {
    const now = new Date();
    return { hour: now.getHours(), minute: now.getMinutes() };
}

// Helper to parse schedule time to 24-hour format
function parseScheduleTime(schedule) {
    let hour = schedule.hour;
    if (schedule.isPM && hour !== 12) hour += 12;
    if (!schedule.isPM && hour === 12) hour = 0;
    return { hour, minute: schedule.minute };
}

// Start checking after 2 seconds (allow app to fully load)
setTimeout(() => {
    appReady = true;
}, 2000);

// Simulate auto feed when schedule time matches current time
setInterval(() => {
    if (!feederToggle.checked) return;
    if (!appReady) return;
    
    const now = getCurrentTime();
    const currentMinute = now.minute;
    
    // Reset trigger tracker at the start of each new minute
    if (lastCheckedMinute !== currentMinute) {
        lastCheckedMinute = currentMinute;
        lastTriggeredTime = null;
    }
    
    // Compare numerically instead of string
    const match = schedules.find(s => {
        const sched = parseScheduleTime(s);
        return sched.hour === now.hour && sched.minute === now.minute;
    });
    
    if (match && lastTriggeredTime !== currentMinute) {
        lastTriggeredTime = currentMinute;
        const timeDisplay = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        addFeederLog(`Auto Feed — Scheduled at ${timeDisplay} (${match.grams}g)`, 'auto');
    }
}, 1000);

// Refresh statuses every minute
setInterval(() => {
    renderSchedules();
}, 60000);

// ─── HARDWARE ACTIVITY LOGS ───────────────────────────────────
const hwActivityLogs = {
    aerator1: [
        { mode: 'auto', action: 'Set to AUTO', time: '8:05 AM', date: 'Today' },
        { mode: 'on',   action: 'Switched ON',  time: '7:50 AM', date: 'Today' },
        { mode: 'off',  action: 'Switched OFF', time: '7:30 AM', date: 'Today' },
        { mode: 'auto', action: 'Set to AUTO', time: '6:00 AM', date: 'Today' },
    ],
    aerator2: [
        { mode: 'auto', action: 'Set to AUTO', time: '8:10 AM', date: 'Today' },
        { mode: 'on',   action: 'Switched ON',  time: '7:45 AM', date: 'Today' },
        { mode: 'off',  action: 'Switched OFF', time: '7:20 AM', date: 'Today' },
        { mode: 'auto', action: 'Set to AUTO', time: '6:00 AM', date: 'Today' },
    ],
    pump: [
        { mode: 'auto', action: 'Set to AUTO', time: '8:10 AM', date: 'Today' },
        { mode: 'on',   action: 'Switched ON',  time: '7:55 AM', date: 'Today' },
        { mode: 'off',  action: 'Switched OFF', time: '7:20 AM', date: 'Today' },
        { mode: 'auto', action: 'Set to AUTO', time: '6:00 AM', date: 'Today' },
    ],
    fan: [
        { mode: 'auto', action: 'Set to AUTO', time: '8:00 AM', date: 'Today' },
        { mode: 'on',   action: 'Auto-triggered: Temp reached 31°C', time: '7:45 AM', date: 'Today' },
        { mode: 'auto', action: 'Auto off: Temp back to 29°C', time: '7:30 AM', date: 'Today' },
        { mode: 'on',   action: 'Auto-triggered: Temp reached 32°C', time: '7:15 AM', date: 'Today' },
        { mode: 'auto', action: 'Set to AUTO', time: '6:00 AM', date: 'Today' },
    ],
    heater: [
        { mode: 'auto', action: 'Set to AUTO', time: '8:00 AM', date: 'Today' },
        { mode: 'on',   action: 'Auto-triggered: Temp dropped to 23°C', time: '7:40 AM', date: 'Today' },
        { mode: 'auto', action: 'Auto off: Temp back to 25°C', time: '7:25 AM', date: 'Today' },
        { mode: 'on',   action: 'Auto-triggered: Temp dropped to 22°C', time: '7:10 AM', date: 'Today' },
        { mode: 'auto', action: 'Set to AUTO', time: '6:00 AM', date: 'Today' },
    ],
};
const hwLastActivity  = { aerator1: '8:05 AM', aerator2: '8:10 AM', pump: '8:10 AM', fan: '8:00 AM', heater: '8:00 AM' };

function addHwLog(device, mode) {
    const { time, date } = getTs();
    const modeNames = { on: 'Switched ON', auto: 'Set to AUTO', off: 'Switched OFF' };
    hwActivityLogs[device].unshift({ mode, action: modeNames[mode] || mode, time, date });
    if (hwActivityLogs[device].length > 20) hwActivityLogs[device].pop();
    hwLastActivity[device] = time;
}

// ─── HARDWARE DEVICE INFO ────────────────────────────────────
const hwDeviceInfo = {
    aerator1: { title: 'Aerator 1', subtitle: 'Air Pump',           icon: 'bi-wind',         sensor: 'do',   sensorLabel: 'Dissolved O₂', unit: 'mg/L' },
    aerator2: { title: 'Aerator 2', subtitle: 'Air Pump',           icon: 'bi-wind',         sensor: 'do',   sensorLabel: 'Dissolved O₂', unit: 'mg/L' },
    pump:     { title: 'Water Pump',  subtitle: 'Filtration System',  icon: 'bi-droplet-half', sensor: 'turb', sensorLabel: 'Turbidity',     unit: 'NTU'  },
    fan:      { title: 'Cooling Fan', subtitle: 'Temp Control',       icon: 'bi-fan',          sensor: 'temp', sensorLabel: 'Temperature',   unit: '°C'   },
    heater:   { title: 'Heater',      subtitle: 'Temp Control',       icon: 'bi-fire',         sensor: 'temp', sensorLabel: 'Temperature',   unit: '°C'   },
};

// ─── HARDWARE 3-STATE MODE ────────────────────────────────────
document.querySelectorAll('.hw-mode-group').forEach(group => {
    group.querySelectorAll('.hw-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const device = group.dataset.device;
            const mode   = btn.dataset.mode;
            const card   = document.getElementById(`hw-${device}`);
            group.querySelectorAll('.hw-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            card.classList.remove('on','auto','off');
            card.classList.add(mode);
            addHwLog(device, mode);
        });
    });
});

// init all cards to AUTO
document.querySelectorAll('.hw-mode-group').forEach(group => {
    const device = group.dataset.device;
    document.getElementById(`hw-${device}`)?.classList.add('auto');
});

// ─── TEMPERATURE DISPLAY + AUTO LOGIC ────────────────────────
function updateTempControl() {
    const tempEl    = document.getElementById('val-temp');
    const hwTempVal = document.getElementById('hw-temp-val');
    if (!tempEl || !hwTempVal) return;

    const temp = parseFloat(tempEl.textContent);
    hwTempVal.textContent = isNaN(temp) ? '--°C' : temp + '°C';
    hwTempVal.style.color = isNaN(temp) ? '' : temp > 30 ? '#E63946' : temp < 24 ? '#3b82f6' : 'var(--primary-teal)';

    ['fan', 'heater'].forEach(device => {
        const card   = document.getElementById(`hw-${device}`);
        const group  = card?.querySelector('.hw-mode-group');
        const active = group?.querySelector('.hw-mode-btn.active');
        if (!active || active.dataset.mode !== 'auto') return;
        const shouldBeOn = device === 'fan' ? temp > 30 : temp < 24;
        const currentlyOn = card.classList.contains('on');
        if (shouldBeOn && !currentlyOn) {
            card.classList.remove('on','auto','off');
            card.classList.add('on');
            const msg = device === 'fan'
                ? `Auto-triggered: Temp reached ${temp}°C`
                : `Auto-triggered: Temp dropped to ${temp}°C`;
            addHwLog(device, 'on');
            hwActivityLogs[device][0].action = msg;
        } else if (!shouldBeOn && currentlyOn) {
            card.classList.remove('on','auto','off');
            card.classList.add('auto');
            const msg = device === 'fan'
                ? `Auto off: Temp back to ${temp}°C`
                : `Auto off: Temp back to ${temp}°C`;
            addHwLog(device, 'auto');
            hwActivityLogs[device][0].action = msg;
        }
    });
}

updateTempControl();
setInterval(updateTempControl, 300000);

// ─── FEEDER LOG PANEL ────────────────────────────────────────
const feederLogOverlay = document.getElementById('feeder-log-overlay');
const feederLogModal   = document.getElementById('feeder-log-modal');

function openFeederLog() {
    renderFeederLog();
    feederLogOverlay.classList.add('show');
    feederLogModal.classList.add('show');
}

function closeFeederLog() {
    feederLogOverlay.classList.remove('show');
    feederLogModal.classList.remove('show');
}

// ─── HW LOG PANEL ────────────────────────────────────────────
const hwLogOverlay = document.getElementById('hw-log-overlay');
const hwLogModal   = document.getElementById('hw-log-modal');

function openHwLog(device) {
    const info = hwDeviceInfo[device];
    const card = document.getElementById(`hw-${device}`);
    const group = card.querySelector('.hw-mode-group');
    const active = group.querySelector('.hw-mode-btn.active');
    const mode = active ? active.dataset.mode : 'auto';

    document.getElementById('hw-log-icon-wrap').innerHTML = `<i class="bi ${info.icon}"></i>`;
    document.getElementById('hw-log-title').textContent = info.title;
    document.getElementById('hw-log-subtitle').textContent = info.subtitle;

    const badge = document.getElementById('hw-log-status-badge');
    badge.textContent = mode.toUpperCase();
    badge.className = `hw-detail-status-badge ${mode}`;

    document.getElementById('hw-log-last').textContent = hwLastActivity[device]
        ? `Last changed: ${hwLastActivity[device]}`
        : 'No recent activity';

    const sensorVal = document.getElementById(`val-${info.sensor}`)?.textContent || '--';
    document.getElementById('hw-log-sensor').innerHTML =
        `<i class="bi bi-activity"></i> ${info.sensorLabel}: <strong>${sensorVal} ${info.unit}</strong>`;

    const modeGroup = document.getElementById('hw-log-mode-group');
    modeGroup.innerHTML = ['off','auto','on'].map(m =>
        `<button class="hw-mode-btn${m === mode ? ' active' : ''}" data-mode="${m}" data-device="${device}">${m.toUpperCase()}</button>`
    ).join('');
    modeGroup.querySelectorAll('.hw-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const newMode = btn.dataset.mode;
            const realGroup = document.getElementById(`hw-${device}`).querySelector('.hw-mode-group');
            realGroup.querySelectorAll('.hw-mode-btn').forEach(b => b.classList.remove('active'));
            realGroup.querySelector(`[data-mode="${newMode}"]`).classList.add('active');
            const realCard = document.getElementById(`hw-${device}`);
            realCard.classList.remove('on','auto','off');
            realCard.classList.add(newMode);
            addHwLog(device, newMode);
            openHwLog(device);
        });
    });

    const list = document.getElementById('hw-log-list');
    if (hwActivityLogs[device].length === 0) {
        list.innerHTML = `<p class="hw-detail-log-empty">No activity yet.</p>`;
    } else {
        list.innerHTML = hwActivityLogs[device].map(l => `
            <div class="hw-detail-log-item">
              <div class="hw-detail-log-dot ${l.mode}"></div>
              <div class="hw-detail-log-info">
                <span class="hw-detail-log-action">${l.action}</span>
                <span class="hw-detail-log-time">${l.date} &middot; ${l.time}</span>
              </div>
            </div>`).join('');
    }

    hwLogOverlay.classList.add('show');
    hwLogModal.classList.add('show');
}

function closeHwLog() {
    hwLogOverlay.classList.remove('show');
    hwLogModal.classList.remove('show');
}

hwLogOverlay.addEventListener('click', closeHwLog);
document.getElementById('hw-log-close').addEventListener('click', closeHwLog);

// Log buttons
document.querySelectorAll('.hw-log-btn[data-device]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); openHwLog(btn.dataset.device); });
});

// Cards clickable
document.querySelectorAll('.hardware-card[data-device]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', e => {
        if (e.target.closest('.hw-mode-btn')) return;
        openHwLog(card.dataset.device);
    });
});

document.getElementById('feeder-log-toggle-btn').addEventListener('click', openFeederLog);
feederLogOverlay.addEventListener('click', closeFeederLog);
document.getElementById('feeder-log-close').addEventListener('click', closeFeederLog);

renderFeederLog();

// ═════════════════════════════════════════
//   AI RECOMENDATION
// ═════════════════════════════════════════

// Calculate recommendation based on sampling data or inventory
function calculateRecommendation() {
    // Use exposed global functions from tanks.js
    const data = window.growoutData || {
        initialStock: 68,
        stockingDate: null,
        samplingHistory: []
    };
    
    const hasSampling = data.samplingHistory && data.samplingHistory.length > 0;
    const liveCount = window.getLiveCount ? window.getLiveCount() : (data.initialStock || 68);
    const daysInCulture = window.getDaysInCulture ? window.getDaysInCulture() : 0;
    
    if (hasSampling) {
        // Use latest sampling data
        const latest = data.samplingHistory[data.samplingHistory.length - 1];
        return {
            source: 'sampling',
            date: latest.date,
            abw: latest.abw,
            biomass: latest.biomass,
            feedRation: latest.feedRation,
            population: liveCount,
            // Suggest 2 feedings per day
            timesPerDay: 2,
            suggestion: [
                { time: '6:00 AM', grams: Math.round(latest.feedRation / 2) },
                { time: '6:00 PM', grams: Math.round(latest.feedRation / 2) }
            ]
        };
    } else {
        // No sampling - calculate from inventory
        const population = liveCount;
        const days = daysInCulture;
        
        // Estimate ABW based on days in culture (simplified model)
        let estimatedABW = 5; // Default 5g for young crayfish
        if (days > 60) estimatedABW = 30;
        else if (days > 30) estimatedABW = 15;
        else if (days > 14) estimatedABW = 8;
        
        const biomass = +(population * estimatedABW).toFixed(1);
        const feedRation = +(biomass * 0.03).toFixed(1); // 3% of biomass
        
        return {
            source: 'inventory',
            population: population,
            daysInCulture: days,
            abw: estimatedABW,
            biomass: biomass,
            feedRation: feedRation,
            timesPerDay: 2,
            suggestion: [
                { time: '6:00 AM', grams: Math.round(feedRation / 2) },
                { time: '6:00 PM', grams: Math.round(feedRation / 2) }
            ]
        };
    }
}

// Render the recommendation UI
function renderRecommendation() {
    const contentEl = document.getElementById('ai-rec-content');
    const applyBtn = document.getElementById('ai-rec-apply-btn');
    if (!contentEl) return;
    
    const liveCount = window.getLiveCount ? window.getLiveCount() : 0;
    
    // If no stock set, show prompt
    if (liveCount === 0) {
        contentEl.innerHTML = `<div class="ai-rec-no-data">
            <i class="bi bi-exclamation-circle" style="font-size:24px;opacity:0.5;margin-bottom:8px;display:block;"></i>
            <strong>No stock data</strong><br>
            <span style="font-size:12px;opacity:0.6;">Set initial stock to get AI feeding recommendations.</span><br>
            <button class="compute-btn" style="margin-top:12px;font-size:13px;padding:8px 16px;" onclick="document.getElementById('go-set-initial-stock').click()">Set Initial Stock</button>
        </div>`;
        if (applyBtn) applyBtn.disabled = true;
        return;
    }
    
    const rec = calculateRecommendation();
    if (!rec) {
        contentEl.innerHTML = `<div class="ai-rec-no-data">No data available for recommendation.</div>`;
        if (applyBtn) applyBtn.disabled = true;
        return;
    }
    
    let html = '';
    
    // Based on text
    if (rec.source === 'sampling') {
        html += `<div class="ai-rec-based">Based on: Sampling (${rec.date})</div>`;
    } else {
        html += `<div class="ai-rec-based">Based on: Inventory (${rec.daysInCulture} days in culture)</div>`;
    }
    
    // Stats
    html += `<div class="ai-rec-stats">
        <span class="ai-rec-stat">ABW: <strong>${rec.abw}g</strong></span>
        <span class="ai-rec-stat">Pop: <strong>${rec.population}</strong></span>
        <span class="ai-rec-stat">Biomass: <strong>${rec.biomass}g</strong></span>
    </div>`;
    
    // Daily feed
    html += `<div class="ai-rec-daily">📊 Daily Feed: ${rec.feedRation}g (3% biomass)</div>`;
    
    // Suggestions
    html += `<div class="ai-rec-suggestions">
        <div class="ai-rec-suggestion"><i class="bi bi-clock"></i> <span class="ai-rec-time">${rec.timesPerDay}x daily</span></div>`;
    
    rec.suggestion.forEach(s => {
        html += `<div class="ai-rec-suggestion">
            <i class="bi bi-sunrise"></i>
            <span class="ai-rec-time">${s.time}</span>
            <span class="ai-rec-grams">${s.grams}g</span>
        </div>`;
    });
    
    html += `</div>`;
    
    contentEl.innerHTML = html;
    if (applyBtn) {
        applyBtn.disabled = false;
        applyBtn.style.display = 'block';
    }
}

// Apply recommendation to schedules
function applyRecommendation() {
    const rec = calculateRecommendation();
    if (!rec || !rec.suggestion) return;
    
    // Clear existing schedules
    if (typeof schedules !== 'undefined') {
        // Remove all existing schedules
        schedules = [];
        
        // Add recommended schedules
        rec.suggestion.forEach(s => {
            const parsed = parseTimeTo24h(s.time);
            schedules.push({
                time: s.time,
                display: s.time,
                hour: parsed.hour,
                minute: parsed.minute,
                isPM: parsed.isPM,
                grams: s.grams
            });
        });
        
        schedules.sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute));
        saveSchedules();
        renderSchedules();
        
        // Log the action
        addFeederLog(`AI Recommendation applied: ${rec.feedRation}g/day in ${rec.timesPerDay} feedings`, 'auto');
    }
}

// Initialize
const aiApplyBtn = document.getElementById('ai-rec-apply-btn');
if (aiApplyBtn) {
    aiApplyBtn.addEventListener('click', applyRecommendation);
}

// Render on load
setTimeout(() => {
    renderRecommendation();
}, 500);

// Expose render function for tanks.js to call after sampling
window.renderFeederRecommendation = renderRecommendation;

// Dashboard Feed Now button
const dashFeedNow = document.getElementById('dash-feed-now');
if (dashFeedNow) {
    dashFeedNow.addEventListener('click', () => {
        dashFeedNow.innerHTML = '<i class="bi bi-check-lg"></i> Dispensing...';
        dashFeedNow.style.opacity = '0.7';
        addFeederLog('Manual Feed — Feed Now (Dashboard)', 'manual');
        setTimeout(() => {
            dashFeedNow.innerHTML = '<i class="bi bi-play-fill"></i> Feed Now';
            dashFeedNow.style.opacity = '1';
        }, 2000);
    });
}

