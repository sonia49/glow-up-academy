// ========== ÉTAT DU JEU ==========
let currentExerciseData = null;

// ========== GESTION DES QUÊTES ==========
function startQuest(type) {
    const modal = document.getElementById('exercise-modal');
    const title = document.getElementById('exercise-title');
    const content = document.getElementById('exercise-content');
    const buttons = document.getElementById('exercise-buttons');
    const feedback = document.getElementById('exercise-feedback');

    feedback.className = 'feedback';
    feedback.textContent = '';
    buttons.innerHTML = '';
    modal.classList.add('active');

    // Sélection de l'exercice
    let exercise;
    if (type === 'math') {
        exercise = generateMathExercise();
    } else {
        const bank = exerciseBank[type];
        exercise = bank[Math.floor(Math.random() * bank.length)];
    }
    currentExerciseData = exercise;

    title.textContent = `Mission : ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    content.innerHTML = `<p class="exercise-question">${exercise.question}</p>`;

    if (exercise.type === 'input') {
        content.innerHTML += `<input type="number" id="math-answer" class="exercise-input" placeholder="Ta réponse...">`;
        buttons.innerHTML = `<button class="btn btn-primary" onclick="checkInputAnswer()">Valider</button>`;
    } else {
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'exercise-options';
        exercise.options.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.onclick = () => checkOptionAnswer(index, btn);
            optionsDiv.appendChild(btn);
        });
        content.appendChild(optionsDiv);
    }
}

// Générateur de maths aléatoire
function generateMathExercise() {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    return {
        question: `${num1} + ${num2} = ?`,
        type: 'input',
        correct: (num1 + num2).toString()
    };
}

// ========== VÉRIFICATION ==========
async function checkOptionAnswer(index, btn) {
    const feedback = document.getElementById('exercise-feedback');
    if (index === currentExerciseData.correct) {
        btn.classList.add('correct');
        winReward();
    } else {
        btn.classList.add('incorrect');
        feedback.textContent = "Oups ! Essaie encore ! ✨";
        feedback.className = "feedback error";
    }
}

async function checkInputAnswer() {
    const val = document.getElementById('math-answer').value;
    if (val === currentExerciseData.correct) {
        winReward();
    } else {
        const feedback = document.getElementById('exercise-feedback');
        feedback.textContent = "Pas tout à fait... Réfléchis encore ! 💡";
        feedback.className = "feedback error";
    }
}

async function winReward() {
    const feedback = document.getElementById('exercise-feedback');
    feedback.textContent = "BRAVO ! +10 Diamants ! 💎";
    feedback.className = "feedback success";
    
    // Mise à jour base de données
    const newDiamonds = currentProfile.diamonds + 10;
    const newQuests = (currentProfile.quests_completed || 0) + 1;
    
    // Monter de niveau tous les 5 exercices
    const newLevel = Math.floor(newQuests / 5) + 1;

    await updateProfile({ 
        diamonds: newDiamonds, 
        quests_completed: newQuests,
        level: newLevel
    });

    setTimeout(closeExercise, 1500);
}

// ========== BOUTIQUE ==========
function loadShop() {
    const shopGrid = document.getElementById('shop-items');
    shopGrid.innerHTML = '';

    shopAvatars.forEach(item => {
        const isOwned = currentProfile.owned_avatars?.includes(item.id) || item.price === 0;
        const card = document.createElement('div');
        card.className = `shop-item ${isOwned ? 'owned' : ''}`;
        
        const imgUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${item.seed}`;
        
        card.innerHTML = `
            <img src="${imgUrl}" alt="${item.name}">
            <h4>${item.name}</h4>
            <p class="shop-price">${isOwned ? 'Débloqué' : '💎 ' + item.price}</p>
            <button class="btn ${isOwned ? 'btn-secondary' : 'btn-shop'}" 
                onclick="${isOwned ? `useAvatar('${imgUrl}')` : `buyAvatar('${item.id}', ${item.price})`}"
                ${!isOwned && currentProfile.diamonds < item.price ? 'disabled' : ''}>
                ${isOwned ? 'Utiliser' : 'Acheter'}
            </button>
        `;
        shopGrid.appendChild(card);
    });
}

async function buyAvatar(id, price) {
    if (currentProfile.diamonds >= price) {
        const owned = currentProfile.owned_avatars || ['default'];
        owned.push(id);
        await updateProfile({ 
            diamonds: currentProfile.diamonds - price,
            owned_avatars: owned 
        });
        loadShop();
        alert("Nouvel avatar débloqué ! 🎉");
    }
}

async function useAvatar(url) {
    await updateProfile({ avatar_url: url });
    alert("Avatar mis à jour ! ✨");
}

function closeExercise() { document.getElementById('exercise-modal').classList.remove('active'); }
function closeSettings() { document.getElementById('settings-modal').classList.remove('active'); }
document.getElementById('settings-btn').onclick = () => document.getElementById('settings-modal').classList.add('active');
