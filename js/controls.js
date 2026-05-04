// CONTROLS — Hardware Control Center

// ─── FEEDER MODE TOGGLE ───────────────────────────────────────
const feederToggle = document.getElementById('feeder-toggle');
const feederModeLabel = document.getElementById('feeder-mode-label');
const scheduleList = document.querySelector('.schedule-list');

function updateFeederMode() {
    const isAuto = feederToggle.checked;
    feederModeLabel.textContent = isAuto ? 'Auto' : 'Manual';
    scheduleList.style.display = isAuto ? 'block' : 'none';
}

feederToggle.addEventListener('change', updateFeederMode);
updateFeederMode();

// Feed Now Button
document.getElementById('feed-now-btn').addEventListener('click', () => {
    const btn = document.getElementById('feed-now-btn');
    btn.innerHTML = '<i class="bi bi-check-lg"></i> Dispensing...';
    btn.style.opacity = '0.7';
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
        renderSchedule(schedules);
    }
    input.value = '';
});

// ─── HARDWARE 3-STATE MODE (OFF / AUTO / ON) ─────────────────
document.querySelectorAll('.hw-mode-group').forEach(group => {
    group.querySelectorAll('.hw-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const device = group.dataset.device;
            const mode   = btn.dataset.mode;
            const card   = document.getElementById(`hw-${device}`);
            const status = document.getElementById(`status-${device}`);

            group.querySelectorAll('.hw-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            card.classList.remove('on', 'auto', 'off');
            card.classList.add(mode);
            status.textContent = mode.toUpperCase();
        });
    });
});

// init all cards to AUTO state
document.querySelectorAll('.hw-mode-group').forEach(group => {
    const device = group.dataset.device;
    document.getElementById(`hw-${device}`).classList.add('auto');
});

// ─── TEMPERATURE DISPLAY + AUTO LOGIC ────────────────────────
function updateTempControl() {
    const tempEl = document.getElementById('val-temp');
    const hwTempVal = document.getElementById('hw-temp-val');
    if (!tempEl || !hwTempVal) return;

    const temp = parseFloat(tempEl.textContent);
    hwTempVal.textContent = isNaN(temp) ? '--°C' : temp + '°C';
    hwTempVal.style.color = isNaN(temp) ? '' : temp > 30 ? '#E63946' : temp < 24 ? '#3b82f6' : 'var(--primary-teal)';

    ['fan', 'heater'].forEach(device => {
        const card   = document.getElementById(`hw-${device}`);
        const status = document.getElementById(`status-${device}`);
        const group  = card?.querySelector('.hw-mode-group');
        const active = group?.querySelector('.hw-mode-btn.active');
        if (!active || active.dataset.mode !== 'auto') return;

        const shouldBeOn = device === 'fan' ? temp > 30 : temp < 24;
        card.classList.remove('on', 'auto', 'off');
        card.classList.add(shouldBeOn ? 'on' : 'auto');
        status.textContent = shouldBeOn ? 'ON (AUTO)' : 'AUTO';
    });
}

updateTempControl();
setInterval(updateTempControl, 5000);
