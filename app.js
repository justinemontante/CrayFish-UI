document.addEventListener('DOMContentLoaded', () => {
    const screens = {
        splash: document.getElementById('splash-screen'),
        login: document.getElementById('login-screen'),
        signup: document.getElementById('signup-screen'),
        verify: document.getElementById('verify-screen')
    };

    function showScreen(screenName) {
        Object.values(screens).forEach(s => s.classList.add('hidden'));
        screens[screenName].classList.remove('hidden');
    }

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

    // Clear OTP inputs on screen show
});
