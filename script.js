// ========== Configuration Supabase ==========
const SUPABASE_URL = 'https://lcbwehiwjowgthazrydy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjYndlaGl3am93Z3RoYXpyeWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNTg4NjIsImV4cCI6MjA4NDkzNDg2Mn0.2nP42Uh262Jt-1stolzSVM8_EEzrAdCutKgd7B2MurY';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ========== État Global ==========
let currentUser = null;
let currentProfile = null;
let isSignUp = false;
let currentExercise = null;

// ========== Banque d'Exercices ==========
const exerciseBank = {
    french: [
        {
            question: "Quelle est la bonne orthographe ?",
            options: ["Cheval", "Cheval", "Chevale", "Chevaux"],
            correct: 0
        },
        {
            question: "Trouve le verbe conjugué correctement:",
            options: ["Je mange", "Je manger", "Je manges", "Je mangez"],
            correct: 0
        },
        {
            question: "Quel mot est bien écrit ?",
            options: ["Papillon", "Papion", "Papilion", "Papyion"],
            correct: 0
        },
        {
            question: "Complète : Il ___ à l'école",
            options: ["va", "vas", "vat", "vais"],
            correct: 0
        },
        {
            question: "Pluriel de 'journal' ?",
            options: ["journaux", "journals", "journales", "journeaux"],
            correct: 0
        }
    ],
    math: [
        {
            question: "7 + 5 = ?",
            type: "input",
            correct: "12"
        },
        {
            question: "15 - 8 = ?",
            type: "input",
            correct: "7"
        },
        {
            question: "6 × 3 = ?",
            type: "input",
            correct: "18"
        },
        {
            question: "20 ÷ 4 = ?",
            type: "input",
            correct: "5"
        },
        {
            question: "9 + 9 = ?",
            type: "input",
            correct: "18"
        }
    ],
    logic: [
        {
            question: "Si tous les chats ont 4 pattes et Minou est un chat, combien de pattes a Minou ?",
            options: ["2", "4", "6", "8"],
            correct: 1
        },
        {
            question: "Quelle forme vient ensuite ? ⭐🌙⭐🌙⭐...",
            options: ["⭐", "🌙", "☀️", "🌟"],
            correct: 1
        },
        {
            question: "Dans une course, tu dépasses le 2ème. En quelle position es-tu ?",
            options: ["1er", "2ème", "3ème", "Dernier"],
            correct: 1
        },
        {
            question: "Quel nombre vient ensuite ? 2, 4, 6, 8...",
            options: ["9", "10", "11", "12"],
            correct: 1
        },
        {
            question: "Si tu as 3 pommes et tu en donnes 1, combien t'en reste-t-il ?",
            options: ["1", "2", "3", "4"],
            correct: 1
        }
    ]
};

// ========== Avatars Boutique ==========
const shopAvatars = [
    { id: 'default', name: 'Avatar Classique', price: 0, seed: 'default', owned: true },
    { id: 'robot', name: 'Robot Spatial', price: 50, seed: 'robot123', owned: false },
    { id: 'unicorn', name: 'Licorne Magique', price: 100, seed: 'unicorn456', owned: false },
    { id: 'ninja', name: 'Ninja Furtif', price: 150, seed: 'ninja789', owned: false },
    { id: 'dragon', name: 'Dragon de Feu', price: 200, seed: 'dragon321', owned: false },
    { id: 'wizard', name: 'Sorcier Mystique', price: 250, seed: 'wizard654', owned: false }
];

// ========== Initialisation ==========
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    setupAuthListeners();
    setupNavigation();
    setupSettings();
    loadTheme();
    loadDysMode();
});

// ========== Authentification ==========
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        await loadProfile();
        showDashboard();
    } else {
        showAuth();
    }
}

function setupAuthListeners() {
    const submitBtn = document.getElementById('auth-submit');
    const switchBtn = document.getElementById('auth-switch');
    
    submitBtn.addEventListener('click', handleAuth);
    switchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthMode();
    });
    
    // Enter key sur les inputs
    document.querySelectorAll('#auth-email, #auth-password').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAuth();
        });
    });
}

