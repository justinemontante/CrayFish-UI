// CONTROLS — Hardware Control Center

// ─── FEEDER ACTIVITY LOG ─────────────────────────────────────
const feederLogs = [];

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
}

function renderFeederLog() {
    const list = document.getElementById('feeder-log-list');
    if (!list) return;
    if (feederLogs.length === 0) {
        list.innerHTML = `<p class="hw-detail-log-empty">No activity yet.</p>`;
        return;
    }
    const dotClass = { auto: 'auto', manual: 'on', mode: 'off', schedule: 'auto' };
    list.innerHTML = feederLogs.map(l => `
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
    addFeederLog(`Mode changed to ${isAuto ? 'Auto' : 'Manual'}`, 'mode');
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

function renderSchedule(items) {
    const container = document.getElementById('schedule-items');
    container.innerHTML = items.map(time => `
        <div class="schedule-item">
            <i class="bi bi-clock-fill"></i>
            <span class="schedule-time-text">${time}</span>
            <button class="schedule-edit" data-time="${time}"><i class="bi bi-pencil-fill"></i></button>
            <button class="schedule-remove" data-time="${time}"><i class="bi bi-trash-fill"></i></button>
        </div>
    `).join('');

    container.querySelectorAll('.schedule-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            addFeederLog(`Schedule removed: ${btn.dataset.time}`, 'schedule');
            schedules = schedules.filter(t => t !== btn.dataset.time);
            renderSchedule(schedules);
        });
    });

    container.querySelectorAll('.schedule-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const oldTime = btn.dataset.time;
            const item = btn.closest('.schedule-item');
            const [timePart, ampm] = oldTime.split(' ');
            const [h, m] = timePart.split(':');
            let hour = parseInt(h);
            if (ampm === 'PM' && hour !== 12) hour += 12;
            if (ampm === 'AM' && hour === 12) hour = 0;
            const val = `${String(hour).padStart(2,'0')}:${m}`;

            item.innerHTML = `
                <i class="bi bi-clock-fill"></i>
                <input type="time" class="schedule-time-input edit-input" value="${val}" />
                <button class="schedule-save" data-old="${oldTime}"><i class="bi bi-check-lg"></i></button>
                <button class="schedule-cancel"><i class="bi bi-x-lg"></i></button>
            `;

            item.querySelector('.schedule-save').addEventListener('click', () => {
                const newVal = item.querySelector('.edit-input').value;
                if (!newVal) return;
                const formatted = formatTime(newVal);
                addFeederLog(`Schedule updated: ${oldTime} → ${formatted}`, 'schedule');
                schedules = schedules.map(t => t === oldTime ? formatted : t);
                schedules.sort();
                renderSchedule(schedules);
            });

            item.querySelector('.schedule-cancel').addEventListener('click', () => {
                renderSchedule(schedules);
            });
        });
    });
}

let schedules = ['8:00 AM', '5:00 PM'];
renderSchedule(schedules);

document.getElementById('schedule-add-btn').addEventListener('click', () => {
    const input = document.getElementById('schedule-time-input');
    if (!input.value) return;
    const formatted = formatTime(input.value);
    if (!schedules.includes(formatted)) {
        schedules.push(formatted);
        schedules.sort();
        addFeederLog(`Schedule added: ${formatted}`, 'schedule');
        renderSchedule(schedules);
    }
    input.value = '';
});

// Simulate auto feed when schedule time matches current time
setInterval(() => {
    if (!feederToggle.checked) return;
    const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    if (schedules.includes(now)) {
        addFeederLog(`Auto Feed — Scheduled at ${now}`, 'auto');
    }
}, 60000);

// ─── HARDWARE ACTIVITY LOGS ───────────────────────────────────
const hwActivityLogs = { aerator: [], pump: [], fan: [], heater: [] };
const hwLastActivity  = { aerator: null, pump: null, fan: null, heater: null };

function addHwLog(device, mode) {
    const { time, date } = getTs();
    const modeNames = { on: 'Switched ON', auto: 'Set to AUTO', off: 'Switched OFF' };
    hwActivityLogs[device].unshift({ mode, action: modeNames[mode] || mode, time, date });
    if (hwActivityLogs[device].length > 20) hwActivityLogs[device].pop();
    hwLastActivity[device] = time;
}

// ─── HARDWARE DETAIL MODAL ───────────────────────────────────
const hwDetailOverlay = document.getElementById('hw-detail-overlay');
const hwDetailModal   = document.getElementById('hw-detail-modal');

const hwDeviceInfo = {
    aerator: { title: 'Aerator',     subtitle: 'Air Pump',                  icon: 'bi-wind',         sensor: 'do',   sensorLabel: 'Dissolved O₂', unit: 'mg/L' },
    pump:    { title: 'Water Pump',  subtitle: 'Filtration System',         icon: 'bi-droplet-half', sensor: 'turb', sensorLabel: 'Turbidity',     unit: 'NTU'  },
    fan:     { title: 'Cooling Fan', subtitle: 'Activates if temp > 30°C',  icon: 'bi-fan',          sensor: 'temp', sensorLabel: 'Temperature',   unit: '°C'   },
    heater:  { title: 'Heater',      subtitle: 'Activates if temp < 24°C',  icon: 'bi-fire',         sensor: 'temp', sensorLabel: 'Temperature',   unit: '°C'   },
};

function openHwDetail(device) {
    const info   = hwDeviceInfo[device];
    const card   = document.getElementById(`hw-${device}`);
    const group  = card.querySelector('.hw-mode-group');
    const active = group.querySelector('.hw-mode-btn.active');
    const mode   = active ? active.dataset.mode : 'auto';

    document.getElementById('hw-detail-icon-wrap').innerHTML = `<i class="bi ${info.icon}"></i>`;
    document.getElementById('hw-detail-title').textContent    = info.title;
    document.getElementById('hw-detail-subtitle').textContent = info.subtitle;

    const badge = document.getElementById('hw-detail-status-badge');
    badge.textContent = mode.toUpperCase();
    badge.className   = `hw-detail-status-badge ${mode}`;

    document.getElementById('hw-detail-last').textContent = hwLastActivity[device]
        ? `Last changed: ${hwLastActivity[device]}`
        : 'No recent activity';

    const sensorVal = document.getElementById(`val-${info.sensor}`)?.textContent || '--';
    document.getElementById('hw-detail-sensor').innerHTML =
        `<i class="bi bi-activity"></i> ${info.sensorLabel}: <strong>${sensorVal} ${info.unit}</strong>`;

    // mode control
    const modeGroup = document.getElementById('hw-detail-mode-group');
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
            openHwDetail(device);
        });
    });

    // activity log
    const logList = document.getElementById('hw-detail-log-list');
    if (hwActivityLogs[device].length === 0) {
        logList.innerHTML = `<p class="hw-detail-log-empty">No activity yet.</p>`;
    } else {
        logList.innerHTML = hwActivityLogs[device].map(l => `
            <div class="hw-detail-log-item">
              <div class="hw-detail-log-dot ${l.mode}"></div>
              <div class="hw-detail-log-info">
                <span class="hw-detail-log-action">${l.action}</span>
                <span class="hw-detail-log-time">${l.date} &middot; ${l.time}</span>
              </div>
            </div>`).join('');
    }

    hwDetailOverlay.classList.add('show');
    hwDetailModal.classList.add('show');
}

function closeHwDetail() {
    hwDetailOverlay.classList.remove('show');
    hwDetailModal.classList.remove('show');
}

hwDetailOverlay.addEventListener('click', closeHwDetail);
document.getElementById('hw-detail-close').addEventListener('click', closeHwDetail);

document.querySelectorAll('.hw-detail-btn').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); openHwDetail(btn.dataset.device); });
});
document.querySelectorAll('.hardware-card[data-device]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', e => {
        if (e.target.closest('.hw-mode-btn') || e.target.closest('.hw-detail-btn')) return;
        openHwDetail(card.dataset.device);
    });
});

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
        card.classList.remove('on','auto','off');
        card.classList.add(shouldBeOn ? 'on' : 'auto');
    });
}

updateTempControl();
setInterval(updateTempControl, 5000);

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

document.getElementById('feeder-log-toggle-btn').addEventListener('click', openFeederLog);
feederLogOverlay.addEventListener('click', closeFeederLog);
document.getElementById('feeder-log-close').addEventListener('click', closeFeederLog);
document.getElementById('feeder-log-clear').addEventListener('click', () => {
    feederLogs.length = 0;
    renderFeederLog();
});

renderFeederLog();
