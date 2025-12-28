// Gazdálkodj Okosan - Játéklogika

const COLORS = [
    { name: 'Piros', value: '#ef4444' },
    { name: 'Kék', value: '#3b82f6' },
    { name: 'Zöld', value: '#10b981' },
    { name: 'Sárga', value: '#eab308' },
    { name: 'Narancs', value: '#f97316' },
    { name: 'Lila', value: '#a855f7' }
];

const FURNITURE_TYPES = [
    { id: 'kitchen', name: 'Konyha', price: 150000, emoji: '🍳' },
    { id: 'bathroom', name: 'Fürdő', price: 120000, emoji: '🚿' },
    { id: 'bedroom', name: 'Háló', price: 180000, emoji: '🛏️' },
    { id: 'livingroom', name: 'Nappali', price: 200000, emoji: '🛋️' },
    { id: 'tv', name: 'TV', price: 100000, emoji: '📺' },
    { id: 'washingmachine', name: 'Mosógép', price: 80000, emoji: '🧺' },
    { id: 'fridge', name: 'Hűtő', price: 90000, emoji: '🧊' }
];

const CHANCE_CARDS = [
    // Pozitív kártyák (+200k-ig)
    { text: 'Nyertél a lottón! Kapsz 200.000 Ft-ot!', amount: 200000 },
    { text: 'Prémium kaptál a munkádért! +150.000 Ft', amount: 150000 },
    { text: 'Örökség érkezett! +120.000 Ft', amount: 120000 },
    { text: 'Jutalmat kaptál! +100.000 Ft', amount: 100000 },
    { text: 'Sikeres befektetés! +80.000 Ft', amount: 80000 },
    { text: 'Fizetésemelés! +70.000 Ft', amount: 70000 },
    { text: 'Adóvisszatérítés! +60.000 Ft', amount: 60000 },
    { text: 'Bónusz a cégtől! +50.000 Ft', amount: 50000 },
    { text: 'Mellékállásból bevétel! +40.000 Ft', amount: 40000 },
    { text: 'Találtál pénzt! +30.000 Ft', amount: 30000 },
    { text: 'Visszakaptad a kauciódat! +25.000 Ft', amount: 25000 },
    { text: 'Nyereményjáték díja! +20.000 Ft', amount: 20000 },
    { text: 'Cashback! +15.000 Ft', amount: 15000 },
    { text: 'Ajándék pénz! +10.000 Ft', amount: 10000 },
    
    // Negatív kártyák (-50k-ig)
    { text: 'Autójavítás... Fizetsz 50.000 Ft-ot.', amount: -50000 },
    { text: 'Biztosítás esedékes! -45.000 Ft', amount: -45000 },
    { text: 'Orvosi kezelés! -40.000 Ft', amount: -40000 },
    { text: 'Parkolóbírság! -35.000 Ft', amount: -35000 },
    { text: 'Lakáskarbantartás! -30.000 Ft', amount: -30000 },
    { text: 'Telefonszámla! -25.000 Ft', amount: -25000 },
    { text: 'Közüzemi díjak! -20.000 Ft', amount: -20000 },
    { text: 'Bevásárlás! -15.000 Ft', amount: -15000 },
    { text: 'Benziköltség! -10.000 Ft', amount: -10000 },
    { text: 'Ruházkodás! -8.000 Ft', amount: -8000 },
    
    // Speciális kártyák
    { text: 'Dupla szerencse! Dobj újra!', special: 'reroll' },
    { text: 'Gyors előrelépés! Dobj újra!', special: 'reroll' },
    { text: 'Még egy esély! Dobj újra!', special: 'reroll' },
    { text: 'Szerencsés nap! Dobj újra!', special: 'reroll' },
    { text: 'Bónusz dobás! Dobj újra!', special: 'reroll' }
];

// További kártyák hozzáadása, hogy 70 legyen
for (let i = 0; i < 40; i++) {
    const random = Math.random();
    if (random < 0.5) {
        // További pozitív kártyák
        const amount = Math.floor(Math.random() * 180000) + 20000;
        CHANCE_CARDS.push({
            text: `Szerencsés nap! +${formatMoney(amount)}`,
            amount: amount
        });
    } else if (random < 0.9) {
        // További negatív kártyák
        const amount = -(Math.floor(Math.random() * 40000) + 5000);
        CHANCE_CARDS.push({
            text: `Váratlan kiadás! ${formatMoney(amount)}`,
            amount: amount
        });
    } else {
        // További újradobás kártyák
        CHANCE_CARDS.push({
            text: 'Szerencsés pillanat! Dobj újra!',
            special: 'reroll'
        });
    }
}

