document.addEventListener('DOMContentLoaded', function() {
    if (isSessionValid()) {
        window.location.href = 'admin.html';
        return;
    }

    initLoginForm();
});

function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', handleLogin);

    usernameInput.addEventListener('input', hideError);
    passwordInput.addEventListener('input', hideError);

    usernameInput.focus();

    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin(e);
        }
    });
}

async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoader = loginBtn.querySelector('.btn-loader');

    if (!username || !password) {
        showError('Veuillez remplir tous les champs');
        return;
    }

    setLoadingState(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    if (verifyCredentials(username, password)) {
        createSession();
        showSuccess();

        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1000);

    } else {
        setLoadingState(false);
        showError('Identifiants incorrects');

        const loginCard = document.querySelector('.login-card');
        loginCard.style.animation = 'none';
        setTimeout(() => {
            loginCard.style.animation = 'shake 0.5s ease-in-out';
        }, 10);

        document.getElementById('username').focus();
        document.getElementById('username').select();
    }
}

function setLoadingState(loading) {
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoader = loginBtn.querySelector('.btn-loader');

    if (loading) {
        loginBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';
    } else {
        loginBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';

    setTimeout(hideError, 5000);
}

function hideError() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'none';
}

function showSuccess() {
    const successIndicator = document.createElement('div');
    successIndicator.className = 'secure-indicator';
    successIndicator.innerHTML = '✅ Connexion réussie';
    successIndicator.style.background = 'rgba(56, 161, 105, 0.9)';
    document.body.appendChild(successIndicator);

    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoader = loginBtn.querySelector('.btn-loader');

    btnLoader.style.display = 'none';
    btnText.textContent = '✅ Connexion réussie';
    btnText.style.display = 'inline';
    loginBtn.style.background = 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)';
}

function clearForm() {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    hideError();
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
        return false;
    }
});

document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});