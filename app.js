document.addEventListener('DOMContentLoaded', () => {
    const screens = {
        splash: document.getElementById('splash-screen'),
        login: document.getElementById('login-screen'),
        signup: document.getElementById('signup-screen'),
        verify: document.getElementById('verify-screen')
    };

    const mainApp = document.getElementById('main-app');
    const navSections = document.querySelectorAll('.nav-section');
    const navBtns = document.querySelectorAll('.nav-btn');
    const sectionTitle = document.getElementById('section-title');

    function showScreen(screenName) {
        Object.values(screens).forEach(s => s.classList.add('hidden'));
        screens[screenName].classList.remove('hidden');
    }

    function showMainApp() {
        Object.values(screens).forEach(s => s.classList.add('hidden'));
        mainApp.classList.remove('hidden');
        showNavSection('dashboard');
    }

    function showNavSection(sectionId) {
        navSections.forEach(s => s.classList.add('hidden'));
        const target = document.getElementById(sectionId);
        if (target) target.classList.remove('hidden');
        
        navBtns.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.nav-btn[data-target="${sectionId}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        
        const titles = {
            dashboard: 'Dashboard',
            analytics: 'Analytics',
            tanks: 'Tank',
            controls: 'Controls',
            notifications: 'Notifications'
        };
        if (sectionTitle) sectionTitle.textContent = titles[sectionId] || 'Dashboard';
    }

    window.showNavSection = showNavSection;

    // Greeting
    function updateGreeting() {
        const h = new Date().getHours();
        const greetEl = document.getElementById('greeting-text');
        const dateEl = document.getElementById('greeting-date');
        if (!greetEl) return;
        greetEl.textContent = (h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening') + ', Justine!';
        const now = new Date();
        dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    updateGreeting();

    // Live Status Bar Time
    function updateTime() {
        const el = document.getElementById('status-time');
        if (!el) return;
        const now = new Date();
        let h = now.getHours(), m = now.getMinutes();
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        el.textContent = `${h}:${String(m).padStart(2, '0')} ${ampm}`;
    }
    updateTime();
    setInterval(updateTime, 1000);

    setTimeout(() => {
        showScreen('login');
    }, 3000);

    // Login Screen Toggle Password
    const toggleBtn = document.getElementById('toggle-pass');
    const passInput = document.getElementById('password');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isPassword = passInput.type === 'password';
            passInput.type = isPassword ? 'text' : 'password';
            toggleBtn.classList.toggle('show-pass');
        });
    }

    // Signup Screen Toggle Password
    const toggleSignupBtn = document.getElementById('toggle-signup-pass');
    const signupPassInput = document.getElementById('signup-password');
    if (toggleSignupBtn) {
        toggleSignupBtn.addEventListener('click', () => {
            const isPassword = signupPassInput.type === 'password';
            signupPassInput.type = isPassword ? 'text' : 'password';
            toggleSignupBtn.classList.toggle('show-pass');
        });
    }

    // Login Submit
    const loginSubmit = document.getElementById('login-submit');
    if (loginSubmit) {
        loginSubmit.addEventListener('click', (e) => {
            e.preventDefault();
            showMainApp();
        });
    }

    // Navigation
    document.getElementById('go-to-signup').addEventListener('click', (e) => {
        e.preventDefault();
        showScreen('signup');
    });

    document.getElementById('go-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        showScreen('login');
    });

    // Actions
    document.getElementById('google-signup').addEventListener('click', (e) => {
        e.preventDefault();
        showMainApp();
    });

    document.getElementById('signup-submit').addEventListener('click', (e) => {
        e.preventDefault();
        showScreen('verify');
    });

    // Verify Submit
    const verifySubmit = document.getElementById('verify-submit');
    if (verifySubmit) {
        verifySubmit.addEventListener('click', (e) => {
            e.preventDefault();
            showMainApp();
        });
    }

    // Google Login
    document.getElementById('google-login').addEventListener('click', (e) => {
        e.preventDefault();
        showMainApp();
    });
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            showNavSection(target);
        });
    });

    // OTP Logic
    const otpInputs = document.querySelectorAll('.otp-input');
    const otpContainer = document.getElementById('otp-container');
    const observer = new MutationObserver(() => {
        if (!screens.verify.classList.contains('hidden')) {
            otpInputs[0].focus();
        }
    });
    observer.observe(screens.verify, { attributes: true });

    otpContainer.addEventListener('input', (e) => {
        if (e.target.classList.contains('otp-input')) {
            const val = e.target.value.replace(/[^0-9]/g, '');
            e.target.value = val;
            
            if (val) {
                e.target.classList.add('filled');
                if (e.target.nextElementSibling && e.target.nextElementSibling.classList.contains('otp-input')) {
                    e.target.nextElementSibling.focus();
                }
            } else {
                e.target.classList.remove('filled');
            }
        }
    });

    otpContainer.addEventListener('keydown', (e) => {
        if (e.target.classList.contains('otp-input')) {
            if (e.key === 'Backspace' && !e.target.value && e.target.previousElementSibling && e.target.previousElementSibling.classList.contains('otp-input')) {
                e.target.previousElementSibling.focus();
            }
            if (e.key === 'ArrowLeft' && e.target.previousElementSibling && e.target.previousElementSibling.classList.contains('otp-input')) {
                e.target.previousElementSibling.focus();
            }
            if (e.key === 'ArrowRight' && e.target.nextElementSibling && e.target.nextElementSibling.classList.contains('otp-input')) {
                e.target.nextElementSibling.focus();
            }
        }
    });

    // Back to Signup
    document.getElementById('back-to-signup').addEventListener('click', (e) => {
        e.preventDefault();
        showScreen('signup');
        otpInputs.forEach(i => { i.value = ''; i.classList.remove('filled'); });
    });

    // Chatbot Toggle
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotPopup = document.getElementById('chatbot-popup');
    const closeChatbot = document.getElementById('close-chatbot');
    
    if (chatbotToggle && chatbotPopup) {
        chatbotToggle.addEventListener('click', () => {
            chatbotPopup.classList.toggle('hidden');
        });
    }
    if (closeChatbot && chatbotPopup) {
        closeChatbot.addEventListener('click', () => {
            chatbotPopup.classList.add('hidden');
        });
    }

    // Settings Panel
    const profileBtn      = document.getElementById('profile-btn');
    const settingsPanel   = document.getElementById('settings-panel');
    const settingsOverlay = document.getElementById('settings-overlay');
    const settingsBack    = document.getElementById('settings-back');
    const subPanel        = document.getElementById('settings-sub-panel');
    const subPanelBack    = document.getElementById('sub-panel-back');
    const subPanelTitle   = document.getElementById('sub-panel-title');
    const subPanelContent = document.getElementById('sub-panel-content');

    // Profile data (frontend only)
    const profile = { name: 'Justine', email: 'justine@craycare.com', farm: 'CrayCare Farm' };

    function openSettings() {
        const statusBar = document.querySelector('.status-bar');
        const h = statusBar ? statusBar.offsetHeight : 28;
        document.documentElement.style.setProperty('--status-bar-height', h + 'px');
        settingsPanel.classList.add('show');
        settingsOverlay.classList.add('show');
    }

    function closeSettings() {
        settingsPanel.classList.remove('show');
        settingsOverlay.classList.remove('show');
        subPanel.classList.remove('show');
    }

    function openSubPanel(title, html) {
        subPanelTitle.textContent = title;
        subPanelContent.innerHTML = html;
        subPanel.classList.add('show');
    }

    if (profileBtn)      profileBtn.addEventListener('click', openSettings);
    if (settingsBack)    settingsBack.addEventListener('click', closeSettings);
    if (settingsOverlay) settingsOverlay.addEventListener('click', closeSettings);
    if (subPanelBack)    subPanelBack.addEventListener('click', () => subPanel.classList.remove('show'));

    // Edit Profile
    document.getElementById('menu-edit-profile').addEventListener('click', () => {
        openSubPanel('Edit Profile', `
            <div class="settings-form-card">
                <div class="profile-upload-wrap">
                    <div class="profile-upload-avatar" id="upload-avatar-preview">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="8" r="4"/>
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                        </svg>
                    </div>
                    <label class="profile-upload-btn" for="avatar-upload">
                        <i class="bi bi-camera-fill"></i> Change Photo
                    </label>
                    <input type="file" id="avatar-upload" accept="image/*" style="display:none" />
                </div>
                <div class="settings-field">
                    <label>Full Name</label>
                    <input type="text" id="edit-name" value="${profile.name}" />
                </div>
                <div class="settings-field">
                    <label>Email</label>
                    <input type="email" id="edit-email" value="${profile.email}" disabled style="opacity:0.5;cursor:not-allowed" />
                </div>
                <button class="settings-save-btn" id="save-profile-btn">Save Changes</button>
            </div>
        `);

        // Avatar upload preview
        document.getElementById('avatar-upload').addEventListener('change', function () {
            const file = this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = e => {
                const preview = document.getElementById('upload-avatar-preview');
                preview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />`;
                // Update main profile avatar too
                document.querySelector('.settings-avatar').innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />`;
                document.querySelector('.profile-avatar').innerHTML = `<img src="${e.target.result}" style="width:34px;height:34px;object-fit:cover;border-radius:50%" />`;
            };
            reader.readAsDataURL(file);
        });

        document.getElementById('save-profile-btn').addEventListener('click', () => {
            profile.name  = document.getElementById('edit-name').value || profile.name;
            profile.email = document.getElementById('edit-email').value || profile.email;
            document.getElementById('profile-display-name').textContent  = profile.name;
            document.getElementById('profile-display-email').textContent = profile.email;
            subPanel.classList.remove('show');
        });
    });

    // Change Password
    document.getElementById('menu-change-password').addEventListener('click', () => {
        openSubPanel('Change Password', `
            <div class="settings-form-card">
                <div class="settings-field">
                    <label>Current Password</label>
                    <input type="password" placeholder="Enter current password" />
                </div>
                <div class="settings-field">
                    <label>New Password</label>
                    <input type="password" id="new-pass" placeholder="Enter new password" />
                </div>
                <div class="settings-field">
                    <label>Confirm New Password</label>
                    <input type="password" id="confirm-pass" placeholder="Confirm new password" />
                </div>
                <button class="settings-save-btn" id="save-pass-btn">Update Password</button>
            </div>
        `);
        document.getElementById('save-pass-btn').addEventListener('click', () => {
            const np = document.getElementById('new-pass').value;
            const cp = document.getElementById('confirm-pass').value;
            if (np && np === cp) subPanel.classList.remove('show');
        });
    });

    // Notifications
    document.getElementById('menu-notifications').addEventListener('click', () => {
        openSubPanel('Notifications', `
            <p class="settings-section-label">Alert Settings</p>
            <div class="settings-toggle-row">
                <div class="settings-toggle-info">
                    <span class="settings-toggle-title">Allow Notifications</span>
                    <span class="settings-toggle-sub">Master toggle for all alerts</span>
                </div>
                <label class="toggle-switch"><input type="checkbox" checked /><span class="toggle-slider"></span></label>
            </div>
            <div class="settings-toggle-row">
                <div class="settings-toggle-info">
                    <span class="settings-toggle-title">Critical Water Warnings</span>
                    <span class="settings-toggle-sub">pH, Temp, DO, Turbidity alerts</span>
                </div>
                <label class="toggle-switch"><input type="checkbox" checked /><span class="toggle-slider"></span></label>
            </div>
            <div class="settings-toggle-row">
                <div class="settings-toggle-info">
                    <span class="settings-toggle-title">Feeding Confirmations</span>
                    <span class="settings-toggle-sub">Notify when feeder dispenses</span>
                </div>
                <label class="toggle-switch"><input type="checkbox" checked /><span class="toggle-slider"></span></label>
            </div>
            <div class="settings-toggle-row">
                <div class="settings-toggle-info">
                    <span class="settings-toggle-title">Sampling Reminders</span>
                    <span class="settings-toggle-sub">Bi-weekly Grow-out Tank reminders</span>
                </div>
                <label class="toggle-switch"><input type="checkbox" checked /><span class="toggle-slider"></span></label>
            </div>
        `);
    });

    // Sound & Vibration
    const menuSound = document.getElementById('menu-sound');
    if (menuSound) menuSound.addEventListener('click', () => {
        openSubPanel('Sound & Vibration', `
            <p class="settings-section-label">Audio</p>
            <div class="settings-toggle-row">
                <div class="settings-toggle-info">
                    <span class="settings-toggle-title">Play Alert Sound</span>
                    <span class="settings-toggle-sub">Loud alarm for critical alerts</span>
                </div>
                <label class="toggle-switch"><input type="checkbox" checked /><span class="toggle-slider"></span></label>
            </div>
            <div class="settings-toggle-row">
                <div class="settings-toggle-info">
                    <span class="settings-toggle-title">Notification Sound</span>
                    <span class="settings-toggle-sub">Sound for all notifications</span>
                </div>
                <label class="toggle-switch"><input type="checkbox" checked /><span class="toggle-slider"></span></label>
            </div>
            <p class="settings-section-label">Haptics</p>
            <div class="settings-toggle-row">
                <div class="settings-toggle-info">
                    <span class="settings-toggle-title">Vibrate on Alert</span>
                    <span class="settings-toggle-sub">Feel alerts in noisy environments</span>
                </div>
                <label class="toggle-switch"><input type="checkbox" checked /><span class="toggle-slider"></span></label>
            </div>
        `);
    });

    // Help & Manual
    const menuHelp = document.getElementById('menu-help');
    if (menuHelp) menuHelp.addEventListener('click', () => {
        openSubPanel('Help & Manual', `
            <div class="settings-help-item">
                <i class="bi bi-book-fill"></i>
                <div class="settings-help-item-info">
                    <span class="settings-help-item-title">User Manual</span>
                    <span class="settings-help-item-sub">How to use CrayCare step by step</span>
                </div>
                <i class="bi bi-chevron-right settings-chevron"></i>
            </div>
            <div class="settings-help-item">
                <i class="bi bi-wifi"></i>
                <div class="settings-help-item-info">
                    <span class="settings-help-item-title">Sensor Setup Guide</span>
                    <span class="settings-help-item-sub">Connect and calibrate your IoT sensors</span>
                </div>
                <i class="bi bi-chevron-right settings-chevron"></i>
            </div>
            <div class="settings-help-item">
                <i class="bi bi-chat-dots-fill"></i>
                <div class="settings-help-item-info">
                    <span class="settings-help-item-title">Contact Support</span>
                    <span class="settings-help-item-sub">support@craycare.com</span>
                </div>
                <i class="bi bi-chevron-right settings-chevron"></i>
            </div>
        `);
    });

    // About
    const menuAbout = document.getElementById('menu-about');
    if (menuAbout) menuAbout.addEventListener('click', () => {
        openSubPanel('About CrayCare', `
            <div class="settings-about-card">
                <img src="resources/images/logo.png" class="settings-about-logo" />
                <p class="settings-about-name"><span class="text-cray">Cray</span><span class="text-care">Care</span></p>
                <p class="settings-about-version">Version 1.0.0</p>
                <p class="settings-about-desc">An integrated IoT-based monitoring and automated management system for sustainable crayfish aquaculture.</p>
            </div>
            <div class="settings-help-item">
                <i class="bi bi-shield-check-fill"></i>
                <div class="settings-help-item-info">
                    <span class="settings-help-item-title">Privacy Policy</span>
                    <span class="settings-help-item-sub">How we handle your data</span>
                </div>
                <i class="bi bi-chevron-right settings-chevron"></i>
            </div>
            <div class="settings-help-item">
                <i class="bi bi-file-text-fill"></i>
                <div class="settings-help-item-info">
                    <span class="settings-help-item-title">Terms of Service</span>
                    <span class="settings-help-item-sub">Usage terms and conditions</span>
                </div>
                <i class="bi bi-chevron-right settings-chevron"></i>
            </div>
        `);
    });

    // Logout
    const logoutBtn     = document.getElementById('logout-btn');
    const logoutOverlay = document.getElementById('logout-overlay');
    const logoutModal   = document.getElementById('logout-modal');

    function openLogoutModal() {
        logoutOverlay.classList.add('show');
        logoutModal.classList.add('show');
    }

    function closeLogoutModal() {
        logoutOverlay.classList.remove('show');
        logoutModal.classList.remove('show');
    }

    if (logoutBtn) logoutBtn.addEventListener('click', openLogoutModal);
    if (logoutOverlay) logoutOverlay.addEventListener('click', closeLogoutModal);
    const logoutCancel = document.getElementById('logout-cancel');
    if (logoutCancel) logoutCancel.addEventListener('click', closeLogoutModal);
    const logoutConfirm = document.getElementById('logout-confirm');
    if (logoutConfirm) logoutConfirm.addEventListener('click', () => {
        closeLogoutModal();
        closeSettings();
        mainApp.classList.add('hidden');
        showScreen('login');
    });
});
