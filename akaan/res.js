const form_selectors = 
    ".ftbl, #akahuku_floatpostform_container, #akahuku_postform, #akahuku_postform_opener," +   // 返信フォーム
    "a," +          // aタグ
    "img," +        // imgタグ
    "input," +      // inputタグ
    "textarea," +   // textareaタグ
    "label," +      // labelタグ
    "#ddbut," +      // [見る][隠す]ボタン
    "form[name='delform2']," +  // 削除フォーム
    "#akahuku_thread_operator," +   // 赤福スレ操作パネル
    ".futaba_lightbox, .fancybox-overlay, .fancybox-wrap," +    // futaba lightbox
    "";

const DEFAULT_CHANGE_BG_COLOR = true;
const DEFAULT_SHOW_DELETED_RES = false;
const DEFAULT_SEARCH_REPLY = true;
const DEFAULT_USE_FUTAPO_LINK = true;
const DEFAULT_USE_FTBUCKET_LINK = true;
const DEFAULT_USE_TSUMANNE_LINK = true;
const DEFAULT_USE_FUTAFUTA_LINK = true;
const DEFAULT_USE_DOUBLECLICK = false;
const DEFAULT_DISABLE_FORMS = true;
const DEFAULT_DISABLE_CLASS_RTD = false;
const DEFAULT_FOCUS_ON_UNREAD = false;
const DEFAULT_CLICK_PERIOD = 350;
const DEFAULT_LONG_PRESS_TIME = 0;

const DEFAULT_SEARCH_RESNO = true;
const DEFAULT_SEARCH_FILE = true;
const DEFAULT_POPUP_TIME = 100;
const DEFAULT_POPUP_INDENT = -20;
const DEFAULT_HIDE_TIME = 100;
const DEFAULT_DOUBLECLICK_PERIOD = 300;
const TIME_OUT = 60000;
const QUOTE_COLOR = "#789922";

let change_bg_color = DEFAULT_CHANGE_BG_COLOR;
let show_deleted_res = DEFAULT_SHOW_DELETED_RES;
let search_reply = DEFAULT_SEARCH_REPLY;
let use_futapo_link = DEFAULT_USE_FUTAPO_LINK;
let use_ftbucket_link = DEFAULT_USE_FTBUCKET_LINK;
let use_tsumanne_link = DEFAULT_USE_TSUMANNE_LINK;
let use_futafuta_link = DEFAULT_USE_FUTAFUTA_LINK;
let use_doubleclick = DEFAULT_USE_DOUBLECLICK;
let disable_forms = DEFAULT_DISABLE_FORMS;
let disable_class_rtd = DEFAULT_DISABLE_CLASS_RTD;
let focus_on_unread = DEFAULT_FOCUS_ON_UNREAD;
let click_period = DEFAULT_CLICK_PERIOD;
let long_press_time = DEFAULT_LONG_PRESS_TIME;

let search_resno = DEFAULT_SEARCH_RESNO;
let search_file = DEFAULT_SEARCH_FILE;
let popup_time = DEFAULT_POPUP_TIME;
let popup_indent = DEFAULT_POPUP_INDENT;
let hide_time = DEFAULT_HIDE_TIME;
let doubleclick_period = DEFAULT_DOUBLECLICK_PERIOD;

let g_thre = null;
let g_response_list = [];
let g_last_response_num = 0;
let have_sod = false;
let have_del = false;
let ddbut_clicked = false;
let is_ftbucket_loading = false;
let is_tsumanne_loading = false;
let exclusion = "";
let g_reply_popup = null;
let is_akahuku_reloading = false;

const SEARCH_RESULT_PERFECT = 0;
const SEARCH_RESULT_MAYBE = 1;
const SEARCH_RESULT_NONE = 2;

/**
 * 過去ログへのリンクを表示
 */
