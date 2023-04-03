import { continue_last, continue_last_next } from "./otomation.js";

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // GPU mesajından sonra tab değiştir isteği sayfadan gönderilir
        if (request.state == "NEXT_TAB") {
            continue_last_next(sender.tab)
        }
    }
);
