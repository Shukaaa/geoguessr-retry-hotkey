// ==UserScript==
// @name         GeoGuessr Retry Hotkey
// @namespace    https://www.geoguessr.com/
// @version      1.3
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

    // Constants for script metadata, storage keys
    const SCRIPT_NAME = "GeoGuessr Retry Hotkey";
    const LAST_VISITED_MAP_KEY = "lastVisitedMap";
    const PLAY_TRIGGERED_KEY = "playTriggered";
    const RESET_KEY_STORAGE = "resetKey";

    // Retry Hotkey
    let RESET_KEY = localStorage.getItem(RESET_KEY_STORAGE) || "p";

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
        const currentURL = window.location.href;

        // Open Change Key Dialog when CTRL + ALT + KEY is pressed
        if (event.ctrlKey && event.altKey && event.key === RESET_KEY) {
            openChangeKeyDialog();
            return;
        }

        // Trigger reset
        if (currentURL.includes("/game/") && event.key === RESET_KEY) {
            const lastVisitedMap = loadFromStorage(LAST_VISITED_MAP_KEY);

            if (lastVisitedMap) {
                log(`'${RESET_KEY.toUpperCase()}' key pressed. Navigating to: ${lastVisitedMap}`);
                saveToStorage(PLAY_TRIGGERED_KEY, true); // Set playTriggered to true
                window.location.href = lastVisitedMap; // Redirect to the map
            } else {
                log("No last map URL found. Reset aborted.", "warn");
            }
        }

        if (!currentURL.includes("/game/")) {
            log("Reset aborted: Not on a game page.", "warn");
        }
    };

    // Open dialog to change hotkey
    const openChangeKeyDialog = () => {
        const dialog = document.createElement("div");
        dialog.style.position = "fixed";
        dialog.style.top = "50%";
        dialog.style.left = "50%";
        dialog.style.transform = "translate(-50%, -50%)";
        dialog.style.padding = "20px";
        dialog.style.boxShadow = "inset 0 0.0625rem 0 hsla(0,0%,100%,.15),inset 0 -0.0625rem 0 rgba(0,0,0,.25)";
        dialog.style.background = "linear-gradient(180deg,rgba(161,155,217,.6) 0%,rgba(161,155,217,0) 50%,rgba(161,155,217,0) 50%),var(--ds-color-purple-80)";
        dialog.style.color = "var(--ds-color-white)";
        dialog.style.fontSize = "var(--font-size-18)";
        dialog.style.fontWeight = "700";
        dialog.style.fontStyle = "italic";
        dialog.style.zIndex = "10000";
        dialog.style.borderRadius = "0.1875rem";
        dialog.innerHTML = `
            <p>Press a new key to set as the hotkey... (Press DEL to abort)</p>
        `;

        document.body.appendChild(dialog);

        // Handle key press
        const handleNewKey = (event) => {
            if (event.key !== "Delete") {
                RESET_KEY = event.key;
                localStorage.setItem(RESET_KEY_STORAGE, RESET_KEY);
                log(`New hotkey set: ${RESET_KEY}`);
                alert(`New hotkey set to: ${RESET_KEY.toUpperCase()}`);
            }

            document.body.removeChild(dialog);
            document.removeEventListener("keydown", handleNewKey);
        };

        document.addEventListener("keydown", handleNewKey);
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

    // Check for URL Changes
    const observeUrlChanges = () => {
        let lastUrl = window.location.href;

        const observer = new MutationObserver(() => {
            const currentUrl = window.location.href;

            if (currentUrl !== lastUrl) {
                log(`URL changed: ${currentUrl}`);
                lastUrl = currentUrl;

                // Save the map URL if it's a map page
                saveCurrentMap();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    };

    // Initialize script
    const initialize = () => {
        document.addEventListener("keydown", handleKeyDown); // Add keydown listener
        attemptPlay(); // Check if play needs to be triggered
        saveCurrentMap(); // Save the map URL if relevant
        observeUrlChanges(); // Start observing URL changes
    };

    // Run the script
    initialize();
})();
