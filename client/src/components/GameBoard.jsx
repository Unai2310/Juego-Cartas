import { useState } from 'react'
import Tutorial from './Tutorial'
import Rankings from './Rankings'

function GameBoard({ socket, gameState, startGame, placeBet, placeOneCardBet, playCard, continueToNextRound, continueToNextTrick, restartGame, kickPlayer, changeDealer, changeDeckType, error }) {
    const [betInput, setBetInput] = useState('')
    const [selectedDealer, setSelectedDealer] = useState('')
    const [dealerSelectionMode, setDealerSelectionMode] = useState('random')
    const [selectedStartingDealer, setSelectedStartingDealer] = useState('')
    const [showTutorial, setShowTutorial] = useState(false)

    //Ranking
    const [showRankingSubmit, setShowRankingSubmit] = useState(false)
    const [rankingName, setRankingName] = useState('')
    const [rankingError, setRankingError] = useState('')
    const [rankingSuccess, setRankingSuccess] = useState(false)
    const [showRankings, setShowRankings] = useState(false)

    if (!gameState) {
        return (
            <div className="text-white text-center text-lg">
                Cargando...
            </div>
        )
    }

    const handleBetSubmit = (e) => {
        e.preventDefault()
        const bet = parseInt(betInput)
        if (!isNaN(bet) && bet >= 0 && bet <= gameState.currentRound) {
            placeBet(bet)
            setBetInput('')
        }
    }

    const handleOneCardBet = (willWin) => {
        placeOneCardBet(willWin)
    }

    const renderCard = (card, width = 'auto', height = '8rem') => {

        if (card.value === '?' && card.suit === '?') {
            return (
                <img
                    src="/cards/back.PNG"
                    alt="Hidden card"
                    className="rounded-lg shadow-lg"
                    style={{ width, height }}
                />
            );
        }

        let filename;

        if (gameState.deckType === 'spanish') {
            filename = `${card.value}${card.suit}.PNG`;
        } else {
            const suitMap = { '♥': 'H', '♦': 'D', '♣': 'C', '♠': 'S' };
            const valueMap = { 'A': 'A', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': '10', 'J': 'J', 'Q': 'Q', 'K': 'K' };
            filename = `${valueMap[card.value]}${suitMap[card.suit]}.PNG`;
        }

        return (
            <img
                src={`/cards/${filename}`}
                alt={`${card.value} of ${card.suit}`}
                className="rounded-lg shadow-lg"
                style={{ width, height }}
            />
        );


    }

    const renderSpectatorView = () => {
        const isSpectator = gameState.players.find(p => p.id === gameState.myPlayerId)?.lives === 0;

        if (!isSpectator) return null;
        return (
            <div className="mb-6 bg-blue-50 border-2 border-blue-400 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-blue-800 text-center">
                    Vista de Espectador - Todas las manos
                </h3>

                <div className="flex gap-2 flex-wrap justify-center">
                    {gameState.players
                        .filter(p => p.lives > 0)
                        .map(player => {
                            const playerCards = gameState.spectatorAllCards?.[player.id] || [];

                            return (
                                <div key={player.id} className="bg-white rounded-lg p-4 shadow">
                                    <h4 className="font-bold text-lg mb-3 text-center text-gray-800 truncate max-w-[300px]">
                                        {player.name}
                                    </h4>

                                    <div className="flex gap-2 flex-wrap justify-center">
                                        {playerCards.length > 0 ? (
                                            playerCards.map((card, index) => (
                                                <div key={index}>
                                                    {renderCard(card, '4rem', 'auto')}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-gray-500 text-sm">Sin cartas</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        );

    }

    const adjustPlayerLives = (playerId, change) => {
        socket.emit('adjustPlayerLives', { playerId, change }, (response) => {
            if (!response.success) {
                console.error('Failed to adjust lives:', response.error);
            }
        });
    }

    const renderPlayers = () => {
        const sortedPlayers = [...gameState.players].sort((a, b) => b.lives - a.lives);

        let currentRank = 1;
        let previousLives = sortedPlayers[0]?.lives;

        return (
            <div className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-purple-700 to-purple-900 shadow-2xl p-4 overflow-y-auto z-10">
                <div className="fixed top-10 right-10 flex gap-2 z-40">
                    <button
                        onClick={() => setShowTutorial(true)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-200 z-50"
                    >
                        📖 Cómo Jugar
                    </button>
                    <button
                        onClick={() => setShowRankings(true)}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-200 z-50"
                    >
                        🏆 Rankings
                    </button>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-white text-center">Jugadores</h2>

                <div className="space-y-3">
                    {sortedPlayers.map((player, index) => {
                        const isMe = player.id === gameState.myPlayerId;
                        const isDealer = player.id === gameState.dealerPlayerId;
                        const isEliminated = player.lives === 0;

                        if (index > 0 && player.lives < previousLives) {
                            currentRank = index + 1;
                        }
                        previousLives = player.lives;
                        const displayRank = currentRank;

                        return (
                            <div
                                key={player.id}
                                className={`relative rounded-lg p-4 transition-all ${isEliminated
                                    ? 'bg-gray-800 opacity-50'
                                    : isMe
                                        ? 'bg-yellow-500 shadow-lg ring-2 ring-yellow-300'
                                        : 'bg-white'
                                    }`}
                            >
                                {/* Numero Ranking */}
                                <div className="absolute -left-2 -top-2 bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg">
                                    {displayRank}
                                </div>

                                {/* Informacion jugador */}
                                <div className="ml-4">
                                    <div className={`font-bold text-lg mb-1 break-words ${isMe ? 'text-purple-900' : 'text-gray-800'}`}>
                                        {player.name}
                                        {player.id === gameState.creatorId && ' 👑'}
                                        <div className="text-xs text-purple-600 font-semibold">{isDealer && ' Dealer'}</div>
                                    </div>

                                    {/* Lives */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-semibold text-gray-600">Vidas:</span>
                                        <div className="flex gap-1">
                                            {[...Array(gameState.settings?.startingLives || 5)].map((_, i) => (
                                                <span key={i} className="text-sl">
                                                    {i < player.lives ? '❤️' : '🖤'}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {gameState.currentPhase === 'waiting' && gameState.isCreator && player.id !== gameState.myPlayerId && (
                                        <button
                                            onClick={() => kickPlayer(player.id)}
                                            className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-2 rounded transition duration-200"
                                        >
                                            Expulsar
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <Tutorial showTutorial={showTutorial} setShowTutorial={setShowTutorial} />
                <Rankings showRankings={showRankings} setShowRankings={setShowRankings} socket={socket} />
            </div>
        );
    }

    const renderWaitingRoom = () => {
        return (
            <div className="text-center ml-64">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Sala de Espera</h2>
                    <div className="text-base mb-4 text-gray-600">
                        Código de Sala: <span className="font-mono font-bold text-purple-600">{gameState.gameCode}</span>
                    </div>
                    <div className="text-gray-600 mb-6">
                        Comparte este código para unirse a la sala!
                    </div>

                    {/* Seleecion de dealer (Solo Host) */}
                    {gameState.isCreator && (
                        <div className="grid grid-cols-2 gap-4 mb-6">

                            {gameState.isCreator && (
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-3 text-center">
                                        Tipo de Baraja
                                    </label>
                                    <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
                                        <button
                                            onClick={() => changeDeckType('poker')}
                                            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all duration-200 ${gameState.deckType === 'poker'
                                                ? 'bg-white shadow-md text-purple-700 scale-105'
                                                : 'text-gray-600 hover:text-gray-800'
                                                }`}
                                        >
                                            <div className="text-sm">Poker ♠️</div>
                                            <div className="text-xs text-gray-600">52 cartas</div>
                                            <div className="text-xs opacity-75">Max 10 </div>
                                        </button>
                                        <button
                                            onClick={() => changeDeckType('spanish')}
                                            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all duration-200 ${gameState.deckType === 'spanish'
                                                ? 'bg-white shadow-md text-purple-700 scale-105'
                                                : 'text-gray-600 hover:text-gray-800'
                                                }`}
                                        >
                                            <div className="text-sm">Española</div>
                                            <div className="text-xs text-gray-600">40 cartas</div>
                                            <div className="text-xs opacity-75">Max 8 jugadores</div>
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-3 text-center">
                                    Repartidor Inicial
                                </label>

                                <div className="bg-gray-100 p-1 rounded-lg flex gap-1 mb-3">
                                    <button
                                        onClick={() => setDealerSelectionMode('random')}
                                        className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all duration-200 ${dealerSelectionMode === 'random'
                                            ? 'bg-white shadow-md text-purple-700'
                                            : 'text-gray-600 hover:text-gray-800'
                                            }`}
                                    >
                                        🎲 Aleatorio
                                    </button>
                                    <button
                                        onClick={() => setDealerSelectionMode('manual')}
                                        className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all duration-200 ${dealerSelectionMode === 'manual'
                                            ? 'bg-white shadow-md text-purple-700'
                                            : 'text-gray-600 hover:text-gray-800'
                                            }`}
                                    >
                                        👤 Elegir
                                    </button>
                                </div>
                                {/* Manual selection dropdown */}
                                {dealerSelectionMode === 'manual' && (
                                    <select
                                        value={selectedStartingDealer}
                                        onChange={(e) => setSelectedStartingDealer(e.target.value)}
                                        className="w-full border-2 border-purple-300 rounded-lg px-4 py-2 font-semibold text-sm truncate"
                                        style={{ maxWidth: '100%' }}
                                    >
                                        <option value="">Seleccionar jugador...</option>
                                        {gameState.players.map(player => (
                                            <option key={player.id} value={player.id} className="truncate">
                                                {player.name.length > 80 ? player.name.substring(0, 80) + '...' : player.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                    )}

                    {!gameState.isCreator && (
                        <div className="mb-6">

                            <div className="text-center">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm font-bold text-gray-700">
                                        Baraja {gameState.deckType === 'poker' ? 'Poker' : 'Española'}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        {gameState.deckType === 'poker' ? '52 cartas - Max 10' : '40 cartas - Max 8'}
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 text-center mt-2">
                                Solo el creador puede cambiar las opciones antes de empezar
                            </p>
                        </div>
                    )}
                </div>

                {renderPlayers()}

                {gameState.players.length < 2 ? (
                    <div className="text-white text-base">
                        Esperando a un segundo jugador para empezar...
                    </div>
                ) : gameState.isCreator ? (
                    <button
                        onClick={() => startGame(dealerSelectionMode === 'manual' ? selectedStartingDealer : null)}
                        disabled={gameState.players.length < 2 || (dealerSelectionMode === 'manual' && !selectedStartingDealer)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-base transition duration-200"
                    >
                        Comenzar Partida
                    </button>
                ) : (
                    <div className="text-white text-base">
                        Esperando a que el host comience la partida...
                    </div>
                )}
            </div>
        )
    }

    const renderBettingPhase = () => {
        const isSpectator = gameState.players.find(p => p.id === gameState.myPlayerId)?.lives === 0;
        return (
            <div className="ml-64">
                {renderPlayers()}

                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-lg font-bold mb-4 text-gray-800">
                        Ronda: {gameState.currentRound} cartas
                    </h2>
                    <div className="text-base mb-4 text-gray-600">
                        Fase de apuesta - Predice cuantas manos ganarás
                    </div>
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-semibold text-blue-800">
                            Apuestas totales: {gameState.players.reduce((sum, p) => sum + (p.bet !== undefined ? p.bet : 0), 0)} / {gameState.currentRound} cartas
                        </div>
                        {gameState.players.reduce((sum, p) => sum + (p.bet !== undefined ? p.bet : 0), 0) === gameState.currentRound && (
                            <div className="text-xs text-red-600 font-semibold mt-1">
                                ⚠️ El total equivale a las cartas repartidas!
                            </div>
                        )}
                    </div>

                    {gameState.isMyTurn ? (
                        <form onSubmit={handleBetSubmit} className="flex gap-4">
                            <input
                                type="number"
                                min="0"
                                max={gameState.currentRound}
                                value={betInput}
                                onChange={(e) => setBetInput(e.target.value)}
                                className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-purple-600"
                                placeholder={`Introduce tu apuesta (0-${gameState.currentRound})`}
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
                            >
                                Apuesta tus Victorias
                            </button>
                        </form>
                    ) : (
                        <div className="text-gray-600 text-base">
                            {(() => {
                                const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
                                return currentPlayer ? `${currentPlayer.name} esta apostando... Espera tu turno` : 'Waiting for other players to bet...';
                            })()}
                        </div>
                    )}

                    <div className="mb-6 mt-6">
                        <h3 className="text-base font-bold mb-6 text-gray-800">Apuestas:</h3>
                        <div className="flex gap-4 flex-wrap justify-center">
                            {(() => {
                                // Jugadores activos por orden de turno
                                const activePlayers = gameState.players.filter(p => p.lives > 0);
                                const dealerIndex = gameState.dealerIndex;
                                const orderedPlayers = [
                                    ...activePlayers.slice(dealerIndex + 1),
                                    ...activePlayers.slice(0, dealerIndex + 1)
                                ];

                                return orderedPlayers.map((player, index) => {
                                    const hasBet = player.bet !== undefined;
                                    const isMe = player.id === gameState.myPlayerId;

                                    return (
                                        <div key={player.id} className="text-center">
                                            <div className="text-sm font-semibold mb-2 text-center flex items-center justify-center gap-1">
                                                <span className="truncate max-w-[90px]">{player.name}</span>
                                            </div>
                                            {/* Caja de apuestas */}
                                            <div className={`rounded-lg shadow-lg mb-2 border-2 flex items-center justify-center ${hasBet
                                                ? 'bg-white-50 border-green-500'
                                                : 'bg-white border-dashed border-gray-400 opacity-60'
                                                }`} style={{ width: '5.75rem', height: '.7.25rem' }}>
                                                {hasBet ? (
                                                    <div className="text-3xl font-bold text-black-700">{player.bet}</div>
                                                ) : (
                                                    <div className="text-xl font-bold text-gray-400">-</div>
                                                )}
                                            </div>
                                            {/* Orden de jugadores */}
                                            <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mx-auto mb-2 shadow-lg">
                                                {index + 1}
                                            </div>
                                            {isMe && '(Tú)'}
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>
                {!isSpectator && gameState.myHand && gameState.myHand.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-base font-bold mb-4 text-gray-800">Tu mano</h3>
                        <div className="flex gap-4 flex-wrap justify-center">
                            {gameState.myHand.map((card, index) => (
                                <div key={index}>
                                    {renderCard(card)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {renderSpectatorView()}
            </div>
        )
    }

    const renderOneCardBetting = () => {
        return (
            <div className="ml-64">
                {renderPlayers()}

                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-lg font-bold mb-4 text-gray-800">
                        Ronda de 1 carta - Reglas especiales!
                    </h2>
                    <div className="text-base mb-4 text-gray-600">
                        No puedes ver tu carta pero si las de los demás!
                    </div>

                    {/* Mostrar las cartas de los otros jugadores en orden */}
                    <div className="mb-6">
                        <h3 className="text-base font-bold mb-3 text-gray-800">Cartas en Orden de Juego:</h3>
                        <div className="flex gap-4 flex-wrap justify-center">
                            {(() => {
                                // Obtener jugadores activos
                                const activePlayers = gameState.players.filter(p => p.lives > 0);

                                // Reordenar en funcion del orden (primero el jugador tras dealer)
                                const dealerIndex = gameState.dealerIndex;
                                const orderedPlayers = [
                                    ...activePlayers.slice(dealerIndex + 1),
                                    ...activePlayers.slice(0, dealerIndex + 1)
                                ];

                                return orderedPlayers.map((player, index) => {
                                    const isMe = player.id === gameState.myPlayerId;
                                    const card = gameState.otherPlayersCards?.[player.id];
                                    const hasBet = player.oneCardBet !== undefined;
                                    return (
                                        <div key={player.id} className="text-center">
                                            <div className="text-sm font-semibold mb-2 text-center flex items-center justify-center gap-1">
                                                <span className="truncate max-w-[90px]">{player.name}</span>
                                            </div>
                                            {isMe ? (
                                                // Carta oculta
                                                renderCard({ suit: '?', value: '?' })
                                            ) : (
                                                // Cartas del resto de jugadores
                                                renderCard(card)
                                            )}
                                            {/* Apuesta del jugador */}
                                            <div className={`mt-2 mx-auto rounded-lg shadow-lg border-2 flex items-center justify-center ${hasBet
                                                ? (player.oneCardBet === 'win' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500')
                                                : 'bg-white border-dashed border-gray-400 opacity-60'
                                                }`} style={{ width: '3.75rem', height: '2.25rem' }}>
                                                {hasBet ? (
                                                    <div className={`text-sm font-bold ${player.oneCardBet === 'win' ? 'text-green-700' : 'text-red-700'}`}>
                                                        {player.oneCardBet === 'win' ? 'Gano' : 'Pierdo'}
                                                    </div>
                                                ) : (
                                                    <div className="text-base font-bold text-gray-400">?</div>
                                                )}
                                            </div>
                                            {/* Orden de juego */}
                                            <div className="mt-2 bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mx-auto shadow-lg">
                                                {index + 1}
                                            </div>
                                            {isMe && '(Tú)'}
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>

                    {gameState.isMyTurn ? (
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => handleOneCardBet('win')}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg text-base transition duration-200"
                            >
                                Gano
                            </button>
                            <button
                                onClick={() => handleOneCardBet('lose')}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg text-base transition duration-200"
                            >
                                Pierdo
                            </button>
                        </div>
                    ) : (
                        <div className="text-gray-600 text-base text-center">
                            {(() => {
                                const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
                                return currentPlayer ? `${currentPlayer.name} esta apostando... Espera tu turno` : 'Waiting for other players to bet...';
                            })()}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const renderPlayingPhase = () => {
        const isSpectator = gameState.players.find(p => p.id === gameState.myPlayerId)?.lives === 0;
        return (
            <div className="ml-64">
                {renderPlayers()}

                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-lg font-bold mb-4 text-gray-800">
                        Ronda: {gameState.currentRound} cartas
                    </h2>
                    <div className="text-base mb-4 text-gray-600">
                        Fase de juego
                    </div>
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-semibold text-blue-800">
                            Apuestas totales: {gameState.players.reduce((sum, p) => sum + (p.bet !== undefined ? p.bet : 0), 0)} Victorias para {gameState.currentRound} cartas
                        </div>
                    </div>

                    {/* Orden de juego - Mostrar espacios de juego rellenado al jugar */}
                    {(!gameState.lastTrickWinner || gameState.currentTrick.length > 0) && (
                        <div className="mb-6">
                            <h3 className="text-base font-bold mb-3 text-gray-800">Orden de Juego:</h3>
                            <div className="flex gap-4 flex-wrap justify-center">
                                {(() => {
                                    const activePlayers = gameState.players.filter(p => p.lives > 0);

                                    // Reordenar por orden de juego
                                    const dealerIndex = gameState.dealerIndex;
                                    const orderedPlayers = [
                                        ...activePlayers.slice(dealerIndex + 1),
                                        ...activePlayers.slice(0, dealerIndex + 1)
                                    ];

                                    return orderedPlayers.map((player, index) => {
                                        const isMe = player.id === gameState.myPlayerId;
                                        // Comprobar si el jugador ha jugado este turno
                                        const playedCard = gameState.currentTrick.find(t => t.playerId === player.id);
                                        const hasBet = player.bet !== undefined;

                                        return (
                                            <div key={player.id} className="text-center">
                                                <div className="text-sm font-semibold mb-2 text-center flex items-center justify-center gap-1">
                                                    <span className="truncate max-w-[90px]">{player.name}</span>
                                                </div>
                                                {playedCard ? (
                                                    // Jugar Carta
                                                    renderCard(playedCard.card)
                                                ) : (
                                                    // Mostrar PlaceHolder
                                                    <div className="bg-white rounded-lg shadow-lg border-2 border-dashed border-gray-400 flex items-center justify-center opacity-60" style={{ width: '5rem', height: '8rem' }}>

                                                    </div>
                                                )}
                                                {/* Caja de apuestas */}
                                                <div className={`rounded-lg shadow-lg border-2 flex items-center justify-center mb-2 mt-2 ${player.bet === player.wins ? 'bg-white-50 border-green-500' : 'bg-white-50 border-red-500'}`}
                                                    style={{ width: 'auto', height: '.5.25rem' }}>
                                                    {hasBet ? (
                                                        <div className="text-xs font-bold text-gray-700">
                                                            V:{player.wins}  A:{player.bet || 0}
                                                        </div>
                                                    ) : (
                                                        <div className="text-xl font-bold text-gray-400">-</div>
                                                    )}
                                                </div>
                                                {/* Orden de juego */}
                                                <div className="mt-2 bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mx-auto shadow-lg">
                                                    {index + 1}
                                                </div>
                                                {isMe && '(Tú)'}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    )}

                    {/* Ultimo ganador con cartas visibles */}
                    {gameState.lastTrickWinner && gameState.lastCompletedTrick && gameState.lastCompletedTrick.length > 0 && (
                        <div className="mb-6">
                            <div className="mb-4 p-3 bg-green-50 rounded-lg border-2 border-green-500 text-center">
                                <div className="text-base font-semibold text-green-800">
                                    🏆 <span className="truncate max-w-[1000px]">{gameState.players.find(p => p.id === gameState.lastTrickWinner)?.name}</span> ganó la mano!
                                </div>
                            </div>

                            {/* Mostrar mano completa */}
                            <h3 className="text-base font-bold mb-3 text-gray-800">Mano Jugada:</h3>
                            <div className="flex gap-4 flex-wrap justify-center mb-6">
                                {gameState.lastCompletedTrick.map((play, index) => {
                                    const player = gameState.players.find(p => p.id === play.playerId)
                                    const isMe = player.id === gameState.myPlayerId;
                                    return (
                                        <div key={index} className="text-center">
                                            <div className="text-sm font-semibold mb-2">
                                                {player?.name}
                                            </div>
                                            {renderCard(play.card)}
                                            <div className="mt-2 bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mx-auto shadow-lg">
                                                {index + 1}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
                {renderSpectatorView()}
                {!isSpectator && gameState.myHand && gameState.myHand.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-base font-bold mb-4 text-gray-800">Tu mano</h3>
                        {gameState.isMyTurn ? (
                            <div>
                                <div className="text-green-600 font-semibold mb-3">Tu turno - Haz click en una carta para jugarla!</div>
                                <div className="flex gap-4 flex-wrap justify-center">
                                    {gameState.myHand.map((card, index) => (
                                        <button
                                            key={index}
                                            onClick={() => playCard(index)}
                                            className="transform hover:scale-105 transition duration-200 hover:shadow-2xl"
                                        >
                                            {renderCard(card)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="text-gray-600 mb-3">
                                    {(() => {
                                        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
                                        return currentPlayer ? `${currentPlayer.name} esta jugando... espera tu turno` : 'Waiting for other players...';
                                    })()}
                                </div>
                                <div className="flex gap-4 flex-wrap justify-center">
                                    {gameState.myHand.map((card, index) => (
                                        <div key={index} className="opacity-60">
                                            {renderCard(card)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    const renderTrickEnd = () => {
        const isSpectator = gameState.players.find(p => p.id === gameState.myPlayerId)?.lives === 0;
        return (
            <div className="ml-64">
                {renderPlayers()}

                <div className="bg-white rounded-lg shadow-lg p-6 mb-3 text-center">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Mano Completada!</h2>

                    {/* Anuncio del jugador ganador de la ronda */}
                    {gameState.lastTrickWinner && (
                        <div className="mb-4 p-3 bg-green-50 rounded-lg border-2 border-green-500 text-center">
                            <div className="text-base font-semibold text-green-800 flex items-center justify-center gap-1">
                                🏆 <span className="truncate max-w-[1000px]">{gameState.players.find(p => p.id === gameState.lastTrickWinner)?.name}</span> ganó la mano!
                            </div>
                        </div>
                    )}

                    {/* Mostrar mano completa */}
                    <h3 className="text-base font-bold mb-3 text-gray-800">Mano Jugada:</h3>
                    <div className="flex gap-4 flex-wrap justify-center mb-6">
                        {gameState.lastCompletedTrick.map((play, index) => {
                            const player = gameState.players.find(p => p.id === play.playerId);
                            const hasBet = player.bet !== undefined;
                            return (
                                <div key={index} className="text-center">
                                    <div className="text-sm font-semibold mb-2 truncate max-w-[90px]">{player?.name}</div>
                                    {renderCard(play.card)}
                                    {/* Caja de apuestas */}
                                    <div className={`rounded-lg shadow-lg border-2 flex items-center justify-center mb-2 mt-2 ${player.bet === player.wins ? 'bg-white-50 border-green-500' : 'bg-white-50 border-red-500'}`}
                                        style={{ width: 'auto', height: '.5.25rem' }}>
                                        {hasBet ? (
                                            <div className="text-xs font-bold text-gray-700">
                                                V:{player.wins}  A:{player.bet || 0}
                                            </div>
                                        ) : (
                                            <div className="text-xl font-bold text-gray-400">-</div>
                                        )}
                                    </div>
                                    <div className="mt-2 bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mx-auto shadow-lg">
                                        {index + 1}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* Boton de continuar (Solo al ganador de la mano) */}
                    {gameState.lastTrickWinner === gameState.myPlayerId ? (
                        <button
                            onClick={continueToNextTrick}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-base transition duration-200"
                        >
                            Recoger Cartas y Continuar a la siguiente mano
                        </button>
                    ) : (
                        <div className="text-gray-600 text-base flex items-center gap-1 justify-center">
                            <span>Esperando a que</span>
                            <span className="truncate max-w-[300px]">{gameState.players.find(p => p.id === gameState.lastTrickWinner)?.name}</span>
                            <span>recoja las cartas...</span>
                        </div>
                    )}
                </div>
                {!isSpectator && gameState.myHand && gameState.myHand.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-base font-bold mb-4 text-gray-800">Tu mano</h3>
                        <div className="flex gap-4 flex-wrap justify-center">
                            {gameState.myHand.map((card, index) => (
                                <div key={index}>
                                    {renderCard(card)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {renderSpectatorView()}
            </div>
        );
    }

    const renderRoundEnd = () => {
        const activePlayers = gameState.players.filter(p => p.lives > 0);
        return (
            <div className="ml-64">
                {renderPlayers()}
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Ronda Finalizada!</h2>
                    {gameState.lastCompletedTrick && gameState.lastCompletedTrick.length > 0 && (
                        <div className="mb-6">
                            {/* Anuncio del jugador ganador de la ronda */}
                            {gameState.lastTrickWinner && (
                                <div className="mb-4 p-3 bg-green-50 rounded-lg border-2 border-green-500 text-center">
                                    <div className="text-lg font-semibold text-green-800 flex items-center justify-center gap-1">
                                        🏆 <span className="truncate max-w-[300px]">{gameState.players.find(p => p.id === gameState.lastTrickWinner)?.name}</span> ganó la mano!
                                    </div>
                                </div>
                            )}

                            {/* Mostrar todas las cartas en orden */}
                            <h3 className="text-base font-bold mb-3 text-gray-800">Cartas Reveladas:</h3>
                            <div className="flex gap-4 flex-wrap justify-center mb-6">
                                {(() => {
                                    // Reordenar al orden de la ronda
                                    const activePlayers = gameState.players.filter(p => p.lives > 0);
                                    const lastRoundDealerIndex = activePlayers.findIndex(p => p.id === gameState.lastRoundDealerId);

                                    const orderedPlayerIds = [
                                        ...activePlayers.slice(lastRoundDealerIndex + 1).map(p => p.id),
                                        ...activePlayers.slice(0, lastRoundDealerIndex + 1).map(p => p.id)
                                    ];

                                    const orderedTrick = [...gameState.lastCompletedTrick].sort((a, b) => {
                                        return orderedPlayerIds.indexOf(a.playerId) - orderedPlayerIds.indexOf(b.playerId);
                                    });

                                    return orderedTrick.map((play, index) => {
                                        const player = gameState.players.find(p => p.id === play.playerId);
                                        return (
                                            <div key={play.playerId} className="text-center">
                                                <div className="text-sm font-semibold mb-2 truncate max-w-[90px]">{player?.name}</div>
                                                {renderCard(play.card)}
                                                <div className="mt-2 bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mx-auto shadow-lg">
                                                    {index + 1}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    )}
                    {gameState.lastRoundLifeLosses && Object.keys(gameState.lastRoundLifeLosses).length > 0 && (
                        <div className="mb-6 bg-gray-50 rounded-lg p-4">
                            <h3 className="text-base font-bold mb-3 text-gray-700">Vidas perdidas esta ronda:</h3>
                            <div className="space-y-2 text-left max-w-xl mx-auto">
                                {gameState.players
                                    .filter(p => gameState.lastRoundLifeLosses[p.id] !== undefined)
                                    .map(player => {
                                        const livesLost = gameState.lastRoundLifeLosses[player.id];
                                        const bet = player.oneCardBet || player.bet;
                                        const wins = player.wins !== undefined ? player.wins : 0;

                                        const isOneCardRound = gameState.wasLastRoundOneCard;
                                        const actuallyWon = gameState.lastTrickWinner === player.id;

                                        return (
                                            <div key={player.id} className="px-4 py-3 bg-white rounded">
                                                <div className="grid grid-cols-[150px_1fr_auto] gap-4 items-center">
                                                    <span className="font-semibold text-base truncate">
                                                        {player.name}
                                                    </span>
                                                    {player.lives > 0 && (
                                                        isOneCardRound ? (
                                                            <>
                                                                <div className="text-sm text-black-600 flex">
                                                                    Apuesta: <span className="font-bold">{bet === 'win' ? 'Gano' : 'Pierdo'}</span> /
                                                                    Resultado: <span className="font-bold">{actuallyWon ? 'Ganó' : 'Perdió'}</span>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="text-sm text-black-600 flex">
                                                                    Apuesta: <span className="font-bold">{bet}</span> /
                                                                    Victorias: <span className="font-bold">{wins}</span>
                                                                </div>
                                                            </>
                                                        )
                                                    )}
                                                    <span className={`font-bold ${player.lives === 0 ? 'text-red-800' : (livesLost === 0 ? 'text-green-600' : 'text-red-600')}`}>
                                                        {player.lives === 0 ? '💀 ELIMINADO' : (livesLost === 0 ? '✓ Perdió 0 vidas' : `✗ Perdio ${livesLost} ${livesLost === 1 ? 'vida' : 'vidas'}`)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    )}

                    {/* Host puede cambiar de dealer */}
                    {gameState.isCreator && (
                        <div className="mb-6 bg-blue-50 rounded-lg p-4">
                            <h3 className="text-base font-bold mb-3 text-blue-800">Cambiar Repartidor</h3>
                            <div className="flex gap-4 justify-center items-center">
                                <select
                                    value={selectedDealer}
                                    onChange={(e) => setSelectedDealer(e.target.value)}
                                    className="flex-1 border-2 border-blue-300 rounded px-3 py-2 font-semibold text-sm max-w-xs"
                                >
                                    <option value="">Seleccionar jugador...</option>
                                    {activePlayers.map(player => (
                                        <option key={player.id} value={player.id}>
                                            {player.name.length > 100 ? player.name.substring(0, 100) + '...' : player.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => {
                                        if (selectedDealer) {
                                            changeDealer(selectedDealer);
                                            setSelectedDealer('');
                                        }
                                    }}
                                    disabled={!selectedDealer}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
                                >
                                    Cambiar
                                </button>
                            </div>
                            <div className="text-sm text-gray-600 mt-2">
                                Repartidor actual: {activePlayers[gameState.dealerIndex]?.name}
                            </div>
                            {/* Panel de ajuste de vidas */}
                            {gameState.isCreator && (
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                                    <h4 className="text-base font-bold mb-3 text-blue-800">Ajustar Vidas (Host):</h4>
                                    <div className="space-y-2">
                                        {gameState.players.map(player => (
                                            <div key={player.id} className="flex items-center justify-between bg-white p-3 rounded">
                                                <span className="font-semibold truncate max-w-[150px]">
                                                    {player.name}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => adjustPlayerLives(player.id, -1)}
                                                        disabled={player.lives <= 0}
                                                        className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold w-8 h-8 rounded transition duration-200"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="font-bold text-lg min-w-[3rem] text-center">
                                                        ❤️ {player.lives}
                                                    </span>
                                                    <button
                                                        onClick={() => adjustPlayerLives(player.id, 1)}
                                                        className="bg-green-500 hover:bg-green-600 text-white font-bold w-8 h-8 rounded transition duration-200"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-yellow-700 mt-2">
                                        ⚠️ Los cambios afectan inmediatamente.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    {gameState.isNextDealer ? (
                        <button
                            onClick={continueToNextRound}
                            className="bg-purple-600 hover:bg-purple-700 mt-3 text-white font-bold py-3 px-8 rounded-lg text-base transition duration-200"
                        >
                            Repartir Siguiente Ronda
                        </button>
                    ) : (
                        <div className="text-gray-600 text-base flex items-center gap-1 justify-center">
                            <span>Esperando a que</span>
                            <span className="truncate max-w-[300px]">{activePlayers[gameState.dealerIndex]?.name}</span>
                            <span>reparta la siguiente ronda...</span>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const renderGameEnd = () => {
        const winner = gameState.players.find(p => p.lives > 0);
        const isWinner = winner?.id === gameState.myPlayerId;

        return (
            <div className="ml-64">
                {renderPlayers()}

                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    <h2 className="text-3xl font-bold mb-4 text-gray-800">¡Juego Terminado!</h2>

                    {gameState.lastCompletedTrick && gameState.lastCompletedTrick.length > 0 && (
                        <div className="mb-6">
                            <div className="mb-4 p-3 bg-green-50 rounded-lg border-2 border-green-500 text-center">
                                <div className="text-lg font-semibold text-green-800 flex items-center justify-center gap-1">
                                    🏆 Última mano ganada por: <span className="truncate max-w-[300px]">{gameState.players.find(p => p.id === gameState.lastTrickWinner)?.name}</span>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold mb-3 text-gray-800">Mano Final:</h3>
                            <div className="flex gap-4 flex-wrap justify-center mb-6">
                                {gameState.lastCompletedTrick.map((play, index) => {
                                    const player = gameState.players.find(p => p.id === play.playerId);
                                    return (
                                        <div key={index} className="text-center">
                                            <div className="text-sm font-semibold mb-2 truncate max-w-[90px]">{player?.name}</div>
                                            {renderCard(play.card)}
                                            <div className="mt-2 bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs mx-auto shadow-lg">
                                                {index + 1}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="text-4xl font-bold text-purple-600 mb-4 flex items-center justify-center gap-1">
                        🎉 ¡<span className="truncate max-w-[200px]">{winner?.name}</span> ha ganado! 🎉
                    </div>

                    {/* Ranking submission button for winner */}
                    {isWinner && !showRankingSubmit && !rankingSuccess && (
                        <div className="text-green-800 font-bold text-lg">
                            <button
                                onClick={() => setShowRankingSubmit(true)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg text-xl mb-4 transition duration-200"
                            >
                                🏆 Añadir a Rankings
                            </button>
                        </div>

                    )}

                    {/* Ranking submission form */}
                    {isWinner && showRankingSubmit && !rankingSuccess && (
                        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-6 max-w-md mx-auto">
                            <h3 className="text-xl font-bold mb-4 text-yellow-800">Añadir Victoria al Ranking</h3>

                            {rankingError && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
                                    {rankingError}
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Tu Nombre para el Ranking
                                </label>
                                <input
                                    type="text"
                                    value={rankingName}
                                    onChange={(e) => setRankingName(e.target.value.toUpperCase())}
                                    maxLength={15}
                                    className="w-full shadow border rounded py-2 px-3 text-gray-700 uppercase font-bold text-center text-xl"
                                    placeholder="TU NOMBRE"
                                />
                                <p className="text-xs mt-1 text-gray-600">
                                    Usa el mismo nombre para acumular victorias
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        if (!rankingName.trim()) {
                                            setRankingError('Ingresa un nombre');
                                            setTimeout(() => setRankingError(''), 3000);
                                            return;
                                        }

                                        socket.emit('submitWinToRankings', {
                                            name: rankingName.trim(),
                                            winnerPlayerId: gameState.myPlayerId
                                        }, (response) => {
                                            if (response.success) {
                                                setRankingSuccess(true);
                                                setShowRankingSubmit(false);
                                                setRankingName('');
                                            } else {
                                                setRankingError(response.error);
                                                setTimeout(() => setRankingError(''), 3000);
                                            }
                                        })
                                    }}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded transition duration-200"
                                >
                                    💾 Guardar Victoria
                                </button>
                                <button
                                    onClick={() => {
                                        setShowRankingSubmit(false);
                                        setRankingError('');
                                        setRankingName('');
                                    }}
                                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded transition duration-200"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}

                    {rankingSuccess && (
                        <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 mb-6 max-w-md mx-auto">
                            <div className="text-green-800 font-bold text-lg">
                                ✓ ¡Victoria añadida al ranking!
                            </div>
                        </div>
                    )}


                    {gameState.isCreator && (
                        <button
                            onClick={() => {
                                setRankingSuccess(false);
                                setShowRankingSubmit(false);
                                setRankingName('');
                                setRankingError('');
                                restartGame();
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition duration-200"
                        >
                            Jugar de Nuevo
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div>
            {error && (
                <div className="ml-64 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {gameState.currentPhase === 'waiting' && renderWaitingRoom()}
            {gameState.currentPhase === 'betting' && renderBettingPhase()}
            {gameState.currentPhase === 'oneCardBetting' && renderOneCardBetting()}
            {gameState.currentPhase === 'playing' && renderPlayingPhase()}
            {gameState.currentPhase === 'roundEnd' && renderRoundEnd()}
            {gameState.currentPhase === 'trickEnd' && renderTrickEnd()}
            {gameState.currentPhase === 'gameEnd' && renderGameEnd()}
        </div>
    )
}

export default GameBoard