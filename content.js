// content.js
/* Respond to popup queries */
chrome.runtime.onMessage.addListener(function (req, _sender, sendResponse) {
    if (req.action === "getReadingTime") {
        const article = document.querySelector('article');
        const articleText = article ? article.innerText : document.body.innerText;
        const wordCount = articleText.trim().split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / req.readingSpeed);

        // Respond with the reading time and word count
        sendResponse({
            readingTime: readingTime,
            wordCount: wordCount
        });
    }
});
