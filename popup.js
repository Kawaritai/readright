// popup.js
const readingTimeElement = document.getElementById('readingTime');
const wordCountElement = document.getElementById('wordCounter');
const readingSpeedInput = document.getElementById('readingSpeed');

const contentDiv = document.getElementById('content');
const msg = document.getElementById('msg');

/* Query information and update the popup */
document.addEventListener('DOMContentLoaded', async function () {
    let readingSpeed;
    // 1. Get the existing readingSpeed value
    await chrome.runtime.sendMessage({ getReadingSpeed: true }, (res) => {
        // Update the input field with the existing value
        readingSpeed = res.readingSpeed;
        document.getElementById('readingSpeed').value = readingSpeed;

        // 2. Query content script for reading time
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    action: "getReadingTime",
                    readingSpeed: readingSpeed
                },
                updatePopup
            );
        });
    });
});


/* Update the reading speed */
readingSpeedInput.addEventListener('input', function () {
    const value = parseInt(readingSpeedInput.value);
    if (isNaN(value)) {
        return;
    }

    // Save the reading speed to background script
    chrome.runtime.sendMessage({ readingSpeed: value });

    // Update the reading time
    let wordCount = parseInt(wordCountElement.textContent);
    let readingTime = Math.ceil(wordCount / value);
    updateReadingTime(readingTime);
});



/* Update the fields in the popup */
function updatePopup(response) {
    try {
        if (!response || !response.readingTime || !response.wordCount) {
            setContentVisibility(false);
        }
        
        setContentVisibility(true);
        const readingTime = response.readingTime;
        const wordCount = response.wordCount;

        updateReadingTime(readingTime);
        updateWordCount(wordCount);
    } catch (e) {
        setContentVisibility(false);
    }

}

function updateReadingTime(time) {
    readingTimeElement.textContent = `${time} minutes`;
    chrome.action.setBadgeText({ text: `${time.toString()}m` });
}

function updateWordCount(count) {
    wordCountElement.textContent = `${count} words`;
}


function setContentVisibility(isVisible) {
    msg.style.display = isVisible ? 'none' : 'block';
    contentDiv.style.display = isVisible ? 'block' : 'none';
}