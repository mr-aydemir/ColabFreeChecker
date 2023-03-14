state_map = {
    "OFFLINE": "Çevrimdışı",
    "ONLINE": "Çevrimiçi",
    "LOADING": "Yükleniyor...",
    "WRONG_WEBSITE": "Colab sitesinde değilsiniz"
}
function injectTheScript() {
    console.log("Colab Free Checker Activated")
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ["colab_free.js"]
          });
        /* chrome.tabs.executeScript(tabs[0].id, { file: "colab_free.js" }); */
        document.getElementById('state').innerHTML = "Activated"
        document.getElementById("clickactivity").disabled = true
    });
}
function setText(request) {
    if (request.type ||
        request.type === "FROM_PAGE") {
        document.getElementById('state').innerHTML = state_map[request.state]
        document.getElementById('offline_count').innerHTML = request.offline_count > 0 ? request.offline_count : ""
        document.getElementById("clickactivity").hidden = request.activated
    }
}

function sendGetStateRequest(tabs) {
    port = chrome.tabs.connect(tabs[0].id,{name: "getState"});
    port.postMessage({url:tabs[0].url});
}

document.getElementById('clickactivity').addEventListener('click', injectTheScript);
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
            return
        }
        sendGetStateRequest(tabs)
    });
}
