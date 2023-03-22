setInterval(function () {
    document.querySelector("#rc-anchor-container")?.click()
    console.log("are_you_there_click running...")
}, 1000)

window.addEventListener('beforeunload', function (event) {
    event.stopImmediatePropagation();
});