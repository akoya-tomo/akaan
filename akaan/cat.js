const form_selectors = 
    ".ftbl, #akahuku_floatpostform_container, #akahuku_postform, #akahuku_postform_opener," +   // 返信フォーム
    "a," +          // aタグ
    "img," +        // imgタグ
    "input," +      // inputタグ
    "textarea," +   // textareaタグ
    "label," +      // labelタグ
    "form[name='delform2']," +  // 削除フォーム
    "#GM_fth_container_header, #GM_fth_config_container," +   // futaba thread highlighter(K)
    "#GM_fcn_ng_menubar, #GM_fcn_config_container, #GM_fcn_ng_list_container, .GM_fcn_ng_button," +  // futaba catalog NG
    "";

const DEFAULT_SCROLL_TO_TOP = true;
const DEFAULT_CHANGE_BG_COLOR = true;
const DEFAULT_PUT_PDMC = true;
const DEFAULT_USE_DOUBLECLICK = false;
const DEFAULT_DISABLE_FORMS = true;
const DEFAULT_DISABLE_CLASS_RTD = false;
const DEFAULT_DISABLE_ID_CATTABLE = false;
const DEFAULT_FOCUS_ON_UNREAD = false;
const DEFAULT_CLICK_PERIOD = 350;
const DEFAULT_LONG_PRESS_TIME = 0;
const DEFAULT_DOUBLECLICK_PERIOD = 300;
let scroll_to_top = DEFAULT_SCROLL_TO_TOP;
let change_bg_color = DEFAULT_CHANGE_BG_COLOR;
let put_pdmc = DEFAULT_PUT_PDMC;
let use_doubleclick = DEFAULT_USE_DOUBLECLICK;
let disable_forms = DEFAULT_DISABLE_FORMS;
let disable_class_rtd = DEFAULT_DISABLE_CLASS_RTD;
let disable_id_cattable = DEFAULT_DISABLE_ID_CATTABLE;
let focus_on_unread = DEFAULT_FOCUS_ON_UNREAD;
let click_period = DEFAULT_CLICK_PERIOD;
let long_press_time = DEFAULT_LONG_PRESS_TIME;
let doubleclick_period = DEFAULT_DOUBLECLICK_PERIOD;
let exclusion = "";

function onDoubleClick(e) {
    if (use_doubleclick && e.button === 0) {
        if (exclusion && e.target.closest(exclusion)) {
            return;
        }
        focusOnLastThread();
        removeSelection();
    }
}

/**
 * 最後にダブルクリックでカタログに移動したスレへ移動
 */
function focusOnLastThread() {
    browser.runtime.sendMessage({
        id: "AKAAN_focus_on_last_thread"
    });
}

/**
 *  ダブルクリックで選択された部分を解除する
 */
function removeSelection() {
    let sel_obj = document.getSelection();
    if (sel_obj) {
        sel_obj.removeAllRanges();
    }
}

let count_mb = 0;
let timer_id_mb = null;
let last_doubleclick_time = Date.now();

/**
 * 右クリックをカウント
 */
function countClick() {
    if (focus_on_unread && Date.now() - last_doubleclick_time > doubleclick_period) {
        if (count_mb) {
            count_mb = 0;
            if (timer_id_mb) {
                clearTimeout(timer_id_mb);
            }
            last_doubleclick_time = Date.now();
            focusOnUnreadThread();
        } else {
            ++count_mb;
            timer_id_mb = setTimeout(() => {
                timer_id_mb = null;
                count_mb = 0;
            }, click_period);
        }
    } else {
        count_mb = 0;
    }
}

/**
 * 未読レスがあるスレへ移動
 */
function focusOnUnreadThread() {
    browser.runtime.sendMessage({
        id: "AKAAN_focus_on_unread_thread"
    });
}

function onContextmenu(e) {
    if (focus_on_unread && e.button == 2) {
        if (!is_long_press) {
            e.preventDefault();
        }
        countClick();
    }
}

let is_long_press = false;
let time_md = Date.now();

function onMouseDown(e) {
    if (focus_on_unread && e.button == 2) {
        is_long_press = false;
        time_md = Date.now();
    }
}

let time_mu = Date.now();

function onMouseUp(e) {
    if (focus_on_unread && e.button == 2) {
        time_mu = Date.now();
        is_long_press = time_mu - time_md >= long_press_time;
    }
}

function main(){
    if (scroll_to_top) {
        document.documentElement.scrollTop = 0;
    }
    document.addEventListener("dblclick", onDoubleClick);
    document.addEventListener("contextmenu", onContextmenu);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);

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
        let observer = new MutationObserver(function() {
            if (target.textContent == status) {
                return;
            }
            status = target.textContent;
            if (status == "ロード中 (ヘッダ)") {
                if (change_bg_color) {
                    document.body.style.backgroundColor = '#EEEEEE';
                }
                // 既存のプルダウンメニューを消去
                let pdm = document.getElementById("pdm");
                if (pdm) {
                    pdm.remove();
                }
            } else if (status == "完了しました") {
                document.body.style.backgroundColor = null;
                if (scroll_to_top) {
                    document.documentElement.scrollTop = 0;
                }
                // プルダウンメニューボタン設置
                if (put_pdmc) {
                    let ct = document.getElementById("cattable");
                    if (ct) {
                        let ca = ct.getElementsByTagName("a");
                        for (let i = 0; i < ca.length; i++) {
                            let ci = ca[i];
                            let parent = ci.parentNode;
                            let pdmc = parent.getElementsByClassName("pdmc")[0];
                            if (pdmc) {
                                continue;
                            }
                            let cn = ci.href.match(/res\/([0-9]+)\.htm/);
                            if (cn == null) {
                                continue;
                            }
                            let cd = document.createElement("div");
                            cd.className = "pdmc";
                            cd.setAttribute("data-no", cn[1]);
                            parent.appendChild(cd);
                        }
                        hidetd();
                    }
                }
            } else if (status == "中断されました" || status == "ロード失敗" || status == "接続できませんでした" || status == "満員です") {
                document.body.style.backgroundColor = null;
            }
        });
        observer.observe(target, config);
    }

}

