const DEFAULT_USE_FUTAPO_LINK = true;
const DEFAULT_CHANGE_BG_COLOR = true;
let use_futapo_link = DEFAULT_USE_FUTAPO_LINK;
let change_bg_color = DEFAULT_CHANGE_BG_COLOR;


function dispLogLink() {
    // 過去ログへのリンクを表示
    let href_match = location.href.match(/^https?:\/\/(may|img)\.2chan\.net\/b\/res\/(\d+)\.htm$/);

    // ふたポ
    let futapo_link_id = document.getElementById("AKAAN_futapo_link");
    if (href_match && use_futapo_link && !futapo_link_id) {
        let futapo_link = "http://kako.futakuro.com/futa/" + href_match[1] + "_b/" + href_match[2] + "/";
        setLogLink(futapo_link, "futapo");
    }

    /**
     * 過去ログへのリンクを設定
     * @param {string} link 過去ログのアドレス
     * @param {string} name リンクに表示されるテキスト
     */
    function setLogLink(link, name) {
        let span = document.createElement("span");
        let a = document.createElement("a");
        a.id = "AKAAN_" + name + "_link";
        a.href = link;
        a.target = "_blank";
        a.textContent = name;
        span.append("[", a, "] ");
        let akahuku_status = document.getElementById("akahuku_reload_status");
        if (akahuku_status) {
            akahuku_status.parentNode.insertBefore(span, akahuku_status);
        }
    }
}

function main() {
    let status = "";
    let target = document.getElementById("akahuku_reload_status");
    if (target) {
        checkAkahukuReload();
    } else {
        document.addEventListener("AkahukuContentApplied", () => {
            target = document.getElementById("akahuku_reload_status");
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
                if (status.indexOf("新着") === 0) {
                    document.body.style.backgroundColor = null;
                } else
                if (status.indexOf("No") === 0 || status.indexOf("Mot") === 0) {
                    document.body.style.backgroundColor = null;
                    dispLogLink();
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
    use_futapo_link = safeGetValue(result.use_futapo_link, DEFAULT_USE_FUTAPO_LINK);
    change_bg_color = safeGetValue(result.change_bg_color, DEFAULT_CHANGE_BG_COLOR);

    main();
}, (error) => { });

browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName != "local") {
        return;
    }

    use_futapo_link = safeGetValue(changes.use_futapo_link.newValue, DEFAULT_USE_FUTAPO_LINK);
    change_bg_color = safeGetValue(changes.change_bg_color.newValue, DEFAULT_CHANGE_BG_COLOR);
});