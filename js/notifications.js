// NOTIFICATIONS — Alert Log & Reminders

const NOTIFS = [
    {
        id: 1, type: 'critical', icon: 'bi-thermometer-high',
        title: 'High Temperature Alert',
        message: 'Temperature reached 32.4°C — Cooling fans triggered automatically.',
        time: '2 mins ago', unread: true
    },
    {
        id: 2, type: 'critical', icon: 'bi-droplet-fill',
        title: 'Low DO Alert',
        message: 'Dissolved Oxygen dropped to 2.8 mg/L — Aerator activated automatically.',
        time: '15 mins ago', unread: true
    },
    {
        id: 3, type: 'operational', icon: 'bi-check-circle-fill',
        title: 'Feeding Schedule Completed',
        message: 'Auto Feeder dispensed 44.1g at 8:00 AM successfully.',
        time: '2 hrs ago', unread: false
    },
    {
        id: 4, type: 'reminder', icon: 'bi-calendar-check-fill',
        title: 'Bi-weekly Sampling Due',
        message: 'Tank 3 Grow-out is ready for sampling. Catch 10 random samples.',
        time: '3 hrs ago', unread: true
    },
    {
        id: 5, type: 'operational', icon: 'bi-funnel-fill',
        title: 'Filtration Running',
        message: 'Water pump has been running for 6 hours. System is circulating normally.',
        time: '6 hrs ago', unread: false
    },
    {
        id: 6, type: 'reminder', icon: 'bi-stars',
        title: 'Nursery Transfer Ready',
        message: 'Batch 01 is 30 days old. Ready for counting and transfer to Tank 3.',
        time: 'Yesterday', unread: false
    }
];

let notifications = [...NOTIFS];
let activeFilter = 'all';

function timeAgo(date) {
    const diff = Math.floor((Date.now() - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
    return 'Yesterday';
}

function renderNotifications() {
    const list = document.getElementById('notif-list');
    const filtered = activeFilter === 'all'
        ? notifications
        : notifications.filter(n => n.type === activeFilter);

    document.getElementById('notif-count').textContent =
        `${filtered.length} Notification${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="notif-empty">
                <i class="bi bi-bell-slash-fill"></i>
                <p>No notifications</p>
            </div>`;
        return;
    }

    list.innerHTML = filtered.map(n => `
        <div class="notif-item ${n.type} ${n.unread ? 'unread' : ''}" data-id="${n.id}">
            <div class="notif-icon ${n.type}">
                <i class="bi ${n.icon}"></i>
            </div>
            <div class="notif-content">
                <span class="notif-title">${n.title}</span>
                <span class="notif-message">${n.message}</span>
                <span class="notif-time">${n.time}</span>
            </div>
            <div class="notif-unread-dot"></div>
            <button class="notif-dismiss" data-id="${n.id}"><i class="bi bi-x"></i></button>
        </div>
    `).join('');

    // Mark as read on click
    list.querySelectorAll('.notif-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.notif-dismiss')) return;
            const id = parseInt(item.dataset.id);
            const notif = notifications.find(n => n.id === id);
            if (notif) { notif.unread = false; renderNotifications(); }
        });
    });

    // Dismiss
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
    const filtered = activeFilter === 'all'
        ? []
        : notifications.filter(n => n.type !== activeFilter);
    notifications = filtered;
    renderNotifications();
});

// Auto-push notification from dashboard sensor alerts
function pushNotification(type, icon, title, message) {
    const id = Date.now();
    notifications.unshift({ id, type, icon, title, message, time: 'Just now', unread: true });
    renderNotifications();
}

// Expose globally so dashboard.js can call it
window.pushNotification = pushNotification;

renderNotifications();
