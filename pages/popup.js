state_map = {
    "OFFLINE": "Çevrimdışı",
    "ONLINE": "Çevrimiçi",
    "LOADING": "Yükleniyor...",
    "WRONG_WEBSITE": "Colab sitesinde değilsiniz",
    "DISABLED": "Aktif Değil",
    "NEXT_TAB": "Bir sonraki Tab'a geçildi"
}

function setText(request) {
    if (request.type ||
        request.type === "FROM_PAGE") {
        document.getElementById('state').innerHTML = state_map[request.state]
        document.getElementById('offline_count').innerHTML = "Düzeltme: " + request.offline_count
        document.getElementById('toggle-input').checked = request.activated
    }
}

function sendGetStateRequest(tabs) {
    const port = chrome.tabs.connect(tabs[0].id, { name: "getState" });
    port.postMessage({ url: tabs[0].url });
}
function on_toogle_click(cb) {
    const enable = this.checked
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        port = chrome.tabs.connect(tabs[0].id, { name: "toogleActivity" });
        port.postMessage({ enable: enable });
    });
}



document.getElementById('toggle-input').addEventListener('change', on_toogle_click);
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            if (sender.tab.id !== tabs[0].id)
                return
            const state = request
            setText(state)
        });
    }
);

window.onload = function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (!tabs[0].url.includes("colab")) {
            document.getElementById('state').innerHTML = state_map["WRONG_WEBSITE"]
            document.getElementById('toggle-input').disabled = true
            return
        }
        sendGetStateRequest(tabs)
    });
}
