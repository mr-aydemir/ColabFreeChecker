offline_count=0
is_busy=false
function clickVariables(){
    query_string="div.left-pane-top > div:nth-child(3) > paper-icon-button"
    document.querySelector(query_string).click()
    is_busy=false
}

function clickRamMessageOK() {
    document.querySelector("mwc-button").click()
}

function clickFiles(){
    query_string="div.left-pane-top > div:nth-child(4) > paper-icon-button"
    document.querySelector(query_string).click()
}

function sendMessage(message) {
    data={type: "FROM_PAGE",  text: message, offline_count:offline_count}
    chrome.runtime.sendMessage(data);
}
chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if(request.method == "getState"){
            data={type: "FROM_PAGE",  text: message, offline_count:offline_count, method: "getState"}
            sendResponse(data); //same as innerText
            console.log(data);
        }
    }
);
function is_offline() {
    return !document.querySelector("colab-file-view > div.child-files > colab-file-view:nth-child(1) > div.file-title-row > span")
}
function is_left_pane_closed(params) {
    return !document.querySelector("body > div.notebook-vertical.colab-left-pane-open > div.notebook-horizontal > colab-left-pane")
}
function doOnline() {
    if (is_offline()){
        is_busy=true
        offline_count++
        sendMessage("Çevrimdışı düzeltililiyor")
        clickVariables()
        if (document.querySelector("mwc-button")){
            clickRamMessageOK()
        }
        setTimeout(clickFiles, 1000)
    }
    else sendMessage("Çevrimdışı Değil")
}
is_loading=false
function check_offline() {
    if (is_busy) return
    if (is_loading){
        sendMessage("Yükleniyor...")
        if (document.querySelector("mwc-button")){
            clickRamMessageOK()
        }
        if (is_offline()) return
        is_loading=false
    }
    if(is_left_pane_closed()){
        clickFiles()
        if (is_offline()) {
            is_loading=true
        }
        return
    }
    doOnline()
}

setInterval(check_offline, 1000)