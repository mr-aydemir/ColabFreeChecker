function injectTheScript() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.executeScript(tabs[0].id, { file: "colab_free.js" });
        document.getElementById('state').innerHTML = "Activated"
        document.getElementById("clickactivity").hidden = false
    });
}
document.getElementById('clickactivity').addEventListener('click', injectTheScript);
function setText(request) {
    if (request.type ||
        request.type === "FROM_PAGE") {
        document.getElementById('state').innerHTML = request.text
        document.getElementById('offline_count').innerHTML = request.offline_count > 0 ? request.offline_count : ""
    }
}
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            if (sender.tab.id !== tabs[0].id)
                return
            setText(request)
        });
    }
);

window.onload = function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        console.log(tabs[0])

        if (!tabs[0].url.includes("colab")) {
            document.getElementById('state').innerHTML = "Colab sitesinde değilsiniz"
            document.getElementById("clickactivity").hidden = true
        }
        else {
            document.getElementById('state').innerHTML = "Aktif Değil"
            document.getElementById("clickactivity").hidden = false
            chrome.tabs.sendRequest(tabs[0].id, { method: "getState" }, function (response) {
                if (response.method !== "getState") return
                setText(request)
            })
        }
    });
}
