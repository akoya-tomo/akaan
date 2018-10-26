const DEFAULT_SCROLL_TO_TOP = true;
const DEFAULT_CHANGE_BG_COLOR = true;
let scroll_to_top = DEFAULT_SCROLL_TO_TOP;
let change_bg_color = DEFAULT_CHANGE_BG_COLOR;

function main(){
    if (scroll_to_top) {
        document.documentElement.scrollTop = 0;
    }
    let status = "";
    let target = document.getElementById("akahuku_catalog_reload_status");
    if (target) {
        checkAkahukuReload();
    } else {
        document.addEventListener("AkahukuContentApplied", () => {
            target = document.getElementById("akahuku_catalog_reload_status");
            if (target) checkAkahukuReload();
        });
    }

    function checkAkahukuReload() {
        let config = { childList: true };
        let observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (target.textContent == status) return;
                status = target.textContent;
                if (status == "ロード中 (ヘッダ)") {
                    if (change_bg_color) document.body.style.backgroundColor = '#EEEEEE';
                } else
                if (status == "完了しました") {
                    document.body.style.backgroundColor = null;
                    if (scroll_to_top) document.documentElement.scrollTop = 0;
                } else
                if (status == "中断されました" || status == "ロード失敗" || status == "接続できませんでした" || status == "満員です") {
                    document.body.style.backgroundColor = null;
                }
            });
        });
        observer.observe(target, config);
    }

}

function safeGetValue(value, default_value) {
    return value === undefined ? default_value : value;
}

browser.storage.local.get().then((result) => {
    scroll_to_top = safeGetValue(result.scroll_to_top, DEFAULT_SCROLL_TO_TOP);

    main();
}, (error) => {});

browser.storage.onChanged.addListener((changes, areaName) => {
    if(areaName != "local"){
        return;
    }

    scroll_to_top = safeGetValue(changes.scroll_to_top.newValue, DEFAULT_SCROLL_TO_TOP);
});