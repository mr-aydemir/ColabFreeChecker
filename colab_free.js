offline_count=0
function clickVariables(){
    query_string="div.left-pane-top > div:nth-child(3) > paper-icon-button"
    document.querySelector(query_string).click()
}

function clickRamMessageOK() {
    document.querySelector("mwc-button").click()
}

function clickFiles(){
    query_string="div.left-pane-top > div:nth-child(4) > paper-icon-button"
    document.querySelector(query_string).click()
}

function sendMessage(message) {
    data={type: "FROM_PAGE", text: message, offline_count:offline_count}
    chrome.runtime.sendMessage(data);
}


function check_offline() {
    element=document.querySelector("colab-file-view > div.child-files > colab-file-view:nth-child(1) > div.file-title-row > span")
    sendMessage("Kontrol ediliyor")
    if (!element){
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

setInterval(check_offline, 1000)