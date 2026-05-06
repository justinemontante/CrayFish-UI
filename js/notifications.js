// NOTIFICATIONS — Alert Log & Reminders

const NOTIFS = [
    // ── CRITICAL (4) ──
    {
        id: 1, type: 'critical', icon: 'bi-thermometer-high',
        title: 'High Temperature Alert',
        message: 'Temperature reached 32.1°C in Tank 1. Cooling system activated.',
        timestamp: Date.now() - 5 * 60000, unread: true
    },
    {
        id: 2, type: 'critical', icon: 'bi-droplet-fill',
        title: 'Low Dissolved Oxygen',
        message: 'DO dropped to 3.1 mg/L in Tank 2. Aerator triggered automatically.',
        timestamp: Date.now() - 45 * 60000, unread: true
    },
    {
        id: 3, type: 'critical', icon: 'bi-exclamation-triangle-fill',
        title: 'pH Out of Range',
        message: 'pH dropped to 6.5 in Tank 3. Dosing pump initiated correction.',
        timestamp: Date.now() - 2 * 3600000, unread: false
    },
    {
        id: 4, type: 'critical', icon: 'bi-cloud-fog-fill',
        title: 'High Turbidity Detected',
        message: 'Turbidity reached 45 NTU in Tank 1. Filtration cycle extended.',
        timestamp: Date.now() - 5 * 3600000, unread: false
    },

    // ── OPERATIONAL (8) ──
    {
        id: 5, type: 'operational', icon: 'bi-check-circle-fill',
        title: 'Morning Feeding Completed',
        message: 'Auto feeder dispensed 44.1g at 8:00 AM in Tank 3.',
        timestamp: Date.now() - 30 * 60000, unread: true
    },
    {
        id: 6, type: 'operational', icon: 'bi-funnel-fill',
        title: 'Filtration Cycle Started',
        message: 'Water pump activated. Expected duration: 6 hours.',
        timestamp: Date.now() - 1 * 3600000, unread: true
    },
    {
        id: 7, type: 'operational', icon: 'bi-water',
        title: 'Water Change Completed',
        message: '30% water change completed in Tank 1 successfully.',
        timestamp: Date.now() - 3 * 3600000, unread: false
    },
    {
        id: 8, type: 'operational', icon: 'bi-battery-charging',
        title: 'Backup Battery OK',
        message: 'UPS battery level at 98%. All systems running on mains power.',
        timestamp: Date.now() - 6 * 3600000, unread: false
    },
    {
        id: 9, type: 'operational', icon: 'bi-check2-circle',
        title: 'Evening Feeding Completed',
        message: 'Auto feeder dispensed 38.5g at 6:00 PM in Tank 3.',
        timestamp: Date.now() - 86400000 - 2 * 3600000, unread: false
    },
    {
        id: 10, type: 'operational', icon: 'bi-arrow-repeat',
        title: 'System Reboot',
        message: 'Controller rebooted successfully after firmware update.',
        timestamp: Date.now() - 86400000 - 8 * 3600000, unread: false
    },
    {
        id: 11, type: 'operational', icon: 'bi-thermometer-half',
        title: 'Temperature Stabilized',
        message: 'Tank 2 temperature normalized to 26.5°C after heating event.',
        timestamp: Date.now() - 86400000 * 2, unread: false
    },
    {
        id: 12, type: 'operational', icon: 'bi-droplet-half',
        title: 'DO Levels Normal',
        message: 'Dissolved Oxygen stabilized at 7.2 mg/L across all tanks.',
        timestamp: Date.now() - 86400000 * 3, unread: false
    },

    // ── REMINDERS (5) ──
    {
        id: 13, type: 'reminder', icon: 'bi-calendar-check-fill',
        title: 'Bi-weekly Sampling Due',
        message: 'Tank 3 Grow-out is due for sampling. Weigh 10 random samples.',
        timestamp: Date.now() - 15 * 60000, unread: true
    },
    {
        id: 14, type: 'reminder', icon: 'bi-stars',
        title: 'Nursery Count Ready',
        message: 'Box A juveniles are 30 days old. Ready for actual counting.',
        timestamp: Date.now() - 1 * 3600000, unread: true
    },
    {
        id: 15, type: 'reminder', icon: 'bi-calendar-event-fill',
        title: 'Filter Media Replacement',
        message: 'Filter cartridges due for replacement next week.',
        timestamp: Date.now() - 2 * 3600000, unread: false
    },
    {
        id: 16, type: 'reminder', icon: 'bi-clipboard2-check',
        title: 'Water Quality Log Due',
        message: 'Daily water quality readings for today have not been recorded.',
        timestamp: Date.now() - 86400000 - 4 * 3600000, unread: false
    },
    {
        id: 17, type: 'reminder', icon: 'bi-journal-plus',
        title: 'Weekly Report Pending',
        message: 'Weekly growth report for Tank 3 has not been submitted.',
        timestamp: Date.now() - 86400000 * 2, unread: false
    }
];

