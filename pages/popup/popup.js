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
// checkboxla açıp kapatma
function on_toogle_click(cb) {
    const enable = this.checked
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        port = chrome.tabs.connect(tabs[0].id, { name: "toogleActivity" });
        port.postMessage({ enable: enable });
    });
}
function addUrl_to_otomasyon() {

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var url = tabs[0].url.split("#")[0]
        chrome.storage.local.get("otomation_urls", function (data) {
            var urls = []
            if (data && data.otomation_urls && data.otomation_urls.length > 0)
                urls = data.otomation_urls
            if (urls.includes(url)) return

            urls.push(url)
            console.log(urls)
            chrome.storage.local.set({
                "otomation_urls": urls
            });
            document.getElementById('add_url').hidden = true
            document.getElementById('remove_url').hidden = false
        });
    });

}

function removeUrl_from_otomasyon() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var url = tabs[0].url.split("#")[0]
        chrome.storage.local.get("otomation_urls", function (data) {
            if (!data || !data.otomation_urls || data.otomation_urls.length == 0) return
            var urls = data.otomation_urls
            if (!urls.includes(url)) return
            urls = urls.filter(function (item) {
                return item !== url
            })
            chrome.storage.local.set({
                "otomation_urls": urls
            });
            document.getElementById('add_url').hidden = false
            document.getElementById('remove_url').hidden = true
        });
    });

}




document.getElementById('add_url').addEventListener('click', addUrl_to_otomasyon);
document.getElementById('remove_url').addEventListener('click', removeUrl_from_otomasyon);

document.getElementById('toggle-input').addEventListener('change', on_toogle_click);
document.querySelector('#go-to-options').addEventListener('click', function () {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
});
// Sayfanın gönderdiği durumla arayüz bilgilendirmeleri
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
        // colab sitesinde değilse
        var url = tabs[0].url.split("#")[0]
        if (!tabs[0].url.includes("colab")) {
            document.getElementById('state').innerHTML = state_map["WRONG_WEBSITE"]
            document.getElementById('toggle-input').disabled = true
            document.getElementById('add_url').hidden = true
            return
        }
        chrome.storage.local.get("otomation_urls", function (data) {
            if (data && data.otomation_urls && data.otomation_urls.length > 0) return
            var urls = data.otomation_urls
            console.log(urls)
            if (url && urls.includes(url)) {
                document.getElementById('add_url').hidden = true
                document.getElementById('remove_url').hidden = false
            }
        });
        // colabtaysa sayfadan durum ister
        sendGetStateRequest(tabs)
    });
}