function dispLogLink() {
    let href_match = location.href.match(/^https?:\/\/([^/.]+)\.2chan\.net\/([^/]+)\/res\/(\d+)\.htm$/);
    let link_id;

    // ふたポ
    link_id = document.getElementById("AKAAN_futapo_link");
    if (use_futapo_link && !link_id && href_match
        && `${href_match[1]}_${href_match[2]}`.match(/may_b|img_b/)) {
        let link = `http://kako.futakuro.com/futa/${href_match[1]}_${href_match[2]}/${href_match[3]}/`;
        setLogLink(link, "futapo");
    }

    // FTBucket
    link_id = document.getElementById("AKAAN_ftbucket_link");
    if (use_ftbucket_link && !link_id && href_match && !is_ftbucket_loading
        && `${href_match[1]}_${href_match[2]}`.match(/may_b|img_b|jun_jun|dec_55|dec_60/)) {
        let board = `${href_match[1]}_${href_match[2]}` == "jun_jun" ? "b" : href_match[2];  // jun_junはjun_bに変換
        let link = `http://www.ftbucket.info/scrapshot/ftb/cont/${href_match[1]}.2chan.net_${board}_res_${href_match[3]}/index.htm`;
        let xhr = new XMLHttpRequest();
        xhr.timeout = TIME_OUT;
        xhr.addEventListener("load", () => {
            if (xhr.status == 200) {
                setLogLink(link, "ftbucket");
            }
        });
        xhr.addEventListener("error", () => {
            is_ftbucket_loading = false;
        });
        xhr.addEventListener("timeout", () => {
            is_ftbucket_loading = false;
        });
        xhr.open("HEAD", link);
        xhr.send();
        is_ftbucket_loading = true;
    }

    // 「」ッチー
    link_id = document.getElementById("AKAAN_tsumanne_link");
    if (use_tsumanne_link && !link_id && href_match && !is_tsumanne_loading) {
        let server;
        switch (`${href_match[1]}_${href_match[2]}`) {
            case "may_b":
                server = "my";
                break;
            case "img_b":
                server = "si";
                break;
            case "dat_b":
                server = "sa";
                break;
            default:
                server = "";
        }
        if (server) {
            let xhr = new XMLHttpRequest();
            xhr.responseType = "json";
            xhr.timeout = TIME_OUT;
            xhr.addEventListener("load", () => {
                if (xhr.status == 200) {
                    let res = xhr.response;
                    if (res.success) {
                        let link = `http://tsumanne.net${res.path}`;
                        setLogLink(link, "tsumanne");
                    }
                }
            });
            xhr.addEventListener("error", () => {
                is_tsumanne_loading = false;
            });
            xhr.addEventListener("timeout", () => {
                is_tsumanne_loading = false;
            });
            xhr.open("GET", `http://tsumanne.net/${server}/indexes.php?format=json&sbmt=URL&w=${href_match[3]}`);
            xhr.send();
            is_tsumanne_loading = true;
        }
    }

    // ふたふた
    link_id = document.getElementById("AKAAN_futafuta_link");
    if (use_futafuta_link && !link_id && href_match
        && `${href_match[1]}_${href_match[2]}`.match(/may_b|img_b|jun_jun/)) {
        let link = `${location.protocol}//futafuta.site/thread/${href_match[1]}/${href_match[3]}.htm`;
        setLogLink(link, "futafuta");
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

class SearchTarget {
    constructor(index, linelist, resno, filename) {
        this.index = index;
        this.lines = linelist.slice();
        this.resno = resno;
        this.filename = filename;
    }

    searchText(text){
        let have_maybe = false;

        for(let i = 0; i < this.lines.length; ++i){
            let find = this.lines[i].indexOf(text);

            if(find != -1){
                if(text.length == this.lines[i].length){
                    return SEARCH_RESULT_PERFECT;
                }else{
                    have_maybe = true;
                }
            }else{
                continue;
            }
        }
        
        return have_maybe ? SEARCH_RESULT_MAYBE : SEARCH_RESULT_NONE;
    }

    searchResNo(no){
        // 検索文字列が数字の時はレスNo.の数字部分と比較
        if (no.match(/^\d+$/) && this.resno) {
            return this.resno.slice(3) == no;
        } else {
            return this.resno == no;
        }
    }

    searchFileName(name){
        // 検索文字列が数字の時はファイル名の数字部分と比較
        if (name.match(/^\d+$/) && this.filename.match(/^\d+/)) {
            return this.filename.match(/^\d+/)[0] == name;
        } else {
            return this.filename == name;
        }
    }

    static createByThre(thre) {
        let resno = "";
        let filename = "";

        if(search_resno){
            for (let node = thre.firstChild; node; node = node.nextSibling) {
                if (node.nodeType == Node.ELEMENT_NODE && node.nodeName == "BLOCKQUOTE") {
                    break;
                }

                if(node.nodeType == Node.TEXT_NODE){
                    let matches = node.nodeValue.match(/(No\.[0-9]+)/);
                    if (matches) {
                        resno = matches[1];
                        break;
                    }
                }
            }
        }

        if(search_file){
            let anchor = thre.getElementsByTagName("a")[0];
            if (anchor) {
                if (anchor.download) {
                    filename = anchor.download;
                } else if (anchor.dummyleafname) {
                    filename = anchor.dummyleafname;
                } else {
                    filename = anchor.textContent;
                }
            }
        }

        return new SearchTarget(
            0,
            thre.getElementsByTagName("blockquote")[0].innerText.split(/\r\n|\r|\n/),
            resno,
            filename);
    }

    static createByResponse(index, blockquote) {
        return new SearchTarget(
            index,
            blockquote.innerText.split(/\r\n|\r|\n/),
            search_resno ? SearchTarget.getResNo(blockquote) : "",
            search_file ? SearchTarget.getFileName(blockquote) : "");
    }

    static getResNo(blockquote) {
        let parent = blockquote.parentNode;
        let number_button = parent.getElementsByClassName("cno")[0] || parent.getElementsByClassName("KOSHIAN_NumberButton")[0];
        if (number_button) {
            return number_button.textContent;
        }

        for (let node = parent.firstChild; node; node = node.nextSibling) {
            if (node.nodeType == Node.TEXT_NODE) {
                let matches = node.nodeValue.match(/(No\.[0-9]+)/);
                if (matches) {
                    return matches[1];
                }
            }
        }

        return "";
    }

    static getFileName(blockquote) {
        for (let i = 0, anchors = blockquote.parentElement.getElementsByTagName("a"); i < anchors.length; ++i) {
            let matches = anchors[i].href.match(/([0-9]+\.[0-9A-Za-z]+)/);
            if (matches) {
                return matches[1];
            }
        }

        return "";
    }
}

let search_targets = [];

/**
 * 引用ポップアップ制御クラス
 * @param {HTMLFontElement} green_text 引用のFont要素
 * @param {number} index 引用のあるレスのレス番号（スレ内の通番）
 * @constructor  
 */
class Quote {
    constructor(green_text, index) {
        this.green_text = green_text;
        this.index = index;
    }

    findOriginIndex(target_index = -1) {
        let search_text = this.green_text.innerText;
        search_text = search_text.slice(1).replace(/^[\s]+|[\s]+$/g, "");

        if (!search_text.length) {
            return -1;
        }

        if (target_index > -1) {
            let target = search_targets[target_index];

            if(search_resno && target.searchResNo(search_text)){
                return target.index;
            }

            if(search_file && target.searchFileName(search_text)){
                return target.index;
            }

            let result = target.searchText(search_text);
            if(result == SEARCH_RESULT_PERFECT){
                return target.index;
            }

        } else {
            for (let i = this.index - 1; i >= 0; --i) {
                let target = search_targets[i];

                if(search_resno && target.searchResNo(search_text)){
                    return target.index;
                }

                if(search_file && target.searchFileName(search_text)){
                    return target.index;
                }

                let result = target.searchText(search_text);
                if(result == SEARCH_RESULT_PERFECT){
                    return target.index;
                }
            }
        }

        return -1;
    }
}

/**
 * 返信レス番号ポップアップ制御クラス
 * @param {HTMLSpanElement} green_text 返信番号のSpan要素
 * @param {number} index 返信レスのレス番号（スレ内の通番）
 * @constructor  
 */
class Reply {
    constructor (green_text, index) {
        this.green_text = green_text;
        this.index = index;
        this.popup = null;
        this.timer_show = null;
        this.timer_hide = null;

        let reply = this;

        this.green_text.addEventListener("mouseenter", (e) => {
            if (reply.timer_hide) {
                clearTimeout(reply.timer_hide);
                reply.timer_hide = null;
            }

            if (!reply.timer_show) {
                reply.timer_show = setTimeout(() => {
                    reply.timer_show = null;
                    reply.show(e);
                }, popup_time);
            }
        });

        this.green_text.addEventListener("mouseleave", (e) => {
            if (reply.timer_show) {
                clearTimeout(reply.timer_show);
                reply.timer_show = null;
            }

            let related_target = e.relatedTarget;
            if (related_target === null) {
                document.addEventListener("click", hideReplyPopup, false);
                return;
            }
            if (!reply.timer_hide) {
                reply.timer_hide = setTimeout(() => {
                    reply.timer_hide = null;
                    reply.hide();
                }, hide_time);
            }

            function hideReplyPopup(e) {
                let e_target_closest = false;
                for (let elm = e.target; elm; elm = elm.parentElement) {
                    if (elm == reply.green_text || elm == reply.popup) {
                        e_target_closest = true;
                    }
                }
                if (e.target !== null && !e_target_closest) {
                    document.removeEventListener("click", hideReplyPopup, false);
                    reply.hide();
                }
            }
        });
    }

    createPopup() {
        this.popup = document.createElement("div");
        let target_id = null;
        // div要素を作りたいのでrd要素のクローンじゃだめ
        // g_response_listは最初のスレを含まないので-1
        for (let ch = g_response_list[this.index - 1].firstChild; ch != null; ch = ch.nextSibling) {
            if (ch.nodeType == Node.TEXT_NODE && /(No\.[0-9]+)/.test(ch.nodeValue)) {
                let matches = ch.nodeValue.match(/(.*)(No\.[0-9]+)(.*)/);
                let text1 = document.createTextNode(matches[1]);
                let text2 = document.createTextNode(matches[3]);
                let anchor = document.createElement("a");
                anchor.href = "javascript:void(0);";
                anchor.className = "AKAAN_popup_content_button";
                anchor.title = "このレスに移動";
                anchor.innerText = matches[2];
                anchor.addEventListener("click", () => {
                    this.hide();
                    moveToResponse(target_id);
                }, false);
                this.popup.append(text1, anchor, text2);
            } else if (ch.nodeType == Node.ELEMENT_NODE && ch.classList.contains("cno")) {
                let anchor = document.createElement("a");
                anchor.href = "javascript:void(0);";
                anchor.className = "AKAAN_popup_content_button";
                anchor.style.margin = "0 15px 0 5px";
                anchor.title = "このレスに移動";
                anchor.textContent = ch.textContent;
                anchor.addEventListener("click", () => {
                    this.hide();
                    moveToResponse(target_id);
                }, false);
                this.popup.appendChild(anchor);
            } else if (ch.nodeName == "INPUT" && ch.id) {
                target_id = ch.id;
            } else {
                if (ch.nodeName == "SPAN" && ch.id) {
                    target_id = ch.id;
                }
                this.popup.appendChild(ch.cloneNode(true));
            }
        }

        this.popup.className = "AKAAN_reply_no_popup";
        this.popup.style.maxWidth = "800px";
        let reply = this;
        this.popup.addEventListener("mouseenter", () => {
            if (this.timer_hide) {
                clearTimeout(this.timer_hide);
                this.timer_hide = null;
            }
        });
        this.popup.addEventListener("mouseleave", (e) => {
            let related_target = e.relatedTarget;
            if (related_target === null) {
                document.addEventListener("click", hidePopup, false);
                return;
            }
            reply.hide();

            function hidePopup(e) {
                let e_target_closest = false;
                for (let elm = e.target; elm; elm = elm.parentElement) {
                    if (elm == reply.green_text || elm == reply.popup) {
                        e_target_closest = true;
                    }
                }
                if (e.target !== null && !e_target_closest) {
                    document.removeEventListener("click", hidePopup, false);
                    reply.hide();
                }
            }
        });
        document.body.appendChild(this.popup);
    }

    show(e) {
        this.hide();
        if (is_akahuku_reloading) {
            return;
        }
        this.createPopup();
        g_reply_popup = this.popup;

        if (this.popup) {
            let rc = Reply.getPopupPosition(e.clientX, e.clientY, this.green_text);

            this.popup.style.top = `${rc.top - 2}px`;
            let popup_left = rc.left + popup_indent;
            this.popup.style.left = "0px";
            this.popup.style.right = "";

            // ポップアップが画面右端からはみ出る時は右端にそろえる
            let popup_rect = this.popup.getBoundingClientRect();
            let doc_width = document.documentElement.clientWidth;
            let window_right = doc_width + document.documentElement.scrollLeft;
            if (popup_left + popup_rect.width > window_right) {
                if (doc_width < popup_rect.width) {
                    this.popup.style.maxWidth = `${doc_width}px`;
                    this.popup.style.minWidth = `${doc_width}px`;
                }
                this.popup.style.left = "";
                this.popup.style.right = "0px";
            } else {
                this.popup.style.left = `${popup_left}px`;
            }

            let hide_button = this.popup.getElementsByClassName("KOSHIAN_HideButton")[0];
            if (hide_button) {
                // KOSHIAN NG 改の[隠す]ボタンを削除
                hide_button.remove();
            }

            let ng_switch = this.popup.getElementsByClassName("KOSHIAN_NGSwitch")[0];
            if (ng_switch) {
                // KOSHIAN NG 改の[NGワード]ボタンを削除
                ng_switch.remove();
            }
        }
    }

    hide() {
        if (this.timer_show) {
            clearTimeout(this.timer_show);
            this.timer_show = null;
        }
        if (this.timer_hide) {
            clearTimeout(this.timer_hide);
            this.timer_hide = null;
        }
        if (this.popup) {
            this.popup.remove();
        }
        g_reply_popup = null;
    }

    static getPopupPosition(mouse_client_x, mouse_client_y, elem) {
        let rc = {};

        let elem_position = elem.getBoundingClientRect();

        rc.left = (mouse_client_x + document.documentElement.scrollLeft);   // マウス位置をleftにする
        rc.top = (elem_position.bottom + document.documentElement.scrollTop); // elemの下辺をtopにする

        return rc;
    }

}

function searchReply(rtd, index) {
    let previous_index = -1, previous_quote = null;
    for (let i = 0, font_elements = rtd.getElementsByTagName("font"); i < font_elements.length; ++i) {
        if (font_elements[i].color == QUOTE_COLOR) {
            let quote = new Quote(font_elements[i], index);
            let origin_index = quote.findOriginIndex();
            if (origin_index > -1 && origin_index != previous_index) {
                putReplyNo(origin_index, index);
                if (previous_index > -1) {
                    // 引用元に前回探索した引用の引用元が存在したときは前回設置した返信No.を削除する
                    let previous_quote_index = previous_quote.findOriginIndex(origin_index);
                    if (previous_quote_index > -1) removeReplyNo(previous_index);
                }
                previous_index = origin_index;
                previous_quote = quote;
            }
        }
    }
}

function putReplyNo(origin_index, index) {
    let reply_no = document.createElement("span");
    reply_no.className = "AKAAN_ReplyNo";
    reply_no.textContent = `>>${index}`;

    let response, reply_no_list, ng_button;
    if (origin_index) {
        // レス
        response = g_response_list[origin_index - 1];
        reply_no_list = response.getElementsByClassName("AKAAN_ReplyNo");
        ng_button = response.getElementsByClassName("KOSHIAN_HideButton")[0] || response.getElementsByClassName("KOSHIAN_NGSwitch")[0];
    } else {
        // スレ
        response = g_thre;
        reply_no_list = document.querySelectorAll(".thre > .AKAAN_ReplyNo");
        ng_button = null;
    }
    let target;
    if (reply_no_list.length) {
        target = reply_no_list[reply_no_list.length - 1].nextSibling;
    } else if (ng_button) {
        target = ng_button.nextSibling;
    } else if (have_sod) {
        target = response.getElementsByClassName("sod")[0].nextSibling;
    } else if (have_del) {
        target = response.getElementsByClassName("del")[0].nextSibling;
    } else {
        target = response.getElementsByTagName("blockquote")[0];
    }
    response.insertBefore(reply_no, target);
    new Reply(reply_no, index);
}

function removeReplyNo(index) {
    let response, reply_no_list;
    if (index) {
        // レス
        response = g_response_list[index - 1];
        reply_no_list = response.getElementsByClassName("AKAAN_ReplyNo");
    } else {
        // スレ
        response = g_thre;
        reply_no_list = document.querySelectorAll(".thre > .AKAAN_ReplyNo");
    }
    if (reply_no_list.length) {
        let target = reply_no_list[reply_no_list.length - 1];
        response.removeChild(target);
    }
}

function onDoubleClick(e) {
    if (use_doubleclick && e.button === 0) {
        if (exclusion && e.target.closest(exclusion)) {
            return;
        }
        focusOnCatalog();
        removeSelection();
    }
}

/**
 * カタログへ移動
 */
function focusOnCatalog() {
    let url = location.protocol + "//" + location.host + location.pathname.replace(/res\/\d+\.htm.*/, "");
    browser.runtime.sendMessage({
        id: "AKAAN_focus_on_catalog",
        url: url
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

function process(beg, end){
    // add search targets
    for(let i = beg; i < end; ++i){
        search_targets.push(SearchTarget.createByResponse(i + 1, g_response_list[i].getElementsByTagName("blockquote")[0]));
    }

    // create popup
    for(let i = beg; i < end; ++i){
        searchReply(g_response_list[i], i + 1);
    }
}

function main() {
    g_thre = document.getElementsByClassName("thre")[0];
    if (g_thre == null) {
        return;
    }

    let reply_no_list = g_thre.getElementsByClassName("AKAAN_ReplyNo");
    while (reply_no_list.length) {
        reply_no_list[0].remove();
    }

    if (search_reply) {
        g_response_list = g_thre.getElementsByClassName("rtd");
        have_sod = document.getElementsByClassName("sod").length > 0;
        have_del = document.getElementsByClassName("del").length > 0;

        // add search targets by thre
        search_targets.push(SearchTarget.createByThre(g_thre));

        process(0, g_response_list.length);
        g_last_response_num = g_response_list.length;
    }

    showDeletedResponses();

    document.addEventListener("dblclick", onDoubleClick);
    document.addEventListener("contextmenu", onContextmenu);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);

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
        let observer = new MutationObserver(function() {
            if (target.textContent == status) {
                return;
            }
            status = target.textContent;
            if (status == "ロード中 (ヘッダ)") {
                is_akahuku_reloading = true;
                if (g_reply_popup) {
                    g_reply_popup.remove();
                }
                if (change_bg_color) {
                    document.body.style.backgroundColor = '#EEEEEE';
                }
            } else if (status.indexOf("新着") === 0) {
                is_akahuku_reloading = false;
                document.body.style.backgroundColor = null;
                showDeletedResponses();
                if (search_reply) {
                    let prev_res_num = g_last_response_num;
                    let cur_res_num = g_response_list.length;
                    process(prev_res_num, cur_res_num);
                    g_last_response_num = cur_res_num;
                }
            } else if (status.indexOf("No") === 0 || status.indexOf("Mot") === 0) {
                is_akahuku_reloading = false;
                document.body.style.backgroundColor = null;
                dispLogLink();
            } else if (status.indexOf("中断") === 0 || status.indexOf("接続") === 0 || status.indexOf("load error:") === 0 || status.indexOf("ロード失敗") === 0) {
                is_akahuku_reloading = false;
                document.body.style.backgroundColor = null;
            }
        });
        observer.observe(target, config);
    }
}

/**
 * 指定したレスへスクロール
 * @param {string} reply_id レスのcheckboxのid名
 */
function moveToResponse(reply_id){
    if (!reply_id) {
        return;
    }
    let target = document.getElementById(reply_id);
    if (target) {
        target.scrollIntoView(true);

        let blockquote = target.parentNode.getElementsByTagName("blockquote")[0];
        if (blockquote) {
            blockquote.style.backgroundColor = "highlight";
            blockquote.style.color = "highlighttext";
            setTimeout(() => {
                blockquote.style.backgroundColor = "transparent";
                blockquote.style.color = "";
            }, 2000);
        }
    }
}

function showDeletedResponses() {
    if (show_deleted_res && !ddbut_clicked) {
        // 削除されたレスを表示する
        let ddbut = document.getElementById("ddbut");
        if (ddbut && ddbut.textContent == "見る") {
            ddbut.click();
            ddbut_clicked = true;
        }
    }
}

function safeGetValue(value, default_value) {
    return value === undefined ? default_value : value;
}

browser.storage.local.get().then((result) => {
    change_bg_color = safeGetValue(result.change_bg_color, DEFAULT_CHANGE_BG_COLOR);
    //show_deleted_res = safeGetValue(result.show_deleted_res, DEFAULT_SHOW_DELETED_RES);
    search_reply = safeGetValue(result.search_reply, DEFAULT_SEARCH_REPLY);
    use_futapo_link = safeGetValue(result.use_futapo_link, DEFAULT_USE_FUTAPO_LINK);
    use_ftbucket_link = safeGetValue(result.use_ftbucket_link, DEFAULT_USE_FTBUCKET_LINK);
    use_tsumanne_link = safeGetValue(result.use_tsumanne_link, DEFAULT_USE_TSUMANNE_LINK);
    use_futafuta_link = safeGetValue(result.use_futafuta_link, DEFAULT_USE_FUTAFUTA_LINK);
    use_doubleclick = safeGetValue(result.use_doubleclick, DEFAULT_USE_DOUBLECLICK);
    disable_forms = safeGetValue(result.disable_forms, DEFAULT_DISABLE_FORMS);
    disable_class_rtd = safeGetValue(result.disable_class_rtd, DEFAULT_DISABLE_CLASS_RTD);
    focus_on_unread = safeGetValue(result.focus_on_unread, DEFAULT_FOCUS_ON_UNREAD);
    click_period = Number(safeGetValue(result.click_period, DEFAULT_CLICK_PERIOD));
    long_press_time = Number(safeGetValue(result.long_press_time, DEFAULT_LONG_PRESS_TIME));

    exclusion = "";
    if (use_doubleclick) {
        exclusion = disable_forms ? form_selectors : "";
        exclusion += disable_class_rtd ? ".rtd," : "";
        if (exclusion) {
            exclusion = exclusion.slice(0, -1);
        }
    }

    main();
}, (error) => { }); // eslint-disable-line no-unused-vars

browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName != "local") {
        return;
    }

    change_bg_color = safeGetValue(changes.change_bg_color.newValue, DEFAULT_CHANGE_BG_COLOR);
    //show_deleted_res = safeGetValue(changes.show_deleted_res.newValue, DEFAULT_SHOW_DELETED_RES);
    //search_reply = safeGetValue(changes.search_reply.newValue, DEFAULT_SEARCH_REPLY); // 「レスへの返信を探す」はリロードするまで反映しない
    use_futapo_link = safeGetValue(changes.use_futapo_link.newValue, DEFAULT_USE_FUTAPO_LINK);
    use_ftbucket_link = safeGetValue(changes.use_ftbucket_link.newValue, DEFAULT_USE_FTBUCKET_LINK);
    use_tsumanne_link = safeGetValue(changes.use_tsumanne_link.newValue, DEFAULT_USE_TSUMANNE_LINK);
    use_futafuta_link = safeGetValue(changes.use_futafuta_link.newValue, DEFAULT_USE_FUTAFUTA_LINK);
    use_doubleclick = safeGetValue(changes.use_doubleclick.newValue, use_doubleclick);
    disable_forms = safeGetValue(changes.disable_forms.newValue, disable_forms);
    disable_class_rtd = safeGetValue(changes.disable_class_rtd.newValue, disable_class_rtd);
    focus_on_unread = safeGetValue(changes.focus_on_unread.newValue, focus_on_unread);
    click_period = Number(safeGetValue(changes.click_period.newValue, click_period));
    long_press_time = Number(safeGetValue(changes.long_press_time.newValue, long_press_time));

    exclusion = "";
    if (use_doubleclick) {
        exclusion = disable_forms ? form_selectors : "";
        exclusion += disable_class_rtd ? ".rtd," : "";
        if (exclusion) {
            exclusion = exclusion.slice(0, -1);
        }
    }

    showDeletedResponses();
});
