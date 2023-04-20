export async function click_leave() {
    await fetch("http://127.0.0.1:5000/click_leave", {
        method: 'GET'
    });
}
export async function click_robo(captcha) {
    /* top= captcha.offsetTop + window.screenY
    left= captcha.offsetLeft + window.screenX
    width= captcha.offsetWidth
    height= captcha.offsetHeight */
    await fetch(`http://127.0.0.1:5000/click_robo?top=${captcha.offsetTop + window.screenY}&left=${captcha.offsetLeft + window.screenX}&width=${captcha.offsetWidth}&height=${captcha.offsetHeight}`, {
        mode: 'no-cors',
        method: 'GET',
        headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
        }
    });
}
export function format_colab_url(url) {
    if (url.includes("#"))
        url = url.split("#")[0]
    return url
}
