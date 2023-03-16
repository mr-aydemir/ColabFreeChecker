function get_next_tab(tabsArray, current_tab) {
    const filtered = tabsArray.filter((x) => x.url.includes("colab"));
    const t_index = filtered.indexOf(filtered.filter((x) => x.id == current_tab.id)[0]);
    const last_index = filtered.length - 1;
    var t_next_index = t_index + 1
    if(t_next_index > last_index) t_next_index=0
    const next_tab = filtered[t_next_index]
    return next_tab
}

function go_nextTab(tab) {
    chrome.tabs.query({ currentWindow: true }, function (tabsArray) {
        if (tabsArray.length < 2) return;
        console.log(tabsArray)
        const next_tab=get_next_tab(tabsArray, tab)
        chrome.tabs.reload(tab.id);
        chrome.tabs.update(next_tab.id, { active: true })
        const port = chrome.tabs.connect(next_tab.id, { name: "toogleActivity" });
        port.postMessage({ enable: true, otomation: true });
    });
}


chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.state == "NEXT_TAB") {
            go_nextTab(sender.tab)
        }
    }
);