let notifications = [...NOTIFS];
let activeFilter = 'all';

function timeAgo(ts) {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
    return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function getGroup(ts) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    if (ts >= todayStart) return 'Today';
    if (ts >= yesterdayStart) return 'Yesterday';
    return new Date(ts).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function updateKPIs() {
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const todayNotifs = notifications.filter(n => n.timestamp >= todayStart.getTime());
    document.getElementById('kpi-total').textContent    = todayNotifs.length;
    document.getElementById('kpi-unread').textContent   = notifications.filter(n => n.unread).length;
    document.getElementById('kpi-critical').textContent = notifications.filter(n => n.type === 'critical').length;
    document.getElementById('kpi-reminder').textContent = notifications.filter(n => n.type === 'reminder').length;
}

function renderNotifications() {
    const list = document.getElementById('notif-list');
    const filtered = activeFilter === 'all'
        ? notifications
        : activeFilter === 'critical'
        ? notifications.filter(n => n.type === 'critical' && getGroup(n.timestamp) === 'Today')
        : notifications.filter(n => n.type === activeFilter);

    document.getElementById('notif-count').textContent =
        `${filtered.length} Notification${filtered.length !== 1 ? 's' : ''}`;

    updateKPIs();

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="notif-empty">
                <i class="bi bi-bell-slash-fill"></i>
                <p>No notifications</p>
            </div>`;
        return;
    }

    // Group by date
    const groups = {};
    filtered.forEach(n => {
        const g = getGroup(n.timestamp);
        if (!groups[g]) groups[g] = [];
        groups[g].push(n);
    });

    list.innerHTML = Object.entries(groups).map(([group, items]) => `
        <div class="notif-group-label">${group}</div>
        ${items.map(n => `
            <div class="notif-item ${n.type} ${n.unread ? 'unread' : ''}" data-id="${n.id}">
                <div class="notif-icon ${n.type}"><i class="bi ${n.icon}"></i></div>
                <div class="notif-content">
                    <span class="notif-title">${n.title}</span>
                    <span class="notif-message">${n.message}</span>
                    <span class="notif-time">${timeAgo(n.timestamp)}</span>
                </div>
                <div class="notif-unread-dot"></div>
                <button class="notif-dismiss" data-id="${n.id}"><i class="bi bi-x"></i></button>
            </div>
        `).join('')}
    `).join('');

    list.querySelectorAll('.notif-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.notif-dismiss')) return;
            const id = parseInt(item.dataset.id);
            const notif = notifications.find(n => n.id === id);
            if (notif) openNotifModal(notif);
        });
    });

    list.querySelectorAll('.notif-dismiss').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const item = list.querySelector(`.notif-item[data-id="${id}"]`);
            item.classList.add('removing');
            setTimeout(() => {
                notifications = notifications.filter(n => n.id !== id);
                renderNotifications();
            }, 300);
        });
    });
}

// Notification Modal
const notifOverlay = document.getElementById('notif-overlay');
const notifModal   = document.getElementById('notif-modal');

function openNotifModal(n) {
    document.getElementById('notif-modal-icon').className = `notif-modal-icon ${n.type}`;
    document.getElementById('notif-modal-icon').innerHTML = `<i class="bi ${n.icon}"></i>`;
    document.getElementById('notif-modal-title').textContent   = n.title;
    document.getElementById('notif-modal-message').textContent = n.message;
    document.getElementById('notif-modal-time').textContent    = timeAgo(n.timestamp);
    notifOverlay.classList.add('show');
    notifModal.classList.add('show');
    // Mark as read
    n.unread = false;
    renderNotifications();
}

function closeNotifModal() {
    notifOverlay.classList.remove('show');
    notifModal.classList.remove('show');
}

notifOverlay.addEventListener('click', closeNotifModal);
document.getElementById('notif-modal-close').addEventListener('click', closeNotifModal);

// Filter tabs
document.querySelectorAll('.notif-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.notif-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeFilter = tab.dataset.filter;
        renderNotifications();
    });
});

// Clear all
document.getElementById('notif-clear-btn').addEventListener('click', () => {
    notifications = activeFilter === 'all'
        ? []
        : notifications.filter(n => n.type !== activeFilter);
    renderNotifications();
});

renderNotifications();
