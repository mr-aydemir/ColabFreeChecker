import { add_url, canAdd, canStart, remove_url, start, toogleActivity } from "../../js/otomation.js";
const state_map = {
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
        /* document.getElementById('offline_count').innerHTML = "Düzeltme: " + request.offline_count */
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
        toogleActivity(tabs[0].id, enable)
    });
}
function hide_add_url(value) {
    document.getElementById('add_url').hidden = value
    document.getElementById('remove_url').hidden = !value
}


function addUrl_to_otomasyon() {
    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
        const ok = await add_url(tabs[0].url)
        hide_add_url(ok)
    });
}

function removeUrl_from_otomasyon() {
    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
        const ok = await remove_url(tabs[0].url)
        hide_add_url(!ok)
    });
}

function start_process() {
    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
        start(tabs[0])
    });
}


document.getElementById('start').addEventListener('click', start_process);
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
        console.log(state)
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            if (sender.tab.id !== tabs[0].id)
                return
            const state = request
            console.log(state)
            setText(state)
        });
    }
);


window.onload = function () {

    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
        // colab sitesinde değilse
        var url = tabs[0].url.split("#")[0] ?? tabs[0].url
        if (!tabs[0].url.includes("colab")) {
            document.getElementById('state').innerHTML = state_map["WRONG_WEBSITE"]
            document.getElementById('toggle-input').disabled = true
            document.getElementById('add_url').hidden = true
            return
        }
        // colabtaysa sayfadan durum ister
        sendGetStateRequest(tabs)
        document.getElementById('start').hidden = !(await canStart())
        hide_add_url((await canAdd(url)))
    });
}
