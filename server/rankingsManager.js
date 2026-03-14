const fs = require('fs');
const path = require('path');

const RANKINGS_FILE = path.join(__dirname, 'rankings.json');

// Inicializacion del fichero si no existe
function initRankingsFile() {
    try {
        if (!fs.existsSync(RANKINGS_FILE)) {
            fs.writeFileSync(RANKINGS_FILE, JSON.stringify({ rankings: [] }, null, 2));
        } else {
            const data = fs.readFileSync(RANKINGS_FILE, 'utf8');
            if (!data || data.trim() === '') {
                fs.writeFileSync(RANKINGS_FILE, JSON.stringify({ rankings: [] }, null, 2));
            } else {
                JSON.parse(data);
            }
        }
    } catch (error) {
        console.error('Error initializing rankings file, recreating:', error.message);
        fs.writeFileSync(RANKINGS_FILE, JSON.stringify({ rankings: [] }, null, 2));
    }
}

// Leer rankings del fichero
function getRankings() {
    initRankingsFile();
    try {
        const data = fs.readFileSync(RANKINGS_FILE, 'utf8');
        const parsed = JSON.parse(data);
        return parsed.rankings || [];
    } catch (error) {
        console.error('Error reading rankings file:', error.message);
        return [];
    }
}

// Guardar rankigs en el fichero
function saveRankings(rankings) {
    try {
        fs.writeFileSync(RANKINGS_FILE, JSON.stringify({ rankings }, null, 2));
    } catch (error) {
        console.error('Error saving rankings:', error.message);
    }
}

// Añadir victoria
function addWin(name) {
    const rankings = getRankings();
    const existingIndex = rankings.findIndex(r => r.name.toLowerCase() === name.toLowerCase());

    if (existingIndex >= 0) {
        rankings[existingIndex].wins++;
        rankings[existingIndex].timestamps.push(now);
        rankings[existingIndex].lastWin = now;
    } else {
        rankings.push({
            name,
            wins: 1,
            timestamps: [now],
            lastWin: now
        });
    }

    saveRankings(rankings);
    return true;
}

// Obtener top (Primero wins luego mas recientes)
function getTopRankings(limit = 10) {
    const rankings = getRankings();
    return rankings
        .sort((a, b) => {
            if (b.wins !== a.wins) {
                return b.wins - a.wins;
            }
            return a.lastWin - b.lastWin;
        })
        .slice(0, limit)
        .map((r, index) => ({
            rank: index + 1,
            name: r.name,
            wins: r.wins,
            timestamps: r.timestamps || []
        }));
}

module.exports = {
    addWin,
    getTopRankings
};