// Listen for the toolbar icon click
chrome.action.onClicked.addListener((tab) => {
    // Send a message to the active tab
    chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_TIMER" });
});

// Listen for the keyboard shortcut (Alt+Shift+T)
chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-timer") {
        // Query the active tab to send the message
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "TOGGLE_TIMER" });
            }
        });
    }
});