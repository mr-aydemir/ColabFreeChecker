import { format_colab_url } from "./helper.js";
import {  get_last_active_url, get_next_url, navigate_to_URL, toogleActivity } from "./otomation.js";

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // GPU mesajından sonra tab değiştir isteği sayfadan gönderilir
        if (request.state == "NEXT_TAB") {
            continue_last_next(sender.tab)
        }
        if (request.state == "START") {
            console.log(request);
            start(request.tab)
        }
        if (request.state == "CONTINUE") {
            console.log(request);
            continue_last(request.tab)
        }
    }
);



async function continue_last(tab) {
    const last_otomation_url = await get_last_active_url()
    goNext(tab, last_otomation_url)
}
async function continue_last_next(tab) {
    const last_otomation_url = await get_last_active_url()
    goNext(tab, last_otomation_url, true)
}
function start(tab) {
    goNext(tab)
}
async function goNext(tab, url, next = false) {
    console.log("url:", url);
    if (url && next)
        url = await get_next_url(url)
    if (!url) { url = format_colab_url(tab.url); console.log("tab:", tab); }
    await navigate_to_URL(tab.id, url)

    console.log(tab);
    var enabled = true
    let myPortListener

    myPortListener = chrome.runtime.onConnect.addListener(function oto(port) {
        console.log(port);
        port.onMessage.addListener((message, port) => {
            if (port.sender.tab.id != tab.id || !enabled) {
                return
            }
            if (port.name == "LOAD_COMPLETED") {
                toogleActivity(tab.id, true, true)
                enabled = false
                chrome.runtime.onConnect.removeListener(myPortListener)
                return
            }
            if (port.name == "LOAD_ERROR") {
                goNext(tab, url)
                enabled = false
                chrome.runtime.onConnect.removeListener(myPortListener)
                return
            }
        })

    });
}