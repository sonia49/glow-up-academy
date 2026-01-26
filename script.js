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
            options: ["Cheval", "Chevale", "Chevaux", "Chevale"],
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
    console.log('🚀 Application démarrée');
    checkSession();
    setupAuthListeners();
    setupNavigation();
    setupSettings();
    loadTheme();
    loadDysMode();
});

// ========== Authentification ==========
async function checkSession() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Erreur session:', error);
            showAuth();
            return;
        }
        
        if (session) {
            console.log('✅ Session trouvée:', session.user.email);
            currentUser = session.user;
            await loadProfile();
            showDashboard();
        } else {
            console.log('ℹ️ Aucune session active');
            showAuth();
        }
    } catch (error) {
        console.error('Erreur checkSession:', error);
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
    const submitBtn = document.getElementById('auth-submit');
    
    if (!email || !password) {
        errorEl.textContent = 'Remplis tous les champs !';
        return;
    }
    
    if (password.length < 6) {
        errorEl.textContent = 'Le mot de passe doit avoir au moins 6 caractères';
        return;
    }
    
    // Désactiver le bouton pendant le traitement
    submitBtn.disabled = true;
    submitBtn.textContent = 'Chargement...';
    errorEl.textContent = '';
    
    try {
        if (isSignUp) {
            console.log('📝 Tentative d\'inscription:', email);
            
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        email: email
                    }
                }
            });
            
            if (error) throw error;
            
            console.log('✅ Inscription réussie:', data);
            
            if (data.user) {
                currentUser = data.user;
                
                // Attendre un peu avant de créer le profil
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Créer le profil
                const profileCreated = await createProfile(data.user.id, email);
                
                if (profileCreated) {
                    await loadProfile();
                    errorEl.style.color = '#4ECDC4';
                    errorEl.textContent = '✅ Compte créé ! Connexion...';
                    
                    setTimeout(() => {
                        showDashboard();
                    }, 1000);
                } else {
                    throw new Error('Erreur création profil');
                }
            }
        } else {
            console.log('🔐 Tentative de connexion:', email);
            
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) throw error;
            
            console.log('✅ Connexion réussie:', data);
            
            currentUser = data.user;
            await loadProfile();
            
            errorEl.style.color = '#4ECDC4';
            errorEl.textContent = '✅ Connexion réussie !';
            
            setTimeout(() => {
                showDashboard();
            }, 500);
        }
    } catch (error) {
        console.error('❌ Erreur auth:', error);
        errorEl.style.color = '#FF6B6B';
        
        if (error.message.includes('Invalid login credentials')) {
            errorEl.textContent = '❌ Email ou mot de passe incorrect';
        } else if (error.message.includes('User already registered')) {
            errorEl.textContent = '❌ Cet email est déjà utilisé';
        } else if (error.message.includes('Email not confirmed')) {
            errorEl.textContent = '⚠️ Vérifie ton email pour confirmer ton compte';
        } else {
            errorEl.textContent = `❌ ${error.message}`;
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = isSignUp ? "S'inscrire" : 'Se connecter';
    }
}

async function createProfile(userId, email) {
    try {
        console.log('📝 Création du profil pour:', userId);
        
        const { data, error } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                email: email,
                diamonds: 100,
                level: 1,
                theme: 'pink',
                avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=default',
                quests_completed: 0,
                owned_avatars: '["default"]'
            })
            .select()
            .single();
        
        if (error) {
            console.error('❌ Erreur création profil:', error);
            return false;
        }
        
        console.log('✅ Profil créé:', data);
        currentProfile = data;
        return true;
    } catch (error) {
        console.error('❌ Exception création profil:', error);
        return false;
    }
}

async function loadProfile() {
    try {
        console.log('📂 Chargement du profil...');
        
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        
        if (error) {
            console.error('❌ Erreur chargement profil:', error);
            
            // Si le profil n'existe pas, le créer
            if (error.code === 'PGRST116') {
                console.log('ℹ️ Profil inexistant, création...');
                const created = await createProfile(currentUser.id, currentUser.email);
                if (created) {
                    return await loadProfile();
                }
            }
            return;
        }
        
        console.log('✅ Profil chargé:', data);
        currentProfile = data;
        updateUI();
        loadShop();
    } catch (error) {
        console.error('❌ Exception loadProfile:', error);
    }
}

