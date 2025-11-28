# AdBlocker RPG: The Quest for a Clean Web

Welcome to AdBlocker RPG, where your browsing experience becomes an epic quest. Instead of passively hiding annoying advertisements, this extension transforms them into fearsome monsters that you must defeat. Every popup is a dragon, every banner is an orc, and every tracker is a spider waiting to be squashed.

Stop blocking ads. Start fighting them.

## Features

*   **Turn Ads into Enemies**: Automatically detects ads on web pages and replaces them with interactive monster cards.
*   **Dynamic Monster Generation**: The size of the ad determines the monster's power. Small tracking pixels spawn weak "Tracker-Spiders," while massive full-screen overlays summon the dreaded "Fullscreen-Hydra."
*   **Progression System**: Earn XP and Gold for every ad you destroy. Level up your character to deal more damage and take on tougher foes.
*   **Persistent Stats**: Your progress is saved locally via the backend server. Track your total monsters slain and watch your power grow.
*   **Wide Compatibility**: Uses advanced selectors to hunt down Google Ads, Amazon Ads, Taboola, Outbrain, and more.

## The Bestiary

Your enemies vary depending on the intrusion level of the advertisement:

*   **Tiny Tier**: Tracker-Spider, Cookie-Imp (Found in small pixels and invisible trackers)
*   **Small Tier**: Ad-Goblin, Pixel-Rat (Common in sidebars)
*   **Medium Tier**: Banner-Orc, Sidebar-Troll (Standard banner ads)
*   **Large Tier**: Popup-Dragon, Overlay-Demon (Large promotional sections)
*   **Boss Tier**: Fullscreen-Hydra, Interstitial-Leviathan (The massive ads that cover your screen)

## Project Structure

*   `backend/`: Python Flask server that acts as the Game Master. It manages your save state, calculates damage, and generates monster stats.
*   `extension/`: Chrome Extension (Manifest V3) that serves as the game client, injecting the battle interface into web pages.

## Setup Instructions

### 1. Backend Setup (The Game Master)

1.  Create a virtual environment:
    ```bash
    python3 -m venv venv
    ```
2.  Activate the virtual environment:
    ```bash
    source venv/bin/activate  # macOS/Linux
    # or
    venv\Scriptsctivate     # Windows
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the server:
    ```bash
    python backend/app.py
    ```
    The server will start on `http://localhost:5000`. Keep this running while you browse!

### 2. Extension Setup (The Client)

1.  Open Google Chrome and navigate to `chrome://extensions/`.
2.  Enable **Developer mode** using the toggle in the top right corner.
3.  Click the **Load unpacked** button.
4.  Select the `extension/` folder from this project directory.

### 3. How to Play

1.  Ensure the Python backend is running.
2.  Browse the web as normal.
3.  When an ad is detected, it will be replaced by a monster.
4.  Click the **ATTACK!** button on the monster to deal damage.
5.  Reduce its HP to 0 to win XP and Gold.
6.  As you level up, your click damage increases, allowing you to clear pages faster.

## Testing

You can test the backend logic without the browser by running:
```bash
python test_server.py
```

## Disclaimer

This project is a proof of concept for gamified web browsing and is intended for educational purposes.


Updated: 2025-12-19

Updated: 2025-12-19

Updated: 2025-12-19

Updated: 2025-12-19