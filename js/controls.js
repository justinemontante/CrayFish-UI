// CONTROLS — Hardware Control Center

// ─── FEEDER ACTIVITY LOG ─────────────────────────────────────
const feederLogs = [
    { action: 'Dispensed 44.1g feed (Scheduled)', type: 'auto', time: '8:00 AM', date: 'Today' },
    { action: 'Manual feed triggered', type: 'manual', time: '7:45 AM', date: 'Today' },
    { action: 'Feeding schedule added: 6:00 PM', type: 'schedule', time: '7:30 AM', date: 'Today' },
    { action: 'Mode changed to Auto', type: 'mode', time: '7:00 AM', date: 'Today' },
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
const hwActivityLogs = {
    aerator: [
        { mode: 'auto', action: 'Set to AUTO', time: '8:05 AM', date: 'Today' },
        { mode: 'on',   action: 'Switched ON',  time: '7:50 AM', date: 'Today' },
        { mode: 'off',  action: 'Switched OFF', time: '7:30 AM', date: 'Today' },
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
const hwLastActivity  = { aerator: '8:05 AM', pump: '8:10 AM', fan: '8:00 AM', heater: '8:00 AM' };

function addHwLog(device, mode) {
    const { time, date } = getTs();
    const modeNames = { on: 'Switched ON', auto: 'Set to AUTO', off: 'Switched OFF' };
    hwActivityLogs[device].unshift({ mode, action: modeNames[mode] || mode, time, date });
    if (hwActivityLogs[device].length > 20) hwActivityLogs[device].pop();
    hwLastActivity[device] = time;
}

// ─── HARDWARE DEVICE INFO ────────────────────────────────────
const hwDeviceInfo = {
    aerator: { title: 'Aerator',     subtitle: 'Air Pump',           icon: 'bi-wind',         sensor: 'do',   sensorLabel: 'Dissolved O₂', unit: 'mg/L' },
    pump:    { title: 'Water Pump',  subtitle: 'Filtration System',  icon: 'bi-droplet-half', sensor: 'turb', sensorLabel: 'Turbidity',     unit: 'NTU'  },
    fan:     { title: 'Cooling Fan', subtitle: 'Temp Control',       icon: 'bi-fan',          sensor: 'temp', sensorLabel: 'Temperature',   unit: '°C'   },
    heater:  { title: 'Heater',      subtitle: 'Temp Control',       icon: 'bi-fire',         sensor: 'temp', sensorLabel: 'Temperature',   unit: '°C'   },
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
