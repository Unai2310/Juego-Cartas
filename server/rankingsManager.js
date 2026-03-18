const gistManager = require('./gistManager');

let rankingsCache = { rankings: [] };
let cacheLastUpdated = 0;
const CACHE_DURATION = 30000; 

function getRankings() {
    return rankingsCache.rankings || [];
}

function loadRankingsFromGist(callback) {
    gistManager.fetchRankings((error, data) => {
        if (error) {
            console.error('Error fetching from Gist:', error.message);
            return callback(error);
        }
        rankingsCache = data;
        cacheLastUpdated = Date.now();
        callback(null, data.rankings);
    });
}

function saveRankings(rankings) {
    rankingsCache = { rankings };

    gistManager.saveRankings(rankingsCache, (error) => {
        if (error) {
            console.error('Error saving to Gist:', error.message);
        } else {
            console.log('Rankings saved to Gist successfully');
        }
    });
}

function initialize(callback) {
    loadRankingsFromGist((error) => {
        if (error) {
            console.log('Starting with empty rankings');
            rankingsCache = { rankings: [] };
        }
        callback();
    });
}

function addWin(name) {
    const rankings = getRankings();
    const existingIndex = rankings.findIndex(r => r.name.toLowerCase() === name.toLowerCase());

    const now = Date.now();

    if (existingIndex >= 0) {
        rankings[existingIndex].wins++;
        if (!rankings[existingIndex].timestamps) {
            rankings[existingIndex].timestamps = [];
        }
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
    initialize,
    addWin,
    getTopRankings
};