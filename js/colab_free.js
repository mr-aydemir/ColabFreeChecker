const offline_query = "body > div.notebook-vertical.colab-left-pane-open > div.notebook-horizontal > colab-left-pane > colab-resizer > div.resizer-contents > div.left-pane-container > colab-file-browser > colab-file-tree > div.files-root"
const left_pane_query = "body > div.notebook-vertical.colab-left-pane-open > div.notebook-horizontal > colab-left-pane"
const ram_message_ok_button_query = "mwc-button"
const variables_tab_query = "div.left-pane-top > div:nth-child(3) > paper-icon-button"
const files_tab_query = "div.left-pane-top > div:nth-child(4) > paper-icon-button"
const file_browser_message_query = "body > div.notebook-vertical.large-notebook.colab-left-pane-open > div.notebook-horizontal > colab-left-pane > colab-resizer > div.resizer-contents > div.left-pane-container > colab-file-browser > div.file-browser-message"
const reload_files_query = "body > div.notebook-vertical.large-notebook.colab-left-pane-open > div.notebook-horizontal > colab-left-pane > colab-resizer > div.resizer-contents > div.left-pane-container > colab-file-browser > colab-file-tree > div.file-tree-buttons > paper-icon-button:nth-child(2)"
const hidden_files_toggle = "#hidden-files-toggle"
const search_query = "body > div.notebook-vertical.colab-left-pane-open > div.notebook-horizontal > colab-left-pane > div > div.left-pane-top > div:nth-child(2) > paper-icon-button"
const connect_button_query="#top-toolbar > colab-connect-button"

state = "OFFLINE" // ["OFFLINE", "ONLINE", "LOADING", "DISABLED"]
activated = false
offline_count = 0
is_loading = false
is_on_interaction = false

function getState() {
    if (!activated){
        return "DISABLED"
    }
    if (is_loading) {
        return "LOADING"
    }
    if (is_offline()) {
        return "OFFLINE"
    }
    return "ONLINE"
}

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
function clickHiddenFiles() {
    document.querySelector(hidden_files_toggle).click()
}
function clickSearch() {
    document.querySelector(search_query).click()
}


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
is_on_interaction2 = false
function doInteraction() {
    if (is_on_interaction2 || is_loading) return
    randomTime = getRandomInt(10000, 20000)
    is_on_interaction2 = true
    setTimeout(function () {
        is_on_interaction = true
        clickSearch()
        setTimeout(function () {
            clickFiles()
            is_on_interaction = false
            is_on_interaction2 = false
        }, 200)
    }, randomTime)
}


function sendMessage(nextstate, same_send=false) {
    if (state==nextstate && !same_send) return
    console.log(state)
    state = nextstate
    data = { type: "FROM_PAGE", state: state, offline_count: offline_count, activated: activated }
    chrome.runtime.sendMessage(data);
}

function is_offline() {
    return !document.querySelector(offline_query)
}
function is_left_pane_closed() {
    return !document.querySelector(left_pane_query)
}
function shadowRoot() {
   return document.querySelector(connect_button_query).shadowRoot
}
function connect_button() {
    return shadowRoot().querySelector("#connect")
}
function statistics_is_valid() {
        return connect_button.querySelector("#connect-button-resource-display")
}
function clickConnect() {
    connect_button().click()
}

function doOnline() {
    /* if (!statistics_is_valid()){
        clickConnect()
    } */
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
    if (is_on_interaction) return
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
function reset() { // ["OFFLINE", "ONLINE", "LOADING", "DISABLED"]
    is_loading = false
    is_on_interaction = false
}
activeInterval = null
chrome.runtime.onConnect.addListener(function (port) {
    if (port.name == "getState") {
        port.onMessage.addListener(function (response) {
            sendMessage(getState(), true)
            console.log(state)
        });
    }
    else if (port.name == "toogleActivity") {
        
        port.onMessage.addListener(function (response) {
            console.log("toogle");
            if (response.enable) {
                activeInterval = setInterval(check_offline, 1000)
                activated = true
            }
            else {
                clearInterval(activeInterval)
                activeInterval = null
                activated = false
                reset()
            }
            
            sendMessage(getState(), true)
        });

    }
});
/* setInterval(check_offline, 1000) */
//setInterval(doInteraction, 1000)