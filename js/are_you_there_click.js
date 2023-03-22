setInterval(function () {
    if (document.querySelector("#rc-anchor-container")) {
        console.log("are_you_there_click running...")
    }
    document.querySelector("#rc-anchor-container")?.click()
}, 5000)

window.addEventListener('beforeunload', function (event) {
    event.stopImmediatePropagation();
});