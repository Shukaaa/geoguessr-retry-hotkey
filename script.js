// ==UserScript==
// @name         GeoGuessr Retry Hotkey
// @namespace    https://www.geoguessr.com/
// @version      1.1
// @description  Quickly resets the game by navigating to the last visited map and starting a new game.
// @author       Shukaaa (mr aduchi)
// @match        https://www.geoguessr.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        window.focus
// @license      MIT
// @downloadURL https://update.greasyfork.org/scripts/524965/GeoGuessr%20Retry%20Hotkey.user.js
// @updateURL https://update.greasyfork.org/scripts/524965/GeoGuessr%20Retry%20Hotkey.meta.js
// ==/UserScript==

(function () {
    'use strict';

    // Constants for script metadata, storage keys, and reset key
    const SCRIPT_NAME = "GeoGuessr Retry Hotkey";
    const LAST_VISITED_MAP_KEY = "lastVisitedMap";
    const PLAY_TRIGGERED_KEY = "playTriggered";
    const RESET_KEY = "p"; // Key to trigger the reset functionality

    // Helper: Logging function for consistent console outputs
    const log = (message, level = "log") => {
        const levels = {
            log: console.log,
            warn: console.warn
        };
        const logFunction = levels[level] || console.log;
        logFunction(`[${SCRIPT_NAME}] ${message}`);
    };

    // Helper: Save to GM storage
    const saveToStorage = (key, value) => GM_setValue(key, value);

    // Helper: Load from GM storage
    const loadFromStorage = (key, defaultValue = null) => GM_getValue(key, defaultValue);

    // Handle keydown for resetting the game
    const handleKeyDown = (event) => {
        // Check if the current URL contains "/game/"
        const currentURL = window.location.href;

        if (currentURL.includes("/game/") && event.key === RESET_KEY) {
            const lastVisitedMap = loadFromStorage(LAST_VISITED_MAP_KEY);

            if (lastVisitedMap) {
                log(`'${RESET_KEY.toUpperCase()}' key pressed. Navigating to: ${lastVisitedMap}`);
                saveToStorage(PLAY_TRIGGERED_KEY, true); // Set playTriggered to true
                window.location.href = lastVisitedMap; // Redirect to the map
            } else {
                log("No last map URL found. Reset aborted.", "warn");
            }
        } else if (!currentURL.includes("/game/")) {
            log("Reset aborted: Not on a game page.", "warn");
        }
    };

    // Automatically click the play button on the map page
    const attemptPlay = () => {
        const currentURL = window.location.href;
        const playTriggered = loadFromStorage(PLAY_TRIGGERED_KEY, false);

        if (currentURL.includes("/maps/") && playTriggered) {
            log("Map page detected with playTriggered=true. Attempting to start a new game...");

            // Try finding the play button container
            const playButtonContainer = document.querySelector("div[class*='map-selector_playButtons']");
            if (playButtonContainer) {
                const playButton = playButtonContainer.querySelector("button");
                if (playButton) {
                    saveToStorage(PLAY_TRIGGERED_KEY, false);
                    playButton.focus();
                    setTimeout(() => {
                        playButton.click();
                    }, 50);
                } else {
                    log("'Play' button not found inside container.", "warn");
                }
            } else {
                log("Play button container not found.", "warn");
            }
        }
    };

    // Save the current map URL if on a map page
    const saveCurrentMap = () => {
        const currentURL = window.location.href;
        if (currentURL.includes("/maps/")) {
            log(`Saving current map URL: ${currentURL}`);
            saveToStorage(LAST_VISITED_MAP_KEY, currentURL);
        }
    };

    // Initialize script
    const initialize = () => {
        document.addEventListener("keydown", handleKeyDown); // Add keydown listener
        attemptPlay(); // Check if play needs to be triggered
        saveCurrentMap(); // Save the map URL if relevant
    };

    // Run the script
    initialize();
})();
