const offline_query = ".file-tree-name[title='sample_data']"
const left_pane_query = "body > div.notebook-vertical.colab-left-pane-open > div.notebook-horizontal > colab-left-pane"
const ram_message_ok_button_query = "mwc-button"
const variables_tab_query = "div.left-pane-top > div:nth-child(3) > paper-icon-button"
const files_tab_query = "div.left-pane-top > div:nth-child(4) > paper-icon-button"
const file_browser_message_query = "body > div.notebook-vertical.large-notebook.colab-left-pane-open > div.notebook-horizontal > colab-left-pane > colab-resizer > div.resizer-contents > div.left-pane-container > colab-file-browser > div.file-browser-message"
const reload_files_query = "body > div.notebook-vertical.large-notebook.colab-left-pane-open > div.notebook-horizontal > colab-left-pane > colab-resizer > div.resizer-contents > div.left-pane-container > colab-file-browser > colab-file-tree > div.file-tree-buttons > paper-icon-button:nth-child(2)"
const hidden_files_toggle = "#hidden-files-toggle"
const search_query = "body > div.notebook-vertical.colab-left-pane-open > div.notebook-horizontal > colab-left-pane > div > div.left-pane-top > div:nth-child(2) > paper-icon-button"
const connect_button_query = "#top-toolbar > colab-connect-button"

var state = "OFFLINE" // ["OFFLINE", "ONLINE", "LOADING", "DISABLED", "NEXT_TAB"]
var activated = false
var offline_count = 0
var is_loading = false
var is_on_interaction = false

function getState() {
    if (!activated) {
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
    if (!document.querySelector(ram_message_ok_button_query)) return
    document.querySelector(ram_message_ok_button_query).click()
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



function sendMessage(nextstate, same_send = false) {
    if (state == nextstate && !same_send) return
    console.log(state)
    state = nextstate
    const data = { type: "FROM_PAGE", state: state, offline_count: offline_count, activated: activated }
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
function is_there_gpu_allert_message() {
    const element = document.querySelector("body > mwc-dialog");
    return element && element.shadowRoot.textContent.includes("GPU");
}
function recaptcha() {
    return document.querySelector("#recaptcha-anchor > div.recaptcha-checkbox-border")
}
function drive_folder() {
    return document.querySelector(".child-files>colab-file-view>.file-title-row>.file-tree-name[title='drive']")
}

var is_on_interaction2 = false
function doInteraction() {
    if (is_on_interaction2 || is_loading) return
    const randomTime = getRandomInt(10000, 20000)
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
var is_doing_online = false
function doOnline() {
    /* if (!statistics_is_valid()){
        clickConnect()
    } */
    if (is_offline() && !is_doing_online) {
        offline_count++
        sendMessage("OFFLINE")
        clickVariables()
        is_doing_online = true
        setTimeout(function () {
            clickFiles()
            is_doing_online = false
        }, 200)
        if (is_offline()) {
            is_loading = true
        }
    }
    else sendMessage("ONLINE")
}
function check_offline() {
    if (recaptcha()) {
        recaptcha().click()
    }
    if (is_there_gpu_allert_message()) {
        sendMessage("NEXT_TAB")
        return
    }
    if (is_on_interaction) return
    if (is_loading) {
        sendMessage("LOADING")
        if (!is_there_gpu_allert_message()) {
            clickRamMessageOK()
        }
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
function reset() {
    is_loading = false
    is_on_interaction = false
}


var activeInterval = null
function set_enable(value) {
    if (value) {
        activeInterval = setInterval(function () {
            check_offline()
            doInteraction()
        }, 1000)
        activated = true
    }
    else {
        clearInterval(activeInterval)
        activeInterval = null
        activated = false
        reset()
    }
}
function connectDrive() {
    document.querySelector("paper-icon-button.mount-drive-button").click()
    const element = document.querySelector("body > mwc-dialog > div > div").textContent.includes("Colaboratory")
    if (!element) {
        document.querySelector("body > mwc-dialog > mwc-button[dialogaction='ok']").click()
    }
    else document.querySelector("body > mwc-dialog > mwc-button[dialogaction='cancel']").click()
}

var drive_folder_interval=null
function clear_drive_folder_interval() {
    clearInterval(drive_folder_interval)
}
function otomation() {
    var drive_connect_clicked = false
    var drive_connect_paper_showed=false
    if (is_left_pane_closed()) {
        clickFiles()
    }
    drive_folder_interval = setInterval(() => {
        if(!drive_connect_paper_showed){
            var element=document.querySelector("paper-icon-button.mount-drive-button")
            if (!element) return
            element.click()
            drive_connect_paper_showed=true
        }
        else if (!drive_connect_clicked) {
            var element = document.querySelector("body > mwc-dialog > div > div")
            if (!element) return
            var disconnect_label = element.textContent.includes("Colaboratory")
            if (!disconnect_label) {
                document.querySelector("body > mwc-dialog > mwc-button[dialogaction='ok']").click()
                console.log("connect ok clicked");
                drive_connect_clicked = true
            }
            else {
                document.querySelector("body > mwc-dialog > mwc-button[dialogaction='cancel']").click()
                drive_connect_clicked = true
            }
        }
        else {
            if (!drive_folder()) {
                var element=document.querySelector("paper-icon-button[icon='colab:folder-refresh']")
                if(element) element.click()
                return
            }
            document.querySelector("colab-run-button").click()

            set_enable(false)
            set_enable(true)
            clear_drive_folder_interval()
        }
    }, 1000);
}


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
            if (response.otomation) {
                otomation()
            } else
                set_enable(response.enable)
            sendMessage(getState(), true)
        });

    }
});
//!document.querySelector("#message-area-secondary").ariaHidden && document.querySelector("#message-area-secondary").shadowRoot.textContent.includes("Drive")
//document.querySelector("#recaptcha-anchor > div.recaptcha-checkbox-border").click()