export async function click_leave() {
    await fetch("http://127.0.0.1:5000/click_leave", {
        method: 'GET'
    });
}
export async function click_robo() {
    await fetch("http://127.0.0.1:5000/click_robo", {
        method: 'GET'
    });
}
export function format_colab_url(url) {
    if (url.includes("#"))
        url = url.split("#")[0]
    return url
}
