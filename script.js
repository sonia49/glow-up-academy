// --- 1. CONFIGURATION ---
const URL_PROJET = "https://lcbwehiwjowgthazrydy.supabase.co"; 
const CLE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjYndlaGl3am93Z3RoYXpyeWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNTg4NjIsImV4cCI6MjA4NDkzNDg2Mn0.2nP42Uh262Jt-1stolzSVM8_EEzrAdCutKgd7B2MurY";

// On utilise 'var' et un nom unique pour éviter l'erreur "already declared"
var mySupabase = window.supabase.createClient(URL_PROJET, CLE_ANON);

// --- 2. FONCTIONS DE CONNEXION ---

async function handleSignUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    const { data, error } = await mySupabase.auth.signUp({
        email: email,
        password: password,
    });

    if (error) {
        alert("Erreur : " + error.message);
    } else {
        alert("Inscription réussie !");
        if (data.user) {
            await mySupabase.from('profiles').upsert([
                { id: data.user.id, diamonds: 50, theme: 'pink' }
            ]);
        }
    }
}

async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await mySupabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert("Échec : " + error.message);
    } else {
        checkUser(); 
    }
}

// --- 3. THÈMES ET ACCESSIBILITÉ ---

async function changeTheme(color) {
    if (color === 'blue') {
        document.body.classList.add('blue-theme');
    } else {
        document.body.classList.remove('blue-theme');
    }

    const { data: { user } } = await mySupabase.auth.getUser();
    if (user) {
        await mySupabase.from('profiles').update({ theme: color }).eq('id', user.id);
    }
}

function toggleDys() {
    document.body.classList.toggle('dys-mode');
}

// --- 4. VÉRIFICATION DE SESSION ---

async function checkUser() {
    const { data: { user } } = await mySupabase.auth.getUser();
    
    const authDiv = document.getElementById('auth-container');
    const appDiv = document.getElementById('app-container');

    if (user) {
        if (authDiv) authDiv.style.display = 'none';
        if (appDiv) appDiv.style.display = 'block';
        
        const { data: profile } = await mySupabase
            .from('profiles')
            .select('theme')
            .eq('id', user.id)
            .single();
            
        if (profile && profile.theme) {
            changeTheme(profile.theme);
        }
    }
}

window.onload = checkUser;
