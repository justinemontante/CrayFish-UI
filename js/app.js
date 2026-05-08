document.addEventListener('DOMContentLoaded', () => {
    // Dynamic Greeting
    const greetingText = document.getElementById('greeting-text');
    const greetingDate = document.getElementById('greeting-date');
    
    if (greetingText && greetingDate) {
        const hour = new Date().getHours();
        let greeting = 'Good Morning';
        if (hour >= 12 && hour < 18) greeting = 'Good Afternoon';
        else if (hour >= 18) greeting = 'Good Evening';
        
        greetingText.textContent = `${greeting}, Justine!`;
        
        const date = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        greetingDate.textContent = date.toLocaleDateString('en-US', options);
    }
    
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
            tanks: 'Tanks',
            controls: 'Controls',
            notifications: 'Notifications'
        };
        if (sectionTitle) sectionTitle.textContent = titles[sectionId] || 'Dashboard';
    }

    window.showNavSection = showNavSection;

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
        showScreen('verify');
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

    // Bottom Nav Click Handlers
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

    // Settings Toggle
    const profileBtn = document.getElementById('profile-btn');
    const settingsPopup = document.getElementById('settings-popup');
    const closeSettings = document.getElementById('close-settings');
    
    if (profileBtn && settingsPopup) {
        profileBtn.addEventListener('click', () => {
            settingsPopup.classList.toggle('hidden');
        });
    }
    if (closeSettings && settingsPopup) {
        closeSettings.addEventListener('click', () => {
            settingsPopup.classList.add('hidden');
        });
    }
});