function hidetd(){
    let catmode = getParam("sort");
    if (catmode != "9" && catmode != "7") {
        return;
    }
    let histhide = gethistory(catmode);
    let cathide = histhide.cathide;
    let ct = document.getElementById("cattable");
    let ca = ct.getElementsByTagName("a");
    for (let i = 0; i < ca.length; i++) {
        let ci = ca[i];
        let cn = ci.href.match(/res\/([0-9]+)\.htm/)[1];
        if (cn == null) {
            continue;
        }
        if (cn > 0 && cathide.indexOf(cn) != -1) {
            ci.parentNode.style.display="none";
        }
    }
}

function getParam(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");     // eslint-disable-line no-useless-escape
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) {
        return null;
    }
    if (!results[2]) {
        return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function gethistory(catmode){
    let cathists;
    if (catmode == "9") {
        cathists = getCookie("cathists");
    } else {
        cathists = getCookie("catviews");
    }
    let cathist,cathide;
    if (cathists == "") {
        cathist=[];
        cathide=[];
    } else {
        let cattmp = cathists.split('/');
        if (cattmp[0] == "") {
            cathist=[];
        } else {
            cathist = cattmp[0].split('-');
        }
        if  (cattmp[1] == "") {
            cathide = [];
        } else {
            cathide = cattmp[1].split('-');
        }
    }
    return {"cathist":cathist,"cathide":cathide};
}

function getCookie(key, tmp1, tmp2, xx1, xx2, xx3){  //get cookie
    tmp1 = " " + document.cookie + ";";
    xx1 = xx2 = 0;
    let len = tmp1.length;
    while (xx1 < len) {
        xx2 = tmp1.indexOf(";", xx1);
        tmp2 = tmp1.substring(xx1 + 1, xx2);
        xx3 = tmp2.indexOf("=");
        if (tmp2.substring(0, xx3) == key) {
            return (unescape(tmp2.substring(xx3 + 1, xx2 - xx1 - 1)));
        }
        xx1 = xx2 + 1;
    }
    return("");
}

function safeGetValue(value, default_value) {
    return value === undefined ? default_value : value;
}

browser.storage.local.get().then((result) => {
    scroll_to_top = safeGetValue(result.scroll_to_top, DEFAULT_SCROLL_TO_TOP);
    put_pdmc = safeGetValue(result.put_pdmc, DEFAULT_PUT_PDMC);
    use_doubleclick = safeGetValue(result.use_doubleclick, DEFAULT_USE_DOUBLECLICK);
    disable_forms = safeGetValue(result.disable_forms, DEFAULT_DISABLE_FORMS);
    disable_class_rtd = safeGetValue(result.disable_class_rtd, DEFAULT_DISABLE_CLASS_RTD);
    disable_id_cattable = safeGetValue(result.disable_id_cattable, DEFAULT_DISABLE_ID_CATTABLE);
    focus_on_unread = safeGetValue(result.focus_on_unread, DEFAULT_FOCUS_ON_UNREAD);
    click_period = Number(safeGetValue(result.click_period, DEFAULT_CLICK_PERIOD));
    long_press_time = Number(safeGetValue(result.long_press_time, DEFAULT_LONG_PRESS_TIME));

    exclusion = "";
    if (use_doubleclick) {
        exclusion = disable_forms ? form_selectors : "";
        exclusion += disable_class_rtd ? ".rtd," : "";
        exclusion += disable_id_cattable ? "#cattable," : "";
        if (exclusion) {
            exclusion = exclusion.slice(0, -1);
        }
    }

    main();
}, (error) => {});  // eslint-disable-line no-unused-vars

browser.storage.onChanged.addListener((changes, areaName) => {
    if(areaName != "local"){
        return;
    }

    scroll_to_top = safeGetValue(changes.scroll_to_top.newValue, DEFAULT_SCROLL_TO_TOP);
    put_pdmc = safeGetValue(changes.put_pdmc.newValue, DEFAULT_PUT_PDMC);
    use_doubleclick = safeGetValue(changes.use_doubleclick.newValue, use_doubleclick);
    disable_forms = safeGetValue(changes.disable_forms.newValue, disable_forms);
    disable_class_rtd = safeGetValue(changes.disable_class_rtd.newValue, disable_class_rtd);
    disable_id_cattable = safeGetValue(changes.disable_id_cattable.newValue, disable_id_cattable);
    focus_on_unread = safeGetValue(changes.focus_on_unread.newValue, focus_on_unread);
    click_period = Number(safeGetValue(changes.click_period.newValue, click_period));
    long_press_time = Number(safeGetValue(changes.long_press_time.newValue, long_press_time));

    exclusion = "";
    if (use_doubleclick) {
        exclusion = disable_forms ? form_selectors : "";
        exclusion += disable_class_rtd ? ".rtd," : "";
        exclusion += disable_id_cattable ? "#cattable," : "";
        if (exclusion) {
            exclusion = exclusion.slice(0, -1);
        }
    }
});
