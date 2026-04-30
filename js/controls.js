// CONTROLS — Hardware Control Center

// Feeder Mode Toggle
const feederToggle = document.getElementById('feeder-toggle');
const feederModeLabel = document.getElementById('feeder-mode-label');

feederToggle.addEventListener('change', () => {
    feederModeLabel.textContent = feederToggle.checked ? 'Auto' : 'Manual';
});

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

// Hardware Toggles
document.querySelectorAll('.hw-toggle').forEach(toggle => {
    toggle.addEventListener('change', () => {
        const device = toggle.dataset.device;
        const card = document.getElementById(`hw-${device}`);
        const statusEl = document.getElementById(`status-${device}`);
        if (toggle.checked) {
            card.classList.add('on');
            statusEl.textContent = 'ON';
        } else {
            card.classList.remove('on');
            statusEl.textContent = 'OFF';
        }
    });
});
