# Unity Game Starter (Dice Battle Prototype)

## Folder Structure

```
unity-game/
└─ Assets/
   └─ Scripts/
      ├─ APIClient.cs
      ├─ MatchManager.cs
      └─ DiceController.cs
```

## Scenes
- `Main.unity` (create in Unity) with:
  - Canvas (Screen Space - Overlay)
  - Text objects: `StatusText`, `ResultText`, `WalletText`
  - Buttons: `StartButton`, `RollButton`, `EndButton`
  - Attach `MatchManager` to an empty GameObject and link UI elements in Inspector.

## Dice Roll UI & Animations
- Use `DiceController` to animate dice roll: simple coroutine flicker numbers before landing.
- Placeholder animation uses text flickering; replace with sprites/anim later.

## Flow
1. `StartMatch()` → backend returns `matchId` + `serverSeed`.
2. `Roll()` → local dice animation and number.
3. `EndMatch()` → backend validation; awards +90 chips; updates wallet.

Configure `APIClient` base URL and token fields in Inspector.
# Unity Demo

This folder contains Unity scripts and an editor utility to generate a demo scene wired to the backend (login, profile update, posting, feed refresh, and lobby chat).

## Prerequisites
- Unity 2019+ with `UnityEngine.UI` package available.
- Import `WebSocketSharp` DLL to `Assets/Plugins/` in your Unity project for WebSocket support.
- Backend running locally at `http://localhost:4000` (see `docs/PHASE2.md`).

## Generate the Demo Scene
1. Open the `unity-game` project folder in Unity.
2. From the top menu, click `Tools > Create Social Demo Scene`.
3. Unity will create and save `Assets/Scenes/SocialDemo.unity` with:
   - Login/Profile: username, display name, bio, status.
   - Posts: content, create post, refresh feed, feed output, status.
   - Lobby Chat: connect, message field, send, chat log, status.
   - Followers: target user id, follow/unfollow, load followers/following, JSON output, status.
   - Direct Messages: peer user id, connect DM, message field, send, DM log, status.
   - Uploads: upload sample image, returned URL, status.

## Usage
- Enter a `username` and click `Login`.
- Enter `display name` and `bio`, click `Update Profile`.
- Create a post with any `content`, then `Refresh Feed` to see posts.
- Click `Connect Lobby` to join chat, type a message, and `Send`.
- Follow/unfollow by entering a target user id and clicking the buttons; load your followers/following after login.
- For DMs, enter a `peer user id`, `Connect DM`, type a message and `Send`.
- Upload a sample image and copy the returned URL; it serves from `/uploads/`.

The scene wires these UI elements to the following scripts under `Assets/Scripts/`:
- `SocialAPI.cs` — REST client used by other managers.
- `ProfileManager.cs` — handles login and profile updates.
- `PostManager.cs` — handles post creation and feed retrieval.
- `ChatManager.cs` — WebSocket client for lobby and DMs.
- `LobbyChatUI.cs` — connects ChatManager to the UI for lobby chat.

If you need to point to a different backend, set `BaseUrl` on the `SocialAPI` object in the scene.