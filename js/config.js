const ADMIN_CONFIG = {
    get USERNAME() {
        if (typeof window.ENV === 'undefined') {
            console.error('❌ Fichier .env.js manquant ! Copiez .env.example.js vers .env.js');
            throw new Error('Configuration manquante');
        }
        return window.ENV.ADMIN_USERNAME;
    },

    get PASSWORD() {
        if (typeof window.ENV === 'undefined') {
            console.error('❌ Fichier .env.js manquant ! Copiez .env.example.js vers .env.js');
            throw new Error('Configuration manquante');
        }
        return window.ENV.ADMIN_PASSWORD;
    },

    get SESSION_DURATION() {
        return window.ENV?.SESSION_DURATION_MINUTES || 60;
    },

    AUTH_KEY: 'gallery_admin_auth',

    get APP_NAME() {
        return window.ENV?.APP_NAME || 'Ma Galerie';
    }
};

function verifyCredentials(username, password) {
    try {
        return username === ADMIN_CONFIG.USERNAME && password === ADMIN_CONFIG.PASSWORD;
    } catch (error) {
        console.error('Erreur de configuration:', error.message);
        return false;
    }
}

function createSession() {
    const sessionData = {
        authenticated: true,
        timestamp: Date.now(),
        expires: Date.now() + (ADMIN_CONFIG.SESSION_DURATION * 60 * 1000)
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
    if (typeof window.ENV === 'undefined') {
        console.warn('⚠️ Variables d\'environnement non chargées');
    } else if (window.ENV.DEBUG_MODE) {
        console.log('🔧 Configuration chargée en mode debug');
    }
});