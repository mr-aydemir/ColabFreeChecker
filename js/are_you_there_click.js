//https://stackoverflow.com/questions/9515704/access-variables-and-functions-defined-in-page-context-using-a-content-script

// Burada mısınız mesajına tıklar.
setInterval(function () {
    if (document.querySelector("#rc-anchor-container")) {
        console.log("are_you_there_click running...")
    }
    document.querySelector("#rc-anchor-container")?.click()
    dialog = document.querySelector("colab-recaptcha-dialog>div>div>iframe")?.contentWindow.document
    if (dialog) {
        console.log("colab-recaptcha-dialog");
        console.log(dialog)
        dialog?.click()
    }
    document.getElementsByClassName("recaptcha-checkbox goog-inline-block recaptcha-checkbox-unchecked rc-anchor-checkbox")?.item("recaptcha-anchor")?.click()
}, 5000)

// Kaydedilmeyenler var uyarısını engeller
window.addEventListener('beforeunload', function (event) {
    event.stopImmediatePropagation();
});