function injectTheScript() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        // query the active tab, which will be only one tab
        //and inject the script in it
        chrome.tabs.executeScript(tabs[0].id, { file: "colab_free.js" });
        document.getElementById('state').innerHTML = "Activated"
        document.getElementById("clickactivity").disabled = true; 
    });
}
document.getElementById('clickactivity').addEventListener('click', injectTheScript);

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type && request.type === "FROM_PAGE") {
            document.getElementById('state').innerHTML = request.text
            document.getElementById('offline_count').innerHTML = request.offline_count
            sendResponse("ok");
        }
    }
);