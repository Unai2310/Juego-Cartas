import { useState, useEffect } from 'react'

function Rankings({ showRankings, setShowRankings, socket }) {
    const [rankings, setRankings] = useState([])
    const [loading, setLoading] = useState(false)
    const [expandedRank, setExpandedRank] = useState(null) // Track which rank is expanded

    useEffect(() => {
        if (showRankings) {
            loadRankings()
        }
    }, [showRankings])

    const loadRankings = () => {
        setLoading(true)
        socket.emit('getTopRankings', 10, (response) => {
            setLoading(false)
            if (response.success) {
                setRankings(response.rankings)
            }
        })
    }

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    if (!showRankings) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] p-4">
            <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    <div className="sticky top-0 bg-gradient-to-b from-yellow-400 to-yellow-600 z-10 flex justify-between items-center mb-6 pb-4 border-b-4 border-yellow-700">
                        <h2 className="text-4xl font-bold text-gray-900">🏆 TOP 10 🏆</h2>
                        <button
                            onClick={() => setShowRankings(false)}
                            className="text-gray-900 hover:text-gray-700 text-4xl font-bold leading-none"
                        >
                            ×
                        </button>
                    </div>

                    <div className="bg-black bg-opacity-20 rounded-lg p-4">
                        {loading ? (
                            <div className="text-center text-white text-xl py-8">
                                Cargando rankings...
                            </div>
                        ) : rankings.length === 0 ? (
                            <div className="text-center text-white text-xl py-8">
                                No hay rankings aún.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {rankings.map((entry) => (
                                    <div key={entry.rank}>
                                        {/* Main ranking row - clickable */}
                                        <div
                                            onClick={() => setExpandedRank(expandedRank === entry.rank ? null : entry.rank)}
                                            className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${entry.rank === 1
                                                ? 'bg-yellow-300 text-gray-900 shadow-lg scale-105 border-4 border-yellow-500'
                                                : entry.rank === 2
                                                    ? 'bg-gray-300 text-gray-900 border-4 border-gray-400'
                                                    : entry.rank === 3
                                                        ? 'bg-orange-400 text-gray-900 border-4 border-orange-500'
                                                        : 'bg-white bg-opacity-90 text-gray-900'
                                                } ${expandedRank === entry.rank ? 'rounded-b-none' : ''}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`font-bold w-16 text-center ${entry.rank <= 3 ? 'text-4xl' : 'text-2xl'}`}>
                                                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `${entry.rank}.`}
                                                </div>
                                                <div className={`font-bold uppercase ${entry.rank <= 3 ? 'text-2xl' : 'text-lg'}`}>
                                                    {entry.name}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`font-bold ${entry.rank <= 3 ? 'text-2xl' : 'text-lg'}`}>
                                                    {entry.wins} 🏆
                                                </div>
                                                <div className="text-sm">
                                                    {expandedRank === entry.rank ? '▲' : '▼'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded details - timestamps */}
                                        {expandedRank === entry.rank && entry.timestamps && entry.timestamps.length > 0 && (
                                            <div className="bg-gray-100 p-4 rounded-b-lg border-2 border-t-0 border-gray-300">
                                                <h4 className="font-bold text-sm mb-2 text-gray-700">Historial de victorias:</h4>
                                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                                    {entry.timestamps.map((_, index) => {
                                                        const reverseIndex = entry.timestamps.length - 1 - index;
                                                        const timestamp = entry.timestamps[reverseIndex];
                                                        return (
                                                            <div key={index} className="text-xs text-gray-600 flex justify-between">
                                                                <span>Victoria #{reverseIndex + 1}</span>
                                                                <span>{formatDate(timestamp)}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={loadRankings}
                        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-lg"
                    >
                        🔄 Actualizar Rankings
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Rankings