# HTML5 Games Mapping

This project supports launching HTML5 games via React Native WebView with an external host and a local fallback.

- External host: `https://tittoos.games/<gameId>/index.html`
- Local fallback (dev): `http://localhost:<backend_port>/games/<gameId>`

The RN `GamePlayerScreen` constructs the external URL when a `gameId` is provided and automatically falls back to the local URL if the external host fails or returns an HTTP error. Both URLs include `token` and `matchId` query params when available.

Game IDs should match the folder names under `backend/public/games/`. Example folders:

- `ludo`
- `carrom`
- `chess`
- `checkers`
- `tic-tac-toe`
- `solitaire`
- `snake`
- `bubble-shooter`
- `2048`
- `dice-duel` (previously misnamed `deice`)
- `rummy`
- `teen-patti`
- `poker`
- `callbreak`
- `sapsidy`
- `blackjack`
- `baccarat`
- `roulette`
- `andar-bahar`
- `word-swipe`
- `word-connect`
- `crossword-mini`

WebView bridge contract:

- Each game page posts a message to RN with: `{ event: 'gameFinished', winner?: string, score?: number, rewards: number }`
- The app calls `POST /match/end` with `{ matchId, winner?, score?, rewards }` and shows a victory popup.

Notes:

- For dev, locally open `http://localhost:4001/games/<gameId>/` to preview stubs.
- To add a new game, create `backend/public/games/<gameId>/index.html` derived from `_template.html` and add a button in `MatchesScreen`.