const URL = 'https://lcbwehiwjowgthazrydy.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjYndlaGl3am93Z3RoYXpyeWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNTg4NjIsImV4cCI6MjA4NDkzNDg2Mn0.2nP42Uh262Jt-1stolzSVM8_EEzrAdCutKgd7B2MurY';

const supabase = window.supabase.createClient(URL, KEY, {
    auth: { persistSession: false }
});

let isSignUp = false;

document.getElementById('auth-submit').onclick = async () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    if(isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if(error) document.getElementById('auth-error').innerText = error.message;
        else alert("Compte créé !");
    } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if(error) document.getElementById('auth-error').innerText = error.message;
        else {
            document.getElementById('auth-screen').classList.remove('active');
            document.getElementById('dashboard-screen').classList.add('active');
        }
    }
};

document.getElementById('auth-switch').onclick = (e) => {
    e.preventDefault();
    isSignUp = !isSignUp;
    document.getElementById('auth-submit').innerText = isSignUp ? "S'inscrire" : "Se connecter";
};

function startQuest(type) {
    alert("Bientôt disponible : Quête de " + type);
}
