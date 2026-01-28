// 1. Initialisation sécurisée (on utilise un nom de variable unique)
const CONFIG_URL = 'https://lcbwehiwjowgthazrydy.supabase.co';
const CONFIG_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjYndlaGl3am93Z3RoYXpyeWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNTg4NjIsImV4cCI6MjA4NDkzNDg2Mn0.2nP42Uh262Jt-1stolzSVM8_EEzrAdCutKgd7B2MurY';

// Création du client avec désactivation du stockage local pour éviter les blocages navigateurs
const glowClient = window.supabase.createClient(CONFIG_URL, CONFIG_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});

// Variable pour savoir si on est en mode Connexion ou Inscription
let estEnModeInscription = false;

// 2. Gestionnaire principal d'authentification
async function gererAuth() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;

    // Vérification de base
    if (!email || !password) {
        alert("⚠️ Erreur : Remplis bien l'email et le mot de passe !");
        return;
    }

    if (password.length < 6) {
        alert("⚠️ Sécurité : Le mot de passe doit faire au moins 6 caractères !");
        return;
    }

    try {
        if (estEnModeInscription) {
            // --- TENTATIVE D'INSCRIPTION ---
            console.log("Démarrage de l'inscription pour:", email);
            const { data, error } = await glowClient.auth.signUp({
                email: email,
                password: password
            });

            if (error) {
                alert("❌ Erreur d'inscription : " + error.message);
            } else {
                alert("✨ SUCCÈS ! Ton compte est créé. \n\nIMPORTANT : Supabase envoie un mail de confirmation. Vérifie tes courriers indésirables (spams) et clique sur le lien pour valider !");
                basculerAffichage(); // On repasse en mode connexion
            }
        } else {
            // --- TENTATIVE DE CONNEXION ---
            console.log("Démarrage de la connexion pour:", email);
            const { data, error } = await glowClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                alert("❌ Erreur de connexion : " + error.message);
            } else {
                alert("✅ Te voilà connecté ! Bienvenue.");
                // Changement d'écran
                document.getElementById('auth-screen').style.display = 'none';
                document.getElementById('dashboard-screen').style.display = 'block';
            }
        }
    } catch (e) {
        alert("🚨 Bug critique : " + e.message);
        console.error(e);
    }
}

// 3. Fonction pour changer de mode (Connexion <-> Inscription)
function basculerAffichage() {
    estEnModeInscription = !estEnModeInscription;
    
    const titre = document.getElementById('auth-title');
    const bouton = document.getElementById('auth-submit');
    const lien = document.getElementById('auth-switch');

    if (estEnModeInscription) {
        titre.innerText = "Créer un compte";
        bouton.innerText = "S'inscrire ✨";
        lien.innerText = "Déjà un compte ? Se connecter";
    } else {
        titre.innerText = "Connexion";
        bouton.innerText = "Se connecter 🚀";
        lien.innerText = "Pas de compte ? Créer un compte";
    }
}

// 4. Initialisation au chargement de la page
window.addEventListener('DOMContentLoaded', () => {
    console.log("Glow Up Academy prête !");
    
    // On lie le bouton principal
    const mainBtn = document.getElementById('auth-submit');
    if (mainBtn) {
        mainBtn.onclick = gererAuth;
    }

    // On lie le lien de bascule
    const switchLien = document.getElementById('auth-switch');
    if (switchLien) {
        switchLien.onclick = (event) => {
            event.preventDefault();
            basculerAffichage();
        };
    }
});
// Fonction pour lancer une mission
function lancerQuete(nom) {
    alert("🚀 Lancement de la quête : " + nom + "\nPrépare-toi, ça commence !");
    // Ici on pourra ajouter le vrai mini-jeu plus tard
}

// Dans ta fonction de connexion réussie, ajoute ça pour afficher l'email :
// document.getElementById('display-email').innerText = email;
