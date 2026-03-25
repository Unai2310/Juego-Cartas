const express = require('express');
const http = require('http');
const { Server } = require('socket.io');;
const path = require('path');
const cors = require('cors');
const Game = require('./game');
const rankingsManager = require('./rankingsManager');

const app = express();
const httpServer = http.createServer(app);

rankingsManager.initialize(() => { console.log('Rankings loaded from Gist'); });

app.use(cors({
    origin: true,
    credentials: true
}));

const io = new Server(httpServer, {
    cors: {
        origin: true,
        credentials: true,
        methods: ["GET", "POST"]
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
});

const PORT = process.env.PORT || 3001;

// Guardar partidas activas: gameCode -> Game instance
const games = new Map();

// Generar un numero de sala aleatorio
function generateGameCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    let currentGameCode = null;

    // Crear una nueva partida
    socket.on('createGame', (settings, callback) => {
        const gameCode = generateGameCode();
        const game = new Game(gameCode, settings);
        games.set(gameCode, game);

        game.addPlayer(socket.id, settings.playerName);
        currentGameCode = gameCode;
        socket.join(gameCode);

        callback({ success: true, gameCode });
        io.to(gameCode).emit('gameState', game.getGameState(socket.id));
    });

    // Unirse a partida existente
    socket.on('joinGame', (data, callback) => {
        const { gameCode, playerName } = data;
        const game = games.get(gameCode);

        if (!game) {
            callback({ success: false, error: 'Game not found' });
            return;
        }

        try {
            game.addPlayer(socket.id, playerName);
            currentGameCode = gameCode;
            socket.join(gameCode);

            callback({ success: true });

            // Mandar actualización a jugadores de la partida
            game.playerOrder.forEach(playerId => {
                io.to(playerId).emit('gameState', game.getGameState(playerId));
            });
        } catch (error) {
            callback({ success: false, error: error.message });
        }
    });

    // Cambiar tipo de baraja
    socket.on('changeDeckType', (newDeckType, callback) => {
        if (!currentGameCode) {
            return callback({ success: false, error: 'No hay una partida activa' });
        }

        const game = games.get(currentGameCode);
        if (!game) {
            return callback({ success: false, error: 'Partida no encontrada' });
        }

        try {
            game.changeDeckType(socket.id, newDeckType);

            // Mandar actualización a jugadores de la partida
            game.playerOrder.forEach(playerId => {
                io.to(playerId).emit('gameState', game.getGameState(playerId));
            });

            callback({ success: true });
        } catch (error) {
            callback({ success: false, error: error.message });
        }
    });

    // Cambiar de dealer
    socket.on('changeDealer', (newDealerId, callback) => {
        if (!currentGameCode) return;

        const game = games.get(currentGameCode);
        if (!game) return;

        try {
            game.changeDealer(socket.id, newDealerId);

            // Mandar actualización a jugadores de la partida
            game.playerOrder.forEach(playerId => {
                io.to(playerId).emit('gameState', game.getGameState(playerId));
            });

            callback({ success: true });
        } catch (error) {
            callback({ success: false, error: error.message });
        }
    });

    // Empezar la partida
    socket.on('startGame', (startingDealerId) => {
        if (!currentGameCode) return;

        const game = games.get(currentGameCode);
        if (!game) return;

        try {
            game.startGame(startingDealerId);

            // Mandar actualización a jugadores de la partida
            game.playerOrder.forEach(playerId => {
                io.to(playerId).emit('gameState', game.getGameState(playerId));
            });
        } catch (error) {
            socket.emit('error', error.message);
        }
    });

    // Realizar apuesta de victorias (rondas de 5 a 2 cartas)
    socket.on('placeBet', (bet) => {
        if (!currentGameCode) return;

        const game = games.get(currentGameCode);
        if (!game) return;

        try {
            game.placeBet(socket.id, bet);

            // Mandar actualización a jugadores de la partida
            game.playerOrder.forEach(playerId => {
                io.to(playerId).emit('gameState', game.getGameState(playerId));
            });
        } catch (error) {
            socket.emit('error', error.message);
        }
    });

    // Realizar apuesta de resultado (Ronda de 1 carta)
    socket.on('placeOneCardBet', (willWin) => {
        if (!currentGameCode) return;

        const game = games.get(currentGameCode);
        if (!game) return;

        try {
            game.placeOneCardBet(socket.id, willWin);

            // Mandar actualización a jugadores de la partida
            game.playerOrder.forEach(playerId => {
                io.to(playerId).emit('gameState', game.getGameState(playerId));
            });
        } catch (error) {
            socket.emit('error', error.message);
        }
    });

    // Jugar una carta
    socket.on('playCard', (cardIndex) => {
        if (!currentGameCode) return;

        const game = games.get(currentGameCode);
        if (!game) return;

        try {
            game.playCard(socket.id, cardIndex);

            // Mandar actualización a jugadores de la partida
            game.playerOrder.forEach(playerId => {
                io.to(playerId).emit('gameState', game.getGameState(playerId));
            });
        } catch (error) {
            socket.emit('error', error.message);
        }
    });

    // Cambiar de mano (El ganadaor de la anterior pulsa el boton)
    socket.on('continueToNextTrick', () => {
        if (!currentGameCode) return;

        const game = games.get(currentGameCode);
        if (!game) return;

        try {
            game.continueToNextTrick();

            // Send game state to all players
            game.playerOrder.forEach(playerId => {
                io.to(playerId).emit('gameState', game.getGameState(playerId));
            });
        } catch (error) {
            socket.emit('error', error.message);
        }
    });

    // Continuar a la siguiente ronda
    socket.on('continueToNextRound', () => {
        if (!currentGameCode) return;

        const game = games.get(currentGameCode);
        if (!game) return;

        try {
            // Comprobar si la partida ha acabado
            if (game.currentPhase === 'gameEnd') {
                console.log('Game ended, notifying players');
                io.to(currentGameCode).emit('gameEnded');
                games.delete(currentGameCode);
                return;
            }
            game.startNewRound();

            // Mandar actualización a jugadores de la partida
            game.playerOrder.forEach(playerId => {
                io.to(playerId).emit('gameState', game.getGameState(playerId));
            });
        } catch (error) {
            socket.emit('error', error.message);
        }
    });

    // Gestion de vidas
    socket.on('adjustPlayerLives', ({ playerId, change }, callback) => {
        if (!currentGameCode) {
            return callback({ success: false, error: 'No estas en partida' });
        }

        const game = games.get(currentGameCode);
        if (!game) {
            return callback({ success: false, error: 'Partida no encontrada' });
        }

        try {
            game.adjustPlayerLives(socket.id, playerId, change);

            // Notificar a todos los jugadores
            game.playerOrder.forEach(pId => {
                io.to(pId).emit('gameState', game.getGameState(pId));
            });

            callback({ success: true });
        } catch (error) {
            callback({ success: false, error: error.message });
        }
    });

    // Resetear y jugar de nuevo (Boton Jugar de nuevo)
    socket.on('restartGame', () => {
        console.log('Restart game event received from:', socket.id);

        if (!currentGameCode) {
            console.log('No current game code');
            return;
        }

        const game = games.get(currentGameCode);
        if (!game) {
            console.log('Game not found');
            return;
        }

        try {
            console.log('Restarting game...');
            game.restartGame();

            // Mandar actualización a jugadores de la partida
            game.playerOrder.forEach(playerId => {
                io.to(playerId).emit('gameState', game.getGameState(playerId));
            });
            console.log('Game restarted successfully');
        } catch (error) {
            console.log('Error restarting:', error);
            socket.emit('error', error.message);
        }
    });

    // Tratamiento de la desconexion
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        if (currentGameCode) {
            const game = games.get(currentGameCode);
            if (game) {
                game.removePlayer(socket.id);

                // Comprobar si hay jugadores todavia conectados para eliminar la sala
                const socketsInRoom = io.sockets.adapter.rooms.get(currentGameCode);

                if (!socketsInRoom || socketsInRoom.size === 0) {
                    console.log(`Deleting empty game: ${currentGameCode}`);
                    games.delete(currentGameCode);
                } else {
                    // Mandar actualización a jugadores de la partida
                    game.playerOrder.forEach(playerId => {
                        if (socketsInRoom.has(playerId)) {
                            io.to(playerId).emit('gameState', game.getGameState(playerId));
                        }
                    });
                }
            }
        }
    });

    // Echar a un jugador
    socket.on('kickPlayer', (targetId, callback) => {
        console.log('Kick event received. Target:', targetId, 'From:', socket.id);

        if (!currentGameCode) {
            console.log('No current game code');
            return;
        }

        const game = games.get(currentGameCode);
        if (!game) {
            console.log('Game not found');
            return;
        }

        try {
            const kickedName = game.kickPlayer(socket.id, targetId);
            console.log('Player kicked successfully:', kickedName);

            // Notify the kicked player
            io.to(targetId).emit('youWereKicked');

            // Update all remaining players
            game.playerOrder.forEach(playerId => {
                io.to(playerId).emit('gameState', game.getGameState(playerId));
            });

            callback({ success: true, kickedName });
        } catch (error) {
            console.log('Error kicking player:', error.message);
            callback({ success: false, error: error.message });
        }
    });

    // Comprobar si existe el nombre en el ranking
    socket.on('checkRankingName', (name, callback) => {
        try {
            const exists = rankingsManager.nameExists(name);
            callback({ success: true, exists });
        } catch (error) {
            callback({ success: false, error: error.message });
        }
    });

    // Comprobar contraseña para subir registro
    socket.on('verifyRankingPassword', ({ name, password }, callback) => {
        try {
            const valid = rankingsManager.verifyPassword(name, password);
            callback({ success: true, valid });
        } catch (error) {
            callback({ success: false, error: error.message });
        }
    });

    // Actualizar ranking
    socket.on('submitWinToRankings', ({ name, password, winnerPlayerId }, callback) => {
        if (!currentGameCode) {
            return callback({ success: false, error: 'No estas en partida' });
        }

        const game = games.get(currentGameCode);
        if (!game) {
            return callback({ success: false, error: 'Partida no encontrada' });
        }

        if (socket.id !== winnerPlayerId) {
            return callback({ success: false, error: 'Solo el ganador puede subir su resultado' });
        }

        const activePlayers = game.getActivePlayers();
        if (activePlayers.length !== 1 || activePlayers[0] !== winnerPlayerId) {
            return callback({ success: false, error: 'Partida no acabada correctamente' });
        }

        try {
            rankingsManager.addWin(name, password);
            callback({ success: true });
        } catch (error) {
            callback({ success: false, error: error.message });
        }
    });

    // Obtener top rankings
    socket.on('getTopRankings', (limit, callback) => {
        try {
            const rankings = rankingsManager.getTopRankings(limit || 10);
            callback({ success: true, rankings });
        } catch (error) {
            callback({ success: false, error: error.message });
        }
    });

    // Actualizar datos desde Gist
    socket.on('refreshRankingsFromGist', (callback) => {
        try {
            rankingsManager.refreshFromGist((error, rankings) => {
                if (error) {
                    console.error('Error actualizando desde Gist:', error.message);
                    return callback({ success: false, error: error.message });
                }

                const topRankings = rankingsManager.getTopRankings(10);
                console.log('Rankings actualizados al ultimo Gist');
                callback({ success: true, rankings: topRankings });
            });
        } catch (error) {
            console.error('Error actualizando desde Gist:', error.message);
            callback({ success: false, error: error.message });
        }
    });
});

app.use(express.static(path.join(__dirname, '../client/dist')));

/*app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});*/

httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
