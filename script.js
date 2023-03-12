state_map = {
    "OFFLINE": "Çevrimdışı",
    "ONLINE": "Çevrimiçi",
    "LOADING": "Yükleniyor...",
    "WRONG_WEBSITE": "Colab sitesinde değilsiniz"
}
function injectTheScript() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        tab = tabs[0]
        chrome.tabs.executeScript(tabs[0].id, { file: "colab_free.js" });
        document.getElementById('state').innerHTML = "Activated"
        document.getElementById("clickactivity").hidden = false
    });
}
document.getElementById('clickactivity').addEventListener('click', injectTheScript);
function setText(request) {
    if (request.type ||
        request.type === "FROM_PAGE") {
        document.getElementById('state').innerHTML = state_map[request.state]
        document.getElementById('offline_count').innerHTML = request.offline_count > 0 ? request.offline_count : ""
        document.getElementById("clickactivity").hidden = request.activated
    }
}
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            if (sender.tab.id !== tabs[0].id)
                return
            state = request
            setText(state)
        });
    }
);

window.onload = function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (!tabs[0].url.includes("colab")) {
            document.getElementById('state').innerHTML = state_map["WRONG_WEBSITE"]
            document.getElementById("clickactivity").hidden = true
        }
        chrome.tabs.sendMessage(tab.id, {type: "getState"})
    });
}
