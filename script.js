// --- 1. CONFIGURATION ---
const URL_PROJET = "https://lcbwehiwjowgthazrydy.supabase.co"; 
const CLE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjYndlaGl3am93Z3RoYXpyeWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNTg4NjIsImV4cCI6MjA4NDkzNDg2Mn0.2nP42Uh262Jt-1stolzSVM8_EEzrAdCutKgd7B2MurY";

// On crée le client avec un nom unique pour éviter les erreurs de doublons
const myApp = window.supabase.createClient(URL_PROJET, CLE_ANON);

// --- 2. CONNEXION ET INSCRIPTION ---

async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await myApp.auth.signInWithPassword({ email, password });

    if (error) {
        alert("Erreur : " + error.message);
    } else {
        checkUser(); 
    }
}

async function handleSignUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await myApp.auth.signUp({ email, password });

    if (error) {
        alert("Erreur : " + error.message);
    } else {
        alert("Inscription réussie !");
    }
}

async function handleLogout() {
    await myApp.auth.signOut();
    location.reload(); // Recharge la page proprement
}

// --- 3. GESTION DES THÈMES ---

function changeTheme(color) {
    if (color === 'blue') {
        document.body.classList.add('blue-theme');
    } else {
        document.body.classList.remove('blue-theme');
    }
}

function toggleDys() {
    document.body.classList.toggle('dys-mode');
}

// --- 4. VÉRIFICATION AUTOMATIQUE ---

async function checkUser() {
    const { data: { user } } = await myApp.auth.getUser();
    
    const authDiv = document.getElementById('auth-container');
    const appDiv = document.getElementById('app-container');

    if (user) {
        // Utilisateur connecté : on montre le jeu
        if (authDiv) authDiv.style.display = 'none';
        if (appDiv) appDiv.style.display = 'block';
    } else {
        // Utilisateur déconnecté : on montre le login
        if (authDiv) authDiv.style.display = 'block';
        if (appDiv) appDiv.style.display = 'none';
    }
}

// Lancer la vérification dès que la page s'affiche
window.onload = checkUser;
