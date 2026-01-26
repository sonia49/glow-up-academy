// --- 1. CONFIGURATION ---
const URL_PROJET = "https://lcbwehiwjowgthazrydy.supabase.co"; 
const CLE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjYndlaGl3am93Z3RoYXpyeWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNTg4NjIsImV4cCI6MjA4NDkzNDg2Mn0.2nP42Uh262Jt-1stolzSVM8_EEzrAdCutKgd7B2MurY";

// Protection contre les erreurs de double déclaration
if (typeof supabaseClient === 'undefined') {
    var supabaseClient = window.supabase.createClient(URL_PROJET, CLE_ANON);
}

// --- 2. FONCTIONS DE CONNEXION ---

async function handleSignUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert("Oups ! Il manque l'email ou le mot de passe.");
        return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
    });

    if (error) {
        alert("Erreur : " + error.message);
    } else {
        alert("Compte créé avec succès !");
        // Création auto du profil avec 50 diamants
        if (data.user) {
            await supabaseClient.from('profiles').upsert([
                { id: data.user.id, diamonds: 50, theme: 'pink' }
            ]);
        }
    }
}

async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert("Connexion échouée : " + error.message);
    } else {
        checkUser(); 
    }
}

// --- 3. PERSONNALISATION (Rose, Bleu, DYS) ---

async function changeTheme(color) {
    const body = document.body;
    if (color === 'blue') {
        body.classList.add('blue-theme');
    } else {
        body.classList.remove('blue-theme');
    }

    // Sauvegarde du thème pour ce profil
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) {
        await supabaseClient.from('profiles').update({ theme: color }).eq('id', user.id);
    }
}

function toggleDys() {
    document.body.classList.toggle('dys-mode');
}

// --- 4. GESTION DE L'AFFICHAGE ---

async function checkUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');

    if (user) {
        if (authContainer) authContainer.style.display = 'none';
        if (appContainer) appContainer.style.display = 'block';
        
        // Charger le thème depuis Supabase
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('theme')
            .eq('id', user.id)
            .single();
            
        if (profile && profile.theme) {
            changeTheme(profile.theme);
        }
    }
}

// Vérification automatique quand on arrive sur le site
window.onload = checkUser;
