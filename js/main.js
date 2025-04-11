document.addEventListener('DOMContentLoaded', function () {
    // Éléments du DOM
    const gameImage = document.getElementById('game-image');
    const sceneImage = document.getElementById('scene-image');
    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');
    const nextBtn = document.getElementById('next-btn');
    const scoreEl = document.getElementById('score');
    const totalTargetsEl = document.getElementById('total-targets');
    const levelEl = document.getElementById('level');
    const progressBar = document.getElementById('progress');
    const sceneTitle = document.getElementById('scene-title');
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const closeHelp = document.getElementById('close-help');
    const startFromHelp = document.getElementById('start-from-help');
    const statsPanel = document.getElementById('stats-panel');
    const savedEnergy = document.getElementById('saved-energy');
    const savedMoney = document.getElementById('saved-money');
    const savedCo2 = document.getElementById('saved-co2');
    const congratsModal = document.getElementById('congrats-modal');
    const playAgain = document.getElementById('play-again');
    const finalEnergy = document.getElementById('final-energy');
    const finalMoney = document.getElementById('final-money');
    const hint = document.getElementById('hint');

    // Variables du jeu
    let currentLevel = 1;
    let score = 0;
    let foundTargets = 0;
    let totalTargets = 0;
    let totalEnergySaved = 0;
    let gameData = [];

    // Données des niveaux
    const levels = [
        {
            title: "Salle de bain",
            image: "https://cdn.discordapp.com/attachments/1300375543056961537/1360214366192144616/raw.png?ex=67fa4dd8&is=67f8fc58&hm=71d04933b5460fda51800c2a1d34dbaf4f83af91c9c6b3d158d26e8ca61c5bdd&",
            targets: [
                { x: 32, y: 48, name: "Station de brosse à dent", energy: 12, tooltipPos: "right" },
            ],
            hint: "Cherchez les sources de consommations electriques"
        },
        {
            title: "Chambre",
            image: "https://cdn.discordapp.com/attachments/1300375543056961537/1360218105430806538/Design_sans_titre_1.png?ex=67fa5153&is=67f8ffd3&hm=aa7fe5c0ae9300742ea16d3e4ce3ed02b4eb2f6bef0f2fd8c1b6ad395fbe8fc7&",
            targets: [
                { x: 56, y: 17, name: "Lumière allumée", energy: 25, tooltipPos: "right" },
                { x: 84, y: 53, name: "Réveil", energy: 30, tooltipPos: "left" },
            ],
            hint: "Cherchez les sources de consommations electriques"
        },
        {
            title: "Cuisine",
            image: "https://cdn.discordapp.com/attachments/1300375543056961537/1360218977803964556/Design_sans_titre_2.png?ex=67fa5223&is=67f900a3&hm=8219b50561c1ca82a5d506e8f921472f8c41a286649100916ced0363403703f8&",
            targets: [
                { x: 31.5, y: 14, name: "Lumière allumée", energy: 12, tooltipPos: "right" },
                { x: 49, y: 46, name: "Cuiseur à riz", energy: 20, tooltipPos: "left" },
                { x: 61.5, y: 47, name: "Robot cuisinier", energy: 5, tooltipPos: "bottom" },
                { x: 70, y: 22, name: "Micro-ondes", energy: 5, tooltipPos: "bottom" },
                { x: 75, y: 50, name: "Réfrigirateur", energy: 50, tooltipPos: "left" }
            ],
            hint: "Cherchez les sources de consommations electriques"
        },
        {
            title: "Salon",
            image: "https://cdn.discordapp.com/attachments/1300375543056961537/1360206738053140570/raw.png?ex=67fa46bd&is=67f8f53d&hm=8a4a2fd61a86d994ed0b39705c6217e63fee57c80f3154384b803c5af33c448b&",
            targets: [
                { x: 15, y: 15, name: "Lampe à lave", energy: 20, tooltipPos: "right" },
                { x: 27, y: 54, name: "Télévision en veille", energy: 20, tooltipPos: "right" },
                { x: 20, y: 88, name: "Multiprise", energy: 5, tooltipPos: "left" },
                { x: 51, y: 38, name: "Lampe allumée", energy: 15, tooltipPos: "bottom" },
                { x: 85, y: 43, name: "Lampe allumée", energy: 10, tooltipPos: "left" }
            ],
            hint: "Cherchez les sources de consommations electriques"
        },
    ];

    // Initialisation du jeu
    function initGame() {
        currentLevel = 1;
        score = 0;
        totalEnergySaved = 0;
        updateScore();
        loadLevel(currentLevel);
        statsPanel.classList.add('hidden');
    }

    // Chargement d'un niveau
    function loadLevel(level) {
        const levelData = levels[level - 1];
        if (!levelData) {
            showCongrats();
            return;
        }

        // Réinitialiser
        gameImage.innerHTML = ''; // Supprimer les anciennes cibles
        gameImage.appendChild(sceneImage);
        sceneImage.setAttribute('src', levelData.image);
        sceneTitle.textContent = levelData.title;
        levelEl.textContent = level;
        foundTargets = 0;
        totalTargets = levelData.targets.length;
        totalTargetsEl.textContent = totalTargets;
        progressBar.style.width = '0%';
        nextBtn.classList.add('hidden');
        hint.textContent = levelData.hint;

        // Créer les cibles (invisibles)
        levelData.targets.forEach(target => {
            const targetEl = document.createElement('div');
            targetEl.className = 'energy-consumer';
            targetEl.style.left = `${target.x}%`;
            targetEl.style.top = `${target.y}%`;
            targetEl.dataset.name = target.name;
            targetEl.dataset.energy = target.energy;
            targetEl.dataset.tooltipPos = target.tooltipPos;

            gameImage.appendChild(targetEl);
        });

        // Gestion du clic sur l'image
        gameImage.addEventListener('click', function (e) {
            const rect = gameImage.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            console.log('x', x);
            console.log('y', y);

            // Créer un effet visuel sur le clic
            createClickFeedback(e.clientX, e.clientY);

            // Vérifier si le clic est sur une cible
            const targets = document.querySelectorAll('.energy-consumer');
            let hit = false;

            targets.forEach(target => {
                if (!target.classList.contains('found')) {
                    const targetX = parseFloat(target.style.left);
                    const targetY = parseFloat(target.style.top);

                    // Vérifier si le clic est proche de la cible (dans un rayon de 5%)
                    const distance = Math.sqrt(Math.pow(x - targetX, 2) + Math.pow(y - targetY, 2));

                    if (distance < 5) {
                        hit = true;
                        target.classList.add('found');
                        foundTargets++;
                        score++;
                        totalEnergySaved += parseInt(target.dataset.energy);
                        updateScore();
                        createTooltip(target, target.dataset.name, target.dataset.energy, target.dataset.tooltipPos);
                        createConfetti(e.clientX, e.clientY);

                        // Mettre à jour la barre de progression
                        const progress = (foundTargets / totalTargets) * 100;
                        progressBar.style.width = `${progress}%`;

                        if (foundTargets === totalTargets) {
                            nextBtn.classList.remove('hidden');
                            statsPanel.classList.remove('hidden');
                            updateStats();
                        }
                    }
                }
            });

            if (!hit) {
                // Effet pour indiquer que ce n'est pas la bonne zone
                hint.classList.add('text-red-500');
                setTimeout(() => hint.classList.remove('text-red-500'), 500);
            }
        });
    }

    // Créer un effet visuel lors du clic
    function createClickFeedback(x, y) {
        const feedback = document.createElement('div');
        feedback.className = 'click-feedback';
        feedback.style.left = `${x}px`;
        feedback.style.top = `${y}px`;

        document.body.appendChild(feedback);

        // Supprimer après l'animation
        setTimeout(() => feedback.remove(), 600);
    }

    // Créer un tooltip lors du clic sur une cible
    function createTooltip(targetEl, name, energy, position) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip fade-in';
        tooltip.textContent = `${name} (+${energy}kWh/an économisés)`;

        // Positionnement du tooltip
        const targetRect = targetEl.getBoundingClientRect();
        const gameRect = gameImage.getBoundingClientRect();

        switch (position) {
            case 'right':
                tooltip.style.left = `${targetRect.right - gameRect.left + 10}px`;
                tooltip.style.top = `${targetRect.top - gameRect.top}px`;
                break;
            case 'left':
                tooltip.style.left = `${targetRect.left - gameRect.left - tooltip.offsetWidth - 10}px`;
                tooltip.style.top = `${targetRect.top - gameRect.top}px`;
                break;
            case 'top':
                tooltip.style.left = `${targetRect.left - gameRect.left}px`;
                tooltip.style.top = `${targetRect.top - gameRect.top - tooltip.offsetHeight - 10}px`;
                break;
            case 'bottom':
                tooltip.style.left = `${targetRect.left - gameRect.left}px`;
                tooltip.style.top = `${targetRect.bottom - gameRect.top + 10}px`;
                break;
        }

        gameImage.appendChild(tooltip);

        // Supprimer le tooltip après 3 secondes
        setTimeout(() => {
            tooltip.classList.add('opacity-0');
            setTimeout(() => tooltip.remove(), 300);
        }, 3000);
    }

    // Créer des confettis
    function createConfetti(x, y) {
        console.log('Confetti at:', x, y);
        const colors = ['#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff'];

        for (let i = 0; i < 20; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = `${x}px`;
            confetti.style.top = `${y}px`;

            // Position aléatoire
            const angle = Math.random() * Math.PI * 2;
            const velocity = 3 + Math.random() * 5;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;

            document.body.appendChild(confetti);

            // Animation
            let posX = x;
            let posY = y;
            let opacity = 1;
            let scale = 0.5 + Math.random();
            let rotation = Math.random() * 360;

            confetti.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
            confetti.style.opacity = opacity;

            const animate = () => {
                posX += vx;
                posY += vy + 0.5; // Ajouter un peu de gravité
                opacity -= 0.02;
                rotation += 5;

                confetti.style.left = `${posX}px`;
                confetti.style.top = `${posY}px`;
                confetti.style.opacity = opacity;
                confetti.style.transform = `scale(${scale}) rotate(${rotation}deg)`;

                if (opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    confetti.remove();
                }
            };

            requestAnimationFrame(animate);
        }
    }

    // Mettre à jour le score
    function updateScore() {
        scoreEl.textContent = score;
    }

    // Mettre à jour les statistiques
    function updateStats() {
        savedEnergy.textContent = totalEnergySaved;
        savedMoney.textContent = Math.round(totalEnergySaved * 0.20); // 0.20€ par kWh
        savedCo2.textContent = Math.round(totalEnergySaved * 0.024); // 0.024kg CO2 par kWh
    }

    // Afficher l'écran de félicitations
    function showCongrats() {
        finalEnergy.textContent = totalEnergySaved;
        finalMoney.textContent = Math.round(totalEnergySaved * 0.15);
        congratsModal.classList.remove('hidden');
    }

    // Événements
    startBtn.addEventListener('click', function () {
        startScreen.classList.add('hidden');
        initGame();
    });

    nextBtn.addEventListener('click', function () {
        currentLevel++;
        loadLevel(currentLevel);
    });

    helpBtn.addEventListener('click', function () {
        helpModal.classList.remove('hidden');
    });

    closeHelp.addEventListener('click', function () {
        helpModal.classList.add('hidden');
    });

    startFromHelp.addEventListener('click', function () {
        helpModal.classList.add('hidden');
        startScreen.classList.add('hidden');
        initGame();
    });

    playAgain.addEventListener('click', function () {
        congratsModal.classList.add('hidden');
        initGame();
    });

    // Initialiser le modal d'aide
    helpModal.addEventListener('click', function (e) {
        if (e.target === helpModal) {
            helpModal.classList.add('hidden');
        }
    });

    // Initialiser le modal de félicitations
    congratsModal.addEventListener('click', function (e) {
        if (e.target === congratsModal) {
            congratsModal.classList.add('hidden');
        }
    });
});