function toggleAuthMode() {
    isSignUp = !isSignUp;
    const title = document.getElementById('auth-title');
    const submitBtn = document.getElementById('auth-submit');
    const switchText = document.getElementById('auth-switch-text');
    const switchBtn = document.getElementById('auth-switch');
    
    if (isSignUp) {
        title.textContent = 'Créer un compte';
        submitBtn.textContent = "S'inscrire";
        switchText.textContent = 'Déjà un compte ?';
        switchBtn.textContent = 'Se connecter';
    } else {
        title.textContent = 'Connexion';
        submitBtn.textContent = 'Se connecter';
        switchText.textContent = 'Pas encore de compte ?';
        switchBtn.textContent = 'Créer un compte';
    }
    
    document.getElementById('auth-error').textContent = '';
}

async function handleAuth() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const errorEl = document.getElementById('auth-error');
    
    if (!email || !password) {
        errorEl.textContent = 'Remplis tous les champs !';
        return;
    }
    
    try {
        if (isSignUp) {
            const { data, error } = await supabase.auth.signUp({ email, password });
            
            if (error) throw error;
            
            if (data.user) {
                // Créer le profil
                await createProfile(data.user.id, email);
                currentUser = data.user;
                await loadProfile();
                showDashboard();
            }
        } else {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            
            if (error) throw error;
            
            currentUser = data.user;
            await loadProfile();
            showDashboard();
        }
    } catch (error) {
        errorEl.textContent = error.message || 'Erreur de connexion';
    }
}

async function createProfile(userId, email) {
    const { error } = await supabase
        .from('profiles')
        .insert({
            id: userId,
            email: email,
            diamonds: 100,
            level: 1,
            theme: 'pink',
            avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=default',
            quests_completed: 0
        });
    
    if (error) console.error('Erreur création profil:', error);
}

async function loadProfile() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
    
    if (error) {
        console.error('Erreur chargement profil:', error);
        return;
    }
    
    currentProfile = data;
    updateUI();
    loadShop();
}

async function updateProfile(updates) {
    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', currentUser.id);
    
    if (error) {
        console.error('Erreur mise à jour profil:', error);
        return false;
    }
    
    currentProfile = { ...currentProfile, ...updates };
    updateUI();
    return true;
}

function updateUI() {
    if (!currentProfile) return;
    
    // Header
    document.getElementById('player-name').textContent = currentProfile.email?.split('@')[0] || 'Joueur';
    document.getElementById('player-level').textContent = currentProfile.level;
    document.getElementById('player-diamonds').textContent = currentProfile.diamonds;
    document.getElementById('player-avatar').src = currentProfile.avatar_url;
    
    // Page profil
    document.getElementById('profile-level').textContent = currentProfile.level;
    document.getElementById('profile-diamonds').textContent = currentProfile.diamonds;
    document.getElementById('profile-avatar').src = currentProfile.avatar_url;
    document.getElementById('quests-completed').textContent = currentProfile.quests_completed || 0;
    
    // Thème
    if (currentProfile.theme) {
        document.body.setAttribute('data-theme', currentProfile.theme);
    }
}

async function logout() {
    await supabase.auth.signOut();
    currentUser = null;
    currentProfile = null;
    showAuth();
}

function showAuth() {
    document.getElementById('auth-screen').classList.add('active');
    document.getElementById('dashboard-screen').classList.remove('active');
}

function showDashboard() {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('dashboard-screen').classList.add('active');
}

// ========== Navigation ==========
function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            navigateTo(page);
        });
    });
    
    // Déconnexion
    document.getElementById('logout-btn').addEventListener('click', logout);
}

function navigateTo(pageName) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === pageName) {
            btn.classList.add('active');
        }
    });
    
    // Update pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`${pageName}-page`).classList.add('active');
}

