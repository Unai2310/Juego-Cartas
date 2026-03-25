class Game {
    constructor(gameCode, settings = {}) {
        this.gameCode = gameCode;
        this.creatorId = null;
        this.players = new Map(); // socketId -> player object
        this.playerOrder = []; // Array de socketIds en orden de turno
        this.currentRound = 5; // Cartas repartidas esta ronda
        this.currentPhase = 'waiting'; // waiting, betting, playing, roundEnd
        this.dealerPlayerId = null;
        this.currentPlayerIndex = 0;
        this.bets = new Map(); // socketId -> bet amount
        this.oneCardBets = new Map(); // socketId -> 'win' or 'lose' para ronda de 1 carta
        this.hands = new Map(); // socketId -> array of cards
        this.currentTrick = []; // Cartas jugadas en la mano actual
        this.roundWins = new Map(); // socketId -> numero de victorias de la ronda
        this.lastRoundLifeLosses = {}; //Logs de perdida de vidas
        this.lastTrickWinner = null; // Informacion del ganador de la mano
        this.lastCompletedTrick = [];
        this.wasLastRoundOneCard = false;
        this.lastRoundDealerId = null;
        this.deckType = settings.deckType || 'poker';
        this.settings = {
            startingLives: settings.startingLives || 5,
            deckType: settings.deckType || 'poker',
            ...settings
        };
        this.deck = [];
        this.gameStarted = false;
    }

    addPlayer(socketId, name) {
        const maxPlayers = this.deckType === 'spanish' ? 8 : 10;

        if (this.players.size >= maxPlayers) {
            throw new Error(`Partida Llena (Max ${maxPlayers} Jugadores)`);
        }

        if (this.players.size === 0) {
            this.creatorId = socketId;
        }

        // No permitir unirse si la partida a empezado
        if (this.gameStarted) {
            throw new Error('No puedes unirte - Hay una partida en curso');
        }

        this.players.set(socketId, {
            id: socketId,
            name,
            lives: this.settings.startingLives
        });
        this.playerOrder.push(socketId);
    }

    removePlayer(socketId) {
        const player = this.players.get(socketId);
        if (!player) return;

        // Comprobar si es el turno del desconectado
        const activePlayers = this.getActivePlayers();
        const wasCurrentPlayer = activePlayers[this.currentPlayerIndex] === socketId;

        // Buscar el la posicion del jugador desconectado
        const orderIndex = this.playerOrder.indexOf(socketId);

        // Eliminar al jugador de la partida
        this.players.delete(socketId);
        if (orderIndex > -1) {
            this.playerOrder.splice(orderIndex, 1);
        }

        // Eliminar todo lo que tenga ver con el jugador desconectado
        this.hands.delete(socketId);
        this.bets.delete(socketId);
        this.oneCardBets.delete(socketId);
        this.roundWins.delete(socketId);

        // Asignar nuevo host si es el desconectado
        if (this.creatorId === socketId && this.playerOrder.length > 0) {
            this.creatorId = this.playerOrder[0];
        }

        // Ajustar estado del juego a la desconexion
        if (this.gameStarted) {
            const newActivePlayers = this.getActivePlayers();

            if (newActivePlayers.length === 0) {
                this.currentPhase = 'gameEnd';
                return;
            }

            // Ajustar indice del dealer
            if (socketId === this.dealerPlayerId) {
                const newActivePlayers = this.getActivePlayers();
                if (newActivePlayers.length > 0) {
                    // El dealer se deconecto, se asigna al siguiente jugador activo
                    this.dealerPlayerId = newActivePlayers[0];
                }
            }

            // Ajustar indice del jugador
            if (orderIndex < this.currentPlayerIndex) {
                this.currentPlayerIndex--;
            } else if (wasCurrentPlayer) {
                // El jugador con el truno se desconecta
                this.currentPlayerIndex = this.currentPlayerIndex % newActivePlayers.length;
            }

            // comprobar indices caluclado
            this.currentPlayerIndex = Math.min(this.currentPlayerIndex, newActivePlayers.length - 1);

            // Comprobar si el juego debe acabar
            this.checkGameEnd();
        }
    }

    startGame(startingDealerId = null) {
        if (this.playerOrder.length < 2) {
            throw new Error('Se necesitan al menos 2 jugadores para poder empezar');
        }
        this.gameStarted = true;
        this.currentRound = this.getActivePlayers().length === 2 ? 1 : 5;

        const activePlayers = this.getActivePlayers();

        if (startingDealerId && activePlayers.includes(startingDealerId)) {
            // Dealer manual
            this.dealerPlayerId = startingDealerId;
            this.dealerIndex = activePlayers.indexOf(startingDealerId);
        } else {
            // Dealer aleatorio
            this.dealerIndex = Math.floor(Math.random() * activePlayers.length);
            this.dealerPlayerId = activePlayers[this.dealerIndex];
        }

        this.startNewRound();
    }

    restartGame() {
        // Resetear el numero de vidas de los jugadores
        this.players.forEach(player => {
            if (!player.isSpectator) {
                player.lives = this.settings.startingLives;
            }
        });

        // Resetar el estado del juego
        this.currentRound = 5;
        this.dealerPlayerId = null;
        this.currentPhase = 'waiting';
        this.gameStarted = false;
        this.bets.clear();
        this.oneCardBets.clear();
        this.hands.clear();
        this.roundWins.clear();
        this.currentTrick = [];
    }

    startNewRound() {
        const activePlayers = this.getActivePlayers();

        if (activePlayers.length === 2) {
            this.currentRound = 1;
        }

        // Comprobar si es la ronda de 1 sola carta
        const isOneCardRound = this.currentRound === 1;

        if (isOneCardRound) {
            this.currentPhase = 'oneCardBetting';
        } else {
            this.currentPhase = 'betting';
        }

        this.bets.clear();
        this.oneCardBets.clear();
        this.hands.clear();
        this.roundWins.clear();
        this.currentTrick = [];
        this.lastTrickWinner = null;
        this.lastCompletedTrick = [];

        // Repartir cartas
        this.deck = this.createDeck();
        this.shuffleDeck();

        activePlayers.forEach(playerId => {
            const hand = [];
            for (let i = 0; i < this.currentRound; i++) {
                hand.push(this.deck.pop());
            }
            this.hands.set(playerId, hand);
            this.roundWins.set(playerId, 0);
        });

        for (const [playerId, cartas] of this.hands) {
            const player = this.players.get(playerId);
            const cartasString = cartas.map(c => c.value).join(', ');
            console.log(`Jugador: ${player?.name || 'Unknown'} - Cartas: ${cartasString}`);
        }

        // El jugador siguiente al dealer empieza a apostar
        let dealerIdx = this.getDealerIndex();

        // Safety check: if dealer not found, reset to first active player
        if (dealerIdx === -1 && activePlayers.length > 0) {
            this.dealerPlayerId = activePlayers[0];
            dealerIdx = 0;
        }

        this.currentPlayerIndex = (dealerIdx + 1) % activePlayers.length;
    }

    adjustPlayerLives(hostId, playerId, change) {
        if (hostId !== this.creatorId) {
            throw new Error('Solo el host puede cambiar las vidas');
        }

        // Only during round end
        if (this.currentPhase !== 'roundEnd') {
            throw new Error('Solo le puede actualizar entre rondas');
        }

        const player = this.players.get(playerId);
        if (!player) {
            throw new Error('Jugador no encontrado');
        }

        // Calculate new lives
        const newLives = player.lives + change;

        // Don't allow negative lives
        if (newLives < 0) {
            throw new Error('No puedes poner menos de 0 vidas');
        }

        if (newLives > 5) {
            throw new Error('No puedes poner mas de 5 vidas');
        }

        // Update lives
        player.lives = newLives;
    }

    createDeck() {
        const deck = [];

        if (this.deckType === 'spanish') {
            // Baraja Española
            const suits = ['O', 'V', 'E', 'B']; // Oros, Copas, Espadas, Bastos
            const values = [
                { display: '1', value: 1 },
                { display: '2', value: 2 },
                { display: '3', value: 3 },
                { display: '4', value: 4 },
                { display: '5', value: 5 },
                { display: '6', value: 6 },
                { display: '7', value: 7 },
                { display: 'S', value: 10 }, // Sota
                { display: 'C', value: 11 }, // Caballo
                { display: 'R', value: 12 }  // Rey
            ];

            suits.forEach(suit => {
                values.forEach(val => {
                    deck.push({
                        suit: suit,
                        value: val.display,
                        numericValue: val.value
                    });
                });
            });
        } else {
            // Bataja de Poker
            const suits = ['♥', '♦', '♣', '♠'];
            const values = [
                { display: 'A', value: 1 },
                { display: '2', value: 2 },
                { display: '3', value: 3 },
                { display: '4', value: 4 },
                { display: '5', value: 5 },
                { display: '6', value: 6 },
                { display: '7', value: 7 },
                { display: '8', value: 8 },
                { display: '9', value: 9 },
                { display: '10', value: 10 },
                { display: 'J', value: 11 },
                { display: 'Q', value: 12 },
                { display: 'K', value: 13 }
            ];

            suits.forEach(suit => {
                values.forEach(val => {
                    deck.push({
                        suit: suit,
                        value: val.display,
                        numericValue: val.value
                    });
                });
            });
        }

        return deck;
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    getActivePlayers() {
        return this.playerOrder.filter(id => {
            const player = this.players.get(id);
            return player && player.lives > 0;
        });
    }

    getDealerIndex() {
        if (!this.dealerPlayerId) return 0;
        const activePlayers = this.getActivePlayers();
        const index = activePlayers.indexOf(this.dealerPlayerId);
        return index >= 0 ? index : 0;
    }

    kickPlayer(kickerId, targetId) {
        if (kickerId !== this.creatorId) {
            throw new Error('Solo el host puede echar');
        }

        if (kickerId === targetId) {
            throw new Error('No te puedes echar a ti mismo');
        }

        if (this.gameStarted) {
            throw new Error('No puedes echar con la partida empezada');
        }

        // Eliminar al juagador
        const player = this.players.get(targetId);
        if (!player) {
            throw new Error('Jugador no encontrado');
        }

        this.players.delete(targetId);
        const index = this.playerOrder.indexOf(targetId);
        if (index > -1) {
            this.playerOrder.splice(index, 1);
        }

        return player.name; // Notificacion
    }

    changeDealer(changerId, newDealerId) {
        // Solo el creador puede cambiar
        if (changerId !== this.creatorId) {
            throw new Error('Solo el host puede cambiar al dealer');
        }

        // Solo durante el cambio de ronda
        if (this.currentPhase !== 'roundEnd') {
            throw new Error('Solo se puede cambiar el dealer entre rondas');
        }

        const activePlayers = this.getActivePlayers();
        const newDealerIndex = activePlayers.indexOf(newDealerId);

        if (newDealerIndex === -1) {
            throw new Error('Jugador seleccionado no encontrado');
        }

        this.dealerPlayerId = newDealerId;
        this.dealerIndex = this.getDealerIndex();
        return true;
    }

    changeDeckType(socketId, newDeckType) {
        if (socketId !== this.creatorId) {
            throw new Error('Solo el host puede cambiar de baraja');
        }

        if (this.currentPhase !== 'waiting') {
            throw new Error('No se puede cambiar de baraja con la partida empezada');
        }

        // Validate deck type
        if (newDeckType !== 'poker' && newDeckType !== 'spanish') {
            throw new Error('Tipo de baraja invalido');
        }

        // Check player count against new max
        const maxPlayers = newDeckType === 'spanish' ? 8 : 10;
        if (this.players.size > maxPlayers) {
            throw new Error(`Demasiados jugadores para usar la baraja (Max ${maxPlayers})`);
        }

        this.deckType = newDeckType;
        this.settings.deckType = newDeckType;

        return true;
    }

    placeBet(socketId, bet) {
        const activePlayers = this.getActivePlayers();
        const currentPlayer = activePlayers[this.currentPlayerIndex];

        if (socketId !== currentPlayer) {
            throw new Error('No es tu turno de apostar');
        }

        // Comprobacion de la apuesta restringida del dealer
        if (socketId === this.dealerPlayerId) {
            const totalBets = Array.from(this.bets.values()).reduce((sum, b) => sum + b, 0);
            if (totalBets + bet === this.currentRound) {
                throw new Error('No puedes apostar un numero de victorias igual al de cartas repartidas');
            }
        }

        this.bets.set(socketId, bet);

        // Pasar al siguiente jugador
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % activePlayers.length;

        // Comprobar que todos los jugadores han apostado
        if (this.bets.size === activePlayers.length) {
            this.currentPhase = 'playing';
            // El jugador siguiente al dealer empieza a jugar
            const dealerIdx = this.getDealerIndex();
            this.currentPlayerIndex = (dealerIdx + 1) % activePlayers.length;
        }
    }

    placeOneCardBet(socketId, willWin) {
        const activePlayers = this.getActivePlayers();
        const currentPlayer = activePlayers[this.currentPlayerIndex];

        if (socketId !== currentPlayer) {
            throw new Error('No es tu turno de apostar');
        }

        if (willWin !== 'win' && willWin !== 'lose') {
            throw new Error('Apuesta invalida solo puedes apostar "win" o "lose"');
        }

        this.oneCardBets.set(socketId, willWin);

        // Pasar al siguiente jugador
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % activePlayers.length;

        // Comprobar que todos los jugadores han apostado
        if (this.oneCardBets.size === activePlayers.length) {
            this.currentPhase = 'oneCardReveal';
            this.resolveOneCardRound();
        }
    }

    resolveOneCardRound() {
        const activePlayers = this.getActivePlayers();

        // Encontrar al ganador de la mano (carta mas alta mas antigua)
        let winnerCard = null;
        let winnerId = null;

        const oneCardTrick = [];

        activePlayers.forEach(playerId => {
            const hand = this.hands.get(playerId);
            const card = hand[0];

            oneCardTrick.push({
                playerId: playerId,
                card: card
            });

            if (!winnerCard || card.numericValue > winnerCard.numericValue) {
                winnerCard = card;
                winnerId = playerId;
            }
        });

        this.lastTrickWinner = winnerId;
        this.lastCompletedTrick = oneCardTrick;

        // Comprobar apuestas y realizar cambios a las vidas
        activePlayers.forEach(playerId => {
            const bet = this.oneCardBets.get(playerId);
            const didWin = playerId === winnerId;

            // Perder 1 vida si te equivocaste
            if ((bet === 'win' && !didWin) || (bet === 'lose' && didWin)) {
                const player = this.players.get(playerId);
                player.lives = Math.max(0, player.lives - 1);
            }
        });

        this.endRound();
    }

    playCard(socketId, cardIndex) {
        const activePlayers = this.getActivePlayers();
        const currentPlayer = activePlayers[this.currentPlayerIndex];

        if (socketId !== currentPlayer) {
            throw new Error('No es tu turno de jugar');
        }

        const hand = this.hands.get(socketId);
        if (cardIndex < 0 || cardIndex >= hand.length) {
            throw new Error('Valor de carta invalido');
        }

        const card = hand.splice(cardIndex, 1)[0];

        if (this.currentTrick.length === 0) {
            this.lastTrickWinner = null;
            this.lastCompletedTrick = [];
        }

        this.currentTrick.push({
            playerId: socketId,
            card
        });

        // Pasar al siguiente jugador
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % activePlayers.length;

        // Comprobar que todas hayan jugado carta
        if (this.currentTrick.length === activePlayers.length) {
            this.resolveTrick();
        }
    }

    resolveTrick() {
        // Encontrar al ganador de la mano (carta mas alta mas antigua)
        let winner = this.currentTrick[0];
        for (let i = 1; i < this.currentTrick.length; i++) {
            if (this.currentTrick[i].card.numericValue > winner.card.numericValue) {
                winner = this.currentTrick[i];
            }
        }

        // Dar victoria de mano al jugador
        const currentWins = this.roundWins.get(winner.playerId);
        this.roundWins.set(winner.playerId, currentWins + 1);

        this.lastTrickWinner = winner.playerId;
        this.lastCompletedTrick = [...this.currentTrick];

        this.currentTrick = [];

        // Comprobar si la ronda a acabado (jugadores con 0 cartas en la mano)
        const hand = this.hands.get(this.getActivePlayers()[0]);
        if (hand.length === 0) {
            this.endRound();
        } else {
            this.currentPhase = 'trickEnd';
        }
    }

    continueToNextTrick() {
        this.currentPhase = 'playing';
        this.lastTrickWinner = null;
        this.lastCompletedTrick = [];
    }

    endRound() {
        const activePlayers = this.getActivePlayers();
        const lifeLosses = {};
        this.lastRoundLifeLosses = {};
        const wasOneCardRound = this.currentRound === 1;
        this.lastRoundDealerId = this.dealerPlayerId;

        // Calcular perdida de vidas en rodas normales (diferencia de apuesta a victorias de mano)
        if (this.currentRound !== 1) {
            const playersWhoBet = Array.from(this.bets.keys());

            playersWhoBet.forEach(playerId => {
                const bet = this.bets.get(playerId);
                const wins = this.roundWins.get(playerId);
                const difference = Math.abs(bet - wins);

                const player = this.players.get(playerId);
                lifeLosses[playerId] = difference;
                player.lives = Math.max(0, player.lives - difference);
            });
        } else {
            const playersWhoBet = Array.from(this.oneCardBets.keys());

            let winnerId = null;
            let winnerCard = null;
            playersWhoBet.forEach(playerId => {
                const hand = this.hands.get(playerId);
                if (hand && hand.length > 0) {
                    const card = hand[0];
                    if (!winnerCard || card.numericValue > winnerCard.numericValue) {
                        winnerCard = card;
                        winnerId = playerId;
                    }
                }
            });

            playersWhoBet.forEach(playerId => {
                const bet = this.oneCardBets.get(playerId);
                const didWin = playerId === winnerId;
                const lost = ((bet === 'win' && !didWin) || (bet === 'lose' && didWin)) ? 1 : 0;
                lifeLosses[playerId] = lost;
            });
        }
        this.lastRoundLifeLosses = lifeLosses;
        this.wasLastRoundOneCard = wasOneCardRound;

        // Comprobar final de la partida
        if (this.checkGameEnd()) {
            return;
        }

        this.currentPhase = 'roundEnd';

        // Cambiar de dealer al finalizar la ronda
        const currentDealerIndex = activePlayers.indexOf(this.dealerPlayerId);
        const nextDealerIndex = (currentDealerIndex + 1) % activePlayers.length;
        this.dealerPlayerId = activePlayers[nextDealerIndex];
        const newActivePlayers = this.getActivePlayers();

        // Cambiar el numero de cartas repartidas en la ronda
        if (newActivePlayers.length === 2) {
            this.currentRound = 1;
        } else if (this.currentRound === 1) {
            this.currentRound = 5;
        } else {
            this.currentRound--;
        }
    }

    checkGameEnd() {
        const activePlayers = this.getActivePlayers();
        if (activePlayers.length <= 1) {
            this.currentPhase = 'gameEnd';
            return true;
        }
        return false;
    }

    getGameState(socketId) {
        const player = this.players.get(socketId);
        const activePlayers = this.getActivePlayers();
        const isOneCardRound = this.currentRound === 1;
        const isSpectator = player && player.lives === 0;

        const spectatorAllCards = isSpectator ? (() => {
            const cards = {};
            this.playerOrder.forEach(playerId => {
                const p = this.players.get(playerId);
                if (p && p.lives > 0) {
                    cards[playerId] = this.hands.get(playerId) || [];
                }
            });
            return cards;
        })() : {};

        const dealerIndexInActivePlayers = this.getDealerIndex();

        // Vista de la ronda de 1 carta con la visibilidad de cartas cambiada
        let otherPlayersCards = {};
        if (isOneCardRound && this.currentPhase === 'oneCardBetting') {
            activePlayers.forEach(playerId => {
                if (playerId !== socketId) {
                    const hand = this.hands.get(playerId);
                    if (hand && hand.length > 0) {
                        otherPlayersCards[playerId] = hand[0];
                    }
                }
            });
        }

        // Revelar cartas al final de la ronda de 1 carta
        let allCards = {};
        if (isOneCardRound && this.currentPhase === 'oneCardReveal') {
            activePlayers.forEach(playerId => {
                const hand = this.hands.get(playerId);
                if (hand && hand.length > 0) {
                    allCards[playerId] = hand[0];
                }
            });
        }

        return {
            gameCode: this.gameCode,
            deckType: this.deckType,
            deckCount: this.deck.length,
            myPlayerId: socketId,
            creatorId: this.creatorId,
            isCreator: socketId === this.creatorId,
            dealerPlayerId: this.dealerPlayerId,
            players: Array.from(this.players.values()).map(p => ({
                id: p.id,
                name: p.name,
                lives: p.lives,
                bet: this.bets.get(p.id),
                oneCardBet: (isOneCardRound || this.wasLastRoundOneCard) ? this.oneCardBets.get(p.id) : undefined,
                wins: this.roundWins.get(p.id) || 0
            })),
            currentRound: this.currentRound,
            currentPhase: this.currentPhase,
            dealerIndex: dealerIndexInActivePlayers,
            currentPlayerIndex: this.currentPlayerIndex,
            currentPlayerId: activePlayers[this.currentPlayerIndex],
            myHand: (isOneCardRound && this.currentPhase === 'oneCardBetting') ? [] : (this.hands.get(socketId) || []),
            otherPlayersCards: otherPlayersCards,
            allCards: allCards,
            spectatorAllCards: spectatorAllCards,
            currentTrick: this.currentTrick,
            gameStarted: this.gameStarted,
            isMyTurn: activePlayers[this.currentPlayerIndex] === socketId,
            isOneCardRound: isOneCardRound,
            lastRoundLifeLosses: this.lastRoundLifeLosses,
            lastTrickWinner: this.lastTrickWinner,
            lastCompletedTrick: this.lastCompletedTrick,
            wasLastRoundOneCard: this.wasLastRoundOneCard,
            lastRoundDealerId: this.lastRoundDealerId,
            isNextDealer: this.dealerPlayerId === socketId
        };
    }
}

module.exports = Game;