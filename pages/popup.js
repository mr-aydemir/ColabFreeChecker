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
    port = chrome.tabs.connect(tabs[0].id, { name: "getState" });
    port.postMessage({ url: tabs[0].url });
}
function on_toogle_click(cb) {
    enable = this.checked
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        port = chrome.tabs.connect(tabs[0].id, { name: "toogleActivity" });
        port.postMessage({ enable: enable });
    });
}
function get_next_tab(tabsArray, current_tab) {
    filtered = tabsArray.filter((x) => x.url.includes("colab"));
    t_index = filtered.indexOf(filtered.filter((x) => x.id == current_tab.id)[0]);
    last_index = filtered.length - 1;
    t_next_index = t_index + 1
    if(t_next_index > last_index) t_next_index=0
    next_tab = filtered[t_next_index]
    return next_tab
}

function go_nextTab(tab) {
    chrome.tabs.query({ currentWindow: true }, function (tabsArray) {
        if (tabsArray.length < 2) return;
        next_tab=get_next_tab(tabsArray, tab)
        console.log(tabsArray);
        console.log(next_tab);
        chrome.tabs.reload(tab.id);
        chrome.tabs.update(next_tab.id, { active: true })
        port = chrome.tabs.connect(next_tab.id, { name: "toogleActivity" });
        port.postMessage({ enable: enable, otomation: true });
    });
}


document.getElementById('toggle-input').addEventListener('change', on_toogle_click);
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            if (sender.tab.id !== tabs[0].id)
                return
            state = request
            setText(state)
            if (request.state == "NEXT_TAB") {
                go_nextTab(tabs[0])
            }
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
