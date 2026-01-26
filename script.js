// --- CONFIGURATION ---
const SUPABASE_URL = "TON_URL_ICI";
const SUPABASE_KEY = "TA_CLE_ANON_ICI";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- FONCTIONS DE CONNEXION ---

async function handleSignUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
    });

    if (error) {
        alert("Erreur d'inscription : " + error.message);
    } else {
        alert("Succès ! Tu peux maintenant te connecter.");
        // Création du profil par défaut dans la table
        if (data.user) {
            await supabase.from('profiles').insert([
                { id: data.user.id, diamonds: 50, theme: 'pink' }
            ]);
        }
    }
}

async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert("Erreur de connexion : " + error.message);
    } else {
        alert("Bienvenue !");
        checkUser(); // Lance le chargement du jeu
    }
}

// --- FONCTIONS DE PERSONNALISATION ---

async function changeTheme(color) {
    const body = document.body;
    if (color === 'blue') {
        body.classList.add('blue-theme');
    } else {
        body.classList.remove('blue-theme');
    }

    // Sauvegarde du choix sur Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        await supabase.from('profiles').update({ theme: color }).eq('id', user.id);
    }
}

function toggleDys() {
    document.body.classList.toggle('dys-mode');
}

// --- VÉRIFICATION AU DÉMARRAGE ---

async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        // Cacher le login, montrer le jeu
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        
        // Charger le thème préféré de l'utilisateur
        const { data: profile } = await supabase.from('profiles').select('theme').eq('id', user.id).single();
        if (profile && profile.theme) {
            changeTheme(profile.theme);
        }
    }
}

// On vérifie si l'utilisateur est déjà connecté quand on ouvre la page
window.onload = checkUser;
