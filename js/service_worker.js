/* function get_next_tab(tabsArray, current_tab) {
    const filtered = tabsArray.filter((x) => x.url.includes("colab"));
    const t_index = filtered.indexOf(filtered.filter((x) => x.id == current_tab.id)[0]);
    const last_index = filtered.length - 1;
    var t_next_index = t_index + 1
    if (t_next_index > last_index) t_next_index = 0
    if (t_index == t_next_index) return null
    const next_tab = filtered[t_next_index]
    return next_tab
} */
// tab değiştir işleminde colab sayfaları arasından sırasıyla geçiş olur baştan sonra 1er 1er, sondan 1. colaba
/* function go_nextTab(tab) {
    chrome.tabs.query({ currentWindow: true }, function (tabsArray) {
        // tek bir tab varsa
        if (tabsArray.length < 2) return;
        console.log(tabsArray)
        const next_tab = get_next_tab(tabsArray, tab)

        if (!next_tab) return

        chrome.tabs.reload(tab.id);
        chrome.tabs.update(next_tab.id, { active: true })
        chrome.tabs.reload(next_tab.id);
        
        var enabled = true
        chrome.tabs.onUpdated.addListener(function doOto(tabId, info) {
            if (info.status === 'complete' && tabId == next_tab.id && enabled) {
                const port = chrome.tabs.connect(next_tab.id, { name: "toogleActivity" });
                port.postMessage({ enable: true, otomation: true });
                chrome.tabs.onUpdated.removeListener(doOto);
                enabled = false
            }
        });
    });
} */
function get_next_url(urls, url) {
    const t_index = urls.indexOf(url);
    const last_index = urls.length - 1;
    var t_next_index = t_index + 1
    if (t_next_index > last_index) t_next_index = 0
    if (t_index == t_next_index) return null
    const next_tab = urls[t_next_index]
    return next_tab
}
function goNext(tab) {
    var url = tab.url
    if (url.includes("#"))
        url = url.split("#")[0]

    chrome.storage.sync.get("otomation_urls", function (data) {
        var urls = []
        console.log(url)
        if (data && data.otomation_urls && data.otomation_urls.length > 0)
            urls = data.otomation_urls

        console.log(urls)
        if (!urls.includes(url) || urls.length < 2) return
        const next = get_next_url(urls, url)

        console.log(next)
        if (!next) return
        chrome.tabs.update(tab.id, { url: next });
        console.log(next)
        var enabled = true
        chrome.tabs.onUpdated.addListener(function doOto(tabId, info) {
            if (info.status === 'complete' && tabId == tab.id && enabled) {
                const port = chrome.tabs.connect(tab.id, { name: "toogleActivity" });
                port.postMessage({ enable: true, otomation: true });
                chrome.tabs.onUpdated.removeListener(doOto);
                enabled = false
            }
        });
    });
}


chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // GPU mesajından sonra tab değiştir isteği sayfadan gönderilir
        if (request.state == "NEXT_TAB") {
            goNext(sender.tab)
        }
    }
);

function modifyDOM() {
    setInterval(function () {
        if (document.querySelector("#rc-anchor-container")) {
            console.log("are_you_there_click running...")
        }
        document.querySelector("#rc-anchor-container")?.click()
        dialogs = document.getElementsByTagName("colab-recaptcha-dialog")
        if (dialog) {
            dialogs[0]?.close()
        }
        document.getElementsByClassName("recaptcha-checkbox goog-inline-block recaptcha-checkbox-unchecked rc-anchor-checkbox")?.item("recaptcha-anchor")?.click()
    }, 5000)
    console.log('Tab script:');
    console.log(document.body);
    return document.body.innerHTML;
}

//We have permission to access the activeTab, so we can call chrome.tabs.executeScript:
chrome.tabs.executeScript({
    code: '(' + modifyDOM + ')();' //argument here is a string but function.toString() returns function's code
}, (results) => {
    //Here we have just the innerHTML and not DOM structure
    console.log('Popup script:')
    console.log(results[0]);
});