import {click_leave,format_colab_url} from './helper.js';

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
    var url = format_colab_url(tab.url)

    chrome.storage.sync.get("otomation_urls", async function (data) {
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
        await click_leave();
        console.log(next)
        var enabled = true
        chrome.runtime.onMessage.addListener(
            function doOto(request, sender, sendResponse) {
                // GPU mesajından sonra tab değiştir isteği sayfadan gönderilir
                if (request.state == "LOAD_COMPLETED" && sender.tab.id == tab.id && enabled) {
                    const port = chrome.tabs.connect(tab.id, { name: "toogleActivity" });
                    port.postMessage({ enable: true, otomation: true });
                    chrome.tabs.onUpdated.removeListener(doOto);
                    enabled = false
                    console.log(next)
                }
                else if (request.state == "LOAD_ERROR") {
                    goNext(tab)
                    enabled = false
                    console.log(next)
                }
            }
        );
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
