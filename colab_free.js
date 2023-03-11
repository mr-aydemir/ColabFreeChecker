function clickVariables(){
    query_string="div.left-pane-top > div:nth-child(3) > paper-icon-button"
    document.querySelector(query_string).click()
}

function clickFiles(){
    query_string="div.left-pane-top > div:nth-child(4) > paper-icon-button"
    document.querySelector(query_string).click()
}

function check_offline() {
    element=document.querySelector("colab-file-view > div.child-files > colab-file-view:nth-child(1) > div.file-title-row > span")
    console.log("Kontrol ediliyor")
    if (!element){
        
    console.log("offline düzeltililiyor")
        clickVariables()
        setTimeout(clickFiles, 500)
    }
    else console.log("offline değil")
}

setInterval(check_offline, 1000)