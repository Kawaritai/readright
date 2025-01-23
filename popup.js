// popup.js
/** DOM elements */
const readingTimeElement = document.getElementById("readingTime");
const wordCountElement = document.getElementById("wordCounter");
const readingSpeedInput = document.getElementById("readingSpeed");
const invertIconInput = document.getElementById("invertIcon");

/** Sets visibility of reading details */
const contentDiv = document.getElementById("content");
const msg = document.getElementById("msg"); // Shown in case of no info

/* POP-UP ACTIONS */
document.addEventListener("DOMContentLoaded", async function () {
  // 0. Ensure invertIcon correctly checked
  chrome.storage.local.get(["isLightMode"], (result) => {
    invertIconInput.checked = result.isLightMode;
  });

  let readingSpeed;
  // 1. Get the existing readingSpeed value
  chrome.runtime.sendMessage({ action: "getReadingSpeed" }, (res) => {
    // Update the input field with the existing value
    readingSpeed = res.readingSpeed;
    document.getElementById("readingSpeed").value = readingSpeed;

    // 2. Query content script for reading time
    queryCurrentTab(readingSpeed);
  });
});

/* Update the reading speed on input field change */
readingSpeedInput.addEventListener("input", function () {
  const value = parseInt(readingSpeedInput.value);
  if (isNaN(value)) {
    return;
  }

  // Save the reading speed to background script
  chrome.runtime.sendMessage({
    action: "setReadingSpeed",
    readingSpeed: value,
  });

  // Update the reading time
  let wordCount = parseInt(wordCountElement.textContent);
  let readingTime = Math.ceil(wordCount / value);
  updateReadingTime(readingTime);
});

/* Update the icon color on checkbox change */
invertIconInput.addEventListener("change", function () {
  const isLightMode = invertIconInput.checked;
  chrome.runtime.sendMessage({ action: "setIcon", isLightMode: isLightMode });
});

/* Query the current tab for reading time / word count */
function queryCurrentTab(readingSpeed) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id, // active Tab
      {
        // Message
        action: "getReadingTime",
        readingSpeed: readingSpeed,
      },
      updatePopup // Callback
    );
  });
}

/* Update the fields in the popup */
function updatePopup(response) {
  if (
    chrome.runtime.lastError ||
    !response ||
    !response.readingTime ||
    !response.wordCount
  ) {
    setContentVisibility(false);
    return;
  }

  setContentVisibility(true);
  updateReadingTime(response.readingTime);
  updateWordCount(response.wordCount);
}

/** Helper functions to set popup HTML fields */
function updateReadingTime(time) {
  readingTimeElement.textContent = `${time} minutes`;
  chrome.action.setBadgeText({ text: `${time.toString()}m` });
}

function updateWordCount(count) {
  wordCountElement.textContent = `${count} words`;
}

function setContentVisibility(isVisible) {
  msg.style.display = isVisible ? "none" : "block";
  contentDiv.style.display = isVisible ? "block" : "none";
}
