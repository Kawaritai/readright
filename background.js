// background.js
let readingSpeed = 300; // Default value
let isLightMode = false;

// Permanent badge bg color
chrome.action.setBadgeBackgroundColor({ color: "#c74332" });

// Get the `readingSpeed` WPM from local storage
chrome.storage.local.get(["readingSpeed"]).then((result) => {
  readingSpeed = result.readingSpeed || readingSpeed;
});

// Get light/dark mode preference (`isLightMode`)
// Use the black outlines for light mode, white outlines for dark mode
chrome.storage.local.get(["isLightMode"], (result) => {
  isLightMode =
    result.isLightMode !== undefined ? result.isLightMode : isLightMode;
  updateIconColor(isLightMode);
});

/** Respond to runtime requests */
chrome.runtime.onMessage.addListener(function (req, _sender, sendResponse) {
  switch (req.action) {
    case "setReadingSpeed":
      updateReadingSpeed(req.readingSpeed);
      break;
    case "getReadingSpeed":
      sendResponse({ readingSpeed: readingSpeed });
      break;
    case "setIcon":
      updateIconColor(req.isLightMode);
      break;
    case "getIcon":
      sendResponse({ isLightMode: isLightMode });
      break;
    default:
      break;
  }
});

/** Change banner on tab switches */
chrome.tabs.onActivated.addListener(function (activeInfo) {
  updateBadgeText(activeInfo.tabId);
});

/** Change banner on tab updates of ACTIVE tab */
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (tab.active) {
    updateBadgeText(tabId);
  }
});

/** Helper functions */
/* Update the badge text with the reading time */
async function updateBadgeText(tabId) {
  // Get tab info
  await chrome.tabs.get(tabId, function (tab) {
    // Check if the tab is a webpage
    if (!isWebPage(tab)) {
      chrome.action.setBadgeText({ text: "" });
      return;
    }
  });
  // Set the badge text to the reading time
  chrome.tabs.sendMessage(
    tabId,
    { action: "getReadingTime", readingSpeed: readingSpeed },
    (res) => {
      if (chrome.runtime.lastError || !res || !res.readingTime) {
        chrome.action.setBadgeText({ text: "" });
        return;
      }
      chrome.action.setBadgeText({ text: `${res.readingTime.toString()}m` });
    }
  );
}

/* Update the icon color from light or dark mode */
function updateIconColor(isLightMode) {
  // Set local storage value
  chrome.storage.local.set({ isLightMode: isLightMode });

  // Update the icon color
  const iconName = isLightMode ? "icon-light.png" : "icon-dark.png";
  const iconPath = chrome.runtime.getURL(iconName);

  chrome.action.setIcon({
    path: {
      16: iconPath,
      32: iconPath,
      48: iconPath,
    },
  });
}

/** Update the reading speed (WPM) */
function updateReadingSpeed(speed) {
  // Update the reading speed
  readingSpeed = speed;
  // Save the reading speed to local storage
  chrome.storage.local.set({ readingSpeed: speed });
}

/** Check if the tab is a webpage (i.e. a content script could be present) */
function isWebPage(tab) {
  return tab.url && tab.url.startsWith("http");
}