// ========== Exercices ==========
function startQuest(type) {
    const exercises = exerciseBank[type];
    const randomExercise = exercises[Math.floor(Math.random() * exercises.length)];
    
    currentExercise = {
        type: type,
        data: randomExercise
    };
    
    showExercise();
}

function showExercise() {
    const modal = document.getElementById('exercise-modal');
    const title = document.getElementById('exercise-title');
    const content = document.getElementById('exercise-content');
    const buttons = document.getElementById('exercise-buttons');
    const feedback = document.getElementById('exercise-feedback');
    
    feedback.textContent = '';
    feedback.className = 'feedback';
    
    const typeEmojis = {
        french: '📚',
        math: '🔢',
        logic: '🧩'
    };
    
    const typeNames = {
        french: 'Français',
        math: 'Maths',
        logic: 'Logique'
    };
    
    title.textContent = `${typeEmojis[currentExercise.type]} ${typeNames[currentExercise.type]}`;
    
    // Construire l'exercice
    if (currentExercise.data.type === 'input') {
        content.innerHTML = `
            <div class="exercise-question">${currentExercise.data.question}</div>
            <input type="text" id="exercise-answer" class="exercise-input" placeholder="Ta réponse...">
        `;
        
        buttons.innerHTML = `
            <button class="btn btn-primary" onclick="checkInputAnswer()">Valider</button>
        `;
        
        // Enter key
        setTimeout(() => {
            document.getElementById('exercise-answer').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') checkInputAnswer();
            });
        }, 100);
    } else {
        content.innerHTML = `
            <div class="exercise-question">${currentExercise.data.question}</div>
            <div class="exercise-options" id="exercise-options">
                ${currentExercise.data.options.map((option, index) => `
                    <button class="option-btn" onclick="checkAnswer(${index})">${option}</button>
                `).join('')}
            </div>
        `;
        buttons.innerHTML = '';
    }
    
    modal.classList.add('active');
}

function checkAnswer(selectedIndex) {
    const feedback = document.getElementById('exercise-feedback');
    const optionBtns = document.querySelectorAll('.option-btn');
    
    // Désactiver tous les boutons
    optionBtns.forEach(btn => btn.disabled = true);
    
    if (selectedIndex === currentExercise.data.correct) {
        optionBtns[selectedIndex].classList.add('correct');
        feedback.textContent = '🎉 Bravo ! +10 diamants !';
        feedback.className = 'feedback success';
        
        // Ajouter diamants
        const newDiamonds = currentProfile.diamonds + 10;
        const newQuestsCompleted = (currentProfile.quests_completed || 0) + 1;
        const newLevel = Math.floor(newQuestsCompleted / 5) + 1;
        
        updateProfile({
            diamonds: newDiamonds,
            quests_completed: newQuestsCompleted,
            level: newLevel
        });
        
        setTimeout(() => {
            closeExercise();
        }, 2000);
    } else {
        optionBtns[selectedIndex].classList.add('incorrect');
        optionBtns[currentExercise.data.correct].classList.add('correct');
        feedback.textContent = '❌ Raté ! Réessaye une autre quête !';
        feedback.className = 'feedback error';
        
        setTimeout(() => {
            closeExercise();
        }, 3000);
    }
}

function checkInputAnswer() {
    const input = document.getElementById('exercise-answer');
    const answer = input.value.trim();
    const feedback = document.getElementById('exercise-feedback');
    
    if (!answer) {
        feedback.textContent = '⚠️ Entre une réponse !';
        feedback.className = 'feedback error';
        return;
    }
    
    if (answer === currentExercise.data.correct) {
        feedback.textContent = '🎉 Parfait ! +10 diamants !';
        feedback.className = 'feedback success';
        input.disabled = true;
        
        // Ajouter diamants
        const newDiamonds = currentProfile.diamonds + 10;
        const newQuestsCompleted = (currentProfile.quests_completed || 0) + 1;
        const newLevel = Math.floor(newQuestsCompleted / 5) + 1;
        
        updateProfile({
            diamonds: newDiamonds,
            quests_completed: newQuestsCompleted,
            level: newLevel
        });
        
        setTimeout(() => {
            closeExercise();
        }, 2000);
    } else {
        feedback.textContent = `❌ Non, c'était ${currentExercise.data.correct} !`;
        feedback.className = 'feedback error';
        input.disabled = true;
        
        setTimeout(() => {
            closeExercise();
        }, 3000);
    }
}

