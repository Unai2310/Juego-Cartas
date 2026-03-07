import { useState } from 'react'

function Lobby({ playerName, setPlayerName, gameCode, setGameCode, createGame, joinGame, deckType, setDeckType, error }) {
    const [showTutorial, setShowTutorial] = useState(false)

    return (
        <div className="min-h-screen flex items-center justify-center">
            {/* Texto del tutorial  1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣ 🔟*/}
            {showTutorial && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-3xl font-bold text-gray-800">Cómo Jugar</h2>
                                <button
                                    onClick={() => setShowTutorial(false)}
                                    className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-6">
                                <section>
                                    <h3 className="text-2xl font-bold text-purple-600 mb-3">Objetivo</h3>
                                    <p className="text-gray-700 text-lg">
                                        Ser el último jugador con vidas. Pierdes vidas cuando fallas tus apuestas.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-2xl font-bold text-purple-600 mb-3">Valores de Cartas</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-gray-700 font-mono text-center">
                                            As (más bajo) → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → J → Q → K (más alto)
                                        </p>
                                        <div className="text-sm text-gray-600 text-center mt-2 space-y-1">
                                            <p>El palo no importa, solo el valor</p>
                                            <p>Si se juega la misma carta gana la que se jugó antes</p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-2xl font-bold text-purple-600 mb-3">Ciclo de Rondas</h3>
                                    <div className="text-gray-700 space-y-2">
                                        <p>El juego progresa: Se reparten 5→4→3→2→1 cartas por ronda, cuando se ha jugado la ronda de 1 carta se vuelve a 5</p>
                                        <p>El repartidor rota cada ronda</p>
                                        <p>El juego continúa hasta que solo queda un jugador con vidas</p>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-2xl font-bold text-purple-600 mb-3">Rondas Normales (5-2 cartas)</h3>

                                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                        <h4 className="font-bold text-lg mb-2">1️⃣ Fase de Reparto</h4>
                                        <p className="text-gray-700">
                                            Se reparten el número de cartas de la ronda en cuestión y se pasa a la ronda de apuestas.
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                        <h4 className="font-bold text-lg mb-3">2️⃣ Fase de Apuestas</h4>
                                        <p className="text-gray-700 mb-3">
                                            Se empieza con el jugador siguiente al Dealer y en esta fase se apostará cuantas manos se ganarán en esta ronda.
                                            El Dealer no podrá hacer que con su apuesta el número de victorias apostadas entre todos y el número de cartas repartidas coincida.
                                        </p>

                                        <div className="bg-white p-3 rounded border-2 border-purple-300">
                                            <div className="text-sm font-semibold text-purple-700 mb-2">Ejemplo: Ronda de 4 cartas</div>
                                            <div className="flex gap-2 justify-center items-end flex-wrap">
                                                <div className="text-center">
                                                    <div className="text-xs mb-1">Iván</div>
                                                    <div className="bg-green-100 border-2 border-green-500 rounded px-3 py-2 font-bold text-lg">2</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs mb-1">Raúl</div>
                                                    <div className="bg-green-100 border-2 border-green-500 rounded px-3 py-2 font-bold text-lg">1</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs mb-1">Óscar</div>
                                                    <div className="bg-green-100 border-2 border-green-500 rounded px-3 py-2 font-bold text-lg">0</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs mb-1">Pedro 👑</div>
                                                    <div className="bg-red-100 border-2 border-red-500 rounded px-3 py-2 font-bold text-lg text-red-700">?</div>
                                                    <div className="text-xs text-red-600 mt-1">¡No puede apostar 1!</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-center mt-2 text-gray-600">
                                                Total: 2+1+0 = 3. Pedro (dealer) no puede apostar 1 (haría 4 total = 4 cartas)
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                        <h4 className="font-bold text-lg mb-3">3️⃣ Fase de Juego</h4>
                                        <div className="text-gray-700 space-y-2 mb-3">
                                            <p>Empieza a jugar el jugador que empezó apostando acabando por el Dealer</p>
                                            <p>Se juega 1 carta por mano. Gana la carta más alta según el <b>Valor de las Cartas.</b></p>
                                            <p>Cuando todo el mundo ha jugado su carta de la mano y se ha declarado al ganador este deberá recoger las cartas para pasar a la siguiente</p>
                                            <p>Todos los jugadores jugarán la ronda hasta el final aunque a media mano ya hayan fallado su apuesta y eso le elimine</p>
                                        </div>

                                        <div className="bg-white p-3 rounded border-2 border-purple-300">
                                            <div className="text-sm font-semibold text-purple-700 mb-2">Ejemplo de mano:</div>
                                            <div className="flex gap-2 justify-center flex-wrap">
                                                <div className="text-center">
                                                    <div className="text-xs mb-1">Iván</div>
                                                    <div className="bg-white border-2 border-gray-400 rounded px-2 py-3 font-bold text-xl">5♥</div>
                                                    <div className="mt-1 bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mx-auto">1</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs mb-1">Raúl</div>
                                                    <div className="bg-white border-2 border-gray-400 rounded px-2 py-3 font-bold text-xl">K♠</div>
                                                    <div className="mt-1 bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mx-auto">2</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs mb-1">Óscar</div>
                                                    <div className="bg-white border-2 border-gray-400 rounded px-2 py-3 font-bold text-xl">7♦</div>
                                                    <div className="mt-1 bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mx-auto">3</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs mb-1">Pedro</div>
                                                    <div className="bg-white border-2 border-gray-400 rounded px-2 py-3 font-bold text-xl">K♣</div>
                                                    <div className="mt-1 bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mx-auto">4</div>
                                                </div>
                                            </div>
                                            <div className="text-center mt-3 p-2 bg-green-50 rounded border border-green-500">
                                                <div className="text-sm font-bold text-green-700">🏆 Raúl gana con K (Rey es la carta más alta más antigua)</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-bold text-lg mb-3">4️⃣ Fase de Recuento</h4>
                                        <p className="text-gray-700 mb-3">
                                            Si tu apuesta no coincide con tus victorias, pierdes vidas = |apuesta - victorias|
                                        </p>

                                        <div className="bg-white p-3 rounded border-2 border-purple-300 mb-3">
                                            <div className="text-sm font-semibold text-purple-700 mb-2">Resultados:</div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                                                    <span className="font-semibold text-sm">Iván: Apostó 2, Ganó 2</span>
                                                    <span className="text-green-700 font-bold">✓ 0 vidas</span>
                                                </div>
                                                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                                                    <span className="font-semibold text-sm">Raúl: Apostó 1, Ganó 3</span>
                                                    <span className="text-red-700 font-bold">✗ 2 vidas</span>
                                                </div>
                                                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                                                    <span className="font-semibold text-sm">Silvia: Apostó 0, Ganó 1</span>
                                                    <span className="text-red-700 font-bold">✗ 1 vida</span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-center mt-2 text-gray-600">
                                                Ejemplo: Raúl apostó 1 pero ganó 3 → |1 - 3| = 2 vidas perdidas
                                            </div>
                                        </div>

                                        <p className="text-gray-700">
                                            Se asignará al siguiente Dealer que será el siguiente en el orden. El creador de la sala puede asignar a uno nuevo en esta fase.
                                        </p>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-2xl font-bold text-purple-600 mb-3">Ronda de 1 Carta (Especial)</h3>
                                    <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                                        <p className="text-gray-700 font-semibold">
                                            ¡NO PUEDES VER TU PROPIA CARTA! Pero puedes ver las de todos los demás.
                                        </p>

                                        <div className="bg-white p-3 rounded border-2 border-blue-300">
                                            <div className="text-sm font-semibold text-blue-700 mb-2">Lo que ves:</div>
                                            <div className="flex gap-2 justify-center flex-wrap">
                                                <div className="text-center">
                                                    <div className="text-xs mb-1">Óscar</div>
                                                    <div className="bg-white border-2 border-gray-400 rounded px-2 py-3 font-bold text-xl">Q♥</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs mb-1">Tú</div>
                                                    <div className="bg-purple-600 rounded px-2 py-3 text-white text-3xl font-bold">?</div>
                                                    <div className="text-xs text-purple-600 mt-1 font-bold">No puedes verla</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs mb-1">Iván</div>
                                                    <div className="bg-white border-2 border-gray-400 rounded px-2 py-3 font-bold text-xl">5♣</div>
                                                </div>
                                            </div>
                                            <div className="mt-3 p-2 bg-blue-50 rounded">
                                                <div className="text-sm text-center">
                                                    Ves Q y 5 nada más el orden de juego para el valor se respetará
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-lg mb-2">Apuestas</h4>
                                            <p className="text-gray-700 mb-3">
                                                Solo apuestas "Gano" o "Pierdo". Pierdes 1 vida si te equivocas.
                                            </p>
                                            <div className="flex gap-2 justify-center items-center flex-wrap">
                                                <div className="bg-green-100 border-2 border-green-500 rounded px-4 py-2 font-bold text-green-700">
                                                    Gano
                                                </div>
                                                <div className="text-2xl">o</div>
                                                <div className="bg-red-100 border-2 border-red-500 rounded px-4 py-2 font-bold text-red-700">
                                                    Pierdo
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-lg mb-2">Sin Restricciones</h4>
                                            <p className="text-gray-700">
                                                ¡Puedes decir lo que quieras! Mentir, engañar, o ayudar - sin restricciones.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-2xl font-bold text-purple-600 mb-3">Duelo (2 Jugadores)</h3>
                                    <div className="bg-red-50 p-4 rounded-lg">
                                        <p className="text-gray-700">
                                            Cuando solo quedan 2 jugadores, solo se juegan rondas de 1 carta hasta que quede un ganador.
                                        </p>
                                    </div>
                                </section>
                            </div>

                            <button
                                onClick={() => setShowTutorial(false)}
                                className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded transition duration-200"
                            >
                                ¡Entendido, Jugar!
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
            </div>
        </div>
    )
}

export default Lobby