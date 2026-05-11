// NOTIFICATIONS — Alert Log & Reminders

const NOTIFS = [
    {
        id: 1, type: 'warning', icon: 'bi-exclamation-triangle-fill',
        title: 'Low Dissolved Oxygen',
        message: 'DO at 4.2 mg/L in Grow-out Tank. Approaching warning threshold.',
        timestamp: Date.now() - 45 * 60000, unread: true
    },
    {
        id: 2, type: 'critical', icon: 'bi-cloud-fog-fill',
        title: 'High Turbidity Detected',
        message: 'Turbidity at 60 NTU in Grow-out Tank. Filtration needed.',
        timestamp: Date.now() - 2 * 3600000, unread: true
    },
    {
        id: 3, type: 'operational', icon: 'bi-check-circle-fill',
        title: 'Morning Feeding Completed',
        message: 'Auto feeder dispensed 22.1g at 6:00 AM in Grow-out Tank.',
        timestamp: Date.now() - 2 * 3600000, unread: true
    },
    {
        id: 4, type: 'reminder', icon: 'bi-calendar-check-fill',
        title: 'Weekly Sampling Due',
        message: 'Grow-out Tank is due for sampling this week.',
        timestamp: Date.now() - 15 * 60000, unread: true
    },
    {
        id: 5, type: 'reminder', icon: 'bi-clipboard2-check',
        title: 'Water Quality Log Due',
        message: 'Daily water quality readings have not been recorded today.',
        timestamp: Date.now() - 3600000, unread: false
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

    updateNotifBadge();
}

// Update notification badge in nav button
function updateNotifBadge() {
    const badge = document.getElementById('notif-badge');
    if (!badge) return;
    
    const unreadCount = notifications.filter(n => n.unread).length;
    badge.textContent = unreadCount;
    
    if (unreadCount > 0) {
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// Initial badge update
updateNotifBadge();

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
    updateNotifBadge(); // Update badge count
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
