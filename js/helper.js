export async function click_leave() {
    await fetch("http://127.0.0.1:5000/click_leave", {
        method: 'GET'
    });
}
export async function click_robo() {
    captcha = document.querySelector("body > colab-recaptcha-dialog:nth-child(29)").shadowRoot.querySelector("mwc-dialog > div")
    console.log(captcha);
    await fetch("http://127.0.0.1:5000/click_robo", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            top: captcha.offsetTop,
            left: captcha.offsetLeft,
            width: captcha.offsetWidth,
            height: captcha.offsetHeight
        })
    });
}
export function format_colab_url(url) {
    if (url.includes("#"))
        url = url.split("#")[0]
    return url
}
