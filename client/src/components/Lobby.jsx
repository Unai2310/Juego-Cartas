import { useState } from 'react'
import Tutorial from './Tutorial'
import Rankings from './Rankings'

function Lobby({ playerName, setPlayerName, gameCode, setGameCode, createGame, joinGame, deckType, setDeckType, error, socket }) {
    const [showTutorial, setShowTutorial] = useState(false)
    const [showRankings, setShowRankings] = useState(false)

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-96">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
                    Discreto
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Tu nombre
                    </label>
                    <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-600"
                        placeholder="Introduce tu Nombre"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-3 text-center">
                        Tipo de Baraja
                    </label>
                    <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
                        <button
                            onClick={() => setDeckType('poker')}
                            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all duration-200 ${deckType === 'poker'
                                    ? 'bg-white shadow-md text-purple-700 scale-105'
                                    : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            <div className="text-sm">Poker ♠️</div>
                            <div className="text-xs text-gray-600">52 cartas</div>
                            <div className="text-xs opacity-75">Max 10 </div>
                        </button>
                        <button
                            onClick={() => setDeckType('spanish')}
                            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all duration-200 ${deckType === 'spanish'
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

                <button
                    onClick={createGame}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded mb-4 transition duration-200"
                >
                    Crear Partida
                </button>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">O</span>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Código de Sala
                    </label>
                    <input
                        type="text"
                        value={gameCode}
                        onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-600"
                        placeholder="Introduce código de sala"
                    />
                </div>

                <button
                    onClick={joinGame}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition duration-200"
                >
                    Unirse a Partida
                </button>
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500"></span>
                    </div>
                </div>
                <button
                    onClick={() => setShowTutorial(true)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-4 transition duration-200"
                >
                    📖 Cómo Jugar
                </button>
                <button
                        onClick={() => setShowRankings(true)}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded mb-4 transition duration-200"
                    >
                        🏆 Rankings
                    </button>
            </div>
            <Tutorial showTutorial={showTutorial} setShowTutorial={setShowTutorial} />
            <Rankings showRankings={showRankings} setShowRankings={setShowRankings} socket={socket} />
        </div>
    )
}

export default Lobby