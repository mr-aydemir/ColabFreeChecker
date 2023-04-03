import { continue_last, continue_last_next, start } from "./otomation.js";

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
