// 1. CONFIGURATION
const SB_URL = "https://lcbwehiwjowgthazrydy.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjYndlaGl3am93Z3RoYXpyeWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNTg4NjIsImV4cCI6MjA4NDkzNDg2Mn0.2nP42Uh262Jt-1stolzSVM8_EEzrAdCutKgd7B2MurY";

// Création du client avec un nom unique pour éviter les conflits
const glowClient = window.supabase.createClient(SB_URL, SB_KEY, {
    auth: { persistSession: false } 
});

// ÉTAT DU JOUEUR
let player = { diamonds: 0, level: 1, avatar: "Lucky" };

// 2. AUTHENTIFICATION
document.getElementById('btn-login').onclick = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    const { data, error } = await glowClient.auth.signInWithPassword({ email, password: pass });
    if (error) alert("Erreur: " + error.message);
    else loginSuccess();
};

document.getElementById('btn-signup').onclick = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    const { data, error } = await glowClient.auth.signUp({ email, password: pass });
    if (error) alert("Erreur: " + error.message);
    else alert("Compte créé ! Tu peux te connecter.");
};

function loginSuccess() {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('dashboard-screen').classList.add('active');
    loadShop(); // On charge la boutique
}

function logout() { location.reload(); }

// 3. SYSTÈME DE JEU
const questions = {
    math: [
        { q: "8 + 7 = ?", a: ["13", "15", "16"], c: 1 },
        { q: "10 - 4 = ?", a: ["5", "6", "7"], c: 1 },
        { q: "5 x 3 = ?", a: ["15", "12", "18"], c: 0 }
    ],
    french: [
        { q: "Comment écrit-on ?", a: ["Bateau", "Bato", "Batô"], c: 0 },
        { q: "Un chat, des...", a: ["Chats", "Chas", "Chatte"], c: 0 }
    ]
};

function startQuest(type) {
    const qData = questions[type][Math.floor(Math.random() * questions[type].length)];
    document.getElementById('q-title').innerText = "Mission " + type;
    document.getElementById('q-text').innerText = qData.q;
    
    const optionsDiv = document.getElementById('q-options');
    optionsDiv.innerHTML = "";
    
    qData.a.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.className = "btn-opt";
        btn.onclick = () => checkAnswer(i, qData.c);
        optionsDiv.appendChild(btn);
    });
    
    document.getElementById('quest-modal').classList.add('active');
}

function checkAnswer(chosen, correct) {
    if (chosen === correct) {
        player.diamonds += 10;
        alert("Bravo ! ✨ +10 diamants !");
        updateUI();
        closeModal();
    } else {
        alert("Oups ! Réessaie encore ! 💪");
    }
}

function updateUI() {
    document.getElementById('diamond-count').innerText = player.diamonds;
    document.getElementById('user-level').innerText = Math.floor(player.diamonds / 50) + 1;
}

function closeModal() { document.getElementById('quest-modal').classList.remove('active'); }

// 4. BOUTIQUE
const avatars = ["Lily", "Panda", "Robot", "Ninja", "Dino"];

function loadShop() {
    const shop = document.getElementById('shop-items');
    shop.innerHTML = "";
    avatars.forEach(name => {
        const div = document.createElement('div');
        div.className = "shop-card";
        div.innerHTML = `
            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${name}" class="shop-img">
            <p>${name}</p>
            <button onclick="changeAvatar('${name}')">Choisir</button>
        `;
        shop.appendChild(div);
    });
}

function changeAvatar(name) {
    player.avatar = name;
    document.getElementById('user-avatar').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`;
    alert("Avatar changé ! Style de pro ! 😎");
}
