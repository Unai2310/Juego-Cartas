import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import Lobby from './components/Lobby'
import GameBoard from './components/GameBoard'

const socket = io(import.meta.env.PROD ? window.location.origin : 'http://localhost:3001')

function App() {
    const [gameState, setGameState] = useState(null)
    const [playerName, setPlayerName] = useState('')
    const [gameCode, setGameCode] = useState('')
    const [inGame, setInGame] = useState(false)
    const [error, setError] = useState('')
    const [deckType, setDeckType] = useState('poker')

    useEffect(() => {
        socket.on('gameState', (state) => {
            setGameState(state)
            setInGame(true)
        })

        socket.on('error', (errorMsg) => {
            setError(errorMsg)
            setTimeout(() => setError(''), 3000)
        })

        socket.on('youWereKicked', () => {
            setError('Has sido eliminado por el host')
            setTimeout(() => {
                setInGame(false)
                setGameState(null)
                setGameCode('')
                setChatMessages([])
            }, 2000)
        })

        return () => {
            socket.off('gameState')
            socket.off('error')
        }
    }, [])

    const createGame = () => {
        if (!playerName.trim()) {
            setError('Introduce un nombre')
            setTimeout(() => setError(''), 3000)
            return
        }

        socket.emit('createGame', {
            playerName: playerName.trim(),
            deckType: deckType
        }, (response) => {
            if (response.error) {
                setError(response.error)
                setTimeout(() => setError(''), 3000)
            }
        })
    }

    const joinGame = () => {
        if (!playerName.trim() || !gameCode.trim()) {
            setError('Introduce un nombre y código de sala')
            setTimeout(() => setError(''), 3000)
            return
        }

        socket.emit('joinGame', { gameCode: gameCode.toUpperCase(), playerName }, (response) => {
            if (response.success) {
                setInGame(true)
                setError('') // Limpiar errores al entrar a la parrida
            } else {
                setError(response.error)
                setTimeout(() => setError(''), 3000)
            }
        })
    }

    const kickPlayer = (targetId) => {
        socket.emit('kickPlayer', targetId, (response) => {
            if (!response.success) {
                setError(response.error)
                setTimeout(() => setError(''), 3000)
            }
        })
    }

    const changeDealer = (newDealerId) => {
        socket.emit('changeDealer', newDealerId, (response) => {
            if (!response.success) {
                setError(response.error)
                setTimeout(() => setError(''), 3000)
            }
        })
    }

    const changeDeckType = (newDeckType) => {
        socket.emit('changeDeckType', newDeckType, (response) => {
            if (!response.success) {
                setError(response.error || 'Failed to change deck type')
                setTimeout(() => setError(''), 3000)
            }
        })
    }

    const startGame = (startingDealerId = null) => {
        socket.emit('startGame', startingDealerId)
    }

    const placeBet = (bet) => {
        socket.emit('placeBet', bet)
    }

    const placeOneCardBet = (willWin) => {
        socket.emit('placeOneCardBet', willWin)
    }

    const playCard = (cardIndex) => {
        socket.emit('playCard', cardIndex)
    }

    const continueToNextTrick = () => {
        socket.emit('continueToNextTrick')
    }

    const continueToNextRound = () => {
        socket.emit('continueToNextRound')
    }

    const restartGame = () => {
        socket.emit('restartGame')
    }


    if (!inGame) {
        return (
            <Lobby
                playerName={playerName}
                setPlayerName={setPlayerName}
                gameCode={gameCode}
                setGameCode={setGameCode}
                createGame={createGame}
                joinGame={joinGame}
                deckType={deckType}
                setDeckType={setDeckType}
                socket={socket}
                error={error}
            />
        )
    }

    return (
        <div className="min-h-screen flex">
            <div className="flex-1 p-8">
                <GameBoard
                    socket={socket}
                    gameState={gameState}
                    startGame={startGame}
                    placeBet={placeBet}
                    placeOneCardBet={placeOneCardBet}
                    playCard={playCard}
                    continueToNextRound={continueToNextRound}
                    continueToNextTrick={continueToNextTrick}
                    restartGame={restartGame}
                    kickPlayer={kickPlayer}
                    changeDealer={changeDealer}
                    changeDeckType={changeDeckType}
                    error={error}
                />
            </div>
        </div>
    )
}

export default App