async function updateProfile(updates) {
    try {
        console.log('💾 Mise à jour profil:', updates);
        
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', currentUser.id)
            .select()
            .single();
        
        if (error) {
            console.error('❌ Erreur mise à jour profil:', error);
            return false;
        }
        
        console.log('✅ Profil mis à jour:', data);
        currentProfile = data;
        updateUI();
        return true;
    } catch (error) {
        console.error('❌ Exception updateProfile:', error);
        return false;
    }
}

function updateUI() {
    if (!currentProfile) {
        console.warn('⚠️ Pas de profil à afficher');
        return;
    }
    
    try {
        // Header
        const playerName = document.getElementById('player-name');
        if (playerName) {
            playerName.textContent = currentProfile.email?.split('@')[0] || 'Joueur';
        }
        
        const playerLevel = document.getElementById('player-level');
        if (playerLevel) {
            playerLevel.textContent = currentProfile.level || 1;
        }
        
        const playerDiamonds = document.getElementById('player-diamonds');
        if (playerDiamonds) {
            playerDiamonds.textContent = currentProfile.diamonds || 0;
        }
        
        const playerAvatar = document.getElementById('player-avatar');
        if (playerAvatar) {
            playerAvatar.src = currentProfile.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=default';
        }
        
        // Page profil
        const profileLevel = document.getElementById('profile-level');
        if (profileLevel) {
            profileLevel.textContent = currentProfile.level || 1;
        }
        
        const profileDiamonds = document.getElementById('profile-diamonds');
        if (profileDiamonds) {
            profileDiamonds.textContent = currentProfile.diamonds || 0;
        }
        
        const profileAvatar = document.getElementById('profile-avatar');
        if (profileAvatar) {
            profileAvatar.src = currentProfile.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=default';
        }
        
        const questsCompleted = document.getElementById('quests-completed');
        if (questsCompleted) {
            questsCompleted.textContent = currentProfile.quests_completed || 0;
        }
        
        // Thème
        if (currentProfile.theme) {
            document.body.setAttribute('data-theme', currentProfile.theme);
        }
        
        console.log('✅ UI mise à jour');
    } catch (error) {
        console.error('❌ Erreur updateUI:', error);
    }
}

async function logout() {
    console.log('👋 Déconnexion...');
    await supabase.auth.signOut();
    currentUser = null;
    currentProfile = null;
    showAuth();
}

function showAuth() {
    document.getElementById('auth-screen').classList.add('active');
    document.getElementById('dashboard-screen').classList.remove('active');
    document.getElementById('auth-email').value = '';
    document.getElementById('auth-password').value = '';
    document.getElementById('auth-error').textContent = '';
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
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
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
    
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
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
            const answerInput = document.getElementById('exercise-answer');
            if (answerInput) {
                answerInput.focus();
                answerInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') checkInputAnswer();
                });
            }
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
    const modal = document.getElementById('exercise-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    currentExercise = null;
}

// ========== Boutique ==========
function loadShop() {
    const shopGrid = document.getElementById('shop-items');
    if (!shopGrid || !currentProfile) return;
    
    // Récupérer les avatars possédés depuis le profil
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
    const success = await updateProfile({ avatar_url: avatarUrl });
    if (success) {
        alert('✅ Avatar équipé !');
    }
}

// ========== Paramètres ==========
function setupSettings() {
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            const modal = document.getElementById('settings-modal');
            if (modal) {
                modal.classList.add('active');
            }
        });
    }
}

function closeSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

async function changeTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    if (currentProfile) {
        await updateProfile({ theme: theme });
    }
}

function toggleDysMode() {
    const toggle = document.getElementById('dys-mode-toggle');
    if (!toggle) return;
    
    const isEnabled = toggle.checked;
    
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
        const toggle = document.getElementById('dys-mode-toggle');
        if (toggle) {
            toggle.checked = true;
        }
    }
}

// Fermer modal en cliquant en dehors
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});
