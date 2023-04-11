import { click_leave, format_colab_url } from "./helper.js";

export function toogleActivity(tabid, active, otomation = false) {
    chrome.tabs.connect(tabid, { name: "toogleActivity" }).postMessage({ enable: active, otomation: otomation });
}

export async function get_otomation_urls() {
    return (await chrome.storage.sync.get("otomation_urls"))?.otomation_urls;
}
export async function get_last_active_url() {
    return (await chrome.storage.sync.get("last_otomation_url"))?.last_otomation_url
}


export async function goNext(tab, url, next = false) {
    console.log("url:", url);
    if (url && next)
        url = await get_next_url(url)
    if (!url) { url = format_colab_url(tab.url); console.log("tab:", tab); }
    await navigate_to_URL(tab.id, url)

    console.log(tab);
    var enabled = true
    var myPortListener = chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        console.log(sender);
        if (!tab || !url || !sender || sender.tab.id != tab.id || !enabled) {
            //sendResponse({ status: 'ok' });
            return
        }
        if (request.name == "LOAD_COMPLETED") {
            toogleActivity(tab.id, true, true)
            enabled = false
            chrome.runtime.onMessage.removeListener(myPortListener)
            sendResponse({ status: request.name });
            return
        }
        if (request.name == "LOAD_ERROR") {
            goNext(tab, url)
            enabled = false
            chrome.runtime.onMessage.removeListener(myPortListener)
            sendResponse({ status: request.name });
            return
        }
        sendResponse({ status: request.name });
    });


}



export async function navigate_to_URL(tabid, url) {
    chrome.tabs.update(tabid, { url: url });
    await click_leave();
}

export async function get_next_url(url) {
    url = format_colab_url(url)
    const urls = await get_otomation_urls()
    if (!urls) return null

    const t_index = urls.indexOf(url);
    const last_index = urls.length - 1;
    var t_next_index = t_index + 1
    if (t_next_index > last_index) t_next_index = 0
    if (t_index == t_next_index) return null
    const next_tab = urls[t_next_index]
    return next_tab
}
export async function canStart(url) {
    const urls = await get_otomation_urls()
    return url.includes("colab") && urls.includes(url)
}
export async function canContinue() {
    const urls = await get_otomation_urls()
    const last = await get_last_active_url()
    if (last && urls && urls.includes(last)) {
        return true
    }
    return false
}
export async function canAdd(url) {
    const urls = await get_otomation_urls()
    return url && urls.includes(url)
}
export async function continue_last(tab) {
    const last_otomation_url = await get_last_active_url()
    goNext(tab, last_otomation_url)
}
export async function continue_last_next(tab) {
    const last_otomation_url = await get_last_active_url()
    goNext(tab, last_otomation_url, true)
}
export function start(tab) {
    goNext(tab)
}


export async function add_url(url) {
    url = format_colab_url(url)
    const urls = await get_otomation_urls()
    if (urls && urls.includes(url)) return false
    if (!urls) urls = [url]

    urls.push(url)
    await setAll(urls)
    return true
}

export async function remove_url(url) {
    var url = format_colab_url(url)
    var urls = await get_otomation_urls()
    if (!urls || !urls.includes(url)) return false
    urls = urls.filter(function (item) {
        return item !== url
    })
    await setAll(urls)
    return true
}

export async function setAll(newList) {
    await chrome.storage.sync.set({
        "otomation_urls": newList
    });
}