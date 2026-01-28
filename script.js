// On attend que la page soit totalement chargée
window.onload = function() {
    console.log("Application prête !");
    initApp();
};

let glowClient;

function initApp() {
    const URL = 'https://lcbwehiwjowgthazrydy.supabase.co';
    const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjYndlaGl3am93Z3RoYXpyeWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNTg4NjIsImV4cCI6MjA4NDkzNDg2Mn0.2nP42Uh262Jt-1stolzSVM8_EEzrAdCutKgd7B2MurY';

    // Initialisation sécurisée
    try {
        glowClient = window.supabase.createClient(URL, KEY, {
            auth: { persistSession: false } // On désactive la persistance pour éviter le blocage navigateur
        });
        console.log("Supabase connecté !");
    } catch (e) {
        console.error("Erreur connexion :", e);
    }

    // On attache les événements aux boutons manuellement pour être sûr
    const btnSubmit = document.getElementById('auth-submit');
    if(btnSubmit) {
        btnSubmit.onclick = handleAuth;
    }

    const btnSwitch = document.getElementById('auth-switch');
    if(btnSwitch) {
        btnSwitch.onclick = function(e) {
            e.preventDefault();
            toggleAuthMode();
        };
    }
}

// Variables d'état
let isSignUpMode = false;

function toggleAuthMode() {
    isSignUpMode = !isSignUpMode;
    document.getElementById('auth-title').textContent = isSignUpMode ? 'Créer un compte' : 'Connexion';
    document.getElementById('auth-submit').textContent = isSignUpMode ? "S'inscrire" : 'Se connecter';
    document.getElementById('auth-switch').textContent = isSignUpMode ? 'Se connecter' : 'Créer un compte';
}

async function handleAuth() {
    console.log("Tentative d'authentification...");
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    if (!email || !password) {
        alert("Remplis tous les champs !");
        return;
    }

    try {
        let result;
        if (isSignUpMode) {
            result = await glowClient.auth.signUp({ email, password });
            if (!result.error) alert("Compte créé ! Tu peux te connecter.");
        } else {
            result = await glowClient.auth.signInWithPassword({ email, password });
        }

        if (result.error) throw result.error;
        
        if (result.data.user) {
            alert("Succès ! Bienvenue.");
            location.reload(); // On recharge pour entrer dans le dashboard
        }
    } catch (err) {
        alert("Erreur : " + err.message);
    }
}
