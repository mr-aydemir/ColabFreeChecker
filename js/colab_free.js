
(async () => {
    const helper = await import((chrome.runtime.getURL || chrome.extension.getURL)('/js/helper.js'))

    const offline_query = ".file-tree-name[title='sample_data']"
    const left_pane_query = "body > div.notebook-vertical.colab-left-pane-open > div.notebook-horizontal > colab-left-pane"
    const ram_message_ok_button_query = "mwc-button"
    const variables_tab_query = "div.left-pane-top > div:nth-child(3) > paper-icon-button"
    const files_tab_query = "div.left-pane-top > div:nth-child(4) > paper-icon-button"

    var state = "OFFLINE" // ["OFFLINE", "ONLINE", "LOADING", "DISABLED", "NEXT_TAB"]
    var activated = false
    var is_loading = false
    var is_on_interaction = false
    var otomation_enabled = false

    function getState() {
        if (!activated) {
            return "DISABLED"
        }
        if (is_loading) {
            return "LOADING"
        }
        if (is_offline()) {
            return "OFFLINE"
        }
        return "ONLINE"
    }

    function clickVariables() {
        document.querySelector(variables_tab_query).click()
    }

    function clickRamMessageOK() {
        if (!document.querySelector(ram_message_ok_button_query)) return
        document.querySelector(ram_message_ok_button_query).click()
    }

    function clickFiles() {
        document.querySelector(files_tab_query)?.click()
    }

    function is_offline() {
        return !document.querySelector(offline_query)
    }
    function is_left_pane_closed() {
        return !document.querySelector(left_pane_query)
    }
    function is_there_gpu_allert_message() {
        const element = document.querySelector("body > mwc-dialog");
        return element && element.shadowRoot.textContent.includes("GPU");
    }
    function drive_folder() {
        return document.querySelector(".child-files>colab-file-view>.file-title-row>.file-tree-name[title='drive']")
    }

    function captcha() {
        return document.querySelector("colab-recaptcha-dialog")
    }
    function ram_colab_pro_allert() {
        return document.querySelector("body > mwc-dialog > a")?.textContent.includes("Colab Pro")
    }
    function click_run() {
        // çalışan bir işlem yoksa çalıştır
        if (!document.querySelector("colab-run-button")?.shadowRoot?.querySelector("div > div.cell-execution-indicator > iron-icon[icon='colab:stop-circle-filled']")) {
            document.querySelector("colab-run-button")?.click()
        }
    }


    function sendMessage(nextstate, same_send = false) {
        if (state == nextstate && !same_send) return
        console.log(state)
        state = nextstate
        const data = { type: "FROM_PAGE", state: state, activated: activated }
        chrome.runtime.sendMessage(data);
    }

    var is_doing_online = false
    function doOnline() {
        // ofline durumu kontrol edilir 
        if (is_offline() && !is_doing_online) {
            sendMessage("OFFLINE")
            // değişkenler sekmesine tıklanıp ardından tekrar dosyalara tıklanır, çevrımdışı olayından çıkarmaktadır.
            clickVariables()
            is_doing_online = true
            setTimeout(function () {
                clickFiles()
                is_doing_online = false
            }, 200)
            if (is_offline()) {
                is_loading = true
            }
        }
        else sendMessage("ONLINE")
    }
    async function check_offline() {
        // Gpu kullanım sınırı mesajı geldiyse sonraki taba geçmesi için eklentiye haber verilir.
        if (is_there_gpu_allert_message()) {
            sendMessage("NEXT_TAB")
            set_enable(false)
            return
        }
        if (captcha()) {
            await helper.click_robo()
            return
        }
        if (otomation_enabled) {
            click_run()
        }
        // interactiondaysa 
        if (is_on_interaction) return
        // dosyalar yükleniyorsa
        if (is_loading) {
            sendMessage("LOADING")
            if (!is_there_gpu_allert_message()) {
                // uyarı onaylanır
                clickRamMessageOK()
            }
            // loadingten çıkmak
            if (is_offline()) return
            is_loading = false
        }
        // yan panel kapanmışsa açılır
        if (is_left_pane_closed()) {
            clickFiles()
            if (is_offline()) {
                is_loading = true
            }
            return
        }
        doOnline()
    }
    function connect_click() {
        var selector = "#top-toolbar > colab-connect-button"
        document.querySelector(selector).shadowRoot.querySelector("#connect").click()
        setTimeout(function () {
            document.querySelector(selector).shadowRoot.querySelector("#connect").click()
        }, 1000)
    }
    function reset() {
        is_loading = false
        is_on_interaction = false
    }

    var activeIntervals = []
    // durum aktifleştirme pasifleştirme
    function set_enable(value) {
        if (value) {
            // aktif interval
            const in1 = setInterval(check_offline, 1000)
            const in2 = setInterval(connect_click, 30 * 1000)
            activeIntervals = [in1, in2]
            activated = true
        }
        else {
            // interval imha edilir
            activeIntervals.forEach(function (interval) {
                clearInterval(interval); // Zamanlayıcıyı iptal et
            });
            //gerekli temizlemeler yapılır
            activeIntervals = []
            activated = false
            reset()
        }
    }


    var drive_folder_interval = null
    function clear_drive_folder_interval() {
        clearInterval(drive_folder_interval)
        drive_folder_interval = null

    }
    function otomation() {
        if (drive_folder_interval) return
        var drive_connect_clicked = false
        var drive_connect_paper_showed = false
        var left_pane_opened = false
        chrome.storage.sync.set({
            "last_otomation_url": helper.format_colab_url(document.URL)
        });
        otomation_enabled = true

        drive_folder_interval = setInterval(async () => {
            // GPU kullanım limiti dolmuşsa sonraki taba geçmesi için eklenti bilgilendirilir
            if (is_there_gpu_allert_message()) {
                sendMessage("NEXT_TAB")
                return
            }
            if (captcha()) {
                await helper.click_robo()
                return
            }

            if (ram_colab_pro_allert()) {
                clickRamMessageOK()
            }

            // yan panel kapatılmışsa açılır, drive vs dosyaların görüntülenmesi için gereklidir.
            if (!left_pane_opened) {
                if (is_left_pane_closed()) {
                    clickFiles()
                    if (document.querySelector(files_tab_query))
                        left_pane_opened = true
                    return
                }
                left_pane_opened = true
            }

            // her ihtimale karşı drive bağlama/kesme tuşuna basılır 
            else if (!drive_connect_paper_showed && !drive_folder()) {
                var element = document.querySelector("paper-icon-button.mount-drive-button")
                if (!element) return
                element.click()
                drive_connect_paper_showed = true
            }
            // Drive bağlantı mesajı gelirse bağlantı kes mesajı değilse(bağlantı yap mesajıdır öyleyse) ok tuşuna basılır.
            else if (!drive_connect_clicked && !drive_folder()) {
                var element = document.querySelector("body > mwc-dialog > div > div")
                if (!element) return
                var disconnect_label = element.textContent.includes("Colaboratory")
                if (!disconnect_label) {
                    document.querySelector("body > mwc-dialog > mwc-button[dialogaction='ok']")?.click()
                    console.log("connect ok clicked");

                }
                // bağlantı kes mesajı ise iptale basılır.
                else {
                    document.querySelector("body > mwc-dialog > mwc-button[dialogaction='cancel']")?.click()
                }
                drive_connect_clicked = true
            }
            else {
                // Drive klasörü gözükene kadar klasör refresh butonuna basılır
                if (!drive_folder()) {
                    var element = document.querySelector("paper-icon-button[icon='colab:folder-refresh']")
                    if (element) element.click()
                    return
                }
                //drive klasörü gelince eğer işlem çalışan bir işlem değilse çalıştırılır.
                click_run()
                // Offline durum kontrolü çalıştırılır.
                set_enable(false)
                set_enable(true)
                // bu interval kendini imha eder.
                clear_drive_folder_interval()
            }
        }, 1000);
    }


    chrome.runtime.onConnect.addListener(function (port) {
        // Eklenti durum bilgilendirmesi istemişse
        if (port.name == "getState") {
            port.onMessage.addListener(function (response) {
                sendMessage(getState(), true)
                console.log(state)
            });
        }
        // İşlemlerin aç kapa anahtarı
        else if (port.name == "toogleActivity") {
            port.onMessage.addListener(function (response) {
                console.log("toogle");
                // otomasyon istenmişse
                if (response.otomation) {
                    otomation()
                } else
                    // Aktifleştirme durumu
                    set_enable(response.enable)
                // Eklenti bilgilendirilir.
                sendMessage(getState(), true)
            });

        }
    });
    chrome.runtime.connect({ name: "LOADING" }).postMessage({ enable: true });
    //sendMessage("LOAD_COMPLETED")
    function sendContentLoaded(name = "LOAD_COMPLETED") {
        
        chrome.runtime.connect({ name: name }).postMessage({ enable: true });
        var listener = chrome.runtime.onConnect.addListener(function (port) {
            if (port.name == name) {
                if (chrome.runtime.lastError) {
                    setTimeout(sendContentLoaded, 1000);
                    chrome.runtime.onConnect.removeListener(listener);
                    console.log("last runtime error");
                }
            }
        })
       /*  if (chrome.runtime.lastError) {
            setTimeout(sendContentLoaded, 1000);
        } */
    }
    document.addEventListener("DOMContentLoaded", function () {
        console.log("completed");
        var int1 = setInterval(function () {
            if (document.querySelector("#header-logo > a > iron-icon")) {
                console.log("LOAD_COMPLETED");
                sendContentLoaded()
                clearInterval(int1)
                return
            }

            if (document.querySelector(".message-area")) {
                return
            }
            console.log("LOAD_ERROR");
            sendContentLoaded("LOAD_ERROR")
            this.clearInterval(int1)
        }, 500)

    });
})();