function closeExercise() {
    document.getElementById('exercise-modal').classList.remove('active');
    currentExercise = null;
}

// ========== Boutique ==========
function loadShop() {
    const shopGrid = document.getElementById('shop-items');
    
    // Récupérer les avatars possédés depuis le profil (si stocké en JSON)
    let ownedAvatars = ['default'];
    if (currentProfile.owned_avatars) {
        try {
            ownedAvatars = JSON.parse(currentProfile.owned_avatars);
        } catch (e) {
            ownedAvatars = ['default'];
        }
    }
    
    shopGrid.innerHTML = shopAvatars.map(avatar => {
        const isOwned = ownedAvatars.includes(avatar.id);
        const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${avatar.seed}`;
        
        return `
            <div class="shop-item ${isOwned ? 'owned' : ''}">
                <img src="${avatarUrl}" alt="${avatar.name}">
                <h4>${avatar.name}</h4>
                <p class="shop-price">💎 ${avatar.price}</p>
                ${isOwned 
                    ? `<button class="btn btn-primary" onclick="equipAvatar('${avatar.id}', '${avatarUrl}')">Équiper</button>`
                    : `<button class="btn btn-shop" onclick="buyAvatar('${avatar.id}', ${avatar.price}, '${avatarUrl}')" ${currentProfile.diamonds < avatar.price ? 'disabled' : ''}>Acheter</button>`
                }
            </div>
        `;
    }).join('');
}

async function buyAvatar(avatarId, price, avatarUrl) {
    if (currentProfile.diamonds < price) {
        alert('❌ Pas assez de diamants !');
        return;
    }
    
    // Récupérer avatars possédés
    let ownedAvatars = ['default'];
    if (currentProfile.owned_avatars) {
        try {
            ownedAvatars = JSON.parse(currentProfile.owned_avatars);
        } catch (e) {
            ownedAvatars = ['default'];
        }
    }
    
    ownedAvatars.push(avatarId);
    
    const success = await updateProfile({
        diamonds: currentProfile.diamonds - price,
        owned_avatars: JSON.stringify(ownedAvatars),
        avatar_url: avatarUrl
    });
    
    if (success) {
        alert('🎉 Avatar acheté et équipé !');
        loadShop();
    }
}

async function equipAvatar(avatarId, avatarUrl) {
    await updateProfile({ avatar_url: avatarUrl });
    alert('✅ Avatar équipé !');
}

// ========== Paramètres ==========
function setupSettings() {
    document.getElementById('settings-btn').addEventListener('click', () => {
        document.getElementById('settings-modal').classList.add('active');
    });
}

function closeSettings() {
    document.getElementById('settings-modal').classList.remove('active');
}

async function changeTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    if (currentProfile) {
        await updateProfile({ theme: theme });
    }
}

function toggleDysMode() {
    const isEnabled = document.getElementById('dys-mode-toggle').checked;
    
    if (isEnabled) {
        document.body.classList.add('dys-mode');
        localStorage.setItem('dys-mode', 'true');
    } else {
        document.body.classList.remove('dys-mode');
        localStorage.setItem('dys-mode', 'false');
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'pink';
    document.body.setAttribute('data-theme', savedTheme);
}

function loadDysMode() {
    const isDysMode = localStorage.getItem('dys-mode') === 'true';
    
    if (isDysMode) {
        document.body.classList.add('dys-mode');
        document.getElementById('dys-mode-toggle').checked = true;
    }
}

// Fermer modal en cliquant en dehors
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});
