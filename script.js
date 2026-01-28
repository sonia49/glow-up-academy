// On définit les clés en haut
const SB_URL = 'https://lcbwehiwjowgthazrydy.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjYndlaGl3am93Z3RoYXpyeWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNTg4NjIsImV4cCI6MjA4NDkzNDg2Mn0.2nP42Uh262Jt-1stolzSVM8_EEzrAdCutKgd7B2MurY';

// Initialisation ultra-simple
const supabase = window.supabase.createClient(SB_URL, SB_KEY, {
    auth: {
        persistSession: false, // INDISPENSABLE pour éviter le blocage "Tracking Prevention"
        autoRefreshToken: false
    }
});

// Attendre que le HTML soit prêt
document.addEventListener('DOMContentLoaded', () => {
    console.log("Le site est prêt !");
    
    const btnSubmit = document.getElementById('auth-submit');
    const btnSwitch = document.getElementById('auth-switch');

    if (btnSubmit) {
        btnSubmit.onclick = async () => {
            const email = document.getElementById('auth-email').value;
            const pass = document.getElementById('auth-password').value;
            
            alert("Bouton cliqué ! Tentative pour : " + email);

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: pass,
            });

            if (error) {
                alert("Erreur Supabase : " + error.message);
            } else {
                alert("BRAVO ! Connexion réussie ! ✨");
                document.getElementById('auth-screen').classList.remove('active');
                document.getElementById('dashboard-screen').classList.add('active');
            }
        };
    }
});
