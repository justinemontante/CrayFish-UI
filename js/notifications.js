// NOTIFICATIONS — Alert Log & Reminders

const NOTIFS = [
    {
        id: 1, type: 'critical', icon: 'bi-thermometer-high',
        title: 'High Temperature Alert',
        message: 'Temperature reached 32.4°C — Cooling fans triggered automatically.',
        timestamp: Date.now() - 2 * 60000, unread: true
    },
    {
        id: 2, type: 'critical', icon: 'bi-droplet-fill',
        title: 'Low DO Alert',
        message: 'Dissolved Oxygen dropped to 2.8 mg/L — Aerator activated automatically.',
        timestamp: Date.now() - 15 * 60000, unread: true
    },
    {
        id: 3, type: 'operational', icon: 'bi-check-circle-fill',
        title: 'Feeding Schedule Completed',
        message: 'Auto Feeder dispensed 44.1g at 8:00 AM successfully.',
        timestamp: Date.now() - 2 * 3600000, unread: false
    },
    {
        id: 4, type: 'reminder', icon: 'bi-calendar-check-fill',
        title: 'Bi-weekly Sampling Due',
        message: 'Tank 3 Grow-out is ready for sampling. Catch 10 random samples.',
        timestamp: Date.now() - 3 * 3600000, unread: true
    },
    {
        id: 5, type: 'operational', icon: 'bi-funnel-fill',
        title: 'Filtration Running',
        message: 'Water pump has been running for 6 hours. System is circulating normally.',
        timestamp: Date.now() - 86400000 - 3600000, unread: false
    },
    {
        id: 6, type: 'reminder', icon: 'bi-stars',
        title: 'Nursery Transfer Ready',
        message: 'Batch 01 is 30 days old. Ready for counting and transfer to Tank 3.',
        timestamp: Date.now() - 86400000 - 7200000, unread: false
    },
    {
        id: 7, type: 'critical', icon: 'bi-exclamation-triangle-fill',
        title: 'pH Critical Alert',
        message: 'pH dropped to 6.2 — Chemical danger detected.',
        timestamp: Date.now() - 2 * 86400000, unread: false
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

// Auto-push from dashboard
function pushNotification(type, icon, title, message) {
    notifications.unshift({ id: Date.now(), type, icon, title, message, timestamp: Date.now(), unread: true });
    renderNotifications();
}

window.pushNotification = pushNotification;

renderNotifications();
