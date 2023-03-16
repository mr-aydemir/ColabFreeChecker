function get_next_tab(tabsArray, current_tab) {
    const filtered = tabsArray.filter((x) => x.url.includes("colab"));
    const t_index = filtered.indexOf(filtered.filter((x) => x.id == current_tab.id)[0]);
    const last_index = filtered.length - 1;
    var t_next_index = t_index + 1
    if (t_next_index > last_index) t_next_index = 0
    if (t_index == t_next_index) return null
    const next_tab = filtered[t_next_index]
    return next_tab
}
// tab değiştir işleminde colab sayfaları arasından sırasıyla geçiş olur baştan sonra 1er 1er, sondan 1. colaba
function go_nextTab(tab) {
    chrome.tabs.query({ currentWindow: true }, function (tabsArray) {
        // tek bir tab varsa
        if (tabsArray.length < 2) return;
        console.log(tabsArray)
        const next_tab = get_next_tab(tabsArray, tab)

        if (!next_tab) return

        chrome.tabs.reload(tab.id);
        chrome.tabs.update(next_tab.id, { active: true })
        chrome.tabs.reload(next_tab.id);
        /*  chrome.runtime.onMessage.addListener(
             function doStuff(request, sender, sendResponse) {
                 if (request.state == "LOAD_COMPLETED") {
                     const port = chrome.tabs.connect(next_tab.id, { name: "toogleActivity" });
                     port.postMessage({ enable: true, otomation: true });
                     chrome.runtime.onMessage.removeListener(doStuff);
                 }
             }
         ); */
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
}


chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // GPU mesajından sonra tab değiştir isteği sayfadan gönderilir
        if (request.state == "NEXT_TAB") {
            go_nextTab(sender.tab)
        }
    }
);
