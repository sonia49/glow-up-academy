// On change le nom de la variable pour éviter l'erreur "Already declared"
const monAppGlow = window.supabase.createClient(
    'https://lcbwehiwjowgthazrydy.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjYndlaGl3am93Z3RoYXpyeWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNTg4NjIsImV4cCI6MjA4NDkzNDg2Mn0.2nP42Uh262Jt-1stolzSVM8_EEzrAdCutKgd7B2MurY',
    { auth: { persistSession: false } } // Anti-blocage navigateur
);

let modeInscription = false;

// Cette fonction s'exécute quand on clique sur le bouton principal
async function lancerAuthentification() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    alert("Bouton cliqué ! Mode : " + (modeInscription ? "Inscription" : "Connexion"));

    if (!email || !password) {
        alert("Attention : Remplis tous les champs !");
        return;
    }

    try {
        if (modeInscription) {
            const { data, error } = await monAppGlow.auth.signUp({ email, password });
            if (error) throw error;
            alert("Compte créé avec succès ! Tu peux maintenant te connecter.");
            basculerMode();
        } else {
            const { data, error } = await monAppGlow.auth.signInWithPassword({ email, password });
            if (error) throw error;
            alert("Connexion réussie ! Bienvenue.");
            document.getElementById('auth-screen').style.display = 'none';
            document.getElementById('dashboard-screen').classList.add('active');
            document.getElementById('dashboard-screen').style.display = 'block';
        }
    } catch (err) {
        alert("Erreur Supabase : " + err.message);
    }
}

// Cette fonction change l'affichage entre Connexion et Inscription
function basculerMode() {
    modeInscription = !modeInscription;
    const titre = document.getElementById('auth-title');
    const bouton = document.getElementById('auth-submit');
    const lien = document.getElementById('auth-switch');

    if (modeInscription) {
        titre.innerText = "Créer un compte";
        bouton.innerText = "S'inscrire ✨";
        lien.innerText = "Déjà un compte ? Se connecter";
    } else {
        titre.innerText = "Connexion";
        bouton.innerText = "Se connecter 🚀";
        lien.innerText = "Pas de compte ? Créer un compte";
    }
}

// On lie les fonctions aux boutons une fois que la page est chargée
window.onload = () => {
    console.log("Application chargée !");
    document.getElementById('auth-submit').onclick = lancerAuthentification;
    document.getElementById('auth-switch').onclick = (e) => {
        e.preventDefault();
        basculerMode();
    };
};
