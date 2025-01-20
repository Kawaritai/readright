// background.js
let readingSpeed = 300; // Default value
chrome.action.setBadgeBackgroundColor({ color: '#c74332' });

chrome.runtime.onMessage.addListener(function (req, _sender, sendResponse) {
    if (req.readingSpeed) {
        // Update the readingSpeed value
        readingSpeed = req.readingSpeed;
    } else if (req.getReadingSpeed) {
        // Send the existing readingSpeed value
        sendResponse({ readingSpeed: readingSpeed });
    }
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
    // Query the active tab for the word count and reading time
    updateBadgeText(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.active) {
        updateBadgeText(tabId);
    } else if (tab.active) {
        chrome.action.setBadgeText({ text: '' });
    }
});

function updateBadgeText(tabId) {
    try {
        // Set the badge text to the reading time
        chrome.tabs.sendMessage(
            tabId,
            { action: 'getReadingTime', readingSpeed: readingSpeed },
            (r) => {
                if (!r || !r.readingTime) {
                    chrome.action.setBadgeText({ text: '' });
                    return;
                }
                chrome.action.setBadgeText({ text: `${r.readingTime.toString()}m` });
            }
        );
    } catch (e) {
        // Else, clear the badge
        chrome.action.setBadgeText({ text: '' });
    }
}