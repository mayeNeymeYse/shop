const ADMIN_CONFIG = {
    get USERNAME() {
        if (typeof window.ENV !== 'undefined' && window.ENV.ADMIN_USERNAME) {
            return window.ENV.ADMIN_USERNAME;
        }

        console.warn('⚠️ Utilisation des identifiants par défaut - Mode démo');
        return 'admin';
    },

    get PASSWORD() {
        if (typeof window.ENV !== 'undefined' && window.ENV.ADMIN_PASSWORD) {
            return window.ENV.ADMIN_PASSWORD;
        }

        console.warn('⚠️ Utilisation du mot de passe par défaut - Mode démo');
        return 'Abcd1234*';
    },

    get SESSION_DURATION() {
        return (typeof window.ENV !== 'undefined' && window.ENV.SESSION_DURATION_MINUTES) ?
            window.ENV.SESSION_DURATION_MINUTES : 60;
    },

    AUTH_KEY: 'gallery_admin_auth',

    get APP_NAME() {
        return (typeof window.ENV !== 'undefined' && window.ENV.APP_NAME) ?
            window.ENV.APP_NAME : 'Ma Galerie';
    },

    get IS_SECURE() {
        return typeof window.ENV !== 'undefined' &&
            window.ENV.ADMIN_USERNAME &&
            window.ENV.ADMIN_USERNAME !== 'admin';
    }
};

function verifyCredentials(username, password) {
    try {
        const isValid = username === ADMIN_CONFIG.USERNAME && password === ADMIN_CONFIG.PASSWORD;

        if (!ADMIN_CONFIG.IS_SECURE && isValid) {
            console.warn('🚨 Mode démo - Identifiants par défaut utilisés');
        }

        return isValid;
    } catch (error) {
        console.error('Erreur de configuration:', error.message);
        return false;
    }
}

function createSession() {
    const sessionData = {
        authenticated: true,
        timestamp: Date.now(),
        expires: Date.now() + (ADMIN_CONFIG.SESSION_DURATION * 60 * 1000),
        secure: ADMIN_CONFIG.IS_SECURE
    };

    localStorage.setItem(ADMIN_CONFIG.AUTH_KEY, JSON.stringify(sessionData));
    return sessionData;
}

function isSessionValid() {
    try {
        const sessionData = JSON.parse(localStorage.getItem(ADMIN_CONFIG.AUTH_KEY));

        if (!sessionData || !sessionData.authenticated) {
            return false;
        }

        if (Date.now() > sessionData.expires) {
            destroySession();
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
}

function destroySession() {
    localStorage.removeItem(ADMIN_CONFIG.AUTH_KEY);
}

function extendSession() {
    if (isSessionValid()) {
        createSession();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (ADMIN_CONFIG.IS_SECURE) {
            console.log('🔒 Configuration sécurisée chargée');
        } else {
            console.warn('⚠️ Mode démo - Identifiants: admin / gallery2024');

            const demoIndicator = document.createElement('div');
            demoIndicator.style.cssText = `
                position: fixed;
                top: 10px;
                left: 10px;
                background: rgba(255, 193, 7, 0.9);
                color: #856404;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                z-index: 9999;
                backdrop-filter: blur(5px);
            `;
            demoIndicator.textContent = '⚠️ MODE DÉMO';
            document.body.appendChild(demoIndicator);
        }
    }, 100);
});