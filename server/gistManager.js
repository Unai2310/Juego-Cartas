require('dotenv').config();
const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
let GIST_ID = process.env.GIST_ID || null;

function fetchRankings(callback) {
    if (!GIST_ID) {
        return callback(null, { rankings: [] });
    }

    const options = {
        hostname: 'api.github.com',
        path: `/gists/${GIST_ID}`,
        method: 'GET',
        headers: {
            'User-Agent': 'Card-Game-App',
            'Authorization': `token ${GITHUB_TOKEN}`
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            try {
                const gist = JSON.parse(data);
                const content = gist.files['rankings.json'].content;
                const rankings = JSON.parse(content);
                callback(null, rankings);
            } catch (error) {
                callback(error);
            }
        });
    });

    req.on('error', callback);
    req.end();
}

function saveRankings(rankings, callback) {
    const data = JSON.stringify({
        description: 'Actualizacion Victorias',
        public: false,
        files: {
            'rankings.json': {
                content: JSON.stringify(rankings, null, 2)
            }
        }
    });

    const options = {
        hostname: 'api.github.com',
        path: `/gists/${GIST_ID}`,
        method: 'PATCH',
        headers: {
            'User-Agent': 'Card-Game-App',
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
            try {
                const gist = JSON.parse(responseData);
                callback(null, gist);
            } catch (error) {
                callback(error);
            }
        });
    });

    req.on('error', callback);
    req.write(data);
    req.end();
}


module.exports = {
    fetchRankings,
    saveRankings
};