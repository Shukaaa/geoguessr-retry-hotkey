# GeoGuessr Retry Hotkey

## Description
The **GeoGuessr Retry Hotkey** Tampermonkey script enhances your GeoGuessr experience by allowing you to reset the game quickly with a single key press. It navigates to the last visited map and starts a new game automatically.

## Browser Support
The script has been tested in the following browsers: `Chrome`, `Opera GX`, and `Firefox`.

## Installation
1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser.
2. Install the script via [GreasyFork](https://greasyfork.org/de/scripts/524965-geoguessr-retry-hotkey)

## How It Works
1. **Trigger Reset:** Press the `P` key during a game to reset.
2. **Redirect to Map:** The script redirects you to the last visited map.
3. **Start New Game:** On the map page, the script clicks the "Play" button automatically to begin a new game.

## Settings
To open the settings you need to open the in-game settings menu when you're inside a game.

![Settings](https://github.com/Shukaaa/geoguessr-retry-hotkey/blob/main/img/settings.png?raw=true)

There are two settings:
- **Retry Hotkey:** The key that triggers the retry. Default is `P`.
- **Delay:** The delay in milliseconds before the "Play" button is clicked. Default is `50`.

## Script Logic
### Key Components:
- **Key Handling:** Listens for the `P` key (`RESET_KEY`) while in a game (`/game/` URL).
- **URL Storage:** Stores the last visited map's URL in Tampermonkey's storage when you visit a map page (`/maps/` URL).
- **Play Trigger:** Ensures the "Play" button is clicked only if the reset process was triggered (using a `playTriggered` flag).
