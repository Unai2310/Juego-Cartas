# Card Game - Multiplayer Online

A real-time multiplayer card game supporting both Poker (French) and Spanish decks. Features include betting mechanics, 1-card special rounds, and live ranking.

## 🎮 Features

- **Two Deck Types**: Choose between Poker (52 cards, max 10 players) or Spanish (40 cards, max 8 players)
- **Real-time Multiplayer**: Play with friends using room codes
- **Strategic Gameplay**: Bet on how many hands you'll win, with dealer restrictions
- **Special 1-Card Round**: Can't see your own card - bluff, deceive, or help others!
- **Duel Mode**: When 2 players remain, only 1-card rounds are played
- **Live Ranking**: Sidebar shows player ranking by remaining lives
- **Hand-by-Hand Results**: Winner picks up cards after each hand
- **Dealer Selection**: Host can choose random or manual dealer assignment

## 🚀 Tech Stack

**Frontend:**
- React + Vite
- Tailwind CSS
- Socket.IO Client

**Backend:**
- Node.js
- Express
- Socket.IO

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm

### Local Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/card-game.git
cd card-game
```

2. **Install dependencies**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. **Run the development servers**

Terminal 1 (Server):
```bash
cd server
node server.js
```

Terminal 2 (Client):
```bash
cd client
npm run dev
```

4. **Open your browser**
Navigate to `http://localhost:5173`

## 🎯 How to Play

### Game Setup
1. Enter your name in the lobby
2. Choose deck type (Poker or Spanish)
3. Create a new game or join with a room code
4. Host can configure:
   - Deck type
   - Starting dealer (random or manual)
5. Wait for players to join (minimum 2)
6. Host starts the game

### Normal Rounds (5-2 cards)

**1️⃣ Deal Phase**
- Cards are dealt based on current round (5→4→3→2)

**2️⃣ Betting Phase**
- Players bet how many hands they'll win
- Dealer restriction: Total bets cannot equal cards dealt
- Betting order starts after dealer

**3️⃣ Playing Phase**
- Players play one card per hand
- Highest card wins the hand
- Hand winner picks up cards to continue
- Card values: A(1) < 2 < 3... < K(13) for Poker
- Card values: 1 < 2... < 7 < Sota(10) < Caballo(11) < Rey(12) for Spanish

**4️⃣ Scoring Phase**
- Life loss = |bet - actual wins|
- Next dealer is assigned (or host can reassign)

### Special 1-Card Round

- **Can't see your own card!**
- See everyone else's cards
- Bet "Gano" (win) or "Pierdo" (lose)
- Lose 1 life if wrong
- No communication restrictions - bluff freely!

### Duel Mode (2 Players)
When only 2 players remain, only 1-card rounds are played until a winner emerges.

### Victory Condition
Last player with lives remaining wins!

## 🎨 Card Assets

Place card PNG files in `client/public/cards/`:

**Poker Deck:**
- Format: `ValueSuit.png` (e.g., `AH.png`, `KS.png`, `10D.png`)
- Suits: H (Hearts), D (Diamonds), C (Clubs), S (Spades)

**Spanish Deck:**
- Format: `ValueSuit.png` (e.g., `1O.png`, `RB.png`)
- Suits: O (Oros), C (Copas), E (Espadas), B (Bastos)
- Values: 1-7, S (Sota), C (Caballo), R (Rey)

**Card Back:**
- `BACK.png` for hidden cards

## 🌐 Deployment

### Deploy to Render.com

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Create New Web Service on Render**
- Connect your GitHub repository
- Configure:
  - **Build Command**: `npm run install-all && npm run build`
  - **Start Command**: `npm start`
  - **Environment**: Node

3. **Deploy**
Wait 5-10 minutes for build to complete

Your game will be live at: `https://your-app-name.onrender.com`

## 🎮 Game Controls

- **Host Powers** (waiting room):
  - Change deck type
  - Select starting dealer
  - Kick players
  - Start game
  
- **Host Powers** (between rounds):
  - Reassign dealer

- **All Players**:
  - Bet during betting phase
  - Play cards during playing phase
  - Hand winner continues to next hand

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🐛 Known Issues

- Free tier on Render sleeps after 15min inactivity (wakes in ~30sec)

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## 📄 License

MIT License

## 👥 Authors

Your Name - [Your GitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Card game design inspired by traditional betting card games
- Built with React, Socket.IO, and Tailwind CSS

---

**Have fun playing! 🎴**