//https://stackoverflow.com/questions/9515704/access-variables-and-functions-defined-in-page-context-using-a-content-script

// Burada mısınız mesajına tıklar.
setInterval(function () {
    if (document.querySelector("#rc-anchor-container")) {
        console.log("are_you_there_click running...")
    }
    document.querySelector("#rc-anchor-container")?.click()
}, 5000)

// Kaydedilmeyenler var uyarısını engeller
window.addEventListener('beforeunload', function (event) {
    event.stopImmediatePropagation();
});