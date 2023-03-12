const offline_query = "colab-file-view > div.child-files > colab-file-view:nth-child(1) > div.file-title-row > span"
const left_pane_query = "body > div.notebook-vertical.colab-left-pane-open > div.notebook-horizontal > colab-left-pane"
const ram_message_ok_button_query = "mwc-button"
const variables_tab_query = "div.left-pane-top > div:nth-child(3) > paper-icon-button"
const files_tab_query = "div.left-pane-top > div:nth-child(4) > paper-icon-button"





state = "OFFLINE" // ["OFFLINE", "ONLINE", "LOADING"]
activated = true
offline_count = 0
is_loading = false

function clickVariables() {
    document.querySelector(variables_tab_query).click()
}

function clickRamMessageOK() {
    if (!document.querySelector("mwc-button")) return
    document.querySelector("mwc-button").click()
}

function clickFiles() {
    document.querySelector(files_tab_query).click()
}

function sendMessage(state) {
    state = state
    data = { type: "FROM_PAGE", state: state, offline_count: offline_count, activated: activated }
    chrome.runtime.sendMessage(data);
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(state)
        if (request.method == "getState") {
            console.log(state)
            sendMessage(state)
        }
    }
);

chrome.extension.onRequest.addListener(
    function (request, sender, sendResponse) {
        if (request.method == "getState") {
            data = { type: "FROM_PAGE", state: state, offline_count: offline_count, method: "getState", activated: activated }
            sendResponse(data);
        }
    }
);
function is_offline() {
    return !document.querySelector(offline_query)
}
function is_left_pane_closed() {
    return !document.querySelector(left_pane_query)
}

function doOnline() {
    if (is_offline()) {
        offline_count++
        sendMessage("OFFLINE")
        clickVariables()
        clickFiles()
        if (is_offline()) {
            is_loading = true
        }
    }
    else sendMessage("ONLINE")
}
function check_offline() {
    if (is_loading) {
        sendMessage("LOADING")
        clickRamMessageOK()
        if (is_offline()) return
        is_loading = false
    }
    if (is_left_pane_closed()) {
        clickFiles()
        if (is_offline()) {
            is_loading = true
        }
        return
    }
    doOnline()
}

setInterval(check_offline, 1000)