let gameState = {
    players: [],
    currentPlayerIndex: 0,
    phase: 'setup', // setup, rolling, moving, action
    diceValue: 0,
    canRoll: true,
    skipTurns: {} // player index -> turns to skip
};

function formatMoney(amount) {
    return new Intl.NumberFormat('hu-HU').format(amount) + ' Ft';
}

function initPlayerColorSelection() {
    const playerCount = parseInt(document.getElementById('playerCount').value);
    const container = document.getElementById('playerColors');
    container.innerHTML = '';
    
    for (let i = 0; i < playerCount; i++) {
        const div = document.createElement('div');
        div.innerHTML = `
            <label class="block text-sm font-bold mb-1">${i + 1}. Játékos színe:</label>
            <select id="playerColor${i}" class="w-full px-4 py-2 border rounded">
                ${COLORS.map((c, idx) => `<option value="${idx}" ${idx === i ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
        `;
        container.appendChild(div);
    }
}

function startGame() {
    const playerCount = parseInt(document.getElementById('playerCount').value);
    if (playerCount < 2 || playerCount > 6) {
        alert('2-6 játékos lehet!');
        return;
    }
    
    gameState.players = [];
    for (let i = 0; i < playerCount; i++) {
        const colorIndex = parseInt(document.getElementById(`playerColor${i}`).value);
        gameState.players.push({
            id: i,
            name: `${i + 1}. Játékos`,
            color: COLORS[colorIndex].value,
            colorName: COLORS[colorIndex].name,
            position: 0,
            money: 100000,
            hasHouse: false,
            housePaymentType: null, // 'full', 'installment'
            installmentsPaid: 0, // 0-4
            installmentAmount: 0, // 100000 or 75000
            furniture: [],
            monthsPassed: 0
        });
    }
    
    gameState.phase = 'rolling';
    gameState.currentPlayerIndex = 0;
    gameState.skipTurns = {};
    
    document.getElementById('setupScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    
    initBoard();
    updateUI();
}

function initBoard() {
    const board = document.getElementById('gameBoard');
    const spaces = [];
    
    // Create 50 spaces (0-49)
    const boardSize = board.offsetWidth;
    const spaceSize = boardSize / 13; // ~13 spaces per side
    
    // Bottom row (0-12): left to right
    for (let i = 0; i <= 12; i++) {
        spaces.push({
            id: i,
            left: i * spaceSize,
            top: boardSize - spaceSize,
            width: spaceSize,
            height: spaceSize
        });
    }
    
    // Right column (13-24): bottom to top
    for (let i = 1; i <= 12; i++) {
        spaces.push({
            id: 12 + i,
            left: boardSize - spaceSize,
            top: boardSize - spaceSize - i * spaceSize,
            width: spaceSize,
            height: spaceSize
        });
    }
    
    // Top row (25-37): right to left
    for (let i = 1; i <= 12; i++) {
        spaces.push({
            id: 24 + i,
            left: boardSize - spaceSize - i * spaceSize,
            top: 0,
            width: spaceSize,
            height: spaceSize
        });
    }
    
    // Left column (38-49): top to bottom
    for (let i = 1; i <= 12; i++) {
        spaces.push({
            id: 36 + i,
            left: 0,
            top: i * spaceSize,
            width: spaceSize,
            height: spaceSize
        });
    }
    
    spaces.forEach(space => {
        const div = document.createElement('div');
        div.className = 'space';
        div.id = `space${space.id}`;
        div.style.left = space.left + 'px';
        div.style.top = space.top + 'px';
        div.style.width = space.width + 'px';
        div.style.height = space.height + 'px';
        
        // Add special classes
        if (space.id === 0) div.classList.add('start');
        if ([14, 27, 44].includes(space.id)) div.classList.add('shop');
        if ([12, 25, 42].includes(space.id)) div.classList.add('card');
        if ([1, 7, 15, 19, 24, 30, 33, 39, 48].includes(space.id)) div.classList.add('special');
        
        div.innerHTML = getSpaceLabel(space.id);
        div.onclick = () => showSpaceInfo(space.id);
        
        board.appendChild(div);
    });
    
    // Add player tokens
    gameState.players.forEach((player, index) => {
        const token = document.createElement('div');
        token.className = 'player-token';
        token.id = `token${index}`;
        token.style.backgroundColor = player.color;
        board.appendChild(token);
        updateTokenPosition(index);
    });
}

function getSpaceLabel(id) {
    if (id === 0) return 'START<br>+40k';
    if (id === 14) return '🏠<br>BOLT';
    if (id === 27) return '🏠<br>BOLT';
    if (id === 44) return '🏠<br>BOLT';
    if (id === 12) return '❓<br>KÁRTYA';
    if (id === 25) return '❓<br>KÁRTYA';
    if (id === 42) return '❓<br>KÁRTYA';
    if (id === 1) return '➡️18';
    if (id === 7) return '⏸️';
    if (id === 15) return '⬅️3';
    if (id === 19) return '🎲';
    if (id === 24) return '🎯6';
    if (id === 30) return '➡️36';
    if (id === 33) return '⏸️';
    if (id === 39) return '⬅️6';
    if (id === 48) return '↩️START';
    return id;
}

function updateTokenPosition(playerIndex) {
    const player = gameState.players[playerIndex];
    const token = document.getElementById(`token${playerIndex}`);
    const space = document.getElementById(`space${player.position}`);
    
    if (space && token) {
        const rect = space.getBoundingClientRect();
        const boardRect = document.getElementById('gameBoard').getBoundingClientRect();
        
        const offset = playerIndex * 22;
        const x = rect.left - boardRect.left + rect.width / 2 - 10 + (offset % 44);
        const y = rect.top - boardRect.top + rect.height / 2 - 10 + Math.floor(offset / 44) * 22;
        
        token.style.left = x + 'px';
        token.style.top = y + 'px';
    }
}

function updateUI() {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    // Update current player info
    document.getElementById('currentPlayerInfo').innerHTML = `
        <span style="color: ${currentPlayer.color}">⬤</span> 
        ${currentPlayer.name} | 
        ${formatMoney(currentPlayer.money)} | 
        Lakás: ${currentPlayer.hasHouse ? '✓' : '✗'} | 
        Bútor: ${currentPlayer.furniture.length}/7
    `;
    
    // Update player stats
    const statsContainer = document.getElementById('playerStats');
    statsContainer.innerHTML = gameState.players.map((player, index) => `
        <div class="p-2 rounded ${index === gameState.currentPlayerIndex ? 'bg-gray-700' : 'bg-gray-900'}">
            <div style="color: ${player.color}" class="font-bold">${player.name}</div>
            <div class="text-xs">${formatMoney(player.money)}</div>
            <div class="text-xs">Lakás: ${player.hasHouse ? '✓' : '✗'} | Bútor: ${player.furniture.length}/7</div>
        </div>
    `).join('');
    
    // Update turn info
    const canRoll = gameState.canRoll && gameState.phase === 'rolling';
    const skipInfo = gameState.skipTurns[gameState.currentPlayerIndex] > 0 ? 
        ` (Kimaradsz még ${gameState.skipTurns[gameState.currentPlayerIndex]} körből)` : '';
    document.getElementById('turnInfo').textContent = 
        canRoll ? 'Koppints a kockára!' + skipInfo : 'Várj...';
    
    // Update dice
    document.getElementById('dice').style.cursor = canRoll ? 'pointer' : 'not-allowed';
}

function rollDice() {
    if (!gameState.canRoll || gameState.phase !== 'rolling') return;
    
    // Check if player should skip turn
    if (gameState.skipTurns[gameState.currentPlayerIndex] > 0) {
        gameState.skipTurns[gameState.currentPlayerIndex]--;
        showModal('Kimaradt kör', `Kimaradsz ebből a körből! Még ${gameState.skipTurns[gameState.currentPlayerIndex]} kör van hátra.`, () => {
            nextTurn();
        });
        return;
    }
    
    gameState.canRoll = false;
    const dice = document.getElementById('dice');
    const diceValue = document.getElementById('diceValue');
    
    // Animate dice
    dice.classList.add('rolling');
    let count = 0;
    const interval = setInterval(() => {
        diceValue.textContent = Math.floor(Math.random() * 6) + 1;
        count++;
        if (count >= 10) {
            clearInterval(interval);
            dice.classList.remove('rolling');
            const finalValue = Math.floor(Math.random() * 6) + 1;
            diceValue.textContent = finalValue;
            gameState.diceValue = finalValue;
            handleDiceRoll(finalValue);
        }
    }, 50);
}

function handleDiceRoll(value) {
    const player = gameState.players[gameState.currentPlayerIndex];
    const oldPosition = player.position;
    
    // Special case: space 24 - only 6 allows movement
    if (player.position === 24 && value !== 6) {
        showModal('Csak hatossal!', 'Ezen a mezőn csak 6-os dobással léphetsz tovább!', () => {
            gameState.canRoll = true;
            updateUI();
        });
        return;
    }
    
    // Move player
    player.position = (player.position + value) % 50;
    
    // Animate movement
    animateMovement(gameState.currentPlayerIndex, oldPosition, player.position, value, () => {
        // Check if passed START
        if (oldPosition + value >= 50) {
            handleStartPassing();
        } else {
            handleSpaceLanding();
        }
    });
}

function animateMovement(playerIndex, from, to, steps, callback) {
    let current = from;
    let stepsLeft = steps;
    
    const step = () => {
        if (stepsLeft <= 0) {
            callback();
            return;
        }
        
        current = (current + 1) % 50;
        stepsLeft--;
        gameState.players[playerIndex].position = current;
        updateTokenPosition(playerIndex);
        
        setTimeout(step, 200);
    };
    
    step();
}

function handleStartPassing() {
    const player = gameState.players[gameState.currentPlayerIndex];
    
    if (player.housePaymentType === 'installment' && player.installmentsPaid < 4) {
        // Deduct installment
        const payment = 20000 + player.installmentAmount;
        player.money -= payment;
        player.installmentsPaid++;
        player.monthsPassed++;
        
        const remaining = 4 - player.installmentsPaid;
        showModal('START mező', 
            `Részlet fizetés: -${formatMoney(payment)}\n(20.000 Ft START levonás + ${formatMoney(player.installmentAmount)} részlet)\nHátralévő részletek: ${remaining}`,
            () => {
                if (player.installmentsPaid >= 4) {
                    player.hasHouse = true;
                    showModal('Gratulálunk!', 'Kifizetetted a lakást! Most már vásárolhatsz bútort!', () => {
                        handleSpaceLanding();
                    });
                } else {
                    handleSpaceLanding();
                }
            }
        );
    } else {
        // Normal START bonus
        player.money += 40000;
        showModal('START mező', 'Kapsz +40.000 Ft-ot!', () => {
            handleSpaceLanding();
        });
    }
}

function handleSpaceLanding() {
    const player = gameState.players[gameState.currentPlayerIndex];
    const space = player.position;
    
    // Check for special spaces
    if (space === 1) {
        // Jump to space 18
        showModal('Ugrás!', 'Lépj a 18. mezőre!', () => {
            player.position = 18;
            updateTokenPosition(gameState.currentPlayerIndex);
            handleSpaceLanding();
        });
    } else if (space === 7 || space === 33) {
        // Skip next turn
        gameState.skipTurns[gameState.currentPlayerIndex] = 1;
        showModal('Kimaradsz!', 'Kimaradsz 1 körből!', () => {
            nextTurn();
        });
    } else if (space === 15) {
        // Move back 3 spaces
        showModal('Vissza!', 'Lépj vissza 3 mezőt!', () => {
            player.position = Math.max(0, player.position - 3);
            updateTokenPosition(gameState.currentPlayerIndex);
            handleSpaceLanding();
        });
    } else if (space === 19) {
        // Roll again
        showModal('Dobj újra!', 'Dobhatsz még egyszer!', () => {
            gameState.canRoll = true;
            updateUI();
        });
    } else if (space === 24) {
        // Already handled in rollDice
        nextTurn();
    } else if (space === 30) {
        // Jump to space 36
        showModal('Ugrás!', 'Lépj a 36. mezőre!', () => {
            player.position = 36;
            updateTokenPosition(gameState.currentPlayerIndex);
            handleSpaceLanding();
        });
    } else if (space === 39) {
        // Move back 6 spaces
        showModal('Vissza!', 'Lépj vissza 6 mezőt!', () => {
            player.position = Math.max(0, player.position - 6);
            updateTokenPosition(gameState.currentPlayerIndex);
            handleSpaceLanding();
        });
    } else if (space === 48) {
        // Jump to START
        showModal('START mezőre!', 'Lépj a START mezőre és kapd meg az újabb START hatást!', () => {
            player.position = 0;
            updateTokenPosition(gameState.currentPlayerIndex);
            handleStartPassing();
        });
    } else if ([14, 27, 44].includes(space)) {
        // Shop
        showShopModal();
    } else if ([12, 25, 42].includes(space)) {
        // Chance card
        drawChanceCard();
    } else {
        // Regular space
        nextTurn();
    }
}

function drawChanceCard() {
    const card = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
    const player = gameState.players[gameState.currentPlayerIndex];
    
    if (card.special === 'reroll') {
        showModal('🎴 Szerencsekártya', card.text, () => {
            gameState.canRoll = true;
            updateUI();
        });
    } else {
        player.money += card.amount;
        showModal('🎴 Szerencsekártya', card.text, () => {
            checkWinCondition();
            nextTurn();
        });
    }
}

function showShopModal() {
    const player = gameState.players[gameState.currentPlayerIndex];
    
    let content = '<div class="space-y-4">';
    
    // House purchase
    if (!player.hasHouse && player.housePaymentType === null) {
        content += `
            <div class="border-2 border-blue-500 rounded-lg p-4">
                <h3 class="font-bold text-lg mb-2">🏠 Lakás vásárlás</h3>
                <p class="mb-2">Ár: <strong>${formatMoney(700000)}</strong></p>
                <div class="space-y-2">
                    <button onclick="buyHouseFull()" class="w-full btn btn-primary">
                        Vásárlás egyben (700.000 Ft)
                    </button>
                    <button onclick="buyHouseInstallment(300000, 100000)" class="w-full btn btn-primary">
                        Előleg + 4x100k részlet (300k előleg)
                    </button>
                    <button onclick="buyHouseInstallment(400000, 75000)" class="w-full btn btn-primary">
                        Előleg + 4x75k részlet (400k előleg)
                    </button>
                </div>
            </div>
        `;
    } else if (player.hasHouse) {
        content += `<p class="text-green-600 font-bold">✓ Van lakásod!</p>`;
    } else if (player.housePaymentType === 'installment') {
        content += `<p class="text-yellow-600 font-bold">⏳ Lakás törlesztés folyamatban (${player.installmentsPaid}/4 részlet)</p>`;
    }
    
    // Furniture purchase
    if (player.hasHouse) {
        content += `
            <div class="border-2 border-green-500 rounded-lg p-4">
                <h3 class="font-bold text-lg mb-2">🛋️ Bútor vásárlás</h3>
                <div class="furniture-grid">
                    ${FURNITURE_TYPES.map(furniture => {
                        const owned = player.furniture.includes(furniture.id);
                        return `
                            <div class="furniture-item ${owned ? 'owned' : ''}" 
                                 onclick="${owned ? '' : `buyFurniture('${furniture.id}')`}">
                                <div class="text-3xl mb-1">${furniture.emoji}</div>
                                <div class="text-xs font-bold">${furniture.name}</div>
                                <div class="text-xs">${owned ? '✓ Megvan' : formatMoney(furniture.price)}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    } else {
        content += `<p class="text-gray-500 italic">Először vásárolj lakást a bútorokhoz!</p>`;
    }
    
    content += '</div>';
    
    showModal('🏪 BOLT', content, () => {
        checkWinCondition();
        nextTurn();
    }, true);
}

function buyHouseFull() {
    const player = gameState.players[gameState.currentPlayerIndex];
    if (player.money >= 700000) {
        player.money -= 700000;
        player.hasHouse = true;
        player.housePaymentType = 'full';
        closeModal();
        showModal('Gratulálunk!', 'Megvetted a lakást egyben! Most már vásárolhatsz bútort!', () => {
            showShopModal();
        });
    } else {
        alert('Nincs elég pénzed! Szükséges: ' + formatMoney(700000));
    }
}

function buyHouseInstallment(downPayment, monthlyPayment) {
    const player = gameState.players[gameState.currentPlayerIndex];
    if (player.money >= downPayment) {
        player.money -= downPayment;
        player.housePaymentType = 'installment';
        player.installmentAmount = monthlyPayment;
        player.installmentsPaid = 0;
        closeModal();
        showModal('Lakás vásárlás', 
            `Előleg kifizetve: ${formatMoney(downPayment)}\nHavi részlet: ${formatMoney(monthlyPayment)}\n4 részlet van hátra.`,
            () => {
                checkWinCondition();
                nextTurn();
            }
        );
    } else {
        alert('Nincs elég pénzed az előleghez! Szükséges: ' + formatMoney(downPayment));
    }
}

function buyFurniture(furnitureId) {
    const player = gameState.players[gameState.currentPlayerIndex];
    const furniture = FURNITURE_TYPES.find(f => f.id === furnitureId);
    
    if (!player.hasHouse) {
        alert('Először vásárolj lakást!');
        return;
    }
    
    if (player.furniture.includes(furnitureId)) {
        alert('Már megvan ez a bútor!');
        return;
    }
    
    if (player.money >= furniture.price) {
        player.money -= furniture.price;
        player.furniture.push(furnitureId);
        closeModal();
        showModal('Bútor vásárlás', 
            `Megvetted: ${furniture.emoji} ${furniture.name}\nÁr: ${formatMoney(furniture.price)}`,
            () => {
                showShopModal();
            }
        );
    } else {
        alert('Nincs elég pénzed! Szükséges: ' + formatMoney(furniture.price));
    }
}

function checkWinCondition() {
    const player = gameState.players[gameState.currentPlayerIndex];
    
    if (player.hasHouse && 
        player.furniture.length === 7 && 
        player.money >= 300000) {
        showModal('🎉 GYŐZELEM! 🎉', 
            `${player.name} nyert!\n\n✓ Lakás: Megvan\n✓ Bútorok: 7/7\n✓ Pénz: ${formatMoney(player.money)}\n\nGratulálunk!`,
            () => {
                if (confirm('Új játék indítása?')) {
                    location.reload();
                }
            }
        );
        return true;
    }
    return false;
}

function nextTurn() {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    gameState.canRoll = true;
    gameState.phase = 'rolling';
    updateUI();
}

function showModal(title, content, onClose, isHTML = false) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2 class="text-2xl font-bold mb-4">${title}</h2>
            <div class="mb-4 ${isHTML ? '' : 'whitespace-pre-line'}">${content}</div>
            <button onclick="closeModal(${onClose ? 'true' : 'false'})" class="w-full btn btn-success">
                ${onClose ? 'Rendben' : 'Bezárás'}
            </button>
        </div>
    `;
    
    document.getElementById('modalContainer').appendChild(modal);
    
    if (onClose) {
        window.currentModalCallback = onClose;
    }
}

function closeModal(executeCallback = false) {
    const container = document.getElementById('modalContainer');
    container.innerHTML = '';
    
    if (executeCallback && window.currentModalCallback) {
        const callback = window.currentModalCallback;
        window.currentModalCallback = null;
        callback();
    }
}

function showMenu() {
    let content = '<div class="space-y-2">';
    content += '<h3 class="font-bold mb-2">Játékosok állása:</h3>';
    gameState.players.forEach(player => {
        content += `
            <div class="border rounded p-2">
                <div style="color: ${player.color}" class="font-bold">${player.name}</div>
                <div class="text-sm">Pénz: ${formatMoney(player.money)}</div>
                <div class="text-sm">Lakás: ${player.hasHouse ? '✓ Megvan' : '✗ Nincs'}</div>
                ${player.housePaymentType === 'installment' ? 
                    `<div class="text-sm">Részlet: ${player.installmentsPaid}/4</div>` : ''}
                <div class="text-sm">Bútorok: ${player.furniture.length}/7</div>
            </div>
        `;
    });
    content += '</div>';
    
    showModal('📊 Játék menü', content, null, true);
}

function showSpaceInfo(spaceId) {
    const info = getSpaceInfo(spaceId);
    showModal(`Mező ${spaceId}`, info);
}

function getSpaceInfo(id) {
    if (id === 0) return 'START mező\n+40.000 Ft minden áthaladásnál\nHa részletes lakást vásároltál: -20.000 Ft + havi részlet';
    if ([14, 27, 44].includes(id)) return 'BOLT\nVásárolhatsz lakást és bútorokat';
    if ([12, 25, 42].includes(id)) return 'SZERENCSEKÁRTYA\nHúzol egy kártyát';
    if (id === 1) return 'Ugrás a 18. mezőre';
    if (id === 7 || id === 33) return 'Kimaradsz 1 körből';
    if (id === 15) return 'Lépj vissza 3 mezőt';
    if (id === 19) return 'Dobj még egyszer';
    if (id === 24) return 'Csak 6-os dobással léphetsz\nMás esetben visszalépsz az eredeti pozícióra';
    if (id === 30) return 'Ugrás a 36. mezőre';
    if (id === 39) return 'Lépj vissza 6 mezőt';
    if (id === 48) return 'Ugrás a START mezőre + START hatás';
    return `Normál mező (${id})`;
}

// Initialize player color selection on load
document.getElementById('playerCount').addEventListener('change', initPlayerColorSelection);
initPlayerColorSelection();
