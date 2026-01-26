// --- CONFIGURATION ---
const URL_PROJET = "https://lcbwehiwjowgthazrydy.supabase.co"; 
const CLE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjYndlaGl3am93Z3RoYXpyeWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNTg4NjIsImV4cCI6MjA4NDkzNDg2Mn0.2nP42Uh262Jt-1stolzSVM8_EEzrAdCutKgd7B2MurY";

// Initialisation sécurisée
var mySupabase;
try {
    mySupabase = window.supabase.createClient(URL_PROJET, CLE_ANON);
    console.log("Supabase est prêt !");
} catch (e) {
    console.error("Erreur d'initialisation Supabase :", e);
}

// --- FONCTIONS ---

async function handleLogin() {
    console.log("Bouton Connexion cliqué !"); // Si ça s'affiche, c'est que le bouton marche
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await mySupabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert("Erreur : " + error.message);
    } else {
        alert("Connecté !");
        checkUser();
    }
}

async function handleSignUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await mySupabase.auth.signUp({ email, password });

    if (error) alert(error.message);
    else alert("Inscription réussie !");
}

async function checkUser() {
    const { data: { user } } = await mySupabase.auth.getUser();
    if (user) {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
    }
}

window.onload = checkUser;
async function handleLogout() {
    // 1. On demande à Supabase de fermer la session
    const { error } = await mySupabase.auth.signOut();
    
    if (error) {
        alert("Erreur lors de la déconnexion : " + error.message);
    } else {
        // 2. Une fois déconnecté, on force le retour à l'écran de login
        document.getElementById('app-container').style.display = 'none';
        document.getElementById('auth-container').style.display = 'block';
        
        // 3. On vide les champs pour plus de sécurité
        document.getElementById('email').value = "";
        document.getElementById('password').value = "";
        
        alert("Tu as été déconnecté(e). À bientôt ! ✨");
    }
}

